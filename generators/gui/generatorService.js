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
  static doProcess(context, generator) {
    let secciones = context.secciones;
    let seccionesOpt = context.seccionesOpt;

    for (const seccionKey in secciones) {
      let templateVariables = GuiService.defaultVariables(secciones, seccionKey);
      let seccion = secciones[seccionKey];
      let destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.vue';

      for (const mayBeSubseccion in seccion) {
        if (mayBeSubseccion != 'props') {
          let subtemplateVariables = GuiService.defaultSubVariables(secciones, seccionKey, mayBeSubseccion);
          let subseccion = secciones[seccionKey][mayBeSubseccion];

          if (!seccionesOpt.includes(subseccion.props.dashCase)) {
            seccionesOpt.push(subseccion.props.dashCase);
            // write in entities.ts
            generator.fs.copy(context.entitiesPath, context.entitiesPath, {
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
            // write in entities-menu.vue
            generator.fs.copy(context.entitiesMenuPath, context.entitiesMenuPath, {
              process: function (content) {
                let regEx = new RegExp(Constants.ENTITY_TO_MENU, 'g');
                let entityToMenu = `
    <b-dropdown-item to="/${seccion.props.dashCase}/${subseccion.props.dashCase}" active-class="active">
      <span v-text="$t('${seccion.props.dashCase}.${subseccion.props.dashCase}.title')">${subseccion.props.label}</span>
    </b-dropdown-item>
    ${Constants.ENTITY_TO_MENU}
    `;
                let newContent = content.toString().replace(regEx, entityToMenu);
                return newContent;
              },
            });
          }

          destination =
            context.destinationPath +
            seccion.props.dashCase +
            '/' +
            subtemplateVariables.subSeccion.props.dashCase +
            '/' +
            subtemplateVariables.subSeccion.props.dashCase +
            '.vue';
          generator.fs.copyTpl(generator.templatePath('subseccion.vue.ejs'), generator.destinationPath(destination), subtemplateVariables);

          destination =
            context.destinationPath +
            seccion.props.dashCase +
            '/' +
            subtemplateVariables.subSeccion.props.dashCase +
            '/' +
            subtemplateVariables.subSeccion.props.dashCase +
            '.component.ts';
          generator.fs.copyTpl(
            generator.templatePath('subseccion.component.ts.ejs'),
            generator.destinationPath(destination),
            subtemplateVariables
          );
        }
      }

      // destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.component.ts';
      // generator.fs.copyTpl(generator.templatePath('seccion.component.ts.ejs'), generator.destinationPath(destination), templateVariables);

      // destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.service.ts';
      // generator.fs.copyTpl(generator.templatePath('seccion.service.ts.ejs'), generator.destinationPath(destination), templateVariables);

      // destination = context.modelDestinationPath + seccion.props.dashCase + '.model.ts';
      // generator.fs.copyTpl(generator.templatePath('seccion.model.ts.ejs'), generator.destinationPath(destination), templateVariables);

      destination = context.i18nPath + '/es/' + seccion.props.dashCase + '.json';
      generator.fs.copyTpl(generator.templatePath('seccion-es.json.ejs'), generator.destinationPath(destination), templateVariables);

      destination = context.i18nPath + '/en/' + seccion.props.dashCase + '.json';
      generator.fs.copyTpl(generator.templatePath('seccion-en.json.ejs'), generator.destinationPath(destination), templateVariables);
    }
  }
};
