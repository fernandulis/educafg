let avatarSeleccionado = "";

// Función para que la computadora hable
function laComputadoraHabla(texto) {
    window.speechSynthesis.cancel(); // Detiene cualquier voz anterior
    const mensaje = new SpeechSynthesisUtterance();
    mensaje.text = texto;
    mensaje.lang = 'es-MX'; // Voz en español
    mensaje.rate = 1.0;
    window.speechSynthesis.speak(mensaje);
}

// 1. SELECCIONAR AVATAR
function seleccionarAvatar(elemento, ruta) {
    document.querySelectorAll('.avatar-opcion').forEach(img => {
        img.style.borderColor = "#ffcc00"; 
        img.classList.remove('seleccionado');
    });
    
    elemento.style.borderColor = "#ff0000";
    elemento.classList.add('seleccionado');
    avatarSeleccionado = ruta;

    // Sonido de clic (opcional)
    let audioClick = new Audio('sonido/sonidoseleccionaR.mp3');
    audioClick.play().catch(e => console.log("Audio de clic omitido"));

    laComputadoraHabla("¡Avatar seleccionado!");
}

// 2. VALIDAR INGRESO
function validarIngreso() {
    const nombreInput = document.getElementById('nombreEstudiante').value.trim();

    // ERROR: No hay nombre o no hay avatar
    if (nombreInput === "" || avatarSeleccionado === "") {
        let audioError = new Audio('sonido/error.mp3');
        audioError.play().catch(e => console.log("Audio de error omitido"));
        
        laComputadoraHabla("Debes escribir tu nombre y seleccionar un avatar");
        alert("¡Atención! Falta tu nombre o tu avatar.");
    } 
    // ÉXITO: Todo listo
    else {
        localStorage.setItem("nombreUsuario", nombreInput);
        localStorage.setItem("avatarUsuario", avatarSeleccionado);

        // Efecto visual de serpentinas
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });

        // --- SALUDO PERSONALIZADO ---
        laComputadoraHabla(`¡Bienvenido, ${nombreInput}!`);

        // Esperamos 2.5 segundos para que termine de hablar antes de cambiar de página
        setTimeout(() => {
            window.location.href = "bienvenida.html";
        }, 2500);
    }
}