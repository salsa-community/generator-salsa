'use strict';

const fs = require('fs');
const dateFormat = require('dateformat');

module.exports = class Files {
  static createIfNotExist(fileName) {
    try {
      fs.accessSync(fileName, fs.constants.F_OK);
    } catch (e) {
      fs.writeFile(fileName, 'cvu', { flag: 'wx' }, function (err) {
        if (err) throw err;
      });
    }
  }

  static mkdirSync(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  static getLoggerName(name) {
    return dateFormat(new Date(), 'yyyymmddHHMMss_') + name + '.log';
  }
};
