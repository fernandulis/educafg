document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const zonaCajero = document.getElementById('zona-cajero');
    const txtSumaPago = document.getElementById('suma-pago');
    const btnReset = document.getElementById('btnReset');
    const btnSiguiente = document.getElementById('btnSig');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    let acumulado = 0;
    const META = 7934; 
    
    // CONEXIÓN INTERNIVEL: Rescatamos los puntos reales acumulados de los juegos anteriores
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablarTexto(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Actualiza el texto flotante de la esquina superior derecha con los puntos acumulados totales
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }

    // Inicializar el marcador reflejando la mochila global del niño
    actualizarMarcadorVisual();

    // Lógica del Karaoke Inteligente basado en eventos de voz
    function ejecutarKaraoke() {
        window.speechSynthesis.cancel();
        
        const textoCompleto = "¡Súper desafío final! Debes pagar una cuenta de exactamente siete mil novecientos treinta y cuatro pesos en la caja. Arrastra el dinero necesario.";
        const msg = new SpeechSynthesisUtterance(textoCompleto);
        msg.lang = 'es-MX';
        msg.rate = 0.95; 

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

    // Inicializar arrastre de billetes y monedas chilenas
    const elementosDinero = document.querySelectorAll('.billete-chile, .moneda-chile');
    elementosDinero.forEach(elem => {
        elem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', elem.dataset.valor);
        });
    });

    if (zonaCajero) {
        zonaCajero.ondragover = (e) => e.preventDefault();
        zonaCajero.ondragenter = () => zonaCajero.classList.add('hovered');
        zonaCajero.ondragleave = () => zonaCajero.classList.remove('hovered');
        
        zonaCajero.ondrop = (e) => {
            e.preventDefault();
            zonaCajero.classList.remove('hovered');

            const valorDinero = parseInt(e.dataTransfer.getData('text/plain'), 10);
            
            if (valorDinero) {
                acumulado += valorDinero;
                actualizarInterfazCaja();
            }
        };
    }

    // Comprobación matemática y asignación dinámica de puntajes heredados
    function actualizarInterfazCaja() {
        if (!txtSumaPago) return;
        
        txtSumaPago.innerText = `$${acumulado.toLocaleString('es-CL')}`;

        if (acumulado === META) {
            // ¡RESPUESTA CORRECTA! -> Sumamos 100 puntos al pozo total
            puntajeAcumulado += 100;
            actualizarMarcadorVisual();
            
            // Guardamos el récord final absoluto en la mochila global
            localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

            if (typeof confetti === 'function') confetti();
            if (btnSiguiente) btnSiguiente.style.display = 'inline-block';
            
            zonaCajero.style.background = '#dcfce7';
            zonaCajero.style.borderColor = '#22c55e';
            zonaCajero.innerHTML = '¡Monto Exacto Conseguido! 💰🎉';
            hablarTexto('¡Excelente trabajo! Has pagado la cuenta completa de siete mil novecientos treinta y cuatro pesos.');
        } 
        else if (acumulado > META) {
            // ¡RESPUESTA INCORRECTA! -> Penalizamos restando 20 puntos al acumulado
            if (puntajeAcumulado >= 20) {
                puntajeAcumulado -= 20;
            } else {
                puntajeAcumulado = 0; 
            }
            actualizarMarcadorVisual();
            localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

            if (btnSiguiente) btnSiguiente.style.display = 'none';
            
            zonaCajero.style.background = '#fee2e2';
            zonaCajero.style.borderColor = '#ef4444';
            zonaCajero.innerHTML = '¡Te has pasado del monto! 🚨';
            hablarTexto('Te has pasado del valor de la cuenta. Presiona empezar de nuevo.');
        } 
        else {
            // Sigue intentando (Aún está por debajo de la meta)
            if (btnSiguiente) btnSiguiente.style.display = 'none';
            zonaCajero.style.background = '#f0f4f8';
            zonaCajero.style.borderColor = '#1a4a9e';
            
            let faltante = META - acumulado;
            zonaCajero.innerHTML = `¡Vas bien! Te faltan $${faltante.toLocaleString('es-CL')} 📥`;
        }
    }

    // Función del botón limpiar caja (Resetea la suma de dinero, pero NO penaliza el puntaje global)
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            acumulado = 0;
            if (txtSumaPago) txtSumaPago.innerText = '$0';
            if (btnSiguiente) btnSiguiente.style.display = 'none';
            
            zonaCajero.style.background = '#f0f4f8';
            zonaCajero.style.borderColor = '#1a4a9e';
            zonaCajero.innerHTML = '📥 ARRASTRA EL DINERO AQUÍ';
            hablarTexto('Caja limpia. ¡Intentemos sumar siete mil novecientos treinta y cuatro pesos otra vez!');
        });
    }

    // Redirección fluida directa a final.html preservando la puntuación
    if (btnSiguiente) {
        btnSiguiente.addEventListener('click', () => {
            window.location.href = 'final.html'; 
        });
    }

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = ejecutarKaraoke;

    setTimeout(ejecutarKaraoke, 600);
});