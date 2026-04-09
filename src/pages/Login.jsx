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

function SpinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ animation: 'loginSpin 0.7s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#080808',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 24,
      transition: 'opacity 0.6s ease',
      opacity: exit ? 0 : 1,
      pointerEvents: exit ? 'none' : 'all',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 0 40px rgba(230,48,48,0.5)',
        animation: 'logoPulse 1.4s ease-in-out infinite',
      }}>
        <img src="/3.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ width: 160, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 9999,
          background: 'linear-gradient(90deg, #E63030, #FF6B6B)',
          animation: 'barFill 1.4s ease forwards',
        }} />
      </div>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', animation: 'blink 1.4s ease-in-out infinite' }}>
        Iniciando sistema
      </p>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [ready,    setReady]    = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [slide,    setSlide]    = useState(0);
  const [phase,    setPhase]    = useState('enter');
  const timerRef = useRef(null);

  const goTo = (i) => {
    if (i === slide) return;
    setPhase('exit');
    setTimeout(() => { setSlide(i); setPhase('enter'); }, 320);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setPhase('exit');
      setTimeout(() => { setSlide(prev => (prev + 1) % SLIDES.length); setPhase('enter'); }, 320);
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes logoPulse  { 0%,100%{box-shadow:0 0 30px rgba(230,48,48,0.4);transform:scale(1)} 50%{box-shadow:0 0 60px rgba(230,48,48,0.7);transform:scale(1.06)} }
        @keyframes barFill    { from{width:0%} to{width:100%} }
        @keyframes blink      { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        @keyframes glowDrift  { from{transform:translate(-50%,-50%) scale(1)} to{transform:translate(-50%,-55%) scale(1.15)} }
        @keyframes loginCardEnter  { to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes loginSlideEnter { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes loginSlideExit  { from{opacity:1;transform:translateY(0)} to{opacity:0;transform:translateY(-14px)} }
        @keyframes loginSpin  { to{transform:rotate(360deg)} }
        @keyframes errorShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 60%{transform:translateX(6px)} }
        @keyframes logoFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

        /* ── Mobile: solo muestra el formulario ── */
        @media (max-width: 640px) {
          .lc-card  { width: 100% !important; max-width: 100% !important; min-height: 100dvh !important; border-radius: 0 !important; border: none !important; }
          .lc-left  { display: none !important; }
          .lc-right { width: 100% !important; padding: 48px 24px 60px !important; justify-content: center !important; }
        }
      `}</style>

      {!ready && <Loader onDone={() => setReady(true)} />}

      <div style={{
        minHeight: '100vh',
        background: '#080808',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden', position: 'relative',
      }}>
        {/* BG Glows */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,48,48,0.12) 0%, transparent 70%)', top: '50%', left: '25%', transform: 'translate(-50%,-50%)', animation: 'glowDrift 8s ease-in-out infinite alternate' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(230,48,48,0.07) 0%, transparent 70%)', top: '50%', left: '75%', transform: 'translate(-50%,-50%)', animation: 'glowDrift 10s ease-in-out infinite alternate-reverse' }} />
        </div>
        {/* BG Grid */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Card */}
        <div className="lc-card" style={{
          position: 'relative', zIndex: 10,
          display: 'flex',
          width: 1050, maxWidth: 'calc(100vw - 32px)',
          minHeight: 600,
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.025)',
          backdropFilter: 'blur(32px) saturate(160%)',
          WebkitBackdropFilter: 'blur(32px) saturate(160%)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)',
          overflow: 'hidden',
          animation: 'loginCardEnter 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
          opacity: 0, transform: 'translateY(24px) scale(0.98)',
        }}>
          {/* Top red accent line */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(230,48,48,0.6), transparent)' }} />

          {/* ── LEFT PANEL (hero/branding) ── */}
          <div className="lc-left" style={{
            width: '50%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '48px 40px', gap: 28,
            position: 'relative',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            background: 'linear-gradient(145deg, rgba(230,48,48,0.06) 0%, transparent 60%)',
          }}>
            {/* Logo + name */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="lc-logo" style={{ width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'logoFloat 5s ease-in-out infinite' }}>
                <img src="/3.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 35px rgba(230,48,48,0.7))' }} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 2 }}>Missy</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>by CarBot · Tu super asistente IA</p>
              </div>
            </div>

            {/* Carousel */}
            <div style={{ minHeight: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
              <div key={slide} style={{
                display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
                animation: phase === 'enter' ? 'loginSlideEnter 0.4s cubic-bezier(0.16,1,0.3,1) forwards' : 'loginSlideExit 0.3s ease forwards',
              }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#F0F0FF', lineHeight: 1.45, maxWidth: 280 }}>&ldquo;{SLIDES[slide].quote}&rdquo;</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: 270 }}>{SLIDES[slide].sub}</p>
              </div>
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`} style={{
                  height: 5, width: i === slide ? 20 : 5,
                  borderRadius: 9999, border: 'none', cursor: 'pointer', padding: 0,
                  background: i === slide ? '#E63030' : 'rgba(255,255,255,0.15)',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: i === slide ? '0 0 8px rgba(230,48,48,0.5)' : 'none',
                }} />
              ))}
            </div>

            {/* Stats pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
              {[['500+ Dealers'], ['1M+ Leads'], ['3x Conversión']].map(([label]) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  borderRadius: 9999, padding: '5px 12px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.03)',
                  fontSize: 11, color: 'rgba(255,255,255,0.40)',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E63030', boxShadow: '0 0 4px rgba(230,48,48,0.7)' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL (form) ── */}
          <div className="lc-right" style={{
            flex: 1,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '48px 44px',
          }}>
            {/* Step bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  height: 2, width: 28, borderRadius: 9999,
                  background: i === 0 ? '#E63030' : 'rgba(255,255,255,0.08)',
                  boxShadow: i === 0 ? '0 0 6px rgba(230,48,48,0.5)' : 'none',
                  transition: 'background 0.4s',
                }} />
              ))}
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F8F8FF', lineHeight: 1.2, marginBottom: 8 }}>
              Bienvenido de <span style={{ color: '#E63030' }}>vuelta</span>
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginBottom: 28 }}>
              Ingresa tus credenciales para acceder al sistema.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="email" style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.10em' }}>Correo</label>
                <input
                  id="email" type="email" required autoFocus autoComplete="email"
                  placeholder="tu@correo.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, background: 'rgba(255,255,255,0.04)', padding: '13px 16px', fontSize: 14, fontFamily: 'inherit', color: '#F8F8FF', outline: 'none', transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(230,48,48,0.5)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(230,48,48,0.08)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label htmlFor="password" style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.10em' }}>Contraseña</label>
                <input
                  id="password" type="password" required autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, background: 'rgba(255,255,255,0.04)', padding: '13px 16px', fontSize: 14, fontFamily: 'inherit', color: '#F8F8FF', outline: 'none', transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(230,48,48,0.5)'; e.target.style.background = 'rgba(255,255,255,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(230,48,48,0.08)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{ borderRadius: 10, border: '1px solid rgba(230,48,48,0.25)', background: 'rgba(230,48,48,0.08)', padding: '9px 13px', fontSize: 12, color: '#FF8080', animation: 'errorShake 0.35s ease' }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                style={{
                  marginTop: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', boxSizing: 'border-box', border: 'none', borderRadius: 13,
                  background: loading ? 'rgba(230,48,48,0.55)' : 'linear-gradient(135deg, #E63030, #cc1f1f)',
                  color: '#fff', fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
                  padding: '14px 20px', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 20px rgba(230,48,48,0.35), inset 0 1px 0 rgba(255,255,255,0.12)',
                  transition: 'box-shadow 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 32px rgba(230,48,48,0.55), inset 0 1px 0 rgba(255,255,255,0.16)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,48,48,0.35), inset 0 1px 0 rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? <><SpinIcon /> Verificando…</> : <>Continuar <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg></>}
              </button>
            </form>

            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center', marginTop: 28 }}>
              CARBOT SYSTEM · V3.0 · © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
