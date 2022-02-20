'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
const Constants = require('./constants');
const Instituciones = require('./institucionesCatalog');

module.exports = class guiService {
  static toPrograma(m) {
    let programa = {};
    programa.cvu = m.CVU_INTEGRANTE;
    programa.clave = m.REFERENCIA_PROGRAMA;
    programa.nombre = String.normalize(m.NOMBRE_PROGRAMA);
    programa.nombreAspirante = String.normalize(m.NOMBRE_INTEGRANTE);
    programa.metodologia = m.ABREV_MODALIDAD;
    programa.grado = m.ABREV_GRADO;
    programa.orientacion = m.ABREV_ORIENTACION;
    programa.nivel = '';
    programa.area = m.CVE_AREA;
    programa.campo = String.normalize(m.DESCRIPCION_1);
    programa.disciplina = String.normalize(m.DESCRIPCION_2);
    programa.entidad = this.resolveEntidad(m.NOM_ENT);
    programa.tipoInstitucion = this.resolveTipoInstitucion(m.CVE_INSTITUCION);
    programa.nombreInstitucion = m.NOMBRE;
    programa.estadoSolicitud = m.DESC_ESTADO_SOLICITUD_EVALUACN;
    programa.dictamen = '';
    programa.acreditadoSnp = this.resolveAcreditadoSnp(m.POR_CONVENIO);
    programa.tiempoDedicacion = '';
    programa.periodicidad = '';
    programa.numeroBecasHistorico = '';
    programa.numeroBecasFormalizadas = '';
    programa.numeroBecasCanceladas = '';
    programa.orden = 214748364;
    programa.grupo = 'Z_NO_RANKED';
    return programa;
  }

  static resolveEntidad(nombreEntidad) {
    let entidad = Constants.ENTITY_MAPPER[nombreEntidad];
    if (entidad) {
      return entidad.clave;
    }
    return 'SIN EQUIVALENTE {' + nombreEntidad + '}';
  }
  static resolveAcreditadoSnp(isConvenio) {
    if (isConvenio) {
      console.log(isConvenio);
      return isConvenio === '1' || isConvenio === 1;
    } else {
      return false;
    }
  }
  static resolveTipoInstitucion(clave) {
    let inst = Instituciones.CATALOG[clave];
    if (inst) {
      return inst.CVE_TIPO === 1 ? 'Puv' : 'Priv';
    } else {
      return 'NO ENCONTRADA';
    }
  }
};
