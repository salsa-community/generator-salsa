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
    const log = Logger.getLogger('cvu_match');
    let count = 0;
    fs.createReadStream('cvu_compare/sep_curp.csv')
      .pipe(csv())
      .on('data', sep_curp => {
        let innerStream = fs.createReadStream('cvu_compare/cvu_curp.csv');
        innerStream
          .pipe(csv())
          .on('data', cvu_curp => {
            count = count + 1;
            if (sep_curp.CURP == cvu_curp.CURP) {
              log.info(',' + sep_curp.CURP);
              innerStream.destroy();
            }
          })
          .on('end', function () {
            console.log('proceso terminado');
          });
      })
      .on('end', function () {
        console.log(count);
      });
  }
};
