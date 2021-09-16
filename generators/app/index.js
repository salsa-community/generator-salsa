var Generator = require('yeoman-generator');

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');

const link = terminalLink('conacyt', 'https://conacyt-arquitectura.github.io/');

// const spinner = ora(`Loading ${chalk.red('unicorns')}`).start();

module.exports = class extends Generator {
  prompting() {
    const prompts = [
      {
        type: 'list',
        name: 'appType',
        message: 'Welcome to SALSA CLI?',
        choices: [
          {
            value: 'cvu',
            name: 'Download cvus',
          },
          {
            value: 'rcea',
            name: 'Match Evaluator for a Project',
          },
          {
            value: 'info',
            name: 'Show General Information',
          },
        ],
        default: 'info',
      },
    ];
    return this.prompt(prompts).then(answers => {
      this.appType = answers.appType;
    });
  }

  default() {
    this.composeWith(require.resolve('../' + this.appType));
  }
};
