// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const EXCHANGE_RATE_API_KEY = process.env.FASTFOREX_API_KEY;

if (!EXCHANGE_RATE_API_KEY) {
  console.warn('⚠️ Warning: FASTFOREX API key is not set. Set FASTFOREX_API_KEY in .env');
}

// ========== /api/financial ==========
app.get('/api/financial', async (req, res) => {
  try {
    const country = req.query.country;
    if (!country) return res.status(400).json({ error: 'Missing country param' });

    const countryRes = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`);
    if (!countryRes.ok) return res.status(404).json({ error: 'Country not found' });

    const countryData = await countryRes.json();
    const c = countryData[0];
    if (!c || !c.currencies) return res.status(500).json({ error: 'Currency data not available' });

    const currencyCode = Object.keys(c.currencies)[0];
    const currencyName = c.currencies[currencyCode]?.name || currencyCode;
    const flag = c.flags?.png || null;

    // ดึง exchange rate จาก fastforex
    const exchangeRateRes = await fetch(
      `https://api.fastforex.io/fetch-one?from=THB&to=${encodeURIComponent(currencyCode)}&api_key=${EXCHANGE_RATE_API_KEY}`
    );
    if (!exchangeRateRes.ok) {
      const text = await exchangeRateRes.text();
      return res.status(502).json({ error: 'Failed to fetch exchange rate', detail: text });
    }

    const exchangeData = await exchangeRateRes.json();
    const rate = exchangeData?.result?.[currencyCode] ?? null;

    res.json({ currencyCode, currencyName, flag, rate });
  } catch (err) {
    console.error('❌ Error /api/financial:', err);
    res.status(500).json({ error: 'Failed to get info' });
  }
});

// ========== /api/exchange ==========
app.get('/api/exchange', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'Missing from or to param' });

    const url = `https://api.fastforex.io/fetch-one?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&api_key=${EXCHANGE_RATE_API_KEY}`;
    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Failed to fetch exchange rate', detail: text });
    }

    const data = await r.json();
    const rate = data?.result?.[to] ?? null;

    res.json({ from, to, rate, raw: data });
  } catch (err) {
    console.error('❌ Error /api/exchange:', err);
    res.status(500).json({ error: 'Failed to fetch exchange' });
  }
});

// ========== /api/health-notices ==========
app.get('/api/health-notices', async (req, res) => {
  try {
    const { country } = req.query;
    if (!country) return res.status(400).json({ error: 'Missing country parameter' });

    const cdcUrl = 'https://wwwnc.cdc.gov/travel/wwwnc-api.axd';
    const response = await fetch(cdcUrl);
    if (!response.ok) throw new Error(`Failed to fetch CDC API: ${response.statusText}`);

    const xmlData = await response.text();
    const regex = new RegExp(`<item>.*?<title>\\s*${country}[^<]*</title>(.*?)<\/item>`, 'is');
    const match = xmlData.match(regex);

    if (match) {
      const titleMatch = match[0].match(/<title>(.*?)<\/title>/is);
      const descriptionMatch = match[0].match(/<description>(.*?)<\/description>/is);

      const title = titleMatch ? titleMatch[1].trim() : 'No specific title notice.';
      const description = descriptionMatch
        ? descriptionMatch[1].replace(/<[^>]+>/g, '').trim()
        : 'No specific health recommendations.';

      res.json({ found: true, title, recommendation: description });
    } else {
      res.json({
        found: false,
        recommendation: 'No specific health notices found from the CDC for this country at the moment.',
      });
    }
  } catch (err) {
    console.error('❌ Error /api/health-notices:', err);
    res.status(500).json({ error: 'Server error while fetching health notices.' });
  }
});

app.listen(PORT, () => console.log(`✅ Proxy server running on port ${PORT}`));
