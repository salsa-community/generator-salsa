'use strict';

const Constants = require('./constants');

module.exports = class generatorHelper {
  static updateEntitiesMenuVue(context, page) {
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

  static updateEntitiesTs(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let vueFilePath = basePath + '/' + page.name.dashCase;
    context.generator.fs.copy(context.entitiesPath, context.entitiesPath, {
      process: content => {
        let regEx = new RegExp(Constants.ENTITY_ROUTER_IMPORT, 'g');
        let entityRouterImport = this.routerDeclaration(page, vueFilePath);
        let newContent = content.toString().replace(regEx, entityRouterImport);
        regEx = new RegExp(Constants.ENTITY_TO_ROUTER, 'g');
        let entityToRouter = this.entityRouterDeclaration(page, basePath);
        newContent = newContent.toString().replace(regEx, entityToRouter);
        return newContent;
      },
    });
  }

  static entityRouterDeclaration(page, basePath) {
    return `{
      path: '/${basePath}',
      name: '${page.name.pascalCase}',
      component: ${page.name.pascalCase},
    },
    ${Constants.ENTITY_TO_ROUTER}`;
  }

  static routerDeclaration(page, vueFilePath) {
    return `\n// prettier-ignore\nconst ${page.name.pascalCase} = () => import('@/entities/msPerfil/${vueFilePath}.vue');
${Constants.ENTITY_ROUTER_IMPORT}`;
  }

  static updateEntitiesFiles(context, page) {
    if (!context.seccionesOpt.includes(page.name.dashCase)) {
      context.seccionesOpt.push(page.name.dashCase);
      this.updateEntitiesTs(context, page);
      this.updateEntitiesMenuVue(context, page);
    }
  }

  static writeUi(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let vueFilePath = basePath + '/' + page.name.dashCase;
    let destination = context.destinationPath + vueFilePath + '.vue';
    context.generator.fs.copyTpl(context.generator.templatePath('page.vue.ejs'), context.generator.destinationPath(destination), page);
  }

  static writeComponentTs(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let componentFilePath = basePath + '/' + page.name.dashCase;
    let destination = context.destinationPath + componentFilePath + '.component.ts';
    context.generator.fs.copyTpl(
      context.generator.templatePath('page.component.ts.ejs'),
      context.generator.destinationPath(destination),
      page
    );
  }

  static writeI18nFiles(context, page) {
    let destination = context.i18nPath + '/es/' + page.name.dashCase + '.json';
    context.generator.fs.copyTpl(
      context.generator.templatePath('i18n/page_es.json.ejs'),
      context.generator.destinationPath(destination),
      page
    );

    destination = context.i18nPath + '/en/' + page.name.dashCase + '.json';
    context.generator.fs.copyTpl(
      context.generator.templatePath('i18n/page_en.json.ejs'),
      context.generator.destinationPath(destination),
      page
    );
  }
};
