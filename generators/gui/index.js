var Generator = require('yeoman-generator');

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

module.exports = class extends Generator {
  writing() {
    let context = {};
    context.uiDescFile = this.destinationPath('ui-descripcion.json');
    context.destinationPath = this.destinationPath('src/main/webapp/app/entities/msPerfil/');
    context.modelDestinationPath = this.destinationPath('src/main/webapp/app/shared/model/msPerfil/');
    context.entitiesPath = this.destinationPath('src/main/webapp/app/router/entities.ts');
    context.mainPath = this.destinationPath('src/main/webapp/app/main.ts');
    context.entitiesMenuPath = this.destinationPath('src/main/webapp/app/entities/entities-menu.vue');
    context.i18nPath = this.destinationPath('src/main/webapp/i18n');
    let campos = GuiService.resolveJson(context);
    let secciones = GuiService.resolveSecciones(campos);
    let seccionesOpt = this.config.get('secciones');
    if (!seccionesOpt) {
      seccionesOpt = [];
    }
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
            this.fs.copy(context.entitiesPath, context.entitiesPath, {
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
            this.fs.copy(context.entitiesMenuPath, context.entitiesMenuPath, {
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

          destination = context.destinationPath + seccion.props.dashCase + '/' + subtemplateVariables.subSeccion.props.dashCase + '/' + subtemplateVariables.subSeccion.props.dashCase + '.vue';
          this.fs.copyTpl(this.templatePath('subseccion.vue.ejs'), this.destinationPath(destination), subtemplateVariables);

          destination = context.destinationPath + seccion.props.dashCase + '/' + subtemplateVariables.subSeccion.props.dashCase + '/' + subtemplateVariables.subSeccion.props.dashCase + '.component.ts';
          this.fs.copyTpl(this.templatePath('subseccion.component.ts.ejs'), this.destinationPath(destination), subtemplateVariables);
        }
      }

      // destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.component.ts';
      // this.fs.copyTpl(this.templatePath('seccion.component.ts.ejs'), this.destinationPath(destination), templateVariables);

      // destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.service.ts';
      // this.fs.copyTpl(this.templatePath('seccion.service.ts.ejs'), this.destinationPath(destination), templateVariables);

      // destination = context.modelDestinationPath + seccion.props.dashCase + '.model.ts';
      // this.fs.copyTpl(this.templatePath('seccion.model.ts.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.i18nPath + '/es/' + seccion.props.dashCase + '.json';
      this.fs.copyTpl(this.templatePath('seccion-es.json.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.i18nPath + '/en/' + seccion.props.dashCase + '.json';
      this.fs.copyTpl(this.templatePath('seccion-en.json.ejs'), this.destinationPath(destination), templateVariables);
    }
    this.config.set('secciones', seccionesOpt);
    this.config.save();
  }
};
