
function test() {
  const e = { parameter: { pkPresupuesto: "993" } };
  const result = doGet(e);            // ejecutar
  Logger.log(result.getContent());    // ver HTML devuelto
}


//========= generar  TAREA a Paco para contactar con el cliente  ========
//=== esta funcion se llama desde un enlace en el mensaje de whatsapp o email de seguimiento de presupuestos que se envia al cliente


function doGet(e) {
  try {
    const pkPresupuesto = e.parameter.pkPresupuesto;   // 👈 cambiado
    if (!pkPresupuesto) {
      return HtmlService.createHtmlOutput("❌ Falta el parámetro pkPresupuesto.");
    }

    // ==========================================================
    // 1️⃣ Obtener presupuesto desde API
    // ==========================================================
     const urlPres = `http://82.223.115.25:3001/presupuestos/datos-presupuesto?pkPresupuesto=${pkPresupuesto}`;

    const responsePres = UrlFetchApp.fetch(urlPres, {
      method: "get",
      contentType: "application/json",
      muteHttpExceptions: true
    });

    if (responsePres.getResponseCode() !== 200) {
      return HtmlService.createHtmlOutput(
        "❌ Error API (" + responsePres.getResponseCode() + "): " +
        responsePres.getContentText()
      );
    }

    const rowObj = JSON.parse(responsePres.getContentText());

    Logger.log (rowObj);

    if (!rowObj) {
      return HtmlService.createHtmlOutput("❌ No existe presupuesto con ese ID.");
    }

    // ==========================================================
    // 2️⃣ Validar que APROBADO = "PENDIENTE"
    // ==========================================================
    if (rowObj.APROBADO !== "PENDIENTE") {
      return HtmlService.createHtmlOutput("✅ El presupuesto ya está aprobado o cerrado.");
    }

    // ==========================================================
    // 3️⃣ Generar comentario de tarea
    // ==========================================================
    const Comentario_Tarea =
      rowObj.PROYECTO_MATRIZ +
      " - El cliente solicitó desde WhatsApp ser contactado (" +
      pkPresupuesto + ")";   // 👈 cambiado

    // ==========================================================
    // 4️⃣ Crear la tarea usando la API (POST /tareas)
    // ==========================================================
    const now = new Date();

    const body = {
      idProyectoMatriz: rowObj.ID_PROYECTO_MATRIZ,
      fkProyectoMatriz: null,
      idProyecto: null,
      fkProyecto: null,
      fase: rowObj.Estado_Seguimiento,
      tarea: "PRESUPUESTO: Contactar con cliente",
      fechaRegistro: now.toISOString(),
      fechaVencimiento: now.toISOString().split("T")[0],
      idUsuario: "Administrador",
      fkUsuario: null,
      estadoTarea: "PENDIENTE",
      comentarios: Comentario_Tarea
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(body),
      muteHttpExceptions: true
    };

    const tareaResp = UrlFetchApp.fetch("http://82.223.115.25:3001/tareas", options);

    if (tareaResp.getResponseCode() !== 200 && tareaResp.getResponseCode() !== 201) {
      return HtmlService.createHtmlOutput("❌ Error creando tarea en API.");
    }

    // ==========================================================
    // 5️⃣ Respuesta final (HTML bonito)
    // ==========================================================
    const logoUrl = "https://sanite.es/wp-content/uploads/elementor/thumbs/cropped-sanite-q4kejl0cvf6n8q02d48kubcrkqql10p57jty78h0cg.png";

    const html = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            padding: 40px;
            background-color: #f7f7f7;
          }
          .card {
            display: inline-block;
            background: white;
            padding: 30px 40px;
            border-radius: 12px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
          }
          img {
            width: 120px;
            margin-bottom: 20px;
          }
          h2 {
            color: #2c7a7b;
            margin-bottom: 10px;
          }
          p {
            color: #333;
            font-size: 16px;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${logoUrl}" alt="Sanite Fusta">
          <h2>✅ ¡Gracias por su solicitud!</h2>
          <p>En breve contactaremos con usted.</p>
          <p><small>${new Date().toLocaleString()}</small></p>
        </div>
      </body>
    </html>
    `;

    return HtmlService.createHtmlOutput(html).setTitle("Confirmación de contacto");

  } catch (err) {
    return HtmlService.createHtmlOutput("⚠️ Error: " + err.message);
  }
}
