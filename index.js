import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const USER_ID = process.env.USER_ID;
const PORT = process.env.PORT || 3000;

const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

if (!GITHUB_TOKEN) {
    console.error('Token do github não encontrado em .env');
    process.exit(1);
}

if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.error('Variáveis do EmailJS não encontradas em .env');
    process.exit(1);
}

app.get('/', (req, res) => {
    res.redirect("https://leorodrigues133.github.io/Meu-Portfolio-Angular/");
});

app.get('/user', async (req, res) => {
    const url = `https://api.github.com/users/${USER_ID}/repos`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });
        if (!response.ok) {
            return res.status(response.status).json({ error: 'erro na requisição ao Github' });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
    }
});

app.get('/project/:repo', async (req, res) => {
    const { repo } = req.params;
    const url = `https://api.github.com/repos/${USER_ID}/${repo}/contents/portfolio.json?ref=master`;
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
            },
        });
        if (response.status === 404) {
            return res.status(200).json({ notFound: true });
        }
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Arquivo não encontrado ou outro erro' });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
    }
});

app.get('/email-config', (req, res) => {
    res.json({
        serviceId: EMAILJS_SERVICE_ID,
        templateId: EMAILJS_TEMPLATE_ID,
        publicKey: EMAILJS_PUBLIC_KEY
    });
});

app.listen(PORT, () => {
    console.log(`API proxy ativo em http://localhost:${PORT}/`);
});