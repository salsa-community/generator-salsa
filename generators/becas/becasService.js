'use strict';

const String = require('../util/strings');

const fsreader = require('fs');
const SECCION_PROP = 'seccion';
const Instituciones = require('./institucionesCatalog');
var Generator = require('yeoman-generator');
const ora = require('ora');
const chalk = require('chalk');
const prompts = require('prompts');
const terminalLink = require('terminal-link');
const { info, warn } = require('prettycli');
const cheerio = require('cheerio');
const $ = cheerio.load('<h2 class="title">Hello world</h2>');
var beautify = require('gulp-beautify');
var inquirer = require('inquirer');
var dateFormat = require('dateformat');
const Defaults = require('./defaults');
const BecasService = require('./becasService');
const Constants = require('./constants');
const axios = require('axios');
const fs = require('fs');
const csv = require('csv-parser');
const Logger = require('../util/logger');
const Catalogos = require('../util/distribucion/constants');
const { CATALOG } = require('./institucionesCatalog');

const CAMPOS = require('../../campos.json');
const DISCIPLINAS = require('../../disciplinas.json');

const moment = require('moment');
module.exports = class guiService {
  static log = Logger.getLogger('rules-warning');
  static toPrograma(m, spinner) {
    let programa = {};
    programa.id = m.REFERENCIA_SOLICITUD + '_' + m.CVU_INTEGRANTE;
    programa.cvu = m.CVU_INTEGRANTE;
    programa.clave = m.REFERENCIA_PROGRAMA;
    programa.claveTipoPrograma = m.CVE_TIPO_PROGRAMA;
    programa.promedioRecuperado = m.PROMEDIO_RECUPERADO ? parseFloat(m.PROMEDIO_RECUPERADO) : m.PROMEDIO_RECUPERADO;
    programa.periodoLectivo = String.normalize(m.DESC_PERIODO_LECTIVO);
    programa.nombre = String.normalize(m.NOMBRE_PROGRAMA);
    programa.nombreAspirante = String.normalize(m.NOMBRE_INTEGRANTE);
    programa.metodologia = m.ABREV_MODALIDAD;
    programa.grado = m.ABREV_GRADO;
    programa.orientacion = m.ABREV_ORIENTACION;
    programa.nivel = '';
    programa.correo = m.CONTACTO_PRINCIPAL;
    // programa.area = this.resolveArea(m.CVE_AREA);
    programa.campo = this.resolveCampo(m.DESCRIPCION_1, spinner);
    programa.disciplina = this.resolveDisciplina(m.DESCRIPCION_2, spinner);
    programa.entidad = this.resolveEntidad(m.NOM_ENT);
    programa.claveInstitucion = m.CVE_INSTITUCION;
    programa.tipoInstitucion = this.resolveTipoInstitucion(m.CVE_INSTITUCION, programa.id);
    programa.nombreInstitucion = m.NOMBRE;
    programa.estado = String.normalize(m.DESC_ESTADO_SOLICITUD_EVALUACN);
    programa.dictamen = '';
    programa.acreditadoSnp = this.resolveAcreditadoSnp(m.POR_CONVENIO);
    programa.tiempoDedicacion = '';
    programa.periodicidad = '';
    programa.numeroBecasHistorico = '';
    programa.numeroBecasFormalizadas = '';
    programa.numeroBecasCanceladas = '';
    programa.inicioEstancia = this.formatDate(m.INICIO_ESTUDIOS);
    programa.finEstancia = this.formatDate(m.FIN_ESTUDIOS);
    programa.montoMensual = this.resolveMontoMensual(m.ABREV_GRADO);
    programa.orden = 214748364;
    programa.grupo = 'Z_NO_EVALUADO';
    programa.estadoSolicitud = String.normalize(m.DESC_ESTADO_SOLICITUD);
    this.verifyFechas(programa);
    return programa;
  }

  static toProyecto(p, spinner) {
    let proyecto = {};
    proyecto.id = String.normalizeId(p.cve_convocatoria) + '-' + p.cve_proyecto;
    proyecto.cveFondoOrigen = p.cve_fondo_origen;
    proyecto.fondoOrigen = p.fondo_origen;
    proyecto.partidaPresupuestal = p.partida_presupuestal;
    proyecto.fondoConvocatoria = p.fondo_convocatoria;
    proyecto.modalidadApoyo = p.modalidad_apoyo;
    proyecto.objetivoConvocatoria = p.objetivo_convocatoria;
    proyecto.numSolicitud = p.num_solicitud;
    proyecto.cveProyecto = p.cve_proyecto;
    proyecto.tituloProyecto = p.titulo_proyecto;
    proyecto.objetivoProgramaDondeIncide = p.objetivo_programa_donde_incide;
    proyecto.objetivoProyecto = p.objetivo_proyecto;
    proyecto.dirAdjuntaUnidad = p.dir_adjunta_unidad;
    proyecto.dirAreaRespConvocatoria = p.dir_area_resp_convocatoria;
    proyecto.nombreBeneficiario = p.nombre_beneficiario;
    proyecto.nombreRespAdministrativo = p.nombre_resp_administrativo;
    proyecto.nombreRespTecnico = p.nombre_resp_tecnico;
    proyecto.nombreRespLegal = p.nombre_resp_legal;
    proyecto.entFederativaBeneficiario = p.ent_federativa_beneficiario;
    proyecto.entFederativaProyoecto = p.ent_federativa_proyoecto;
    proyecto.rfc = p.rfc;
    proyecto.modalidad = p.modalidad;
    proyecto.tipoBeneficiario = p.tipo_beneficiario;
    proyecto.areaConocimiento = p.area_conocimiento;
    proyecto.ejeRector = p.eje_rector;
    proyecto.descProyecto = p.desc_proyecto;
    proyecto.institucionesParticipantes = p.instituciones_participantes;
    proyecto.secretariaTecnicaResp = p.secretaria_tecnica_resp;
    proyecto.cveConvocatoria = p.cve_convocatoria;
    proyecto.nombreConvocatoria = p.nombre_convocatoria;
    proyecto.fechaAprobacionJuridica = this.resolveDate(p.fecha_aprobacion_juridica);
    proyecto.fechaAprobacionCta = this.resolveDate(p.fecha_aprobacion_cta);
    proyecto.fechaPublicacion = this.resolveDate(p.fecha_publicacion);
    proyecto.numSesionCtaConvocatoria = this.resolveInteger(p.num_sesion_cta_convocatoria);
    proyecto.fechaApertura = this.resolveDate(p.fecha_apertura);
    proyecto.fechaCierreConvocatoria = this.resolveDate(p.fecha_cierre_convocatoria);
    proyecto.reniecytSolicitud = p.reniecyt_solicitud;
    proyecto.cvuSolicitante = p.cvu_solicitante;
    proyecto.nombreSolicitante = p.nombre_solicitante;
    proyecto.fechaCartaAutorizacion = this.resolveDate(p.fecha_carta_autorizacion);
    proyecto.fechaEntregaSolicitud = this.resolveDate(p.fecha_entrega_solicitud);
    proyecto.fechaRevision = this.resolveDate(p.fecha_revision);
    proyecto.fechaEnvioNotificacion = this.resolveDate(p.fecha_envio_notificacion);
    proyecto.fechaResolucion = this.resolveDate(p.fecha_resolucion);
    proyecto.nombreEvaluador = p.nombre_evaluador;
    proyecto.fechaNotificacionEvaluador = this.resolveDate(p.fecha_notificacion_evaluador);
    proyecto.fechaEnvioComentarios = this.resolveDate(p.fecha_envio_comentarios);
    proyecto.fechaAtencionComentarios = this.resolveDate(p.fecha_atencion_comentarios);
    proyecto.fechaRevisionFinanciera = this.resolveDate(p.fecha_revision_financiera);
    proyecto.fechaAtencionAjustesFinancieros = this.resolveDate(p.fecha_atencion_ajustes_financieros);
    proyecto.dictamenEvaluacion = p.dictamen_evaluacion;
    proyecto.fechaDictamenEvaluacion = this.resolveDate(p.fecha_dictamen_evaluacion);
    proyecto.fechaRegistroEvaluacion = this.resolveDate(p.fecha_registro_evaluacion);
    proyecto.dictamenFinal = p.dictamen_final;
    proyecto.fechaEmisionDictamen = this.resolveDate(p.fecha_emision_dictamen);
    proyecto.fechaLiberacionActa = this.resolveDate(p.fecha_liberacion_acta);
    proyecto.fechaEnvioDocumentos = this.resolveDate(p.fecha_envio_documentos);
    proyecto.montoTotalSolicitado = this.resolveDouble(p.monto_total_solicitado);
    proyecto.montoTotalPresentado = this.resolveDouble(p.monto_total_presentado);
    proyecto.montoTotalAprueba = this.resolveDouble(p.monto_total_aprueba);
    proyecto.duracionProyecto = this.resolveInteger(p.duracion_proyecto);
    proyecto.tipoProyecto = p.tipo_proyecto;
    proyecto.numEtapas = this.resolveInteger(p.num_etapas);
    proyecto.numAcuerdoAprobacion = p.num_acuerdo_aprobacion;
    proyecto.numSesionCtaAprobacion = this.resolveInteger(p.num_sesion_cta_aprobacion);
    proyecto.fechaAcuerdoAprobacion = this.resolveDate(p.fecha_acuerdo_aprobacion);
    proyecto.fechaPublicacionResultados = this.resolveDate(p.fecha_publicacion_resultados);
    proyecto.fechaSancionCar = this.resolveDate(p.fecha_sancion_car);
    proyecto.numAcuerdoCtaCantelacion = p.num_acuerdo_cta_cantelacion;
    proyecto.fechaAcuerdoCtaCancelacion = this.resolveDate(p.fecha_acuerdo_cta_cancelacion);
    proyecto.fechaNotificacionBeneficiarioCan = this.resolveDate(p.fecha_notificacion_beneficiario_can);
    proyecto.fechaAsignacionCar = this.resolveDate(p.fecha_asignacion_car);
    proyecto.numCar = p.num_car;
    proyecto.fechaLiberacion = this.resolveDate(p.fecha_liberacion);
    proyecto.tipoCar = p.tipo_car;
    proyecto.fechaVoboAuj = this.resolveDate(p.fecha_vobo_auj);
    proyecto.fechaVoboSolicitante = this.resolveDate(p.fecha_vobo_solicitante);
    proyecto.fechaFirmaRepLegal = this.resolveDate(p.fecha_firma_rep_legal);
    proyecto.fechaFirmaRespAdministrativo = this.resolveDate(p.fecha_firma_resp_administrativo);
    proyecto.fechaFirmaRespTecnico = this.resolveDate(p.fecha_firma_resp_tecnico);
    proyecto.fechaFrrmaSecAdministrativo = this.resolveDate(p.fecha_frrma_sec_administrativo);
    proyecto.fechaFirmaSecTecnico = this.resolveDate(p.fecha_firma_sec_tecnico);
    proyecto.fechaInicioProyCar = this.resolveDate(p.fecha_inicio_proy_car);
    proyecto.fechaTerminoProyCar = this.resolveDate(p.fecha_termino_proy_car);
    proyecto.fechaEnvioNotifFinSt = this.resolveDate(p.fecha_envio_notif_fin_st);
    proyecto.fechaEnvioNotifFinSa = this.resolveDate(p.fecha_envio_notif_fin_sa);
    proyecto.fechaRecepInfTecnico = this.resolveDate(p.fecha_recep_inf_tecnico);
    proyecto.fechaEnvioEvalInfTecnico = this.resolveDate(p.fecha_envio_eval_inf_tecnico);
    proyecto.fechaNotificacionInfTecnico = this.resolveDate(p.fecha_notificacion_inf_tecnico);
    proyecto.fechaAtencionAjustesInfTecnico = this.resolveDate(p.fecha_atencion_ajustes_inf_tecnico);
    proyecto.fechaRecepDictamenInfTecnico = this.resolveDate(p.fecha_recep_dictamen_inf_tecnico);
    proyecto.falloInformeTecnico = p.fallo_informe_tecnico;
    proyecto.fechaRecepcionInfFinancieroFinal = this.resolveDate(p.fecha_recepcion_inf_financiero_final);
    proyecto.fechaEnvioNotificacionAjuste = p.fecha_envio_notificacion_ajuste;
    proyecto.fechaAtencionAjustes = p.fecha_atencion_ajustes;
    proyecto.montoReintegro = p.monto_reintegro;
    proyecto.fechaSolicitudReintegro = this.resolveDate(p.fecha_solicitud_reintegro);
    proyecto.fechaReintegro = this.resolveDate(p.fecha_reintegro);
    proyecto.fechaRecepcionDictamen = this.resolveDate(p.fecha_recepcion_dictamen);
    proyecto.falloInformeFinanciero = p.fallo_informe_financiero;
    proyecto.tipoConclusion = p.tipo_conclusion;
    proyecto.fechaDictamenAprobatorioInfFinanciero = this.resolveDate(p.fecha_dictamen_aprobatorio_inf_financiero);
    proyecto.fechaDictamenAprobatorioInfTecnico = this.resolveDate(p.fecha_dictamen_aprobatorio_inf_tecnico);
    proyecto.fechaConstanciaConclusion = this.resolveDate(p.fecha_constancia_conclusion);
    proyecto.fechaEnvioAcuse = this.resolveDate(p.fecha_envio_acuse);
    proyecto.numSesionCtaConclusion = this.resolveInteger(p.num_sesion_cta_conclusion);
    proyecto.fechaConocimientoEmisionConstancia = this.resolveDate(p.fecha_conocimiento_emision_constancia);
    proyecto.numAcuerdoCtaConclusion = p.num_acuerdo_cta_conclusion;
    proyecto.indicarEsTerminacionAnt = p.indicar_es_terminacion_ant;
    proyecto.fechaRecepcionInfTecnicoAnt = this.resolveDate(p.fecha_recepcion_inf_tecnico_ant);
    proyecto.fechaAcuerdoCtaTerminacionAnt = this.resolveDate(p.fecha_acuerdo_cta_terminacion_ant);
    proyecto.fechaOpinionJuridicaTerminacionAnt = this.resolveDate(p.fecha_opinion_juridica_terminacion_ant);
    proyecto.numSesionCtaTerminacion = this.resolveInteger(p.num_sesion_cta_terminacion);
    proyecto.fechaNotificBenefTerminacionAnt = this.resolveDate(p.fecha_notific_benef_terminacion_ant);
    proyecto.numAcuerdoCtaTerminacionAnt = p.num_acuerdo_cta_terminacion_ant;
    proyecto.fechaOpinionJuridicaRescision = this.resolveDate(p.fecha_opinion_juridica_rescision);
    proyecto.numSesionCtaRescision = this.resolveInteger(p.num_sesion_cta_rescision);
    proyecto.fechaAcuerdoCtaRescision = this.resolveDate(p.fecha_acuerdo_cta_rescision);
    proyecto.numAcuerdoCtaRescision = p.num_acuerdo_cta_rescision;
    proyecto.numCausaRescision = p.num_causa_rescision;
    proyecto.fechaNotificacionAcuerdoConclusion = this.resolveDate(p.fecha_notificacion_acuerdo_conclusion);
    proyecto.etapa = p.etapa;
    proyecto.estatus = p.estatus;
    proyecto.ministraciones = [];
    proyecto.comentarios = [];
    proyecto.aprobaciones = [];
    return proyecto;
  }

  static verifyFechas(programa) {
    if (programa.finEstancia === 'Invalid Date') {
      this.log.error(programa.cvu + '-  programa.finEstancia' + '-' + 'Invalid Date');
    }
    if (programa.inicioBeca === 'Invalid Date') {
      this.log.error(programa.cvu + '- programa.inicioBeca' + '-' + 'Invalid Date');
    }
    if (programa.finBeca === 'Invalid Date') {
      this.log.error(programa.cvu + '- programa.finBeca' + '-' + 'Invalid Date');
    }
    if (programa.inicioEstancia === 'Invalid Date') {
      this.log.error(programa.cvu + '- programa.inicioEstancia' + '-' + 'Invalid Date');
    }
  }

  // from en-US 'MM/dd/YYYY';
  // to en-GB 'dd/MM/YYYY';
  static formatDate(date) {
    let result = moment(date, 'MM/DD/YYYY').format('DD/MM/YYYY');
    return result;
  }

  // from en-US 'MM/dd/YYYY';
  // to en-GB 'dd/MM/YYYY';
  static formatBecaDate(date) {
    let result = moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY');
    return result;
  }

  static resolveCampo(value, spinner) {
    const campo = String.normalize(value);
    if (Catalogos.CAMPOS.includes(campo)) {
      return campo;
    }
    spinner.fail(chalk.green.bold('>' + campo + '<') + chalk.green('CAMPO NOT FOUND'));
    return 'CAMPO NOT FOUND';
  }

  static resolveDisciplina(value, spinner) {
    const disciplina = String.normalize(value);
    if (Catalogos.DISCIPLINAS.includes(disciplina)) {
      return disciplina;
    }
    spinner.fail(chalk.green.bold('>' + disciplina + '<') + chalk.green('DISCIPLINA NOT FOUND'));
    return 'CIUDAD TERRITORIO  Y SUSTENTABILIDAD';
  }

  static resolveInteger(value) {
    let result = parseInt(value);
    if (result == 'NaN') {
      return null;
    } else {
      return result;
    }
  }

  static resolveDouble(value) {
    let result = parseFloat(value);
    if (result == 'NaN') {
      return null;
    } else {
      return result;
    }
  }
  static resolveDate(value) {
    let result = parseFloat(value);
    if (result == 'NaN') {
      return null;
    } else {
      return result;
    }
  }
  static resolveMontoMensual(grado) {
    if (grado) {
      if (grado === 'MAE') {
        return 13162.9;
      } else if (grado === 'DOC') {
        return 17550.54;
      } else if (grado === 'ESP') {
        return 11700.36;
      }
    }

    return 0.0;
  }

  static toRegla(reglas, spinner) {
    reglas.orden = reglas.orden;
    reglas.metodologias = this.split(reglas.id, reglas.metodologias, spinner, Catalogos.METODOLOGIAS, 'METODOLOGIAS');
    reglas.grados = this.split(reglas.id, reglas.grados, spinner, Catalogos.GRADOS, 'GRADOS');
    reglas.orientaciones = this.split(reglas.id, reglas.orientaciones, spinner, Catalogos.ORIENTACIONES, 'ORIENTACIONES');
    reglas.areas = this.split(reglas.id, reglas.areas, spinner, Catalogos.AREAS, 'AREAS');
    reglas.campos = this.resolveCamposForRules(reglas.id, reglas.campos, spinner, Catalogos.CAMPOS, 'CAMPOS');
    reglas.disciplinas = this.resolveDisciplinasForRules(reglas.id, reglas.disciplinas, spinner, Catalogos.DISCIPLINAS, 'DISCIPLINAS');
    reglas.entidades = this.split(reglas.id, reglas.entidades, spinner, Catalogos.ENTIDADES, 'ENTIDADES');
    reglas.tipoInstituciones = this.split(
      reglas.id,
      reglas.tipo_instituciones,
      spinner,
      Catalogos.TIPO_INSTITUCIONES,
      'TIPO INSTITUCIONES'
    );
    reglas.acreditadoSnp = this.resolveBoolean(reglas.acreditadoSnp);
    reglas.activo = true;
    return reglas;
  }

  static toInstituciones(i, spinner) {
    let institucion = {};
    institucion.id = i.clave;
    institucion.tipo = i.tipo;
    return institucion;
  }

  static resolveCamposForRules(id, string, spinner, validate, modulo) {
    let campos = CAMPOS[id];

    if (campos) {
      const elements = campos;
      for (let index = 0; index < elements.length; index++) {
        elements[index] = String.normalize(elements[index]);
        if (!validate.includes(elements[index])) {
          this.log.info(',' + modulo + ',' + id + ',' + elements[index]);
          spinner.fail(chalk.green.bold(modulo + '>' + elements[index] + '<') + chalk.green('CATALOG NOT FOUND'));
        }
      }
      return elements;
    } else {
      return [];
    }
  }

  static resolveDisciplinasForRules(id, string, spinner, validate, modulo) {
    let disciplinas = DISCIPLINAS[id];

    if (disciplinas) {
      const elements = disciplinas;
      for (let index = 0; index < elements.length; index++) {
        elements[index] = String.normalize(elements[index]);
        if (!validate.includes(elements[index])) {
          this.log.info(',' + modulo + ',' + id + ',' + elements[index]);
          spinner.fail(chalk.green.bold(modulo + '>' + elements[index] + '<') + chalk.green('CATALOG NOT FOUND'));
        }
      }
      return elements;
    } else {
      return [];
    }
  }

  static split(id, string, spinner, validate, modulo) {
    if (string) {
      const elements = string; //string.toString().split(',');
      for (let index = 0; index < elements.length; index++) {
        elements[index] = String.normalize(elements[index]);
        if (!validate.includes(elements[index])) {
          this.log.info(',' + modulo + ',' + id + ',' + elements[index]);
          spinner.fail(chalk.green.bold(modulo + '>' + elements[index] + '<') + chalk.green('CATALOG NOT FOUND'));
        }
      }
      return elements;
    } else {
      return [];
    }
  }

  static resolveBoolean(element) {
    if (element) {
      return element === 1 || element === '1';
    } else {
      return null;
    }
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
      return isConvenio === '1' || isConvenio === 1;
    } else {
      return false;
    }
  }
  static resolveTipoInstitucion(clave, id) {
    let inst = Instituciones.CATALOG[clave];
    if (inst) {
      return inst.CVE_TIPO;
    } else {
      this.log.info(',' + id + ',INSTITUCION NO ENCONTRADA' + clave);
      return 'NO ENCONTRADA';
    }
  }

  static wait(ms) {
    var start = Date.now(),
      now = start;
    while (now - start < ms) {
      now = Date.now();
    }
  }

  static sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

  static loadProgramas(context) {
    fs.readdir('cargas/matricula/partes', (err, files) => {
      try {
        const spinner = ora({ text: 'subiendo matricula...', interval: 80 });
        spinner.start();
        spinner.info(chalk.green.bold('Running on [' + context.enviroment + ']'));
        1;
        spinner.info(chalk.green.bold('Files.length [' + files.length + ']'));
        let that = this;
        for (let index = 0, j = 0; index < files.length; index++, j++) {
          let part = index.toLocaleString('en-US', {
            minimumIntegerDigits: 4,
            useGrouping: false,
          });

          setTimeout(() => {
            spinner.succeed(chalk.green.bold('PARTE - ') + chalk.green(part));
            fs.createReadStream('cargas/matricula/partes/sh_part_' + part)
              .pipe(csv())
              .on('data', m => {
                let programa = that.toPrograma(m, spinner);
                axios
                  .patch(context.serviceUrl + '/api/programas/' + programa.id, programa, context.config)
                  .then(response => {
                    spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
                  })
                  .catch(error => {
                    axios
                      .post(context.serviceUrl + '/api/programas', programa, context.config)
                      .then(response => {
                        this.log.info(',CREATED,' + programa.cvu + `,archivo ${index},` + programa.id);
                        spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
                      })
                      .catch(errorCreated => {
                        this.log.error(',' + programa.cvu + `,archivo ${index},` + programa.id);
                        spinner.fail(chalk.green.bold('ups - ') + chalk.green(programa.cvu));
                      });
                  });
              })
              .on('end', () => {
                spinner.succeed('finalización');
              });
          }, 20000 * j);
        }
      } catch (error) {
        warn(error);
      }
    });
  }

  static loadInstituciones(context) {
    try {
      const spinner = ora({ text: 'subiendo instituciones...', interval: 80 });
      spinner.start();
      let that = this;

      spinner.succeed(chalk.green.bold('Instituciones: '));
      fs.createReadStream('cargas/instituciones/catalogo.csv')
        .pipe(csv())
        .on('data', function (m) {
          let institucion = that.toInstituciones(m, spinner);
          axios
            .patch(context.serviceUrl + '/api/institucions/' + institucion.id, institucion, context.config)
            .then(response => {
              spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
            })
            .catch(error => {
              axios
                .post(context.serviceUrl + '/api/institucions', institucion, context.config)
                .then(response => {
                  spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
                })
                .catch(errorCreated => {
                  spinner.fail(chalk.green.bold('ups - ') + chalk.green(errorCreated));
                });
            });
        })
        .on('end', function () {
          spinner.succeed('finalización');
        });
    } catch (error) {
      warn(error);
    }
  }

  static loadReglas(context) {
    try {
      const spinner = ora({ text: 'subiendo reglas...', interval: 80 });
      spinner.start();
      let reglas = require('../../reglas-latest.json');
      reglas.forEach(regla => {
        regla = this.toRegla(regla, spinner);
        axios
          .put('http://localhost:8106/api/criterios/' + regla.id, regla)
          .then(response => {
            spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
          })
          .catch(error => {
            axios
              .post('http://localhost:8106/api/criterios', regla)
              .then(response => {
                spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
              })
              .catch(errorCreated => {
                spinner.fail(chalk.green.bold('ups - ') + chalk.green(errorCreated));
              });
          });
      });
    } catch (error) {
      warn(error);
    }
  }

  static loadProyectos(context) {
    fs.readdir('cargas/proyectos/partes', (err, files) => {
      try {
        const spinner = ora({ text: 'subiendo proyectos...', interval: 80 });
        spinner.start();
        spinner.info(chalk.green.bold('Running on [' + context.enviroment + ']'));
        let that = this;
        for (let index = 0, j = 0; index < files.length - 2; index++, j++) {
          let part = index.toLocaleString('en-US', {
            minimumIntegerDigits: 4,
            useGrouping: false,
          });

          setTimeout(() => {
            spinner.succeed(chalk.green.bold('PARTE - ') + chalk.green(part));
            fs.createReadStream('cargas/proyectos/partes/sh_part_' + part)
              .pipe(csv())
              .on('data', function (m) {
                let proyecto = that.toProyecto(m, spinner);
                if (m.cve_convocatoria && m.cve_proyecto) {
                  axios
                    .patch(context.serviceUrl + '/api/proyectos/' + proyecto.id, proyecto, context.config)
                    .then(response => {
                      spinner.succeed(chalk.green.bold('updated - ') + chalk.green(response.data.id));
                    })
                    .catch(error => {
                      axios
                        .post(context.serviceUrl + '/api/proyectos', proyecto, context.config)
                        .then(response => {
                          spinner.succeed(chalk.green.bold('created - ') + chalk.green(response.data.id));
                        })
                        .catch(errorCreated => {
                          spinner.fail(chalk.green.bold('ups - ' + proyecto.id + ': ') + chalk.green(errorCreated));
                        });
                    });
                }
              })
              .on('end', function () {
                spinner.succeed('finalización');
              });
          }, 10000 * j);
        }
      } catch (error) {
        warn(error);
      }
    });
  }
};
