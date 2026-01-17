/* NO AFECTADO POR MIGRACION */



function GenerarPresupuestoMADERA( datosJson ) {

  (async () => {
    Logger.log('RAW datosJson: ' + String(datosJson));
    try {
      // 🔸 Datos a reemplazar en ambas plantillas
      const datos = JSON.parse(datosJson);

      Logger.log("datos.idioma: " + datos.idioma + " | es Castellano: " + (datos.idioma === "Castellano"));


      // 🔹 CONFIGURACIÓN INICIAL
      const folderDestinoId = '1e-TWesCo7ALhmsfxpNMdtpJXGIJc5_l_'; // 📂 Carpeta destino PRESUPUESTOS MADERA


      // Carga el listado de plantillas a usar según idioma y código
      const listaDocs = getListaDocsMadera();

      const docs = listaDocs?.[datos.idioma]?.[datos.codigo];

      if (!docs) {
        throw new Error(
          `No hay documentos para idioma ${datos.idioma} y código ${datos.codigo}`
        );
      }

      const plantillaPortada = docs.portada;
      const plantillaImporte = docs.importe;
      const pdfIds = docs.pdfs;

      //--------------------------------


      const presupuestoLimpio = String(datos.presupuesto).replace(/[.,]/g, '');
      Logger.log ("presupuestoLimpio: " + presupuestoLimpio);
      const mergedName = `PRES ${datos.codigo} ${presupuestoLimpio}_${datos.numcontrol}.pdf`;

      // ⚙️ Parche setTimeout (Apps Script no lo tiene)
      if (typeof setTimeout === 'undefined') {
        this.setTimeout = function (fn) { fn(); };
      }

      // 📦 Cargar pdf-lib desde CDN
      const pdfLibUrl = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
      const pdfLibCode = UrlFetchApp.fetch(pdfLibUrl).getContentText();
      eval(pdfLibCode);
      const { PDFDocument } = PDFLib;

      // 🧩 Función auxiliar para crear un PDF desde una plantilla Docs
      async function crearPdfDesdeDocs(plantillaId, nombreTemp, datos) {
        const tempFile = DriveApp.getFileById(plantillaId).makeCopy(`${nombreTemp}_${Date.now()}`);
        const tempDoc = DocumentApp.openById(tempFile.getId());
        const body = tempDoc.getBody();
        Object.keys(datos).forEach(k => {
          body.replaceText(`{{${k}}}`, datos[k]);
        });
        tempDoc.saveAndClose();

        const blob = tempFile.getAs('application/pdf');
        const bytes = new Uint8Array(blob.getBytes().map(b => b & 0xFF));
        tempFile.setTrashed(true);
        return bytes;
      }

      // 🧾 1️⃣ Crear PDFs desde las 2 plantillas Docs
      const pdfBytes1 = await crearPdfDesdeDocs(plantillaPortada, 'Plantilla1', datos);
      const pdfBytes2 = await crearPdfDesdeDocs(plantillaImporte, 'Plantilla2', datos);

      // 🧩 2️⃣ Crear documento PDF combinado
      const mergedPdf = await PDFDocument.create();

      // ➕ (1) Añadir primer Doc Portada
      const pdf1 = await PDFDocument.load(pdfBytes1);
      const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
      pages1.forEach(p => mergedPdf.addPage(p));

      // ➕ (2) Añadir los primeros 3 PDFs
      for (let i = 0; i < 3; i++) {
        const blob = DriveApp.getFileById(pdfIds[i]).getBlob();
        const bytes = new Uint8Array(blob.getBytes().map(b => b & 0xFF));
        const srcPdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach(p => mergedPdf.addPage(p));
      }

      // ➕ (3) Añadir segundo Doc Importe
      const pdf2 = await PDFDocument.load(pdfBytes2);
      const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
      pages2.forEach(p => mergedPdf.addPage(p));

      // ➕ (4) Añadir último PDF
      const lastBlob = DriveApp.getFileById(pdfIds[3]).getBlob();
      const lastBytes = new Uint8Array(lastBlob.getBytes().map(b => b & 0xFF));
      const lastPdf = await PDFDocument.load(lastBytes);
      const lastPages = await mergedPdf.copyPages(lastPdf, lastPdf.getPageIndices());
      lastPages.forEach(p => mergedPdf.addPage(p));

      // 💾 3️⃣ Guardar PDF final en Drive
      const mergedBytes = await mergedPdf.save();
      const mergedBlob = Utilities.newBlob(mergedBytes, 'application/pdf', mergedName);
      const newFile = DriveApp.getFolderById(folderDestinoId).createFile(mergedBlob);

      const fileUrl = newFile.getUrl();
      Logger.log('✅ PDF final creado: ' + fileUrl);
  

    } catch (err) {
      Logger.log('❌ Error GenerarPresupuestoESTUDIS: ' + err);
      throw err;
    }
  })();
}


//===========================  ENVIAR PRESUPUESTO MADERA ========
function EnviarPresupuestoMADERA( datosJson, nombreArchivo ) {

  (async () => {
    const folderPDFFilesID = '1e-TWesCo7ALhmsfxpNMdtpJXGIJc5_l_'; // 📂 Carpeta PRESUPUESTOS MADERA
    Logger.log('RAW datosJson: ' + String(datosJson));
    const soloNombre = nombreArchivo.split("/").pop();
    Logger.log("nombreArchivo : " +  soloNombre);

    try {
      // 🔸 Datos a reemplazar en ambas plantillas
      const datos = JSON.parse(datosJson);

      //============= CREAR Y ENVIAR EMAIL ================
      let prefixIdioma = "";
      if (datos.idioma === "Català") {
        prefixIdioma = "ca";
      } else if (datos.idioma === "Castellano") {
        prefixIdioma = "es";
      } else if (datos.idioma === "Inglés") {
        prefixIdioma = "en";
      }
      let asunto ="Proposta";
      if (prefixIdioma==="ca") asunto = "Proposta " 
      else if (prefixIdioma==="es") asunto = "Propuesta " 
      else if (prefixIdioma==="en") asunto = "Proposal " ;

      let tratamiento = TratamientoGeneroIdioma (datos.genero, prefixIdioma);

      // ✉️ 4️⃣ Enviar correo con el PDF adjunto
      asunto = asunto + " " + datos.obra + " - " + datos.codigo + " " + datos.presupuesto + "_" + datos.numcontrol;
      const cuerpo = getEmailTemplate("plantillaEnviarPresupuesto", prefixIdioma, "", { nombreCliente: datos.cliente, idPresupuesto: datos.presupuesto, tratamiento: tratamiento, proyectoMatriz: datos.obra });

      const carpeta = DriveApp.getFolderById(folderPDFFilesID);
      const archivos = carpeta.getFilesByName(soloNombre);

      if (!archivos.hasNext()) {
        throw new Error("No se encuentra el archivo: " + nombreArchivo);
      }
      const archivo = archivos.next();
      const mergedBlob = archivo.getBlob();

      const destinatarios = datos.destinatarios;
      //const destinatarios = "sanitefusta@gmail.com, tecnic.sanite@gmail.com"
      MailApp.sendEmail({
        to: destinatarios,
        cc: "tecnic@sanite.net",
        bcc: "sanitefusta@gmail.com",
        name: 'Sanite Fusta',
        replyTo: 'tecnic@sanite.net',
        subject: asunto,
        htmlBody: cuerpo,
        attachments: [mergedBlob]
      });

      Logger.log('📨 Correo enviado a: ' + datos.destinatarios);

    } catch (err) {
      Logger.log('❌ Error EnviarPresupuesto MADERA: ' + err);
      throw err;
    }

  })();
}





