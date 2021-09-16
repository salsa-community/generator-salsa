'use strict';
const Files = require('./files');

module.exports = class Logger {
  static getLogger(loggerName) {
    if (!loggerName) loggerName = 'default';
    const opts = {
      logFilePath: Files.getLoggerName(loggerName),
      timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS,',
    };
    return require('simple-node-logger').createSimpleFileLogger(opts);
  }
};
