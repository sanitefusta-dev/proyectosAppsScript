function EnviarMensajesSeguimientoPresupuestos_API() {

  const registros = cargarPresupuestosParaSeguimiento_API();

  if (!registros || registros.length === 0) {
    Logger.log("No hay presupuestos para seguimiento hoy.");
    return;
  }

  const archivoPDFSaniteInformacio = DriveApp.getFileById("1tDWl8RY4MB9XsytOeGQyQE0cUUbK2dhr");

  const asuntos = {
    es: ["Recordatorio propuesta ", "Nuevo recordatorio propuesta "],
    ca: ["Recordatori proposta ", "Nou recordatori proposta "],
    en: ["Budget reminder ", "New budget reminder "]
  };

 
  registros.forEach(reg => {

    const {
      pkPresupuesto,
      idPresupuesto,
      estado,
      email,
      nombre,
      telefono,
      idProyectoMatriz,
      proyectoMatriz,
      fechaSeg,
      idioma,
      genero
    } = reg;

    Logger.log("Procesando presupuesto " + idPresupuesto);

    let prefixIdioma = idioma === "Català" ? "ca" : (idioma === "Castellano" ? "es" : "en");
    let tratamiento = TratamientoGeneroIdioma(genero, prefixIdioma);

    if (!fechaSeg || isNaN(fechaSeg.getTime())) {
      Logger.log("❌ ERROR: fechaSeg inválida para presupuesto " + idPresupuesto + " → " + fechaSeg);
      return; // evita crasheo
    }
    
    const fechaProximoSeguimiento = new Date(fechaSeg.getTime());

    let nuevoEstado = "";
    let idxAsunto = null;

    switch (estado) {
      case "0.Creado y enviado presupuesto":
        idxAsunto = 0;
        nuevoEstado = "2.Enviado recordatorio/Fase 1";
        fechaProximoSeguimiento.setDate(fechaSeg.getDate() + 7);
        break;

      case "2.Enviado recordatorio/Fase 1":
        idxAsunto = 1;
        nuevoEstado = "3.Enviado refuerzo/Fase 2";
        fechaProximoSeguimiento.setDate(fechaSeg.getDate() + 5);
        break;

      case "3.Enviado refuerzo/Fase 2":
        nuevoEstado = "4.Fases completadas";
        break;

      default:
        break;
    }

    if (idxAsunto !== null && email) {
      const safeNombre = nombre || "";
      const asunto = (asuntos[prefixIdioma] && asuntos[prefixIdioma][idxAsunto] ? asuntos[prefixIdioma][idxAsunto] : asuntos['en'][idxAsunto]) + proyectoMatriz;

      const bodyHtml = getEmailTemplate(
        "plantillaSeguimiento",
        prefixIdioma,
        idxAsunto + 1,
        { nombreCliente: safeNombre, idPresupuesto: idPresupuesto, tratamiento, proyectoMatriz, pkPresupuesto: pkPresupuesto, }
      );

      EnviarEmailSeguimiento(asunto, bodyHtml, email, archivoPDFSaniteInformacio);
    }

    actualizarEstadoSeguimiento_API(idPresupuesto, nuevoEstado, fechaProximoSeguimiento);

    if (nuevoEstado === "4.Fases completadas") {
      insertarTareaUltimoSeguimiento_API(idProyectoMatriz, proyectoMatriz);
    }
  });

  Logger.log("Proceso finalizado.");
}



//---------------------------------------------------------------------


function cargarPresupuestosParaSeguimiento_API() {
  const url = "http://82.223.115.25:3001/presupuestos/seguimiento";

  const options = {
    method: "get",
    contentType: "application/json",
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  
  Logger.log (data);


return data.map(r => ({
    pkPresupuesto: r.pkPresupuesto,
    idPresupuesto: r.idPresupuesto,
    aprobado: r.aprobado,
    estado: r.estado,
    email: r.email,
    telefono: r.telefono,
    nombre: r.nombre,
    idProyectoMatriz: r.idProyectoMatriz,
    proyectoMatriz: r.proyectoMatriz,
    fechaSeg: parseFechaSafe(r.fechaSeg),
    idioma: r.idioma,
    genero: r.genero
}));


}




//---------------------------------------------------------------

function actualizarEstadoSeguimiento_API(idPresupuesto, nuevoEstado, nuevaFecha) {
  const url = "http://82.223.115.25:3001/presupuestos/actualizar-estado";

  const body = {
    idPresupuesto: idPresupuesto,
    nuevoEstado: nuevoEstado,
    nuevaFecha: Utilities.formatDate(nuevaFecha, Session.getScriptTimeZone(), "yyyy-MM-dd")
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log("Actualizar estado a → " + nuevoEstado + " - " + response.getContentText());
}



//---------------------------------------------------------------


function insertarTareaUltimoSeguimiento_API(idProyectoMatriz, proyectoMatriz) {
  const url = "http://82.223.115.25:3001/tareas";

  const now = new Date();

  const body = {
    idProyectoMatriz: idProyectoMatriz,
    fkProyectoMatriz: null,
    idProyecto: null,
    fkProyecto: null,
    fase: "Seguimiento",
    tarea: "PRESUPUESTO: Seguimiento última fase",
    fechaRegistro: now.toISOString(),
    fechaVencimiento: Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd"),
    idUsuario: "Administrador",
    fkUsuario: null,
    estadoTarea: "PENDIENTE",
    comentarios: (proyectoMatriz || "") + " - Última llamada al cliente para confirmar o rechazar presupuesto"
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  Logger.log("Insertar tarea ultimo seguimiento → " + response.getContentText());
}




