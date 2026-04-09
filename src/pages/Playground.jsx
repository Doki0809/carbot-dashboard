import { useState, useRef, useEffect, useCallback } from 'react';
import { playgroundChat } from '../services/api';
import Spinner from '../components/Spinner';

const PRESETS = [
  'Hola, quiero información sobre un auto',
  '¿Cuáles son los horarios de atención?',
  'Necesito agendar una cita de servicio',
  '¿Tienen financiamiento disponible?',
  'Quiero hablar con un agente humano',
];

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function Playground() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dealerId, setDealerId] = useState('');
  const [showPresets, setShowPresets] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);
    setShowPresets(false);

    // reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const { response, ms } = await playgroundChat(trimmed, dealerId || undefined);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', text: response, ts: Date.now(), ms },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [loading, dealerId]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleTextareaChange(e) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function clearChat() {
    setMessages([]);
    setError('');
    textareaRef.current?.focus();
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem - 3rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 float-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>Playground</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Prueba el bot en tiempo real</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="btn-ghost flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
          >
            🗑 Limpiar chat
          </button>
        )}
      </div>

      {/* Dealer ID config */}
      <div className="flex items-center gap-2 mb-4">
        <div className="glass-card flex-1 flex items-center gap-3 px-4 py-2.5 float-in">
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Dealer ID:</span>
          <input
            type="text"
            placeholder="opcional — vacío = default"
            value={dealerId}
            onChange={(e) => setDealerId(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none placeholder-white/40"
            style={{ color: 'rgba(255,255,255,0.95)' }}
          />
        </div>
        <div className="glass-card px-4 py-2.5 float-in flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.4)' }} />
          <span className="text-xs font-medium" style={{ color: '#10b981' }}>Conectado</span>
        </div>
      </div>

      {/* Chat window */}
      <div className="glass-card flex flex-col flex-1 overflow-hidden float-in stagger-2">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8 float-in">
              <div className="text-4xl filter drop-shadow-lg">🤖</div>
              <div>
                <p className="font-semibold text-lg" style={{ color: 'rgba(255,255,255,0.9)' }}>Missy está lista</p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Escribe un mensaje o usa un preset para comenzar
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mt-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-xs btn-ghost rounded-full px-4 py-2 transition"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 mt-0.5 rounded-full flex items-center justify-center text-sm shrink-0`}
                style={{
                  background: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'rgba(230,48,48,0.15)',
                  border: msg.role === 'user' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(230,48,48,0.3)',
                  boxShadow: msg.role !== 'user' ? '0 0 12px rgba(230,48,48,0.2)' : 'none'
                }}
              >
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-1 max-w-[72%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-2xl rounded-tr-sm border border-white/10'
                      : 'rounded-2xl rounded-tl-sm border border-red-500/30'
                  }`}
                  style={{
                    color: 'rgba(255,255,255,0.95)',
                    background: msg.role === 'user' ? 'rgba(255,255,255,0.08)' : 'rgba(230,48,48,0.12)'
                  }}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-2 text-[10px] px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`} style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>{formatTime(msg.ts)}</span>
                  {msg.ms != null && (
                    <span style={{ color: '#10b981' }}>{msg.ms}ms</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 float-in">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ background: 'rgba(230,48,48,0.15)', border: '1px solid rgba(230,48,48,0.3)', boxShadow: '0 0 12px rgba(230,48,48,0.2)' }}
              >
                🤖
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 border border-red-500/30" style={{ background: 'rgba(230,48,48,0.12)' }}>
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'rgba(255,255,255,0.6)', animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 mb-2 bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-lg">
            ⚠ {error}
          </div>
        )}

        {/* Input bar */}
        <div className="p-4" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Presets toggle */}
          {messages.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowPresets((v) => !v)}
                className="text-xs transition flex items-center gap-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                {showPresets ? '▲' : '▼'} Mensajes de prueba
              </button>
              {showPresets && (
                <div className="mt-2 flex flex-wrap gap-1.5 float-in">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      disabled={loading}
                      className="text-xs btn-ghost rounded-full px-3 py-1 transition disabled:opacity-40"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-end gap-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje… (Enter envía, Shift+Enter salto de línea)"
              disabled={loading}
              className="input-dark flex-1 resize-none overflow-hidden rounded-xl px-4 py-3 text-sm transition disabled:opacity-50"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="btn-red w-11 h-11 flex items-center justify-center rounded-xl transition shrink-0 disabled:opacity-40"
            >
              {loading ? <Spinner size="sm" /> : '↑'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
