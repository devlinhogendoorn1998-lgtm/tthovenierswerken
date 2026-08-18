// ============================================
// Cookie Banner – TT Hovenierswerken
// Logica: toon banner, sla keuze op in localStorage
// ============================================

// // Sectie: Initialisatie – wacht op DOM
(function () {
    'use strict';

    const STORAGE_KEY = 'tt_cookie_consent';
    const banner = document.getElementById('cookie-banner');
    const btnAccept = document.getElementById('cookie-accept');
    const btnDecline = document.getElementById('cookie-decline');

    // // Sectie: Controleer of gebruiker al een keuze heeft gemaakt
    function hasConsent() {
        return localStorage.getItem(STORAGE_KEY) !== null;
    }

    // // Sectie: Toon de banner met animatie
    function showBanner() {
        if (!banner) return;
        // Kleine vertraging zodat de CSS-transitie zichtbaar is
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                banner.classList.add('visible');
            });
        });
    }

    // // Sectie: Verberg de banner met animatie
    function hideBanner() {
        if (!banner) return;
        banner.classList.remove('visible');
        banner.classList.add('hidden');
    }

    // // Sectie: Sla keuze op en verberg banner
    function saveConsent(value) {
        localStorage.setItem(STORAGE_KEY, value);
        hideBanner();
    }

    // // Sectie: Event listeners voor knoppen
    if (btnAccept) {
        btnAccept.addEventListener('click', function () {
            saveConsent('accepted');
        });
    }

    if (btnDecline) {
        btnDecline.addEventListener('click', function () {
            saveConsent('declined');
        });
    }

    // // Sectie: Start – toon banner alleen als nog geen keuze is gemaakt
    if (!hasConsent()) {
        showBanner();
    }

})();
