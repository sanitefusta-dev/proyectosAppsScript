/**
 * Devuelve la lista de documentos por idioma y código
 */

const portada_ca = '1YSY2cLa9nIHJcp_01MWP8syfcqezd_ZGzTyBMmgglv8';
const importe_ca = '1EXhdaMe28VV_YdPPLld-EY8-dVmo6yNpfV8-4FOcBxc';
const p1_12_ca = '1qNqp8z-BWqUOxcTcCSFioKAzKHZDoGIC';
const p1_34_ca = '1ch3TV59my2eyRaL1R4gZZYrBUSW7ySsk';
const p1_5_ca = '1Q3ICmAOPGs4Y49QkAjfiH4iD_dSrpv37';
const p2_1234_ca = '11HlS20x41UQwXl4rvCN_DXM-z8sk79vP';
const p2_5_ca = '1Q3ICmAOPGs4Y49QkAjfiH4iD_dSrpv37';
const p3_13_ca = '1um_6BeqYV0APLqfOr9qg1f2MwzFwQ-Ay';
const p3_245_ca = '1FIj6LDBCfMwgDf1FFkXwDfkKwGpaMwxV';
const p5_ca = '1eAbatZOFf0QG0ecYxu0w2NZBo2Ywnu-z';


const portada_es = '15UQ9uT8_oywDTxuKrTkJzALiTjF5hQJDC1fZvfsYSOc';
const importe_es = '1Abcdup4v13XOJi8mpcDkHVy6JSje7Yp7Ez2sRoX7_P4';
const p1_12_es = '195LNKnN3XgIaw9z4BwRzvu1w8l7YL_QP';
const p1_34_es = '10TbIEEiejfe0rOwPDs4TtXL86AcyWzTo';
const p1_5_es = '1RMR2gYyC3eqFAsw3i38yIYOmDfn4tetT';
const p2_1234_es = '17fdNfGucByzQ8MGZzsBwLVznsuJwGAPJ';
const p2_5_es = '1FTfEMz9GNmPJUGEwRT9AWxS4MYPSIiXv';
const p3_13_es = '18CeW8F72kRW9CJM5pEYDrQKfKDwPk0bt';
const p3_245_es = '15LmNskCf0ONEs196-oNuXqnPKwfQSPsH';
const p5_es = '1mg430d3LaMXp9TgI94ArTP67bmXIkzvg';


function getListaDocsMadera() {
  return {

    "Català": {
      MD01: {
        portada: portada_ca,
        importe: importe_ca,
        pdfs: [
          p1_12_ca,
          p2_1234_ca,
          p3_13_ca,
          p5_ca,
        ]
      },
      MD02: {
        portada: portada_ca,
        importe: importe_ca,
        pdfs: [
          p1_12_ca,
          p2_1234_ca,
          p3_245_ca,
          p5_ca,
        ]
      },
      MD03: {
        portada: portada_ca,
        importe: importe_ca,
        pdfs: [
          p1_34_ca,
          p2_1234_ca,
          p3_13_ca,
          p5_ca,
        ]
      },
      MD04: {
        portada: portada_ca,
        importe: importe_ca,
        pdfs: [
          p1_34_ca,
          p2_1234_ca,
          p3_245_ca,
          p5_ca,
        ]
      },
      MD05: {
        portada: portada_ca,
        importe: importe_ca,
        pdfs: [
          p1_5_ca,
          p2_5_ca,
          p3_245_ca,
          p5_ca,
        ]
      }
    },

    "Castellano": {
      MD01: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_12_es,
          p2_1234_es,
          p3_13_es,
          p5_es,
        ]
      },
      MD02: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_12_es,
          p2_1234_es,
          p3_245_es,
          p5_es,
        ]
      },
      MD03: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_34_es,
          p2_1234_es,
          p3_13_es,
          p5_es,
        ]
      },
      MD04: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_34_es,
          p2_1234_es,
          p3_245_es,
          p5_es,
        ]
      },
      MD05: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_5_es,
          p2_5_es,
          p3_245_es,
          p5_es,
        ]
      }
    },

    "Inglés": {
      MD01: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_12_es,
          p2_1234_es,
          p3_13_es,
          p5_es,
        ]
      },
      MD02: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_12_es,
          p2_1234_es,
          p3_245_es,
          p5_es,
        ]
      },
      MD03: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_34_es,
          p2_1234_es,
          p3_13_es,
          p5_es,
        ]
      },
      MD04: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_34_es,
          p2_1234_es,
          p3_245_es,
          p5_es,
        ]
      },
      MD05: {
        portada: portada_es,
        importe: importe_es,
        pdfs: [
          p1_5_es,
          p2_5_es,
          p3_245_es,
          p5_es,
        ]
      }
    }

  };
}





function testGetLista() {
  const listaDocs = getListaDocsMadera();

Logger.log(
  JSON.stringify(
    listaDocs["Català"]["MD01"],
    null,
    2
  )
);

Logger.log(
  JSON.stringify(
    listaDocs["Inglés"]["MD05"],
    null,
    2
  )
);

}


