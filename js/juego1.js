// Variable para registrar qué números ha tocado el niño
let numerosTocados = new Set();

function presionarNumero(num) {
    // 1. Sonido del número (Criterio 11)
    const audio = new Audio(`sonido/${num}.mp3`);
    audio.play().catch(() => {
        // Si no encuentra el archivo, usa la voz del sistema
        const voz = new SpeechSynthesisUtterance(num);
        voz.lang = 'es-MX';
        window.speechSynthesis.speak(voz);
    });

    // 2. Dibujar manzanas (Criterio 12)
    const contenedor = document.getElementById('contenedor-manzanas');
    contenedor.innerHTML = ''; // Limpia las manzanas del número anterior

    for (let i = 0; i < num; i++) {
        const img = document.createElement('img');
        img.src = 'img/manzana.avif'; 
        
        // --- ESTO ES LO QUE ARREGLA EL ESTIRAMIENTO ---
        img.className = 'manzana-animada'; 
        
        contenedor.appendChild(img);
    }

    // 3. Lógica de progreso (Criterio 13)
    numerosTocados.add(num);
    
    // Si ya interactuó con al menos 3 números, mostramos el botón para finalizar
    if (numerosTocados.size >= 3) {
        const btn = document.getElementById('btnFinalizar');
        if (btn) btn.style.display = 'inline-block';
    }
}

function terminarJuego() {
    // Criterio 15: Audio de victoria
    const victoria = new Audio('sonido/logro.mp3');
    victoria.play().catch(() => console.log("Falta sonido de logro"));

    // Criterio 16: Confetti
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    // Criterio 14: Mensaje
    alert("¡Felicidades! Completaste la actividad de matemáticas.");

    // Criterio 17: Redirección
    setTimeout(() => {
        window.location.href = "final.html";
    }, 2000);
}