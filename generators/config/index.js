var Generator = require('yeoman-generator');

const ora = require('ora');
const Validator = require('./validator');

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'loginurl',
        message: 'what is the url for login?',
        default: this.config.get('login-url'),
      },
      {
        type: 'input',
        name: 'reporteEjecutivoUrl',
        message: 'what is the url for reporte Executive?',
        default: this.config.get('reporte-ejecutivo-url'),
      },
      {
        type: 'input',
        name: 'reporteCompletoUrl',
        message: 'what is the url for Full CVU Report?',
        default: this.config.get('reporte-completo-url'),
      },
    ]);
  }

  save() {
    this.config.set('login-url', this.answers.loginurl);
    this.config.set('reporte-ejecutivo-url', this.answers.reporteEjecutivoUrl);
    this.config.set('reporte-completo-url', this.answers.reporteCompletoUrl);
  }
};
