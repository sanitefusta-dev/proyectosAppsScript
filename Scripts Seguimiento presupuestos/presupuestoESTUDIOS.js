/* NO AFECTADO POR MIGRACION */



function GenerarPresupuestoESTUDIS( datosJson ) {

  (async () => {
    Logger.log('RAW datosJson: ' + String(datosJson));
    try {
      // 🔸 Datos a reemplazar en ambas plantillas
      const datos = JSON.parse(datosJson);

      Logger.log("datos.idioma: " + datos.idioma + " | es Castellano: " + (datos.idioma === "Castellano"));


      // 🔹 CONFIGURACIÓN INICIAL
      const folderDestinoId = '1ZtlAiREiznGJYFZms8CLxCxMVHkbxbTA'; // 📂 Carpeta destino PDF final

      let plantillaDocs1Id = ''; // 📘 DOC 1 - Portada
      let plantillaPresupuestoId1 = ''; //sin opciones
      let plantillaPresupuestoId2 = ''; //con opciones
      let pdfIds = [      ];

      if (datos.idioma === "Català") {
          plantillaDocs1Id = '1aFkwTubx_WYKYOX-Y0ksg-4uChz_hA5mYMGfw7n6OGM'; // 📘 DOC 1 - Portada
          plantillaPresupuestoId1 = '1ZBeLiy14_8s8Vd8SlL2-rPW_tSxpzhn_FTwwHhEFOfU'; //sin opciones
          plantillaPresupuestoId2 = '1j3_azVcfTd72psSliNsAdRhbRwKBeL0GaIrKo5qjiE8'; //con opciones
          pdfIds = [          
          '1iQgcpd3RRb6bnFZ6urO8ZtrbDIrCw9xi',  //E1
          '1Sb7XCZBMt0QOattVRnnaV4YrAmUcNmko',  //E2
          '1IhxNZOPp0S_2AHoC0y-U2uqv4MfvS9bY',  //E3
          '1tBX81fVj-gH_nOOHZSvTFLkocG9Zwptv',  //E4
          '1Ry7TXnuZqn0dveNmVZqnemcitQOmAO6j',  //E5
          '1_l_JyJC_0HwNLHTMdPTKqjBVH18XXf06',  //E7
          ];
      } else if (datos.idioma === "Castellano") {
          plantillaDocs1Id = '153seTD9XdSoIOzQbQGqb5u-yYXgoKThYlaF4sys5yf4'; // 📘 DOC 1 - Portada
          plantillaPresupuestoId1 = '1YhaBAsKiJflmvqtFQ1Ng8huuQU_YTag1jxBsutUbW8g'; //sin opciones
          plantillaPresupuestoId2 = '1rfD6ABPeo6cyAgwrdAuTAuYX-hyD1BXLqVfIA6l2SnY'; //con opciones
          pdfIds = [
          '12gdRkPoGZ_8tlsZtxPPudQhLXIZXKR0o',  //E1
          '12fYffyznCJhvz9sDvs8YVQacCGY2Oq4S',
          '1Mi3mNJ3yxccrgB-__108HWsRgx_-JZvL',
          '16hXWwSyxy6Dv3oOwyZBKUUn-f4zxp1AT',
          '1HQx5QRSfFGMZ_ywMx1dHa-0eDEWJ3g4P',
          '1GBjTVIPswGVsCAs2JFoAAAyykSUzWHqW',
          ];
      } else if (datos.idioma === "Inglés") {
          plantillaDocs1Id = '1aFkwTubx_WYKYOX-Y0ksg-4uChz_hA5mYMGfw7n6OGM'; // 📘 DOC 1 - Portada
          plantillaPresupuestoId1 = '1YhaBAsKiJflmvqtFQ1Ng8huuQU_YTag1jxBsutUbW8g'; //sin opciones
          plantillaPresupuestoId2 = '1rfD6ABPeo6cyAgwrdAuTAuYX-hyD1BXLqVfIA6l2SnY'; //con opciones
          pdfIds = [
          '12gdRkPoGZ_8tlsZtxPPudQhLXIZXKR0o',  //E1
          '12fYffyznCJhvz9sDvs8YVQacCGY2Oq4S',
          '1Mi3mNJ3yxccrgB-__108HWsRgx_-JZvL',
          '16hXWwSyxy6Dv3oOwyZBKUUn-f4zxp1AT',
          '1HQx5QRSfFGMZ_ywMx1dHa-0eDEWJ3g4P',
          '1GBjTVIPswGVsCAs2JFoAAAyykSUzWHqW',
          ];
      }

      let plantillaDocs2Id;
      if (datos.sumatotal > 0) {
        plantillaDocs2Id = plantillaPresupuestoId1; // Presupuesto sin opciones
      } else {
        plantillaDocs2Id = plantillaPresupuestoId2; // Presupuesto con opciones
      }

      const presupuestoLimpio = String(datos.presupuesto).replace(/[.,]/g, '');
      Logger.log ("presupuestoLimpio: " + presupuestoLimpio);
      const mergedName = `PRES ET01 ${presupuestoLimpio}_${datos.numcontrol}.pdf`;

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
      const pdfBytes1 = await crearPdfDesdeDocs(plantillaDocs1Id, 'Plantilla1', datos);
      const pdfBytes2 = await crearPdfDesdeDocs(plantillaDocs2Id, 'Plantilla2', datos);

      // 🧩 2️⃣ Crear documento PDF combinado
      const mergedPdf = await PDFDocument.create();

      // ➕ (1) Añadir primer Doc
      const pdf1 = await PDFDocument.load(pdfBytes1);
      const pages1 = await mergedPdf.copyPages(pdf1, pdf1.getPageIndices());
      pages1.forEach(p => mergedPdf.addPage(p));

      // ➕ (2) Añadir los primeros 4 PDFs
      for (let i = 0; i < 5; i++) {
        const blob = DriveApp.getFileById(pdfIds[i]).getBlob();
        const bytes = new Uint8Array(blob.getBytes().map(b => b & 0xFF));
        const srcPdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach(p => mergedPdf.addPage(p));
      }

      // ➕ (3) Añadir segundo Doc
      const pdf2 = await PDFDocument.load(pdfBytes2);
      const pages2 = await mergedPdf.copyPages(pdf2, pdf2.getPageIndices());
      pages2.forEach(p => mergedPdf.addPage(p));

      // ➕ (4) Añadir último PDF
      const lastBlob = DriveApp.getFileById(pdfIds[5]).getBlob();
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


//===========================  ENVIAR PRESUPUESTO ESTUDIS ========
function EnviarPresupuestoESTUDIS( datosJson, nombreArchivo ) {

  (async () => {
    const folderPDFFilesID = '1ZtlAiREiznGJYFZms8CLxCxMVHkbxbTA'; // 📂 Carpeta  PDF 
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
      asunto = asunto + " " + datos.obra + " - " + datos.presupuesto + "_" + datos.numcontrol;
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
      Logger.log('❌ Error EnviarPresupuestoESTUDIS: ' + err);
      throw err;
    }

  })();
}





