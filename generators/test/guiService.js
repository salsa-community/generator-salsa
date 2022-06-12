'use strict';

const String = require('../util/strings');
const ora = require('ora');
const fsreader = require('fs');
const csv = require('csv-parser');
const SECCION_PROP = 'seccion';
const jp = require('jsonpath');
const pluralize = require('pluralize');
const Inflector = require('inflected');

Inflector.inflections('es', function (inflect) {
  inflect.plural(/(o)$/i, '$1$2s');
  inflect.singular(/(o)s/i, '$1');
  inflect.plural(/(on)$/i, '$1es');
  inflect.singular(/(on)es/i, '$1');
});

module.exports = class guiService {
  static destinationPath(seccion) {
    return context.destinationComponentPath + seccion.dashCase + '/' + seccion.dashCase + '.vue';
  }
  static resolveJson(context) {
    return JSON.parse(fsreader.readFileSync(context.uiDescFile));
  }

  static toCampo(m) {
    let campo = {};
    campo.id = '';
    return campo;
  }

  static resolveCamposCvu(filePath) {
    let modelo = { properties: {}, type: 'object' };
    let context = {};
    return new Promise(resolve => {
      fsreader
        .createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => String.toCamelCase(header) }))
        .on('data', row => {
          if (row.modelo) {
            let path = jp.parse('$.' + row.modelo);
            context = this.contextFactory(modelo, path, row);
            path.forEach((el, idx) => {
              context.el = el;
              context.idx = idx;
              this.resolveTypeOfExpression(context);
            });
          }
        })
        .on('end', function () {
          resolve(modelo);
        });
    });
  }

  static testing(filePath) {
    let modelo = { properties: {}, type: 'object' };
    let context = {};
    return new Promise(resolve => {
      fsreader
        .createReadStream(filePath)
        .pipe(csv({ mapHeaders: ({ header }) => String.toCamelCase(header) }))
        .on('data', row => {
          let nombre = String.toCamelCase(row.etiqueta);

          console.log(nombre);
        })
        .on('end', function () {
          resolve(modelo);
        });
    });
  }

  static contextFactory(modelo, path, row) {
    let context = {};
    context.currentReference = modelo;
    context.beforeReference = null;
    context.maxElements = path.length - 1;
    context.row = row;
    return context;
  }
  static resolveTypeOfExpression(context) {
    if (context.el.expression.type === 'identifier') {
      // es objeto
      if (!context.currentReference['properties'][context.el.expression.value]) {
        context.currentReference['properties'][context.el.expression.value] = this.defaulProperty(context, context.el.expression.value);
      }
      context.beforeReference = context.currentReference;
      context.beforeElValue = context.el.expression.value;
      context.currentReference = context.currentReference['properties'][context.el.expression.value];
    } // si es array, le indicamos al elemento padre que es tipo array y no object
    else if (context.el.expression.type === 'script_expression') {
      context.beforeReference['properties'][context.beforeElValue].type = 'array';
    }
  }

  static resolveSecciones(campos) {
    let secciones = {};
    campos.forEach(campo => {
      let seccion = String.toCamelCase(campo.seccion);
      let subseccion = String.toCamelCase(campo.subseccion);
      if (!secciones[seccion]) {
        secciones[seccion] = this.defaultSeccion(campo.seccion);
        secciones[seccion].props.labelEn = campo.seccionEn;
      }
      if (!secciones[seccion][subseccion]) {
        secciones[seccion][subseccion] = this.defaultSubseccion(campo.subseccion);
        secciones[seccion][subseccion].props.labelEn = campo.subseccionEn;
      }
      secciones[seccion][subseccion].campos.push(this.formatCampo(campo));
    });
    return secciones;
  }

  static defaulProperty(context, name) {
    let isLeaf = false;
    let elementType = 'object';
    if (context.idx == context.maxElements) {
      elementType = context.row.tipoDeCampo;
      isLeaf = true;
    }
    return {
      properties: {},
      singular: Inflector.singularize(name, 'es'),
      plural: Inflector.pluralize(name, 'es'),
      description: context.row.campo,
      pascalCase: String.toPascalCase(name),
      camelCase: String.toCamelCase(name),
      snakeCase: String.toSnakeCase(name),
      dashCase: String.toDashCase(name),
      type: elementType,
      isLeaf: isLeaf,
    };
  }

  static defaultSeccion(description) {
    let seccion = { props: {} };
    seccion.props.label = description;
    seccion.props.pascalCase = String.toPascalCase(description);
    seccion.props.camelCase = String.toCamelCase(description);
    seccion.props.snakeCase = String.toSnakeCase(description);
    seccion.props.dashCase = String.toDashCase(description);
    return seccion;
  }

  static defaultVariables(secciones, seccion) {
    return {
      seccion: secciones[seccion],
      seccionLabel: secciones[seccion].props.label,
      seccionPascalCase: secciones[seccion].props.pascalCase,
      seccionCamelCase: secciones[seccion].props.camelCase,
      seccionSnakeCase: secciones[seccion].props.snakeCase,
      seccionDashCase: secciones[seccion].props.dashCase,
    };
  }

  static defaultSubseccion(description) {
    let subseccion = { props: {} };
    subseccion.props.label = description;
    subseccion.props.pascalCase = String.toPascalCase(description);
    subseccion.props.camelCase = String.toCamelCase(description);
    subseccion.props.snakeCase = String.toSnakeCase(description);
    subseccion.props.dashCase = String.toDashCase(description);
    subseccion.campos = [];
    return subseccion;
  }

  static formatCampo(campo) {
    campo.label = campo.campo;
    campo.labelEn = campo.campoEn;
    campo.camelCase = String.toCamelCase(campo.campo);
    campo.pascalCase = String.toPascalCase(campo.campo);
    campo.lowerCase = String.toCamelCase(campo.campo);
    campo.snakeCase = String.toSnakeCase(campo.campo);
    campo.dashCase = String.toDashCase(campo.campo);
    campo.constantCase = String.toConstantCase(campo.campo);
    campo.clientType = this.resolveClientType(campo.tipoUi);
    campo.clientDefaultValue = this.resolveDefaultValue(campo.tipoUi);
    campo.description = campo.descripcion;
    campo.descriptionEn = campo.descripcionEn;
    campo.validations = this.resolveValidations(campo);
    campo.props = this.resolveProps(campo);
    return campo;
  }

  static resolveClientType(tipoUi) {
    if (tipoUi === 'Date') {
      return 'Date';
    }

    if (tipoUi === 'Text' || tipoUi === 'TextArea' || tipoUi === 'ListBox') {
      return 'string';
    }

    if (tipoUi === 'Number') {
      return 'number';
    }

    if (tipoUi === 'ListBox') {
      return 'string';
    }

    if (tipoUi === 'MultiSelect' || tipoUi === 'selectMultiple') {
      return '[]';
    }

    if (tipoUi === 'Radio Button' || tipoUi === 'Boolean') {
      return 'boolean';
    }
    return 'string';
  }

  static resolveDefaultValue(tipoUi) {
    if (tipoUi === 'Date') {
      return 'null';
    }

    if (tipoUi === 'Text' || tipoUi === 'TextArea' || tipoUi === 'ListBox') {
      return "''";
    }

    if (tipoUi === 'Number') {
      return 'null';
    }

    if (tipoUi === 'ListBox') {
      return "''";
    }

    if (tipoUi === 'MultiSelect' || tipoUi === 'selectMultiple') {
      return '[]';
    }

    if (tipoUi === 'Radio Button' || tipoUi === 'Boolean') {
      return 'false';
    }
    return "''";
  }

  static resolveValidations(campo) {
    const validations = {};
    validations.required = campo.requerido;
    validations.requiredValue = campo.requerido;
    if (campo.min) {
      validations.min = campo.min;
    }
    if (campo.max) {
      validations.max = campo.max;
    }
    if (campo.regex) {
      validations.regex = campo.regex;
    }
    return validations;
  }

  static resolveProps(campo) {
    const props = {};
    if (campo.tipoUi === 'TextArea') {
      props.maxCaracteres = campo.maxCaracteres;
    }
    if (campo.tipoUi === 'Date') {
      props.minDate = campo.minDate;
      props.maxDate = campo.maxDate;
    }
    if (campo.tipoUi === 'MultiSelect' || campo.tipoUi === 'selectMultiple') {
      props.minimosRequeridos = campo.minimosRequeridos ? campo.minimosRequeridos : 1;
    }
    return props;
  }
};
