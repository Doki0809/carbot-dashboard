import React from 'react';
import { Link } from 'react-router-dom';

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
const IconPlayground = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconBot = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>
  </svg>
);

const IconSkills = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
  </svg>
);

const IconKnowledge = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

const IconAPIs = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

export default function AssistantHub() {
  const modules = [
    {
      to: '/assistant/skills',
      title: 'Habilidades',
      subtitle: 'ACCIONES DEL SISTEMA',
      desc: 'Configura las capacidades instrumentales del bot. Permite conectar APIs internas y manipular datos del negocio.',
      icon: <IconSkills />,
      color: '#3b82f6',
      bgGlow: 'rgba(59, 130, 246, 0.15)',
      status: 'EN LÍNEA'
    },
    {
      to: '/assistant/knowledge',
      title: 'Cerebro',
      subtitle: 'MEMORIA GLOBAL',
      desc: 'Motor de conocimiento donde residen reglas, precios y flujos de negocio. Missy lo consulta en cada intervención.',
      icon: <IconKnowledge />,
      color: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      status: 'SINCRONIZADO'
    },
    {
      to: '/assistant/apis',
      title: 'Conexión APIs',
      subtitle: 'INTEGRACIÓN EXTERNA',
      desc: 'Conecta APIs de terceros o microservicios que la IA pueda llamar dinámicamente para procesar tareas complejas.',
      icon: <IconAPIs />,
      color: '#ec4899',
      bgGlow: 'rgba(236, 72, 153, 0.15)',
      status: 'CONFIGURABLE'
    },
    {
      to: '/assistant/playground',
      title: 'Zona Pruebas',
      subtitle: 'SIMULADOR EN TIEMPO REAL',
      desc: 'Entorno aislado para interactuar con Missy. Evalúa respuestas, lógica de negocio y personalidad antes de producción.',
      icon: <IconPlayground />,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      status: 'OPERATIVO'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] animate-fade-in relative z-10 w-full max-w-[1400px] mx-auto py-6 sm:py-10 overflow-x-hidden">
      
      {/* Luz ambiente central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="flex flex-col items-center text-center mb-8 sm:mb-16 relative px-4">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center bg-red-500/10 border border-red-500/20 mb-4 sm:mb-6 shadow-[0_0_40px_rgba(255,0,0,0.15)] relative">
           <IconBot className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" />
           <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-[#090a0f] animate-pulse"></div>
        </div>
        
        <h1 className="text-2xl sm:text-5xl font-[900] tracking-tight text-white mb-3">
          Control del Asistente
        </h1>
        
        <p className="text-white/40 text-sm sm:text-lg font-medium tracking-wide max-w-xl mx-auto">
          Gestiona las <span className="text-white/70">habilidades</span>, alimenta la <span className="text-white/70">base de conocimiento</span> o realiza <span className="text-white/70">pruebas en tiempo real</span> con la IA.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 w-full px-0">
        {modules.map((mod) => (
          <Link
            key={mod.to}
            to={mod.to}
            className="group relative flex flex-col overflow-hidden transition-all duration-500"
            style={{ 
              background: '#0e1015', 
              borderRadius: '1.75rem',
              border: '1px solid rgba(255,255,255,0.03)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              padding: 'clamp(1.25rem, 5vw, 3rem)',
              minHeight: 'clamp(220px, 40vw, 450px)',
            }}
          >
            {/* Glow hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" 
              style={{ background: `radial-gradient(circle at 50% 0%, ${mod.bgGlow} 0%, transparent 70%)` }}
            />
            
            {/* Watermark icon — clipped inside card */}
            <div className="absolute bottom-0 right-0 pointer-events-none opacity-10 group-hover:opacity-25 group-hover:rotate-6 group-hover:scale-110 transition-all duration-1000 ease-out overflow-hidden" style={{ color: mod.color, width: '60%', height: '60%' }}>
              <div className="w-full h-full flex items-end justify-end">
                <div style={{ transform: 'scale(6)', transformOrigin: 'bottom right', marginBottom: '1.5rem', marginRight: '1.5rem' }}>{mod.icon}</div>
              </div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between mb-5 sm:mb-8">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-3" 
                     style={{ background: '#151720', border: '1px solid rgba(255,255,255,0.05)', color: mod.color, boxShadow: `0 10px 30px -10px ${mod.bgGlow}` }}>
                  {mod.icon}
                </div>
                
                <div className="px-2.5 py-1 rounded-full border border-white/5 bg-[#12141a] flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: mod.color }}></div>
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/50">{mod.status}</span>
                </div>
              </div>

              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-1.5" style={{ color: mod.color }}>
                {mod.subtitle}
              </p>
              <h2 className="text-2xl sm:text-4xl font-[900] tracking-tighter text-white leading-none">
                {mod.title}
              </h2>
            </div>
            
            {/* Footer */}
            <div className="relative z-10 mt-auto pt-4 sm:pt-8 border-t border-white/5">
              <p className="text-white/40 text-[13px] sm:text-[15px] font-medium leading-relaxed mb-4 sm:mb-6">
                {mod.desc}
              </p>
              
              <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-colors" style={{ color: mod.color }}>
                <span>Ir al Panel</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-2 transition-transform duration-300">
                  <line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
