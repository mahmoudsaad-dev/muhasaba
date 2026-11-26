// Vercel serverless function: sync Muhasaba app state per device.
// Storage: Vercel KV / Upstash Redis when KV_REST_API_URL + KV_REST_API_TOKEN
// env vars are set (link a KV store in the Vercel dashboard). Otherwise it
// falls back to in-memory storage (per warm instance, not durable).

const mem = global.__muhasaba_mem || (global.__muhasaba_mem = {});

async function kv(command) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const data = await res.json();
  return data.result;
}

function cleanId(id) {
  return String(id || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const deviceId = cleanId(req.method === 'GET' ? req.query.deviceId : (req.body || {}).deviceId);
  if (!deviceId) return res.status(400).json({ error: 'deviceId required' });
  const key = `muhasaba:${deviceId}`;

  if (req.method === 'GET') {
    let state = await kv(['GET', key]);
    if (state == null) state = mem[key] || null;
    if (typeof state === 'string') { try { state = JSON.parse(state); } catch (e) {} }
    return res.status(200).json({ state: state || null });
  }

  if (req.method === 'POST') {
    const state = (req.body || {}).state;
    if (!state || typeof state !== 'object') return res.status(400).json({ error: 'state object required' });
    const saved = { ...state, serverUpdatedAt: Date.now() };
    const r = await kv(['SET', key, JSON.stringify(saved)]);
    if (r === null) mem[key] = saved;
    return res.status(200).json({ ok: true, serverUpdatedAt: saved.serverUpdatedAt });
  }

  return res.status(405).json({ error: 'method not allowed' });
};
