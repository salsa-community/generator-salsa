var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
var beautify = require('gulp-beautify');
const fsreader = require('fs');
var inquirer = require('inquirer');
var dateFormat = require('dateformat');
const Defaults = require('./defaults');
const BecasService = require('./becasService');
const Constants = require('./constants');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const Logger = require('../util/logger');
const String = require('../util/strings');
const Catalogos = require('../util/distribucion/constants');
const { CATALOG } = require('./institucionesCatalog');
const SalsaLogin = require('../util/SalsaLogin');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('programas');
    this.option('reglas');
    this.option('proyectos');
    this.option('prod');
    this.option('qa');
  }

  async writing() {
    let context = this.config.get('becasConfig')['DEV'].context;
    if (this.options.qa) {
      context = this.config.get('becasConfig')['QA'].context;
    } else if (this.options.prod) {
      context = this.config.get('becasConfig')['PROD'].context;
    }

    if (this.options.qa || this.options.prod) {
      context.config = await SalsaLogin.login(context);
    }

    if (this.options.programas) {
      BecasService.loadProgramas(context);
    } else if (this.options.reglas) {
      BecasService.loadReglas(context);
    } else if (this.options.proyectos) {
      BecasService.loadProyectos(context);
    }
  }
};
