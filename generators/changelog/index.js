var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>')
var beautify = require("gulp-beautify");
const fsreader = require('fs');
const csv = require('csv-string');
var inquirer = require('inquirer');
var dateFormat = require('dateformat');



module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([{
      type: 'list',
      name: 'changeType',
      message: 'type of change',
      choices: ['added', 'update', 'delete', 'load', 'insert'],
      default: 'added'
    }, {
      type: 'input',
      name: 'changeName',
      message: 'Change Name'
    }, {
      type: 'input',
      name: 'author',
      message: 'author name'
    }]);
  }
  writing() {
    var timestamp = dateFormat(new Date(), "yyyymmddhhMMss");
    var changeLogId = timestamp + '-1';
    var changeLogName = timestamp + '_' + this.answers.changeType + '_' + this.answers.changeName + '.xml';
    this.fs.copyTpl(
      this.templatePath('changelog.xml'),
      this.destinationPath('src/main/resources/config/liquibase/changelog/' + changeLogName),
      { author: this.answers.author, id: changeLogId }
    );

    var scanDir = this.destinationPath("src/main/resources/config/liquibase");
    var templateFile = this.templatePath("audit-tables.xml");
    var templateContent = this.fs.read(templateFile);
    fsreader.readdirSync(scanDir).forEach(file => {
      this.fs.copy(this.destinationPath(scanDir + "/" + file), this.destinationPath(scanDir + "/" + file), {
        process: function (content) {
          var regEx = new RegExp('.*jhipster-needle-liquibase-add-column.*', 'g');
          var newContent = content.toString().replace(regEx, templateContent);
          return newContent;
        }
      });
    });
  }
};

