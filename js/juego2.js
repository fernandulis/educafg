document.addEventListener('DOMContentLoaded', () => {
    const linea = document.getElementById('linea-tiempo');
    const disponibles = document.getElementById('numeros-disponibles');
    const spans = document.querySelectorAll('.palabra-normal');

    // Secuencia del 1 al 10
    const reto = [
        {n: 1, fijo: true}, {n: 2, fijo: false}, {n: 3, fijo: true}, 
        {n: 4, fijo: false}, {n: 5, fijo: false}, {n: 6, fijo: false},
        {n: 7, fijo: true}, {n: 8, fijo: false}, {n: 9, fijo: false}, {n: 10, fijo: true}
    ];

    function hablar(texto) {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(texto.toString());
        msg.lang = 'es-MX';
        window.speechSynthesis.speak(msg);
    }

    // Animación del título
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

    // FUNCIÓN PARA CREAR LOS CÍRCULOS ARRASTRABLES
    window.crearCirculoDisponible = function(num) {
        // Evitamos duplicados en el banco de abajo por seguridad
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

    // FUNCIÓN PARA MEZCLAR Y RESETEAR TODO DESDE CERO (SOLUCIÓN AL BUG)
    window.revolverTodoDesdeCero = function() {
        const vacios = document.querySelectorAll('.vacio');
        vacios.forEach(div => {
            div.innerText = "";
            div.dataset.current = ""; // SOLUCIÓN: Limpiamos por completo la memoria interna
            div.draggable = false;
            div.style.background = "white";
            div.style.color = "black";
            div.style.borderColor = "#ff4d4d";
            div.classList.remove('error-final');
        });

        disponibles.innerHTML = '';

        let numerosFaltantes = reto.filter(i => !i.fijo).map(item => item.n);
        numerosFaltantes.sort(() => Math.random() - 0.5);

        numerosFaltantes.forEach(num => crearCirculoDisponible(num));
    }

    // DIBUJAR LA LÍNEA DE TIEMPO
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
                
                const valorEntrante = e.dataTransfer.getData("text");
                const origen = e.dataTransfer.getData("origen");

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
    numerosIniciales.sort(() => Math.random() - 0.5);
    numerosIniciales.forEach(num => crearCirculoDisponible(num));

    function verificarLineaAlCompletar() {
        const vacios = document.querySelectorAll('.vacio');
        const lineaLlena = Array.from(vacios).every(div => div.dataset.current !== "");
        
        if (!lineaLlena) return;

        let errores = 0;
        vacios.forEach(div => {
            if (div.dataset.current != div.dataset.target) {
                div.style.background = "#ffcccc"; 
                div.classList.add('error-final'); 
                errores++;
            } else {
                div.style.background = "#51cf66"; 
                div.style.color = "white";
            }
        });

        if (errores === 0) {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            const audioLogro = new Audio('sonido/logro.mp3');
            audioLogro.play().catch(() => {});

            hablar("¡Increíble! Ordenaste todos los números muy bien. ¡Presiona avanzar!");

            // Mostramos el botón de avanzar
            const btn = document.getElementById('btnFinalizar');
            if (btn) btn.style.display = 'inline-block';

        } else {
            const audioError = new Audio('sonido/error.mp3');
            audioError.play().catch(() => hablar("¡Oh, no! Te has equivocado en la secuencia. ¡Vamos a intentarlo desde el principio!"));

            setTimeout(() => {
                revolverTodoDesdeCero();
            }, 2000);
        }
    }
});

function reiniciarLinea() {
    location.reload(); 
}

// CORRECCIÓN CONEXIÓN BOTÓN: Esta función ahora coincide exactamente con el HTML
function avanzarPantallaFinal() {
    window.location.href = "final.html";
}