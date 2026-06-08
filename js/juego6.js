document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const zonaNumero = document.getElementById('zona-numero');
    const bancoOpciones = document.getElementById('banco-opciones');
    const btnSiguiente = document.getElementById('btnSig');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    // CONEXIÓN A LA MOCHILA VIRTUAL (Rescatamos los puntos de juegos anteriores)
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablarTexto(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Actualiza visualmente el marcador ❤️ en la esquina superior
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }

    // Inicialización del puntaje en pantalla
    actualizarMarcadorVisual();

    // Sistema de Karaoke Inteligente basado en Pronunciación Real
    function ejecutarKaraoke() {
        window.speechSynthesis.cancel();
        const textoCompleto = "Observa la recta numérica. Qué precio se ubica exactamente en la mitad de la recta entre el tres mil y el cuatro mil. Arrástralo.";
        const msg = new SpeechSynthesisUtterance(textoCompleto);
        msg.lang = 'es-MX';
        msg.rate = 1.0; 

        spans.forEach(s => s.classList.remove('palabra-activa'));
        let indicePalabra = 0;

        msg.onboundary = (event) => {
            if (event.name === 'word') {
                spans.forEach(s => s.classList.remove('palabra-activa'));
                if (spans[indicePalabra]) {
                    spans[indicePalabra].classList.add('palabra-activa');
                    indicePalabra++;
                }
            }
        };

        msg.onend = () => {
            spans.forEach(s => s.classList.remove('palabra-activa'));
        };

        window.speechSynthesis.speak(msg);
    }

    function vincularEventosArrastre() {
        const fichas = document.querySelectorAll('.numero-arrastrable');
        fichas.forEach(ficha => {
            
            // ESCUCHAR AL PRESIONAR: Al hacer clic, lee el valor (Igual que en Actividad 4)
            ficha.addEventListener('click', () => {
                const cifraLimpia = ficha.innerText.replace('$', '').replace('.', '');
                hablarTexto(cifraLimpia);
            });

            // ESCUCHAR AL EMPEZAR A MOVER: También lee el valor cuando empieza el arrastre
            ficha.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', ficha.id);
                ficha.style.opacity = "0.5";
                
                const cifraLimpia = ficha.innerText.replace('$', '').replace('.', '');
                hablarTexto(cifraLimpia);
            });

            ficha.addEventListener('dragend', () => {
                ficha.style.opacity = "1";
            });
        });
    }

    function revolverOpciones() {
        if (!bancoOpciones) return;
        const fichasArray = Array.from(bancoOpciones.children);
        for (let i = fichasArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            bancoOpciones.appendChild(fichasArray[j]);
        }
    }

    if (zonaNumero) {
        zonaNumero.ondragover = (e) => e.preventDefault();
        zonaNumero.ondragenter = () => zonaNumero.classList.add('hovered');
        zonaNumero.ondragleave = () => zonaNumero.classList.remove('hovered');
        
        zonaNumero.ondrop = (e) => {
            e.preventDefault();
            zonaNumero.classList.remove('hovered');
            const idElemento = e.dataTransfer.getData('text/plain');
            const elemento = document.getElementById(idElemento);

            if (elemento) {
                const fichaVieja = zonaNumero.querySelector('.numero-arrastrable');
                if (fichaVieja && fichaVieja !== elemento && bancoOpciones) {
                    bancoOpciones.appendChild(fichaVieja);
                }
                zonaNumero.innerText = '';
                zonaNumero.appendChild(elemento);
                evaluarRespuesta();
            }
        };
    }

    if (bancoOpciones) {
        bancoOpciones.ondragover = (e) => e.preventDefault();
        bancoOpciones.ondrop = (e) => {
            e.preventDefault();
            const idElemento = e.dataTransfer.getData('text/plain');
            const elemento = document.getElementById(idElemento);
            if (elemento) {
                bancoOpciones.appendChild(elemento);
                restaurarCasillaVacia();
                evaluarRespuesta();
            }
        };
    }

    function restaurarCasillaVacia() {
        if (zonaNumero) {
            zonaNumero.innerHTML = '?';
            zonaNumero.style.background = '#f0f4f8';
            zonaNumero.style.borderColor = '#1a4a9e';
            zonaNumero.style.borderStyle = 'dashed';
        }
    }

    function evaluarRespuesta() {
        if (!zonaNumero) return;
        const fichaInterna = zonaNumero.querySelector('.numero-arrastrable');

        if (fichaInterna) {
            if (fichaInterna.dataset.valor === '3500') {
                // ¡ACIERTO! Sumamos 100 Pts y guardamos en LocalStorage
                puntajeAcumulado += 100;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (typeof confetti === 'function') {
                    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
                }
                if (btnSiguiente) btnSiguiente.style.display = 'inline-block';
                
                zonaNumero.style.background = '#dcfce7'; 
                zonaNumero.style.borderColor = '#22c55e';
                zonaNumero.style.borderStyle = 'solid';
                hablarTexto('¡Excelente! Tres mil quinientos está justo en medio.');
            } else {
                // ERROR: Penalización de -10 Pts
                if (puntajeAcumulado >= 10) puntajeAcumulado -= 10;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (btnSiguiente) btnSiguiente.style.display = 'none';
                zonaNumero.style.background = '#fee2e2'; 
                zonaNumero.style.borderColor = '#ef4444';
                zonaNumero.style.borderStyle = 'solid';
                hablarTexto('Te has equivocado. ¡Intenta con otra opción!');

                setTimeout(() => {
                    if (bancoOpciones) bancoOpciones.appendChild(fichaInterna);
                    restaurarCasillaVacia();
                    revolverOpciones();
                }, 1400);
            }
        } else {
            if (btnSiguiente) btnSiguiente.style.display = 'none';
        }
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            window.location.href = 'actividad7.html'; 
        });
    }

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = ejecutarKaraoke;

    vincularEventosArrastre();
    revolverOpciones(); 
    setTimeout(ejecutarKaraoke, 600);
});