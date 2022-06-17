'use strict';
const GeneratorHelper = require('../generatorHelper');

module.exports = class visitor {
  static visit(node, depth) {
    console.log(' '.repeat(depth) + '+' + node.title);
    if (node.uiType == 'page') {
      this.visitPage(node, depth);
    } else {
      for (const propertyKey in node.properties) {
        this.visit(node.properties[propertyKey], depth + 1);
      }
    }
  }

  static visitPage(node, depth) {
    for (const propertyKey in node.properties) {
      this.visitProperties(node.properties[propertyKey], depth + 1);
    }
  }

  static visitProperties(node, depth) {
    if (node.type == 'array') {
      console.log(' '.repeat(depth) + '+' + node.title + '[]');
      for (const propertyKey in node.items.properties) {
        this.processNode(node.items.properties[propertyKey], depth + 1);
      }
    } else {
      this.processNode(node, depth);
    }
  }

  static processNode(node, depth) {
    console.log(' '.repeat(depth) + '-' + node.title);
  }
};
