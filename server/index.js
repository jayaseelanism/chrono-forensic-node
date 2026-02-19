import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import https from 'https';

// Optional Vault integration
let vaultClient = null;
try {
  // lazy require so app can run without vault dependency if not used
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeVault = require('node-vault');
  vaultClient = nodeVault;
} catch (e) {
  // node-vault not installed or not needed
}

dotenv.config();

const app = express();
app.use(helmet());


const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use('/api/', limiter);

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not set; AI endpoints will fail until set');
}

// Optional server-level API key: if set, incoming requests to /api/* must provide X-API-KEY matching it.
const serverApiKey = process.env.SERVER_API_KEY;
app.use('/api', (req, res, next) => {
  if (serverApiKey) {
    const provided = req.get('x-api-key');
    if (!provided || provided !== serverApiKey) return res.status(401).json({ error: 'unauthorized' });
  }
  next();
});

// Load secrets: prefer Vault if configured, otherwise use env var
async function loadSecret(key) {
  // If VAULT_ADDR and VAULT_TOKEN are configured and node-vault is available, try Vault
  const vaultAddr = process.env.VAULT_ADDR;
  const vaultToken = process.env.VAULT_TOKEN;
  if (vaultAddr && vaultToken && vaultClient) {
    try {
      const client = vaultClient({ endpoint: vaultAddr, token: vaultToken });
      // default path: secret/data/chrono
      const path = process.env.VAULT_SECRET_PATH || 'secret/data/chrono';
      const resp = await client.read(path);
      // support both KV v1 (data) and v2 (data.data)
      const data = resp && (resp.data?.data || resp.data || {});
      if (data && data[key]) return data[key];
    } catch (e) {
      console.error('Vault secret fetch failed', e.message || e);
    }
  }
  return process.env[key];
}

let aiClient;
(async () => {
  const gemini = await loadSecret('GEMINI_API_KEY');
  if (!gemini) console.error('GEMINI_API_KEY not found in environment or Vault');
  aiClient = new GoogleGenAI({ apiKey: gemini });
})();

// Require explicit user consent header for AI processing. Clients must send X-USER-CONSENT: true.
function requireConsent(req, res, next) {
  const consent = req.get('x-user-consent');
  if (consent !== 'true') return res.status(400).json({ error: 'user_consent_required' });
  next();
}

app.post('/api/ai/diagnostic', requireConsent, async (req, res) => {
  try {
    const { stats } = req.body || {};
    if (!stats || typeof stats.totalFiles !== 'number') return res.status(400).json({ error: 'invalid-stats' });

    const prompt = `Analyze the following media library statistics and provide a professional forensic diagnostic report:\nTotal Files: ${stats.totalFiles}\nTotal Size: ${stats.totalSize} bytes\nDuplicates Found: ${stats.duplicatesFound}\nTime Issues (Missing/Broken Dates): ${stats.timeIssuesFound}\n\nThe report should include an executive summary of library health, specific risks (e.g., storage waste, metadata decay), and prioritized recommendations.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return res.json({ text: response.text || '' });
  } catch (err) {
    console.error('AI diagnostic error', err);
    return res.status(500).json({ error: 'ai_error' });
  }
});

// Media analysis endpoint: accepts small inline base64 payloads and metadata. The server will not persist files.
app.post('/api/ai/analyze', requireConsent, async (req, res) => {
  try {
    const { prompt, images } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'missing_prompt' });

    // Build parts with metadata and optional inline data if provided (server does not persist)
    const parts = [];
    if (Array.isArray(images)) {
      for (const img of images.slice(0, 10)) { // limit to 10 images per request
        if (img.metadata) parts.push(`ID: ${img.id}, Date: ${img.metadata.lastModified ? new Date(img.metadata.lastModified).toISOString() : 'unknown'}, Size: ${img.metadata.size || 'unknown'} bytes`);
        if (img.data) parts.push({ inlineData: { data: img.data, mimeType: img.mimeType || 'application/octet-stream' } });
      }
    }
    parts.push(prompt);

    const response = await aiClient.models.generateContent({ model: 'gemini-3-pro-preview', contents: parts });
    return res.json({ text: response.text || '' });
  } catch (err) {
    console.error('AI analyze error', err);
    return res.status(500).json({ error: 'ai_error' });
  }
});

// Chat endpoint (fast follow-up)
app.post('/api/ai/chat', requireConsent, async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: 'missing_message' });

    const contents = Array.isArray(history) ? [...history, { role: 'user', parts: [{ text: message }] }] : [{ role: 'user', parts: [{ text: message }] }];
    const response = await aiClient.models.generateContent({ model: 'gemini-3-flash-preview', contents });
    return res.json({ text: response.text || '' });
  } catch (err) {
    console.error('AI chat error', err);
    return res.status(500).json({ error: 'ai_error' });
  }
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;

// If TLS paths are provided, run an HTTPS server
const certPath = process.env.TLS_CERT_PATH;
const keyPath = process.env.TLS_KEY_PATH;

if (certPath && keyPath) {
  try {
    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    https.createServer({ cert, key }, app).listen(PORT, () => {
      console.log(`AI proxy HTTPS server listening on port ${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start HTTPS server, falling back to HTTP:', e.message || e);
    app.listen(PORT, () => console.log(`AI proxy server listening on port ${PORT}`));
  }
} else {
  app.listen(PORT, () => console.log(`AI proxy server listening on port ${PORT}`));
}
