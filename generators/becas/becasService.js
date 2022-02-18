'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
const Constants = require('./constants');

module.exports = class guiService {
  static toPrograma(m) {
    let programa = {};
    programa.cvu = m.CVU_INTEGRANTE;
    programa.clave = m.REFERENCIA_PROGRAMA;
    programa.nombre = String.normalize(m.NOMBRE_INTEGRANTE);
    programa.metodologia = m.ABREV_MODALIDAD;
    programa.grado = m.ABREV_GRADO;
    programa.orientacion = m.ABREV_ORIENTACION;
    programa.nivel = '';
    programa.area = m.CVE_AREA;
    programa.campo = String.normalize(m.DESCRIPCION_1);
    programa.disciplina = String.normalize(m.DESCRIPCION_2);
    programa.entidad = this.resolveEntidad(m.NOM_ENT);
    programa.tipoInstitucion = m.DESC_TIPO_INSTITUCION;
    programa.nombreInstitucion = m.NOMBRE;
    programa.estadoSolicitud = m.DESC_ESTADO_SOLICITUD_EVALUACN;
    programa.dictamen = '';
    programa.acreditadoSnp = '';
    programa.tiempoDedicacion = '';
    programa.periodicidad = '';
    programa.numeroBecasHistorico = '';
    programa.numeroBecasFormalizadas = '';
    programa.numeroBecasCanceladas = '';
    programa.orden = '';
    programa.grupo = 214748364;
    return programa;
  }

  static resolveEntidad(nombreEntidad) {
    let entidad = Constants.ENTITY_MAPPER[nombreEntidad];
    if (entidad) {
      return entidad.clave;
    }
    return 'SIN EQUIVALENTE {' + nombreEntidad + '}';
  }
};
