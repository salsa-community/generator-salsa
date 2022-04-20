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
    programa.promedioRecuperado = m.PROMEDIO_RECUPERADO;
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
    programa.tipoInstitucion = this.resolveTipoInstitucion(m.CVE_INSTITUCION);
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
    //programa.inicioBeca = this.formatDate(m.INICIO_BECA);
    //programa.finBeca = this.formatDate(m.FIN_BECA);
    programa.montoMensual = this.resolveMontoMensual(m.ABREV_GRADO);
    programa.orden = 214748364;
    programa.grupo = 'Z_NO_EVALUADO';
    programa.estadoSolicitud = String.normalize(m.DESC_ESTADO_SOLICITUD);
    this.verifyFechas(programa);
    return programa;
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
    this.log.info(date + ' to ' + result);
    return result;
  }

  // from en-US 'MM/dd/YYYY';
  // to en-GB 'dd/MM/YYYY';
  static formatBecaDate(date) {
    let result = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    this.log.info(date + ' to ' + result);
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
  static resolveTipoInstitucion(clave) {
    let inst = Instituciones.CATALOG[clave];
    if (inst) {
      return inst.CVE_TIPO;
    } else {
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

  static loadProgramas() {
    try {
      let token =
        'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJZU3I1M3VYWTdQazZOaEVzZWVUczJxb0RwcF9FYzJrc3NhdllHQ2lZcmRFIn0.eyJqdGkiOiJkZmQzNTc5Zi1mM2E5LTQyMjgtYjA3My0zZTI0ZDcwODM4NjAiLCJleHAiOjE2NTA0MDQ3MjcsIm5iZiI6MCwiaWF0IjoxNjUwMzg2NzI3LCJpc3MiOiJodHRwczovL3FhLmlkbS5jb25hY3l0Lm14L2F1dGgvcmVhbG1zL0NvbmFjeXQtUUEiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZDZjZGIxNmItMmE3OC00ZjA2LTlhMDAtYTEwMmE1MWM0YzQ4IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibWlpY191c2VycyIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6ImJjNjdlMzA3LWQ1MmYtNDNmZC1hMzgyLWU0ZjAxMDVlMzY5MiIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly8xNzIuMjMuKiIsImh0dHA6Ly9sb2NhbGhvc3QqIiwiaHR0cHM6Ly9xYS5mb3JtYWxpemFjaW9uLmNvbmFjeXQubXgqIiwiaHR0cHM6Ly92b3RhY2lvbmVzLmNvbmFjeXQubXgiLCJodHRwOi8vcWEucG9zZG9jdG9yYWRvLmNvbmFjeXQubXgqIiwiaHR0cHM6Ly9qaGlwc3Rlci1yZWdpc3RyeSoiLCJodHRwOi8vdm90YWNpb25lcy5jb25hY3l0Lm14IiwiaHR0cDovL3FhLmZvcm1hbGl6YWNpb24uY29uYWN5dC5teCoiLCJodHRwczovL21pY3Jvc2VydmljaW9zLmNyaXAtazhzLmNvbmFjeXQubXgiLCJodHRwczovL3FhLnNlZ3VpbWllbnRvLmNvbmFjeXQubXgqIiwiaHR0cDovL3JlZ2lzdHJ5LmFwcHMuY29uYWN5dC5teCIsImh0dHBzOi8vcWEuc2FsdWQtY29tdW5pdGFyaWEuY29uYWN5dC5teCIsImh0dHA6Ly9sb2NhbGhvc3Q6ODA4MCIsImh0dHBzOi8vY2llbmNpYS5jcmlwLWs4cy5jb25hY3l0Lm14IiwiaHR0cHM6Ly9xYS5jaWVuY2lhZGVkYXRvcy5jb25hY3l0Lm14KiIsImh0dHA6Ly9xYS5jb252b2NhdG9yaWFzLmNvbmFjeXQubXgiLCJodHRwczovL3FhLnNhbHVkLWNvbXVuaXRhcmlhLmNvbmFjeXQubXgqIiwiaHR0cDovL3FhLnZvdGFjaW9uZXMuY29uYWN5dC5teCoiLCJodHRwOi8vbWljcm9zZXJ2aWNpb3MuY3JpcC1rOHMuY29uYWN5dC5teCIsImh0dHBzOi8vMTcyLjI1LioiLCJodHRwczovLzE3Mi4yNi4qIiwiaHR0cHM6Ly8xMC4qIiwiaHR0cDovL3FhLmNpZW5jaWFkZWRhdG9zLmNvbmFjeXQubXgqIiwiaHR0cHM6Ly9xYS5jaWVuY2lhLmNvbmFjeXQubXgqIiwiaHR0cDovL2NpZW5jaWEuYXBwcy5jb25hY3l0Lm14IiwiaHR0cDovL3FhLnNhbHVkbWVudGFsLmNvbmFjeXQubXgiLCJodHRwczovL3FhLmNvbnZvY2F0b3JpYXMuY29uYWN5dC5teCIsImh0dHA6Ly8xNzIuMjMuKiIsImh0dHBzOi8vcmVnaXN0cnkuYXBwcy5jb25hY3l0Lm14IiwiaHR0cHM6Ly9xYS52b3RhY2lvbmVzLmNvbmFjeXQubXgqIiwiaHR0cDovLzE3Mi4yNS4qIiwiaHR0cDovL3FhLnNhbHVkLWNvbXVuaXRhcmlhLmNvbmFjeXQubXgiLCJodHRwOi8vMTcyLjI2LioiLCJodHRwOi8vMTAuKiIsImh0dHBzOi8vcWEuc2FsdWRtZW50YWwuY29uYWN5dC5teCoiLCJodHRwczovL3FhLnBvc2RvY3RvcmFkby5jb25hY3l0Lm14KiIsImh0dHBzOi8vY2llbmNpYS5hcHBzLmNvbmFjeXQubXgqIiwiaHR0cDovL3FhLmNpZW5jaWEuY29uYWN5dC5teCoiLCJodHRwOi8vcWEuc2VndWltaWVudG8uY29uYWN5dC5teCoiLCJodHRwczovL2xvY2FsaG9zdCoiLCJodHRwOi8vamhpcHN0ZXItcmVnaXN0cnkqIiwiaHR0cDovL2NpZW5jaWEuY3JpcC1rOHMuY29uYWN5dC5teCoiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiUk9MRV9BRE1JTiIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiJlbWFpbCBwcm9maWxlIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsIlJPTEVfQURNSU4iLCJ1bWFfYXV0aG9yaXphdGlvbiJdLCJuYW1lIjoic3lzdGVtIG1hbmFnZXIiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJzeXN0ZW0ubWFuYWdlciIsImxvY2FsZSI6ImVzIiwiZ2l2ZW5fbmFtZSI6InN5c3RlbSIsImZhbWlseV9uYW1lIjoibWFuYWdlciIsImVtYWlsIjoic3lzdGVtQGFvay5jb20ifQ.iZ487eXZ__hxSGGCl83a2itVTy6LDONZkbVMuqG-cWUy0eRGwU7P6k9gvtOLFNB0h4LuKZAe8SuZVQ1BI10aSX0q_cYS8yMje1pF2cQfhsTAOmxyS9gimWf8p_IhW_r0wKZze8d0yvowO-dyap2iDqqTvXbrSX7N-BLTWjNQFNrefUF9uwTL7gO9GM1me7_D0UAzu_jwTOfm-jWnpEw_BrlAbAQTyGdtXl8Gigaik02uwMPeQP-XX_t2kbZRxuG9z8g7pLuZH0qEOj4h6r5xOV8ncoTVrAynKKgWxBKUSImW4dFywx1JPDUZMvIRD1n1dn5z9SxsotBX-1RYtYC6hg';
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const spinner = ora({ text: 'subiendo matricula...', interval: 80 });
      spinner.start();
      let that = this;
      for (let index = 60, j = 0; index < 78; index++, j++) {
        let part = index.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        });

        setTimeout(() => {
          spinner.succeed(chalk.green.bold('PARTE - ') + chalk.green(part));
          fs.createReadStream('matricula/sh_part_' + part)
            .pipe(csv())
            .on('data', function (m) {
              let programa = that.toPrograma(m, spinner);
              axios
                .patch('https://qa.cienciadedatos.conacyt.mx/services/distribucionms/api/programas/' + programa.id, programa, config)
                .then(response => {
                  spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
                })
                .catch(error => {
                  axios
                    .post('https://qa.cienciadedatos.conacyt.mx/services/distribucionms/api/programas', programa, config)
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
        }, 20000 * j);
      }
    } catch (error) {
      warn(error);
    }
  }

  static loadReglas() {
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
};
