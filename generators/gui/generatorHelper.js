'use strict';

const Constants = require('./constants');

module.exports = class generatorHelper {
  static createDefaultFiles(context) {
    let destination = context.apiPath;
    context.generator.fs.copyTpl(context.generator.templatePath('api/api.yml.ejs'), context.generator.destinationPath(destination), {});
  }

  static printJson(context) {
    context.generator.fs.copyTpl(context.generator.templatePath('default.json.ejs'), context.generator.destinationPath('model.json'), {
      model: JSON.stringify(context.model, null, 2),
    });
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

  static updateApi(context, page, exclude) {
    let properties = this.resolveProperties(context, page);
    context.generator.fs.copy(context.apiPath, context.apiPath, {
      process: content => {
        let regEx = '';
        if (!(exclude && exclude.paths)) {
          regEx = new RegExp(Constants.API_PATHS, 'g');
          let pathDeclaration = this.pathDeclaration(page);
          content = content.toString().replace(regEx, pathDeclaration);
        }

        if (!(exclude && exclude.schemas)) {
          regEx = new RegExp(Constants.API_SCHEMA, 'g');
          let schemaDeclaration = this.schemaDeclaration(page, properties);
          content = content.toString().replace(regEx, schemaDeclaration);
        }

        if (!(exclude && exclude.tags)) {
          regEx = new RegExp(Constants.API_TAGS, 'g');
          let tagsDeclaration = this.tagsDeclaration(page, properties);
          content = content.toString().replace(regEx, tagsDeclaration);
        }

        if (!(exclude && exclude.responses)) {
          regEx = new RegExp(Constants.API_RESPONSES, 'g');
          let responsesDeclaration = this.responsesDeclaration(page);
          content = content.toString().replace(regEx, responsesDeclaration);
        }

        return content;
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
          $ref: '#/components/schemas/BaseCatalogo'`;
      } else if (properties[key].type == 'array') {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          type: array
          items:
            $ref: '#/components/schemas/${properties[key].items.name.pascalCase}'`;

        if (!context.model.entities[properties[key].items.name.camelCase]) {
          let exclude = { responses: true, paths: true };
          this.updateApi(context, properties[key].items, exclude);
          context.model.entities[properties[key].items.name.camelCase] = true;
        }
      } else if (properties[key].type == 'image') {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          allOf:
            - $ref: '#/components/schemas/Archivo'`;
      } else if (properties[key].type == 'date') {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          format: date
          type: string`;
      } else if (properties[key].type == 'object') {
        prop =
          prop +
          `
        ${properties[key].name.camelCase}:
          description: ${properties[key].name.camelCase}
          $ref: '#/components/schemas/${properties[key].name.pascalCase}'`;

          let exclude = { responses: true, paths: true };
          this.updateApi(context, properties[key], exclude);
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
    return `/${page.name.dashCase}:
    get:
      tags:
        - ${page.name.camelCase}
      operationId: get${page.name.pascalCase}
      description: Obtiene la información de ${page.name.pascalCase} de usuario
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
    post:
      tags:
        - ${page.name.camelCase}
      operationId: save${page.name.pascalCase}
      description: Almacena información de ${page.name.pascalCase} de usuario
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/${page.name.pascalCase}'
        required: true
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
  /${page.name.dashCase}/{id}:
      get:
        tags:
          - ${page.name.camelCase}
        operationId: get${page.name.pascalCase}ById
        description: Obtiene la información de ${page.name.pascalCase}
        parameters:
        - name: id
          in: path
          description: id del usuario
          required: true
          schema:
            type: integer
            format: int64
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
      put:
        tags:
          - ${page.name.camelCase}
        operationId: update${page.name.pascalCase}ById
        description: Obtiene la información de ${page.name.pascalCase}
        parameters:
        - name: id
          in: path
          description: id del usuario
          required: true
          schema:
            type: integer
            format: int64
        requestBody:
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/${page.name.pascalCase}'
          required: true
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
  ${Constants.API_PATHS}`;
  }
};
