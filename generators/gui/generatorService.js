'use strict';

const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
var beautify = require('gulp-beautify');
const fsreader = require('fs');
const csv = require('csv-string');
var inquirer = require('inquirer');
var dateFormat = require('dateformat');
const Defaults = require('./defaults');
const GuiService = require('./guiService');
const Constants = require('./constants');

module.exports = class generatorService {
  static doProcess(context) {
    for (const seccionKey in context.secciones) {
      let templateVariables = GuiService.defaultVariables(context.secciones, seccionKey);
      let seccion = context.secciones[seccionKey];

      for (const mayBeSubseccion in seccion) {
        if (mayBeSubseccion != 'props') {
          let subtemplateVariables = GuiService.defaultSubVariables(context.secciones, seccionKey, mayBeSubseccion);
          let subseccion = context.secciones[seccionKey][mayBeSubseccion];

          this.writeEntitiesFiles(context, seccion, subseccion);
          this.writeUi(context, seccion, subtemplateVariables);
          this.writeComponentTs(context, seccion, subtemplateVariables);
        }
      }

      this.writeI18nFiles(context, seccion, templateVariables);
    }
    context.generator.config.set('secciones', context.seccionesOpt);
    context.generator.config.save();
  }

  static writeEntitiesMenuVue(context, seccion, subseccion) {
    context.generator.fs.copy(context.entitiesMenuPath, context.entitiesMenuPath, {
      process: function (content) {
        let regEx = new RegExp(Constants.ENTITY_TO_MENU, 'g');
        let entityToMenu = `
        <b-dropdown-item to="/${seccion.props.dashCase}/${subseccion.props.dashCase}" active-class="active">
        <span v-text="$t('${seccion.props.dashCase}.${subseccion.props.dashCase}.title')">${subseccion.props.label}</span>
        </b-dropdown-item>
        ${Constants.ENTITY_TO_MENU}
        `;
        return content.toString().replace(regEx, entityToMenu);
      },
    });
  }

  static writeEntitiesTs(context, seccion, subseccion) {
    context.generator.fs.copy(context.entitiesPath, context.entitiesPath, {
      process: function (content) {
        let regEx = new RegExp(Constants.ENTITY_ROUTER_IMPORT, 'g');
        let entityRouterImport = `
        // prettier-ignore
        const ${subseccion.props.pascalCase} = () => import('@/entities/msPerfil/${seccion.props.dashCase}/${subseccion.props.dashCase}/${subseccion.props.dashCase}.vue');
        ${Constants.ENTITY_ROUTER_IMPORT}
        `;
        let newContent = content.toString().replace(regEx, entityRouterImport);
        regEx = new RegExp(Constants.ENTITY_TO_ROUTER, 'g');
        let entityToRouter = `
        {
          path: '/${seccion.props.dashCase}/${subseccion.props.dashCase}',
          name: '${subseccion.props.pascalCase}',
          component: ${subseccion.props.pascalCase},
        },
        ${Constants.ENTITY_TO_ROUTER}
        `;
        newContent = newContent.toString().replace(regEx, entityToRouter);
        return newContent;
      },
    });
  }

  static writeEntitiesFiles(context, seccion, subseccion) {
    if (!context.seccionesOpt.includes(subseccion.props.dashCase)) {
      context.seccionesOpt.push(subseccion.props.dashCase);
      this.writeEntitiesTs(context, seccion, subseccion);
      this.writeEntitiesMenuVue(context, seccion, subseccion);
    }
  }

  static writeUi(context, seccion, subtemplateVariables) {
    let destination =
      context.destinationPath +
      seccion.props.dashCase +
      '/' +
      subtemplateVariables.subSeccion.props.dashCase +
      '/' +
      subtemplateVariables.subSeccion.props.dashCase +
      '.vue';
    context.generator.fs.copyTpl(
      context.generator.templatePath('subseccion.vue.ejs'),
      context.generator.destinationPath(destination),
      subtemplateVariables
    );
  }

  static writeComponentTs(context, seccion, subtemplateVariables) {
    let destination =
      context.destinationPath +
      seccion.props.dashCase +
      '/' +
      subtemplateVariables.subSeccion.props.dashCase +
      '/' +
      subtemplateVariables.subSeccion.props.dashCase +
      '.component.ts';
    context.generator.fs.copyTpl(
      context.generator.templatePath('subseccion.component.ts.ejs'),
      context.generator.destinationPath(destination),
      subtemplateVariables
    );
  }

  static writeI18nFiles(context, seccion, templateVariables) {
    let destination = context.i18nPath + '/es/' + seccion.props.dashCase + '.json';
    context.generator.fs.copyTpl(
      context.generator.templatePath('seccion-es.json.ejs'),
      context.generator.destinationPath(destination),
      templateVariables
    );

    destination = context.i18nPath + '/en/' + seccion.props.dashCase + '.json';
    context.generator.fs.copyTpl(
      context.generator.templatePath('seccion-en.json.ejs'),
      context.generator.destinationPath(destination),
      templateVariables
    );
  }
};
