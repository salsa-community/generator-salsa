var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const {info, warn} = require('prettycli');

const link = terminalLink('conacyt', 'https://conacyt-arquitectura.github.io/');

// const spinner = ora(`Loading ${chalk.red('unicorns')}`).start();


module.exports = class extends Generator {
    method1() {
    if (!process.env.PRODUCTION) info('BUILD', "success!");
    else warn('This is production mode! Are you sure?');
    }

    writing() {
        this.fs.write(this.destinationPath('index.js'), 'const foo = 1;');
      }
  };

