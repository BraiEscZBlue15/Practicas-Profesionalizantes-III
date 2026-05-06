/* ==========================================================================
   PDF_VIEWER.JS - Integración con Adobe PDF Embed API
   ========================================================================== */

const ADOBE_CLIENT_ID = "572d1f01286b4e2fa9aa2091885d5a58";

function obtenerUrlPlano() {
    const planoGuardado = obtenerDeStorage("plano_evacuacion_url");
    return planoGuardado || "../assets/uploads/plano_evacuacion.pdf";
}

document.addEventListener("adobe_dc_view_sdk.ready", () => {
    inicializarVisorPlano();
    configurarDescargaPlano();
});

function inicializarVisorPlano() {
    const contenedor = document.getElementById("visor-planos-adobe");
    if (!contenedor) return;

    const planoUrl = obtenerUrlPlano();
    if (!planoUrl) return;

    const adobeDCView = new AdobeDC.View({
        clientId: ADOBE_CLIENT_ID,
        divId: "visor-planos-adobe"
    });

    adobeDCView.previewFile(
        {
            content: {
                location: {
                    url: planoUrl
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

function configurarDescargaPlano() {
    const btnDescargar = document.getElementById("btn-descargar-plano");
    if (!btnDescargar) return;

    btnDescargar.addEventListener("click", () => {
        const planoUrl = obtenerUrlPlano();
        if (planoUrl) {
            window.open(planoUrl, "_blank");
        }
    });
}