var Client = require('node-rest-client').Client;
var Generator = require('yeoman-generator');
const terminalLink = require('terminal-link');
var client = new Client();
var inquirer = require('inquirer');

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'username',
        message: 'what is your username',
        default: this.appname, // Default to current folder name
      },
      {
        type: 'confirm',
        name: 'isRoot',
        message: 'Are your root of the service?',
      },
      {
        type: 'list',
        name: 'reports',
        message: 'select the type of report?',
        choices: [
          'Simple',
          'Ejecutivo',
          new inquirer.Separator(),
          'Completo',
          {
            name: 'Contact support',
            disabled: 'Unavailable at this time',
          },
          'Ninguno',
        ],
      },
      {
        type: 'rawlist',
        name: 'protocol',
        message: 'what kind of protocol do you want to use',
        choices: ['http', 'https', 'ftp'],
        filter: function (val) {
          return val.toLowerCase();
        },
      },
      {
        type: 'expand',
        name: 'overwrite',
        message: 'would you like to overwrite the existing file?',
        default: 'y',
        expanded: true,
        choices: [
          {
            key: 'y',
            name: 'Overwrite',
            value: 'overwrite',
          },
          {
            key: 'a',
            name: 'Overwrite this one and all next',
            value: 'overwrite_all',
          },
          {
            key: 'd',
            name: 'Show diff',
            value: 'diff',
          },
          {
            key: 'x',
            name: 'Abort',
            value: 'abort',
          },
        ],
      },
      {
        type: 'checkbox',
        name: 'manager',
        message: 'Select a package manager',
        choices: [
          { name: 'npm', value: 'npm' },
          { name: 'yarn', value: 'yarn' },
          { name: 'jspm', value: 'jspm', disabled: true },
        ],
      },
      {
        type: 'number',
        name: 'age',
        message: 'How old are you?',
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password',
        mask: '*',
      },
      {
        type: 'editor',
        name: 'resume',
        message: 'Please write a short bio of at least 3 lines.',
      },
    ]);
  }
  info() {
    console.log(this.answers.isRoot);
    console.log(this.answers.age);
    console.log(this.answers.manager);
    console.log(this.answers.overwrite);
    console.log(this.answers.password);
    console.log(this.answers.protocol);
    console.log(this.answers.reports);
    console.log(this.answers.resume);
    console.log(this.answers.username);
  }
};
