'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
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
const BecasService = require('./proyectosService');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const Logger = require('../util/logger');
const Catalogos = require('../util/distribucion/constants');

const CAMPOS = require('../../campos.json');
const DISCIPLINAS = require('../../disciplinas.json');
const Inflector = require('../inflector');

const moment = require('moment');
module.exports = class guiService {
  static log = Logger.getLogger('rules-warning');

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

  static resolveInteger(value) {
    return parseInt(value);
  }

  static resolveDouble(value) {
    return parseFloat(value);
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

  static readModelFromCsv(filePath) {
    let model = this.createDefaultModel();
    return new Promise(resolve => {
      fs.createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => String.toCamelCase(header) }))
        .on('data', row => {
          model.properties.push(this.createProperty(row));
        })
        .on('end', function () {
          resolve(model);
        });
    });
  }

  static createDefaultModel() {
    return {
      title: 'Proyecto',
      name: {
        plural: 'proyectos',
        camelCase: 'proyecto',
        dashCase: 'proyecto',
        pascalCase: 'Proyecto',
      },
      path: '',
      properties: [],
      type: 'object',
    };
  }

  static createProperty(row) {
    let property = {};
    property.camelCase = String.toCamelCase(row.nombreCamposPantalla);
    property.dashCase = String.toDashCase(row.nombreCamposPantalla);
    property.pascalCase = String.toPascalCase(row.nombreCamposPantalla);
    property.snakeCase = String.toSnakeCase(row.nombreCamposPantalla);
    property.multiplicidad = this.resolveMultiplicidad(row.multiplicidad);
    property.frontEndType = this.resolveFrontEndType(row.tipo);
    property.backEndType = this.resolveBackEndType(row.tipo);
    property.description = row.descripcion;
    property.title = row.nombreDeVariable;
    property.etapa = row.etapa;
    property.estatus = row.estatusPropuesto;
    return property;
  }

  static resolveFrontEndType(type) {
    if (type == 'Date') {
      return 'Date';
    }
    if (type == 'Double') {
      return 'number';
    }

    return 'string';
  }

  static resolveBackEndType(type) {
    if (type == 'Date') {
      return 'Instant';
    }
    return type;
  }

  static resolveMultiplicidad(multiplicidad) {
    if (multiplicidad == '0 .. 0..*' || multiplicidad == '0..*') {
      return 'many';
    } else {
      return 'one';
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
              .on('data', m => {
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
