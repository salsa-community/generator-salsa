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
const ProyectoService = require('./proyectosService');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const Logger = require('../util/logger');
const String = require('../util/strings');
const Catalogos = require('../util/distribucion/constants');
const SalsaLogin = require('../util/SalsaLogin');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
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

    let model = await ProyectoService.readModelFromCsv('proyectos-layout.csv');

    this.fs.copyTpl(this.templatePath('entity.model.ts.ejs'), this.destinationPath('demo/proyecto.model.ts'), {
      entity: model,
    });

    this.fs.copyTpl(this.templatePath('entity.model.java.ejs'), this.destinationPath('demo/Proyecto.java'), {
      entity: model,
    });

    this.fs.copyTpl(this.templatePath('entity.model.dto.java.ejs'), this.destinationPath('demo/ProyectoDTO.java'), {
      entity: model,
    });

    this.fs.copyTpl(this.templatePath('project.vue.ejs'), this.destinationPath('demo/project-edit.vue'), {
      entity: model,
    });

    this.fs.copyTpl(this.templatePath('util.ts.ejs'), this.destinationPath('demo/util.ts'), {
      entity: model,
    });

    this.fs.copyTpl(this.templatePath('proyecto.mapper.ts.ejs'), this.destinationPath('demo/proyecto.mapper.ts'), {
      entity: model,
    });
  }
};
