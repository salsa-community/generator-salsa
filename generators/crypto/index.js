var Generator = require('yeoman-generator');
const csv = require('csv-parser');
const Files = require('../util/files');
const { info, warn, loading, error } = require('prettycli');
const chalk = require('chalk');
const fs = require('fs');
const zlib = require('zlib');
const readline = require('readline');


const ora = require('ora');

module.exports = class extends Generator {
    async crypto() {
        let lineReader = readline.createInterface({
            input: fs.createReadStream('data.gz').pipe(zlib.createGunzip())
        });
        let n = 0;
        lineReader.on('line', (line) => {
            n += 1
            console.log("line: " + n);
            console.log(line);
        });
        //const readStream = fs.createReadStream('rcea.csv');
        //const gzipStream = zlib.createGzip();
        //const writeStream = fs.createWriteStream('data.gz');
        //readStream
        //  .pipe(gzipStream)
        //.pipe(writeStream);
    }

    save() {
    }
};
