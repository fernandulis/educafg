document.addEventListener('DOMContentLoaded', () => {
    const titulo = document.getElementById('titulo-interactivo');
    const spans = titulo.querySelectorAll('span');
    const textoFrase = "Aprendamos a contar del 1 al 10";
    let numerosVistos = new Set();

    function reproducirTitulo() {
        window.speechSynthesis.cancel();

        const mensaje = new SpeechSynthesisUtterance(textoFrase);
        mensaje.lang = 'es-MX';
        mensaje.rate = 0.6; // Velocidad fija para que coincida con el tiempo

        // Tiempos aproximados por palabra (en milisegundos)
        // Ajustamos los tiempos para que la "a", "1", "al" se marquen rápido
        const tiempos = [0, 800, 1100, 1600, 2000, 2300, 2600, 2900]; 

        mensaje.onstart = () => {
            spans.forEach((span, index) => {
                setTimeout(() => {
                    // Limpiar todos los spans
                    spans.forEach(s => s.classList.remove('palabra-activa'));
                    // Marcar el actual
                    span.classList.add('palabra-activa');
                }, tiempos[index]);
            });
        };

        mensaje.onend = () => {
            setTimeout(() => {
                spans.forEach(s => s.classList.remove('palabra-activa'));
            }, 500);
        };

        window.speechSynthesis.speak(mensaje);
    }

    if (titulo) {
        titulo.addEventListener('click', reproducirTitulo);
        setTimeout(reproducirTitulo, 1000);
    }

    // --- LOGICA DE BOTONES ---
    window.presionarNumero = function(num) {
        new Audio(`sonido/${num}.mp3`).play().catch(() => {
            const v = new SpeechSynthesisUtterance(num.toString());
            v.lang = 'es-MX';
            window.speechSynthesis.speak(v);
        });

        const caja = document.getElementById('contenedor-manzanas');
        if (caja) {
            caja.innerHTML = '';
            for (let i = 0; i < num; i++) {
                const img = document.createElement('img');
                img.src = 'img/manzana.avif';
                img.className = 'manzana-animada';
                caja.appendChild(img);
            }
        }

        numerosVistos.add(num);
        const btnFinal = document.getElementById('btnFinalizar');
        if (numerosVistos.size >= 3 && btnFinal) {
            btnFinal.style.display = 'inline-block';
        }
    };

    window.terminarJuego = function() {
        if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        new Audio('sonido/logro.mp3').play().catch(() => {});
        alert("¡Felicidades! Aprendiste a contar.");
        setTimeout(() => { window.location.href = "final.html"; }, 2000);
    };
});