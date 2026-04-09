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

// ─── Skills ───────────────────────────────────────────────────────────────────

export async function listSkills(includeDisabled = true) {
  const data = await request('GET', `/api/skills?includeDisabled=${includeDisabled}`);
  return data.skills;
}

export async function createSkill(skill) {
  return request('POST', '/api/skills', skill);
}

export async function updateSkill(id, fields) {
  return request('PATCH', `/api/skills/${id}`, fields);
}

export async function deleteSkill(id) {
  return request('DELETE', `/api/skills/${id}`);
}

// ─── Knowledge base ───────────────────────────────────────────────────────────

export async function listGlobalKnowledge(includeInactive = false) {
  const data = await request('GET', `/api/knowledge/global?includeInactive=${includeInactive}`);
  return data.entries;
}

export async function getGlobalKnowledgeEntry(id) {
  const data = await request('GET', `/api/knowledge/global/${id}`);
  return data.entry;
}

export async function createGlobalKnowledge(entry) {
  return request('POST', '/api/knowledge/global', entry);
}

export async function updateGlobalKnowledge(id, fields) {
  return request('PATCH', `/api/knowledge/global/${id}`, fields);
}

export async function deleteGlobalKnowledge(id) {
  return request('DELETE', `/api/knowledge/global/${id}`);
}

// ─── Channels ────────────────────────────────────────────────────────────────

export async function listChannels() {
  const data = await request('GET', '/api/admin/channels');
  return data.channels;
}

export async function getChannel(type) {
  const data = await request('GET', `/api/admin/channels/${type}`);
  return data.channel;
}

export async function saveChannel(type, config) {
  const data = await request('POST', `/api/admin/channels/${type}`, config);
  return data.channel;
}

export async function testChannel(type) {
  return request('POST', `/api/admin/channels/${type}/test`);
}

export async function disconnectChannel(type) {
  return request('DELETE', `/api/admin/channels/${type}`);
}

// ─── APIs ─────────────────────────────────────────────────────────────────────

export async function listApis() {
  const data = await request('GET', '/api/admin/apis');
  return data.apis;
}

export async function createApi(api) {
  return request('POST', '/api/admin/apis', api);
}

export async function updateApi(id, fields) {
  return request('PATCH', `/api/admin/apis/${id}`, fields);
}

export async function deleteApi(id) {
  return request('DELETE', `/api/admin/apis/${id}`);
}

export async function testApi(id) {
  return request('POST', `/api/admin/apis/${id}/test`);
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
