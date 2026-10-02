const express = require('express');
const axios = require('axios');
const router = express.Router();

// Check https://ai.google.dev/gemini-api/docs/models for the current
// recommended model if this one has been retired.
const GEMINI_MODEL = 'gemini-3.6-flash';

router.post('/stream', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'AI service is not configured' });
  }

  try {
    const upstream = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      data: {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt.trim() }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      },
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    upstream.data.pipe(res);

    upstream.data.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming error' });
      }
    });
  } catch (err) {
    // responseType: 'stream' means error responses ALSO come back as a
    // stream, not parsed JSON — read it manually to see the real error.
    let errorBody = '';

    if (err.response?.data && typeof err.response.data.on === 'function') {
      try {
        errorBody = await new Promise((resolve) => {
          let chunks = '';
          err.response.data.on('data', (chunk) => (chunks += chunk));
          err.response.data.on('end', () => resolve(chunks));
          err.response.data.on('error', () => resolve('(could not read error stream)'));
        });
      } catch {
        errorBody = '(failed to parse error stream)';
      }
    } else {
      errorBody = err.message;
    }

    console.error('AI stream error:', err.response?.status, errorBody);

    if (!res.headersSent) {
      const status = err.response?.status || 500;
      res.status(status).json({ error: 'Failed to reach AI service', details: errorBody });
    }
  }
});

module.exports = router;