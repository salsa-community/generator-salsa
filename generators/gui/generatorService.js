'use strict';
const MapperHelper = require('./mapperHelper');
const GeneratorHelper = require('./generatorHelper');

module.exports = class generatorService {
  static doProcess(context) {
    for (const seccionKey in context.secciones) {
      let templateVariables = MapperHelper.defaultVariables(context.secciones, seccionKey);
      let seccion = context.secciones[seccionKey];

      for (const mayBeSubseccion in seccion) {
        if (mayBeSubseccion != 'props') {
          let subtemplateVariables = MapperHelper.defaultSubVariables(context.secciones, seccionKey, mayBeSubseccion);
          let subseccion = context.secciones[seccionKey][mayBeSubseccion];

          GeneratorHelper.writeEntitiesFiles(context, seccion, subseccion);
          GeneratorHelper.writeUi(context, seccion, subtemplateVariables);
          GeneratorHelper.writeComponentTs(context, seccion, subtemplateVariables);
        }
      }
      GeneratorHelper.writeI18nFiles(context, seccion, templateVariables);
    }
    context.generator.config.set('secciones', context.seccionesOpt);
    context.generator.config.save();
  }
};
