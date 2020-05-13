"use strict"; 

const fs = require('fs');

module.exports = class Files {

    static createIfNotExist(fileName){    
        try {
            fs.accessSync(fileName, fs.constants.F_OK);
            console.log("The file exists.");
        } catch (e) {
            fs.writeFile(fileName, 'cvu', { flag: 'wx' }, function (err) {
                if (err) throw err;
            });
        }
    }

    static sleep(){
        for (let index = 0; index < 1000000; index++) {
            for (let d = 0; d < 1000; d++) {
                
            }
        }
    }
};
