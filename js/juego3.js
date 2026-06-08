document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const popPrecios = document.getElementById('pop-precios');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    // CONEXIÓN A LA MOCHILA VIRTUAL GLOBAL
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablar(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto.toString());
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Refresca el marcador en la esquina de la pantalla
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }
    actualizarMarcadorVisual();

    function animarTitulo() {
        window.speechSynthesis.cancel();
        const textoCompleto = "¡Busquemos la mochila en el almacén! Su precio es de cinco mil quinientos pesos.";
        const msg = new SpeechSynthesisUtterance(textoCompleto);
        msg.lang = 'es-MX';
        msg.rate = 0.82; 

        const retrasos = [0, 800, 1300, 1800, 2000, 2300, 3100, 3400, 3700, 3900, 4200, 4600, 5000, 5800];

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

    // Abre las opciones flotantes calculando la posición exacta de forma porcentual
    window.openMenuPrecios = window.abrirMenuPrecios = function(event) {
        if (popPrecios) {
            // Se posiciona a la derecha de la mochila de manera adaptativa
            popPrecios.style.top = "22%";
            popPrecios.style.left = "60%";
            
            popPrecios.classList.toggle('style-hidden');
            
            if(!popPrecios.classList.contains('style-hidden')) {
                hablar("¿Cuál de estos números representa cinco mil quinientos pesos?");
            }
        }
    };

    window.verificarRespuestaAlmacen = function(valor, boton) {
        const respuestaCorrecta = 5500;

        if (valor === respuestaCorrecta) {
            boton.className = "btn-precio-tienda tienda-correcta";
            hablar("¡Fantástico! Ese es el precio de la mochila.");
            
            puntajeAcumulado += 100;
            actualizarMarcadorVisual();
            localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

            if (typeof confetti === 'function') {
                confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
            }

            setTimeout(() => {
                if (popPrecios) popPrecios.classList.add('style-hidden');
                const btnSig = document.getElementById('btnSig');
                if (btnSig) btnSig.style.display = 'inline-block';
            }, 1500);

        } else {
            boton.className = "btn-precio-tienda tienda-incorrecta";
            hablar("¡Oh, no! Revisa bien las centenas.");
            
            if (puntajeAcumulado >= 10) puntajeAcumulado -= 10;
            actualizarMarcadorVisual();
            localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());
            
            setTimeout(() => {
                boton.className = "btn-precio-tienda";
            }, 1400);
        }
    };

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = animarTitulo;

    setTimeout(animarTitulo, 600);
});