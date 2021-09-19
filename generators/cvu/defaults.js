module.exports = class Defaults {
  static values(config) {
    let context = {};
    context.loginUrl = config.get('login-url') ? config.get('login-url') : 'http://VSMIIC230/generador-api/auth/login';
    context.reporteEjecutivoUrl = config.get('reporte-ejecutivo-url')
      ? config.get('reporte-ejecutivo-url')
      : 'http://vsmiic230:80/cvu/ws/reporteExternoCvu';
    return context;
  }
};
