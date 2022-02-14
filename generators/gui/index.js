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
const csv = require('csv-string');
var inquirer = require('inquirer');
var dateFormat = require('dateformat');
const Constants = require('../util/constants');
const Defaults = require('./defaults');
const GuiService = require('./guiService');

module.exports = class extends Generator {
  writing() {
    let context = {};
    context.uiDescFile = this.destinationPath('ui-descripcion.json');
    context.destinationComponentPath = this.destinationPath('src/main/webapp/app/entities/msPerfil');
    let campos = GuiService.resolveJson(context);
    let secciones = GuiService.resolveSecciones(campos);

    for (const seccion in secciones) {
      this.log(secciones[seccion].props.label);
      for (const mayBeSubseccion in secciones[seccion]) {
        if (mayBeSubseccion != 'props') {
          this.log(' + ' + secciones[seccion][mayBeSubseccion].props.camelCase);
          secciones[seccion][mayBeSubseccion].campos.forEach(campo => {
            console.log('    - ' + campo.camelCase);
          });
        }
      }
    }
  }
};
