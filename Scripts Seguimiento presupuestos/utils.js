/* NO AFECTADO POR MIGRACION */

/**
 * Devuelve la fecha actual en formato dd/mm/yyyy
 */
function getFechaHoy() {
  const hoy = new Date();
  return Utilities.formatDate(hoy, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

/**
 * corrige fecha para API
 */
function parseFechaSafe(valor) {
  if (!valor) return null;
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Genera un ID_TAREA único con formato tipo AppSheet
 * Ejemplo: T251030104712
 */
function generarIdTarea() {
  const now = new Date();
  const tz = Session.getScriptTimeZone();
  const y = Utilities.formatDate(now, tz, "yy");
  const M = Utilities.formatDate(now, tz, "MM");
  const d = Utilities.formatDate(now, tz, "dd");
  const h = Utilities.formatDate(now, tz, "HH");
  const m = Utilities.formatDate(now, tz, "mm");
  const r = Math.floor(Math.random() * 90 + 10); // 10–99
  return `T${y}${M}${d}${h}${m}${r}`;
}


// Devuelve tratamiento de la persona segun idioma y genero
function TratamientoGeneroIdioma (genero, prefixIdioma) {
    let tratamiento = "Benvolgut ";
    if (genero==="Femenino" && prefixIdioma === "ca") {
      tratamiento = "Benvolguda ";
    } else if (genero==="Masculino" && prefixIdioma === "ca") {
      tratamiento = "Benvolgut ";
    } else if (genero==="Femenino" && prefixIdioma === "es") {
      tratamiento = "Apreciada ";
    } else if (genero==="Masculino" && prefixIdioma === "es") {
      tratamiento = "Apreciado ";
    } else if (genero==="Femenino" && prefixIdioma === "en") {
      tratamiento = "Dear ";
    }  else if (genero==="Masculino" && prefixIdioma === "en") {
      tratamiento = "Dear ";
    }

    return tratamiento;
}

/**
 * Formatea la fecha en formato dd mmmm yyyy  segun idioma
 */

function fechaFormateadaConIdioma(fecha, prefixIdioma) {
  // Asegurar que la fecha es objeto Date
  if (!(fecha instanceof Date)) {
    fecha = new Date(fecha);
  }

  // Meses por idioma
  const meses = {
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio",
         "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    
    ca: ["gener", "febrer", "març", "abril", "maig", "juny",
         "juliol", "agost", "setembre", "octubre", "novembre", "desembre"],
    
    en: ["January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"]
  };

  // Si el idioma no existe, usar español por defecto
  const idioma = meses[prefixIdioma] ? prefixIdioma : "es";

  const dia = fecha.getDate();
  const mes = meses[idioma][fecha.getMonth()];
  const año = fecha.getFullYear();

  // Construir string final
  return `${dia} ${mes} ${año}`;
}


