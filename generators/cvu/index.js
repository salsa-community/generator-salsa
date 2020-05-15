var Generator = require('yeoman-generator');
const csv = require('csv-parser');
const fs = require('fs');
const Files = require('../util/files');
const CvuService = require('./cvuService')
const Login = require('../util/login');
const { info, warn, loading, error } = require('prettycli');
const chalk = require('chalk');
const readline = require('readline');
const Logger = require('../util/logger')


const ora = require('ora');

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([
            {
                type: "input",
                name: "outputdir",
                message: "Insert the destination path",
                default: this.config.get('outputdir') ? this.config.get('outputdir') : this.destinationPath("")
            },
            {
                type: "input",
                name: "username",
                message: "What is your username?",
                default: this.config.get('username')
            },
            {
                type: "password",
                name: "password",
                message: "Enter your password",
                default: 'FI7732un@m',
                mask: '*',
                filter: function (val) {
                    return Buffer.from(val).toString('base64');
                }
            }
        ]);
    }

    async dowloadCvu() {
        var start = new Date()
        const log = Logger.getLogger();
        const dataFile = this.destinationPath("data.csv");
        const outputdir = this.answers.outputdir + '/output/cvu';
        const username = this.answers.username;
        const password = this.answers.password;
        Files.createIfNotExist(dataFile);
        Files.mkdirSync(outputdir);
        var response = await Login.login(username, password);
        if (response.failure) {
            warn(response.error + ': ' + response.message);
            return
        }
        const token = response.data.token;
        const fileStream = fs.createReadStream(dataFile);
        const spinner = ora({ text: 'Dowloading...', interval: 80 });
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        let success = 0;
        let errors = 0;
        for await (const cvuraw of rl) {
            if (!isNaN(cvuraw)) {
                spinner.start();
                var context = {};
                context.token = token;
                context.cvu = Number(cvuraw);
                spinner.text = 'Downloading ' + context.cvu;
                var archivo = await CvuService.consultar(context);
                if (archivo) {
                    let buff = Buffer.from(archivo, 'base64');
                    fs.writeFileSync(outputdir + '/' + context.cvu + '.pdf', buff);
                    spinner.succeed(chalk.green(outputdir + '/' + context.cvu + '.pdf'));
                    log.info(',' + context.cvu + ', success');
                    success++;
                } else {
                    spinner.fail(chalk.red(outputdir + '/' + context.cvu + '.pdf'));
                    log.error(',' + context.cvu + ', error');
                    errors++;
                }
            }
        }
        var end = (new Date() - start) / 1000;
        this.log('');
        this.log(chalk.bold.white('Excecution time: ' + end + 's'));
        this.log(chalk.bold.green('success: ' + success));
        if (errors) this.log(chalk.bold.red('errors: ' + errors));
    }

    save() {
        this.config.set('username', this.answers.username);
        this.config.set('outputdir', this.answers.outputdir);
    }
};
