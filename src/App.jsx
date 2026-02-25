import { useState, useRef, useEffect } from 'react'
import jsPDF from 'jspdf'
import './App.css'

// === PANTALLA HOME ===
function HomeScreen({ onGoLogin, onGoRegister }) {
  var [menuOpen, setMenuOpen] = useState(false)

  useEffect(function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function() { entry.target.classList.add('hp-visible') }, i * 60)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.hp-reveal').forEach(function(el) { observer.observe(el) })
    return function() { observer.disconnect() }
  }, [])

  return (
    <div className="hp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* VARIABLES Y BASE */
        .hp-root{--bg:#F7F5F0;--ink:#1A1814;--muted:#6B6760;--accent:#2D5A3D;--accent-light:#EAF1EC;--line:#E2DDD6;--white:#FFFFFF;--serif:'Playfair Display',Georgia,serif;--sans:'DM Sans',sans-serif;--gutter:max(1.25rem,5vw);font-family:var(--sans);background:var(--bg);color:var(--ink);overflow-x:hidden;font-weight:300;line-height:1.6;min-height:100vh;}

        /* NAV desktop */
        .hp-nav{position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1.1rem var(--gutter);background:rgba(247,245,240,0.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);}
        .hp-logo{font-family:var(--serif);font-size:1.15rem;font-weight:700;color:var(--ink);cursor:pointer;letter-spacing:-0.02em;white-space:nowrap;}
        .hp-logo span{color:var(--accent);}
        .hp-nav-links{display:flex;align-items:center;gap:1.5rem;}
        .hp-nav-link{background:none;border:none;cursor:pointer;color:var(--muted);font-size:0.875rem;font-family:var(--sans);transition:color 0.2s;padding:0;}
        .hp-nav-link:hover{color:var(--ink);}
        .hp-btn-nav{background:var(--ink)!important;color:var(--white)!important;padding:0.55rem 1.2rem;border-radius:6px;font-weight:500!important;font-size:0.875rem;font-family:var(--sans);border:none;cursor:pointer;transition:background 0.2s;white-space:nowrap;}
        .hp-btn-nav:hover{background:var(--accent)!important;}

        /* Hamburger oculto en desktop */
        .hp-hamburger{display:none;flex-direction:column;justify-content:center;gap:5px;background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;}
        .hp-hamburger span{display:block;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:all 0.25s;}
        .hp-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .hp-hamburger.open span:nth-child(2){opacity:0;}
        .hp-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

        /* Drawer mobile oculto por defecto */
        .hp-mobile-menu{display:none;position:fixed;inset:0;z-index:190;background:rgba(247,245,240,0.98);backdrop-filter:blur(16px);flex-direction:column;align-items:center;justify-content:center;gap:2rem;padding:2rem;}
        .hp-mobile-menu.open{display:flex;}
        .hp-mobile-menu .hp-nav-link{font-size:1.3rem;font-weight:400;color:var(--ink);padding:0.5rem 0;}
        .hp-mobile-menu .hp-btn-nav{font-size:1rem!important;padding:0.875rem 2rem!important;border-radius:8px;margin-top:0.5rem;width:100%;max-width:260px;text-align:center;}

        /* HERO */
        .hp-hero{min-height:92vh;display:flex;flex-direction:column;justify-content:center;padding:5rem var(--gutter) 4rem;position:relative;overflow:hidden;}
        .hp-hero::before{content:'';position:absolute;top:-20%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(45,90,61,0.07) 0%,transparent 70%);pointer-events:none;}
        .hp-eyebrow{display:inline-flex;align-items:center;gap:0.5rem;background:var(--accent-light);color:var(--accent);font-size:0.75rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;padding:0.4rem 1rem;border-radius:100px;margin-bottom:1.75rem;width:fit-content;animation:hp-fadeUp 0.7s 0.1s both;}
        .hp-eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;}
        .hp-hero-title{font-family:var(--serif);font-size:clamp(2.4rem,7vw,5.5rem);line-height:1.05;font-weight:700;letter-spacing:-0.03em;max-width:14ch;margin-bottom:1.25rem;animation:hp-fadeUp 0.8s 0.2s both;}
        .hp-hero-title em{font-style:italic;color:var(--accent);}
        .hp-hero-sub{font-size:1rem;color:var(--muted);max-width:44ch;line-height:1.75;margin-bottom:2rem;animation:hp-fadeUp 0.8s 0.35s both;}
        .hp-hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;animation:hp-fadeUp 0.8s 0.5s both;}
        .hp-btn-primary{background:var(--ink);color:var(--white);padding:0.875rem 1.75rem;border-radius:8px;font-weight:500;font-size:0.95rem;font-family:var(--sans);border:none;cursor:pointer;transition:background 0.2s,transform 0.15s,box-shadow 0.2s;display:inline-flex;align-items:center;gap:0.5rem;white-space:nowrap;}
        .hp-btn-primary:hover{background:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,90,61,0.2);}
        .hp-btn-ghost{background:none;border:none;color:var(--ink);font-size:0.9rem;font-family:var(--sans);cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;padding:0.875rem 0;transition:gap 0.2s;white-space:nowrap;}
        .hp-btn-ghost:hover{gap:0.75rem;}
        .hp-stats{margin-top:3.5rem;padding-top:2rem;border-top:1px solid var(--line);display:flex;gap:2.5rem;animation:hp-fadeUp 0.8s 0.65s both;flex-wrap:wrap;}
        .hp-stat{max-width:28ch;}
        .hp-stat strong{display:block;font-size:0.9rem;font-weight:500;color:var(--ink);line-height:1.3;margin-bottom:0.3rem;}
        .hp-stat span{font-size:0.8rem;color:var(--muted);font-weight:300;line-height:1.5;}

        /* SECCIONES */
        .hp-section{padding:5rem var(--gutter);}
        .hp-label{font-size:0.72rem;font-weight:500;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent);margin-bottom:0.875rem;display:block;}
        .hp-section-title{font-family:var(--serif);font-size:clamp(1.6rem,3.5vw,2.8rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:1.1rem;}
        .hp-section-body{font-size:1rem;color:var(--muted);max-width:46ch;line-height:1.75;}
        .hp-how{background:var(--white);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
        .hp-how-inner{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;}
        .hp-steps{display:flex;flex-direction:column;gap:1.75rem;margin-top:2.5rem;}
        .hp-step{display:flex;gap:1.1rem;align-items:flex-start;}
        .hp-step-num{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:var(--accent-light);color:var(--accent);font-family:var(--serif);font-size:0.95rem;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .hp-step h4{font-weight:500;font-size:0.9rem;margin-bottom:0.2rem;}
        .hp-step p{font-size:0.85rem;color:var(--muted);line-height:1.6;}
        .hp-flow{display:flex;flex-direction:column;gap:0.875rem;}
        .hp-flow-card{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:1.1rem 1.25rem;display:flex;align-items:center;gap:1rem;transition:box-shadow 0.2s,transform 0.2s;}
        .hp-flow-card:hover{box-shadow:0 4px 20px rgba(26,24,20,0.06);transform:translateX(4px);}
        .hp-flow-icon{font-size:1.4rem;width:40px;height:40px;display:flex;align-items:center;justify-content:center;background:var(--white);border-radius:10px;border:1px solid var(--line);flex-shrink:0;}
        .hp-flow-card h5{font-weight:500;font-size:0.875rem;margin-bottom:0.1rem;}
        .hp-flow-card p{font-size:0.775rem;color:var(--muted);}
        .hp-flow-arrow{text-align:center;color:var(--line);font-size:1.1rem;}
        .hp-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5px;background:var(--line);border:1.5px solid var(--line);border-radius:16px;overflow:hidden;margin-top:3.5rem;}
        .hp-feat-card{background:var(--white);padding:2.25rem 1.75rem;transition:background 0.2s;}
        .hp-feat-card:hover{background:#FAFAF7;}
        .hp-feat-icon{font-size:1.6rem;margin-bottom:1.1rem;display:block;}
        .hp-feat-card h3{font-family:var(--serif);font-size:1.05rem;font-weight:700;margin-bottom:0.5rem;line-height:1.2;}
        .hp-feat-card p{font-size:0.85rem;color:var(--muted);line-height:1.65;}
        .hp-dark{background:var(--ink);color:var(--white);}
        .hp-dark .hp-label{color:#7CB891;}
        .hp-dark .hp-section-title{color:var(--white);}
        .hp-dark .hp-section-body{color:rgba(255,255,255,0.55);}
        .hp-personas{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-top:3.5rem;}
        .hp-persona{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:1.75rem;transition:background 0.2s,border-color 0.2s;}
        .hp-persona:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2);}
        .hp-persona-role{font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:#7CB891;font-weight:500;margin-bottom:0.6rem;}
        .hp-persona h3{font-family:var(--serif);font-size:1.1rem;font-weight:700;margin-bottom:0.6rem;color:var(--white);}
        .hp-persona p{font-size:0.85rem;color:rgba(255,255,255,0.5);line-height:1.65;}
        .hp-cta{text-align:center;padding:6rem var(--gutter);position:relative;overflow:hidden;}
        .hp-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(45,90,61,0.06) 0%,transparent 65%);pointer-events:none;}
        .hp-cta-title{font-family:var(--serif);font-size:clamp(1.8rem,4.5vw,4rem);font-weight:700;letter-spacing:-0.03em;line-height:1.05;margin-bottom:1.25rem;}
        .hp-cta-sub{font-size:0.95rem;color:var(--muted);max-width:40ch;margin:0 auto 2rem;line-height:1.7;}
        .hp-footer{border-top:1px solid var(--line);padding:1.75rem var(--gutter);display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;color:var(--muted);flex-wrap:wrap;gap:0.75rem;}
        .hp-footer-logo{font-family:var(--serif);font-weight:700;color:var(--ink);font-size:1rem;}
        .hp-footer-link{background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.8rem;font-family:var(--sans);transition:color 0.2s;padding:0;}
        .hp-footer-link:hover{color:var(--ink);}

        /* PRECIOS */
        .hp-pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:3.5rem;align-items:start;}
        .hp-plan{background:var(--white);border:1.5px solid var(--line);border-radius:16px;padding:1.75rem;position:relative;transition:box-shadow 0.2s,transform 0.2s;}
        .hp-plan:hover{box-shadow:0 8px 32px rgba(26,24,20,0.09);transform:translateY(-2px);}
        .hp-plan-featured{border-color:var(--accent);box-shadow:0 4px 24px rgba(45,90,61,0.12);}
        .hp-plan-featured:hover{box-shadow:0 12px 40px rgba(45,90,61,0.18);}
        .hp-plan-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:var(--accent);color:white;font-size:0.68rem;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;padding:0.28rem 0.9rem;border-radius:100px;white-space:nowrap;}
        .hp-plan-header{margin-bottom:1.5rem;padding-bottom:1.25rem;border-bottom:1px solid var(--line);}
        .hp-plan-name{display:block;font-size:0.72rem;font-weight:500;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted);margin-bottom:0.65rem;}
        .hp-plan-price{margin-bottom:0.4rem;line-height:1;}
        .hp-plan-price strong{font-family:var(--serif);font-size:1.85rem;font-weight:700;color:var(--ink);}
        .hp-plan-price span{font-size:0.85rem;color:var(--muted);margin-left:0.15rem;}
        .hp-plan-for{font-size:0.78rem;color:var(--muted);margin-top:0.35rem;}
        .hp-plan-features{list-style:none;margin:0 0 1.75rem;padding:0;display:flex;flex-direction:column;gap:0.55rem;}
        .hp-plan-features li{display:flex;align-items:center;gap:0.55rem;font-size:0.85rem;color:var(--ink);}
        .hp-feat-check{color:var(--accent);font-size:0.8rem;font-weight:700;flex-shrink:0;}
        .hp-feat-x{color:#D4CFC8;font-size:0.8rem;font-weight:700;flex-shrink:0;}
        .hp-plan-features li:has(.hp-feat-x){color:var(--muted);}
        .hp-plan-btn{width:100%;padding:0.825rem;border-radius:8px;font-size:0.875rem;font-weight:500;font-family:var(--sans);cursor:pointer;transition:all 0.2s;border:none;min-height:44px;}
        .hp-plan-btn-primary{background:var(--accent);color:white;}
        .hp-plan-btn-primary:hover{background:var(--ink);transform:translateY(-1px);}
        .hp-plan-btn-ghost{background:none;border:1.5px solid var(--ink)!important;color:var(--ink);}
        .hp-plan-btn-ghost:hover{background:var(--ink);color:white;}

        /* ANIMACIONES */
        .hp-reveal{opacity:0;transform:translateY(24px);transition:opacity 0.6s ease,transform 0.6s ease;}
        .hp-visible{opacity:1!important;transform:none!important;}
        @keyframes hp-fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}

        /* TABLET */
        @media(max-width:1024px){
          .hp-how-inner{grid-template-columns:1fr;gap:2.5rem;}
          .hp-feat-grid{grid-template-columns:repeat(2,1fr);}
          .hp-personas{grid-template-columns:1fr 1fr;}
          .hp-pricing-grid{grid-template-columns:1fr 1fr;}
        }

        /* MOBILE */
        @media(max-width:640px){
          .hp-nav{padding:1rem 1.25rem;}
          .hp-nav-links{display:none;}
          .hp-hamburger{display:flex;}
          .hp-hero{min-height:auto;padding:4rem 1.25rem 3rem;}
          .hp-eyebrow{font-size:0.7rem;padding:0.35rem 0.875rem;margin-bottom:1.25rem;}
          .hp-hero-title{font-size:clamp(2.2rem,9vw,3rem);margin-bottom:1rem;}
          .hp-hero-sub{font-size:0.95rem;margin-bottom:1.5rem;}
          .hp-hero-actions{flex-direction:column;align-items:stretch;gap:0.75rem;}
          .hp-btn-primary{justify-content:center;padding:1rem;font-size:1rem;min-height:52px;}
          .hp-btn-ghost{justify-content:center;padding:0.5rem 0;}
          .hp-stats{margin-top:2.5rem;flex-direction:column;gap:1.25rem;}
          .hp-stat{max-width:none;}
          .hp-section{padding:3.5rem 1.25rem;}
          .hp-cta{padding:4rem 1.25rem;}
          .hp-cta-title{font-size:clamp(1.7rem,7vw,2.4rem);}
          .hp-cta br{display:none;}
          .hp-how-inner{grid-template-columns:1fr;gap:2rem;}
          .hp-feat-grid{grid-template-columns:1fr;}
          .hp-feat-card{padding:1.5rem 1.25rem;}
          .hp-personas{grid-template-columns:1fr;}
          .hp-pricing-grid{grid-template-columns:1fr;}
          .hp-plan-featured{order:-1;}
          .hp-footer{flex-direction:column;text-align:center;gap:0.5rem;padding:1.5rem 1.25rem;}
        }
      `}</style>

      {/* NAV */}
      <nav className="hp-nav">
        <div className="hp-logo">BitácoraPro<span>.</span></div>
        <div className="hp-nav-links">
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Cómo funciona</button>
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-feat').scrollIntoView({ behavior: 'smooth' }) }}>Funcionalidades</button>
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-precios').scrollIntoView({ behavior: 'smooth' }) }}>Precios</button>
          <button className="hp-btn-nav" onClick={onGoLogin}>Iniciar sesión →</button>
        </div>
        {/* Hamburger — solo visible en mobile */}
        <button className={"hp-hamburger" + (menuOpen ? " open" : "")} onClick={function() { setMenuOpen(function(v) { return !v }) }} aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* MENÚ MOBILE — drawer full screen */}
      <div className={"hp-mobile-menu" + (menuOpen ? " open" : "")}>
        <button className="hp-nav-link" onClick={function() { setMenuOpen(false); document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Cómo funciona</button>
        <button className="hp-nav-link" onClick={function() { setMenuOpen(false); document.getElementById('hp-feat').scrollIntoView({ behavior: 'smooth' }) }}>Funcionalidades</button>
        <button className="hp-nav-link" onClick={function() { setMenuOpen(false); document.getElementById('hp-precios').scrollIntoView({ behavior: 'smooth' }) }}>Precios</button>
        <button className="hp-btn-nav" onClick={function() { setMenuOpen(false); onGoLogin() }}>Iniciar sesión →</button>
        <button className="hp-btn-nav" style={{background:'var(--accent)'}} onClick={function() { setMenuOpen(false); onGoRegister() }}>Crear cuenta gratis</button>
      </div>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-eyebrow">Post venta inmobiliaria automatizada con IA</div>
        <h1 className="hp-hero-title">Del hallazgo al informe, <em>en segundos.</em></h1>
        <p className="hp-hero-sub">Deja atrás WhatsApp y los informes manuales. Convierte fotos y notas de voz en informes técnicos estructurados, trazables y listos para respaldar cada entrega.</p>
        <div className="hp-hero-actions">
          <button className="hp-btn-primary" onClick={onGoRegister}>Comenzar gratis →</button>
          <button className="hp-btn-ghost" onClick={function() { document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Ver cómo funciona ↓</button>
        </div>
        <div className="hp-stats">
          <div className="hp-stat"><strong>No más fotos sueltas en WhatsApp</strong><span>Cada hallazgo queda registrado, asignado y trazable.</span></div>
          <div className="hp-stat"><strong>Nunca más "te lo mando después"</strong><span>La IA construye el informe en tiempo real mientras inspeccionas. Sin retrabajo posterior.</span></div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="hp-section hp-how" id="hp-como">
        <div className="hp-how-inner">
          <div>
            <span className="hp-label hp-reveal">Operación</span>
            <h2 className="hp-section-title hp-reveal">Así opera BitácoraPro</h2>
            <p className="hp-section-body hp-reveal">Diseñado para trabajar en terreno. No en Word.</p>
            <div className="hp-steps">
              <div className="hp-step hp-reveal"><div className="hp-step-num">1</div><div><h4>Llegas a terreno y abres BitacoraPro</h4><p>Empieza la inspección desde su teléfono.</p></div></div>
              <div className="hp-step hp-reveal"><div className="hp-step-num">2</div><div><h4>Toma fotos y hablas del hallazgo</h4><p>Sin formularios, sin escribir.</p></div></div>
              <div className="hp-step hp-reveal"><div className="hp-step-num">3</div><div><h4>La IA arma el informe</h4><p>Diagnóstico, severidad y recomendación. En segundos.</p></div></div>
              <div className="hp-step hp-reveal"><div className="hp-step-num">4</div><div><h4>Sales con el reporte listo</h4><p>Informe profesional en tiempo real. Sin retrabajo. Sin espera.</p></div></div>
            </div>
          </div>
          <div className="hp-flow hp-reveal">
            <div className="hp-flow-card"><div className="hp-flow-icon">📸</div><div><h5>Subida de fotos múltiples</h5><p>Registra todos los ángulos del hallazgo</p></div></div>
            <div className="hp-flow-arrow">↓</div>
            <div className="hp-flow-card"><div className="hp-flow-icon">🎙️</div><div><h5>Grabación de audio</h5><p>Transcripción en tiempo real mientras hablas</p></div></div>
            <div className="hp-flow-arrow">↓</div>
            <div className="hp-flow-card"><div className="hp-flow-icon">✦</div><div><h5>Análisis con IA</h5><p>Convierte evidencia en informe técnico estructurado</p></div></div>
            <div className="hp-flow-arrow">↓</div>
            <div className="hp-flow-card"><div className="hp-flow-icon">📄</div><div><h5>Informes en tiempo real</h5><p>Reporte listo para descargar y entregar</p></div></div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="hp-section" id="hp-feat">
        <span className="hp-label hp-reveal">Plataforma</span>
        <h2 className="hp-section-title hp-reveal">Infraestructura completa para postventa</h2>
        <div className="hp-feat-grid">
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">🏢</span><h3>Multi-proyecto</h3><p>Organiza por proyecto, propiedad e inspector. Cada empresa ve solo sus propios datos.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">✦</span><h3>IA integrada</h3><p>Nuestro motor de IA analiza fotos y audio para generar descripciones técnicas, categorías y recomendaciones.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">📄</span><h3>PDF automático</h3><p>Informe profesional descargable con todos los hallazgos, fotos y datos del propietario.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">👥</span><h3>Roles y permisos</h3><p>Administradores gestionan proyectos. Inspectores registran hallazgos. Cada uno ve lo suyo.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">🎙️</span><h3>Notas de voz</h3><p>Graba mientras inspeccionas. Transcripción en tiempo real, sin teclear nada en terreno.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">📊</span><h3>Fichas de propiedades</h3><p>Gestiona nombre, RUT, email y teléfono de cada propietario en un solo lugar.</p></div>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="hp-section hp-dark">
        <span className="hp-label hp-reveal">Nuestros Clientes</span>
        <h2 className="hp-section-title hp-reveal">Hecho para la industria inmobiliaria</h2>
        <div className="hp-personas">
          <div className="hp-persona hp-reveal"><div className="hp-persona-role">Corredoras</div><h3>Corredor de Propiedades</h3><p>Controla cada visita y entrega sin depender de WhatsApp. Bitácoras claras, con evidencia, responsables y seguimiento.</p></div>
          <div className="hp-persona hp-reveal"><div className="hp-persona-role">Inmobiliarias</div><h3>Equipo de Post Venta</h3><p>Controla la postventa con datos, no con llamadas. Cada entrega documentada, cada hallazgo trazado.</p></div>
          <div className="hp-persona hp-reveal"><div className="hp-persona-role">Terreno</div><h3>Inspector de Viviendas</h3><p>Trabaja desde el teléfono. Sin formularios manuales. La IA hace el informe mientras tú sigues inspeccionando.</p></div>
        </div>
      </section>

      {/* PRECIOS */}
      <section className="hp-section" id="hp-precios">
        <span className="hp-label hp-reveal">Planes</span>
        <h2 className="hp-section-title hp-reveal">Elige el plan que se adapta a ti</h2>
        <p className="hp-section-body hp-reveal">Sin contratos, sin letra chica. Cancela cuando quieras.</p>
        <div className="hp-pricing-grid">

          {/* BÁSICO */}
          <div className="hp-plan hp-reveal">
            <div className="hp-plan-header">
              <span className="hp-plan-name">Básico</span>
              <div className="hp-plan-price"><strong>Gratis</strong></div>
              <p className="hp-plan-for">Para persona natural</p>
            </div>
            <ul className="hp-plan-features">
              <li><span className="hp-feat-check">✓</span> 1 usuario</li>
              <li><span className="hp-feat-check">✓</span> Hasta 3 propiedades activas</li>
              <li><span className="hp-feat-check">✓</span> Proyectos ilimitados</li>
              <li><span className="hp-feat-check">✓</span> Hallazgos ilimitados</li>
              <li><span className="hp-feat-check">✓</span> IA ilimitada</li>
              <li><span className="hp-feat-check">✓</span> Fotos múltiples</li>
              <li><span className="hp-feat-check">✓</span> Notas de voz</li>
              <li><span className="hp-feat-check">✓</span> PDF profesional</li>
              <li><span className="hp-feat-x">✗</span> Roles y permisos</li>
              <li><span className="hp-feat-x">✗</span> Multi-inspector</li>
            </ul>
            <button className="hp-plan-btn hp-plan-btn-ghost" onClick={onGoRegister}>Comenzar gratis</button>
          </div>

          {/* PRO — destacado */}
          <div className="hp-plan hp-plan-featured hp-reveal">
            <div className="hp-plan-badge">Más popular</div>
            <div className="hp-plan-header">
              <span className="hp-plan-name">Pro</span>
              <div className="hp-plan-price"><strong>$29.990</strong><span>/mes</span></div>
              <p className="hp-plan-for">Para corredores de propiedades</p>
            </div>
            <ul className="hp-plan-features">
              <li><span className="hp-feat-check">✓</span> Hasta 3 usuarios</li>
              <li><span className="hp-feat-check">✓</span> Hasta 50 propiedades activas</li>
              <li><span className="hp-feat-check">✓</span> Proyectos ilimitados</li>
              <li><span className="hp-feat-check">✓</span> Hallazgos ilimitados</li>
              <li><span className="hp-feat-check">✓</span> IA ilimitada</li>
              <li><span className="hp-feat-check">✓</span> Fotos múltiples</li>
              <li><span className="hp-feat-check">✓</span> Notas de voz</li>
              <li><span className="hp-feat-check">✓</span> PDF profesional</li>
              <li><span className="hp-feat-check">✓</span> Admin + Inspectores</li>
              <li><span className="hp-feat-check">✓</span> Soporte prioritario</li>
            </ul>
            <button className="hp-plan-btn hp-plan-btn-primary" onClick={onGoRegister}>Comenzar ahora</button>
          </div>

          {/* ENTERPRISE */}
          <div className="hp-plan hp-reveal">
            <div className="hp-plan-header">
              <span className="hp-plan-name">Enterprise</span>
              <div className="hp-plan-price"><strong>Desde $149.000</strong><span>/mes</span></div>
              <p className="hp-plan-for">Para inmobiliarias multiproyecto</p>
            </div>
            <ul className="hp-plan-features">
              <li><span className="hp-feat-check">✓</span> Usuarios ilimitados</li>
              <li><span className="hp-feat-check">✓</span> Propiedades ilimitadas</li>
              <li><span className="hp-feat-check">✓</span> Proyectos ilimitados</li>
              <li><span className="hp-feat-check">✓</span> Hallazgos ilimitados</li>
              <li><span className="hp-feat-check">✓</span> IA ilimitada + prioridad</li>
              <li><span className="hp-feat-check">✓</span> Fotos múltiples</li>
              <li><span className="hp-feat-check">✓</span> Notas de voz</li>
              <li><span className="hp-feat-check">✓</span> PDF profesional</li>
              <li><span className="hp-feat-check">✓</span> Admin + Inspectores</li>
              <li><span className="hp-feat-check">✓</span> Soporte dedicado</li>
            </ul>
            <button className="hp-plan-btn hp-plan-btn-ghost" onClick={function() { window.open('mailto:contacto@bitacorapro.cl?subject=Consulta%20Enterprise', '_blank') }}>Contactar ventas</button>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <span className="hp-label hp-reveal">Comenzar</span>
        <h2 className="hp-cta-title hp-reveal">¿Listo para automatizar<br/>tu post venta?</h2>
        <p className="hp-cta-sub hp-reveal">Crea tu cuenta gratis y empieza a registrar hallazgos en minutos. Sin tarjeta de crédito.</p>
        <div className="hp-reveal">
          <button className="hp-btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }} onClick={onGoRegister}>Crear cuenta gratis →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <span className="hp-footer-logo">BitácoraPro.</span>
        <span>© 2025 BitácoraPro. Hecho en Chile.</span>
        <span>
          <button className="hp-footer-link" onClick={onGoLogin}>Iniciar sesión</button>
          {' · '}
          <button className="hp-footer-link" onClick={onGoRegister}>Registrarse</button>
          {' · '}
          <button className="hp-footer-link" onClick={function() { document.getElementById('hp-precios').scrollIntoView({ behavior: 'smooth' }) }}>Precios</button>
        </span>
      </footer>
    </div>
  )
}

var API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://bitacora-postventa-production.up.railway.app'

var CATEGORIES = {
  estructural: { label: 'Estructural', icon: '🏗️', color: '#E74C3C' },
  terminaciones: { label: 'Terminaciones', icon: '🎨', color: '#3498DB' },
  instalaciones: { label: 'Instalaciones', icon: '🔧', color: '#F39C12' },
  humedad: { label: 'Humedad / Filtraciones', icon: '💧', color: '#1ABC9C' },
  electrico: { label: 'Electrico', icon: '⚡', color: '#9B59B6' },
  otro: { label: 'Otro', icon: '📋', color: '#7F8C8D' },
}

var SEVERITIES = {
  leve: { label: 'Leve', color: '#27AE60', bg: '#E8F8F0' },
  moderado: { label: 'Moderado', color: '#F39C12', bg: '#FEF5E7' },
  grave: { label: 'Grave', color: '#E74C3C', bg: '#FDEDEC' },
  critico: { label: 'Critico', color: '#8E44AD', bg: '#F4ECF7' },
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}

function wrapText(doc, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ')
  var line = ''
  var currentY = y
  for (var i = 0; i < words.length; i++) {
    var testLine = line + words[i] + ' '
    if (doc.getTextWidth(testLine) > maxWidth && line !== '') {
      doc.text(line.trim(), x, currentY)
      line = words[i] + ' '
      currentY = currentY + lineHeight
    } else { line = testLine }
  }
  doc.text(line.trim(), x, currentY)
  return currentY + lineHeight
}

async function loadImageAsBase64(url) {
  try {
    var response = await fetch(url)
    var blob = await response.blob()
    return new Promise(function(resolve) {
      var reader = new FileReader()
      reader.onload = function() { resolve(reader.result) }
      reader.readAsDataURL(blob)
    })
  } catch (err) { return null }
}

async function generatePDF(projectName, property, entries) {
  var doc = new jsPDF('p', 'mm', 'a4')
  var pageWidth = 210
  var pageHeight = 297
  var margin = 20
  var contentWidth = pageWidth - margin * 2

  doc.setFillColor(26, 26, 46)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  doc.setFillColor(233, 69, 96)
  doc.rect(0, 120, pageWidth, 4, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('Bitacora Post Venta', pageWidth / 2, 60, { align: 'center' })
  doc.setFontSize(20)
  doc.setFont('helvetica', 'normal')
  doc.text(projectName || 'Proyecto', pageWidth / 2, 85, { align: 'center' })
  doc.setFontSize(16)
  doc.setTextColor(233, 69, 96)
  doc.text('Propiedad: ' + (property.unit_number || ''), pageWidth / 2, 105, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(180, 180, 200)
  var infoY = 140
  if (property.owner_name) { doc.text('Propietario: ' + property.owner_name, pageWidth / 2, infoY, { align: 'center' }); infoY += 10 }
  if (property.owner_rut) { doc.text('RUT: ' + property.owner_rut, pageWidth / 2, infoY, { align: 'center' }); infoY += 10 }
  if (property.owner_email) { doc.text('Email: ' + property.owner_email, pageWidth / 2, infoY, { align: 'center' }); infoY += 10 }
  if (property.owner_phone) { doc.text('Telefono: ' + property.owner_phone, pageWidth / 2, infoY, { align: 'center' }); infoY += 10 }

  infoY += 10
  var dateStr = new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text('Fecha: ' + dateStr, pageWidth / 2, infoY, { align: 'center' })
  doc.text('Total hallazgos: ' + entries.length, pageWidth / 2, infoY + 10, { align: 'center' })

  var sevCounts = { leve: 0, moderado: 0, grave: 0, critico: 0 }
  entries.forEach(function(e) { if (sevCounts[e.severity] !== undefined) sevCounts[e.severity]++ })
  var sevY = infoY + 30
  doc.setTextColor(39, 174, 96); doc.text('Leves: ' + sevCounts.leve, pageWidth / 2 - 40, sevY)
  doc.setTextColor(243, 156, 18); doc.text('Moderados: ' + sevCounts.moderado, pageWidth / 2 - 40, sevY + 10)
  doc.setTextColor(231, 76, 60); doc.text('Graves: ' + sevCounts.grave, pageWidth / 2 + 20, sevY)
  doc.setTextColor(142, 68, 173); doc.text('Criticos: ' + sevCounts.critico, pageWidth / 2 + 20, sevY + 10)

  doc.setFontSize(9)
  doc.setTextColor(120, 120, 140)
  doc.text('Generado automaticamente con IA - Bitacora Post Venta', pageWidth / 2, 270, { align: 'center' })

  for (var idx = 0; idx < entries.length; idx++) {
    var entry = entries[idx]
    doc.addPage()
    var y = margin
    var cat = CATEGORIES[entry.category] || CATEGORIES.otro
    var sev = SEVERITIES[entry.severity] || SEVERITIES.leve

    doc.setFillColor(26, 26, 46)
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setFillColor(233, 69, 96)
    doc.rect(0, 40, pageWidth, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('Hallazgo #' + (idx + 1) + ' de ' + entries.length + '  |  ' + property.unit_number, margin, 15)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    var titleText = entry.title || 'Sin titulo'
    if (titleText.length > 60) titleText = titleText.substring(0, 57) + '...'
    doc.text(titleText, margin, 28)
    y = 52

    var catColor = hexToRgb(cat.color)
    doc.setFillColor(catColor[0], catColor[1], catColor[2])
    doc.roundedRect(margin, y, 4, 4, 1, 1, 'F')
    doc.setTextColor(catColor[0], catColor[1], catColor[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(cat.label, margin + 7, y + 3.5)
    var sevColor = hexToRgb(sev.color)
    var catLabelWidth = doc.getTextWidth(cat.label) + 12
    doc.setFillColor(sevColor[0], sevColor[1], sevColor[2])
    doc.roundedRect(margin + catLabelWidth, y, 4, 4, 1, 1, 'F')
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2])
    doc.text(sev.label, margin + catLabelWidth + 7, y + 3.5)
    y += 12

    doc.setTextColor(80, 80, 80)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    if (entry.location) doc.text('Ubicacion: ' + entry.location, margin, y)
    var entryDate = new Date(entry.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    doc.text('Fecha: ' + entryDate, pageWidth - margin - doc.getTextWidth('Fecha: ' + entryDate), y)
    y += 10

    if (entry.images && entry.images.length > 0) {
      var imgCount = Math.min(entry.images.length, 3)
      var imgWidth = (contentWidth - (imgCount - 1) * 5) / imgCount
      var imgHeight = imgWidth * 0.7
      for (var ii = 0; ii < imgCount; ii++) {
        try {
          var imgData = await loadImageAsBase64(entry.images[ii].filename)
          if (imgData) doc.addImage(imgData, 'JPEG', margin + ii * (imgWidth + 5), y, imgWidth, imgHeight)
        } catch (err) {}
      }
      y += imgHeight + 10
    }

    if (entry.inspector_note) {
      if (y > pageHeight - 60) { doc.addPage(); y = margin }
      var noteH = Math.ceil(doc.getTextWidth(entry.inspector_note) / contentWidth) * 5 + 14
      doc.setFillColor(240, 247, 255)
      doc.roundedRect(margin, y, contentWidth, noteH, 3, 3, 'F')
      doc.setTextColor(44, 82, 130); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text('Nota del inspector:', margin + 5, y + 7)
      doc.setFont('helvetica', 'normal')
      y = wrapText(doc, entry.inspector_note, margin + 5, y + 14, contentWidth - 10, 5) + 5
    }

    if (entry.description) {
      if (y > pageHeight - 60) { doc.addPage(); y = margin }
      var descH = Math.ceil(doc.getTextWidth(entry.description) / contentWidth) * 5 + 14
      doc.setFillColor(247, 250, 252)
      doc.roundedRect(margin, y, contentWidth, descH, 3, 3, 'F')
      doc.setTextColor(60, 60, 60); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text('Analisis:', margin + 5, y + 7)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(74, 85, 104)
      y = wrapText(doc, entry.description, margin + 5, y + 14, contentWidth - 10, 5) + 5
    }

    if (entry.recommendation) {
      if (y > pageHeight - 60) { doc.addPage(); y = margin }
      var recH = Math.ceil(doc.getTextWidth(entry.recommendation) / contentWidth) * 5 + 14
      doc.setFillColor(255, 251, 235)
      doc.roundedRect(margin, y, contentWidth, recH, 3, 3, 'F')
      doc.setTextColor(146, 64, 14); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text('Recomendacion:', margin + 5, y + 7)
      doc.setFont('helvetica', 'normal')
      y = wrapText(doc, entry.recommendation, margin + 5, y + 14, contentWidth - 10, 5) + 5
    }

    if (entry.affected_elements && entry.affected_elements.length > 0) {
      if (y > pageHeight - 30) { doc.addPage(); y = margin }
      doc.setTextColor(80, 80, 80); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
      doc.text('Elementos afectados:', margin, y + 5)
      doc.setFont('helvetica', 'normal'); doc.setTextColor(100, 100, 100)
      doc.text(entry.affected_elements.join(', '), margin + doc.getTextWidth('Elementos afectados: ') + 2, y + 5)
    }

    doc.setTextColor(180, 180, 180); doc.setFontSize(8)
    doc.text('Bitacora Post Venta - ' + (projectName || 'Proyecto') + ' - ' + property.unit_number, pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  var fileName = 'Bitacora_' + (projectName || 'Proyecto').replace(/\s+/g, '_') + '_' + property.unit_number.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf'
  doc.save(fileName)
}

// === PANTALLA LOGIN ===
function LoginScreen({ onLogin, onGoRegister }) {
  var [email, setEmail] = useState('')
  var [password, setPassword] = useState('')
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(false)

  var handleLogin = async function() {
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError('')
    try {
      var response = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      })
      var data = await response.json()
      if (!response.ok) { setError(data.error || 'Error al iniciar sesion'); setLoading(false); return }
      onLogin(data.token, data.user)
    } catch (err) { setError('No se pudo conectar con el servidor') }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="header-icon">📋</span>
          <h1>Bitacora Post Venta</h1>
          <p>Ingresa a tu cuenta</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-field">
          <label>Correo electronico</label>
          <input type="email" className="text-input" placeholder="correo@empresa.com" value={email} onChange={function(e) { setEmail(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleLogin() }} autoFocus />
        </div>
        <div className="form-field">
          <label>Contraseña</label>
          <input type="password" className="text-input" placeholder="Tu contraseña" value={password} onChange={function(e) { setPassword(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleLogin() }} />
        </div>
        <button className="submit-button" onClick={handleLogin} disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="auth-switch">¿No tienes cuenta? <span className="auth-link" onClick={onGoRegister}>Regístrate aqui</span></p>
      </div>
    </div>
  )
}

// === PANTALLA REGISTRO ===
function RegisterScreen({ onLogin, onGoLogin }) {
  var [form, setForm] = useState({ company_name: '', name: '', email: '', password: '', password2: '' })
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(false)

  var handleRegister = async function() {
    if (!form.company_name || !form.name || !form.email || !form.password) { setError('Completa todos los campos'); return }
    if (form.password !== form.password2) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    try {
      var response = await fetch(API_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_name: form.company_name, name: form.name, email: form.email, password: form.password })
      })
      var data = await response.json()
      if (!response.ok) { setError(data.error || 'Error al registrarse'); setLoading(false); return }
      onLogin(data.token, data.user)
    } catch (err) { setError('No se pudo conectar con el servidor') }
    setLoading(false)
  }

  var set = function(field) { return function(e) { setForm(Object.assign({}, form, { [field]: e.target.value })) } }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="header-icon">📋</span>
          <h1>Bitacora Post Venta</h1>
          <p>Crea tu cuenta de empresa</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-field">
          <label>🏢 Nombre de la empresa</label>
          <input type="text" className="text-input" placeholder="Ej: Inmobiliaria Aconcagua" value={form.company_name} onChange={set('company_name')} autoFocus />
        </div>
        <div className="form-field">
          <label>👤 Tu nombre</label>
          <input type="text" className="text-input" placeholder="Nombre completo" value={form.name} onChange={set('name')} />
        </div>
        <div className="form-field">
          <label>📧 Correo electronico</label>
          <input type="email" className="text-input" placeholder="correo@empresa.com" value={form.email} onChange={set('email')} />
        </div>
        <div className="form-field">
          <label>🔒 Contraseña</label>
          <input type="password" className="text-input" placeholder="Minimo 6 caracteres" value={form.password} onChange={set('password')} />
        </div>
        <div className="form-field">
          <label>🔒 Confirmar contraseña</label>
          <input type="password" className="text-input" placeholder="Repite la contraseña" value={form.password2} onChange={set('password2')} onKeyDown={function(e) { if (e.key === 'Enter') handleRegister() }} />
        </div>
        <button className="submit-button" onClick={handleRegister} disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </button>
        <p className="auth-switch">¿Ya tienes cuenta? <span className="auth-link" onClick={onGoLogin}>Ingresa aqui</span></p>
      </div>
    </div>
  )
}

// === PANTALLA REGISTRO POR INVITACIÓN ===
function InviteRegisterScreen({ inviteToken, onLogin, onGoLogin }) {
  var [inviteData, setInviteData] = useState(null)
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(true)
  var [form, setForm] = useState({ name: '', password: '', password2: '' })
  var [submitting, setSubmitting] = useState(false)

  useEffect(function() {
    fetch(API_URL + '/invitations/' + inviteToken)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.error) { setError(data.error) } else { setInviteData(data) }
        setLoading(false)
      })
      .catch(function() { setError('No se pudo verificar la invitación'); setLoading(false) })
  }, [inviteToken])

  var handleAccept = async function() {
    if (!form.name || !form.password) { setError('Completa todos los campos'); return }
    if (form.password !== form.password2) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setSubmitting(true); setError('')
    try {
      var r = await fetch(API_URL + '/invitations/' + inviteToken + '/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, password: form.password })
      })
      var data = await r.json()
      if (!r.ok) { setError(data.error || 'Error al aceptar invitación') } else {
        window.history.replaceState({}, '', window.location.pathname)
        onLogin(data.token, data.user)
      }
    } catch(e) { setError('No se pudo conectar con el servidor') }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="auth-screen">
      <div className="auth-card"><div className="auth-logo"><h1>Bitácora Post Venta</h1><p>Verificando invitación...</p></div></div>
    </div>
  )

  if (error && !inviteData) return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo"><span className="header-icon">⚠️</span><h1>Invitación inválida</h1><p>{error}</p></div>
        <button className="submit-button" onClick={onGoLogin}>Ir al inicio de sesión</button>
      </div>
    </div>
  )

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="header-icon">👥</span>
          <h1>Bitácora Post Venta</h1>
          <p>Te invitaron a <strong>{inviteData && inviteData.project_name}</strong></p>
          <p style={{fontSize:'0.85rem',color:'#6B6760',marginTop:'0.25rem'}}>{inviteData && inviteData.company_name} · {inviteData && inviteData.email}</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-field">
          <label>👤 Tu nombre</label>
          <input type="text" className="text-input" placeholder="Nombre completo" value={form.name} onChange={function(e) { setForm(Object.assign({}, form, { name: e.target.value })) }} autoFocus />
        </div>
        <div className="form-field">
          <label>🔒 Elige una contraseña</label>
          <input type="password" className="text-input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={function(e) { setForm(Object.assign({}, form, { password: e.target.value })) }} />
        </div>
        <div className="form-field">
          <label>🔒 Confirmar contraseña</label>
          <input type="password" className="text-input" placeholder="Repite la contraseña" value={form.password2} onChange={function(e) { setForm(Object.assign({}, form, { password2: e.target.value })) }} onKeyDown={function(e) { if(e.key==='Enter') handleAccept() }} />
        </div>
        <button className="submit-button" onClick={handleAccept} disabled={submitting}>
          {submitting ? 'Uniéndome...' : 'Unirme al proyecto'}
        </button>
        <p className="auth-switch">¿Ya tienes cuenta? <span className="auth-link" onClick={onGoLogin}>Ingresa aquí</span></p>
      </div>
    </div>
  )
}

function App() {
  // Auth
  var [token, setToken] = useState(null)
  var [currentUser, setCurrentUser] = useState(null)
  var [authScreen, setAuthScreen] = useState('home') // 'home' | 'login' | 'register' | 'invite'
  var [inviteToken, setInviteToken] = useState(null)

  // App state
  var [projects, setProjects] = useState([])
  var [currentProject, setCurrentProject] = useState(null)
  var [properties, setProperties] = useState([])
  var [currentProperty, setCurrentProperty] = useState(null)
  var [entries, setEntries] = useState([])
  var [showForm, setShowForm] = useState(false)
  var [isAnalyzing, setIsAnalyzing] = useState(false)

  // Team
  var [showTeam, setShowTeam] = useState(false)
  var [team, setTeam] = useState({ members: [], pending_invitations: [] })
  var [inviteEmail, setInviteEmail] = useState('')
  var [inviteLoading, setInviteLoading] = useState(false)
  var [inviteMsg, setInviteMsg] = useState('')

  // Forms
  var [newProjectName, setNewProjectName] = useState('')
  var [showNewProject, setShowNewProject] = useState(false)
  var [showNewProperty, setShowNewProperty] = useState(false)
  var [propForm, setPropForm] = useState({ unit_number: '', owner_name: '', owner_rut: '', owner_email: '', owner_phone: '' })

  // Entry form
  var [description, setDescription] = useState('')
  var [imageFiles, setImageFiles] = useState([])
  var [imagePreviews, setImagePreviews] = useState([])
  var [isRecording, setIsRecording] = useState(false)
  var fileInputRef = useRef(null)
  var recognitionRef = useRef(null)

  // Detectar token de invitación en la URL
  useEffect(function() {
    var params = new URLSearchParams(window.location.search)
    var inv = params.get('invite')
    if (inv) { setInviteToken(inv); setAuthScreen('invite') }
  }, [])

  // Editar propiedad
  var [editingProperty, setEditingProperty] = useState(null) // prop object siendo editado
  var [editPropForm, setEditPropForm] = useState({})

  // Editar hallazgo
  var [editingEntry, setEditingEntry] = useState(null) // entry id siendo editado
  var [editEntryForm, setEditEntryForm] = useState({})

  // Lightbox
  var [lightbox, setLightbox] = useState(null) // { images: [], index: 0 }

  var openLightbox = function(images, index) { setLightbox({ images: images, index: index }) }
  var closeLightbox = function() { setLightbox(null) }
  var lightboxPrev = function() { setLightbox(function(lb) { return { images: lb.images, index: (lb.index - 1 + lb.images.length) % lb.images.length } }) }
  var lightboxNext = function() { setLightbox(function(lb) { return { images: lb.images, index: (lb.index + 1) % lb.images.length } }) }

  // Cerrar lightbox con Escape y navegar con flechas del teclado
  useEffect(function() {
    if (!lightbox) return
    var handleKey = function(e) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') lightboxPrev()
      if (e.key === 'ArrowRight') lightboxNext()
    }
    window.addEventListener('keydown', handleKey)
    return function() { window.removeEventListener('keydown', handleKey) }
  }, [lightbox])

  // Helper: fetch con token
  var authFetch = function(url, options) {
    var opts = options || {}
    var headers = opts.headers || {}
    headers['Authorization'] = 'Bearer ' + token
    opts.headers = headers
    return fetch(url, opts)
  }

  var handleLogin = function(newToken, user) {
    setToken(newToken)
    setCurrentUser(user)
  }

  var handleLogout = function() {
    setToken(null)
    setCurrentUser(null)
    setAuthScreen('home')
    setProjects([])
    setCurrentProject(null)
    setProperties([])
    setCurrentProperty(null)
    setEntries([])
  }

  // Load projects
  useEffect(function() {
    if (!token) return
    authFetch(API_URL + '/projects').then(function(r) { return r.json() }).then(setProjects).catch(console.error)
  }, [token])

  // Load properties when project changes
  useEffect(function() {
    if (currentProject && token) {
      authFetch(API_URL + '/projects/' + currentProject.id + '/properties').then(function(r) { return r.json() }).then(setProperties).catch(console.error)
    } else { setProperties([]); setCurrentProperty(null) }
  }, [currentProject])

  // Load entries when property changes
  useEffect(function() {
    if (currentProperty && token) {
      authFetch(API_URL + '/properties/' + currentProperty.id + '/entries').then(function(r) { return r.json() }).then(setEntries).catch(console.error)
    } else { setEntries([]) }
  }, [currentProperty])

  // Project handlers
  var handleCreateProject = function() {
    if (!newProjectName.trim()) return
    authFetch(API_URL + '/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newProjectName.trim() }) })
      .then(function(r) { return r.json() })
      .then(function(p) { setProjects(function(prev) { return [p].concat(prev) }); setCurrentProject(p); setNewProjectName(''); setShowNewProject(false) })
  }

  var handleDeleteProject = function(id) {
    if (!window.confirm('Eliminar este proyecto y todo su contenido?')) return
    authFetch(API_URL + '/projects/' + id, { method: 'DELETE' }).then(function() {
      setProjects(function(prev) { return prev.filter(function(p) { return p.id !== id }) })
      if (currentProject && currentProject.id === id) { setCurrentProject(null) }
    })
  }

  // Property handlers
  var handleCreateProperty = function() {
    if (!propForm.unit_number.trim()) { alert('El numero de propiedad es requerido'); return }
    authFetch(API_URL + '/projects/' + currentProject.id + '/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(propForm) })
      .then(function(r) { return r.json() })
      .then(function(p) { setProperties(function(prev) { return prev.concat([p]) }); setPropForm({ unit_number: '', owner_name: '', owner_rut: '', owner_email: '', owner_phone: '' }); setShowNewProperty(false) })
  }

  var handleDeleteProperty = function(id) {
    if (!window.confirm('Eliminar esta propiedad y todos sus hallazgos?')) return
    authFetch(API_URL + '/properties/' + id, { method: 'DELETE' }).then(function() {
      setProperties(function(prev) { return prev.filter(function(p) { return p.id !== id }) })
      if (currentProperty && currentProperty.id === id) { setCurrentProperty(null) }
    })
  }

  // Image handlers
  var handleImageUpload = function(e) {
    Array.from(e.target.files).forEach(function(file) {
      if (!file.type.startsWith('image/')) return
      setImageFiles(function(prev) { return prev.concat([file]) })
      var reader = new FileReader()
      reader.onload = function(event) {
        setImagePreviews(function(prev) { return prev.concat([{ id: Date.now().toString() + Math.random().toString(36).slice(2), preview: event.target.result }]) })
      }
      reader.readAsDataURL(file)
    })
  }

  var removeImage = function(index) {
    setImageFiles(function(prev) { return prev.filter(function(_, i) { return i !== index }) })
    setImagePreviews(function(prev) { return prev.filter(function(_, i) { return i !== index }) })
  }

  // Audio
  var toggleRecording = function() {
    if (isRecording) { if (recognitionRef.current) recognitionRef.current.stop(); setIsRecording(false); return }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Usa Google Chrome para grabar audio'); return }
    var recognition = new SR()
    recognition.lang = 'es-CL'; recognition.continuous = true; recognition.interimResults = true
    recognition.onresult = function(event) {
      var t = ''; for (var i = 0; i < event.results.length; i++) t += event.results[i][0].transcript
      setDescription(t)
    }
    recognition.onerror = function() { setIsRecording(false) }
    recognition.onend = function() { setIsRecording(false) }
    recognitionRef.current = recognition; recognition.start(); setIsRecording(true)
  }

  // Submit entry
  var handleSubmit = async function() {
    if (imageFiles.length === 0) { alert('Sube al menos una foto'); return }
    setIsAnalyzing(true)
    try {
      var formData = new FormData()
      imageFiles.forEach(function(f) { formData.append('photos', f) })
      formData.append('inspector_note', description.trim())
      formData.append('project_name', currentProject.name)
      formData.append('unit_number', currentProperty.unit_number)

      var response = await authFetch(API_URL + '/properties/' + currentProperty.id + '/entries', { method: 'POST', body: formData })
      var data = await response.json()
      if (data.success) {
        setEntries(function(prev) { return [data.entry].concat(prev) })
        setDescription(''); setImageFiles([]); setImagePreviews([]); setShowForm(false)
      } else { alert('Error: ' + data.error) }
    } catch (error) { alert('No se pudo conectar con el servidor'); console.error(error) }
    setIsAnalyzing(false)
  }

  var handleDeleteEntry = function(id) {
    if (!window.confirm('Eliminar este hallazgo?')) return
    authFetch(API_URL + '/entries/' + id, { method: 'DELETE' }).then(function() {
      setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id }) })
    })
  }

  var handleExportPDF = function() {
    if (entries.length === 0) { alert('No hay hallazgos para exportar'); return }
    generatePDF(currentProject.name, currentProperty, entries)
  }

  // Guardar edición de propiedad
  var handleSaveProperty = function() {
    if (!editPropForm.unit_number || !editPropForm.unit_number.trim()) { alert('El número de propiedad es requerido'); return }
    authFetch(API_URL + '/properties/' + editingProperty.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editPropForm)
    })
      .then(function(r) { return r.json() })
      .then(function(updated) {
        setProperties(function(prev) { return prev.map(function(p) { return p.id === updated.id ? Object.assign({}, p, updated) : p }) })
        setEditingProperty(null)
      })
      .catch(function() { alert('Error al guardar') })
  }

  // Guardar edición de hallazgo
  var handleSaveEntry = function() {
    authFetch(API_URL + '/entries/' + editingEntry, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editEntryForm)
    })
      .then(function(r) { return r.json() })
      .then(function(updated) {
        setEntries(function(prev) { return prev.map(function(e) { return e.id === updated.id ? Object.assign({}, e, updated) : e }) })
        setEditingEntry(null)
      })
      .catch(function() { alert('Error al guardar') })
  }

  // Cargar equipo del proyecto
  var loadTeam = function(projectId) {
    authFetch(API_URL + '/projects/' + projectId + '/team')
      .then(function(r) { return r.json() })
      .then(function(data) { setTeam(data) })
      .catch(console.error)
  }

  var handleOpenTeam = function() {
    setShowTeam(true)
    loadTeam(currentProject.id)
  }

  var handleInvite = async function() {
    if (!inviteEmail.trim()) return
    setInviteLoading(true); setInviteMsg('')
    try {
      var r = await authFetch(API_URL + '/projects/' + currentProject.id + '/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim() })
      })
      var data = await r.json()
      if (!r.ok) { setInviteMsg('❌ ' + data.error) } else {
        setInviteMsg('✅ Invitación enviada a ' + inviteEmail.trim())
        setInviteEmail('')
        loadTeam(currentProject.id)
      }
    } catch(e) { setInviteMsg('❌ Error al enviar') }
    setInviteLoading(false)
  }

  var handleRemoveMember = async function(userId, userName) {
    if (!window.confirm('¿Quitar a ' + userName + ' del proyecto?')) return
    await authFetch(API_URL + '/projects/' + currentProject.id + '/members/' + userId, { method: 'DELETE' })
    loadTeam(currentProject.id)
  }

  var handleCancelInvite = async function(invId) {
    await authFetch(API_URL + '/invitations/' + invId, { method: 'DELETE' })
    loadTeam(currentProject.id)
  }

  // === PANTALLAS DE AUTH ===
  if (!token) {
    if (authScreen === 'home') return <HomeScreen onGoLogin={function() { setAuthScreen('login') }} onGoRegister={function() { setAuthScreen('register') }} />
    if (authScreen === 'invite') return <InviteRegisterScreen inviteToken={inviteToken} onLogin={handleLogin} onGoLogin={function() { setAuthScreen('login') }} />
    if (authScreen === 'register') return <RegisterScreen onLogin={handleLogin} onGoLogin={function() { setAuthScreen('login') }} />
    return <LoginScreen onLogin={handleLogin} onGoRegister={function() { setAuthScreen('register') }} />
  }

  // === VISTA 1: PROYECTOS ===
  if (!currentProject) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="header-row-top">
              <div className="header-title">
                <span className="header-icon">📋</span>
                <div><h1>Bitácora</h1><p className="header-subtitle">{currentUser && currentUser.company_name}</p></div>
              </div>
              <div className="header-info">
                <span className="user-name">👤 {currentUser && currentUser.name}</span>
                <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
              </div>
            </div>
          </div>
        </header>
        <main className="main">
          <h2 className="section-title">Mis Proyectos</h2>
          {!showNewProject ? (
            <button className="add-button" onClick={function() { setShowNewProject(true) }}>+ Nuevo Proyecto</button>
          ) : (
            <div className="new-project-form">
              <input type="text" placeholder="Nombre del proyecto..." value={newProjectName} onChange={function(e) { setNewProjectName(e.target.value) }} className="text-input" autoFocus onKeyDown={function(e) { if (e.key === 'Enter') handleCreateProject() }} />
              <div className="new-project-actions">
                <button className="submit-button" onClick={handleCreateProject}>Crear Proyecto</button>
                <button className="cancel-button" onClick={function() { setShowNewProject(false); setNewProjectName('') }}>Cancelar</button>
              </div>
            </div>
          )}
          {projects.length === 0 && !showNewProject && (
            <div className="welcome-message"><h2>👋 Bienvenido, {currentUser && currentUser.name}</h2><p>Crea tu primer proyecto para comenzar.</p></div>
          )}
          <div className="projects-grid">
            {projects.map(function(project) {
              return (
                <div key={project.id} className="project-card">
                  <div className="project-card-content" onClick={function() { setCurrentProject(project) }}>
                    <h3>📁 {project.name}</h3>
                    <p className="project-date">{project.property_count || 0} propiedades | Creado: {new Date(project.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <button className="delete-project-button" onClick={function(e) { e.stopPropagation(); handleDeleteProject(project.id) }}>🗑</button>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // === VISTA 2: PROPIEDADES ===
  if (!currentProperty) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="header-row-top">
              <div className="header-title">
                <span className="header-icon">📋</span>
                <div><h1>Bitácora</h1></div>
              </div>
              <div className="header-info">
                {currentUser && currentUser.role === 'admin' && (
                  <button className="back-button" onClick={handleOpenTeam} style={{background:'#EAF1EC',color:'#2D5A3D',border:'1px solid #c5deca'}}>👥 Equipo</button>
                )}
                <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
              </div>
            </div>
            <div className="header-row-nav">
              <button className="back-button" onClick={function() { setCurrentProject(null); setShowTeam(false) }}>← Proyectos</button>
              <div className="project-name-display">{currentProject.name}</div>
            </div>
          </div>
        </header>
        <main className="main">

          {/* PANEL DE EQUIPO */}
          {showTeam && (
            <div className="form-card" style={{marginBottom:'1.5rem'}}>
              <div className="form-header">
                <h3>👥 Equipo del proyecto</h3>
                <button className="close-button" onClick={function() { setShowTeam(false); setInviteMsg('') }}>X</button>
              </div>
              <div className="form-field">
                <label>✉️ Invitar inspector por email</label>
                <div style={{display:'flex',gap:'0.5rem'}}>
                  <input type="email" className="text-input" placeholder="inspector@empresa.com" value={inviteEmail} onChange={function(e) { setInviteEmail(e.target.value) }} onKeyDown={function(e) { if(e.key==='Enter') handleInvite() }} style={{flex:1}} />
                  <button className="submit-button" onClick={handleInvite} disabled={inviteLoading} style={{width:'auto',padding:'0 1.25rem',flexShrink:0}}>
                    {inviteLoading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
                {inviteMsg && <p style={{marginTop:'0.5rem',fontSize:'0.875rem',color: inviteMsg.startsWith('✅') ? '#2D5A3D' : '#B91C1C'}}>{inviteMsg}</p>}
              </div>
              {team.members && team.members.length > 0 && (
                <div className="form-field">
                  <label>Miembros activos</label>
                  {team.members.map(function(m) {
                    return (
                      <div key={m.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.6rem 0.75rem',background:'#f7f5f0',borderRadius:'8px',marginBottom:'0.4rem'}}>
                        <div>
                          <span style={{fontWeight:'500',fontSize:'0.875rem'}}>{m.name}</span>
                          <span style={{color:'#6B6760',fontSize:'0.8rem',marginLeft:'0.5rem'}}>{m.email}</span>
                          <span style={{background: m.role==='admin'?'#1A1814':'#EAF1EC',color:m.role==='admin'?'#fff':'#2D5A3D',fontSize:'0.65rem',padding:'0.15rem 0.5rem',borderRadius:'100px',marginLeft:'0.5rem',fontWeight:'500'}}>{m.role}</span>
                        </div>
                        {m.role !== 'admin' && <button onClick={function() { handleRemoveMember(m.id, m.name) }} style={{background:'none',border:'none',cursor:'pointer',color:'#B91C1C',fontSize:'0.8rem',padding:'0.25rem 0.5rem'}}>Quitar</button>}
                      </div>
                    )
                  })}
                </div>
              )}
              {team.pending_invitations && team.pending_invitations.length > 0 && (
                <div className="form-field">
                  <label>Invitaciones pendientes</label>
                  {team.pending_invitations.map(function(inv) {
                    return (
                      <div key={inv.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0.6rem 0.75rem',background:'#FEF3E2',borderRadius:'8px',marginBottom:'0.4rem'}}>
                        <span style={{fontSize:'0.875rem',color:'#92400E'}}>{inv.email} — esperando respuesta</span>
                        <button onClick={function() { handleCancelInvite(inv.id) }} style={{background:'none',border:'none',cursor:'pointer',color:'#B45309',fontSize:'0.8rem',padding:'0.25rem 0.5rem'}}>Cancelar</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <h2 className="section-title">Propiedades</h2>
          {!showNewProperty ? (
            <button className="add-button" onClick={function() { setShowNewProperty(true) }}>+ Nueva Propiedad</button>
          ) : (
            <div className="form-card">
              <div className="form-header">
                <h3>Nueva Propiedad</h3>
                <button className="close-button" onClick={function() { setShowNewProperty(false); setPropForm({ unit_number: '', owner_name: '', owner_rut: '', owner_email: '', owner_phone: '' }) }}>X</button>
              </div>
              <div className="form-field">
                <label>🏠 Numero / Identificador de propiedad *</label>
                <input type="text" placeholder="Ej: Casa 471, Depto 301..." value={propForm.unit_number} onChange={function(e) { setPropForm(Object.assign({}, propForm, { unit_number: e.target.value })) }} className="text-input" autoFocus />
              </div>
              <div className="form-field">
                <label>👤 Nombre del propietario</label>
                <input type="text" placeholder="Nombre completo..." value={propForm.owner_name} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_name: e.target.value })) }} className="text-input" />
              </div>
              <div className="form-field">
                <label>🪪 RUT</label>
                <input type="text" placeholder="12.345.678-9" value={propForm.owner_rut} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_rut: e.target.value })) }} className="text-input" />
              </div>
              <div className="form-row">
                <div className="form-field form-field-half">
                  <label>📧 Correo electronico</label>
                  <input type="email" placeholder="correo@ejemplo.com" value={propForm.owner_email} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_email: e.target.value })) }} className="text-input" />
                </div>
                <div className="form-field form-field-half">
                  <label>📱 Telefono</label>
                  <input type="tel" placeholder="+56 9 1234 5678" value={propForm.owner_phone} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_phone: e.target.value })) }} className="text-input" />
                </div>
              </div>
              <button className="submit-button" onClick={handleCreateProperty}>Crear Propiedad</button>
            </div>
          )}
          {properties.length === 0 && !showNewProperty && (
            <div className="welcome-message"><h2>🏠 {currentProject.name}</h2><p>Agrega las propiedades del proyecto para registrar hallazgos.</p></div>
          )}
          <div className="projects-grid">
            {properties.map(function(prop) {
              // Modo edición inline
              if (editingProperty && editingProperty.id === prop.id) {
                return (
                  <div key={prop.id} className="form-card" style={{marginBottom:'0'}}>
                    <div className="form-header">
                      <h3>✏️ Editar propiedad</h3>
                      <button className="close-button" onClick={function() { setEditingProperty(null) }}>X</button>
                    </div>
                    <div className="form-field">
                      <label>🏠 Número / Identificador *</label>
                      <input type="text" className="text-input" value={editPropForm.unit_number} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { unit_number: e.target.value })) }} autoFocus />
                    </div>
                    <div className="form-field">
                      <label>👤 Nombre del propietario</label>
                      <input type="text" className="text-input" value={editPropForm.owner_name} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_name: e.target.value })) }} />
                    </div>
                    <div className="form-field">
                      <label>🪪 RUT</label>
                      <input type="text" className="text-input" value={editPropForm.owner_rut} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_rut: e.target.value })) }} />
                    </div>
                    <div className="form-row">
                      <div className="form-field form-field-half">
                        <label>📧 Correo</label>
                        <input type="email" className="text-input" value={editPropForm.owner_email} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_email: e.target.value })) }} />
                      </div>
                      <div className="form-field form-field-half">
                        <label>📱 Teléfono</label>
                        <input type="tel" className="text-input" value={editPropForm.owner_phone} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_phone: e.target.value })) }} />
                      </div>
                    </div>
                    <div style={{display:'flex', gap:'0.75rem'}}>
                      <button className="submit-button" onClick={handleSaveProperty}>Guardar cambios</button>
                      <button className="cancel-button" onClick={function() { setEditingProperty(null) }}>Cancelar</button>
                    </div>
                  </div>
                )
              }
              return (
                <div key={prop.id} className="project-card property-card">
                  <div className="project-card-content" onClick={function() { setCurrentProperty(prop) }}>
                    <h3>🏠 {prop.unit_number}</h3>
                    <p className="property-owner">{prop.owner_name || 'Sin propietario asignado'}</p>
                    <p className="project-date">{prop.entry_count || 0} hallazgos | {prop.owner_email || ''} {prop.owner_phone ? '| ' + prop.owner_phone : ''}</p>
                  </div>
                  <button className="delete-project-button" title="Editar" onClick={function(e) { e.stopPropagation(); setEditingProperty(prop); setEditPropForm({ unit_number: prop.unit_number || '', owner_name: prop.owner_name || '', owner_rut: prop.owner_rut || '', owner_email: prop.owner_email || '', owner_phone: prop.owner_phone || '' }) }}>✏️</button>
                  <button className="delete-project-button" onClick={function(e) { e.stopPropagation(); handleDeleteProperty(prop.id) }}>🗑</button>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // === VISTA 3: HALLAZGOS ===
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-row-top">
            <div className="header-title">
              <span className="header-icon">📋</span>
              <div><h1>Bitácora</h1></div>
            </div>
            <div className="header-info">
              <div className="entry-count">{entries.length} hallazgo{entries.length !== 1 ? 's' : ''}</div>
              <button className="logout-button" onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </div>
          <div className="header-row-nav">
            <button className="back-button" onClick={function() { setCurrentProperty(null); setShowForm(false) }}>← Propiedades</button>
            <div className="project-name-display">{currentProperty.unit_number}{currentProperty.owner_name ? ' — ' + currentProperty.owner_name : ''}</div>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="action-buttons">
          {!showForm && <button className="add-button" onClick={function() { setShowForm(true) }}>+ Nuevo Hallazgo</button>}
          {entries.length > 0 && !showForm && <button className="pdf-button" onClick={handleExportPDF}>📄 Descargar PDF</button>}
        </div>

        {showForm && (
          <div className="form-card">
            <div className="form-header">
              <h3>Nuevo Hallazgo — {currentProperty.unit_number}</h3>
              <button className="close-button" onClick={function() { if (!isAnalyzing) setShowForm(false) }}>X</button>
            </div>
            <div className="form-field">
              <label>📷 Fotos del hallazgo</label>
              <div className="upload-area" onClick={function() { if (!isAnalyzing) fileInputRef.current.click() }}>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
                {imagePreviews.length === 0 ? (
                  <div className="upload-placeholder"><span className="upload-icon">📸</span><p>Toca aqui para subir fotos</p><p className="upload-hint">Puedes seleccionar varias a la vez</p></div>
                ) : (
                  <div className="image-grid">
                    {imagePreviews.map(function(img, index) {
                      return (<div key={img.id} className="image-thumb"><img src={img.preview} alt="" />{!isAnalyzing && <button className="remove-image" onClick={function(e) { e.stopPropagation(); removeImage(index) }}>X</button>}</div>)
                    })}
                    {!isAnalyzing && <div className="add-more-images">+</div>}
                  </div>
                )}
              </div>
            </div>
            <div className="form-field">
              <label>🎙️ Descripcion del inspector</label>
              <div className="audio-section">
                <button className={'record-button' + (isRecording ? ' recording' : '')} onClick={toggleRecording} disabled={isAnalyzing} type="button">
                  {isRecording ? <span className="record-content"><span className="pulse-dot"></span> Grabando... toca para detener</span> : <span className="record-content">🎙️ Grabar audio</span>}
                </button>
                <textarea placeholder="Habla o escribe tu descripcion aqui..." value={description} onChange={function(e) { setDescription(e.target.value) }} className="text-area" rows={3} disabled={isAnalyzing} />
                {description && <p className="audio-hint">Puedes editar el texto antes de enviar</p>}
              </div>
            </div>
            <button className={'submit-button' + (isAnalyzing ? ' analyzing' : '')} onClick={handleSubmit} disabled={isAnalyzing}>
              {isAnalyzing ? <span className="analyzing-text"><span className="spinner"></span> Analizando con IA...</span> : '🤖 Analizar y Registrar'}
            </button>
          </div>
        )}

        {entries.length > 0 && (
          <div className="entries-section">
            <h3 className="entries-title">Hallazgos registrados</h3>
            {entries.map(function(entry) {
              var cat = CATEGORIES[entry.category] || CATEGORIES.otro
              var sev = SEVERITIES[entry.severity] || SEVERITIES.leve

              // Modo edición inline del hallazgo
              if (editingEntry === entry.id) {
                return (
                  <div key={entry.id} className="form-card" style={{marginBottom:'0.875rem'}}>
                    <div className="form-header">
                      <h3>✏️ Editar hallazgo</h3>
                      <button className="close-button" onClick={function() { setEditingEntry(null) }}>X</button>
                    </div>
                    <div className="form-field">
                      <label>Título</label>
                      <input type="text" className="text-input" value={editEntryForm.title || ''} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { title: e.target.value })) }} autoFocus />
                    </div>
                    <div className="form-row">
                      <div className="form-field form-field-half">
                        <label>Categoría</label>
                        <select className="text-input" value={editEntryForm.category || 'otro'} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { category: e.target.value })) }}>
                          {Object.entries(CATEGORIES).map(function(pair) { return <option key={pair[0]} value={pair[0]}>{pair[1].icon} {pair[1].label}</option> })}
                        </select>
                      </div>
                      <div className="form-field form-field-half">
                        <label>Severidad</label>
                        <select className="text-input" value={editEntryForm.severity || 'leve'} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { severity: e.target.value })) }}>
                          {Object.entries(SEVERITIES).map(function(pair) { return <option key={pair[0]} value={pair[0]}>{pair[1].label}</option> })}
                        </select>
                      </div>
                    </div>
                    <div className="form-field">
                      <label>📍 Ubicación</label>
                      <input type="text" className="text-input" value={editEntryForm.location || ''} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { location: e.target.value })) }} />
                    </div>
                    <div className="form-field">
                      <label>Descripción técnica</label>
                      <textarea className="text-area" rows={4} value={editEntryForm.description || ''} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { description: e.target.value })) }} />
                    </div>
                    <div className="form-field">
                      <label>💡 Recomendación</label>
                      <textarea className="text-area" rows={3} value={editEntryForm.recommendation || ''} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { recommendation: e.target.value })) }} />
                    </div>
                    <div style={{display:'flex', gap:'0.75rem'}}>
                      <button className="submit-button" onClick={handleSaveEntry}>Guardar cambios</button>
                      <button className="cancel-button" onClick={function() { setEditingEntry(null) }}>Cancelar</button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={entry.id} className="entry-card">
                  <div style={{position:'absolute', top:'0.875rem', right:'0.875rem', display:'flex', gap:'0.25rem'}}>
                    <button className="delete-button" style={{position:'static', opacity:0.35}} title="Editar" onClick={function() { setEditingEntry(entry.id); setEditEntryForm({ title: entry.title || '', category: entry.category || 'otro', severity: entry.severity || 'leve', location: entry.location || '', description: entry.description || '', recommendation: entry.recommendation || '' }) }}>✏️</button>
                    <button className="delete-button" style={{position:'static', opacity:0.25}} onClick={function() { handleDeleteEntry(entry.id) }}>🗑</button>
                  </div>
                  <div className="entry-tags">
                    <span className="tag category-tag" style={{ background: cat.color + '18', color: cat.color, border: '1px solid ' + cat.color + '33' }}>{cat.icon} {cat.label}</span>
                    <span className="tag severity-tag" style={{ background: sev.bg, color: sev.color, border: '1px solid ' + sev.color + '33' }}>{sev.label}</span>
                    {entry.ai_generated === 1 && <span className="tag ai-tag">🤖 IA</span>}
                  </div>
                  <h4 className="entry-title">{entry.title}</h4>
                  <div className="entry-header">
                    <span className="entry-unit">📍 {entry.location || 'Sin ubicacion'}</span>
                    <span className="entry-date">{new Date(entry.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {entry.images && entry.images.length > 0 && (
                    <div className="entry-images">{entry.images.map(function(img, idx) { return <img key={img.id} src={img.filename} alt="" className="entry-image" onClick={function() { openLightbox(entry.images, idx) }} style={{cursor:'zoom-in'}} /> })}</div>
                  )}
                  {entry.inspector_note && <div className="inspector-note"><strong>🎙️ Nota del inspector:</strong> {entry.inspector_note}</div>}
                  {entry.description && <div className="entry-description-box"><p className="entry-description">{entry.description}</p></div>}
                  {entry.recommendation && <div className="entry-recommendation"><strong>💡 Recomendacion:</strong> {entry.recommendation}</div>}
                  {entry.affected_elements && entry.affected_elements.length > 0 && (
                    <div className="entry-elements">{entry.affected_elements.map(function(el, i) { return <span key={i} className="element-chip">{el}</span> })}</div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {entries.length === 0 && !showForm && (
          <div className="welcome-message"><h2>🏠 {currentProperty.unit_number}</h2><p>No hay hallazgos. Agrega el primero.</p></div>
        )}
      </main>

      {/* LIGHTBOX */}
      {lightbox && (
        <div onClick={closeLightbox} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          {/* Imagen principal */}
          <img
            src={lightbox.images[lightbox.index].filename}
            alt=""
            onClick={function(e) { e.stopPropagation() }}
            style={{maxWidth:'92vw',maxHeight:'85vh',objectFit:'contain',borderRadius:'8px',boxShadow:'0 8px 40px rgba(0,0,0,0.5)'}}
          />

          {/* Flecha izquierda */}
          {lightbox.images.length > 1 && (
            <button onClick={function(e) { e.stopPropagation(); lightboxPrev() }} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
          )}

          {/* Flecha derecha */}
          {lightbox.images.length > 1 && (
            <button onClick={function(e) { e.stopPropagation(); lightboxNext() }} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          )}

          {/* Contador y cerrar */}
          <div style={{position:'absolute',top:'1rem',left:0,right:0,display:'flex',alignItems:'center',justifyContent:'center',gap:'1rem'}}>
            {lightbox.images.length > 1 && (
              <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.85rem'}}>{lightbox.index + 1} / {lightbox.images.length}</span>
            )}
          </div>
          <button onClick={closeLightbox} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.1rem',width:'36px',height:'36px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
      )}
    </div>
  )
}

export default App
