'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const csv = require('csv-parser');
const jp = require('jsonpath');
const Inflector = require('../inflector');
module.exports = class modelReader {
  static readModelFromCsv(filePath) {
    let rootModel = { title: 'Root', path: '', properties: {}, type: 'object' };
    return new Promise(resolve => {
      fsreader
        .createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => String.toCamelCase(header) }))
        .on('data', row => {
          if (row.modelo) {
            this.processRow(rootModel, row.modelo, row);
          }
        })
        .on('end', function () {
          resolve(rootModel);
        });
    });
  }

  static processRow(rootModel, jsonPathExpression, row) {
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
          context.currentNode.properties[context.jpNode.expression.value] = this.createNode(context, context.jpNode.expression.value);
        }
        context.prevNode = context.currentNode;
        context.prevJpNodeValue = context.jpNode.expression.value;
        context.currentNode = context.currentNode.properties[context.jpNode.expression.value];
      } else {
        if (!context.currentNode.items.properties[context.jpNode.expression.value]) {
          context.currentNode.items.properties[context.jpNode.expression.value] = this.createNode(context, context.jpNode.expression.value);
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

  static createNode(context, name) {
    let isLeaf = this.isLeaf(context);
    let objectType = this.resolveElementType(context, isLeaf);
    let uiType = this.resolveUiType(context, isLeaf);
    let currentPath = context.currentNode.path;
    let base = {
      path: {
        pascalCase: this.formatPath(currentPath, name, 'pascalCase'),
        camelCase: this.formatPath(currentPath, name, 'camelCase'),
        snakeCase: this.formatPath(currentPath, name, 'snakeCase'),
        dashCase: this.formatPath(currentPath, name, 'dashCase'),
      },
      validations: {
        required: context.row.requerido.toLowerCase() === 'true',
        min: context.row.min,
        max: context.row.max,
        tiposMime: context.row.tiposMime,
        regex: context.row.regex,
      },
      name: {
        singular: Inflector.singularize(name, 'es'),
        plural: Inflector.pluralize(name, 'es'),
        pascalCase: String.toPascalCase(name),
        camelCase: String.toCamelCase(name),
        snakeCase: String.toSnakeCase(name),
        dashCase: String.toDashCase(name),
        constantCase: String.toConstantCase(name),
      },
      description: context.row.etiqueta,
      title: String.toPascalCase(name),
      type: objectType,
      uiType: uiType,
      isLeaf: isLeaf,
    };
    let complement = this.resolveContainerObject(context, objectType);

    return { ...base, ...complement };
  }

  static formatPath(path, name, type) {
    let leftValue = path[type] ? path[type] + '.' : '';
    let rightValue = '';
    if (type == 'pascalCase') {
      rightValue = String.toPascalCase(name);
    } else if (type == 'camelCase') {
      rightValue = String.toCamelCase(name);
    } else if (type == 'snakeCase') {
      rightValue = String.toSnakeCase(name);
    } else if (type == 'dashCase') {
      rightValue = String.toDashCase(name);
    }
    return leftValue + rightValue;
  }

  static resolveContainerObject(context, objectType) {
    if (objectType == 'array') {
      let arrayType = this.resolveArrayType(context);
      return {
        items: {
          properties: {},
          type: 'object',
          title: arrayType,
          name: {
            singular: Inflector.singularize(String.toCamelCase(arrayType), 'es'),
            plural: Inflector.pluralize(String.toCamelCase(arrayType), 'es'),
            pascalCase: String.toPascalCase(arrayType),
            camelCase: String.toCamelCase(arrayType),
            snakeCase: String.toSnakeCase(arrayType),
            dashCase: String.toDashCase(arrayType),
            constantCase: String.toConstantCase(arrayType),
          },
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
    return context.jpNodeIdx == context.maxElements || this.isArray(context.jsonPathTree, context.jpNodeIdx);
  }
  static resolveElementType(context, isLeaf) {
    if (isLeaf) {
      if (context.currentNode.type == 'object') {
        context.currentNode.uiType = 'page';
      }
      return context.row.tipoDeDato;
    }
    if (this.isArray(context.jsonPathTree, context.jpNodeIdx)) {
      return 'array';
    }
    return 'object';
  }
};
