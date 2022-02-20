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
  writing() {
    try {
      let start = new Date();
      //const log = Logger.getLogger('distribucion-matricula');
      const spinner = ora({ text: 'subiendo matricula...', interval: 80 });
      spinner.start();

      fs.createReadStream('matricula.csv')
        .pipe(csv())
        .on('data', function (m) {
          let programa = BecasService.toPrograma(m);
          axios
            .post('http://localhost:8106/api/programas', programa)
            .then(response => {
              spinner.succeed(chalk.green.bold('cvu - ') + chalk.green(response.data.acreditadoSnp));
            })
            .catch(error => {
              console.log(error);
            });
        })
        .on('end', function () {
          spinner.succeed('finalización');
        });
    } catch (error) {
      warn(error);
    }
    let context = {};
  }
};
