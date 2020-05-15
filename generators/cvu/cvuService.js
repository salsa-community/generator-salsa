"use strict";
const axios = require('axios').default;
var parser = require('fast-xml-parser');
const Constants = require('../util/constants');
const reporteEjecutivo = 'http://vsmiic230:80/cvu/ws/reporteExternoCvu';

module.exports = class CvuService {
    static async consultar(context) {
        const config = {
            headers: {
                'Content-Type': 'text/xml',
                'x-auth-token': context.token
            }
        }
        var request =  Constants.reporteEjecutoRequest.replace('#{cvu}', context.cvu);
        var response = await axios.post(reporteEjecutivo, request, config);
        var soapenv = parser.parse(response.data, Constants.parseOptions );
        return soapenv.Envelope.Body.reporteBytesEjecutivoResponse.reporteBytesReponseDTO.archivo;
    }
};
