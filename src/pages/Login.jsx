import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  { quote: 'Tu super asistente todo en uno.', sub: 'Capturo leads, respondo preguntas y agendo citas — las 24 horas, los 7 días.' },
  { quote: 'Convierto conversaciones en ventas reales.', sub: 'Analizo intenciones, priorizo clientes y nunca dejo un lead sin atender.' },
  { quote: 'Sé cuándo escalar y cuándo cerrar.', sub: 'Detecto el momento justo para conectar con un asesor o cerrar la venta.' },
  { quote: 'Hablo como tú, actúo como tu mejor vendedor.', sub: 'Me adapto al tono de tu agencia con la precisión de un experto.' },
  { quote: 'No duermo. No descanso. Nunca olvido.', sub: 'Seguimiento automático, recordatorios inteligentes y respuestas instantáneas.' },
  { quote: 'La primera impresión que nadie olvida.', sub: 'Velocidad, calidez y precisión en cada mensaje desde el primer contacto.' },
  { quote: 'Tu agencia en modo turbo, siempre.', sub: 'Integrada con tu CRM, WhatsApp y procesos — lista desde el día uno.' },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .login-root {
    min-height: 100vh;
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', system-ui, sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* ── Loader ── */
  .loader-overlay {
    position: fixed; inset: 0; z-index: 100;
    background: #080808;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 24px;
  }
  .loader-overlay.fade-out {
    animation: loaderFade 0.6s ease forwards;
  }
  @keyframes loaderFade {
    to { opacity: 0; pointer-events: none; }
  }

  .loader-logo {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, #E63030 0%, #FF6B6B 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 40px rgba(230,48,48,0.5);
    animation: logoPulse 1.4s ease-in-out infinite;
  }
  @keyframes logoPulse {
    0%, 100% { box-shadow: 0 0 30px rgba(230,48,48,0.4); transform: scale(1); }
    50%       { box-shadow: 0 0 60px rgba(230,48,48,0.7); transform: scale(1.06); }
  }

  .loader-bar-track {
    width: 160px; height: 2px;
    background: rgba(255,255,255,0.08);
    border-radius: 9999px; overflow: hidden;
  }
  .loader-bar-fill {
    height: 100%; border-radius: 9999px;
    background: linear-gradient(90deg, #E63030, #FF6B6B);
    animation: barFill 1.4s ease forwards;
  }
  @keyframes barFill {
    from { width: 0%; }
    to   { width: 100%; }
  }
  .loader-text {
    font-size: 12px; color: rgba(255,255,255,0.3);
    letter-spacing: 0.15em; text-transform: uppercase;
    animation: blink 1.4s ease-in-out infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 0.3; } 50% { opacity: 0.7; }
  }

  /* ── Background effects ── */
  .bg-glow {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
  }
  .bg-glow::before {
    content: '';
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230,48,48,0.12) 0%, transparent 70%);
    top: 50%; left: 25%;
    transform: translate(-50%, -50%);
    animation: glowDrift 8s ease-in-out infinite alternate;
  }
  .bg-glow::after {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(230,48,48,0.07) 0%, transparent 70%);
    top: 50%; left: 75%;
    transform: translate(-50%, -50%);
    animation: glowDrift 10s ease-in-out infinite alternate-reverse;
  }
  @keyframes glowDrift {
    from { transform: translate(-50%, -50%) scale(1); }
    to   { transform: translate(-50%, -55%) scale(1.15); }
  }

  .bg-grid {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 48px 48px;
  }

  /* ── Card ── */
  .card {
    position: relative; z-index: 10;
    display: flex;
    width: 900px; max-width: calc(100vw - 32px);
    min-height: 560px;
    border-radius: 28px;
    border: 1px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(24px);
    box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04);
    overflow: hidden;
    animation: cardEnter 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
    opacity: 0; transform: translateY(24px) scale(0.98);
  }
  @keyframes cardEnter {
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── Left panel ── */
  .panel-left {
    width: 46%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 40px;
    gap: 28px;
    position: relative;
    border-right: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(145deg, rgba(230,48,48,0.06) 0%, transparent 60%);
  }

  /* ── Logo ── */
  .logo-wrap {
    display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .logo-icon {
    width: 72px; height: 72px; border-radius: 20px;
    background: linear-gradient(135deg, #E63030 0%, #FF6B6B 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 32px rgba(230,48,48,0.45), 0 8px 24px rgba(0,0,0,0.4);
    animation: float 5s ease-in-out infinite;
    transition: box-shadow 0.3s;
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-8px); }
  }
  .logo-name {
    font-size: 22px; font-weight: 700; color: #fff; letter-spacing: -0.4px;
    text-align: center;
  }
  .logo-sub {
    font-size: 12px; color: rgba(255,255,255,0.4);
    text-align: center; margin-top: -4px;
  }

  /* ── Carousel ── */
  .carousel {
    min-height: 110px;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; width: 100%;
  }
  .slide { display: flex; flex-direction: column; gap: 8px; align-items: center; }
  .slide.enter  { animation: slideEnter 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
  .slide.exit   { animation: slideExit  0.3s ease forwards; }
  @keyframes slideEnter {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideExit {
    from { opacity: 1; transform: translateY(0); }
    to   { opacity: 0; transform: translateY(-14px); }
  }
  .slide-quote {
    font-size: 16px; font-weight: 600; color: #F0F0FF; line-height: 1.45;
    max-width: 280px;
  }
  .slide-sub {
    font-size: 12px; color: rgba(255,255,255,0.38); line-height: 1.6;
    max-width: 270px;
  }

  /* ── Dots ── */
  .dots { display: flex; align-items: center; gap: 6px; }
  .dot {
    height: 6px; border-radius: 9999px; border: none; cursor: pointer; padding: 0;
    transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
    background: rgba(255,255,255,0.18);
  }
  .dot.active { background: #E63030; width: 20px !important; }

  /* ── Stats ── */
  .stats { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
  .stat-chip {
    display: flex; align-items: center; gap: 5px;
    border-radius: 9999px; padding: 5px 12px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    font-size: 11px; color: rgba(255,255,255,0.45);
    backdrop-filter: blur(8px);
    transition: border-color 0.2s, color 0.2s;
  }
  .stat-chip:hover { border-color: rgba(230,48,48,0.3); color: rgba(255,255,255,0.65); }

  /* ── Divider ── */
  .divider {
    position: absolute; top: 0; bottom: 0; left: 46%;
    width: 1px; background: rgba(255,255,255,0.06);
  }

  /* ── Right panel ── */
  .panel-right {
    flex: 1;
    display: flex; flex-direction: column;
    justify-content: center;
    padding: 48px 44px;
    gap: 0;
  }

  .step-bar { display: flex; gap: 6px; margin-bottom: 28px; }
  .step-seg {
    height: 2px; width: 32px; border-radius: 9999px;
    transition: background 0.4s;
  }
  .step-seg.active { background: #E63030; }
  .step-seg.inactive { background: rgba(255,255,255,0.1); }

  .form-title {
    font-size: 28px; font-weight: 700; color: #F8F8FF;
    line-height: 1.2; margin-bottom: 8px;
  }
  .form-title span { color: #E63030; }
  .form-desc {
    font-size: 13px; color: rgba(255,255,255,0.4);
    line-height: 1.6; margin-bottom: 28px;
  }

  .form { display: flex; flex-direction: column; gap: 14px; }

  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4);
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .field-input {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    background: rgba(255,255,255,0.05);
    padding: 13px 16px;
    font-size: 14px; font-family: inherit;
    color: #F8F8FF;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .field-input::placeholder { color: rgba(255,255,255,0.2); }
  .field-input:focus {
    border-color: rgba(230,48,48,0.5);
    background: rgba(255,255,255,0.07);
    box-shadow: 0 0 0 3px rgba(230,48,48,0.08);
  }

  .error-box {
    border-radius: 10px;
    border: 1px solid rgba(230,48,48,0.25);
    background: rgba(230,48,48,0.08);
    padding: 9px 13px;
    font-size: 12px; color: #FF8080;
    animation: errorShake 0.35s ease;
  }
  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    60%       { transform: translateX(6px); }
  }

  .submit-btn {
    margin-top: 6px;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; border: none; border-radius: 13px;
    background: #E63030;
    color: #fff; font-size: 14px; font-weight: 600; font-family: inherit;
    padding: 14px 20px; cursor: pointer;
    box-shadow: 0 4px 20px rgba(230,48,48,0.35);
    transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
  }
  .submit-btn:hover:not(:disabled) {
    background: #FF4040;
    box-shadow: 0 6px 32px rgba(230,48,48,0.5);
    transform: translateY(-1px);
  }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .spin { animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .version-tag {
    font-size: 10px; color: rgba(255,255,255,0.18);
    letter-spacing: 0.14em; text-transform: uppercase;
    text-align: center; margin-top: 24px;
  }

  @media (max-width: 640px) {
    .panel-left { display: none !important; }
    .card { min-height: unset; border-radius: 20px; }
    .panel-right { padding: 36px 28px; }
    .mobile-logo {
      display: flex !important;
      flex-direction: column; align-items: center; gap: 8px;
      margin-bottom: 24px;
    }
  }
  .mobile-logo { display: none; }
`;

function MissyIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="9" y="14" width="30" height="22" rx="5" fill="white" fillOpacity="0.95" />
      <circle cx="18" cy="24" r="3" fill="#E63030" />
      <circle cx="30" cy="24" r="3" fill="#E63030" />
      <rect x="19" y="30" width="10" height="2.5" rx="1.25" fill="#E63030" />
      <rect x="20" y="8" width="8" height="6" rx="1.5" fill="white" fillOpacity="0.9" />
      <rect x="4" y="21" width="5" height="9" rx="2.5" fill="white" fillOpacity="0.5" />
      <rect x="39" y="21" width="5" height="9" rx="2.5" fill="white" fillOpacity="0.5" />
    </svg>
  );
}

function Loader({ onDone }) {
  const [exit, setExit] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setExit(true); setTimeout(onDone, 600); }, 1600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`loader-overlay${exit ? ' fade-out' : ''}`}>
      <div className="loader-logo"><MissyIcon size={44} /></div>
      <div className="loader-bar-track"><div className="loader-bar-fill" /></div>
      <p className="loader-text">Iniciando sistema</p>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [ready,    setReady]    = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [slide,    setSlide]    = useState(0);
  const [phase,    setPhase]    = useState('enter'); // 'enter' | 'exit'
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (i === slide) return;
    setPhase('exit');
    setTimeout(() => { setSlide(i); setPhase('enter'); }, 320);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPhase('exit');
      setTimeout(() => {
        setSlide(prev => (prev + 1) % SLIDES.length);
        setPhase('enter');
      }, 320);
    }, 4200);
    return () => clearInterval(timerRef.current);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dealers');
    } else {
      setError(result.error || 'Correo o contraseña incorrectos.');
    }
  }

  return (
    <>
      <style>{CSS}</style>
      {!ready && <Loader onDone={() => setReady(true)} />}
      <div className="login-root">
        <div className="bg-glow" />
        <div className="bg-grid" />

        <div className="card">
          {/* LEFT */}
          <div className="panel-left">
            <div className="logo-wrap">
              <div className="logo-icon"><MissyIcon size={44} /></div>
              <p className="logo-name">Missy</p>
              <p className="logo-sub">by CarBot · Tu super asistente IA</p>
            </div>

            <div className="carousel">
              <div key={slide} className={`slide ${phase}`}>
                <p className="slide-quote">&ldquo;{SLIDES[slide].quote}&rdquo;</p>
                <p className="slide-sub">{SLIDES[slide].sub}</p>
              </div>
            </div>

            <div className="dots">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === slide ? ' active' : ''}`}
                  style={{ width: i === slide ? 20 : 6 }}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <div className="stats">
              {[['🏢', '500+ Dealers'], ['⚡', '1M+ Leads'], ['📈', '3x Conversión']].map(([icon, label]) => (
                <div key={label} className="stat-chip"><span>{icon}</span><span>{label}</span></div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="panel-right">
            {/* Mobile logo */}
            <div className="mobile-logo">
              <div className="logo-icon" style={{ width: 52, height: 52, borderRadius: 14 }}>
                <MissyIcon size={32} />
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>CarBot System</p>
            </div>

            <div className="step-bar">
              <div className="step-seg active" />
              <div className="step-seg inactive" />
              <div className="step-seg inactive" />
            </div>

            <h1 className="form-title">Bienvenido de <span>vuelta</span></h1>
            <p className="form-desc">Ingresa tus credenciales para acceder al sistema.</p>

            <form className="form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label" htmlFor="email">Correo</label>
                <input
                  id="email" type="email" required autoFocus autoComplete="email"
                  className="field-input"
                  placeholder="tu@correo.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label" htmlFor="password">Contraseña</label>
                <input
                  id="password" type="password" required autoComplete="current-password"
                  className="field-input"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                />
              </div>

              {error && <div className="error-box">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="spin" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Verificando…
                  </>
                ) : (
                  <>
                    Continuar
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="version-tag" style={{ marginTop: 28 }}>CARBOT SYSTEM · V3.0 · © 2026</p>
          </div>
        </div>
      </div>
    </>
  );
}
