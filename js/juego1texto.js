document.addEventListener('DOMContentLoaded', () => {
    const titulo = document.getElementById('titulo-interactivo');
    const spans = document.querySelectorAll('#titulo-interactivo .palabra-normal');
    const textoFrase = "Aprendamos a contar del 1 al 10";
    
    // Usamos un Set para que no cuente números repetidos
    // Solo cuando el tamaño sea 10, sabremos que pasó por todos
    let numerosVistos = new Set();

    function hablar(texto, velocidad = 1) {
        window.speechSynthesis.cancel();
        const mensaje = new SpeechSynthesisUtterance(texto.toString());
        mensaje.lang = 'es-MX';
        mensaje.rate = velocidad;
        window.speechSynthesis.speak(mensaje);
    }

    function reproducirTitulo() {
        hablar(textoFrase, 0.6);
        const tiempos = [0, 800, 1100, 1700, 2100, 2400, 2700];
        tiempos.forEach((ms, index) => {
            setTimeout(() => {
                spans.forEach(s => s.classList.remove('palabra-activa'));
                if(spans[index]) spans[index].classList.add('palabra-activa');
            }, ms);
        });
        setTimeout(() => spans.forEach(s => s.classList.remove('palabra-activa')), 4000);
    }

    if (titulo) {
        titulo.addEventListener('click', reproducirTitulo);
        setTimeout(reproducirTitulo, 1000);
    }

    window.presionarNumero = function(num) {
        // Sonido del número presionado
        const audio = new Audio(`sonido/${num}.mp3`);
        audio.play().catch(() => hablar(num));

        const caja = document.getElementById('contenedor-manzanas');
        if (caja) {
            caja.innerHTML = '';
            for (let i = 1; i <= num; i++) {
                const contenedorManzana = document.createElement('div');
                contenedorManzana.className = 'manzana-wrapper manzana-animada';
                contenedorManzana.onclick = () => {
                    const a = new Audio(`sonido/${i}.mp3`);
                    a.play().catch(() => hablar(i));
                };
                const img = document.createElement('img');
                img.src = 'img/manzana.avif';
                img.style.width = "70px";
                const textoNumero = document.createElement('span');
                textoNumero.className = 'numero-encima';
                textoNumero.innerText = i;
                contenedorManzana.appendChild(img);
                contenedorManzana.appendChild(textoNumero);
                caja.appendChild(contenedorManzana);
            }
        }

        // AGREGAR EL NÚMERO AL REGISTRO
        numerosVistos.add(num);
        
        const btnFinal = document.getElementById('btnFinalizar');
        
        // CONDICIÓN ESTRICTA: Solo si el niño ha tocado los 10 números
        if (numerosVistos.size >= 10 && btnFinal) {
            btnFinal.style.display = 'inline-block';
            hablar("¡Increíble! Ya conoces todos los números. ¡Presiona el botón verde!");
        } else {
            // Opcional: Feedback para que el niño sepa que le faltan números
            console.log("Llevas " + numerosVistos.size + " de 10 números.");
        }
    };

    window.terminarJuego = function() {
        // Lanzar confetti
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
        
        const victoria = new Audio('sonido/logro.mp3');
        victoria.play().catch(() => {});
        
        // Felicitación con el nombre del niño
        const nombre = localStorage.getItem("nombreUsuario") || "amiguito";
        const mensajeFinal = new SpeechSynthesisUtterance(`¡Felicidades ${nombre}! Contaste todos los números.`);
        mensajeFinal.lang = 'es-MX';
        mensajeFinal.rate = 0.9;

        // ESPERAR A QUE TERMINE DE HABLAR PARA CAMBIAR DE JUEGO
        mensajeFinal.onend = function() {
            window.location.href = "actividad2.html";
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(mensajeFinal);

        // Seguridad por si falla la síntesis de voz
        setTimeout(() => {
            if(!window.location.href.includes("actividad2")) {
                window.location.href = "actividad2.html";
            }
        }, 6000);
    };
});