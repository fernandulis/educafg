document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const zonaRespuesta = document.getElementById('zona-respuesta');
    const bancoOpciones = document.getElementById('banco-opciones');
    const btnSiguiente = document.getElementById('btnSig');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    // CONEXIÓN INTERNIVEL A LA MOCHILA VIRTUAL GLOBAL
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablarTexto(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Refresca el marcador visual en el extremo superior derecho
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }

    // Carga inicial del estado del puntaje
    actualizarMarcadorVisual();

    // Karaoke acoplado al habla mediante onboundary
    function ejecutarKaraoke() {
        window.speechSynthesis.cancel();
        
        const textoCompleto = "Mira la tabla posicional. ¿Cuánto vale el dígito siete si se ubica en las unidades de mil? Arrastra la respuesta.";
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

    // Vincular eventos a las 4 fichas
    function vincularEventosArrastre() {
        const fichas = document.querySelectorAll('.valor-arrastrable');
        fichas.forEach(ficha => {
            ficha.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', ficha.id);
                ficha.style.opacity = "0.5";
            });
            ficha.addEventListener('dragend', () => {
                ficha.style.opacity = "1";
            });
        });
    }

    // Mezclador aleatorio Fisher-Yates para las 4 alternativas
    function revolverOpciones() {
        if (!bancoOpciones) return;
        const fichasArray = Array.from(bancoOpciones.children);
        
        for (let i = fichasArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            bancoOpciones.appendChild(fichasArray[j]);
        }
    }

    if (zonaRespuesta) {
        zonaRespuesta.ondragover = (e) => e.preventDefault();
        zonaRespuesta.ondragenter = () => zonaRespuesta.classList.add('hovered');
        zonaRespuesta.ondragleave = () => zonaRespuesta.classList.remove('hovered');
        
        zonaRespuesta.ondrop = (e) => {
            e.preventDefault();
            zonaRespuesta.classList.remove('hovered');

            const idElemento = e.dataTransfer.getData('text/plain');
            const elemento = document.getElementById(idElemento);

            if (elemento) {
                const fichaVieja = zonaRespuesta.querySelector('.valor-arrastrable');
                if (fichaVieja && fichaVieja !== elemento && bancoOpciones) {
                    bancoOpciones.appendChild(fichaVieja);
                }

                zonaRespuesta.innerText = '';
                zonaRespuesta.appendChild(elemento);
                
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
        if (zonaRespuesta) {
            zonaRespuesta.innerHTML = '?';
            zonaRespuesta.style.background = '#f0f4f8';
            zonaRespuesta.style.borderColor = '#1a4a9e';
            zonaRespuesta.style.borderStyle = 'dashed';
        }
    }

    // Evaluación estricta como Texto de '7.000' para evitar errores de punto decimal
    function evaluarRespuesta() {
        if (!zonaRespuesta) return;
        const fichaInterna = zonaRespuesta.querySelector('.valor-arrastrable');

        if (fichaInterna) {
            if (fichaInterna.dataset.valor === '7.000') {
                // ¡Acierto! Sumamos 100 Pts y actualizamos LocalStorage
                puntajeAcumulado += 100;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (typeof confetti === 'function') confetti();
                if (btnSiguiente) btnSiguiente.style.display = 'inline-block';
                
                zonaRespuesta.style.background = '#dcfce7'; 
                zonaRespuesta.style.borderColor = '#22c55e';
                zonaRespuesta.style.borderStyle = 'solid';
                hablarTexto('¡Excelente! El siete en las unidades de mil vale siete mil pesos.');
            } else {
                // Error: Aplicamos penalización sutil
                if (puntajeAcumulado >= 10) puntajeAcumulado -= 10;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (btnSiguiente) btnSiguiente.style.display = 'none';
                
                zonaRespuesta.style.background = '#fee2e2'; 
                zonaRespuesta.style.borderColor = '#ef4444';
                zonaRespuesta.style.borderStyle = 'solid';
                
                hablarTexto('Te has equivocado. ¡Intenta con otra opción!');

                // Regresa el elemento abajo y baraja las 4 opciones de inmediato
                setTimeout(() => {
                    if (bancoOpciones) bancoOpciones.appendChild(fichaInterna);
                    restaurarCasillaVacia();
                    revolverOpciones();
                }, 1300);
            }
        } else {
            if (btnSiguiente) btnSiguiente.style.display = 'none';
        }
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            window.location.href = 'actividad8.html'; 
        });
    }

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = ejecutarKaraoke;

    vincularEventosArrastre();
    revolverOpciones(); 
    setTimeout(ejecutarKaraoke, 600);
});