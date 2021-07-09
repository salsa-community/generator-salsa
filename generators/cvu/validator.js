const GeneratorError = require('../util/GeneratorError');

module.exports = class Validator {
    static validate(config) {
        let generator = config.name.split('-')[1];
        if (!config.get('login-url')) {
            throw new GeneratorError(`Config Problem', 'The Login ********url is not defined, try to execute: ( yo ${generator}:config )`);
        }
        if (!config.get('reporte-ejecutivo-url')) {
            throw new GeneratorError(`Config Problem', 'The url for the cvu service is not defined, try to execute: ( yo ${generator}:config )`);
        }
        if (!config.get('reporte-completo-url')) {
            throw new GeneratorError(`Config Problem', 'The url for the cvu service is not defined, try to execute: ( yo ${generator}:config )`);
        }
    }
};
