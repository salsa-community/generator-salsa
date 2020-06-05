/*jslint node: true*/
"use strict";

var Generator = require('yeoman-generator');
const csv = require('csv-parser');
const fs = require('fs');
const Files = require('../util/files');
const RceaService = require('./rceaService')
const Login = require('../util/login');
const { info, warn, loading, error } = require('prettycli');
const chalk = require('chalk');
const readline = require('readline');
const Logger = require('../util/logger');
const Validator = require('./validator')
const GeneratorError = require('../util/GeneratorError')


const ora = require('ora');

module.exports = class extends Generator {
    async rceaMatch() {
        let count = 0;
        try {
            var start = new Date();
            // Validator.validate(this.config);
            const log = Logger.getLogger('rcea_match');
            const dataFile = this.destinationPath("match.csv");
            const outputdir = this.destinationPath("rcea");
            Files.createIfNotExist(dataFile);
            Files.mkdirSync(outputdir);

            const spinner = ora({ text: 'looking for evaluator...', interval: 80 });
            spinner.start();
            let count = 0;
            fs.createReadStream('proyectos.csv')
                .pipe(csv())
                .on('data', function (proyecto) {
                    fs.createReadStream('rcea.csv')
                        .pipe(csv())
                        .on('data', function (rcea) {
                            let match = RceaService.findMatch(proyecto, rcea);
                            if (match.matched) {
                                spinner.succeed(chalk.green.bold('match found at ') + chalk.green('project:[' + match.project.id_proyecto + '] rcea:[' + match.evaluator.rcea + ']'))
                                log.info(',' + match.project.id_proyecto + ',' + match.evaluator.rcea + ',' + match.evaluator.cvu + ',' + match.level);
                                spinner.start();
                            }
                        })
                        .on('end', function () {
                            spinner.stop();
                        })
                })
                .on('end', function () {
                })
        } catch (error) {
            warn(error);
        }
    }

    save() {

    }
};
