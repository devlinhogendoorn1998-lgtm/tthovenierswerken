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

// Sectie: Offerte formulier – dienst selectie & prijscalculator
(function () {
    const dienstSelect = document.getElementById('dienst');
    const hogedrukFields = document.getElementById('hogedrukFields');
    const priceIndicator = document.getElementById('priceIndicator');
    const calculatedPrice = document.getElementById('calculatedPrice');
    const oppervlakteInput = document.getElementById('oppervlakte');

    if (!dienstSelect) return;

    // Toon/verberg hogedruk velden op basis van dienst keuze
    dienstSelect.addEventListener('change', function () {
        const val = this.value;

        if (val === 'hogedruk') {
            hogedrukFields.style.display = 'block';
            // Trigger berekening als er al een waarde is
            if (oppervlakteInput && oppervlakteInput.value) {
                berekenPrijs(parseFloat(oppervlakteInput.value));
            }
        } else {
            if (hogedrukFields) hogedrukFields.style.display = 'none';
            if (priceIndicator) priceIndicator.style.display = 'none';
        }
    });

    // Prijsberekening hogedrukreiniging
    function berekenPrijs(m2) {
        if (!priceIndicator || !calculatedPrice) return;
        const TARIEF = 7;
        const MINIMUM = 250;
        const berekend = Math.max(m2 * TARIEF, MINIMUM);
        calculatedPrice.textContent = '€' + berekend.toLocaleString('nl-NL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }) + ',-';
        priceIndicator.style.display = 'block';
    }

    if (oppervlakteInput) {
        oppervlakteInput.addEventListener('input', function () {
            const val = parseFloat(this.value);
            if (val > 0 && dienstSelect.value === 'hogedruk') {
                berekenPrijs(val);
            } else {
                if (priceIndicator) priceIndicator.style.display = 'none';
            }
        });
    }
})();

// Sectie: Offerte formulier – validatie & verzenden via EmailJS
(function () {
    // EmailJS initialisatie met public key
    if (typeof emailjs !== 'undefined') {
        emailjs.init('wtlD1ny4zM9wUaf-y');
    }

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
            aanleg:    'Tuinaanleg',
            onderhoud: 'Tuinonderhoud',
            hogedruk:  'Hogedrukreiniging',
            meerdere:  'Meerdere diensten'
        };

        const oppervlakteEl = document.getElementById('oppervlakte');
        const berichtEl     = document.getElementById('bericht');

        const dienstLabel   = dienstLabels[dienst.value] || dienst.value;
        const oppervlakte   = (oppervlakteEl && oppervlakteEl.value) ? oppervlakteEl.value + ' m²' : 'Niet opgegeven';
        const berichtTekst  = (berichtEl && berichtEl.value.trim()) ? berichtEl.value.trim() : 'Geen omschrijving opgegeven';

        // Template variabelen – komen overeen met {{variabele}} in EmailJS template
        const templateParams = {
            naam:        naam.value.trim(),
            telefoon:    telefoon.value.trim(),
            email:       email.value.trim(),
            adres:       adres.value.trim(),
            dienst:      dienstLabel,
            oppervlakte: dienst.value === 'hogedruk' ? oppervlakte : 'Niet van toepassing',
            bericht:     berichtTekst
        };

        // Verzendknop: laadstatus
        const submitBtn = form.querySelector('.submit-btn');
        const origineleTekst = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.textContent = 'Verzenden...';
            submitBtn.disabled = true;
        }

        // Verstuur via EmailJS
        emailjs.send('service_02uys6i', 'template_d57hl8b', templateParams)
            .then(function () {
                // Toon succes modal
                if (successModal) {
                    successModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }

                // Reset formulier
                form.reset();
                const hogedrukFields = document.getElementById('hogedrukFields');
                const priceIndicator = document.getElementById('priceIndicator');
                if (hogedrukFields) hogedrukFields.style.display = 'none';
                if (priceIndicator) priceIndicator.style.display = 'none';

                // Reset knop
                if (submitBtn) {
                    submitBtn.textContent = origineleTekst;
                    submitBtn.disabled = false;
                }
            })
            .catch(function (err) {
                console.error('EmailJS fout:', err);
                // Herstel knop bij fout
                if (submitBtn) {
                    submitBtn.textContent = origineleTekst;
                    submitBtn.disabled = false;
                }
                alert('Er is iets misgegaan bij het verzenden. Probeer het opnieuw of neem direct contact op.');
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
