/**
 * Devuelve la configuración global del proyecto
 */
function getProjectConfig() {
  const props = PropertiesService.getScriptProperties();

  return {
    sheetBDPresupuestosID: props.getProperty("ID_SHEET_BD_APP_PRESUPUESTOS"),
    sheetBDAppID: props.getProperty("ID_SHEET_BD_APP"),
    remitenteEmail: props.getProperty("EMAIL_REMITENTE"),
    remitenteNombre: props.getProperty("NOMBRE_REMITENTE")
  };
}
