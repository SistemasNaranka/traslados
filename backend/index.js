// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const {
  autenticarUsuario,

} = require('./conexion');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const { WEBHOOK_URL_TRASLADOS } = process.env; 

  try {
    const { token, user } = await autenticarUsuario(email, password);
  
    if (!user.codigo_ultra || !user.empresa) {
      return res.status(403).json({
        error: 'No tienes permisos para acceder.'
      });
    }

    const datosWebhook = {
      codigo_ultra: user.codigo_ultra,
      empresa: user.empresa
    };

    try {
      const webhookResp = await fetch(WEBHOOK_URL_TRASLADOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosWebhook)
      });
      
      const contentType = webhookResp.headers.get('content-type') || '';
      let parsedResponse;
      try {
        if (contentType.includes('application/json')) {
          parsedResponse = await webhookResp.clone().json();
        } else {
          parsedResponse = await webhookResp.clone().text();
        }
      } catch (e) {
        console.error('No se pudo leer la respuesta del webhook:', e.message);
        parsedResponse = null;
      }

      if (!webhookResp.ok) {
        console.error('Webhook error:', webhookResp.status);
        return res.status(500).json({ error: 'Error en el webhook de traslados.' });
      }

      if (parsedResponse && !Array.isArray(parsedResponse)) {
        parsedResponse = [parsedResponse];
      }

      // Solo se envía una vez aquí
      res.json({ token, user, traslados: parsedResponse });

    } catch (webhookErr) {
      console.error('Error al contactar el webhook:', webhookErr);
      return res.status(500).json({ error: 'Fallo al contactar el webhook de traslados.' });
    }
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(401).json({ error: err.message });
  }
});

// Aprobar traslados
app.post('/api/aprobar', async (req, res) => {
  const { traslados, empresa, clave, codigo_ultra } = req.body;
  const authHeader = req.headers.authorization;
  const { WEBHOOK_USERNAME, WEBHOOK_PASSWORD, WEBHOOK_URL_POST } = process.env;

  // Verificar token Bearer
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado o inválido' });
  }

  const token = authHeader.split(' ')[1];

  //Validación básica de campos requeridos
  if (!traslados?.length || !empresa || !clave || !codigo_ultra) {
      return res.status(400).json({
      error: 'Faltan campos requeridos: traslados, empresa, clave o codigo_ultra'
      });
    }

  try {
    // Preparar datos para el webhook
    const bodyData = {
      traslados,
      empresa,
      codigo_ultra,
      clave
    };

    const webhookResp = await fetch(WEBHOOK_URL_POST, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${WEBHOOK_USERNAME}:${WEBHOOK_PASSWORD}`).toString('base64')
      },
      body: JSON.stringify(bodyData)
    });

    const raw = await webhookResp.text();
    console.log('Respuesta webhook (raw):', raw);

    if (!webhookResp.ok) {
      throw new Error(`Error en el webhook externo: ${webhookResp.status} ${webhookResp.statusText}`);
    }

    // Parsear respuesta del webhook
    let webhookData;
    try {
      webhookData = JSON.parse(raw);
    } catch {
      webhookData = { mensaje: raw }; // Si no es JSON, envolver como texto plano
    }

    return res.json({ ok: true, webhook: webhookData });

  } catch (err) {
    return res.status(500).json({ error: 'Error al procesar la aprobación: ' + err.message });
  }
});


const PUBLIC_DIR = path.resolve(__dirname, '../public');
app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Sistema activo en http://localhost:${PORT}`);
});
