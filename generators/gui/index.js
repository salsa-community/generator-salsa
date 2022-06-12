var Generator = require('yeoman-generator');

const MapperHelper = require('./mapperHelper');
const GeneratorService = require('./generatorService');

module.exports = class extends Generator {
  writing() {
    let context = {};
    context.uiDescFile = this.destinationPath('ui-descripcion.json');
    context.destinationPath = this.destinationPath('src/main/webapp/app/entities/msPerfil/');
    context.modelDestinationPath = this.destinationPath('src/main/webapp/app/shared/model/msPerfil/');
    context.entitiesPath = this.destinationPath('src/main/webapp/app/router/entities.ts');
    context.mainPath = this.destinationPath('src/main/webapp/app/main.ts');
    context.entitiesMenuPath = this.destinationPath('src/main/webapp/app/entities/entities-menu.vue');
    context.i18nPath = this.destinationPath('src/main/webapp/i18n');
    context.campos = MapperHelper.resolveJson(context);
    context.secciones = MapperHelper.resolveSecciones(context.campos);
    context.seccionesOpt = this.config.get('secciones');
    context.generator = this;
    if (!context.seccionesOpt) {
      context.seccionesOpt = [];
    }
    GeneratorService.doProcess(context);
  }
};
