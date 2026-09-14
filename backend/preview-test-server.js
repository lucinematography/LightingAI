import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { generateVisualPreview, VISUAL_PREVIEW_MODEL, VISUAL_PREVIEW_QUALITY } from './visual-preview.js';

dotenv.config();

const apiKey = String(process.env.OPENAI_API_KEY || '').trim();
const keyConfigured = Boolean(apiKey) && !/placeholder|not-configured|test-placeholder/i.test(apiKey);
const openai = keyConfigured ? new OpenAI({ apiKey }) : null;
const app = express();

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/health', (req, res) => res.json({
  ok: true,
  service: 'LightingAI AI Preview Test',
  previewConfigured: keyConfigured
}));

app.get('/api/visual-preview', (req, res) => res.json({
  ok: keyConfigured,
  model: VISUAL_PREVIEW_MODEL,
  quality: VISUAL_PREVIEW_QUALITY,
  environment: 'isolated-test'
}));

app.post('/api/visual-preview', async (req, res) => {
  if (!keyConfigured || !openai) {
    return res.status(503).json({ error: 'Visual preview test backend is not configured yet.' });
  }
  try {
    const { scenePhoto = '', plan = {}, description = '', equipment = [], language = 'sr' } = req.body || {};
    if (!scenePhoto) return res.status(400).json({ error: 'Scene photo is required.' });
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) return res.status(400).json({ error: 'Lighting plan is required.' });
    const preview = await generateVisualPreview(openai, { scenePhoto, plan, description, equipment, language });
    res.json(preview);
  } catch (error) {
    console.error('Isolated visual preview generation failed:', error);
    const message = String(error?.message || '');
    const status = /unsupported|empty|too large|data URL/i.test(message) ? 400 : 500;
    res.status(status).json({ error: 'Visual preview generation failed.' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`LightingAI AI Preview Test running on port ${port}; previewConfigured=${keyConfigured}`));
