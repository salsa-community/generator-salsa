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

module.exports = class extends Generator {  
  writing() {
      var scanDir = this.destinationPath("src/main/resources/config/liquibase/changelog");
      var templateFile = this.templatePath("audit-tables.xml");
      var templateContent = this.fs.read(templateFile);
      fsreader.readdirSync(scanDir).forEach(file => {
          this.fs.copy(this.destinationPath(scanDir+"/"+file), this.destinationPath(scanDir+"/"+file), {
            process: function(content) {
                var regEx = new RegExp('.*jhipster-needle-liquibase-add-column.*', 'g');
                var newContent = content.toString().replace(regEx, templateContent);
                return newContent;
            }
        });
      });
  }
};

