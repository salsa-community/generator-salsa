var Generator = require('yeoman-generator');

const MapperHelper = require('./mapperHelper');
const GeneratorService = require('./generatorService');
const ModelReader = require('./modelReader');
const GeneratorHelper = require('./generatorHelper');

module.exports = class extends Generator {
  async writing() {
    let context = {};

    context.uiDescFile = this.destinationPath('ui-descripcion.json');
    context.destinationPath = this.destinationPath('src/main/webapp/app/entities/msPerfil/');
    context.modelDestinationPath = this.destinationPath('src/main/webapp/app/shared/model/msPerfil/');
    context.entitiesPath = this.destinationPath('src/main/webapp/app/router/entities.ts');
    context.mainPath = this.destinationPath('src/main/webapp/app/main.ts');
    context.entitiesMenuPath = this.destinationPath('src/main/webapp/app/entities/entities-menu.vue');
    context.i18nPath = this.destinationPath('src/main/webapp/i18n');
    context.apiPath = this.destinationPath('api.yml');
    context.model = await ModelReader.readModelFromCsv(this.destinationPath('campos-rizoma.csv'));
    context.secciones = MapperHelper.resolveSecciones(MapperHelper.resolveJson(context));
    context.seccionesOpt = this.config.get('secciones');
    context.model.entities = {};
    context.generator = this;
    if (!context.seccionesOpt) {
      context.seccionesOpt = [];
    }
    GeneratorHelper.createDefaultFiles(context);
    GeneratorService.doGenerate(context);
    GeneratorHelper.printJson(context);
  }
};
