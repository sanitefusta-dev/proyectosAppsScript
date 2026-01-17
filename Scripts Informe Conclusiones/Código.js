/* SIN CAMBIOS DESPUES DE LA MIGRACION */ 

function GenerarInformeConclusiones(NumControl, IdProyecto, NombreProyecto, TextXilofags, TextEquips, TextSingularitats, TextEspecieFusta, TextClasseUs, TextForjatsCobertes, TextObjecte, TextResum) {

  const TEMPLATE_ID = "1detcuTOVBwVssDXFudWif9n8L1wsvncbf2XwApbeqmI";
  const FOLDER_ID = "1QYzjy6xSW_pnsnoZT9h_M5xP8DR4ilHg";
  
  const folder = DriveApp.getFolderById(FOLDER_ID);

  // 1. Eliminar versiones antiguas del mismo proyecto
  const files = folder.getFiles();
  const prefix = "INFORME_CONCLUSIONS_" + IdProyecto;
  while (files.hasNext()) {
    const file = files.next();
    if (file.getName().startsWith(prefix)) {
      file.setTrashed(true); // Mover a papelera
    }
  }

  // 2. Formatear número de control a 2 dígitos
  const NumControlFormatted = NumControl.toString().padStart(2, '0');
  const newFileName = `INFORME_CONCLUSIONS_${IdProyecto}_${NumControlFormatted}`;

  // 3. Hacer copia del documento plantilla
  const templateFile = DriveApp.getFileById(TEMPLATE_ID);
  const newFile = templateFile.makeCopy(newFileName, folder);
  const newDocId = newFile.getId();
  const doc = DocumentApp.openById(newDocId);
  const body = doc.getBody();

  // 4. Reemplazar los marcadores por los textos recibidos
  
  body.replaceText("<<NOM_PROJECTE>>", NombreProyecto || "");
  body.replaceText("<<TEXT_OBJECTE>>", TextObjecte || "");
  body.replaceText("<<TEXT_RESUM>>", TextResum || "");
  body.replaceText("<<TEXT_XILOFAGS>>", TextXilofags || "");
  body.replaceText("<<TEXT_EQUIPS>>", TextEquips || "");
  body.replaceText("<<TEXT_SINGULARITATS>>", TextSingularitats || "");
  body.replaceText("<<TEXT_ESPECIEFUSTA>>", TextEspecieFusta || "");
  body.replaceText("<<TEXT_CLASSEUS>>", TextClasseUs || "");
  body.replaceText("<<TEXT_FORJATSCOBERTES>>", TextForjatsCobertes || "");


  //------poner fecha al final

  var hoy = new Date();
  var mesosCatalans = ["gener", "febrer", "març", "abril", "maig", "juny", "juliol", "agost", "setembre", "octubre", "novembre", "desembre"];

  body.replaceText("<<dia>>", hoy.getDate().toString());
  body.replaceText("<<mes>>", mesosCatalans[hoy.getMonth()]);
  body.replaceText("<<anyo>>", hoy.getFullYear().toString());

  
  doc.saveAndClose();

  // 5. Devolver el ID del nuevo documento
  return newDocId;
}



