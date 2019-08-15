var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const {info, warn} = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>')
var beautify = require("gulp-beautify");
const fsreader = require('fs');



const link = terminalLink('conacyt', 'https://conacyt-arquitectura.github.io/');

// const spinner = ora(`Loading ${chalk.red('unicorns')}`).start();


module.exports = class extends Generator {  
  writing() {
      var targetFilePath = this.destinationPath("testdir/master.xml");
      var auditFileContent = this.templatePath("audit-tables.xml");
      var auditablecontent = this.fs.read(auditFileContent);
      console.log(auditablecontent);
      this.fs.copy(targetFilePath, targetFilePath, {
        process: function(content) {
            var regEx = new RegExp('.*jhipster-needle-liquibase-add-column.*', 'g');
            var newContent = content.toString().replace(regEx, auditablecontent);
            return newContent;
        }
    });
  }
};

