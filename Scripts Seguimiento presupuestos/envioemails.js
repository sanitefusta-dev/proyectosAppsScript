/* NO AFECTADO POR MIGRACION */

/**(1)
 * function EnviarEmailSeguimiento
 * Envía un email de seguimiento con cuerpo HTML personalizado (versión robusta).
 * - asunto: string
 * - bodyHTML: string (puede ser undefined -> se sustituye por cadena vacía)
 * - emailDestino: string o array de strings
 *  https://drive.google.com/file/d/1tDWl8RY4MB9XsytOeGQyQE0cUUbK2dhr/view?usp=sharing
 * 
 * (2) -------------
 * function EnviarFormularioAprobacionPresupuesto
 * Al aprobar presupuesto, enviar formulario para rellenar
 * 
 */

function EnviarEmailSeguimiento(asunto, bodyHTML, emailDestino, adjunto = null) {
  const config = getProjectConfig();
  //emailDestino = "sanitefusta@gmail.com, tecnic.sanite@gmail.com"; // pruebas
  Logger.log("Entrando en EnviarEmailSeguimiento");

  if (!asunto) return;

  if (typeof bodyHTML !== "string") {
    bodyHTML = bodyHTML == null ? "" : String(bodyHTML);
  }

  // Normalizar destinatarios
  let destinatarios = "";
  if (Array.isArray(emailDestino)) {
    destinatarios = emailDestino.join(",");
  } else if (typeof emailDestino === "string") {
    destinatarios = emailDestino;
  } else {
    return;
  }

  try {
    const opciones = {
      htmlBody: bodyHTML,
      cc: "tecnic@sanite.net",
      bcc: "sanitefusta@gmail.com",
      replyTo: "tecnic@sanite.net",   // ✔ correcto
      name: config.remitenteNombre || config.remitenteEmail
    };

    if (adjunto && adjunto.getAs) {
      opciones.attachments = [adjunto.getAs(MimeType.PDF)];
    }

    Logger.log("EnviarEmailSeguimiento -> to: " + destinatarios);

    GmailApp.sendEmail(destinatarios, asunto, "", opciones);  // ✔ correcta

  } catch (e) {
    Logger.log("Error en EnviarEmailSeguimiento: " + e);
  }
}


//==============  ENVIAR FORMULARIO DE APROBACION PRESUPUESTO ========
function EnviarFormularioAprobacionPresupuesto(datosJson) {

  (async () => {
    try {

      const folderPDFFilesID = '1ZtlAiREiznGJYFZms8CLxCxMVHkbxbTA'; // 📂 Carpeta donde guardar el PDF
      const datos = JSON.parse(datosJson);

      //============= SELECCIONAR PLANTILLA SEGÚN IDIOMA ================
      let prefixIdioma = "";
      let idPlantillaDoc = "";
      let nombreDoc = `Formulari`;

      if (datos.idioma === "Català") {
          prefixIdioma = "ca";
          idPlantillaDoc = "1hpEBKEYw5HiEqa8zvnlh7S83ndEA10GYEv0NEKnp0rI";
          nombreDoc = `Formulari pressupost Num ${datos.presupuesto}`;
      } else if (datos.idioma === "Castellano") {
          prefixIdioma = "es";
          idPlantillaDoc = "157r7u4lppr2KvmJXOreqyHvPRKsOGCwA0xaqq7-gehs";
          nombreDoc = `Formulario presupuesto Num ${datos.presupuesto}`;
      } else if (datos.idioma === "Inglés") {
          prefixIdioma = "en";
          idPlantillaDoc = "157r7u4lppr2KvmJXOreqyHvPRKsOGCwA0xaqq7-gehs";
          nombreDoc = `Formulario presupuesto Num ${datos.presupuesto}`;        
      }

      //=========== 1️⃣ DUPLICAR PLANTILLA GOOGLE DOC ==================
      const plantilla = DriveApp.getFileById(idPlantillaDoc);
      const carpeta = DriveApp.getFolderById(folderPDFFilesID);
      const nuevoDocFile = plantilla.makeCopy(nombreDoc, carpeta);
      const nuevoDocId = nuevoDocFile.getId();

      //=========== 2️⃣ REEMPLAZAR TAGS EN EL DOCUMENTO ================
      const doc = DocumentApp.openById(nuevoDocId);
      const body = doc.getBody();

      body.replaceText('{{presupuesto}}', String(datos.presupuesto));

      doc.saveAndClose();

      //=========== 3️⃣ GENERAR PDF ===================================
      const pdfBlob = nuevoDocFile.getAs('application/pdf').setName(nombreDoc + ".pdf");

      //=========== 4️⃣ ENVIAR EMAIL ==================================
      let asunto = "";
      if (prefixIdioma === "ca") asunto = "Formulari d'acceptació i planificació dels treballs";
      else if (prefixIdioma === "es") asunto = "Formulario de aceptación y planificación de los trabajos";
      else if (prefixIdioma === "en") asunto = "Formulario de aceptación y planificación de los trabajos";

      asunto = asunto + " - " + datos.presupuesto;

      const cuerpo = getEmailTemplate(
        "plantillaEnvioFormularioAprobacionPresupuesto",
        prefixIdioma,
        "",
        {}
      );

      //const destinatarios = "sanitefusta@gmail.com, tecnic.sanite@gmail.com";

      const destinatarios = datos.Email_Seguimiento;
      MailApp.sendEmail({
        to: destinatarios,
        cc: "tecnic@sanite.net, paula@sanite.net",
        bcc: "sanitefusta@gmail.com",
        name: 'Sanite Fusta',
        replyTo: 'tecnic@sanite.net',
        subject: asunto,
        htmlBody: cuerpo,
        attachments: [pdfBlob]
      });

      Logger.log("📨 Correo enviado con PDF generado dinámicamente.");

    } catch (err) {
      Logger.log('❌ Error EnviarFormularioAprobacionPresupuesto: ' + err);
      throw err;
    }

  })();
}



//==================================================
function getEmailTemplate(nombre, prefixIdioma, index, variables = {}) {
  const fileName = nombre + index + "_" + prefixIdioma +".html";
  Logger.log ('plantilla: ' + fileName);
  let html = HtmlService.createHtmlOutputFromFile(fileName).getContent();
  // Aseguramos tipos y damos valor por defecto al nombre 
  var safeHtml = (html == null) ? "" : String(html); 

  for (const key in variables) {
    safeHtml = safeHtml.replaceAll(`{{${key}}}`, variables[key] || "");
  }
  return safeHtml;
}

//==================================================

function prueba() {
Logger.log( EnviarEmailSeguimiento("hola", "texto", "eva.deumal@gmail.com", adjunto = null));
}

