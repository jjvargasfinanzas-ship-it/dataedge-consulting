// Meta Pixel — Data Edge
// 1. Crea el Pixel en Meta Events Manager: https://business.facebook.com/events_manager
// 2. Pega aquí el ID del Pixel (solo números) y publica.
//    Mientras diga PEGA_AQUI_TU_PIXEL_ID, el sitio funciona igual y no envía nada a Meta.
window.META_PIXEL_ID = 'PEGA_AQUI_TU_PIXEL_ID';

(function () {
    var id = window.META_PIXEL_ID;
    var activo = /^\d{6,}$/.test(id);

    // dePixel('CompleteRegistration', {...})  -> evento estándar de Meta
    // dePixel('DescargaPlantilla', {...}, true) -> evento personalizado
    window.dePixel = function (evento, datos, personalizado) {
        if (!activo || typeof window.fbq !== 'function') return;
        try { window.fbq(personalizado ? 'trackCustom' : 'track', evento, datos || {}); } catch (e) {}
    };

    if (!activo) return;

    !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
        t = b.createElement(e); t.async = !0; t.src = v;
        s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    window.fbq('init', id);
    window.fbq('track', 'PageView');
})();
