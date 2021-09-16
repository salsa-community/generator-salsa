'use strict';
const axios = require('axios').default;
var parser = require('fast-xml-parser');
const Constants = require('../util/constants');

module.exports = class CryptoService {
  static async consultar(context) {
    const config = {
      headers: {
        'Content-Type': 'text/xml',
        'x-auth-token': context.token,
      },
    };
    var request = Constants.reporteEjecutoRequest.replace('#{cvu}', context.cvu);
    var response = await axios.post(context.reporteEjecutivoUrl, request, config);
    var soapenv = parser.parse(response.data, Constants.parseOptions);
    return soapenv.Envelope.Body.reporteBytesEjecutivoResponse.reporteBytesReponseDTO.archivo;
  }
};
