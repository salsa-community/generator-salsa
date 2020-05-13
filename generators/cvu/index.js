var Client = require('node-rest-client').Client;
var Generator = require('yeoman-generator');
const csv = require('csv-parser');
const fs = require('fs');
var path = require('path');
const Files = require('../util/files');
const Login = require('../util/login');
const CvuService = require('../util/cvuService')


const ora = require('ora');

module.exports = class extends Generator {
    async prompting() {
        this.answers = await this.prompt([
            {
                type: "input",
                name: "outputdir",
                message: "Insert the destination path",
                default: this.destinationPath("") // Default to current folder name
            },
            {
                type: "input",
                name: "username",
                message: "What is your username?",
                default: 'gochihh@gmail.com' // Default to current folder name
            },
            {
                type: "password",
                name: "password",
                message: "Enter your password",
                mask: '*',
                filter: function (val) {
                    return Buffer.from(val).toString('base64');
                }
            }
        ]);
    }

    async create() {
        const spinner = ora('cargando cvus').start();
        const dataFile = this.destinationPath("data.csv");
        const resultFile = this.destinationPath("result.csv");
        Files.createIfNotExist(dataFile);
        var token = await Login.login(this.answers.username, this.answers.password);
        var context = {};
        context.token = token;
        context.cvu = 218064;
        var archivo = await CvuService.consultar(context);
        console.log(archivo);
        
        // fs.createReadStream(dataFile)
        //     .pipe(csv())
        //     .on('data', (row) => {

        //     })
        //     .on('end', () => {
        //         spinner.succeed("se completo la información");
        //     });
    }
};
