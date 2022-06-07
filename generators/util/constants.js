module.exports = {
  reporteEjecutoRequest: `
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
    `,
  parseOptions: {
    attributeNamePrefix: '',
    attrNodeName: 'attr',
    ignoreNameSpace: true,
    ignoreAttributes: false,
  },
  secciones: [
    {
      etiqueta: 'Datos Generales',
      camelCase: 'datosGenerales',
      dashCase: 'datos-generales',
    },
    {
      etiqueta: 'Formación Academica',
      camelCase: 'formacionAcademica',
      dashCase: 'formacion-academica',
    },
    {
      etiqueta: 'Trayectoria Profesional',
      camelCase: 'trayectoriaProfesional',
      dashCase: 'trayectoria-profesional',
    },
    {
      etiqueta: 'Producción científica, tecnológica y de innovación',
      camelCase: 'produccionCientifica',
      dashCase: 'produccion-cientifica',
    },
    {
      etiqueta: 'Formación de Capital Humano',
      camelCase: 'formacionCapitalHumano',
      dashCase: 'formacion-capital-humano',
    },
    {
      etiqueta: 'Comunicación pública de la ciencia, tecnológica y de innovación',
      camelCase: 'comunicacion',
      dashCase: 'comunicacion',
    },
    {
      etiqueta: 'Vinculación',
      camelCase: 'vinculacion',
      dashCase: 'vinculacion',
    },
    {
      etiqueta: 'Evaluaciones',
      camelCase: 'evaluaciones',
      dashCase: 'evaluadores',
    },
    {
      etiqueta: 'Premios y Distinciones',
      camelCase: 'premiosDistinciones',
      dashCase: 'premios-distinciones',
    },
    {
      etiqueta: 'Lenguas e Idiomas',
      camelCase: 'lenguasIdiomas',
      dashCase: 'lenguas-idiomas',
    },
  ],
};
