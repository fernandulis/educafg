// Sistema de puntos persistente
if (localStorage.getItem("puntajeMatematica") === null) {
    localStorage.setItem("puntajeMatematica", "0");
}

function actualizarMarcadorVisual() {
    const contenedorPuntaje = document.getElementById("marcador-puntos");
    if (contenedorPuntaje) {
        const puntosActuales = localStorage.getItem("puntajeMatematica") || "0";
        contenedorPuntaje.innerHTML = `❤️ ${puntosActuales} Pts`;
    }
}

// FUNCIÓN CLAVE: Hablar y resaltar palabra por palabra
function hablarYResaltar(idContenedor, textoCompleto) {
    window.speechSynthesis.cancel();
    const contenedor = document.getElementById(idContenedor);
    const palabras = textoCompleto.split(" ");
    
    // Limpiamos el contenedor y creamos spans para cada palabra
    contenedor.innerHTML = palabras.map(p => `<span class="palabra-resaltable">${p}</span>`).join(" ");
    const spans = contenedor.querySelectorAll(".palabra-resaltable");

    const mensaje = new SpeechSynthesisUtterance(textoCompleto);
    mensaje.lang = 'es-CL';
    mensaje.rate = 0.9; // Un poco más lento para que el resaltado se note

    mensaje.onboundary = (event) => {
        if (event.name === 'word') {
            // Calculamos qué palabra toca iluminar basándonos en el índice del texto
            const indicePalabra = textoCompleto.substring(0, event.charIndex).trim().split(/\s+/).length;
            const realIndex = event.charIndex === 0 ? 0 : indicePalabra;
            
            spans.forEach(s => s.classList.remove("activa"));
            if (spans[realIndex]) {
                spans[realIndex].classList.add("activa");
            }
        }
    };

    mensaje.onend = () => {
        setTimeout(() => {
            spans.forEach(s => s.classList.remove("activa"));
        }, 500);
    };

    window.speechSynthesis.speak(mensaje);
}

function sumarPuntos(cantidad) {
    let puntosActuales = parseInt(localStorage.getItem("puntajeMatematica"), 10) || 0;
    puntosActuales += cantidad;
    localStorage.setItem("puntajeMatematica", puntosActuales.toString());
    actualizarMarcadorVisual();
}

document.addEventListener("DOMContentLoaded", actualizarMarcadorVisual);