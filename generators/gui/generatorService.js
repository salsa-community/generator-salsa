'use strict';
const MapperHelper = require('./mapperHelper');
const GeneratorHelper = require('./generatorHelper');
const Visitor = require('./visitor/visitor');

module.exports = class generatorService {
  static doGenerate(context) {
    Visitor.visit(context, context.model);
    context.generator.config.set('secciones', context.seccionesOpt);
    context.generator.config.save();
  }
};
