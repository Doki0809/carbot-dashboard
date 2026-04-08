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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Playground</h1>
          <p className="text-sm text-slate-500 mt-0.5">Prueba el bot en tiempo real</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition"
          >
            🗑 Limpiar chat
          </button>
        )}
      </div>

      {/* Dealer ID config */}
      <div className="flex items-center gap-2 mb-4 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
        <span className="text-sm text-slate-500">Dealer ID:</span>
        <input
          type="text"
          placeholder="opcional — vacío = default"
          value={dealerId}
          onChange={(e) => setDealerId(e.target.value)}
          className="flex-1 text-sm outline-none placeholder:text-slate-400 text-slate-700"
        />
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          Bot conectado
        </span>
      </div>

      {/* Chat window */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
              <div className="text-4xl">🤖</div>
              <div>
                <p className="font-semibold text-slate-700">Missy está lista</p>
                <p className="text-sm text-slate-400 mt-1">
                  Escribe un mensaje o usa un preset para comenzar
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-xs border border-slate-200 hover:border-brand-300 hover:text-brand-700 text-slate-600 rounded-full px-3 py-1.5 transition"
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
                className={`w-8 h-8 mt-0.5 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  msg.role === 'user' ? 'bg-brand-100' : 'bg-emerald-100'
                }`}
              >
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-1 max-w-[72%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
                <div className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <span>{formatTime(msg.ts)}</span>
                  {msg.ms != null && (
                    <span className="text-emerald-500">{msg.ms}ms</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
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
        <div className="border-t border-slate-100 p-4">
          {/* Presets toggle (when chat active) */}
          {messages.length > 0 && (
            <div className="mb-3">
              <button
                onClick={() => setShowPresets((v) => !v)}
                className="text-xs text-slate-400 hover:text-slate-600 transition flex items-center gap-1"
              >
                {showPresets ? '▲' : '▼'} Mensajes de prueba
              </button>
              {showPresets && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      disabled={loading}
                      className="text-xs border border-slate-200 hover:border-brand-300 hover:text-brand-700 text-slate-600 rounded-full px-3 py-1 transition disabled:opacity-40"
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
              className="flex-1 resize-none overflow-hidden border border-slate-200 focus:border-brand-400 rounded-xl px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 disabled:opacity-50"
              style={{ minHeight: '44px' }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? <Spinner size="sm" /> : '↑'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
