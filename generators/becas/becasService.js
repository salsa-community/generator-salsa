'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
const Instituciones = require('./institucionesCatalog');
var Generator = require('yeoman-generator');
const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
var beautify = require('gulp-beautify');
var inquirer = require('inquirer');
var dateFormat = require('dateformat');
const Defaults = require('./defaults');
const BecasService = require('./becasService');
const Constants = require('./constants');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const Logger = require('../util/logger');
const Catalogos = require('../util/distribucion/constants');
const { CATALOG } = require('./institucionesCatalog');

const CAMPOS = require('../../campos.json');
const DISCIPLINAS = require('../../disciplinas.json');

const moment = require('moment');
module.exports = class guiService {
  static log = Logger.getLogger('rules-warning');
  static toPrograma(m, spinner) {
    let programa = {};
    programa.id = m.REFERENCIA_SOLICITUD + '_' + m.CVU_INTEGRANTE;
    programa.cvu = m.CVU_INTEGRANTE;
    programa.clave = m.REFERENCIA_PROGRAMA;
    programa.claveTipoPrograma = m.CVE_TIPO_PROGRAMA;
    programa.promedioRecuperado = m.PROMEDIO_RECUPERADO ? parseFloat(m.PROMEDIO_RECUPERADO) : m.PROMEDIO_RECUPERADO;
    programa.periodoLectivo = String.normalize(m.DESC_PERIODO_LECTIVO);
    programa.nombre = String.normalize(m.NOMBRE_PROGRAMA);
    programa.nombreAspirante = String.normalize(m.NOMBRE_INTEGRANTE);
    programa.metodologia = m.ABREV_MODALIDAD;
    programa.grado = m.ABREV_GRADO;
    programa.orientacion = m.ABREV_ORIENTACION;
    programa.nivel = '';
    programa.correo = m.CONTACTO_PRINCIPAL;
    programa.area = this.resolveInteger(m.CVE_AREA);
    programa.campo = this.resolveCampo(m.DESCRIPCION_1, spinner);
    programa.disciplina = this.resolveDisciplina(m.DESCRIPCION_2, spinner);
    programa.entidad = this.resolveEntidad(m.NOM_ENT);
    programa.claveInstitucion = m.CVE_INSTITUCION;
    programa.tipoInstitucion = this.resolveTipoInstitucion(m.CVE_INSTITUCION, programa.id);
    programa.nombreInstitucion = m.NOMBRE;
    programa.estado = String.normalize(m.DESC_ESTADO_SOLICITUD_EVALUACN);
    programa.dictamen = '';
    programa.acreditadoSnp = this.resolveAcreditadoSnp(m.POR_CONVENIO);
    programa.tiempoDedicacion = '';
    programa.periodicidad = '';
    programa.numeroBecasHistorico = '';
    programa.numeroBecasFormalizadas = '';
    programa.numeroBecasCanceladas = '';
    programa.inicioEstancia = this.formatDate(m.INICIO_ESTUDIOS);
    programa.finEstancia = this.formatDate(m.FIN_ESTUDIOS);
    programa.montoMensual = this.resolveMontoMensual(m.ABREV_GRADO);
    programa.orden = 214748364;
    programa.grupo = 'Z_NO_EVALUADO';
    programa.estadoSolicitud = String.normalize(m.DESC_ESTADO_SOLICITUD);
    this.verifyFechas(programa);
    return programa;
  }

  static toProyecto(p, spinner) {
    let proyecto = {};
    proyecto.id = String.normalizeId(p.convocatoria) + '-' + p.clave;
    proyecto.convocatoria = p.convocatoria;
    proyecto.titulo = p.titulo;
    proyecto.anno = p.anio;
    proyecto.clave = this.resolveInteger(p.clave);
    proyecto.fondo = String.normalize(p.fondo);
    proyecto.sujetoApoyo = String.normalize(p.sujeto);
    proyecto.montoAutorizado = this.resolveDouble(p.monto);
    proyecto.estatus = p.estatus;
    proyecto.etapa = p.etapa;
    proyecto.area = p.area;
    proyecto.responsableTecnico = p.rt;
    proyecto.responsableAdministrativo = p.ra;
    proyecto.representanteLegal = p.rl;
    proyecto.objetivo = p.objetivo;
    return proyecto;
  }

  static verifyFechas(programa) {
    if (programa.finEstancia === 'Invalid Date') {
      this.log.error(programa.cvu + '-  programa.finEstancia' + '-' + 'Invalid Date');
    }
    if (programa.inicioBeca === 'Invalid Date') {
      this.log.error(programa.cvu + '- programa.inicioBeca' + '-' + 'Invalid Date');
    }
    if (programa.finBeca === 'Invalid Date') {
      this.log.error(programa.cvu + '- programa.finBeca' + '-' + 'Invalid Date');
    }
    if (programa.inicioEstancia === 'Invalid Date') {
      this.log.error(programa.cvu + '- programa.inicioEstancia' + '-' + 'Invalid Date');
    }
  }

  // from en-US 'MM/dd/YYYY';
  // to en-GB 'dd/MM/YYYY';
  static formatDate(date) {
    let result = moment(date, 'MM/DD/YYYY').format('DD/MM/YYYY');
    return result;
  }

  // from en-US 'MM/dd/YYYY';
  // to en-GB 'dd/MM/YYYY';
  static formatBecaDate(date) {
    let result = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    return result;
  }

  static resolveCampo(value, spinner) {
    const campo = String.normalize(value);
    if (Catalogos.CAMPOS.includes(campo)) {
      return campo;
    }
    spinner.fail(chalk.green.bold('>' + campo + '<') + chalk.green('CAMPO NOT FOUND'));
    return 'CAMPO NOT FOUND';
  }

  static resolveDisciplina(value, spinner) {
    const disciplina = String.normalize(value);
    if (Catalogos.DISCIPLINAS.includes(disciplina)) {
      return disciplina;
    }
    spinner.fail(chalk.green.bold('>' + disciplina + '<') + chalk.green('DISCIPLINA NOT FOUND'));
    return 'CIUDAD TERRITORIO  Y SUSTENTABILIDAD';
  }

  static resolveInteger(value) {
    return parseInt(value);
  }

  static resolveDouble(value) {
    return parseFloat(value);
  }
  static resolveMontoMensual(grado) {
    if (grado) {
      if (grado === 'MAE') {
        return 13162.9;
      } else if (grado === 'DOC') {
        return 17550.54;
      } else if (grado === 'ESP') {
        return 11700.36;
      }
    }

    return 0.0;
  }

  static toRegla(reglas, spinner) {
    reglas.orden = reglas.orden;
    reglas.metodologias = this.split(reglas.id, reglas.metodologias, spinner, Catalogos.METODOLOGIAS, 'METODOLOGIAS');
    reglas.grados = this.split(reglas.id, reglas.grados, spinner, Catalogos.GRADOS, 'GRADOS');
    reglas.orientaciones = this.split(reglas.id, reglas.orientaciones, spinner, Catalogos.ORIENTACIONES, 'ORIENTACIONES');
    reglas.areas = this.split(reglas.id, reglas.areas, spinner, Catalogos.AREAS, 'AREAS');
    reglas.campos = this.resolveCamposForRules(reglas.id, reglas.campos, spinner, Catalogos.CAMPOS, 'CAMPOS');
    reglas.disciplinas = this.resolveDisciplinasForRules(reglas.id, reglas.disciplinas, spinner, Catalogos.DISCIPLINAS, 'DISCIPLINAS');
    reglas.entidades = this.split(reglas.id, reglas.entidades, spinner, Catalogos.ENTIDADES, 'ENTIDADES');
    reglas.tipoInstituciones = this.split(
      reglas.id,
      reglas.tipo_instituciones,
      spinner,
      Catalogos.TIPO_INSTITUCIONES,
      'TIPO INSTITUCIONES'
    );
    reglas.acreditadoSnp = this.resolveBoolean(reglas.acreditadoSnp);
    reglas.activo = true;
    return reglas;
  }

  static toInstituciones(i, spinner) {
    let institucion = {};
    institucion.id = i.clave;
    institucion.tipo = i.tipo;
    return institucion;
  }

  static resolveCamposForRules(id, string, spinner, validate, modulo) {
    let campos = CAMPOS[id];

    if (campos) {
      const elements = campos;
      for (let index = 0; index < elements.length; index++) {
        elements[index] = String.normalize(elements[index]);
        if (!validate.includes(elements[index])) {
          this.log.info(',' + modulo + ',' + id + ',' + elements[index]);
          spinner.fail(chalk.green.bold(modulo + '>' + elements[index] + '<') + chalk.green('CATALOG NOT FOUND'));
        }
      }
      return elements;
    } else {
      return [];
    }
  }

  static resolveDisciplinasForRules(id, string, spinner, validate, modulo) {
    let disciplinas = DISCIPLINAS[id];

    if (disciplinas) {
      const elements = disciplinas;
      for (let index = 0; index < elements.length; index++) {
        elements[index] = String.normalize(elements[index]);
        if (!validate.includes(elements[index])) {
          this.log.info(',' + modulo + ',' + id + ',' + elements[index]);
          spinner.fail(chalk.green.bold(modulo + '>' + elements[index] + '<') + chalk.green('CATALOG NOT FOUND'));
        }
      }
      return elements;
    } else {
      return [];
    }
  }

  static split(id, string, spinner, validate, modulo) {
    if (string) {
      const elements = string; //string.toString().split(',');
      for (let index = 0; index < elements.length; index++) {
        elements[index] = String.normalize(elements[index]);
        if (!validate.includes(elements[index])) {
          this.log.info(',' + modulo + ',' + id + ',' + elements[index]);
          spinner.fail(chalk.green.bold(modulo + '>' + elements[index] + '<') + chalk.green('CATALOG NOT FOUND'));
        }
      }
      return elements;
    } else {
      return [];
    }
  }

  static resolveBoolean(element) {
    if (element) {
      return element === 1 || element === '1';
    } else {
      return null;
    }
  }

  static resolveEntidad(nombreEntidad) {
    let entidad = Constants.ENTITY_MAPPER[nombreEntidad];
    if (entidad) {
      return entidad.clave;
    }
    return 'SIN EQUIVALENTE {' + nombreEntidad + '}';
  }
  static resolveAcreditadoSnp(isConvenio) {
    if (isConvenio) {
      return isConvenio === '1' || isConvenio === 1;
    } else {
      return false;
    }
  }
  static resolveTipoInstitucion(clave, id) {
    let inst = Instituciones.CATALOG[clave];
    if (inst) {
      return inst.CVE_TIPO;
    } else {
      this.log.info(',' + id + ',INSTITUCION NO ENCONTRADA' + clave);
      return 'NO ENCONTRADA';
    }
  }

  static wait(ms) {
    var start = Date.now(),
      now = start;
    while (now - start < ms) {
      now = Date.now();
    }
  }

  static sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  static loadProgramas(context) {
    fs.readdir('cargas/matricula/partes', (err, files) => {
      try {
        const spinner = ora({ text: 'subiendo matricula...', interval: 80 });
        spinner.start();
        spinner.info(chalk.green.bold('Running on [' + context.enviroment + ']'));
        spinner.info(chalk.green.bold('Files.length [' + files.length + ']'));
        let that = this;
        for (let index = 0, j = 0; index < files.length; index++, j++) {
          let part = index.toLocaleString('en-US', {
            minimumIntegerDigits: 4,
            useGrouping: false,
          });

          setTimeout(() => {
            spinner.succeed(chalk.green.bold('PARTE - ') + chalk.green(part));
            fs.createReadStream('cargas/matricula/partes/sh_part_' + part)
              .pipe(csv())
              .on('data', m => {
                let programa = that.toPrograma(m, spinner);
                axios
                  .patch(context.serviceUrl + '/api/programas/' + programa.id, programa, context.config)
                  .then(response => {
                    spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
                  })
                  .catch(error => {
                    axios
                      .post(context.serviceUrl + '/api/programas', programa, context.config)
                      .then(response => {
                        spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
                      })
                      .catch(errorCreated => {
                        this.log.error(',' + programa.cvu + `,archivo ${index},` + programa.id);
                        spinner.fail(chalk.green.bold('ups - ') + chalk.green(programa.cvu));
                      });
                  });
              })
              .on('end', () => {
                spinner.succeed('finalización');
              });
          }, 20000 * j);
        }
      } catch (error) {
        warn(error);
      }
    });
  }

  static loadInstituciones(context) {
    try {
      const spinner = ora({ text: 'subiendo instituciones...', interval: 80 });
      spinner.start();
      let that = this;

      spinner.succeed(chalk.green.bold('Instituciones: '));
      fs.createReadStream('cargas/instituciones/catalogo.csv')
        .pipe(csv())
        .on('data', function (m) {
          let institucion = that.toInstituciones(m, spinner);
          axios
            .patch(context.serviceUrl + '/api/institucions/' + institucion.id, institucion, context.config)
            .then(response => {
              spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
            })
            .catch(error => {
              axios
                .post(context.serviceUrl + '/api/institucions', institucion, context.config)
                .then(response => {
                  spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
                })
                .catch(errorCreated => {
                  spinner.fail(chalk.green.bold('ups - ') + chalk.green(errorCreated));
                });
            });
        })
        .on('end', function () {
          spinner.succeed('finalización');
        });
    } catch (error) {
      warn(error);
    }
  }

  static loadReglas(context) {
    try {
      const spinner = ora({ text: 'subiendo reglas...', interval: 80 });
      spinner.start();
      let reglas = require('../../reglas-latest.json');
      reglas.forEach(regla => {
        regla = this.toRegla(regla, spinner);
        axios
          .put('http://localhost:8106/api/criterios/' + regla.id, regla)
          .then(response => {
            spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
          })
          .catch(error => {
            axios
              .post('http://localhost:8106/api/criterios', regla)
              .then(response => {
                spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
              })
              .catch(errorCreated => {
                spinner.fail(chalk.green.bold('ups - ') + chalk.green(errorCreated));
              });
          });
      });
    } catch (error) {
      warn(error);
    }
  }

  static loadProyectos(context) {
    fs.readdir('cargas/proyectos/partes', (err, files) => {
      try {
        const spinner = ora({ text: 'subiendo proyectos...', interval: 80 });
        spinner.start();
        spinner.info(chalk.green.bold('Running on [' + context.enviroment + ']'));
        let that = this;
        for (let index = 0, j = 0; index < files.length - 2; index++, j++) {
          let part = index.toLocaleString('en-US', {
            minimumIntegerDigits: 4,
            useGrouping: false,
          });

          setTimeout(() => {
            spinner.succeed(chalk.green.bold('PARTE - ') + chalk.green(part));
            fs.createReadStream('cargas/proyectos/partes/sh_part_' + part)
              .pipe(csv())
              .on('data', function (m) {
                let proyecto = that.toProyecto(m, spinner);
                axios
                  .patch(context.serviceUrl + '/api/proyectos/' + proyecto.id, proyecto, context.config)
                  .then(response => {
                    spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
                  })
                  .catch(error => {
                    axios
                      .post(context.serviceUrl + '/api/proyectos', proyecto, context.config)
                      .then(response => {
                        spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
                      })
                      .catch(errorCreated => {
                        spinner.fail(chalk.green.bold('ups - ' + proyecto.id + ': ') + chalk.green(errorCreated));
                      });
                  });
              })
              .on('end', function () {
                spinner.succeed('finalización');
              });
          }, 20000 * j);
        }
      } catch (error) {
        warn(error);
      }
    });
  }
};
