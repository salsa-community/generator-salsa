"use strict";
const Files = require('./files');

module.exports = class Logger {
    static getLogger() {
        const opts = {
            logFilePath: Files.getLoggerName('cvu'),
            timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS,'
        }
        return require('simple-node-logger').createSimpleFileLogger(opts);
    }
};
