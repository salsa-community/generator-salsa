'use strict';
const GeneratorHelper = require('../generatorHelper');

module.exports = class visitor {
  static visit(context, node) {
    if (node.uiType == 'page') {
      this.visitPage(context, node);
    } else {
      for (const propertyKey in node.properties) {
        this.visit(context, node.properties[propertyKey]);
      }
    }
  }

  static visitPage(context, page) {
    GeneratorHelper.updateEntitiesFiles(context, page);
    GeneratorHelper.writeUi(context, page);
    GeneratorHelper.writeComponentTs(context, page);
    GeneratorHelper.writeI18nFiles(context, page);
    GeneratorHelper.updateApi(context, page);
    context.model.entities[page.name.camelCase] = true;
  }
};
