var Generator = require('yeoman-generator');

const ora = require('ora');

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([
            {
                type: "input",
                name: "loginurl",
                message: "what is the url for login?",
                default: this.config.get('login-url')
            },
            {
                type: "input",
                name: "reporteEjecutivoUrl",
                message: "what is the url for reporte Ejecutivo?",
                default: this.config.get('reporte-ejecutivo-url')
            }
        ]);
    }

    save() {
        this.config.set('login-url', this.answers.loginurl);
        this.config.set('reporte-ejecutivo-url', this.answers.reporteEjecutivoUrl);
    }
};
