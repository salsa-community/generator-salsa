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
  async prompting() {
    this.answers = await this.prompt([{
      type    : 'input',
      name    : 'author',
      message : 'Author Name',
    }]);
  }

  writing() {
      var authorName = this.answers.author;
      var scanDir = this.destinationPath("src/main/resources/config/liquibase/changelog");
      fsreader.readdirSync(scanDir).forEach(file => {
          this.fs.copy(this.destinationPath(scanDir+"/"+file), this.destinationPath(scanDir+"/"+file), {
            process: function(content) {
                var regEx = new RegExp('author="jhipster"', 'g');
                var newContent = content.toString().replace(regEx, 'author="'+authorName+'"');
                return newContent;
            }
        });
      });
  }
};

