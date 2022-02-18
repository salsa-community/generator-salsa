module.exports = class Defaults {
  static values(config) {
    let context = {};
    context.uiDescFile = config.get('ui-descripcion') ? config.get('ui-descripcion') : 'ui-descripcion.json';
    return context;
  }
};
