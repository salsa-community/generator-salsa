var Generator = require('yeoman-generator');
const csv = require('csv-parser');
const fs = require('fs');
const Files = require('../util/files');
const Login = require('../util/login');
const CvuService = require('../util/cvuService')
const { info, warn, loading, error } = require('prettycli');
const chalk = require('chalk');
const readline = require('readline');


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

        const opts = {
            logFilePath: Files.getLoggerName('cvu'),
            timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS,'
        }
        const log = require('simple-node-logger').createSimpleFileLogger(opts);
        const dataFile = this.destinationPath("data.csv");
        const outputdir = this.answers.outputdir + '/output/cvu';
        const username = this.answers.username;
        const password = this.answers.password;
        this.config.set({ 'username': username });
        this.config.set({ 'outputdir': this.answers.outputdir });
        Files.createIfNotExist(dataFile);
        Files.mkdirSync(outputdir);
        var token = await Login.login(username, password);        
        if(!token){
            warn('Auth server is not reacheable, please verify the connection');
            return
        }

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
        if(errors) this.log(chalk.bold.red('errors: ' + errors));
    }
};
