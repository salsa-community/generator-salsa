"use strict";
const axios = require('axios').default;
var parser = require('fast-xml-parser');
 

const reporteEjecutivo = 'http://vsmiic230:80/cvu/ws/reporteExternoCvu';

var requestTemplate =
`
<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:rep="http://reporteexternocvu.conacyt.gob.mx">
    <soapenv:Header/>
    <soapenv:Body>
        <rep:reporteBytesEjecutivo>
            <arg0>
                <usuarioAplicativoCvuVO>
                    <numeroCvu>#{cvu}</numeroCvu>
                </usuarioAplicativoCvuVO>
            </arg0>
        </rep:reporteBytesEjecutivo>
    </soapenv:Body>
</soapenv:Envelope>
`

const options = {
    attributeNamePrefix : '',
    attrNodeName: 'attr',
    ignoreNameSpace: true,
    ignoreAttributes: false
};

module.exports = class CvuService {
    static async consultar(context) {
        const config = {
            headers: {
                'Content-Type': 'text/xml',
                'x-auth-token': context.token
            }
        }
        var request =  requestTemplate.replace('#{cvu}', context.cvu);
        var response = await axios.post(reporteEjecutivo, request, config);
        var soapenv = parser.parse(response.data, options );
        return soapenv.Envelope.Body.reporteBytesEjecutivoResponse.reporteBytesReponseDTO.archivo;
    }
};
