document.addEventListener('DOMContentLoaded', () => {
    // Al ser el PRIMER JUEGO, limpiamos la mochila y la dejamos en 0 puntos
    localStorage.setItem('puntajeGlobal', '0');

    const linea = document.getElementById('linea-tiempo');
    const disponibles = document.getElementById('numeros-disponibles');
    const spans = document.querySelectorAll('.palabra-normal');
    const txtMarcadorPts = document.getElementById('marcador-pts');

    // Secuencia del 1 al 10
    const reto = [
        {n: 1, fijo: true}, {n: 2, fijo: false}, {n: 3, fijo: true}, 
        {n: 4, fijo: false}, {n: 5, fijo: false}, {n: 6, fijo: false},
        {n: 7, fijo: true}, {n: 8, fijo: false}, {n: 9, fijo: false}, {n: 10, fijo: true}
    ];

    let puntajeJuego1 = 0;

    function hablar(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto.toString());
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    function actualizarMarcadorVisual() {
        if (txtMarcadorPts) {
            txtMarcadorPts.innerText = `${puntajeJuego1} Pts`;
        }
    }

    // Inicializamos el marcador en pantalla
    actualizarMarcadorVisual();

    // Animación del título Karaoke
    function animarTitulo() {
        hablar("¡Ordena los números en la línea!");
        spans.forEach((s, i) => {
            setTimeout(() => {
                spans.forEach(p => p.classList.remove('palabra-activa'));
                s.classList.add('palabra-activa');
            }, i * 450);
        });
        setTimeout(() => spans.forEach(p => p.classList.remove('palabra-activa')), 4000);
    }

    document.getElementById('titulo-interactivo').onclick = animarTitulo;
    setTimeout(animarTitulo, 1000);

    window.crearCirculoDisponible = function(num) {
        const existente = document.getElementById(`drag-banco-${num}`);
        if (existente) existente.remove();

        const drag = document.createElement('div');
        drag.className = 'drag-numero';
        drag.id = `drag-banco-${num}`;
        drag.innerText = num;
        drag.draggable = true;
        
        drag.ondragstart = (e) => {
            hablar(num); 
            e.dataTransfer.setData("text", num);
            e.dataTransfer.setData("origen", "banco");
        };
        
        disponibles.appendChild(drag);
    }

    window.revolverTodoDesdeCero = function() {
        const vacios = document.querySelectorAll('.vacio');
        vacios.forEach(div => {
            div.innerText = "";
            div.dataset.current = ""; 
            div.draggable = false;
            div.style.background = "white";
            div.style.color = "black";
            div.classList.remove('error-final', 'casilla-incorrecta', 'casilla-correcta');
        });

        disponibles.innerHTML = '';
        let numerosFaltantes = reto.filter(i => !i.fijo).map(item => item.n);
        numsFaltantes = numerosFaltantes.sort(() => Math.random() - 0.5);
        numsFaltantes.forEach(num => crearCirculoDisponible(num));
    }

    // Dibujar la línea de tiempo
    reto.forEach(item => {
        const div = document.createElement('div');
        div.className = `espacio-numero ${item.fijo ? 'fijo' : 'vacio'}`;
        
        if (item.fijo) {
            div.innerText = item.n;
            div.onclick = () => hablar(item.n);
        } else {
            div.dataset.target = item.n;
            div.dataset.current = "";

            div.ondragover = (e) => e.preventDefault();
            div.ondragenter = () => div.classList.add('hovered');
            div.ondragleave = () => div.classList.remove('hovered');
            
            div.ondragstart = (e) => {
                hablar(div.dataset.current);
                e.dataTransfer.setData("text", div.dataset.current);
                e.dataTransfer.setData("origen", "cuadro");
                div.classList.add('dragging-from'); 
            };

            div.ondrop = (e) => {
                e.preventDefault();
                div.classList.remove('hovered');
                
                // CORRECCIÓN: Captura directa y limpia del string de transferencia
                const valorEntrante = e.dataTransfer.getData("text");
                const origen = e.dataTransfer.getData("origen");

                if (!valorEntrante) return;

                if (div.dataset.current !== "" && div.dataset.current !== valorEntrante) {
                    crearCirculoDisponible(div.dataset.current);
                }

                if (origen === "cuadro") {
                    const celdaOrigen = document.querySelector('.dragging-from');
                    if (celdaOrigen) {
                        celdaOrigen.innerText = "";
                        celdaOrigen.dataset.current = "";
                        celdaOrigen.draggable = false;
                        celdaOrigen.style.background = "white";
                        celdaOrigen.classList.remove('dragging-from');
                    }
                } else {
                    const draggables = document.querySelectorAll('#numeros-disponibles .drag-numero');
                    draggables.forEach(d => { if(d.innerText == valorEntrante) d.remove(); });
                }

                div.innerText = valorEntrante;
                div.dataset.current = valorEntrante;
                div.draggable = true; 
                div.onclick = () => hablar(valorEntrante);

                verificarLineaAlCompletar();
            };
        }
        linea.appendChild(div);
    });

    let numerosIniciales = reto.filter(i => !i.fijo).map(item => item.n);
    numeresDesordenados = numerosIniciales.sort(() => Math.random() - 0.5);
    numeresDesordenados.forEach(num => crearCirculoDisponible(num));

    function verificarLineaAlCompletar() {
        const vacios = document.querySelectorAll('.vacio');
        const lineaLlena = Array.from(vacios).every(div => div.dataset.current !== "");
        
        if (!lineaLlena) return;

        let errores = 0;
        vacios.forEach(div => {
            if (div.dataset.current != div.dataset.target) {
                div.classList.add('casilla-incorrecta'); 
                errores++;
            } else {
                div.classList.remove('casilla-incorrecta');
                div.classList.add('casilla-correcta');
            }
        });

        if (errores === 0) {
            // ¡RESPUESTA CORRECTA! -> Sumamos 100 Pts
            puntajeJuego1 = 100;
            actualizarMarcadorVisual();
            
            // Guardamos los 100 puntos en la mochila virtual para los siguientes juegos
            localStorage.setItem('puntajeGlobal', '100');

            if (typeof confetti === 'function') {
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            }
            hablar("¡Increíble! Ordenaste todos los números muy bien. ¡Presiona avanzar!");

            const btn = document.getElementById('btnFinalizar');
            if (btn) btn.style.display = 'inline-block';

        } else {
            // ¡RESPUESTA INCORRECTA! -> Penalización de -10 puntos (mínimo 0)
            if (puntajeJuego1 >= 10) puntajeJuego1 -= 10;
            actualizarMarcadorVisual();

            hablar("¡Oh, no! Te has equivocado en la secuencia. ¡Vamos a intentarlo de nuevo!");

            setTimeout(() => {
                revolverTodoDesdeCero();
            }, 2200);
        }
    }
});

// EXPORTACIÓN AL ÁMBITO GLOBAL (Afuera del DOMContentLoaded para que el HTML los lea)
window.reiniciarLinea = function() {
    location.reload(); 
}

window.avanzarSiguienteJuego = function() {
    window.location.href = "actividad2.html"; 
}