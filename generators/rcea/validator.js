"use strict";
const axios = require('axios').default;
var parser = require('fast-xml-parser');
const Constants = require('../util/constants');
const GeneratorError = require('../util/GeneratorError')

module.exports = class Validator {
    static validate(config) {
        if (!config.get('login-url')) {
            throw new GeneratorError('Config Problem','The Login url is not defined, try to execute: ( yo conacyt:config )');
        }
        if (!config.get('reporte-ejecutivo-url')) {
            throw new GeneratorError('Config Problem', 'The url for the cvu service is not defined, try to execute: ( yo conacyt:config )');
        }
    }
};
