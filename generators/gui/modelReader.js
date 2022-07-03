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
            row.modelo = row.tipoDeDato == 'array' || row.tipoDeDato == 'object' ? row.modelo : row.modelo + '.' + row.nombre;
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
      this.visitJpExpressionNode(context);
    });
  }

  static visitJpExpressionNode(context) {
    if (context.jpNode.expression.type === 'identifier') {
      let properties = context.currentNode.type == 'array' ? context.currentNode.items.properties : context.currentNode.properties;

      if (!properties[context.jpNode.expression.value]) {
        properties[context.jpNode.expression.value] = this.createProperty(context, context.jpNode.expression.value);
      }

      context.prevNode = context.currentNode;
      context.prevJpNodeValue = context.jpNode.expression.value;
      context.currentNode = properties[context.jpNode.expression.value];
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
  static isNextScriptExpression(jsonPathTree, idx) {
    let nexNode = jsonPathTree[idx + 1];
    if (nexNode) {
      return nexNode.expression.type === 'script_expression';
    }
    return false;
  }

  static createProperty(context, name) {
    let isLeaf = this.isLeaf(context);
    let objectType = this.resolveNodeType(context, isLeaf);
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
        readonly: context.row.soloLectura.toLowerCase() === 'true',
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
      tooltip: String.toPascalCase(name),
      tooltipEn: String.toPascalCase(name),
      description: String.toPascalCase(name),
      descriptionEn: String.toPascalCase(name),
      title: String.toPascalCase(name),
      titleEn: String.toPascalCase(name),
      type: objectType,
      uiType: uiType,
      isLeaf: isLeaf,
    };

    let propertyBody = this.createBody(context, objectType, isLeaf);
    return { ...base, ...propertyBody };
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

  static createBody(context, objectType, isLeaf) {
    if (objectType == 'array') {
      return this.createArrayBody(context);
    } else if (objectType == 'object' && isLeaf) {
      return this.createObjectBody(context);
    } else {
      return this.createDefaultBody();
    }
  }

  static createArrayBody(context) {
    let arrayType = this.resolveObjectType(context);
    return {
      items: {
        properties: {},
        type: 'object',
        description: arrayType,
        descriptionEn: arrayType,
        tooltip: arrayType,
        tooltipEn: arrayType,
        title: arrayType,
        titleEn: arrayType,
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
  }
  static createObjectBody(context) {
    let objectType = this.resolveObjectType(context);
    return {
      properties: {},
      type: 'object',
      description: objectType,
      descriptionEn: objectType,
      tooltip: objectType,
      tooltipEn: objectType,
      title: objectType,
      titleEn: objectType,
      name: {
        singular: Inflector.singularize(String.toCamelCase(objectType), 'es'),
        plural: Inflector.pluralize(String.toCamelCase(objectType), 'es'),
        pascalCase: String.toPascalCase(objectType),
        camelCase: String.toCamelCase(objectType),
        snakeCase: String.toSnakeCase(objectType),
        dashCase: String.toDashCase(objectType),
        constantCase: String.toConstantCase(objectType),
      },
    };
  }

  static createDefaultBody() {
    return { properties: {} };
  }

  static resolveContainerObject(context, objectType) {
    if (objectType == 'array') {
      let arrayType = this.resolveObjectType(context);
      return {
        items: {
          properties: {},
          type: 'object',
          description: arrayType,
          descriptionEn: arrayType,
          tooltip: arrayType,
          tooltipEn: arrayType,
          title: arrayType,
          titleEn: arrayType,
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

  static resolveObjectType(context) {
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
    if (this.isNextScriptExpression(context.jsonPathTree, context.jpNodeIdx)) {
      return context.row.tipoUi;
    }
    return 'section';
  }

  static isLeaf(context) {
    return context.jpNodeIdx == context.maxElements || this.isNextScriptExpression(context.jsonPathTree, context.jpNodeIdx);
  }
  static resolveNodeType(context, isChildLeaf) {
    if (isChildLeaf) {
      if (context.currentNode.type == 'object') {
        context.currentNode.uiType = 'page';
      }
      return context.row.tipoDeDato;
    }
    if (this.isNextScriptExpression(context.jsonPathTree, context.jpNodeIdx)) {
      return 'array';
    }
    return 'object';
  }
};
