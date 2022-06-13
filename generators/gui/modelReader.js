'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const csv = require('csv-parser');
const jp = require('jsonpath');
const Inflector = require('inflected');
Inflector.inflections('es', function (inflect) {
  inflect.plural(/(o)$/i, '$1s');
  inflect.singular(/(o)s/i, '$1');
  inflect.plural(/(on)$/i, '$1es');
  inflect.singular(/(on)es/i, '$1');
});
module.exports = class modelReader {
  static readModelFromCsv(filePath) {
    let rootModel = { properties: {}, type: 'object' };
    return new Promise(resolve => {
      fsreader
        .createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => String.toCamelCase(header) }))
        .on('data', row => {
          if (row.modelo) {
            this.processJsonPath(rootModel, row.modelo, row);
          }
        })
        .on('end', function () {
          resolve(rootModel);
        });
    });
  }

  static processJsonPath(rootModel, jsonPathExpression, row) {
    let jsonPathTree = jp.parse('$.' + jsonPathExpression);
    let context = this.contextFactory(rootModel, jsonPathTree, row);
    jsonPathTree.forEach((node, nodeIdx) => {
      context.jpNode = node;
      context.jpNodeIdx = nodeIdx;
      this.visitJpNode(context);
    });
  }

  static visitJpNode(context) {
    if (context.jpNode.expression.type === 'identifier') {
      let currentContainer = context.currentNode.type == 'array' ? 'items' : 'properties';

      if (currentContainer == 'properties') {
        if (!context.currentNode.properties[context.jpNode.expression.value]) {
          context.currentNode.properties[context.jpNode.expression.value] = this.defaulProperty(context, context.jpNode.expression.value);
        }
        context.prevNode = context.currentNode;
        context.prevJpNodeValue = context.jpNode.expression.value;
        context.currentNode = context.currentNode.properties[context.jpNode.expression.value];
      } else {
        if (!context.currentNode.items.properties[context.jpNode.expression.value]) {
          context.currentNode.items.properties[context.jpNode.expression.value] = this.defaulProperty(
            context,
            context.jpNode.expression.value
          );
        }
        context.prevNode = context.currentNode;
        context.prevJpNodeValue = context.jpNode.expression.value;
        context.currentNode = context.currentNode.items.properties[context.jpNode.expression.value];
      }
    }
  }

  static contextFactory(rootModel, jsonPathTree, row) {
    let context = {};
    context.currentNode = rootModel;
    context.prevNode = null;
    context.prevJpNodeValue = null;
    context.maxElements = jsonPathTree.length - 1;
    context.row = row;
    context.jsonPathTree = jsonPathTree;
    return context;
  }

  static isNodeIntoArray(context) {
    return context.prevNode && context.prevNode.type == 'array';
  }
  static isArray(jsonPathTree, idx) {
    let nexNode = jsonPathTree[idx + 1];
    if (nexNode) {
      return nexNode.expression.type === 'script_expression';
    }
    return false;
  }

  static defaulProperty(context, name) {
    let isLeaf = this.isLeaf(context);
    let objectType = this.resolveElementType(context, isLeaf);
    let uiType = this.resolveUiType(context, isLeaf);
    let base = {
      singular: Inflector.singularize(name, 'es'),
      plural: Inflector.pluralize(name, 'es'),
      description: context.row.etiqueta,
      pascalCase: String.toPascalCase(name),
      camelCase: String.toCamelCase(name),
      snakeCase: String.toSnakeCase(name),
      dashCase: String.toDashCase(name),
      title: String.toPascalCase(name),
      type: objectType,
      uiType: uiType,
      isLeaf: isLeaf,
    };

    this.isArray(context.jsonPathTree, context.jpNodeIdx);
    let complement = this.resolveContainerObject(context, objectType);

    return { ...base, ...complement };
  }

  static resolveContainerObject(context, objectType) {
    if (objectType == 'array') {
      let arrayType = this.resolveArrayType(context);
      return {
        items: {
          properties: {},
          type: 'object',
          title: arrayType,
        },
      };
    } else {
      return { properties: {} };
    }
  }

  static resolveArrayType(context) {
    let jsonPathTree = context.jsonPathTree;
    let idx = context.jpNodeIdx;

    let nexNode = jsonPathTree[idx + 1];
    if (nexNode) {
      let value = nexNode.expression.value;
      return value.substring(value.indexOf('.') + 1, value.indexOf(')'));
    }
    return 'Generic';
  }
  static resolveUiType(context, isLeaf) {
    if (isLeaf) {
      return context.row.tipoUi;
    }
    if (this.isArray(context.jsonPathTree, context.jpNodeIdx)) {
      return context.row.tipoUi;
    }
    return 'section';
  }

  static isLeaf(context) {
    return context.jpNodeIdx == context.maxElements;
  }
  static resolveElementType(context, isLeaf) {
    if (isLeaf) {
      return context.row.tipoDeDato;
    }
    if (this.isArray(context.jsonPathTree, context.jpNodeIdx)) {
      return 'array';
    }
    return 'object';
  }
};
