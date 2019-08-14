var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const {info, warn} = require('prettycli');

const link = terminalLink('conacyt', 'https://conacyt-arquitectura.github.io/');

// const spinner = ora(`Loading ${chalk.red('unicorns')}`).start();


module.exports = class extends Generator {
  writing() {
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('index.html'),
      { title: 'Data Generator' }
    );
  }
};

