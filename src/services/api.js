const BOT_URL = import.meta.env.VITE_BOT_URL || 'http://localhost:8000';
const BOT_SECRET = import.meta.env.VITE_BOT_SECRET || '';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${BOT_SECRET}`,
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BOT_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

// ─── Dealers ─────────────────────────────────────────────────────────────────

export async function listDealers() {
  const data = await request('GET', '/api/internal/dealers');
  return data.dealers;
}

export async function toggleDealer(dealerId, action) {
  return request('POST', '/api/admin/bot/toggle', { dealerId, action });
}

// ─── Logs ─────────────────────────────────────────────────────────────────────

export async function getLogs(dealerId, limit = 50, offset = 0) {
  const data = await request('GET', `/api/admin/logs/${dealerId}?limit=${limit}&offset=${offset}`);
  return data.logs;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function getHealth() {
  const res = await fetch(`${BOT_URL}/health`);
  if (!res.ok) throw new Error('Bot offline');
  return res.json();
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getAnalyticsSummary() {
  return request('GET', '/api/analytics/summary');
}

// ─── Playground ───────────────────────────────────────────────────────────────

export async function playgroundChat(message, dealerId) {
  const start = Date.now();
  const data = await request('POST', '/api/playground/chat', {
    message,
    dealer_id: dealerId ?? null,
  });
  const ms = Date.now() - start;
  const response = data.response ?? data.message ?? JSON.stringify(data);
  return { response, ms };
}
