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

module.exports = class guiService {
  static log = Logger.getLogger('rules-warning');
  static toPrograma(m, spinner) {
    let programa = {};
    programa.id = m.REFERENCIA_SOLICITUD + '_' + m.CVU_INTEGRANTE;
    programa.cvu = m.CVU_INTEGRANTE;
    programa.clave = m.REFERENCIA_PROGRAMA;
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
    programa.tipoInstitucion = this.resolveTipoInstitucion(m.CVE_INSTITUCION);
    programa.nombreInstitucion = m.NOMBRE;
    programa.estadoSolicitud = m.DESC_ESTADO_SOLICITUD_EVALUACN;
    programa.dictamen = '';
    programa.acreditadoSnp = this.resolveAcreditadoSnp(m.POR_CONVENIO);
    programa.tiempoDedicacion = '';
    programa.periodicidad = '';
    programa.numeroBecasHistorico = '';
    programa.numeroBecasFormalizadas = '';
    programa.numeroBecasCanceladas = '';
    programa.inicioEstancia = m.INICIO_ESTUDIOS;
    programa.finEstancia = m.FIN_ESTUDIOS;
    programa.montoMensual = this.resolveMontoMensual(m.ABREV_GRADO);
    programa.orden = 214748364;
    programa.grupo = 'Z_NO_RANKED';
    return programa;
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
    return 'DISCIPLINA NOT FOUND';
  }

  static resolveInteger(value) {
    return parseInt(value);
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
    reglas.id = reglas.orden;
    reglas.metodologias = this.split(reglas.id, reglas.metodologias, spinner, Catalogos.METODOLOGIAS, 'METODOLOGIAS');
    reglas.grados = this.split(reglas.id, reglas.grados, spinner, Catalogos.GRADOS, 'GRADOS');
    reglas.orientaciones = this.split(reglas.id, reglas.orientaciones, spinner, Catalogos.ORIENTACIONES, 'ORIENTACIONES');
    reglas.areas = this.split(reglas.id, reglas.areas, spinner, Catalogos.AREAS, 'AREAS');
    reglas.campos = this.resolveCamposForRules(reglas.id, reglas.campos, spinner, Catalogos.CAMPOS, 'CAMPOS');
    reglas.disciplinas = this.resolveDisciplinasForRules(reglas.id, reglas.disciplinas, spinner, Catalogos.DISCIPLINAS, 'DISCIPLINAS');
    reglas.entidades = this.split(reglas.id, reglas.entidades, spinner, Catalogos.ENTIDADES, 'ENTIDADES');
    reglas.tipoInstituciones = this.split(reglas.id, reglas.tipoInstituciones, spinner, Catalogos.TIPO_INSTITUCIONES, 'TIPO INSTITUCIONES');
    reglas.acreditadoSnp = this.resolveBoolean(reglas.acreditadoSnp);
    reglas.activo = true;
    return reglas;
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
      const elements = string.toString().split(',');
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
  static resolveTipoInstitucion(clave) {
    let inst = Instituciones.CATALOG[clave];
    if (inst) {
      return inst.CVE_TIPO;
    } else {
      return 'NO ENCONTRADA';
    }
  }

  static loadProgramas() {
    try {
      const spinner = ora({ text: 'subiendo matricula...', interval: 80 });
      spinner.start();
      let that = this;
      fs.createReadStream('matricula.csv')
        .pipe(csv())
        .on('data', function (m) {
          let programa = that.toPrograma(m, spinner);
          axios
            .put('http://localhost:8106/api/programas/' + programa.id, programa)
            .then(response => {
              spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
            })
            .catch(error => {
              axios
                .post('http://localhost:8106/api/programas', programa)
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

  static loadReglas() {
    try {
      const spinner = ora({ text: 'subiendo reglas...', interval: 80 });
      spinner.start();
      let reglas = require('../../reglas.json');
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
};
