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
const Defaults = require('./defaults');
const GuiService = require('./guiService');
const Constants = require('./constants');

module.exports = class extends Generator {
  writing() {
    let context = {};
    context.csvCamposRizomaFilePath = this.destinationPath('campos-rizoma.csv');
    let campos = GuiService.resolveCamposCvu(context.csvCamposRizomaFilePath);
    //this.config.set('secciones', seccionesOpt);
    //this.config.save();
  }
};
