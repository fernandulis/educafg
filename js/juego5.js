document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const zonaSigno = document.getElementById('zona-signo');
    const bancoSignos = document.getElementById('banco-signos');
    const signos = document.querySelectorAll('.signo-arrastrable');
    const btnSiguiente = document.getElementById('btnSig');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    // CONEXIÓN A LA MOCHILA VIRTUAL GLOBAL
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablarTexto(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Actualiza dinámicamente el contador en el DOM
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }

    // Carga inicial de puntos acumulados
    actualizarMarcadorVisual();

    // Tiempos coordinados para el Karaoke
    function ejecutarKaraoke() {
        window.speechSynthesis.cancel();
        const textoCompleto = "Compara los precios de estos cuadernos. Ocho mil cuatrocientos veinte pesos es mayor o menor que ocho mil doscientos cuarenta pesos. Arrastra el signo correcto.";
        const msg = new SpeechSynthesisUtterance(textoCompleto);
        msg.lang = 'es-MX';
        msg.rate = 0.85;

        const retrasos = [
            0, 600, 900, 1400, 1750, 2200, 3100, 3500, 3900, 4800, 
            5300, 5800, 6100, 6700, 7000, 7600, 7900, 8300, 8700, 9600, 
            10100, 11000, 11500, 11800, 12200
        ];

        spans.forEach(s => s.classList.remove('palabra-activa'));

        spans.forEach((span, indice) => {
            setTimeout(() => {
                if (window.speechSynthesis.speaking) {
                    spans.forEach(s => s.classList.remove('palabra-activa'));
                    if (span) span.classList.add('palabra-activa');
                }
            }, retrasos[indice]);
        });

        msg.onend = () => {
            spans.forEach(s => s.classList.remove('palabra-activa'));
        };

        window.speechSynthesis.speak(msg);
    }

    // Habilitar arrastrado de fichas
    signos.forEach(signo => {
        signo.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', signo.id);
            signo.style.opacity = "0.5";
        });
        
        signo.addEventListener('dragend', () => {
            signo.style.opacity = "1";
        });
    });

    // Controlar soltado en la casilla central
    if (zonaSigno) {
        zonaSigno.ondragover = (e) => e.preventDefault();
        zonaSigno.ondragenter = () => zonaSigno.classList.add('hovered');
        zonaSigno.ondragleave = () => zonaSigno.classList.remove('hovered');
        
        zonaSigno.ondrop = (e) => {
            e.preventDefault();
            zonaSigno.classList.remove('hovered');

            const idElemento = e.dataTransfer.getData('text/plain');
            const elemento = document.getElementById(idElemento);

            if (elemento) {
                // Si ya hay un signo adentro, se devuelve abajo automáticamente
                const signoViejo = zonaSigno.querySelector('.signo-arrastrable');
                if (signoViejo && signoViejo !== elemento && bancoSignos) {
                    bancoSignos.appendChild(signoViejo);
                }

                zonaSigno.innerText = ''; 
                zonaSigno.appendChild(elemento); 
                
                evaluarRespuesta();
            }
        };
    }

    // Controlar soltado de regreso en el banco inferior
    if (bancoSignos) {
        bancoSignos.ondragover = (e) => e.preventDefault();
        bancoSignos.ondrop = (e) => {
            e.preventDefault();
            const idElemento = e.dataTransfer.getData('text/plain');
            const elemento = document.getElementById(idElemento);

            if (elemento) {
                bancoSignos.appendChild(elemento); 
                restaurarCasillaVacia();
                evaluarRespuesta();
            }
        };
    }

    function restaurarCasillaVacia() {
        if (zonaSigno) {
            zonaSigno.innerHTML = '?';
            zonaSigno.style.background = '#f0f4f8';
            zonaSigno.style.borderColor = '#1a4a9e';
            zonaSigno.style.borderStyle = 'dashed';
        }
    }

    // Validar respuestas matemáticas y gestionar sistema de puntos
    function evaluarRespuesta() {
        if (!zonaSigno) return;
        const signoInterno = zonaSigno.querySelector('.signo-arrastrable');

        if (signoInterno) {
            if (signoInterno.dataset.signo === '>') {
                // ¡Acierto! Suma de 100 Pts
                puntajeAcumulado += 100;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (typeof confetti === 'function') confetti();
                if (btnSiguiente) btnSiguiente.style.display = 'inline-block';
                
                zonaSigno.style.background = '#dcfce7'; 
                zonaSigno.style.borderColor = '#22c55e';
                zonaSigno.style.borderStyle = 'solid';
                hablarTexto('¡Excelente! Ocho mil cuatrocientos veinte es mayor que ocho mil doscientos cuarenta.');
            } else {
                // Fallo: Penalización sutil
                if (puntajeAcumulado >= 10) puntajeAcumulado -= 10;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (btnSiguiente) btnSiguiente.style.display = 'none';
                
                zonaSigno.style.background = '#fee2e2'; 
                zonaSigno.style.borderColor = '#ef4444';
                zonaSigno.style.borderStyle = 'solid';
                hablarTexto('Ese signo no es el correcto. ¡Cámbialo por el otro o arrástralo hacia abajo!');
            }
        } else {
            if (btnSiguiente) btnSiguiente.style.display = 'none';
        }
    }

    // AVANCE DIRECTO A LA ACTIVIDAD 6
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            window.location.href = 'actividad6.html'; 
        });
    }

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = ejecutarKaraoke;

    setTimeout(ejecutarKaraoke, 600);
});