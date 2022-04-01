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

      if (!seccionesOpt.includes(seccion.props.dashCase)) {
        seccionesOpt.push(seccion.props.dashCase);
        // write in entities.ts
        this.fs.copy(context.mainPath, context.mainPath, {
          process: function (content) {
            let regEx = new RegExp(Constants.SERVICE_IMPORT, 'g');
            let importService = `import ${seccion.props.pascalCase}Service from '@/entities/msPerfil/${seccion.props.dashCase}/${seccion.props.dashCase}.service';`;
            let newContent = content.toString().replace(regEx, importService + '\n' + Constants.SERVICE_IMPORT);
            regEx = new RegExp(Constants.SERVICE_INITIALIZATION, 'g');
            let declarationService = `${seccion.props.camelCase}Service: () => new ${seccion.props.pascalCase}Service(),`;
            newContent = newContent.toString().replace(regEx, declarationService + '\n' + Constants.SERVICE_INITIALIZATION);
            return newContent;
          },
        });
        // write in main.ts
        this.fs.copy(context.entitiesPath, context.entitiesPath, {
          process: function (content) {
            let regEx = new RegExp(Constants.ENTITY_ROUTER_IMPORT, 'g');
            let entityRouterImport = `
            // prettier-ignore
            const ${seccion.props.pascalCase} = () => import('@/entities/msPerfil/${seccion.props.dashCase}/${seccion.props.dashCase}.vue');
            ${Constants.ENTITY_ROUTER_IMPORT}
            `;
            let newContent = content.toString().replace(regEx, entityRouterImport);
            regEx = new RegExp(Constants.ENTITY_TO_ROUTER, 'g');
            let entityToRouter = `
            {
              path: '/${seccion.props.dashCase}',
              name: '${seccion.props.pascalCase}',
              component: ${seccion.props.pascalCase},
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
                    <b-dropdown-item to="/${seccion.props.dashCase}" active-class="active">
                      <span>${seccion.props.label}</span>
                    </b-dropdown-item>
                    ${Constants.ENTITY_TO_MENU}
                    `;
            let newContent = content.toString().replace(regEx, entityToMenu);
            return newContent;
          },
        });
      }

      this.fs.copyTpl(this.templatePath('seccion.vue.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.component.ts';
      this.fs.copyTpl(this.templatePath('seccion.component.ts.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.destinationPath + seccion.props.dashCase + '/' + seccion.props.dashCase + '.service.ts';
      this.fs.copyTpl(this.templatePath('seccion.service.ts.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.modelDestinationPath + seccion.props.dashCase + '.model.ts';
      this.fs.copyTpl(this.templatePath('seccion.model.ts.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.i18nPath + '/es/' + seccion.props.dashCase + '.json';
      this.fs.copyTpl(this.templatePath('seccion-es.json.ejs'), this.destinationPath(destination), templateVariables);

      destination = context.i18nPath + '/en/' + seccion.props.dashCase + '.json';
      this.fs.copyTpl(this.templatePath('seccion-en.json.ejs'), this.destinationPath(destination), templateVariables);
    }
    this.config.set('secciones', seccionesOpt);
    this.config.save();
  }
};
