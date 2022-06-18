'use strict';
const GeneratorHelper = require('../generatorHelper');

module.exports = class visitor {
  static visit(context, node, depth) {
    if (node.uiType == 'page') {
      this.visitPage(context, node, depth);
    } else {
      for (const propertyKey in node.properties) {
        this.visit(context, node.properties[propertyKey], depth + 1);
      }
    }
  }

  static visitPage(context, page, depth) {
    GeneratorHelper.writeEntitiesFiles(context, page);
    GeneratorHelper.writeUi(context, page);
    GeneratorHelper.writeComponentTs(context, page);
  }

  static visitProperties(context, node, depth) {
    if (node.type == 'array') {
      for (const propertyKey in node.items.properties) {
        this.processNode(context, node.items.properties[propertyKey], depth + 1);
      }
    } else {
      this.processNode(context, node, depth);
    }
  }

  static processNode(context, node, depth) {}
};
