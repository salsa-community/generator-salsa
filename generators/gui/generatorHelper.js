'use strict';

const Constants = require('./constants');

module.exports = class generatorHelper {
  static writeEntitiesMenuVue(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    context.generator.fs.copy(context.entitiesMenuPath, context.entitiesMenuPath, {
      process: function (content) {
        let regEx = new RegExp(Constants.ENTITY_TO_MENU, 'g');
        let entityToMenu = `
        <b-dropdown-item to="/${basePath}" active-class="active">
        <span v-text="$t('${page.path.dashCase}.title')">${page.title}</span>
        </b-dropdown-item>
        ${Constants.ENTITY_TO_MENU}
        `;
        return content.toString().replace(regEx, entityToMenu);
      },
    });
  }

  static writeEntitiesTs(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let vueFilePath = basePath + '/' + page.name.dashCase;
    context.generator.fs.copy(context.entitiesPath, context.entitiesPath, {
      process: function (content) {
        let regEx = new RegExp(Constants.ENTITY_ROUTER_IMPORT, 'g');
        let entityRouterImport = `
        // prettier-ignore
        const ${page.name.pascalCase} = () => import('@/entities/msPerfil/${vueFilePath}.vue');
        ${Constants.ENTITY_ROUTER_IMPORT}
        `;
        let newContent = content.toString().replace(regEx, entityRouterImport);
        regEx = new RegExp(Constants.ENTITY_TO_ROUTER, 'g');
        let entityToRouter = `
        {
          path: '/${basePath}',
          name: '${page.name.pascalCase}',
          component: ${page.name.pascalCase},
        },
        ${Constants.ENTITY_TO_ROUTER}
        `;
        newContent = newContent.toString().replace(regEx, entityToRouter);
        return newContent;
      },
    });
  }

  static writeEntitiesFiles(context, page) {
    if (!context.seccionesOpt.includes(page.name.dashCase)) {
      context.seccionesOpt.push(page.name.dashCase);
      this.writeEntitiesTs(context, page);
      this.writeEntitiesMenuVue(context, page);
    }
  }

  static writeUi(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let vueFilePath = basePath + '/' + page.name.dashCase;
    let destination = context.destinationPath + vueFilePath + '.vue';
    context.generator.fs.copyTpl(
      context.generator.templatePath('subseccion.vue.ejs'),
      context.generator.destinationPath(destination),
      page
    );
  }

  static writeComponentTs(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let componentFilePath = basePath + '/' + page.name.dashCase;
    let destination = context.destinationPath + componentFilePath + '.component.ts';
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
