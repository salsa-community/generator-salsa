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
  static log = Logger.getLogger('permisos-warning');

  static loadPermisos(context) {
    const spinner = ora({ text: 'subiendo proyectos...', interval: 80 });
    spinner.start();
    spinner.succeed(chalk.green.bold('enviando - ') + chalk.green(context.permiso.id) + chalk.green(context.permiso.areas));
    axios
      .patch(context.serviceUrl + '/api/permisos/' + context.permiso.id, context.permiso, context.config)
      .then(response => {
        spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
      })
      .catch(error => {
        axios
          .post(context.serviceUrl + '/api/permisos', context.permiso, context.config)
          .then(response => {
            spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
          })
          .catch(errorCreated => {
            spinner.fail(chalk.green.bold('ups - ' + context.permiso.id + ': ') + chalk.green(errorCreated));
          });
      });
  }
};
