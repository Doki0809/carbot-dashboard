import React from 'react';
import { Link } from 'react-router-dom';

/* ── SVG Icons ─────────────────────────────────────────────────────────── */
const IconPlayground = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconSkills = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
    <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
  </svg>
);

const IconKnowledge = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

export default function AssistantHub() {
  const cards = [
    {
      to: '/assistant/playground',
      title: 'Área de prueba',
      desc: 'Prueba la interacción en tiempo real con el Asistente.',
      icon: <IconPlayground />,
      color: '#4287f5'
    },
    {
      to: '/assistant/skills',
      title: 'Skills',
      desc: 'Administra y configura las habilidades y acciones específicas.',
      icon: <IconSkills />,
      color: '#22c55e'
    },
    {
      to: '/assistant/knowledge',
      title: 'Base de conocimiento',
      desc: 'Edita la información global que usa Missy para responder.',
      icon: <IconKnowledge />,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in relative max-w-6xl mx-auto py-8">
      {/* Mega Hero Banner Minimalista */}
      <div 
        className="w-full float-in relative overflow-hidden py-10 px-10 sm:px-12 mb-10 shadow-2xl flex flex-col sm:flex-row items-center justify-between"
        style={{ 
          background: 'linear-gradient(90deg, #ff3b45 0%, #ff1a2b 100%)',
          borderRadius: '2.5rem',
          boxShadow: '0 20px 40px rgba(255,59,69,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
        }}
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black opacity-[0.06] rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 w-full">
          <h1 className="text-[44px] font-[900] tracking-tighter text-white leading-[1.05]">
            Módulos del Asistente
          </h1>
          <p className="text-white/80 text-[15px] font-[400] tracking-wide mt-3">
            Selecciona la configuración que deseas gestionar o pon a prueba el modelo actual.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group relative flex flex-col p-8 glass-card transition-all"
            style={{ background: '#13151c', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="absolute -bottom-8 -right-8 pointer-events-none group-hover:scale-110 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-700" style={{ color: 'rgba(255,255,255,0.03)' }}>
              <div style={{ transform: 'scale(8)' }}>{card.icon}</div>
            </div>
            
            <div className="w-14 h-14 rounded-full flex items-center justify-center relative z-10 mb-6" style={{ background: '#1c1f2b', border: '1px solid rgba(255,255,255,0.05)', color: card.color }}>
              {card.icon}
            </div>

            <h2 className="text-[22px] font-[900] text-white tracking-tight leading-none mb-3 relative z-10">{card.title}</h2>
            <p className="text-white/50 text-[13px] font-[500] leading-relaxed relative z-10">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
