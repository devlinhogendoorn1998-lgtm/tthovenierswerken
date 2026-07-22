// Sectie: Hexagon Canvas Achtergrond – transparante hexagons over alle pagina's
(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'hexagon-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    const ctx = canvas.getContext('2d');

    // Hexagon configuratie
    const HEX_SIZE   = 38;   // straal van elke hexagon
    const HEX_GAP    = 4;    // ruimte tussen hexagons
    const GOLD       = 'rgba(201,168,76,';
    const SPEED      = 0.0008; // animatiesnelheid

    let W, H, cols, rows, hexagons;
    let animFrame;
    let startTime = performance.now();

    // Bereken hexagon grid
    // Sectie: DOM reads eerst, daarna writes – voorkomt forced reflow
    function buildGrid() {
        // Lees dimensies eerst (batch read)
        const newW = window.innerWidth;
        const newH = window.innerHeight;
        // Schrijf daarna naar canvas (batch write)
        W = canvas.width  = newW;
        H = canvas.height = newH;

        const colW = (HEX_SIZE * 2) + HEX_GAP;
        const rowH = (Math.sqrt(3) * HEX_SIZE) + HEX_GAP;

        cols = Math.ceil(W / colW) + 2;
        rows = Math.ceil(H / rowH) + 2;

        hexagons = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const offsetX = (r % 2 === 0) ? 0 : (HEX_SIZE + HEX_GAP / 2);
                const x = c * colW + offsetX - HEX_SIZE;
                const y = r * rowH - HEX_SIZE;
                // Elke hexagon krijgt een willekeurige fase voor de puls
                hexagons.push({ x, y, phase: Math.random() * Math.PI * 2 });
            }
        }
    }

    // Teken één hexagon
    function drawHex(x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 180) * (60 * i - 30);
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
    }

    // Animatielus
    function render(now) {
        ctx.clearRect(0, 0, W, H);
        const elapsed = (now - startTime) * SPEED;

        hexagons.forEach(function (hex) {
            // Pulserende opacity: 0.03 – 0.13
            const pulse = 0.03 + 0.10 * (0.5 + 0.5 * Math.sin(elapsed + hex.phase));

            drawHex(hex.x, hex.y, HEX_SIZE - 2);

            // Rand
            ctx.strokeStyle = GOLD + (pulse * 1.4).toFixed(3) + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Subtiele vulling
            ctx.fillStyle = GOLD + pulse.toFixed(3) + ')';
            ctx.fill();
        });

        animFrame = requestAnimationFrame(render);
    }

    // Resize handler
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            cancelAnimationFrame(animFrame);
            buildGrid();
            animFrame = requestAnimationFrame(render);
        }, 150);
    });

    buildGrid();
    animFrame = requestAnimationFrame(render);
})();

// Sectie: Hamburger Menu Toggle
(function () {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('mainNav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
            // Animeer hamburger naar kruis
            const spans = toggle.querySelectorAll('span');
            toggle.classList.toggle('active');
            if (toggle.classList.contains('active')) {
                spans[0].style.transform = 'translateY(7px) rotate(45deg)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
            } else {
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });

        // Sluit menu bij klik op een link
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                const spans = toggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            });
        });

        // Sluit menu bij klik buiten nav
        document.addEventListener('click', function (e) {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                nav.classList.remove('open');
                toggle.classList.remove('active');
                const spans = toggle.querySelectorAll('span');
                spans[0].style.transform = '';
                spans[1].style.opacity = '';
                spans[2].style.transform = '';
            }
        });
    }
})();

// Sectie: Header scroll-effect (transparant → donker)
(function () {
    const header = document.querySelector('.site-header');
    if (!header) return;

    // Sectie: Scroll handler – lees scrollY eerst, schrijf stijl daarna via rAF
    function onScroll() {
        // Batch read: lees geometrische waarde buiten rAF
        const scrolled = window.scrollY > 60;
        // Batch write: DOM-mutatie in requestAnimationFrame om forced reflow te voorkomen
        requestAnimationFrame(function () {
            header.style.boxShadow = scrolled
                ? '0 4px 24px rgba(0,0,0,0.5)'
                : 'none';
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Sectie: EmailJS Core – gedeelde configuratie & verzendfunctie voor ALLE formulieren
// Zowel het offerteformulier (aanleg/onderhoud/beregening/meerdere) op index.html
// als de beregening-rekentool op beregening.html vallen onder dezelfde EmailJS-koppeling ("1 ding").
var TT_EMAILJS_PUBLIC_KEY  = 'wtlD1ny4zM9wUaf-y';
var TT_EMAILJS_SERVICE_ID  = 'service_02uys6i';
var TT_EMAILJS_TEMPLATE_ID = 'template_d57hl8b';

(function () {
    // Eenmalige EmailJS initialisatie – wordt door alle formulieren op de site herbruikt
    if (typeof emailjs !== 'undefined') {
        emailjs.init(TT_EMAILJS_PUBLIC_KEY);
    } else {
        console.error('EmailJS SDK is niet gevonden. Controleer of het EmailJS <script> correct geladen is vóórdat script.js uitgevoerd wordt.');
    }
})();

// // Gedeelde verzendfunctie: gebruikt door zowel het offerteformulier als de beregening-rekentool.
// // Zo lopen alle aanvragen (aanleg, onderhoud, beregening, meerdere) via exact dezelfde EmailJS-koppeling.
function ttVerzendAanvraag(templateParams, submitBtn, onSuccess, onError) {
    const origineleTekst = submitBtn ? submitBtn.textContent : '';

    if (submitBtn) {
        submitBtn.textContent = 'Verzenden...';
        submitBtn.disabled = true;
    }

    // Vangnet: als de EmailJS SDK niet geladen is, direct duidelijke foutmelding tonen
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS fout: SDK niet beschikbaar op het moment van verzenden.');
        if (submitBtn) {
            submitBtn.textContent = origineleTekst;
            submitBtn.disabled = false;
        }
        alert('Er is iets misgegaan: het verzendsysteem kon niet worden geladen. Probeer de pagina te vernieuwen of neem contact op via info@tthovenierswerken.nl.');
        if (onError) onError();
        return;
    }

    emailjs.send(TT_EMAILJS_SERVICE_ID, TT_EMAILJS_TEMPLATE_ID, templateParams)
        .then(function (response) {
            if (submitBtn) {
                submitBtn.textContent = origineleTekst;
                submitBtn.disabled = false;
            }
            if (onSuccess) onSuccess(response);
        })
        .catch(function (err) {
            // // Log de volledige EmailJS-foutmelding in de console voor debugging
            console.error('EmailJS fout:', err);
            if (submitBtn) {
                submitBtn.textContent = origineleTekst;
                submitBtn.disabled = false;
            }
            const detail = (err && err.text) ? ' (' + err.text + ')' : '';
            alert('Er is iets misgegaan bij het verzenden' + detail + '. Probeer het opnieuw of neem direct contact op via info@tthovenierswerken.nl.');
            if (onError) onError(err);
        });
}

// Sectie: Offerte formulier – validatie & verzenden via EmailJS (index.html – aanleg/onderhoud/beregening/meerdere)
(function () {
    const form = document.getElementById('quoteForm');
    if (!form) return;

    // Succes modal elementen
    const successModal = document.getElementById('successModal');
    const successClose = document.getElementById('successClose');

    // Sluit modal bij klik op knop of buiten de box
    if (successClose) {
        successClose.addEventListener('click', function () {
            successModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    if (successModal) {
        successModal.addEventListener('click', function (e) {
            if (e.target === successModal) {
                successModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Eenvoudige validatie
        const naam      = document.getElementById('naam');
        const telefoon  = document.getElementById('telefoon');
        const email     = document.getElementById('email');
        const adres     = document.getElementById('adres');
        const dienst    = document.getElementById('dienst');

        let geldig = true;
        const velden = [naam, telefoon, email, adres, dienst];

        velden.forEach(function (veld) {
            if (!veld) return;
            if (!veld.value.trim()) {
                veld.style.borderColor = '#e05555';
                geldig = false;
            } else {
                veld.style.borderColor = '';
            }
        });

        // E-mail validatie
        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.style.borderColor = '#e05555';
            geldig = false;
        }

        if (!geldig) {
            // Scroll naar eerste fout
            const eersteVeld = form.querySelector('[style*="e05555"]');
            if (eersteVeld) {
                eersteVeld.scrollIntoView({ behavior: 'smooth', block: 'center' });
                eersteVeld.focus();
            }
            return;
        }

        // Bouw template parameters op voor EmailJS
        const dienstLabels = {
            aanleg:      'Tuinaanleg',
            onderhoud:   'Tuinonderhoud',
            beregening:  'Beregening & Irrigatie',
            meerdere:    'Meerdere diensten'
        };

        const berichtEl     = document.getElementById('bericht');

        const dienstLabel   = dienstLabels[dienst.value] || dienst.value;
        const berichtTekst  = (berichtEl && berichtEl.value.trim()) ? berichtEl.value.trim() : 'Geen omschrijving opgegeven';

        // Template variabelen – komen overeen met {{variabele}} in EmailJS template
        const templateParams = {
            naam:        naam.value.trim(),
            telefoon:    telefoon.value.trim(),
            phone:       telefoon.value.trim(),
            email:       email.value.trim(),
            adres:       adres.value.trim(),
            dienst:      dienstLabel,
            bericht:     berichtTekst,
            to_email:    'info@tthovenierswerken.nl'
        };

        const submitBtn = form.querySelector('.submit-btn');

        // Verstuur via de gedeelde EmailJS-koppeling ("1 ding") – zelfde functie als de beregening-rekentool
        ttVerzendAanvraag(templateParams, submitBtn, function () {
            // Toon succes modal
            if (successModal) {
                successModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            // Reset formulier
            form.reset();
        });
    });

    // Verwijder rode rand bij typen
    form.querySelectorAll('input, select, textarea').forEach(function (veld) {
        veld.addEventListener('input', function () {
            this.style.borderColor = '';
        });
        veld.addEventListener('change', function () {
            this.style.borderColor = '';
        });
    });
})();

// Sectie: Smooth scroll voor anker-links
(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const headerHeight = parseInt(
                    getComputedStyle(document.documentElement)
                        .getPropertyValue('--header-height') || '80'
                );
                const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });
})();

// Sectie: Flip cards – touch support voor mobiel
(function () {
    document.querySelectorAll('.flip-card').forEach(function (card) {
        card.addEventListener('click', function () {
            // Op touch-apparaten: toggle klasse voor flip
            if (window.matchMedia('(hover: none)').matches) {
                this.classList.toggle('flipped');
                const inner = this.querySelector('.flip-card-inner');
                if (inner) {
                    inner.style.transform = this.classList.contains('flipped')
                        ? 'rotateY(180deg)'
                        : '';
                }
            }
        });
    });
})();

// Sectie: Beregening – Spoed Modal (storing & reparatie)
(function () {
    const spoedBtn   = document.getElementById('spoedBtn');
    const spoedModal = document.getElementById('spoedModal');
    if (!spoedBtn || !spoedModal) return;

    const closeBtn = spoedModal.querySelector('.close-modal');

    function openModal() {
        spoedModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        spoedModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    spoedBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    spoedModal.addEventListener('click', function (e) {
        if (e.target === spoedModal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && spoedModal.classList.contains('active')) closeModal();
    });
})();

// Sectie: Beregening – Tarieventabel rijen koppelen aan de rekentool
(function () {
    const rows = document.querySelectorAll('.grond-row');
    if (!rows.length) return;

    function selectFromRow(row) {
        const grond = row.getAttribute('data-grond');
        const card  = document.querySelector('.grond-card[data-grond="' + grond + '"]');
        if (card) {
            card.click();
            const calcSection = document.getElementById('calculator');
            if (calcSection) {
                const headerHeight = parseInt(
                    getComputedStyle(document.documentElement).getPropertyValue('--header-height') || '80'
                );
                const top = calcSection.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        }
        rows.forEach(function (r) { r.classList.remove('selected'); });
        row.classList.add('selected');
    }

    rows.forEach(function (row) {
        row.addEventListener('click', function () { selectFromRow(row); });
        row.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectFromRow(row);
            }
        });
    });
})();

// Sectie: Beregening – Meerstaps rekentool (grondsoort → meters → gegevens)
(function () {
    const calcForm = document.getElementById('calcForm');
    if (!calcForm) return;

    const START_TARIEF = 80; // // Starttarief in euro, excl. btw

    const steps          = calcForm.querySelectorAll('.calc-step');
    const progressSteps  = document.querySelectorAll('.calc-progress-step');
    const grondCards     = calcForm.querySelectorAll('.grond-card');
    const metersRange     = document.getElementById('metersRange');
    const metersInput     = document.getElementById('metersInput');
    const metersValueSpan = document.getElementById('metersValue');
    const previewMetersLabel = document.getElementById('previewMetersLabel');
    const previewMeters   = document.getElementById('previewMeters');
    const previewTotal    = document.getElementById('previewTotal');
    const finalPriceDisplay = document.getElementById('finalPriceDisplay');

    let state = {
        grond: null,
        price: null,
        meters: 10
    };

    const grondLabels = {
        laag:      'Zachte grond (zand/losse aarde)',
        gemiddeld: 'Gemiddelde grond (tuingrond/lichte klei)',
        hoog:      'Harde grond (zware klei/wortels/puin)'
    };

    // // Formatteer een getal als euro-string, bv. 160 -> "€ 160,00"
    function formatEuro(n) {
        return '€ ' + n.toFixed(2).replace('.', ',');
    }

    // // Bereken de totale richtprijs op basis van huidige state
    function calcTotal() {
        if (!state.price) return START_TARIEF;
        return START_TARIEF + (state.price * state.meters);
    }

    // // Werk de live prijsweergave in stap 2 en 3 bij
    function updatePricePreview() {
        const metersPrice = state.price ? state.price * state.meters : 0;
        const total = calcTotal();

        if (previewMetersLabel) {
            previewMetersLabel.textContent = state.meters + ' m × ' + (state.price ? formatEuro(state.price) : '€ 0,00');
        }
        if (previewMeters) previewMeters.textContent = formatEuro(metersPrice);
        if (previewTotal) previewTotal.textContent = formatEuro(total);
        if (finalPriceDisplay) finalPriceDisplay.textContent = formatEuro(total);
    }

    // // Ga naar een specifieke stap en werk de voortgangsindicator bij
    function goToStep(stepNum) {
        steps.forEach(function (step) {
            step.classList.toggle('active', step.getAttribute('data-step') === String(stepNum));
        });
        progressSteps.forEach(function (ps) {
            const n = parseInt(ps.getAttribute('data-progress'), 10);
            ps.classList.toggle('active', n === stepNum);
            ps.classList.toggle('done', n < stepNum);
        });
        // // Scroll de calculator-box in beeld bij stapwissel op mobiel
        const box = document.querySelector('.calculator-box');
        if (box) {
            const rect = box.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight * 0.5) {
                box.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // // Stap 1: Grondsoort selectie
    grondCards.forEach(function (card) {
        card.addEventListener('click', function () {
            grondCards.forEach(function (c) { c.classList.remove('selected'); });
            card.classList.add('selected');
            state.grond = card.getAttribute('data-grond');
            state.price = parseFloat(card.getAttribute('data-price'));

            const nextBtn = calcForm.querySelector('.calc-next[data-next="2"]');
            if (nextBtn) nextBtn.disabled = false;

            updatePricePreview();
        });
    });

    // // Stap 2: Meters – range + number input gesynchroniseerd
    if (metersRange && metersInput) {
        function syncMeters(value) {
            let v = parseInt(value, 10);
            if (isNaN(v) || v < 1) v = 1;
            if (v > 500) v = 500;
            state.meters = v;
            metersRange.value = Math.min(v, parseInt(metersRange.max, 10));
            metersInput.value = v;
            if (metersValueSpan) metersValueSpan.textContent = v;
            updatePricePreview();
        }

        metersRange.addEventListener('input', function () { syncMeters(metersRange.value); });
        metersInput.addEventListener('input', function () { syncMeters(metersInput.value); });
    }

    // // Navigatie: volgende stap
    calcForm.querySelectorAll('.calc-next').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const next = parseInt(btn.getAttribute('data-next'), 10);
            goToStep(next);
        });
    });

    // // Navigatie: vorige stap
    calcForm.querySelectorAll('.calc-back').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const back = parseInt(btn.getAttribute('data-back'), 10);
            goToStep(back);
        });
    });

    // // Verzenden: via de gedeelde EmailJS-koppeling ("1 ding") – zelfde functie als het offerteformulier
    calcForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const naam     = document.getElementById('calcNaam');
        const telefoon = document.getElementById('calcTelefoon');
        const email    = document.getElementById('calcEmail');
        const adres    = document.getElementById('calcAdres');
        const bericht  = document.getElementById('calcBericht');

        let geldig = true;
        [naam, telefoon, email, adres].forEach(function (veld) {
            if (!veld) return;
            if (!veld.value.trim()) {
                veld.style.borderColor = '#e05555';
                geldig = false;
            } else {
                veld.style.borderColor = '';
            }
        });

        if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            email.style.borderColor = '#e05555';
            geldig = false;
        }

        if (!state.grond) {
            geldig = false;
            goToStep(1);
        }

        if (!geldig) {
            const eersteVeld = calcForm.querySelector('[style*="e05555"]');
            if (eersteVeld) {
                eersteVeld.scrollIntoView({ behavior: 'smooth', block: 'center' });
                eersteVeld.focus();
            }
            return;
        }

        const total = calcTotal();
        const berichtTekst =
            'Aanvraag via beregening-rekentool.\n' +
            'Grondsoort: ' + (grondLabels[state.grond] || state.grond) + '\n' +
            'Aantal strekkende meter: ' + state.meters + ' m\n' +
            'Starttarief: ' + formatEuro(START_TARIEF) + '\n' +
            'Meterprijs: ' + formatEuro(state.price) + ' per meter\n' +
            'Indicatieve richtprijs: ' + formatEuro(total) + ' (excl. btw & materiaal)\n\n' +
            'Opmerkingen klant: ' + ((bericht && bericht.value.trim()) ? bericht.value.trim() : 'Geen opmerkingen');

        const templateParams = {
            naam:        naam.value.trim(),
            telefoon:    telefoon.value.trim(),
            phone:       telefoon.value.trim(),
            email:       email.value.trim(),
            adres:       adres.value.trim(),
            dienst:      'Beregening & Irrigatie',
            bericht:     berichtTekst,
            to_email:    'info@tthovenierswerken.nl'
        };

        const submitBtn = calcForm.querySelector('.submit-btn');

        // Verstuur via de gedeelde EmailJS-koppeling ("1 ding") – zelfde functie als het offerteformulier
        ttVerzendAanvraag(templateParams, submitBtn, function () {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
            calcForm.reset();
            grondCards.forEach(function (c) { c.classList.remove('selected'); });
            state = { grond: null, price: null, meters: 10 };
            if (metersValueSpan) metersValueSpan.textContent = '10';
            updatePricePreview();
            goToStep(1);
            const nextBtn = calcForm.querySelector('.calc-next[data-next="2"]');
            if (nextBtn) nextBtn.disabled = true;
        });
    });

    // // Verwijder rode rand bij typen
    calcForm.querySelectorAll('input, textarea').forEach(function (veld) {
        veld.addEventListener('input', function () { this.style.borderColor = ''; });
    });

    // // Initiële prijsweergave
    updatePricePreview();
})();

// Sectie: Success Modal sluiten – gedeeld door offerteformulier en rekentool
(function () {
    const successModal = document.getElementById('successModal');
    const successClose  = document.getElementById('successClose');
    if (!successModal) return;

    // Voorkom dubbele binding als index.html al eigen listener heeft toegevoegd
    if (successModal.dataset.bound === 'true') return;
    successModal.dataset.bound = 'true';

    if (successClose) {
        successClose.addEventListener('click', function () {
            successModal.style.display = 'none';
            document.body.style.overflow = '';
        });
    }
    successModal.addEventListener('click', function (e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
})();
