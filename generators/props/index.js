var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const {info, warn} = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>')
var beautify = require("gulp-beautify");
this.registerTransformStream(beautify({ indent_size: 2 }));


const link = terminalLink('conacyt', 'https://conacyt-arquitectura.github.io/');

// const spinner = ora(`Loading ${chalk.red('unicorns')}`).start();


module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([{
      type    : 'input',
      name    : 'title',
      message : 'Your project title',
    }]);
  }
  
  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('index.html'),
      { title: this.answers.title }
    );
  }
};

