document.addEventListener('DOMContentLoaded', () => {
    const spans = document.querySelectorAll('#texto-karaoke .palabra-normal');
    const destinos = document.querySelectorAll('.caja-destino');
    const banco = document.getElementById('banco');
    const tarjetas = document.querySelectorAll('.elemento-arrastrable');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    // CONEXIÓN INTERNIVEL DE LA MOCHILA DE PUNTOS GLOBALES
    let puntajeAcumulado = parseInt(localStorage.getItem('puntajeGlobal') || '0', 10);

    function hablarTexto(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto);
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Refresca el puntaje en la esquina superior derecha
    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeAcumulado} Pts`;
        }
    }

    // Carga inicial del marcador
    actualizarMarcadorVisual();

    function ejecutarKaraoke() {
        window.speechSynthesis.cancel();
        const textoCompleto = "Los precios del mostrador se mezclaron. Ordena las tarjetas desde el artículo más barato al más caro.";
        const msg = new SpeechSynthesisUtterance(textoCompleto);
        msg.lang = 'es-MX';
        msg.rate = 0.85; 

        const retrasos = [0, 300, 850, 1100, 1750, 1950, 2800, 3250, 3500, 4100, 4400, 4550, 5150, 5450, 5900, 6100, 6400];

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

    // Configuración interactiva de las tarjetas numéricas
    tarjetas.forEach(tarjeta => {
        
        // FUNCIÓN NUEVA: Escuchar el número con un Clic (Igual que el Juego 1)
        tarjeta.addEventListener('click', () => {
            // Limpiamos los caracteres especiales para una lectura limpia de la cifra
            const cifraLimpia = tarjeta.innerText.replace('$', '').replace('.', '');
            hablarTexto(cifraLimpia);
        });

        // Evento cuando se arrastra la tarjeta
        tarjeta.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tarjeta.id);
            
            // ADICIONAL: También se escucha al empezar a arrastrar la tarjeta
            const cifraLimpia = tarjeta.innerText.replace('$', '').replace('.', '');
            hablarTexto(cifraLimpia);
        });
    });

    banco.ondragover = (e) => e.preventDefault();
    banco.ondrop = (e) => {
        e.preventDefault();
        const idElemento = e.dataTransfer.getData('text/plain');
        const elemento = document.getElementById(idElemento);
        if (elemento) {
            banco.appendChild(elemento);
            evaluarProgreso();
        }
    };

    destinos.forEach(dest => {
        dest.ondragover = (e) => e.preventDefault();
        dest.ondrop = (e) => {
            e.preventDefault();
            
            if (dest.querySelector('.elemento-arrastrable')) return;

            const idElemento = e.dataTransfer.getData('text/plain');
            const elemento = document.getElementById(idElemento);
            
            if (elemento) {
                dest.appendChild(elemento);
                evaluarProgreso();
            }
        };
    });

    function evaluarProgreso() {
        let cajasLlenas = 0;
        let aciertos = 0;

        destinos.forEach(dest => {
            const tarjetaContenida = dest.querySelector('.elemento-arrastrable');
            if (tarjetaContenida) {
                cajasLlenas++;
                if (tarjetaContenida.dataset.valor === dest.dataset.solucion) {
                    aciertos++;
                }
            }
        });

        if (cajasLlenas === 3) {
            if (aciertos === 3) {
                // ¡Éxito! Sumamos 100 puntos y guardamos en LocalStorage
                puntajeAcumulado += 100;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                if (typeof confetti === 'function') {
                    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                } 
                document.getElementById('btnSig').style.display = 'inline-block';
                hablarTexto('¡Fantástico! Lograste ordenar todos los valores correctamente.');
            } else {
                // Penalización por fallo
                if (puntajeAcumulado >= 10) puntajeAcumulado -= 10;
                actualizarMarcadorVisual();
                localStorage.setItem('puntajeGlobal', puntajeAcumulado.toString());

                hablarTexto('El orden no está bien. ¡Revisa tus tarjetas y cámbialas de lugar!');
            }
        } else {
            document.getElementById('btnSig').style.display = 'none';
        }
    }

    const titulo = document.getElementById('texto-karaoke');
    if (titulo) titulo.onclick = ejecutarKaraoke;

    setTimeout(ejecutarKaraoke, 500);
});