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
        message: 'Which type of application you want to generate?',
        choices: [
          {
            value: 'microservice',
            name: 'SpringBoot MicroService',
          },
          {
            value: 'config-server',
            name: 'Spring Cloud Config Server',
          },
          {
            value: 'service-registry',
            name: 'Spring Cloud Eureka Server for Service Registry and Discovery',
          },
        ],
        default: 'microservice',
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
