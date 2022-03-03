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
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.option('programas');
    this.option('reglas');
  }
  writing() {
    if (this.options.programas) {
      BecasService.loadProgramas();
    } else if (this.options.reglas) {
      BecasService.loadReglas();
    }
  }
};
