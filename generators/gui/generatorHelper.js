'use strict';

const Constants = require('./constants');

module.exports = class generatorHelper {
  static createDefaultFiles(context) {
    let destination = context.apiPath;
    context.generator.fs.copyTpl(context.generator.templatePath('api/api.yml.ejs'), context.generator.destinationPath(destination), {});
  }

  static updateEntitiesMenuVue(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    context.generator.fs.copy(context.entitiesMenuPath, context.entitiesMenuPath, {
      process: function (content) {
        let regEx = new RegExp(Constants.ENTITY_TO_MENU, 'g');
        let entityToMenu = `<b-dropdown-item to="/${basePath}" active-class="active">
      <span v-text="$t('${page.path.dashCase}.title')">${page.title}</span>
    </b-dropdown-item>
    ${Constants.ENTITY_TO_MENU}`;
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
    context.generator.fs.copyTpl(context.generator.templatePath('page.vue.ejs'), context.generator.destinationPath(destination), {
      page: page,
    });
  }

  static writeComponentTs(context, page) {
    let basePath = page.path.dashCase.replace(/\./g, '/');
    let componentFilePath = basePath + '/' + page.name.dashCase;
    let destination = context.destinationPath + componentFilePath + '.component.ts';
    context.generator.fs.copyTpl(context.generator.templatePath('page.component.ts.ejs'), context.generator.destinationPath(destination), {
      page: page,
    });
  }

  static writeI18nFiles(context, page) {
    let destination = context.i18nPath + '/es/' + page.name.dashCase + '.json';
    context.generator.fs.copyTpl(context.generator.templatePath('i18n/page_es.json.ejs'), context.generator.destinationPath(destination), {
      page: page,
    });

    destination = context.i18nPath + '/en/' + page.name.dashCase + '.json';
    context.generator.fs.copyTpl(context.generator.templatePath('i18n/page_en.json.ejs'), context.generator.destinationPath(destination), {
      page: page,
    });
  }

  static updateApi(context, page) {
    let properties = this.resolveProperties(context, page);
    context.generator.fs.copy(context.apiPath, context.apiPath, {
      process: content => {
        let regEx = new RegExp(Constants.API_PATHS, 'g');
        let pathDeclaration = this.pathDeclaration(page);
        content = content.toString().replace(regEx, pathDeclaration);

        regEx = new RegExp(Constants.API_SCHEMA, 'g');
        let schemaDeclaration = this.schemaDeclaration(page, properties);
        content = content.toString().replace(regEx, schemaDeclaration);

        regEx = new RegExp(Constants.API_TAGS, 'g');
        let tagsDeclaration = this.tagsDeclaration(page, properties);
        content = content.toString().replace(regEx, tagsDeclaration);

        regEx = new RegExp(Constants.API_RESPONSES, 'g');
        let responsesDeclaration = this.responsesDeclaration(page);
        return content.toString().replace(regEx, responsesDeclaration);
      },
    });
  }

  static responsesDeclaration(page) {
    return `${page.name.pascalCase}Response:
      content:
          application/json:
            schema:
              $ref: '#/components/schemas/${page.name.pascalCase}'
      description: ${page.name.pascalCase}
    ${Constants.API_RESPONSES}`;
  }

  static tagsDeclaration(page) {
    return `- name: ${page.name.camelCase}
    description: ${page.name.pascalCase}
  ${Constants.API_TAGS}`;
  }

  static resolveProperties(context, page) {
    let prop = `${page.name.pascalCase}:
      description: ${page.name.pascalCase}
      properties:`;
    return this.iterateProperties(context, prop, page.properties);
  }

  static iterateProperties(context, prop, properties) {
    for (const key in properties) {
      if (properties[key].type == 'catalog') {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          allOf:
            - $ref: '#/components/schemas/BaseCatalogo'`;
      } else if (properties[key].type == 'array') {
        prop =
          prop +
          `
          items:
            $ref: '#/components/schemas/${properties[key].items.name.pascalCase}'`;

        if (!context.model.entities[properties[key].items.name.camelCase]) {
          this.updateApi(context, properties[key].items);
          context.model.entities[properties[key].items.name.camelCase] = true;
        }
      } else if (properties[key].type == 'image') {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          allOf:
            - $ref: '#/components/schemas/File'`;
      } else {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          type: ${properties[key].type}`;
      }
    }
    return prop;
  }

  static schemaDeclaration(page, properties) {
    return `${properties}
    ${Constants.API_SCHEMA}`;
  }

  static pathDeclaration(page) {
    return `/${page.name.plural}:
    get:
      tags:
        - ${page.name.camelCase}
      responses:
        '200':
          $ref: '#/components/responses/${page.name.pascalCase}Response'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
        '429':
          $ref: '#/components/responses/TooManyRequests'
        default:
          $ref: '#/components/responses/UnexpectedError'
      operationId: get${page.name.pascalCase}
      description: Obtiene la información de ${page.name.pascalCase} de usuario
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/${page.name.pascalCase}'
        required: true
      tags:
        - ${page.name.camelCase}
      responses:
        '201':
          $ref: '#/components/responses/${page.name.pascalCase}Response'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
        '429':
          $ref: '#/components/responses/TooManyRequests'
        default:
          $ref: '#/components/responses/UnexpectedError'
      operationId: save${page.name.pascalCase}
      description: Almacena información de ${page.name.pascalCase} de usuario
  ${Constants.API_PATHS}`;
  }
};
