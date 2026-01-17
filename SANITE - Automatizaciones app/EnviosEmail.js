/* SIN CAMBIOS DESPUES DE LA MIGRACION */ 


function enviarReportePDFaCliente(rutaArchivoPDF, emailDestinatario, nombreProyecto) {

  Logger.log("DESTINATARIO: " + emailDestinatario);
  const idCarpeta = "1SHRpvKreJ4T2HLX99rhIssoiwMaK_4eH"; //carpeta principal de la app

  try {
    const archivoBlob = leerBlobPDF(idCarpeta, rutaArchivoPDF); // Obtén el Blob del archivo

    const asunto = "Repor fotogràfic - " + nombreProyecto;
    const cuerpo = "Bon dia,\n\nAdjunt trobaran les imatges corresponent als treballs que estem realitzant.\n\nGràcies i salutacions.";


    // Envía el correo con el archivo adjunto
    GmailApp.sendEmail(emailDestinatario, asunto, cuerpo, {
      attachments: [archivoBlob],
      from: "sanite@sanite.net",
      cc: "tecnic@sanite.net",
      bcc: "sanitefusta@gmail.com",
      replyTo: "tecnic@sanite.net"
    });

    Logger.log(`Correo enviado exitosamente a ${emailDestinatario}`);
  } catch (error) {
    Logger.log(`Error en enviarPDFDesdeRuta: ${error.message}`);
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }

 
}



//=======================================================
function GenerarYEnviarContrato(docId, nombreCarpeta, txtPartePrimera, txtIntervienen, txtFechaContrato, emailDestino, txtNombreProyecto, txtNombrePDF, listadoPropuestas, txtDireccionTrabajo, txtImporteTotal, txtDuracion, txtNombreCliente) {
  //try {
    docId = docId || "1PQXiIf-8IALg4OnSstGTeNK5q0__OsHi8x9qUTBzz-8";  //PLANTILLA CONTRATO
    txtPartePrimera = txtPartePrimera || '---';
    txtIntervienen = txtIntervienen || '---';
    txtFechaContrato = txtFechaContrato || '---sin fecha---';
    emailDestino = emailDestino || 'eva.deumal@gmail.com';
    txtNombrePDF = txtNombrePDF || 'CONTRATO PRUEBA ' + txtFechaContrato;
    listadoPropuestas = listadoPropuestas || '---';
    txtNombreProyecto = txtNombreProyecto || '---';
    nombreCarpeta = nombreCarpeta || 'PR240920095022-PRUEBA EVA 4';
    txtDireccionTrabajo = txtDireccionTrabajo || "---";
    txtImporteTotal = txtImporteTotal || "---";
    txtDuracion =  txtDuracion || "---";
    txtNombreCliente = "---";

    listadoPropuestas = String(listadoPropuestas).replace(/,/g, " ");

    Logger.log("txtPartePrimera " + txtPartePrimera);
    Logger.log("txtIntervienen " + txtIntervienen);
    Logger.log("vc_Fecha_Contrato " + txtFechaContrato);
    Logger.log("txtNombreProyecto " + txtNombreProyecto);
    Logger.log("listadoPropuestas " + listadoPropuestas);


    // Crear una copia de la plantilla
    const idCarpetaProyectosMatriz = "1-CKRzHdrST9H-JvfEuL-kMlwmWH6762Y";
    let folder, docCopy, docCopyId; 
    const docFile = DriveApp.getFileById(docId);
    const folders = DriveApp.getFoldersByName(nombreCarpeta);
    if (folders.hasNext()) {
      folder = folders.next();
      Logger.log("Carpeta encontrada: " + nombreCarpeta);
    } else {
      const parentFolder = DriveApp.getFolderById(idCarpetaProyectosMatriz);
      folder = parentFolder.createFolder(nombreCarpeta);
      Logger.log("Carpeta creada: " + nombreCarpeta);
    }
    docCopy = docFile.makeCopy(txtNombrePDF, folder);
    docCopyId = docCopy.getId();


    // Abrir la copia y reemplazar las etiquetas
    const doc = DocumentApp.openById(docCopyId);
    const body = doc.getBody();
    body.replaceText('<<\\[vc_Contrato_PartePrimera\\]>>', txtPartePrimera);
    body.replaceText('<<\\[vc_Contrato_Intervienen\\]>>', txtIntervienen);
    body.replaceText('<<\\[vc_Fecha_Contrato\\]>>', txtFechaContrato);
    body.replaceText('<<\\[vc_listadoPropuestas\\]>>', listadoPropuestas);
    body.replaceText('<<\\[Direccion_Trabajo\\]>>', txtDireccionTrabajo);
    body.replaceText('<<\\[Importe_Total\\]>>', txtImporteTotal);
    body.replaceText('<<\\[Duracion_Trabajos\\]>>', txtDuracion);
    body.replaceText('<<\\[Email_Cliente\\]>>', emailDestino);
    body.replaceText('<<\\[Nombre_Cliente\\]>>', txtNombreCliente);
    doc.saveAndClose();


    // Convertir la copia modificada a PDF
    const pdfConverted = docCopy.getAs('application/pdf');

    //folder = docCopy.getParents().next();  // Obtener la carpeta donde está docCopy
    const pdfBlob = docCopy.getAs('application/pdf');
    const pdfFile = folder.createFile(pdfBlob).setName(txtNombrePDF + ".pdf");

    Logger.log("PDF guardado en la carpeta: " + pdfFile.getName());



    // Enviar correo con los dos PDFs adjuntos
    const asunto = "CONTRACTE DE PRESTACIÓ DE SERVEIS - " + txtNombreProyecto;
    const mensaje = "Bon dia,\n\nAdjunt trobaran el CONTRACTE DE PRESTACIÓ DE SERVEIS DE SANEJAMENT DE LA FUSTA corresponents al presupost acordat.\n\nGràcies i salutacions.";

    GmailApp.sendEmail(emailDestino, asunto, mensaje, {
      attachments: [pdfConverted],
      from: "sanite@sanite.net",
      cc: "tecnic@sanite.net",
      bcc: "sanitefusta@gmail.com",
      replyTo: "tecnic@sanite.net",   // ✔ correcto
      name: "Sanite Fusta"
    });

    Logger.log('Contrato enviado correctamente a: ' + emailDestino);


  //} catch (e) {
  //  Logger.log('Error: ' + e.message);
 //}
}







//===================================================================
//===================

//===================================================================

/**
 * Lee un archivo PDF desde una ruta relativa en Google Drive y devuelve su objeto Blob.
 * @param {string} idCarpeta - ID de la carpeta raíz de la app en Google Drive.
 * @param {string} rutaRelativa - Ruta del archivo incluyendo subcarpetas y nombre del archivo, separadas por "/".
 * @returns {Blob} - Objeto Blob del archivo encontrado.
 */
function leerBlobPDF(idCarpeta, rutaRelativa) {
  try {
    const partesRuta = rutaRelativa.split("/");
    const nombreArchivo = partesRuta.pop(); // Última parte es el nombre del archivo
    let carpetaActual = DriveApp.getFolderById(idCarpeta);

    partesRuta.forEach(nombreCarpeta => {
      const subcarpetas = carpetaActual.getFoldersByName(nombreCarpeta);
      if (subcarpetas.hasNext()) {
        carpetaActual = subcarpetas.next();
      } else {
        throw new Error(`La subcarpeta "${nombreCarpeta}" no se encontró en la ruta proporcionada.`);
      }
    });

    const archivos = carpetaActual.getFilesByName(nombreArchivo);
    if (!archivos.hasNext()) {
      throw new Error(`El archivo "${nombreArchivo}" no se encontró en la carpeta final.`);
    }

    return archivos.next().getBlob(); // Retorna el archivo como un Blob
  } catch (error) {
    throw new Error(`Error en leerBlobPDF: ${error.message}`);
  }
}


//===================================================================
//===================================================================
//===================================================================
//===================================================================
//===================================================================
function GenerarYEnviarCertificacion(docId, pdfId, txtDireccion, txtPropuesta, txtFechaCertificacion, emailDestino, nombreProyecto) {
  try {
    txtDireccion = txtDireccion || '---';
    txtPropuesta = txtPropuesta || '---';
    txtFechaCertificacion = txtFechaCertificacion || '---';
    emailDestino = emailDestino || 'eva.deumal@gmail.com';
    nombreProyecto = nombreProyecto || '---';

    Logger.log("txtDireccion: " + txtDireccion);
    Logger.log("txtPropuesta: " + txtPropuesta);
    Logger.log("txtFechaCertificacion: " + txtFechaCertificacion);
    Logger.log("nombreProyecto: " + nombreProyecto);

    let attachments = [];

    // Si se proporciona docId, generar el documento y adjuntarlo
    if (docId) {
      const docFile = DriveApp.getFileById(docId);
      const docCopy = docFile.makeCopy(docFile.getName() + " - " + nombreProyecto);
      const docCopyId = docCopy.getId();

      const doc = DocumentApp.openById(docCopyId);
      const body = doc.getBody();
      body.replaceText('<<\\[DIRECCION\\]>>', txtDireccion);
      body.replaceText('<<\\[PROPUESTA_ACEPTADA\\]>>', txtPropuesta);
      body.replaceText('<<\\[vc_Fecha_Certificado\\]>>', txtFechaCertificacion);
      doc.saveAndClose();

      const pdfConverted = docCopy.getAs('application/pdf');
      attachments.push(pdfConverted);

      // Eliminar la copia temporal
      DriveApp.getFileById(docCopyId).setTrashed(true);
    }

    // Si se proporciona pdfId, obtener el archivo adicional y adjuntarlo
    if (pdfId) {
      Logger.log("Obteniendo PDF adicional: " + pdfId);
      const pdfAdicional = DriveApp.getFileById(pdfId).getBlob();
      attachments.push(pdfAdicional);
    }

    // Enviar el correo solo si hay adjuntos
    const asunto = 'Certificació - ' + nombreProyecto;
    const mensaje = "Bon dia,\n\nAdjunt trobaran les certificacions corresponents als treballs que hem realitzat.\n\nGràcies i salutacions.";
    
    GmailApp.sendEmail(emailDestino, asunto, mensaje, {
      attachments: attachments,
      from: "sanite@sanite.net",
      cc: "tecnic@sanite.net",
      bcc: "sanitefusta@gmail.com",
      replyTo: "tecnic@sanite.net",   // ✔ correcto
      name: "Sanite Fusta"
    });

    Logger.log('Certificacion enviado correctamente a: ' + emailDestino);
  } catch (e) {
    Logger.log('Error: ' + e.message);
  }
}




