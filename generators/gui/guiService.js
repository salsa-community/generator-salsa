'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
module.exports = class guiService {
  static destinationPath(seccion) {
    return context.destinationComponentPath + seccion.dashCase + '/' + seccion.dashCase + '.vue';
  }
  static resolveJson(context) {
    return JSON.parse(fsreader.readFileSync(context.uiDescFile));
  }
  static resolveSecciones(campos) {
    let secciones = {};
    campos.forEach(campo => {
      let seccion = String.toCamelCase(campo.seccion);
      let subseccion = String.toCamelCase(campo.subseccion);
      if (!secciones[seccion]) {
        secciones[seccion] = this.defaultSeccion(campo.seccion);
      }
      if (!secciones[seccion][subseccion]) {
        secciones[seccion][subseccion] = this.defaultSubseccion(campo.subseccion);
      }
      secciones[seccion][subseccion].campos.push(this.formatCampo(campo));
    });
    return secciones;
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
    campo.pascalCase = String.toPascalCase(campo.campo);
    campo.lowerCase = String.toCamelCase(campo.campo);
    campo.snakeCase = String.toSnakeCase(campo.campo);
    campo.dashCase = String.toDashCase(campo.campo);
    return campo;
  }
};
