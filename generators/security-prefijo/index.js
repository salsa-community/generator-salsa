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

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'current',
        message: 'current prefijo:',
        default: 'jhi',
      },
      {
        type: 'input',
        name: 'newPre',
        message: 'New prefijo',
        default: this.appname, // Default to current folder name
      },
    ]);
  }

  writing() {
    var yorc = this.destinationPath('.yo-rc.json');
    var yorccontent = this.fs.read(yorc);
    var packageFolder = JSON.parse(yorccontent)['generator-jhipster'].packageFolder;
    var scanDir = this.destinationPath('src/main/resources/config/liquibase/changelog');
    var current = this.answers.current;
    var newPre = this.answers.newPre;

    var scanDir = this.destinationPath('src/main/resources/config/liquibase/changelog');
    fsreader.readdirSync(scanDir).forEach(file => {
      this.fs.copy(this.destinationPath(scanDir + '/' + file), this.destinationPath(scanDir + '/' + file), {
        process: function (content) {
          var regEx = new RegExp(current + '_', 'g');
          var newContent = content.toString().replace(regEx, newPre + '_');
          return newContent;
        },
      });
    });
    scanDir = this.destinationPath('src/main/java/' + packageFolder + '/domain');
    fsreader.readdirSync(scanDir).forEach(file => {
      this.fs.copy(this.destinationPath(scanDir + '/' + file), this.destinationPath(scanDir + '/' + file), {
        process: function (content) {
          var regEx = new RegExp(current + '_', 'g');
          var newContent = content.toString().replace(regEx, newPre + '_');
          return newContent;
        },
      });
    });
  }
};
