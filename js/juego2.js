document.addEventListener('DOMContentLoaded', () => {
    const linea = document.getElementById('linea-tiempo');
    const banco = document.getElementById('numeros-disponibles');
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const txtMarcadorPts = document.getElementById('marcador-pts');
    
    // El orden correcto original (Precios de menor a mayor)
    const numsCorrectos = [1200, 3500, 5800, 7400, 9900];

    // RECUPERAMOS LOS PUNTOS QUE VIENEN DE LA MOCHILA (ACTIVIDAD 1)
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablar(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto.toString());
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Actualiza el texto flotante superior derecho
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }

    // Inicializamos mostrando el puntaje que arrastramos en la pantalla
    actualizarMarcadorVisual();

    // Sistema de Karaoke por Tiempos (Sincronización fija sin alterar el diseño)
    function animarTitulo() {
        window.speechSynthesis.cancel();
        
        const textoCompleto = "Ordena estos precios de cuatro cifras en la línea.";
        const msg = new SpeechSynthesisUtterance(textoCompleto);
        msg.lang = 'es-MX';
        msg.rate = 0.85; 

        const retrasos = [0, 600, 1100, 1600, 2000, 2600, 3200, 3500, 3800];

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

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = animarTitulo;

    // FUNCIÓN PARA DIBUJAR TODO EL TABLERO UTILIZANDO NODOS DINÁMICOS
    function inicializarJuego() {
        if (linea) {
            linea.innerHTML = ''; 
            numsCorrectos.forEach((n, i) => {
                const divCasilla = document.createElement('div'); 
                divCasilla.className = 'espacio-numero vacio'; 
                divCasilla.innerText = '???'; 
                divCasilla.dataset.idx = i;
                
                divCasilla.ondragover = e => e.preventDefault(); 
                divCasilla.ondragenter = () => divCasilla.classList.add('hovered');
                divCasilla.ondragleave = () => divCasilla.classList.remove('hovered');
                divCasilla.ondrop = dropEnCasilla; 
                
                linea.appendChild(divCasilla);
            });
        }

        if (banco) {
            banco.innerHTML = ''; 
            banco.ondragover = e => e.preventDefault();
            banco.ondrop = dropEnBanco;

            [...numsCorrectos].sort(() => Math.random() - 0.5).forEach((n, index) => {
                const dragFicha = document.createElement('div'); 
                dragFicha.className = 'drag-numero'; 
                dragFicha.draggable = true; 
                dragFicha.innerText = n;
                dragFicha.id = `ficha-${n}-${index}`; 
                dragFicha.dataset.valor = n;
                
                dragFicha.ondragstart = e => {
                    hablar(n);
                    e.dataTransfer.setData("text/plain", dragFicha.id);
                };
                banco.appendChild(dragFicha);
            });
        }
        
        const btn = document.getElementById('btnSig');
        if (btn) btn.style.display = 'none';
    }

    function dropEnCasilla(e) {
        e.preventDefault();
        let destino = e.target;
        if (destino.classList.contains('drag-numero')) {
            return;
        }

        destino.classList.remove('hovered');
        const idFicha = e.dataTransfer.getData("text/plain");
        const ficha = document.getElementById(idFicha);
        
        if (ficha) {
            destino.innerText = '';
            destino.className = 'espacio-numero ocupado';
            destino.appendChild(ficha);
            evaluarProgresoJuego();
        }
    }

    function dropEnBanco(e) {
        e.preventDefault();
        const idFicha = e.dataTransfer.getData("text/plain");
        const ficha = document.getElementById(idFicha);
        
        if (ficha) {
            banco.appendChild(ficha);
            evaluarProgresoJuego();
        }
    }

    function evaluarProgresoJuego() {
        const casillas = document.querySelectorAll('#linea-tiempo .espacio-numero');
        let casillasLlenas = 0;
        let aciertosTotales = 0;

        casillas.forEach((casilla, i) => {
            const fichaInterna = casilla.querySelector('.drag-numero');
            
            if (fichaInterna) {
                casillasLlenas++;
                if (parseInt(fichaInterna.dataset.valor, 10) === numsCorrectos[i]) {
                    aciertosTotales++;
                }
            } else {
                casilla.className = 'espacio-numero vacio';
                casilla.innerText = '???';
            }
        });

        if (casillasLlenas === 5) {
            casillas.forEach((casilla, i) => {
                const fichaInterna = casilla.querySelector('.drag-numero');
                if (parseInt(fichaInterna.dataset.valor, 10) === numsCorrectos[i]) {
                    casilla.className = 'espacio-numero casilla-correcta';
                } else {
                    casilla.className = 'espacio-numero casilla-incorrecta';
                }
            });

            if (aciertosTotales === 5) {
                // ¡GANÓ EL NIVEL 2! Sumamos 100 Pts más al total acumulado
                puntajeAcumulado += 100;
                actualizarMarcadorVisual();

                // Guardamos el nuevo valor total en la mochila virtual
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (typeof confetti === 'function') {
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                }
                const btn = document.getElementById('btnSig');
                if (btn) btn.style.display = 'inline-block';
                hablar('¡Increíble! Ordenaste todos los precios de cuatro cifras a la perfección.');
            } else {
                // Penalización por error (-10 Pts) siempre que el pozo no quede en negativo
                if (puntajeAcumulado >= 10) puntajeAcumulado -= 10;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                hablar("Te equivocaste en algunos números. ¡Revisa tu línea y cambia las tarjetas que desees!");
            }
        } else {
            const btn = document.getElementById('btnSig');
            if (btn) btn.style.display = 'none';
        }
    }

    inicializarJuego();
    setTimeout(animarTitulo, 800);
});