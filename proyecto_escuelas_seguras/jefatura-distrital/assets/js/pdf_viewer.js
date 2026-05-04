/* ==========================================================================
   PDF_VIEWER.JS - Integración con Adobe PDF Embed API
   ========================================================================== */

/* ==========================================================================
   CONFIGURACIÓN
   ========================================================================== */

// Reemplazar con tu Client ID de Adobe
const ADOBE_CLIENT_ID = "572d1f01286b4e2fa9aa2091885d5a58";

// URL del plano de evacuación (se obtiene de sessionStorage o se usa default)
function obtenerUrlPlano() {
    const planoGuardado = sessionStorage.getItem("plano_evacuacion_url");
    if (planoGuardado) return planoGuardado;
    
    return "http://localhost:5500/assets/uploads/plano_evacuacion.pdf";
}

/* ==========================================================================
   INICIALIZACIÓN
   ========================================================================== */

document.addEventListener("adobe_dc_view_sdk.ready", () => {
    inicializarVisorPlano();
    configurarDescargaPlano();
});

/* ==========================================================================
   VISOR DE PLANOS
   ========================================================================== */

function inicializarVisorPlano() {
    const contenedor = document.getElementById("visor-planos-adobe");
    if (!contenedor) return;

    const adobeDCView = new AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
        divId: "visor-planos-adobe"
    });

    adobeDCView.previewFile(
        {
            content: {
                location: {
                    url: obtenerUrlPlano()
                }
            },
            metaData: {
                fileName: "Plano de Evacuación - Establecimiento",
                hasDownload: false
            }
        },
        {
            embedMode: "SIZED_CONTAINER",
            defaultViewMode: "FIT_WIDTH",
            showAnnotationTools: false,
            showPrintPDF: false,
            showFullScreen: true,
            showDownloadPDF: false,
            showZoomControl: true,
            showThumbnails: true
        }
    );
}

/* ==========================================================================
   DESCARGA DEL PLANO
   ========================================================================== */

function configurarDescargaPlano() {
    const btnDescargar = document.getElementById("btn-descargar-plano");
    if (!btnDescargar) return;

    btnDescargar.addEventListener("click", () => {
        window.open(obtenerUrlPlano(), "_blank");
    });
}