import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom'
import jsPDF from 'jspdf'
import './App.css'

// === PANTALLA HOME ===
function HomeScreen() {
  var navigate = useNavigate()
  var onGoLogin = function() { navigate('/login') }
  var [menuOpen, setMenuOpen] = useState(false)

  useEffect(function() {
    if (menuOpen) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = '' }
    return function() { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(function() {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function() { entry.target.classList.add('hp-visible') }, i * 80)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })
    document.querySelectorAll('.hp-reveal').forEach(function(el) { observer.observe(el) })
    return function() { observer.disconnect() }
  }, [])

  return (
    <div className="hp-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        /* VARIABLES Y BASE */
        .hp-root{--bg:#F7F5F0;--ink:#1A1814;--muted:#6B6760;--accent:#2D5A3D;--accent-light:#EAF1EC;--line:#E2DDD6;--white:#FFFFFF;--serif:'Playfair Display',Georgia,serif;--sans:'DM Sans',sans-serif;--gutter:max(1.25rem,5vw);font-family:var(--sans);background:var(--bg);color:var(--ink);overflow-x:hidden;font-weight:300;line-height:1.6;min-height:100vh;}

        /* NAV */
        .hp-nav{position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1.1rem var(--gutter);background:rgb(255, 255, 255);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);}
        .hp-logo{font-family:var(--serif);font-size:1.15rem;font-weight:700;color:var(--ink);cursor:pointer;letter-spacing:-0.02em;white-space:nowrap;}
        .hp-logo span{color:var(--accent);}
        .hp-nav-links{display:flex;align-items:center;gap:1.5rem;}
        .hp-nav-link{background:none;border:none;cursor:pointer;color:var(--muted);font-size:0.875rem;font-family:var(--sans);transition:color 0.2s;padding:0;}
        .hp-nav-link:hover{color:var(--ink);}
        .hp-btn-nav{background:var(--ink)!important;color:var(--white)!important;padding:0.55rem 1.2rem;border-radius:6px;font-weight:500!important;font-size:0.875rem;font-family:var(--sans);border:none;cursor:pointer;transition:background 0.2s;white-space:nowrap;}
        .hp-btn-nav:hover{background:var(--accent)!important;}

        /* HAMBURGER */
        .hp-hamburger{display:none;flex-direction:column;justify-content:center;align-items:center;gap:5px;background:none;border:none;cursor:pointer;padding:8px;border-radius:6px;min-width:44px;min-height:44px;}
        .hp-hamburger span{display:block;width:22px;height:2px;background:var(--ink);border-radius:2px;transition:all 0.25s;}
        .hp-hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg);}
        .hp-hamburger.open span:nth-child(2){opacity:0;}
        .hp-hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

        /* MOBILE MENU */
        .hp-mobile-menu{display:none;position:fixed;inset:0;z-index:190;background:rgba(247,245,240,0.98);backdrop-filter:blur(20px);flex-direction:column;align-items:stretch;justify-content:center;padding:2rem 1.5rem;gap:0;}
        .hp-mobile-menu.open{display:flex;}
        .hp-mobile-menu .hp-nav-link{font-size:1.4rem;font-weight:400;color:var(--ink);padding:1rem 0;border-bottom:1px solid var(--line);text-align:left;}
        .hp-mobile-actions{display:flex;flex-direction:column;gap:0.75rem;margin-top:2rem;}
        .hp-mobile-btn-primary{background:var(--ink);color:var(--white);padding:1rem;border-radius:10px;font-weight:500;font-size:1rem;font-family:var(--sans);border:none;cursor:pointer;min-height:52px;transition:background 0.2s;text-align:center;}
        .hp-mobile-btn-primary:hover{background:var(--accent);}
        .hp-mobile-btn-ghost{background:none;color:var(--ink);padding:1rem;border-radius:10px;font-weight:400;font-size:1rem;font-family:var(--sans);border:1.5px solid var(--line);cursor:pointer;min-height:52px;transition:border-color 0.2s;text-align:center;}
        .hp-mobile-btn-ghost:hover{border-color:var(--ink);}

        /* HERO */
        .hp-hero{min-height:92vh;display:flex;flex-direction:column;justify-content:center;padding:5rem var(--gutter) 4rem;position:relative;overflow:hidden;}
        .hp-hero::before{content:'';position:absolute;top:-20%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(45,90,61,0.07) 0%,transparent 70%);pointer-events:none;}
        .hp-eyebrow{display:inline-flex;align-items:center;gap:0.5rem;background:var(--accent-light);color:var(--accent);font-size:0.75rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;padding:0.4rem 1rem;border-radius:100px;margin-bottom:1.75rem;width:fit-content;animation:hp-fadeUp 0.7s 0.1s both;}
        .hp-eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;}
        .hp-hero-title{font-family:var(--serif);font-size:clamp(2.4rem,7vw,5.5rem);line-height:1.05;font-weight:700;letter-spacing:-0.03em;max-width:14ch;margin-bottom:1.25rem;animation:hp-fadeUp 0.8s 0.2s both;}
        .hp-hero-title em{font-style:italic;color:var(--accent);}
        .hp-hero-sub{font-size:1rem;color:var(--muted);max-width:44ch;line-height:1.75;margin-bottom:2rem;animation:hp-fadeUp 0.8s 0.35s both;}
        .hp-hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;animation:hp-fadeUp 0.8s 0.5s both;}
        .hp-btn-primary{background:var(--ink);color:var(--white);padding:0.875rem 1.75rem;border-radius:8px;font-weight:500;font-size:0.95rem;font-family:var(--sans);border:none;cursor:pointer;transition:background 0.2s,transform 0.15s,box-shadow 0.2s;display:inline-flex;align-items:center;justify-content:center;gap:0.5rem;white-space:nowrap;min-height:44px;}
        .hp-btn-primary:hover{background:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,90,61,0.2);}
        .hp-btn-ghost{background:none;border:none;color:var(--muted);font-size:0.9rem;font-family:var(--sans);cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;padding:0.875rem 0.25rem;transition:color 0.2s,gap 0.2s;white-space:nowrap;min-height:44px;}
        .hp-btn-ghost:hover{color:var(--ink);gap:0.65rem;}

        /* SECCIÓN DOLORES — oscura */
        .hp-pain{background:#1A1814;color:var(--white);padding:5rem var(--gutter);}
        .hp-pain .hp-label{color:#7CB891;}
        .hp-pain .hp-section-title{color:var(--white);}
        .hp-pain-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;margin-top:3rem;}
        .hp-pain-card{background:#1A1814;padding:2rem 1.75rem;transition:background 0.2s;}
        .hp-pain-card:hover{background:rgba(255,255,255,0.04);}
        .hp-pain-before{font-size:0.68rem;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.25);margin-bottom:0.75rem;display:block;}
        .hp-pain-problem{font-family:var(--serif);font-size:1.05rem;font-weight:700;color:rgba(255,255,255,0.85);margin-bottom:1rem;line-height:1.35;}
        .hp-pain-solution{font-size:0.85rem;color:#7CB891;line-height:1.6;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.08);display:flex;gap:0.5rem;align-items:flex-start;}
        .hp-pain-solution::before{content:'↳';opacity:0.6;flex-shrink:0;}

        /* CÓMO FUNCIONA */
        .hp-how{background:var(--white);border-top:1px solid var(--line);border-bottom:1px solid var(--line);padding:5rem var(--gutter);}
        .hp-label{font-size:0.72rem;font-weight:500;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent);margin-bottom:0.875rem;display:block;}
        .hp-section-title{font-family:var(--serif);font-size:clamp(1.6rem,3.5vw,2.8rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:1.1rem;}
        .hp-hflow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;align-items:start;gap:0;margin-top:3rem;}
        .hp-hstep{text-align:center;padding:0 0.75rem;}
        .hp-hstep-icon{width:52px;height:52px;background:var(--accent-light);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin:0 auto 0.875rem;box-shadow:0 2px 8px rgba(45,90,61,0.1);}
        .hp-hstep-num{display:block;font-size:0.65rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--accent);margin-bottom:0.4rem;}
        .hp-hstep-title{font-family:var(--serif);font-size:0.95rem;font-weight:700;line-height:1.2;margin-bottom:0.35rem;color:var(--ink);}
        .hp-hstep-body{font-size:0.8rem;color:var(--muted);line-height:1.55;}
        .hp-hflow-arrow{color:var(--line);font-size:1.5rem;padding:0 0.25rem;margin-top:1rem;align-self:start;}

        /* CTA */
        .hp-cta{text-align:center;padding:6rem var(--gutter);position:relative;overflow:hidden;}
        .hp-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(45,90,61,0.06) 0%,transparent 65%);pointer-events:none;}
        .hp-cta-title{font-family:var(--serif);font-size:clamp(1.8rem,4.5vw,4rem);font-weight:700;letter-spacing:-0.03em;line-height:1.05;margin-bottom:1.25rem;}
        .hp-cta-sub{font-size:0.95rem;color:var(--muted);max-width:40ch;margin:0 auto 2rem;line-height:1.7;}
        .hp-cta-actions{display:flex;flex-direction:column;align-items:center;gap:0.875rem;}
        .hp-cta-secondary{background:none;border:none;color:var(--muted);font-size:0.875rem;font-family:var(--sans);cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color 0.2s;padding:0.5rem;}
        .hp-cta-secondary:hover{color:var(--ink);}

        /* FOOTER */
        .hp-footer{border-top:1px solid var(--line);padding:1.75rem var(--gutter);display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;color:var(--muted);flex-wrap:wrap;gap:0.75rem;}
        .hp-footer-logo{font-family:var(--serif);font-weight:700;color:var(--ink);font-size:1rem;}
        .hp-footer-link{background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.8rem;font-family:var(--sans);transition:color 0.2s;padding:0;}
        .hp-footer-link:hover{color:var(--ink);}

        /* ANIMACIONES */
        .hp-reveal{opacity:0;transform:translateY(20px);transition:opacity 0.6s ease,transform 0.6s ease;}
        .hp-visible{opacity:1!important;transform:none!important;}
        @keyframes hp-fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}

        /* TABLET */
        @media(max-width:1024px){
          .hp-hflow{grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;}
          .hp-pain-grid{grid-template-columns:1fr;}
        }

        /* MOBILE */
        @media(max-width:640px){
          .hp-nav{padding:1rem 1.25rem;}
          .hp-nav-links{display:none;}
          .hp-hamburger{display:flex;}
          .hp-hero{min-height:auto;padding:4rem 1.25rem 3rem;}
          .hp-eyebrow{font-size:0.7rem;padding:0.35rem 0.875rem;margin-bottom:1.25rem;}
          .hp-hero-title{font-size:clamp(3rem,11vw,4rem);margin-bottom:1rem;}
          .hp-hero-title .hp-nowrap{white-space:nowrap;}
          .hp-hero-sub{font-size:0.95rem;margin-bottom:1.5rem;}
          .hp-hero-actions{flex-direction:column;align-items:stretch;gap:0.75rem;}
          .hp-btn-primary{justify-content:center;padding:1rem;font-size:1rem;min-height:52px;}
          .hp-btn-ghost{justify-content:center;padding:0.875rem 0;}
          .hp-pain{padding:3.5rem 1.25rem;}
          .hp-pain-grid{grid-template-columns:1fr;border-radius:12px;}
          .hp-pain-card{padding:1.5rem 1.25rem;}
          .hp-how{padding:3.5rem 1.25rem;}
          .hp-hflow{display:flex;flex-direction:column;gap:0;margin-top:2rem;}
          .hp-hflow-arrow{transform:rotate(90deg);align-self:center;margin:0.1rem 0;}
          .hp-hstep{text-align:left;display:flex;gap:1rem;align-items:flex-start;padding:1rem 0;border-bottom:1px solid var(--line);}
          .hp-hstep:last-of-type{border-bottom:none;}
          .hp-hstep-icon{margin:0;flex-shrink:0;width:44px;height:44px;border-radius:10px;}
          .hp-hstep-num{margin-bottom:0.2rem;}
          .hp-hstep-text{display:flex;flex-direction:column;}
          .hp-hflow-arrow{display:none;}
          .hp-cta{padding:4rem 1.25rem;}
          .hp-cta-title{font-size:clamp(1.7rem,7vw,2.4rem);}
          .hp-cta br{display:none;}
          .hp-cta-actions{flex-direction:column;align-items:stretch;}
          .hp-btn-primary.hp-cta-btn{width:100%;min-height:52px;}
          .hp-footer{flex-direction:column;text-align:center;gap:0.5rem;padding:1.5rem 1.25rem;}
        }
      `}</style>

      {/* NAV */}
      <nav className="hp-nav">
        <div className="hp-logo">BitácoraPro<span>.</span></div>
        <div className="hp-nav-links">
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-dolores').scrollIntoView({ behavior: 'smooth' }) }}>Por qué BitácoraPro</button>
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Cómo funciona</button>
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-contacto').scrollIntoView({ behavior: 'smooth' }) }}>Contacto</button>
          <button className="hp-btn-nav" onClick={onGoLogin}>Iniciar sesión →</button>
        </div>
        <button className={"hp-hamburger" + (menuOpen ? " open" : "")} onClick={function() { setMenuOpen(function(v) { return !v }) }} aria-label="Menú">
          <span /><span /><span />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={"hp-mobile-menu" + (menuOpen ? " open" : "")}>
        <button className="hp-nav-link" onClick={function() { setMenuOpen(false); document.getElementById('hp-dolores').scrollIntoView({ behavior: 'smooth' }) }}>Por qué BitácoraPro</button>
        <button className="hp-nav-link" onClick={function() { setMenuOpen(false); document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Cómo funciona</button>
        <button className="hp-nav-link" onClick={function() { setMenuOpen(false); document.getElementById('hp-contacto').scrollIntoView({ behavior: 'smooth' }) }}>Contacto</button>
        <div className="hp-mobile-actions">
          <button className="hp-mobile-btn-primary" onClick={function() { setMenuOpen(false); window.open('mailto:contacto@bitacorapro.cl?subject=Solicitud%20de%20demo', '_blank') }}>Solicitar demo →</button>
          <button className="hp-mobile-btn-ghost" onClick={function() { setMenuOpen(false); onGoLogin() }}>Iniciar sesión</button>
        </div>
      </div>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-eyebrow">Postventa automatizada con IA</div>
        <h1 className="hp-hero-title">Del hallazgo al informe, <em><span className="hp-nowrap">en segundos.</span></em></h1>
        <p className="hp-hero-sub">Tus equipos de postventa registran fotos y notas de voz en terreno. BitácoraPro genera la documentación técnica automáticamente, en tiempo real y sin retrabajo.</p>
        <div className="hp-hero-actions">
          <button className="hp-btn-primary" onClick={function() { window.open('mailto:mario.encina.d@gmail.com?subject=Solicitud%20de%20demo', '_blank') }}>Solicitar demo →</button>
        </div>
      </section>

      {/* LOS 3 DOLORES */}
      <section className="hp-pain" id="hp-dolores">
        <span className="hp-label hp-reveal">Por qué BitácoraPro</span>
        <h2 className="hp-section-title hp-reveal">El costo oculto de tu postventa</h2>
        <div className="hp-pain-grid">
          <div className="hp-pain-card hp-reveal">
            <span className="hp-pain-before">Hoy</span>
            <p className="hp-pain-problem">Los informes de entrega se construyen manualmente y generan horas de retrabajo.</p>
            <p className="hp-pain-solution">El informe se genera en terreno, en tiempo real y sin retrabajo posterior.</p>
          </div>
          <div className="hp-pain-card hp-reveal">
            <span className="hp-pain-before">Hoy</span>
            <p className="hp-pain-problem">No hay trazabilidad real de los hallazgos por unidad ni proyecto.</p>
            <p className="hp-pain-solution">Cada hallazgo queda registrado, categorizado y visible para su gestión hasta el cierre.</p>
          </div>
          <div className="hp-pain-card hp-reveal">
            <span className="hp-pain-before">Hoy</span>
            <p className="hp-pain-problem">La operación depende de herramientas dispersas y no integradas.</p>
            <p className="hp-pain-solution">Una plataforma digital centralizada para inspección, documentación y gestión.</p>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="hp-how" id="hp-como">
        <span className="hp-label hp-reveal">Cómo funciona</span>
        <h2 className="hp-section-title hp-reveal">Inspecciona. Documenta. Gestiona.</h2>
        <div className="hp-hflow">
          <div className="hp-hstep hp-reveal">
            <div className="hp-hstep-icon">📱</div>
            <div className="hp-hstep-text">
              <span className="hp-hstep-num">01</span>
              <h4 className="hp-hstep-title">Llegas a terreno</h4>
              <p className="hp-hstep-body">Registras la inspección desde el teléfono. Todo queda centralizado por proyecto.</p>
            </div>
          </div>
          <div className="hp-hflow-arrow hp-reveal">→</div>
          <div className="hp-hstep hp-reveal">
            <div className="hp-hstep-icon">📸</div>
            <div className="hp-hstep-text">
              <span className="hp-hstep-num">02</span>
              <h4 className="hp-hstep-title">Fotos y nota de voz</h4>
              <p className="hp-hstep-body">Tomas fotos y registras notas de voz. Sin formularios ni carga manual.</p>
            </div>
          </div>
          <div className="hp-hflow-arrow hp-reveal">→</div>
          <div className="hp-hstep hp-reveal">
            <div className="hp-hstep-icon">✦</div>
            <div className="hp-hstep-text">
              <span className="hp-hstep-num">03</span>
              <h4 className="hp-hstep-title">La IA arma el informe</h4>
              <p className="hp-hstep-body">Diagnóstico, categoría, severidad y recomendación. En segundos.</p>
            </div>
          </div>
          <div className="hp-hflow-arrow hp-reveal">→</div>
          <div className="hp-hstep hp-reveal">
            <div className="hp-hstep-icon">📄</div>
            <div className="hp-hstep-text">
              <span className="hp-hstep-num">04</span>
              <h4 className="hp-hstep-title">Hallazgos listos para gestionar</h4>
              <p className="hp-hstep-body">Cada hallazgo queda registrado, categorizado y visible para ser gestionado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="hp-cta" id="hp-contacto">
        <h2 className="hp-cta-title hp-reveal">¿Listo para automatizar<br/> tu postventa?</h2>
        <p className="hp-cta-sub hp-reveal">Agenda una demo y te mostramos cómo funciona con tu operación. Sin compromisos.</p>
        <div className="hp-cta-actions hp-reveal">
          <button className="hp-btn-primary hp-cta-btn" onClick={function() { window.open('mailto:contacto@bitacorapro.cl?subject=Solicitud%20de%20demo', '_blank') }}>Solicitar demo →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <span className="hp-footer-logo">BitácoraPro.</span>
        <span>© 2026 BitácoraPro. Hecho en Chile.</span>
      </footer>
    </div>
  )
}

var API_URL =
  window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
    ? 'http://' + window.location.hostname + ':3001'
    : 'https://bitacora-postventa-production.up.railway.app'

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

var STATUSES = {
  pendiente:   { label: 'Pendiente',   color: '#B45309', bg: '#FEF3C7', icon: '🔴' },
  en_progreso: { label: 'En progreso', color: '#1D4ED8', bg: '#DBEAFE', icon: '🔵' },
  resuelto:    { label: 'Resuelto',    color: '#15803D', bg: '#DCFCE7', icon: '🟢' },
}

async function generateActaPDF(deliveryAct, property, projectName) {
  var doc = new jsPDF('p', 'mm', 'a4')
  var pageWidth = 210
  var pageHeight = 297
  var margin = 16
  var contentWidth = pageWidth - margin * 2
  var INK = [26, 24, 20]
  var GREEN = [45, 90, 61]
  var MUTED = [107, 103, 96]
  var LINE = [226, 221, 214]
  var BG = [247, 245, 240]
  var WHITE = [255, 255, 255]

  var form = deliveryAct.data || {}
  var signedAt = deliveryAct.signed_at ? new Date(deliveryAct.signed_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' }) : ''

  // Helpers
  function setColor(rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]) }
  function setFill(rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]) }
  function setDraw(rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]) }

  function checkPageBreak(y, needed) {
    if (y + needed > pageHeight - 20) { doc.addPage(); return margin + 8 }
    return y
  }

  function sectionHeader(y, title) {
    y = checkPageBreak(y, 14)
    setFill(INK)
    doc.rect(margin, y, contentWidth, 8, 'F')
    setColor(WHITE)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), margin + 4, y + 5.5)
    return y + 8
  }

  function dataRow(y, label, value, shade) {
    y = checkPageBreak(y, 7)
    if (shade) { setFill(BG); doc.rect(margin, y, contentWidth, 7, 'F') }
    setColor(MUTED)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin + 3, y + 4.8)
    setColor(INK)
    doc.setFont('helvetica', 'bold')
    doc.text(String(value || '—'), margin + 55, y + 4.8)
    return y + 7
  }

  function triRow(y, label, value, shade) {
    y = checkPageBreak(y, 7)
    if (shade) { setFill(BG); doc.rect(margin, y, contentWidth, 7, 'F') }
    setColor(INK)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin + 3, y + 4.8)
    var displayVal = { 'si': 'Sí', 'no': 'No', 'na': 'N/A', 'Conforme': 'Conforme', 'No conforme': 'No conforme' }[value] || value || '—'
    var valColor = value === 'si' ? [22, 101, 52] : value === 'no' ? [153, 27, 27] : MUTED
    setColor(valColor)
    doc.setFont('helvetica', 'bold')
    doc.text(displayVal, pageWidth - margin - 3, y + 4.8, { align: 'right' })
    return y + 7
  }

  function confRow(y, label, value, shade) {
    return triRow(y, label, value === 'si' ? 'Sí' : value === 'no' ? 'No' : value, shade)
  }

  function wrapBlock(y, label, text, bgRgb) {
    if (!text) return y
    var lines = doc.splitTextToSize(text, contentWidth - 10)
    var blockH = lines.length * 5 + 10
    y = checkPageBreak(y, blockH + 2)
    setFill(bgRgb)
    setDraw(LINE)
    doc.roundedRect(margin, y, contentWidth, blockH, 2, 2, 'FD')
    setColor(MUTED)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin + 4, y + 6)
    setColor(INK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text(lines, margin + 4, y + 12)
    return y + blockH + 3
  }

  function footer(pageNum) {
    setColor(MUTED)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('BitácoraPro — Acta de entrega  |  ' + (projectName || '') + '  |  ' + (property.unit_number || ''), margin, pageHeight - 8)
    doc.text('Pág. ' + pageNum, pageWidth - margin, pageHeight - 8, { align: 'right' })
  }

  // =====================
  // PORTADA
  // =====================
  setFill(INK)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // banda verde
  setFill(GREEN)
  doc.rect(0, pageHeight * 0.42, pageWidth, 2, 'F')

  // Logo / título
  setColor(WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text('BitácoraPro', pageWidth / 2, 80, { align: 'center' })
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(192, 187, 181)
  doc.text('Acta de Entrega de Propiedad', pageWidth / 2, 93, { align: 'center' })

  // Datos principales
  var coverY = pageHeight * 0.42 + 18
  setColor(WHITE)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(property.unit_number || '', pageWidth / 2, coverY, { align: 'center' })
  coverY += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(192, 187, 181)
  doc.text(projectName || '', pageWidth / 2, coverY, { align: 'center' })
  coverY += 8
  if (property.owner_name) { doc.text(property.owner_name, pageWidth / 2, coverY, { align: 'center' }); coverY += 7 }

  // Fecha firma
  if (signedAt) {
    coverY += 8
    setFill([45, 90, 61])
    doc.roundedRect(pageWidth / 2 - 40, coverY - 5, 80, 12, 3, 3, 'F')
    setColor(WHITE)
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.text('Firmada el ' + signedAt, pageWidth / 2, coverY + 2.5, { align: 'center' })
  }

  // pie portada
  doc.setTextColor(107, 103, 96)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text('Documento generado con BitácoraPro', pageWidth / 2, pageHeight - 14, { align: 'center' })

  // =====================
  // PÁGINA 2 — DATOS + SECCIONES
  // =====================
  doc.addPage()
  var pageNum = 2
  var y = margin + 4

  // Encabezado de página interior
  setFill(BG)
  doc.rect(0, 0, pageWidth, 14, 'F')
  setColor(GREEN)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('ACTA DE ENTREGA', margin, 9)
  setColor(MUTED)
  doc.setFont('helvetica', 'normal')
  doc.text(property.unit_number + (property.owner_name ? '  —  ' + property.owner_name : ''), pageWidth - margin, 9, { align: 'right' })
  setDraw(LINE)
  doc.line(margin, 14, pageWidth - margin, 14)
  y = 20

  // I. Datos generales
  y = sectionHeader(y, 'I. Datos generales')
  y = dataRow(y, 'Propietario', form.owner_name, false)
  y = dataRow(y, 'RUT', form.owner_rut, true)
  y = dataRow(y, 'Correo', form.owner_email, false)
  y = dataRow(y, 'Teléfono', form.owner_phone, true)
  y = dataRow(y, 'Proyecto / Etapa', form.proyecto_etapa, false)
  y = dataRow(y, 'Inspector', form.inspector_nombre, true)
  y = dataRow(y, 'Bodega', form.bodega, false)
  y = dataRow(y, 'Estacionamiento', form.estacionamiento, true)
  y += 4

  // II. Documentación
  y = sectionHeader(y, 'II. Documentación entregada')
  var docItems = [
    ['Programa de garantía', form.doc_garantia],
    ['Manual de uso y mantención', form.doc_manual],
    ['Llaves puerta principal', form.doc_llaves_principal],
    ['Llaves bodega', form.doc_llaves_bodega],
    ['Llaves estacionamiento', form.doc_llaves_estacionamiento],
    ['Llaves dormitorios', form.doc_llaves_dormitorios],
    ['Llaves closet', form.doc_llaves_closet],
    ['Control remoto portón', form.doc_control_porton],
    ['Kit de accesorios', form.doc_kit_accesorios],
    ['Garantías de artefactos', form.doc_garantias_artefactos],
  ]
  docItems.forEach(function(item, i) { y = triRow(y, item[0], item[1], i % 2 === 1) })
  y += 4

  // III. Artefactos
  y = sectionHeader(y, 'III. Recepción de artefactos')
  var artItems = [
    ['Calefón / Caldera', form.art_calefon],
    ['Encimera', form.art_encimera],
    ['Horno', form.art_horno],
    ['Campana extractora', form.art_campana],
    ['Estufa / Cocina', form.art_estufa],
    ['Lavavajillas', form.art_lavavajillas],
    ['Refrigerador', form.art_refrigerador],
    ['Lavadora / Secadora', form.art_lavadora],
    ['Aire acondicionado / Climatización', form.art_aire],
    ['Alarma de seguridad', form.art_alarma],
    ['Citófono / Videoportero', form.art_citofono],
    ['Portón automático', form.art_porton],
    ['Calefacción central / Piso radiante', form.art_calefaccion],
  ]
  var artLabels = { 'si': 'Conforme', 'no': 'No conforme', 'na': 'N/A' }
  artItems.forEach(function(item, i) {
    var displayVal = artLabels[item[1]] || item[1]
    y = triRow(y, item[0], displayVal, i % 2 === 1)
  })
  y += 4

  // IV. Medidores
  y = sectionHeader(y, 'IV. Lectura de medidores')
  var medItems = [
    ['Agua fría', form.med_agua_fria_num, form.med_agua_fria_val],
    ['Agua caliente', form.med_agua_caliente_num, form.med_agua_caliente_val],
    ['Gas', form.med_gas_num, form.med_gas_val],
    ['Electricidad', form.med_luz_num, form.med_luz_val],
  ]
  medItems.forEach(function(item, i) {
    y = checkPageBreak(y, 7)
    if (i % 2 === 1) { setFill(BG); doc.rect(margin, y, contentWidth, 7, 'F') }
    setColor(INK); doc.setFontSize(7.5); doc.setFont('helvetica', 'normal')
    doc.text(item[0], margin + 3, y + 4.8)
    setColor(MUTED); doc.setFont('helvetica', 'normal')
    doc.text('N° ' + (item[1] || '—'), margin + 75, y + 4.8)
    setColor(INK); doc.setFont('helvetica', 'bold')
    doc.text('Lectura: ' + (item[2] || '—'), pageWidth - margin - 3, y + 4.8, { align: 'right' })
    y += 7
  })
  y += 4

  // V. Conformidad
  y = sectionHeader(y, 'V. Conformidad del proceso')
  var confItems = [
    ['¿Se inició en el horario acordado?', form.conf_horario],
    ['¿Se explicaron los documentos de entrega?', form.conf_documentos],
    ['¿Se explicó el programa de garantía y plazos?', form.conf_garantia],
    ['¿Se realizó la prueba de artefactos?', form.conf_artefactos],
    ['¿Se explicó tablero, corte de agua y gas?', form.conf_tablero],
    ['¿Se explicaron los teléfonos de emergencia?', form.conf_emergencias],
  ]
  confItems.forEach(function(item, i) { y = confRow(y, item[0], item[1], i % 2 === 1) })
  y += 4

  // Observaciones
  if (form.observaciones && form.observaciones.trim()) {
    y = wrapBlock(y, 'OBSERVACIONES', form.observaciones, BG)
    y += 2
  }

  footer(pageNum)

  // =====================
  // PÁGINA 3 — FIRMAS
  // =====================
  doc.addPage()
  pageNum++
  y = margin + 4

  setFill(BG)
  doc.rect(0, 0, pageWidth, 14, 'F')
  setColor(GREEN); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
  doc.text('FIRMAS', margin, 9)
  setColor(MUTED); doc.setFont('helvetica', 'normal')
  doc.text('Acta firmada el ' + signedAt, pageWidth - margin, 9, { align: 'right' })
  setDraw(LINE); doc.line(margin, 14, pageWidth - margin, 14)
  y = 22

  // Badge firmada
  setFill(GREEN)
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F')
  setColor(WHITE); doc.setFontSize(9); doc.setFont('helvetica', 'bold')
  doc.text('✅  Acta firmada el ' + signedAt + '  —  ' + (deliveryAct.signed_by_name || property.owner_name || 'Propietario'), margin + 4, y + 6.5)
  y += 16

  // Firmas en 2 columnas
  var sigW = (contentWidth - 8) / 2
  var sigH = 35

  if (deliveryAct.signature_owner) {
    setDraw(LINE); setFill(WHITE)
    doc.roundedRect(margin, y, sigW, sigH + 14, 2, 2, 'FD')
    setColor(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'bold')
    doc.text('PROPIETARIO', margin + 4, y + 6)
    setColor(INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
    doc.text(property.owner_name || '—', margin + 4, y + 12)
    try { doc.addImage(deliveryAct.signature_owner, 'PNG', margin + 2, y + 15, sigW - 4, sigH - 4) } catch(e) {}
  }

  if (deliveryAct.signature_inspector) {
    var sx = margin + sigW + 8
    setDraw(LINE); setFill(WHITE)
    doc.roundedRect(sx, y, sigW, sigH + 14, 2, 2, 'FD')
    setColor(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'bold')
    doc.text('INSPECTOR', sx + 4, y + 6)
    setColor(INK); doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
    doc.text(deliveryAct.data && deliveryAct.data.inspector_nombre ? deliveryAct.data.inspector_nombre : '—', sx + 4, y + 12)
    try { doc.addImage(deliveryAct.signature_inspector, 'PNG', sx + 2, y + 15, sigW - 4, sigH - 4) } catch(e) {}
  }

  y += sigH + 14 + 10

  footer(pageNum)

  // =====================
  // ANEXO I — HALLAZGOS
  // =====================
  var entries = deliveryAct.entries_snapshot || []
  if (entries.length > 0) {
    doc.addPage()
    pageNum++

    setFill(BG); doc.rect(0, 0, pageWidth, 14, 'F')
    setColor(GREEN); doc.setFontSize(8); doc.setFont('helvetica', 'bold')
    doc.text('ANEXO I — HALLAZGOS DECLARADOS AL FIRMAR', margin, 9)
    setColor(MUTED); doc.setFont('helvetica', 'normal')
    doc.text(entries.length + ' hallazgo' + (entries.length !== 1 ? 's' : ''), pageWidth - margin, 9, { align: 'right' })
    setDraw(LINE); doc.line(margin, 14, pageWidth - margin, 14)
    y = 20

    var sevLabels = { leve: 'Leve', moderado: 'Moderado', grave: 'Grave', critico: 'Crítico' }
    var sevColors = { leve: [22, 163, 74], moderado: [217, 119, 6], grave: [220, 38, 38], critico: [124, 58, 237] }
    var statusLabels2 = { pendiente: 'Pendiente', en_progreso: 'En progreso', resuelto: 'Resuelto' }
    var statusColors2 = { pendiente: [180, 83, 9], en_progreso: [29, 78, 216], resuelto: [21, 128, 61] }

    entries.forEach(function(entry, idx) {
      var rowH = 10
      y = checkPageBreak(y, rowH + 2)
      if (idx % 2 === 0) { setFill(BG); doc.rect(margin, y, contentWidth, rowH, 'F') }
      else { setFill(WHITE); doc.rect(margin, y, contentWidth, rowH, 'F') }

      // Número
      setColor(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'bold')
      doc.text(String(idx + 1), margin + 3, y + 6.5)

      // Título
      setColor(INK); doc.setFontSize(8); doc.setFont('helvetica', 'normal')
      var title = entry.title || 'Sin título'
      if (title.length > 48) title = title.substring(0, 45) + '...'
      doc.text(title, margin + 10, y + 6.5)

      // Categoría
      setColor(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
      var catText = entry.category ? entry.category.charAt(0).toUpperCase() + entry.category.slice(1) : ''
      doc.text(catText, margin + 105, y + 6.5)

      // Severidad
      var sevC = sevColors[entry.severity] || sevColors.leve
      setColor(sevC); doc.setFontSize(7); doc.setFont('helvetica', 'bold')
      doc.text(sevLabels[entry.severity] || '—', margin + 133, y + 6.5)

      // Estado
      var stC = statusColors2[entry.status] || statusColors2.pendiente
      setColor(stC); doc.setFontSize(7); doc.setFont('helvetica', 'bold')
      doc.text(statusLabels2[entry.status] || 'Pendiente', pageWidth - margin - 3, y + 6.5, { align: 'right' })

      // Ubicación si existe
      if (entry.location) {
        y += rowH
        y = checkPageBreak(y, 6)
        setColor(MUTED); doc.setFontSize(6.5); doc.setFont('helvetica', 'normal')
        doc.text('📍 ' + entry.location, margin + 10, y + 4.5)
        y += 6
      } else {
        y += rowH
      }
    })

    // nota al pie del anexo
    y += 6
    setColor(MUTED); doc.setFontSize(7); doc.setFont('helvetica', 'normal')
    doc.text('Estos hallazgos fueron registrados y congelados al momento de la firma del acta.', margin, y)

    footer(pageNum)
  }

  var fileName = 'Acta_' + (projectName || 'Proyecto').replace(/\s+/g, '_') + '_' + (property.unit_number || '').replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf'
  doc.save(fileName)
}

// === PANTALLA LOGIN ===
function LoginScreen({ onLogin }) {
  var navigate = useNavigate()
  var [email, setEmail] = useState('')
  var [password, setPassword] = useState('')
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(false)
  var [showForgot, setShowForgot] = useState(false)
  var [forgotEmail, setForgotEmail] = useState('')
  var [forgotMsg, setForgotMsg] = useState('')
  var [forgotLoading, setForgotLoading] = useState(false)

  var handleForgot = async function() {
  if (!forgotEmail.trim()) return setForgotMsg('Ingresa tu email')
  setForgotLoading(true)
  try {
    await fetch(API_URL + '/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: forgotEmail.trim() })
    })
    setForgotMsg('✅ Si ese email existe, recibirás un link en los próximos minutos.')
  } catch (err) {
    setForgotMsg('Error al enviar. Intenta de nuevo.')
  }
  setForgotLoading(false)
  }

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
        <h1>BitacoraPro</h1>
        <p>Ingresa a tu cuenta</p>
      </div>

      {showForgot ? (
        <div>
          <h2 style={{fontFamily:'Georgia,serif', marginBottom:'0.5rem'}}>Recuperar contraseña</h2>
          <p style={{color:'#6B6760', fontSize:'0.9rem', marginBottom:'1.25rem'}}>Ingresa tu email y te enviaremos un link para restablecer tu contraseña.</p>
          <div className="form-field">
            <label>Email</label>
            <input type="email" inputMode="email" className="text-input" value={forgotEmail} onChange={function(e) { setForgotEmail(e.target.value) }} placeholder="tu@email.com" />
          </div>
          {forgotMsg && <p style={{fontSize:'0.875rem', color: forgotMsg.startsWith('✅') ? '#2D5A3D' : '#B91C1C', marginBottom:'1rem'}}>{forgotMsg}</p>}
          <button className="submit-button" onClick={handleForgot} disabled={forgotLoading}>
            {forgotLoading ? 'Enviando...' : 'Enviar link →'}
          </button>
          <button type="button" onClick={function() { setShowForgot(false); setForgotMsg('') }} style={{background:'none',border:'none',color:'#6B6760',fontSize:'0.875rem',cursor:'pointer',marginTop:'0.75rem',textDecoration:'underline',display:'block'}}>
            ← Volver al login
          </button>
        </div>
      ) : (
        <div>
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
          <button type="button" onClick={function() { setShowForgot(true) }} style={{background:'none', border:'none', color:'#6B6760', fontSize:'0.875rem', cursor:'pointer', marginTop:'0.75rem', textDecoration:'underline'}}>
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      )}
    </div>
  </div>
)
  
}

// === PANTALLA REGISTRO ===
function RegisterScreen({ onLogin }) {
  var navigate = useNavigate()
  var onGoLogin = function() { navigate('/login') }
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
          <h1>BitacoraPro</h1>
          <p>Crea tu cuenta de empresa</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-field">
          <label>🏢 Nombre de la empresa</label>
          <input type="text" className="text-input" placeholder="Nombre corredora o inmobiliaria" value={form.company_name} onChange={set('company_name')} autoFocus />
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
function InviteRegisterScreen({ onLogin }) {
  var { token: inviteToken } = useParams()
  var navigate = useNavigate()
  var onGoLogin = function() { navigate('/login') }
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
        onLogin(data.token, data.user)
      }
    } catch(e) { setError('No se pudo conectar con el servidor') }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="auth-screen">
      <div className="auth-card"><div className="auth-logo"><h1>BitácoraPro</h1><p>Verificando invitación...</p></div></div>
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
          <h1>BitácoraPro</h1>
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

// === PANTALLA CAMBIO DE CONTRASEÑA (primer login) ===
function ChangePasswordScreen({ token, user, onDone }) {
  var [newPassword, setNewPassword] = useState('')
  var [newPassword2, setNewPassword2] = useState('')
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(false)

  var handleSubmit = async function() {
    if (!newPassword || !newPassword2) { setError('Completa ambos campos'); return }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (newPassword !== newPassword2) { setError('Las contraseñas no coinciden'); return }
    setLoading(true); setError('')
    try {
      var response = await fetch(API_URL + '/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ new_password: newPassword })
      })
      var data = await response.json()
      if (!response.ok) { setError(data.error || 'Error al cambiar contraseña'); setLoading(false); return }
      onDone()
    } catch (err) { setError('No se pudo conectar con el servidor') }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">
          <span style={{fontSize:'2rem'}}>🔑</span>
          <h1>Crea tu contraseña</h1>
          <p>Hola {user.name}, es tu primer acceso. Elige una contraseña para tu cuenta.</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-field">
          <label>Nueva contraseña</label>
          <input type="password" className="text-input" placeholder="Mínimo 6 caracteres" value={newPassword} onChange={function(e) { setNewPassword(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }} autoFocus />
        </div>
        <div className="form-field">
          <label>Repetir contraseña</label>
          <input type="password" className="text-input" placeholder="Repite tu contraseña" value={newPassword2} onChange={function(e) { setNewPassword2(e.target.value) }} onKeyDown={function(e) { if (e.key === 'Enter') handleSubmit() }} />
        </div>
        <button className="submit-button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar y entrar →'}
        </button>
      </div>
    </div>
  )
}

// === PANTALLA ADMIN ===
function AdminScreen() {
  var [secret, setSecret] = useState('')
  var [authed, setAuthed] = useState(false)
  var [authError, setAuthError] = useState('')
  var [companies, setCompanies] = useState([])
  var [loading, setLoading] = useState(false)
  var [showCreate, setShowCreate] = useState(false)
  var [createForm, setCreateForm] = useState({ company_name: '', name: '', email: '', password: '' })
  var [createMsg, setCreateMsg] = useState('')
  var [creating, setCreating] = useState(false)
  var [openMenu, setOpenMenu] = useState(null)

  useEffect(function() {
    if (!openMenu) return
    var handler = function() { setOpenMenu(null) }
    document.addEventListener('click', handler)
    return function() { document.removeEventListener('click', handler) }
  }, [openMenu])

  function adminFetch(url, options) {
    var opts = options || {}
    opts.headers = Object.assign({}, opts.headers || {}, { 'x-admin-secret': secret, 'Content-Type': 'application/json' })
    return fetch(API_URL + url, opts)
  }

  function handleLogin() {
    setLoading(true)
    setAuthError('')
    adminFetch('/admin/stats').then(function(r) {
      if (r.status === 401) { setAuthError('Clave incorrecta'); setLoading(false); return }
      return r.json().then(function(data) { setCompanies(data); setAuthed(true); setLoading(false) })
    }).catch(function() { setAuthError('Error de conexión'); setLoading(false) })
  }

  function refreshStats() {
    adminFetch('/admin/stats').then(function(r) { return r.json() }).then(setCompanies)
  }

  function handleToggle(c) {
    var action = c.active ? 'desactivar' : 'reactivar'
    var msg1 = '¿' + (c.active ? 'Desactivar' : 'Reactivar') + ' la empresa "' + c.company_name + '"?'
    var msg2 = c.active
      ? 'Los usuarios de esta empresa no podrán iniciar sesión. ¿Confirmas?'
      : '¿Confirmas que quieres reactivar esta empresa?'
    if (!window.confirm(msg1)) return
    if (!window.confirm(msg2)) return
    adminFetch('/admin/companies/' + c.id + '/toggle', { method: 'PUT' })
      .then(function(r) { return r.json() })
      .then(function(data) { if (data.success) refreshStats() })
  }

  function handleDelete(c) {
    var msg1 = '⚠️ Eliminar "' + c.company_name + '" y TODOS sus datos?\n\nEsto borrará ' + c.projects + ' proyectos, ' + c.properties + ' propiedades y ' + c.entries + ' hallazgos. Esta acción es irreversible.'
    var msg2 = 'Última confirmación: ¿estás seguro de eliminar "' + c.company_name + '" para siempre?'
    if (!window.confirm(msg1)) return
    if (!window.confirm(msg2)) return
    adminFetch('/admin/companies/' + c.id, { method: 'DELETE' })
      .then(function(r) { return r.json() })
      .then(function(data) { if (data.success) refreshStats() })
  }

  function handleCreate() {
    if (!createForm.company_name || !createForm.name || !createForm.email || !createForm.password) {
      setCreateMsg('Todos los campos son requeridos'); return
    }
    setCreating(true); setCreateMsg('')
    adminFetch('/admin/create-company', { method: 'POST', body: JSON.stringify(createForm) })
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.error) { setCreateMsg('❌ ' + data.error) }
        else { setCreateMsg('✅ Cliente creado: ' + data.company.name); setCreateForm({ company_name: '', name: '', email: '', password: '' }); setShowCreate(false); refreshStats() }
        setCreating(false)
      }).catch(function() { setCreateMsg('❌ Error de conexión'); setCreating(false) })
  }

  if (!authed) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F7F5F0',fontFamily:'DM Sans,sans-serif'}}>
        <div style={{background:'#fff',borderRadius:'16px',padding:'2.5rem',width:'100%',maxWidth:'360px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
          <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.5rem',marginBottom:'0.25rem',color:'#1A1814'}}>Panel de Admin</h2>
          <p style={{color:'#6B6760',fontSize:'0.85rem',marginBottom:'1.75rem'}}>Solo para uso interno de BitácoraPro.</p>
          <input
            type="password" placeholder="Clave de acceso"
            value={secret} onChange={function(e) { setSecret(e.target.value) }}
            onKeyDown={function(e) { if (e.key === 'Enter') handleLogin() }}
            style={{width:'100%',padding:'0.75rem 1rem',borderRadius:'8px',border:'1.5px solid #E2DDD6',fontSize:'1rem',boxSizing:'border-box',marginBottom:'0.75rem',outline:'none'}}
          />
          {authError && <p style={{color:'#E74C3C',fontSize:'0.85rem',marginBottom:'0.75rem'}}>{authError}</p>}
          <button onClick={handleLogin} disabled={loading} style={{width:'100%',padding:'0.875rem',background:'#1A1814',color:'#fff',border:'none',borderRadius:'8px',fontSize:'1rem',cursor:'pointer',fontWeight:'500'}}>
            {loading ? 'Verificando...' : 'Entrar →'}
          </button>
        </div>
      </div>
    )
  }

  var totalProjects = companies.reduce(function(s, c) { return s + c.projects }, 0)
  var totalProperties = companies.reduce(function(s, c) { return s + c.properties }, 0)
  var totalEntries = companies.reduce(function(s, c) { return s + c.entries }, 0)

  return (
    <div style={{minHeight:'100vh',background:'#F7F5F0',fontFamily:'DM Sans,sans-serif'}}>
      {/* Header */}
      <div style={{background:'#1A1814',padding:'1.25rem 2rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:'Playfair Display,serif',color:'#fff',fontSize:'1.15rem',fontWeight:'700'}}>BitácoraPro <span style={{color:'#7CB891'}}>Admin</span></span>
        <button onClick={refreshStats} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'#fff',padding:'0.5rem 1rem',borderRadius:'6px',cursor:'pointer',fontSize:'0.85rem'}}>↻ Actualizar</button>
      </div>

      <div style={{maxWidth:'1100px',margin:'0 auto',padding:'2rem 1.5rem'}}>

        {/* Stats globales */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginBottom:'2rem'}}>
          {[
            { label: 'Clientes', value: companies.length, icon: '🏢' },
            { label: 'Proyectos', value: totalProjects, icon: '📁' },
            { label: 'Propiedades', value: totalProperties, icon: '🏠' },
            { label: 'Hallazgos', value: totalEntries, icon: '📋' },
          ].map(function(stat) {
            return (
              <div key={stat.label} style={{background:'#fff',borderRadius:'12px',padding:'1.25rem 1.5rem',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                <div style={{fontSize:'1.5rem',marginBottom:'0.4rem'}}>{stat.icon}</div>
                <div style={{fontSize:'1.75rem',fontWeight:'700',color:'#1A1814',lineHeight:1}}>{stat.value}</div>
                <div style={{fontSize:'0.8rem',color:'#6B6760',marginTop:'0.25rem'}}>{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Botón crear cliente */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
          <h3 style={{fontFamily:'Playfair Display,serif',fontSize:'1.2rem',color:'#1A1814',margin:0}}>Clientes ({companies.length})</h3>
          <button onClick={function() { setShowCreate(true); setCreateMsg('') }} style={{background:'#2D5A3D',color:'#fff',border:'none',borderRadius:'8px',padding:'0.6rem 1.25rem',cursor:'pointer',fontSize:'0.9rem',fontWeight:'500'}}>+ Nuevo cliente</button>
        </div>

        {/* Modal crear cliente */}
        {showCreate && (
          <div style={{background:'#fff',borderRadius:'12px',padding:'1.5rem',marginBottom:'1.5rem',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',border:'1px solid #E2DDD6'}}>
            <h4 style={{margin:'0 0 1.25rem',fontFamily:'Playfair Display,serif',fontSize:'1.1rem'}}>Crear nuevo cliente</h4>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'0.75rem'}}>
              <input placeholder="Nombre de la empresa" value={createForm.company_name} onChange={function(e) { setCreateForm(Object.assign({},createForm,{company_name:e.target.value})) }} style={{padding:'0.7rem 1rem',borderRadius:'8px',border:'1.5px solid #E2DDD6',fontSize:'0.9rem',outline:'none'}} />
              <input placeholder="Nombre del admin" value={createForm.name} onChange={function(e) { setCreateForm(Object.assign({},createForm,{name:e.target.value})) }} style={{padding:'0.7rem 1rem',borderRadius:'8px',border:'1.5px solid #E2DDD6',fontSize:'0.9rem',outline:'none'}} />
              <input placeholder="Email del admin" type="email" value={createForm.email} onChange={function(e) { setCreateForm(Object.assign({},createForm,{email:e.target.value})) }} style={{padding:'0.7rem 1rem',borderRadius:'8px',border:'1.5px solid #E2DDD6',fontSize:'0.9rem',outline:'none'}} />
              <input placeholder="Contraseña temporal" type="text" value={createForm.password} onChange={function(e) { setCreateForm(Object.assign({},createForm,{password:e.target.value})) }} style={{padding:'0.7rem 1rem',borderRadius:'8px',border:'1.5px solid #E2DDD6',fontSize:'0.9rem',outline:'none'}} />
            </div>
            {createMsg && <p style={{color: createMsg.startsWith('✅') ? '#2D5A3D' : '#E74C3C',fontSize:'0.85rem',margin:'0 0 0.75rem'}}>{createMsg}</p>}
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={handleCreate} disabled={creating} style={{background:'#1A1814',color:'#fff',border:'none',borderRadius:'8px',padding:'0.7rem 1.5rem',cursor:'pointer',fontSize:'0.9rem',fontWeight:'500'}}>{creating ? 'Creando...' : 'Crear cliente'}</button>
              <button onClick={function() { setShowCreate(false); setCreateMsg('') }} style={{background:'none',border:'1.5px solid #E2DDD6',borderRadius:'8px',padding:'0.7rem 1.25rem',cursor:'pointer',fontSize:'0.9rem',color:'#6B6760'}}>Cancelar</button>
            </div>
          </div>
        )}

        {/* Tabla de clientes */}
        <div style={{background:'#fff',borderRadius:'12px',overflow:'visible',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
            <thead>
              <tr style={{background:'#F7F5F0',borderBottom:'1px solid #E2DDD6'}}>
                {['Empresa','Admin','Usuarios','Proyectos','Propiedades','Hallazgos','Última actividad','Desde',''].map(function(h) {
                  return <th key={h} style={{padding:'0.875rem 1rem',textAlign:'left',fontSize:'0.72rem',fontWeight:'600',letterSpacing:'0.06em',textTransform:'uppercase',color:'#6B6760'}}>{h}</th>
                })}
              </tr>
            </thead>
            <tbody>
              {companies.map(function(c, i) {
                var isRecentlyActive = c.last_activity && (Date.now() - new Date(c.last_activity).getTime()) < 7 * 24 * 60 * 60 * 1000
                return (
                  <tr key={c.id} style={{borderBottom: i < companies.length - 1 ? '1px solid #E2DDD6' : 'none', opacity: c.active ? 1 : 0.55}}>
                    <td style={{padding:'1rem',fontWeight:'600',color:'#1A1814'}}>
                      <div>{c.company_name}</div>
                      <span style={{display:'inline-block',marginTop:'0.25rem',padding:'0.15rem 0.55rem',borderRadius:'100px',fontSize:'0.7rem',fontWeight:'600',background: c.active ? '#EAF1EC' : '#FEF0F0',color: c.active ? '#2D5A3D' : '#C0392B'}}>
                        {c.active ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td style={{padding:'1rem'}}>
                      <div style={{fontWeight:'500',color:'#1A1814'}}>{c.admin_name}</div>
                      <div style={{fontSize:'0.78rem',color:'#6B6760'}}>{c.admin_email}</div>
                    </td>
                    <td style={{padding:'1rem',textAlign:'center',color:'#1A1814',fontWeight:'500'}}>{c.users}</td>
                    <td style={{padding:'1rem',textAlign:'center',color:'#1A1814',fontWeight:'500'}}>{c.projects}</td>
                    <td style={{padding:'1rem',textAlign:'center',color:'#1A1814',fontWeight:'500'}}>{c.properties}</td>
                    <td style={{padding:'1rem',textAlign:'center'}}>
                      <span style={{background: c.entries > 0 ? '#EAF1EC' : '#F7F5F0', color: c.entries > 0 ? '#2D5A3D' : '#6B6760', padding:'0.2rem 0.6rem',borderRadius:'100px',fontWeight:'600',fontSize:'0.85rem'}}>{c.entries}</span>
                    </td>
                    <td style={{padding:'1rem'}}>
                      {c.last_activity
                        ? <span style={{color: isRecentlyActive ? '#2D5A3D' : '#6B6760', fontSize:'0.82rem', fontWeight: isRecentlyActive ? '600' : '400'}}>
                            {isRecentlyActive && '● '}{new Date(c.last_activity).toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'})}
                          </span>
                        : <span style={{color:'#C0BBB5',fontSize:'0.82rem'}}>Sin actividad</span>
                      }
                    </td>
                    <td style={{padding:'1rem',color:'#6B6760',fontSize:'0.82rem'}}>{new Date(c.created_at).toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'})}</td>
                    <td style={{padding:'1rem'}}>
                      <div style={{position:'relative'}}>
                        <button
                          onClick={function(e) { e.stopPropagation(); setOpenMenu(function(prev) { return prev === c.id ? null : c.id }) }}
                          style={{background:'#F7F5F0',border:'1px solid #E2DDD6',borderRadius:'6px',padding:'0.4rem 0.65rem',cursor:'pointer',fontSize:'1rem',lineHeight:1,color:'#1A1814'}}
                        >⋯</button>
                        {openMenu === c.id && (
                          <div onClick={function(e) { e.stopPropagation() }} style={{position:'absolute',right:0,bottom:'calc(100% + 4px)', top:'auto',background:'#fff',border:'1px solid #E2DDD6',borderRadius:'10px',boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:100,minWidth:'160px',overflow:'hidden'}}>
                            <button
                              onClick={function() { setOpenMenu(null); handleToggle(c) }}
                              style={{display:'block',width:'100%',padding:'0.75rem 1rem',background:'none',border:'none',cursor:'pointer',fontSize:'0.875rem',textAlign:'left',color: c.active ? '#F39C12' : '#2D5A3D',fontWeight:'500'}}
                            >{c.active ? '⏸ Desactivar' : '▶ Reactivar'}</button>
                            <div style={{height:'1px',background:'#E2DDD6',margin:'0'}}/>
                            <button
                              onClick={function() { setOpenMenu(null); handleDelete(c) }}
                              style={{display:'block',width:'100%',padding:'0.75rem 1rem',background:'none',border:'none',cursor:'pointer',fontSize:'0.875rem',textAlign:'left',color:'#E74C3C',fontWeight:'500'}}
                            >🗑 Eliminar empresa</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {companies.length === 0 && (
            <div style={{padding:'3rem',textAlign:'center',color:'#6B6760'}}>Aún no hay clientes registrados.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// === SCROLL TO TOP GLOBAL ===
function scrollToTop() {
  // iOS a veces ignora el primer scrollTo si se hace "muy temprano"
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      var el = document.getElementById('app-scroll')
      if (el) el.scrollTop = 0

      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  })
}

function ScrollToTop() {
  var location = useLocation()

  useLayoutEffect(function () {
    scrollToTop()
  }, [location.pathname])

  return null
}

// === VISTA PÚBLICA DE HALLAZGO (sin login) ===
function PublicEntryScreen() {
  var { entryId } = useParams()
  var [entry, setEntry] = useState(null)
  var [error, setError] = useState('')
  var [loading, setLoading] = useState(true)
  var [lightbox, setLightbox] = useState(null)

  useEffect(function() {
    fetch(API_URL + '/public/entries/' + entryId)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.error) { setError(data.error) } else { setEntry(data) }
        setLoading(false)
      })
      .catch(function() { setError('No se pudo cargar el hallazgo'); setLoading(false) })
  }, [entryId])

  useEffect(function() {
    if (!lightbox) return
    var handleKey = function(e) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') setLightbox(function(lb) { return { images: lb.images, index: (lb.index - 1 + lb.images.length) % lb.images.length } })
      if (e.key === 'ArrowRight') setLightbox(function(lb) { return { images: lb.images, index: (lb.index + 1) % lb.images.length } })
    }
    window.addEventListener('keydown', handleKey)
    return function() { window.removeEventListener('keydown', handleKey) }
  }, [lightbox])

  var CATS = { estructural: { label: 'Estructural', color: '#DC2626', icon: '🏗️' }, humedad: { label: 'Humedad', color: '#2563EB', icon: '💧' }, electrico: { label: 'Eléctrico', color: '#D97706', icon: '⚡' }, terminaciones: { label: 'Terminaciones', color: '#7C3AED', icon: '🎨' }, instalaciones: { label: 'Instalaciones', color: '#059669', icon: '🔧' }, otro: { label: 'Otro', color: '#6B7280', icon: '📋' } }
  var SEVS = { leve: { label: 'Leve', color: '#16A34A', bg: '#F0FDF4' }, moderado: { label: 'Moderado', color: '#D97706', bg: '#FFFBEB' }, grave: { label: 'Grave', color: '#DC2626', bg: '#FEF2F2' }, critico: { label: 'Crítico', color: '#7C3AED', bg: '#FAF5FF' } }
  var PUB_STATUSES = { pendiente: { label: 'Pendiente', color: '#B45309', bg: '#FEF3C7', icon: '🔴' }, en_progreso: { label: 'En progreso', color: '#1D4ED8', bg: '#DBEAFE', icon: '🔵' }, resuelto: { label: 'Resuelto', color: '#15803D', bg: '#DCFCE7', icon: '🟢' } }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F7F5F0',fontFamily:'DM Sans,sans-serif'}}>
      <p style={{color:'#6B6760'}}>Cargando hallazgo...</p>
    </div>
  )

  if (error) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F7F5F0',fontFamily:'DM Sans,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:'2rem',marginBottom:'0.5rem'}}>🔍</p>
        <p style={{color:'#1A1814',fontWeight:'500',marginBottom:'0.25rem'}}>Hallazgo no encontrado</p>
        <p style={{color:'#6B6760',fontSize:'0.875rem'}}>{error}</p>
      </div>
    </div>
  )

  var cat = CATS[entry.category] || CATS.otro
  var sev = SEVS[entry.severity] || SEVS.leve

  return (
    <div style={{minHeight:'100vh',background:'#F7F5F0',fontFamily:'DM Sans,sans-serif'}}>
      {/* Header */}
      <div style={{background:'#1A1814',padding:'1rem 1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontFamily:'Playfair Display,serif',color:'#fff',fontSize:'1.1rem',fontWeight:'700'}}>BitácoraPro<span style={{color:'#7CB891'}}>.</span></span>
        <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.75rem',letterSpacing:'0.05em',textTransform:'uppercase'}}>Vista de hallazgo</span>
      </div>

      {/* Contexto: proyecto / propiedad */}
      <div style={{background:'#fff',borderBottom:'1px solid #E2DDD6',padding:'0.75rem 1.5rem',display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.8rem',color:'#6B6760',flexWrap:'wrap'}}>
        <span>📁 {entry.project_name}</span>
        <span style={{color:'#E2DDD6'}}>›</span>
        <span>🏠 {entry.unit_number}</span>
      </div>

      {/* Contenido */}
      <div style={{maxWidth:'680px',margin:'0 auto',padding:'1.5rem 1.25rem'}}>

        {/* Tags */}
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap',marginBottom:'0.875rem'}}>
          <span style={{background:cat.color+'18',color:cat.color,border:'1px solid '+cat.color+'33',padding:'0.25rem 0.75rem',borderRadius:'100px',fontSize:'0.75rem',fontWeight:'500'}}>{cat.icon} {cat.label}</span>
          <span style={{background:sev.bg,color:sev.color,border:'1px solid '+sev.color+'33',padding:'0.25rem 0.75rem',borderRadius:'100px',fontSize:'0.75rem',fontWeight:'500'}}>{sev.label}</span>
          {(function() {
            var st = PUB_STATUSES[entry.status] || PUB_STATUSES.pendiente
            return <span style={{background:st.bg,color:st.color,border:'1px solid '+st.color+'33',padding:'0.25rem 0.75rem',borderRadius:'100px',fontSize:'0.75rem',fontWeight:'500'}}>{st.icon} {st.label}</span>
          })()}
          {entry.ai_generated === 1 && <span style={{background:'#EEF2FF',color:'#4F46E5',border:'1px solid #C7D2FE',padding:'0.25rem 0.75rem',borderRadius:'100px',fontSize:'0.75rem',fontWeight:'500'}}>🤖 Generado con IA</span>}
        </div>

        {/* Título */}
        <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',fontWeight:'700',color:'#1A1814',lineHeight:1.25,marginBottom:'0.5rem'}}>{entry.title}</h1>

        {/* Meta */}
        <div style={{display:'flex',gap:'1rem',fontSize:'0.8rem',color:'#6B6760',marginBottom:'1.25rem',flexWrap:'wrap'}}>
          {entry.location && <span>📍 {entry.location}</span>}
          <span>🗓 {new Date(entry.created_at).toLocaleDateString('es-CL', { day:'2-digit', month:'long', year:'numeric' })}</span>
        </div>

        {/* Fotos */}
        {entry.images && entry.images.length > 0 && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'0.5rem',marginBottom:'1.25rem'}}>
            {entry.images.map(function(img, idx) {
              return <img key={img.id} src={img.filename} alt="" onClick={function() { setLightbox({ images: entry.images, index: idx }) }} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',borderRadius:'8px',cursor:'zoom-in',border:'1px solid #E2DDD6'}} />
            })}
          </div>
        )}

        {/* Nota del inspector */}
        {entry.inspector_note && (
          <div style={{background:'#EFF6FF',borderRadius:'10px',padding:'1rem',marginBottom:'1rem',border:'1px solid #BFDBFE'}}>
            <p style={{fontSize:'0.72rem',fontWeight:'600',letterSpacing:'0.08em',textTransform:'uppercase',color:'#3B82F6',marginBottom:'0.4rem'}}>🎙️ Nota del inspector</p>
            <p style={{fontSize:'0.9rem',color:'#1E3A5F',lineHeight:1.6}}>{entry.inspector_note}</p>
          </div>
        )}

        {/* Descripción */}
        {entry.description && (
          <div style={{background:'#fff',borderRadius:'10px',padding:'1rem',marginBottom:'1rem',border:'1px solid #E2DDD6'}}>
            <p style={{fontSize:'0.72rem',fontWeight:'600',letterSpacing:'0.08em',textTransform:'uppercase',color:'#6B6760',marginBottom:'0.4rem'}}>Descripción técnica</p>
            <p style={{fontSize:'0.9rem',color:'#1A1814',lineHeight:1.7}}>{entry.description}</p>
          </div>
        )}

        {/* Recomendación */}
        {entry.recommendation && (
          <div style={{background:'#FFFBEB',borderRadius:'10px',padding:'1rem',marginBottom:'1rem',border:'1px solid #FDE68A'}}>
            <p style={{fontSize:'0.72rem',fontWeight:'600',letterSpacing:'0.08em',textTransform:'uppercase',color:'#D97706',marginBottom:'0.4rem'}}>💡 Recomendación</p>
            <p style={{fontSize:'0.9rem',color:'#78350F',lineHeight:1.7}}>{entry.recommendation}</p>
          </div>
        )}

        {/* Elementos afectados */}
        {entry.affected_elements && entry.affected_elements.length > 0 && (
          <div style={{marginBottom:'1rem'}}>
            <p style={{fontSize:'0.72rem',fontWeight:'600',letterSpacing:'0.08em',textTransform:'uppercase',color:'#6B6760',marginBottom:'0.5rem'}}>Elementos afectados</p>
            <div style={{display:'flex',gap:'0.4rem',flexWrap:'wrap'}}>
              {entry.affected_elements.map(function(el, i) { return <span key={i} style={{background:'#F3F4F6',color:'#374151',padding:'0.25rem 0.65rem',borderRadius:'100px',fontSize:'0.8rem',border:'1px solid #E5E7EB'}}>{el}</span> })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:'2rem',paddingTop:'1.25rem',borderTop:'1px solid #E2DDD6',textAlign:'center'}}>
          <p style={{fontSize:'0.75rem',color:'#6B6760'}}>Generado con <strong style={{color:'#2D5A3D'}}>BitácoraPro</strong> — Gestión de postventa inmobiliaria</p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={function() { setLightbox(null) }} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={lightbox.images[lightbox.index].filename} alt="" onClick={function(e) { e.stopPropagation() }} style={{maxWidth:'92vw',maxHeight:'85vh',objectFit:'contain',borderRadius:'8px'}} />
          {lightbox.images.length > 1 && <>
            <button onClick={function(e) { e.stopPropagation(); setLightbox(function(lb) { return { images: lb.images, index: (lb.index - 1 + lb.images.length) % lb.images.length } }) }} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer'}}>‹</button>
            <button onClick={function(e) { e.stopPropagation(); setLightbox(function(lb) { return { images: lb.images, index: (lb.index + 1) % lb.images.length } }) }} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer'}}>›</button>
          </>}
          <button onClick={function() { setLightbox(null) }} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.1rem',width:'36px',height:'36px',borderRadius:'50%',cursor:'pointer'}}>✕</button>
        </div>
      )}
    </div>
  )
}

function App() {
  // Auth
  var [token, setToken] = useState(function() {
  return localStorage.getItem('bpro_token') || null
  })
  var [currentUser, setCurrentUser] = useState(null)

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

  // Editar propiedad
  var [editingProperty, setEditingProperty] = useState(null)
  var [editPropForm, setEditPropForm] = useState({})

  // Editar hallazgo
  var [editingEntry, setEditingEntry] = useState(null)
  var [editEntryForm, setEditEntryForm] = useState({})

  // Acta de entrega
  var [deliveryAct, setDeliveryAct] = useState(null)
  var deliveryActRef = useRef(null)
  var entriesRef = useRef([])
  // Sync deliveryActRef with deliveryAct so useCallback closures stay fresh
  useEffect(function() { deliveryActRef.current = deliveryAct }, [deliveryAct])
  useEffect(function() { entriesRef.current = entries }, [entries])
  var [showAct, setShowAct] = useState(false)
  var [actToast, setActToast] = useState('')
  var [actFormData, setActFormData] = useState(null)
  var [cameFromAct, setCameFromAct] = useState(false)
  var stableSetActFormData = useCallback(function(val) { setActFormData(val) }, [])

  // Lightbox
  var [lightbox, setLightbox] = useState(null)

  var openLightbox = function(images, index) { setLightbox({ images: images, index: index }) }
  var closeLightbox = function() { setLightbox(null) }
  var lightboxPrev = function() { setLightbox(function(lb) { return { images: lb.images, index: (lb.index - 1 + lb.images.length) % lb.images.length } }) }
  var lightboxNext = function() { setLightbox(function(lb) { return { images: lb.images, index: (lb.index + 1) % lb.images.length } }) }

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

  var authFetch = function(url, options) {
    var opts = options || {}
    var headers = opts.headers || {}
    headers['Authorization'] = 'Bearer ' + token
    opts.headers = headers
    return fetch(url, opts)
  }

var handleLogin = function(newToken, user) {
    setToken(newToken)
    localStorage.setItem('bpro_token', newToken)
    setCurrentUser(user)
    setTimeout(function() { scrollToTop() }, 50)
}

  var handleLogout = function() {
    setToken(null)
    localStorage.removeItem('bpro_token')
    setCurrentUser(null)
    setProjects([])
    setCurrentProject(null)
    setProperties([])
    setCurrentProperty(null)
    setEntries([])
  }

  // Rehidratar usuario desde /auth/me si hay token pero no hay currentUser (ej: refresh)
  useEffect(function() {
    if (!token || currentUser) return
    authFetch(API_URL + '/auth/me')
      .then(function(r) {
        if (r.status === 401) { handleLogout(); return null }
        return r.json()
      })
      .then(function(data) { if (data) setCurrentUser(data) })
      .catch(console.error)
  }, [token])

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
      loadDeliveryAct(currentProperty.id)
    } else { setEntries([]); setDeliveryAct(null) }
  }, [currentProperty])

  // Project handlers
  var handleCreateProject = function(onSuccess) {
    if (!newProjectName.trim()) return
    authFetch(API_URL + '/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newProjectName.trim() }) })
      .then(function(r) { return r.json() })
      .then(function(p) {
        setProjects(function(prev) { return [p].concat(prev) })
        setCurrentProject(p)
        setNewProjectName('')
        setShowNewProject(false)
        if (onSuccess) onSuccess(p)
      })
  }

  var handleDeleteProject = function(id, onDeleted) {
    if (!window.confirm('Eliminar este proyecto y todo su contenido?')) return
    authFetch(API_URL + '/projects/' + id, { method: 'DELETE' }).then(function() {
      setProjects(function(prev) { return prev.filter(function(p) { return p.id !== id }) })
      if (currentProject && currentProject.id === id) { setCurrentProject(null) }
      if (onDeleted) onDeleted()
    })
  }

  // Property handlers
  var handleCreateProperty = function() {
    if (!propForm.unit_number.trim()) { alert('El numero de propiedad es requerido'); return }
    authFetch(API_URL + '/projects/' + currentProject.id + '/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(propForm) })
      .then(function(r) { return r.json() })
      .then(function(p) { setProperties(function(prev) { return prev.concat([p]) }); setPropForm({ unit_number: '', owner_name: '', owner_rut: '', owner_email: '', owner_phone: '' }); setShowNewProperty(false) })
  }

  var loadDeliveryAct = useCallback(async function(propertyId) {
    try {
      var r = await authFetch(API_URL + '/properties/' + propertyId + '/delivery-act')
      var data = await r.json()
      setDeliveryAct(data)
    } catch(e) { console.error(e) }
  }, [])

  var saveDeliveryAct = useCallback(async function(propertyId, updates, signNow, entriesSnapshot) {
    try {
      var existing = deliveryActRef.current
      var method = existing ? 'PUT' : 'POST'
      var url = API_URL + '/properties/' + propertyId + '/delivery-act'
      var body = existing
        ? Object.assign({}, updates, signNow ? { sign_now: true } : {}, entriesSnapshot ? { entries_snapshot: entriesSnapshot } : {})
        : { data: updates.data || {} }
      var r = await authFetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      var data = await r.json()
      setDeliveryAct(data)
      return data
    } catch(e) { console.error(e); return null }
  }, [])

    var handleCopyPropertyLink = async function(propertyId) {
    try {
      var r = await authFetch(API_URL + '/properties/' + propertyId + '/public-token')
      var data = await r.json()
      if (data.token) {
        var url = window.location.origin + '/p/' + data.token
        navigator.clipboard.writeText(url).then(function() {
          alert('✅ Link copiado al portapapeles')
        }).catch(function() {
          prompt('Copia este link:', url)
        })
      }
    } catch(e) { alert('Error al obtener el link') }
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
        // Si venimos del acta, volver al acta con toast
        if (cameFromAct) {
          setCameFromAct(false)
          setShowAct(true)
          setActToast('✅ Hallazgo registrado')
          setTimeout(function() { setActToast('') }, 2500)
        }
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

  var handleUpdateEntryStatus = function(entryId, newStatus) {
    var entry = entries.find(function(e) { return e.id === entryId })
    if (!entry) return
    authFetch(API_URL + '/entries/' + entryId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: entry.title || '',
        description: entry.description || '',
        recommendation: entry.recommendation || '',
        category: entry.category || 'otro',
        severity: entry.severity || 'leve',
        location: entry.location || '',
        status: newStatus
      })
    })
      .then(function(r) { return r.json() })
      .then(function(updated) {
        setEntries(function(prev) { return prev.map(function(e) { return e.id === updated.id ? Object.assign({}, e, { status: updated.status }) : e }) })
      })
      .catch(function() { alert('Error al actualizar estado') })
  }

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

  // === PROPS COMUNES PARA AppInterior ===
  var interiorProps = {
    token, currentUser, setCurrentUser, handleLogout,
    projects, setProjects, currentProject, setCurrentProject,
    properties, setProperties, currentProperty, setCurrentProperty,
    entries, setEntries,
    showForm, setShowForm, isAnalyzing, setIsAnalyzing,
    showTeam, setShowTeam, team, setTeam,
    inviteEmail, setInviteEmail, inviteLoading, setInviteLoading, inviteMsg, setInviteMsg,
    newProjectName, setNewProjectName, showNewProject, setShowNewProject,
    showNewProperty, setShowNewProperty, propForm, setPropForm,
    description, setDescription, imageFiles, setImageFiles,
    imagePreviews, setImagePreviews, isRecording, setIsRecording,
    editingProperty, setEditingProperty, editPropForm, setEditPropForm,
    editingEntry, setEditingEntry, editEntryForm, setEditEntryForm,
    lightbox, setLightbox,
    handleCreateProject, handleDeleteProject,
    handleCreateProperty, handleDeleteProperty, handleCopyPropertyLink,
    deliveryAct, setDeliveryAct, showAct, setShowAct, actToast, setActToast,
    actFormData, setActFormData: stableSetActFormData,
    cameFromAct, setCameFromAct,
    loadDeliveryAct, saveDeliveryAct,
    deliveryActRef, entriesRef,
    handleImageUpload, removeImage, toggleRecording,
    handleSubmit, handleDeleteEntry,
    handleSaveProperty, handleSaveEntry, handleUpdateEntryStatus,
    loadTeam, handleOpenTeam, handleInvite, handleRemoveMember, handleCancelInvite,
    openLightbox, closeLightbox, lightboxPrev, lightboxNext,
    fileInputRef, recognitionRef,
    authFetch
  }

  // === RUTAS ===
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={token ? <Navigate to="/proyectos" replace /> : <LoginScreen onLogin={handleLogin} />} />
        <Route path="/invitacion/:token" element={token ? <Navigate to="/proyectos" replace /> : <InviteRegisterScreen onLogin={handleLogin} />} />
        <Route path="/admin" element={<AdminScreen />} />
        <Route path="/h/:entryId" element={<PublicEntryScreen />} />
        <Route path="/p/:token" element={<PublicPropertyScreen />} />
        <Route path="/reset-password/:token" element={<ResetPasswordScreen onLogin={handleLogin} />} />
        <Route path="/proyectos" element={<AppInterior {...interiorProps} vista="proyectos" />} />
        <Route path="/proyectos/:projectId" element={<AppInterior {...interiorProps} vista="propiedades" />} />
        <Route path="/proyectos/:projectId/propiedades/:propertyId" element={<AppInterior {...interiorProps} vista="hallazgos" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// === COMPONENTE INTERIOR DE LA APP (fuera de App para evitar re-montaje) ===
function AppInterior(props) {
  var navigate = useNavigate()
  var params = useParams()
  var vista = props.vista  // 'proyectos' | 'propiedades' | 'hallazgos'

  var token = props.token
  var authFetch = props.authFetch
  var currentUser = props.currentUser
  var setCurrentUser = props.setCurrentUser
  var handleLogout = props.handleLogout
  var projects = props.projects
  var setProjects = props.setProjects
  var currentProject = props.currentProject
  var setCurrentProject = props.setCurrentProject
  var properties = props.properties
  var setProperties = props.setProperties
  var currentProperty = props.currentProperty
  var setCurrentProperty = props.setCurrentProperty
  var entries = props.entries
  var setEntries = props.setEntries
  var showForm = props.showForm
  var setShowForm = props.setShowForm
  var isAnalyzing = props.isAnalyzing
  var showTeam = props.showTeam
  var setShowTeam = props.setShowTeam
  var team = props.team
  var inviteEmail = props.inviteEmail
  var setInviteEmail = props.setInviteEmail
  var inviteLoading = props.inviteLoading
  var inviteMsg = props.inviteMsg
  var setInviteMsg = props.setInviteMsg
  var newProjectName = props.newProjectName
  var setNewProjectName = props.setNewProjectName
  var showNewProject = props.showNewProject
  var setShowNewProject = props.setShowNewProject
  var showNewProperty = props.showNewProperty
  var setShowNewProperty = props.setShowNewProperty
  var propForm = props.propForm
  var setPropForm = props.setPropForm
  var description = props.description
  var setDescription = props.setDescription
  var imageFiles = props.imageFiles
  var imagePreviews = props.imagePreviews
  var isRecording = props.isRecording
  var editingProperty = props.editingProperty
  var setEditingProperty = props.setEditingProperty
  var editPropForm = props.editPropForm
  var setEditPropForm = props.setEditPropForm
  var editingEntry = props.editingEntry
  var setEditingEntry = props.setEditingEntry
  var editEntryForm = props.editEntryForm
  var setEditEntryForm = props.setEditEntryForm
  var lightbox = props.lightbox
  var handleCreateProject = props.handleCreateProject
  var handleDeleteProject = props.handleDeleteProject
  var handleCreateProperty = props.handleCreateProperty
  var handleDeleteProperty = props.handleDeleteProperty
  var handleCopyPropertyLink = props.handleCopyPropertyLink
  var deliveryAct = props.deliveryAct
  var setDeliveryAct = props.setDeliveryAct
  var showAct = props.showAct
  var setShowAct = props.setShowAct
  var actToast = props.actToast
  var setActToast = props.setActToast
  var actFormData = props.actFormData
  var setActFormData = props.setActFormData
  var cameFromAct = props.cameFromAct
  var setCameFromAct = props.setCameFromAct
  var loadDeliveryAct = props.loadDeliveryAct
  var saveDeliveryAct = props.saveDeliveryAct
  var deliveryActRef = props.deliveryActRef
  var entriesRef = props.entriesRef
  var handleImageUpload = props.handleImageUpload
  var removeImage = props.removeImage
  var toggleRecording = props.toggleRecording
  var handleSubmit = props.handleSubmit
  var handleDeleteEntry = props.handleDeleteEntry
  var handleSaveProperty = props.handleSaveProperty
  var handleSaveEntry = props.handleSaveEntry
  var handleUpdateEntryStatus = props.handleUpdateEntryStatus
  var handleOpenTeam = props.handleOpenTeam
  var handleInvite = props.handleInvite
  var handleRemoveMember = props.handleRemoveMember
  var handleCancelInvite = props.handleCancelInvite
  var openLightbox = props.openLightbox
  var closeLightbox = props.closeLightbox
  var lightboxPrev = props.lightboxPrev
  var lightboxNext = props.lightboxNext
  var fileInputRef = props.fileInputRef

  // Cuando se accede a /proyectos/:projectId directamente (ej: refresh o link compartido),
  // cargar el proyecto desde la API si aún no está en estado
  useEffect(function() {
    if (!token) return
    if (vista === 'propiedades' || vista === 'hallazgos') {
      var projectId = parseInt(params.projectId)
      if (!currentProject || currentProject.id !== projectId) {
        authFetch(API_URL + '/projects').then(function(r) { return r.json() }).then(function(list) {
          var found = list.find(function(p) { return p.id === projectId })
          if (found) { setCurrentProject(found); setProjects(list) }
          else navigate('/proyectos', { replace: true })
        }).catch(function() { navigate('/proyectos', { replace: true }) })
      }
    }
  }, [params.projectId, token])

  // Cuando se accede a /proyectos/:projectId/propiedades/:propertyId directamente,
  // cargar la propiedad desde la API si aún no está en estado
  useEffect(function() {
    if (!token) return
    if (vista === 'hallazgos') {
      var propertyId = parseInt(params.propertyId)
      if (!currentProperty || currentProperty.id !== propertyId) {
        if (currentProject) {
          authFetch(API_URL + '/projects/' + currentProject.id + '/properties').then(function(r) { return r.json() }).then(function(list) {
            var found = list.find(function(p) { return p.id === propertyId })
            if (found) { setProperties(list); setCurrentProperty(found) }
            else navigate('/proyectos/' + currentProject.id, { replace: true })
          }).catch(function() { navigate('/proyectos', { replace: true }) })
        }
      }
    }
  }, [params.propertyId, currentProject, token])

  // Scroll al tope en cada cambio de vista
  useLayoutEffect(function() {
    scrollToTop()
  }, [vista, params.projectId, params.propertyId])



  // Si no hay token, redirigir a login
  if (!token) return <Navigate to="/login" replace />

  // Primer login — forzar cambio de contraseña antes de entrar
  if (currentUser && currentUser.must_change_password) {
    return <ChangePasswordScreen token={token} user={currentUser} onDone={function() { setCurrentUser(Object.assign({}, currentUser, { must_change_password: false })) }} />
  }

  var handleLogoutAndRedirect = function() {
    handleLogout()
    navigate('/')
  }

  // Navegación con URL
  var goToProject = function(project) {
    setCurrentProject(project)
    setShowTeam(false)
    navigate('/proyectos/' + project.id)
  }

  var goToProperty = function(prop) {
    setCurrentProperty(prop)
    navigate('/proyectos/' + currentProject.id + '/propiedades/' + prop.id)
  }

  var goBackToProjects = function() {
    setCurrentProject(null)
    setShowTeam(false)
    navigate('/proyectos')
  }

  var goBackToProperties = function() {
    setCurrentProperty(null)
    setShowForm(false)
    navigate('/proyectos/' + currentProject.id)
  }

  // Callbacks estables para DeliveryActScreen (evitan re-mount)
  var stableOnCloseAct = useCallback(function() { setShowAct(false) }, [])
  var stableOnRegisterEntry = useCallback(function() { setCameFromAct(true); setShowAct(false); setShowForm(true) }, [])
  var stableSetActFormData = useCallback(function(val) { setActFormData(val) }, [])
  var stableSetActToast = useCallback(function(val) { setActToast(val) }, [])

    // === VISTA 1: PROYECTOS ===
    if (vista === 'proyectos') {
      return (
        <div className="app">
          <header className="header">
            <div className="header-content">
              <div className="header-row-top">
                <div className="header-title">
                  <span className="header-icon">📋</span>
                  <div><h1>BitácoraPro</h1><p className="header-subtitle">{currentUser && currentUser.company_name}</p></div>
                </div>
                <div className="header-info">
                  <span className="user-name">👤 {currentUser && currentUser.name}</span>
                  <button className="logout-button" onClick={handleLogoutAndRedirect}>Cerrar sesión</button>
                </div>
              </div>
            </div>
          </header>
          <main className="main" id="app-scroll">
            <h2 className="section-title">Mis Proyectos</h2>
            {currentUser && currentUser.role === 'admin' && (
              !showNewProject ? (
                <button className="add-button" onClick={function() { setShowNewProject(true) }}>+ Nuevo Proyecto</button>
              ) : (
                <div className="new-project-form">
                  <input type="text" placeholder="Nombre del proyecto..." value={newProjectName} onChange={function(e) { setNewProjectName(e.target.value) }} className="text-input" autoFocus onKeyDown={function(e) { if (e.key === 'Enter') handleCreateProject(function(p) { navigate('/proyectos/' + p.id) }) }} />
                  <div className="new-project-actions">
                    <button className="submit-button" onClick={function() { handleCreateProject(function(p) { navigate('/proyectos/' + p.id) }) }}>Crear Proyecto</button>
                    <button className="cancel-button" onClick={function() { setShowNewProject(false); setNewProjectName('') }}>Cancelar</button>
                  </div>
                </div>
              )
            )}
            {projects.length === 0 && !showNewProject && (
              <div className="welcome-message"><h2>👋 Bienvenido, {currentUser && currentUser.name}</h2><p>Crea tu primer proyecto para comenzar.</p></div>
            )}
            <div className="projects-grid">
              {projects.map(function(project) {
                return (
                  <div key={project.id} className="project-card">
                    <div className="project-card-content" onClick={function() { goToProject(project) }}>
                      <h3>📁 {project.name}</h3>
                      <p className="project-date">{project.property_count || 0} propiedades | Creado: {new Date(project.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    {currentUser && currentUser.role === 'admin' && (
                      <button className="delete-project-button" onClick={function(e) { e.stopPropagation(); handleDeleteProject(project.id) }}>🗑</button>
                    )}
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      )
    }

    // Pantalla de carga — esperar que se hidrate currentProject desde la URL
    if (!currentProject) {
      return <div className="app"><main className="main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><p style={{color:'#6B6760'}}>Cargando...</p></main></div>
    }

    // === VISTA 2: PROPIEDADES ===
    if (vista === 'propiedades') {
      return (
        <div className="app">
          <header className="header">
            <div className="header-content">
              <div className="header-row-top">
                <div className="header-title">
                  <span className="header-icon">📋</span>
                  <div><h1>BitácoraPro</h1></div>
                </div>
                <div className="header-info">
                  {currentUser && currentUser.role === 'admin' && (
                    <button className="back-button" onClick={handleOpenTeam} style={{background:'#EAF1EC',color:'#2D5A3D',border:'1px solid #c5deca'}}>👥 Equipo</button>
                  )}
                  <button className="logout-button" onClick={handleLogoutAndRedirect}>Cerrar sesión</button>
                </div>
              </div>
              <div className="header-row-nav">
                <button className="back-button" onClick={goBackToProjects}>← Proyectos</button>
                <div className="project-name-display">{currentProject.name}</div>
              </div>
            </div>
          </header>
          <main className="main" id="app-scroll">

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
                    <input type="email" inputMode="email" className="text-input" placeholder="inspector@empresa.com" value={inviteEmail} onChange={function(e) { setInviteEmail(e.target.value) }} onKeyDown={function(e) { if(e.key==='Enter') handleInvite() }} style={{flex:1}} />
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
                  <input type="text" inputMode="text" placeholder="Ej: Casa 471, Depto 301..." value={propForm.unit_number} onChange={function(e) { setPropForm(Object.assign({}, propForm, { unit_number: e.target.value })) }} className="text-input" />
                </div>
                <div className="form-field">
                  <label>👤 Nombre del propietario</label>
                  <input type="text" placeholder="Nombre completo..." value={propForm.owner_name} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_name: e.target.value })) }} className="text-input" />
                </div>
                <div className="form-field">
                  <label>🪪 RUT</label>
                  <input type="text" inputMode="numeric" placeholder="12.345.678-9" value={propForm.owner_rut} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_rut: e.target.value })) }} className="text-input" />
                </div>
                <div className="form-row">
                  <div className="form-field form-field-half">
                    <label>📧 Correo electronico</label>
                    <input type="email" inputMode="email" placeholder="correo@ejemplo.com" value={propForm.owner_email} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_email: e.target.value })) }} className="text-input" />
                  </div>
                  <div className="form-field form-field-half">
                    <label>📱 Telefono</label>
                    <input type="tel" inputMode="tel" placeholder="+56 9 1234 5678" value={propForm.owner_phone} onChange={function(e) { setPropForm(Object.assign({}, propForm, { owner_phone: e.target.value })) }} className="text-input" />
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
                if (editingProperty && editingProperty.id === prop.id) {
                  return (
                    <div key={prop.id} className="form-card" style={{marginBottom:'0'}}>
                      <div className="form-header">
                        <h3>✏️ Editar propiedad</h3>
                        <button className="close-button" onClick={function() { setEditingProperty(null) }}>X</button>
                      </div>
                      <div className="form-field">
                        <label>🏠 Número / Identificador *</label>
                        <input type="text" inputMode="text" className="text-input" value={editPropForm.unit_number} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { unit_number: e.target.value })) }} />
                      </div>
                      <div className="form-field">
                        <label>👤 Nombre del propietario</label>
                        <input type="text" className="text-input" value={editPropForm.owner_name} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_name: e.target.value })) }} />
                      </div>
                      <div className="form-field">
                        <label>🪪 RUT</label>
                        <input type="text" inputMode="numeric" className="text-input" value={editPropForm.owner_rut} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_rut: e.target.value })) }} />
                      </div>
                      <div className="form-row">
                        <div className="form-field form-field-half">
                          <label>📧 Correo</label>
                          <input type="email" inputMode="email" className="text-input" value={editPropForm.owner_email} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_email: e.target.value })) }} />
                        </div>
                        <div className="form-field form-field-half">
                          <label>📱 Teléfono</label>
                          <input type="tel" inputMode="tel" className="text-input" value={editPropForm.owner_phone} onChange={function(e) { setEditPropForm(Object.assign({}, editPropForm, { owner_phone: e.target.value })) }} />
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
                    <div className="project-card-content" onClick={function() { goToProperty(prop) }}>
                      <h3>🏠 {prop.unit_number}</h3>
                      <p className="property-owner">{prop.owner_name || 'Sin propietario asignado'}</p>
                      <p className="project-date">{prop.entry_count || 0} hallazgos | {prop.owner_email || ''} {prop.owner_phone ? '| ' + prop.owner_phone : ''}</p>
                    </div>
                    <button className="delete-project-button" title="Compartir vista propietario" onClick={function(e) { e.stopPropagation(); handleCopyPropertyLink(prop.id) }}>🔗</button>
                    <button className="delete-project-button" title="Editar" onClick={function(e) { e.stopPropagation(); setEditingProperty(prop); setEditPropForm({ unit_number: prop.unit_number || '', owner_name: prop.owner_name || '', owner_rut: prop.owner_rut || '', owner_email: prop.owner_email || '', owner_phone: prop.owner_phone || '' }) }}>✏️</button>
                    {currentUser && currentUser.role === 'admin' && (
                      <button className="delete-project-button" onClick={function(e) { e.stopPropagation(); handleDeleteProperty(prop.id) }}>🗑</button>
                    )}
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      )
    }

    // Pantalla de carga — esperar que se hidrate currentProperty desde la URL
    if (!currentProperty) {
      return <div className="app"><main className="main" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh'}}><p style={{color:'#6B6760'}}>Cargando...</p></main></div>
    }

    // === VISTA 3: HALLAZGOS ===

    // useEffect para abrir form de hallazgo desde el acta
    // eslint-disable-next-line react-hooks/exhaustive-deps

    return (
      <div className="app">
        {/* ACTA DE ENTREGA — fullscreen overlay */}
        {showAct && (
          <DeliveryActScreen
            property={currentProperty}
            project={currentProject}
            currentUser={currentUser}
            deliveryActRef={deliveryActRef}
            saveDeliveryAct={saveDeliveryAct}
            entriesRef={entriesRef}
            entriesCount={entries.length}
            onClose={stableOnCloseAct}
            onRegisterEntry={stableOnRegisterEntry}
            actFormData={actFormData}
            setActFormData={stableSetActFormData}
            setActToast={stableSetActToast}
            authFetch={authFetch}
          />
        )}
        <header className="header">
          <div className="header-content">
            <div className="header-row-top">
              <div className="header-title">
                <span className="header-icon">📋</span>
                <div><h1>BitácoraPro</h1></div>
              </div>
              <div className="header-info">
                <div className="entry-count">{entries.length} hallazgo{entries.length !== 1 ? 's' : ''}</div>
                <button className="logout-button" onClick={handleLogoutAndRedirect}>Cerrar sesión</button>
              </div>
            </div>
            <div className="header-row-nav">
              <button className="back-button" onClick={goBackToProperties}>← Propiedades</button>
              <div className="project-name-display">{currentProperty.unit_number}{currentProperty.owner_name ? ' — ' + currentProperty.owner_name : ''}</div>
            </div>
          </div>
        </header>
        <main className="main" id="app-scroll">
          {/* TOAST ACTA */}
          {actToast && (
            <div style={{position:'fixed',top:'1rem',left:'50%',transform:'translateX(-50%)',zIndex:500,background:'#1A1814',color:'#fff',padding:'0.6rem 1.25rem',borderRadius:'100px',fontSize:'0.875rem',fontWeight:'500',boxShadow:'0 4px 16px rgba(0,0,0,0.2)',pointerEvents:'none'}}>
              {actToast}
            </div>
          )}

          {/* BOTÓN INICIAR ACTA — solo si no hay acta firmada ni en progreso */}
          {!deliveryAct && !showAct && !showForm && (
            <div style={{marginBottom:'0.75rem'}}>
              <button onClick={function() { setShowAct(true) }} style={{width:'100%',padding:'0.75rem',background:'#F7F5F0',border:'1.5px dashed #C0BBB5',borderRadius:'10px',color:'#6B6760',fontSize:'0.875rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
                📋 Iniciar acta de entrega
              </button>
            </div>
          )}

          {/* BADGE ACTA FIRMADA */}
          {deliveryAct && deliveryAct.signed_at && !showAct && !showForm && (
            <div style={{marginBottom:'0.75rem'}}>
              <button onClick={function() { setShowAct(true) }} style={{width:'100%',padding:'0.75rem 1rem',background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:'10px',color:'#166534',fontSize:'0.875rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span>✅</span>
                  <span style={{fontWeight:'500'}}>Acta firmada</span>
                  <span style={{color:'#6B6760',fontWeight:'400'}}>· {new Date(deliveryAct.signed_at).toLocaleDateString('es-CL', {day:'2-digit',month:'short',year:'numeric'})}</span>
                </span>
                <span style={{fontSize:'0.75rem',color:'#2D5A3D'}}>Ver →</span>
              </button>
            </div>
          )}

          {/* ACTA EN PROGRESO — badge */}
          {deliveryAct && !deliveryAct.signed_at && !showAct && !showForm && (
            <div style={{marginBottom:'0.75rem'}}>
              <button onClick={function() { setShowAct(true) }} style={{width:'100%',padding:'0.75rem 1rem',background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:'10px',color:'#92400E',fontSize:'0.875rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <span style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                  <span>📋</span>
                  <span style={{fontWeight:'500'}}>Acta en progreso</span>
                </span>
                <span style={{fontSize:'0.75rem'}}>Continuar →</span>
              </button>
            </div>
          )}

          <div className="action-buttons">
            {!showForm && !showAct && <button className="add-button" onClick={function() { setShowForm(true) }}>+ Nuevo Hallazgo</button>}
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

                if (editingEntry === entry.id) {
                  return (
                    <div key={entry.id} className="form-card" style={{marginBottom:'0.875rem'}}>
                      <div className="form-header">
                        <h3>✏️ Editar hallazgo</h3>
                        <button className="close-button" onClick={function() { setEditingEntry(null) }}>X</button>
                      </div>
                      <div className="form-field">
                        <label>Título</label>
                        <input type="text" inputMode="text" className="text-input" value={editEntryForm.title || ''} onChange={function(e) { setEditEntryForm(Object.assign({}, editEntryForm, { title: e.target.value })) }} />
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
                      <button className="delete-button" style={{position:'static', opacity:0.35}} title="Copiar link" onClick={function() {
                        var url = window.location.origin + '/h/' + entry.id
                        navigator.clipboard.writeText(url).then(function() {
                          alert('✅ Link copiado al portapapeles')
                        }).catch(function() {
                          prompt('Copia este link:', url)
                        })
                      }}>🔗</button>
                      <button className="delete-button" style={{position:'static', opacity:0.35}} title="Editar" onClick={function() { setEditingEntry(entry.id); setEditEntryForm({ title: entry.title || '', category: entry.category || 'otro', severity: entry.severity || 'leve', location: entry.location || '', description: entry.description || '', recommendation: entry.recommendation || '' }) }}>✏️</button>
                      {currentUser && currentUser.role === 'admin' && (
                        <button className="delete-button" style={{position:'static', opacity:0.25}} onClick={function() { handleDeleteEntry(entry.id) }}>🗑</button>
                      )}
                    </div>
                    <div className="entry-tags">
                      <span className="tag category-tag" style={{ background: cat.color + '18', color: cat.color, border: '1px solid ' + cat.color + '33' }}>{cat.icon} {cat.label}</span>
                      <span className="tag severity-tag" style={{ background: sev.bg, color: sev.color, border: '1px solid ' + sev.color + '33' }}>{sev.label}</span>
                      {entry.ai_generated === 1 && <span className="tag ai-tag">🤖 IA</span>}
                    </div>
                    {/* SELECTOR DE ESTADO */}
                    {(function() {
                      var entryStatus = entry.status || 'pendiente'
                      var st = STATUSES[entryStatus] || STATUSES.pendiente
                      return (
                        <div className="entry-status-row">
                          <span className="entry-status-label">Estado:</span>
                          <div className="entry-status-buttons">
                            {Object.entries(STATUSES).map(function(pair) {
                              var key = pair[0]
                              var val = pair[1]
                              var isActive = entryStatus === key
                              return (
                                <button
                                  key={key}
                                  className={'entry-status-btn' + (isActive ? ' active' : '')}
                                  style={isActive ? { background: val.bg, color: val.color, border: '1.5px solid ' + val.color + '55', fontWeight: '600' } : {}}
                                  onClick={function() { if (!isActive) handleUpdateEntryStatus(entry.id, key) }}
                                >{val.icon} {val.label}</button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
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
            <img
              src={lightbox.images[lightbox.index].filename}
              alt=""
              onClick={function(e) { e.stopPropagation() }}
              style={{maxWidth:'92vw',maxHeight:'85vh',objectFit:'contain',borderRadius:'8px',boxShadow:'0 8px 40px rgba(0,0,0,0.5)'}}
            />
            {lightbox.images.length > 1 && (
              <button onClick={function(e) { e.stopPropagation(); lightboxPrev() }} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            )}
            {lightbox.images.length > 1 && (
              <button onClick={function(e) { e.stopPropagation(); lightboxNext() }} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
            )}
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

var ACT_SI_NO_NA = ['', 'si', 'no', 'na']
var ACT_CONF_LABELS = { '': '\u2014', 'si': 'S\u00ed', 'no': 'No', 'na': 'N/A' }

function ActSection({ title, children }) {
  return (
    <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2DDD6',marginBottom:'1rem',overflow:'hidden'}}>
      <div style={{padding:'0.875rem 1.25rem',borderBottom:'1px solid #F3F0EB',background:'#FAFAF9'}}>
        <h3 style={{margin:0,fontSize:'0.875rem',fontWeight:'700',color:'#1A1814'}}>{title}</h3>
      </div>
      <div style={{padding:'0 1.25rem'}}>{children}</div>
    </div>
  )
}

function ActSigCanvas({ value, onChange, label, disabled }) {
  var canvasRef = React.useRef(null)
  var drawing = React.useRef(false)
  var [hasDrawn, setHasDrawn] = React.useState(!!value)
  React.useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    var ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    ctx.strokeStyle = '#1A1814'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    if (value) { var img = new Image(); img.onload = function() { ctx.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight) }; img.src = value }
  }, [])
  function getPos(e, c) { var r = c.getBoundingClientRect(); var cx = e.touches ? e.touches[0].clientX : e.clientX; var cy = e.touches ? e.touches[0].clientY : e.clientY; return { x: cx-r.left, y: cy-r.top } }
  function startDraw(e) { if (disabled) return; e.preventDefault(); drawing.current = true; var c = canvasRef.current; var ctx = c.getContext('2d'); var p = getPos(e,c); ctx.beginPath(); ctx.moveTo(p.x,p.y) }
  function draw(e) { if (!drawing.current||disabled) return; e.preventDefault(); var c = canvasRef.current; var ctx = c.getContext('2d'); var p = getPos(e,c); ctx.lineTo(p.x,p.y); ctx.stroke(); setHasDrawn(true) }
  function endDraw() { if (!drawing.current) return; drawing.current = false; onChange(canvasRef.current.toDataURL('image/png')) }
  function clearSig() { var c = canvasRef.current; c.getContext('2d').clearRect(0,0,c.width,c.height); setHasDrawn(false); onChange(null) }
  return (
    <div style={{marginBottom:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.4rem'}}>
        <label style={{fontSize:'0.8rem',fontWeight:'600',color:'#6B6760'}}>{label}</label>
        {hasDrawn && !disabled && <button onClick={clearSig} style={{background:'none',border:'none',color:'#B91C1C',fontSize:'0.75rem',cursor:'pointer',padding:0}}>Borrar</button>}
      </div>
      <canvas ref={canvasRef}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        style={{width:'100%',height:'100px',border:'1.5px solid '+(hasDrawn?'#2D5A3D':'#E2DDD6'),borderRadius:'8px',background:'#FAFAF9',cursor:disabled?'default':'crosshair',display:'block',touchAction:'none'}} />
      {!hasDrawn && !disabled && <p style={{fontSize:'0.72rem',color:'#C0BBB5',marginTop:'0.25rem',textAlign:'center'}}>Firma aqu\u00ed con el dedo</p>}
    </div>
  )
}

function ActTriToggle({ field, options, labels, form, set, isSigned }) {
  var opts = options || ACT_SI_NO_NA
  var lbls = labels || ACT_CONF_LABELS
  var val = form[field] || ''
  return (
    <div style={{display:'flex',gap:'0.35rem'}}>
      {opts.filter(function(o) { return o !== '' }).map(function(opt) {
        var active = val === opt
        var colors = { si: {bg:'#F0FDF4',border:'#22C55E',text:'#166534'}, no: {bg:'#FEF2F2',border:'#FCA5A5',text:'#991B1B'}, na: {bg:'#F3F4F6',border:'#D1D5DB',text:'#6B7280'} }
        var c = active ? colors[opt] : { bg:'#fff', border:'#E2DDD6', text:'#6B6760' }
        return (
          <button key={opt} disabled={!!isSigned} onClick={function() { set(field)({ target: { value: active ? '' : opt } }) }}
            style={{padding:'0.2rem 0.6rem',borderRadius:'6px',border:'1.5px solid '+c.border,background:c.bg,color:c.text,fontSize:'0.72rem',fontWeight:'600',cursor:isSigned?'default':'pointer',opacity:isSigned&&!active?0.4:1}}>
            {lbls[opt]}
          </button>
        )
      })}
    </div>
  )
}

function ActRow({ label, field, options, labels, form, set, isSigned }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.6rem 0',borderBottom:'1px solid #F3F0EB'}}>
      <span style={{fontSize:'0.875rem',color:'#1A1814',flex:1,paddingRight:'0.5rem'}}>{label}</span>
      <ActTriToggle field={field} options={options} labels={labels} form={form} set={set} isSigned={isSigned} />
    </div>
  )
}

var DeliveryActScreen = React.memo(function DeliveryActScreen({ property, project, currentUser, deliveryActRef, saveDeliveryAct, entriesRef, entriesCount, onClose, setActToast, authFetch, onRegisterEntry, actFormData, setActFormData }) {
  var deliveryAct = deliveryActRef.current
  var entries = entriesRef.current
  var ownerSigRef = React.useRef(null)
  var inspectorSigRef = React.useRef(null)
  var [ownerSigData, setOwnerSigData] = React.useState(deliveryAct && deliveryAct.signature_owner ? deliveryAct.signature_owner : null)
  var [inspectorSigData, setInspectorSigData] = React.useState(deliveryAct && deliveryAct.signature_inspector ? deliveryAct.signature_inspector : null)
  var [saving, setSaving] = React.useState(false)
  var [signing, setSigning] = React.useState(false)
  var isSigned = deliveryAct && deliveryAct.signed_at

  var defaultData = {
    inspector_nombre: (currentUser && currentUser.name) || '',
    proyecto_etapa: (project && project.name) || '',
    owner_name: property.owner_name || '',
    owner_rut: property.owner_rut || '',
    owner_email: property.owner_email || '',
    owner_phone: property.owner_phone || '',
    direccion: '', bodega: '', estacionamiento: '',
    // II. Documentación
    doc_garantia: '', doc_manual: '', doc_llaves_principal: '', doc_llaves_bodega: '',
    doc_llaves_estacionamiento: '', doc_llaves_dormitorios: '', doc_llaves_closet: '',
    doc_control_porton: '', doc_kit_accesorios: '', doc_garantias_artefactos: '',
    // III. Artefactos
    art_calefon: '', art_encimera: '', art_horno: '', art_campana: '', art_estufa: '',
    art_lavavajillas: '', art_refrigerador: '', art_lavadora: '', art_aire: '',
    art_alarma: '', art_citofono: '', art_porton: '', art_calefaccion: '',
    // IV. Medidores
    med_agua_fria_num: '', med_agua_fria_val: '',
    med_agua_caliente_num: '', med_agua_caliente_val: '',
    med_gas_num: '', med_gas_val: '',
    med_luz_num: '', med_luz_val: '',
    // V. Conformidad
    conf_horario: '', conf_documentos: '', conf_garantia: '', conf_artefactos: '',
    conf_tablero: '', conf_emergencias: '',
    // Observaciones
    observaciones: ''
  }

  // Form state local — evita re-render del padre en cada tecla
  var [form, setForm] = React.useState(function() {
    // Prioridad: actFormData (si ya se abrió antes) > deliveryAct.data > defaultData
    if (actFormData) return Object.assign({}, defaultData, actFormData)
    if (deliveryAct && deliveryAct.data) return Object.assign({}, defaultData, deliveryAct.data)
    return defaultData
  })

  var set = function(field) { return function(e) { var v = e.target.value; setForm(function(f) { return Object.assign({}, f, { [field]: v }) }) } }

  // Sincronizar hacia arriba para persistencia entre open/close (no en cada tecla)
  var saveTimeout = React.useRef(null)
  React.useEffect(function() {
    if (isSigned) return
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async function() {
      setActFormData(form)
      await saveDeliveryAct(property.id, { data: form }, false, null)
    }, 1200)
    return function() { clearTimeout(saveTimeout.current) }
  }, [form])

  var handleSign = async function() {
    if (!ownerSigData) { alert('Falta la firma del propietario'); return }
    if (!inspectorSigData) { alert('Falta la firma del inspector'); return }
    setSigning(true)
    var snapshot = entries.map(function(e) { return { id: e.id, title: e.title, category: e.category, severity: e.severity, location: e.location, status: e.status } })
    await saveDeliveryAct(property.id, {
      data: form,
      signature_owner: ownerSigData,
      signature_inspector: inspectorSigData,
      signed_by_name: property.owner_name || 'Propietario',
      entries_snapshot: snapshot
    }, true, snapshot)
    setSigning(false)
    onClose()
    setActToast('✅ Acta firmada correctamente')
    setTimeout(function() { setActToast('') }, 3000)
  }

  // Canvas de firma

  return (
    <div style={{position:'fixed',inset:0,zIndex:300,background:'#F7F5F0',overflowY:'auto',WebkitOverflowScrolling:'touch'}}>
      {/* Header */}
      <div style={{position:'sticky',top:0,zIndex:10,background:'#fff',borderBottom:'1px solid #E2DDD6',padding:'0.875rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontSize:'0.7rem',color:'#6B6760',marginBottom:'0.1rem'}}>Acta de entrega</div>
          <div style={{fontWeight:'700',fontSize:'0.95rem',color:'#1A1814'}}>{property.unit_number}{property.owner_name ? ' — ' + property.owner_name : ''}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          {isSigned && <span style={{fontSize:'0.7rem',background:'#F0FDF4',color:'#166534',border:'1px solid #BBF7D0',padding:'0.2rem 0.6rem',borderRadius:'100px',fontWeight:'600'}}>✅ Firmada</span>}
          {isSigned && (
            <button
              onClick={function() { generateActaPDF(deliveryAct, property, project && project.name) }}
              style={{fontSize:'0.75rem',background:'#1A1814',color:'#fff',border:'none',padding:'0.3rem 0.75rem',borderRadius:'100px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',gap:'0.3rem'}}>
              📄 PDF
            </button>
          )}
          {!isSigned && <span style={{fontSize:'0.7rem',background:'#FFFBEB',color:'#92400E',border:'1px solid #FDE68A',padding:'0.2rem 0.6rem',borderRadius:'100px',fontWeight:'600'}}>En progreso</span>}
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'1.1rem',cursor:'pointer',color:'#6B6760',padding:'0.25rem',lineHeight:1}}>✕</button>
        </div>
      </div>

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'1rem 1rem 6rem'}}>

        {/* I. Datos generales */}
        <ActSection title="I. Datos generales">
          <div style={{padding:'0.75rem 0'}}>
            {[
              {label:'Nombre propietario', field:'owner_name'},
              {label:'RUT', field:'owner_rut'},
              {label:'Correo', field:'owner_email'},
              {label:'Teléfono', field:'owner_phone'},
            ].map(function(item) {
              return (
                <div key={item.field} style={{marginBottom:'0.5rem'}}>
                  <label style={{fontSize:'0.72rem',fontWeight:'600',color:'#6B6760',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.25rem'}}>{item.label}</label>
                  <input disabled={!!isSigned} className="text-input" value={form[item.field] || ''} onChange={set(item.field)} style={{fontSize:'0.875rem'}} />
                </div>
              )
            })}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'0.5rem'}}>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:'600',color:'#6B6760',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.25rem'}}>Proyecto / Etapa</label>
                <input disabled={!!isSigned} className="text-input" value={form.proyecto_etapa} onChange={set('proyecto_etapa')} style={{fontSize:'0.875rem'}} />
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:'600',color:'#6B6760',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.25rem'}}>Inspector</label>
                <input disabled={!!isSigned} className="text-input" value={form.inspector_nombre} onChange={set('inspector_nombre')} style={{fontSize:'0.875rem'}} />
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:'600',color:'#6B6760',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.25rem'}}>Bodega</label>
                <input disabled={!!isSigned} className="text-input" value={form.bodega} onChange={set('bodega')} placeholder="N° bodega" style={{fontSize:'0.875rem'}} />
              </div>
              <div>
                <label style={{fontSize:'0.72rem',fontWeight:'600',color:'#6B6760',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:'0.25rem'}}>Estacionamiento</label>
                <input disabled={!!isSigned} className="text-input" value={form.estacionamiento} onChange={set('estacionamiento')} placeholder="N° estac." style={{fontSize:'0.875rem'}} />
              </div>

            </div>
          </div>
        </ActSection>

        {/* II. Documentación */}
        <ActSection title="II. Documentación entregada">
          {[
            {label:'Programa de garantía', field:'doc_garantia'},
            {label:'Manual de uso y mantención', field:'doc_manual'},
            {label:'Llaves puerta principal', field:'doc_llaves_principal'},
            {label:'Llaves bodega', field:'doc_llaves_bodega'},
            {label:'Llaves estacionamiento', field:'doc_llaves_estacionamiento'},
            {label:'Llaves dormitorios', field:'doc_llaves_dormitorios'},
            {label:'Llaves closet', field:'doc_llaves_closet'},
            {label:'Control remoto portón', field:'doc_control_porton'},
            {label:'Kit de accesorios', field:'doc_kit_accesorios'},
            {label:'Garantías de artefactos', field:'doc_garantias_artefactos'},
          ].map(function(item) { return <ActRow key={item.field} label={item.label} field={item.field} form={form} set={set} isSigned={isSigned} /> })}
        </ActSection>

        {/* III. Artefactos */}
        <ActSection title="III. Recepción de artefactos">
          {[
            {label:'Calefón / Caldera', field:'art_calefon'},
            {label:'Encimera', field:'art_encimera'},
            {label:'Horno', field:'art_horno'},
            {label:'Campana extractora', field:'art_campana'},
            {label:'Estufa / Cocina', field:'art_estufa'},
            {label:'Lavavajillas', field:'art_lavavajillas'},
            {label:'Refrigerador', field:'art_refrigerador'},
            {label:'Lavadora / Secadora', field:'art_lavadora'},
            {label:'Aire acondicionado / Climatización', field:'art_aire'},
            {label:'Alarma de seguridad', field:'art_alarma'},
            {label:'Citófono / Videoportero', field:'art_citofono'},
            {label:'Portón automático', field:'art_porton'},
            {label:'Calefacción central / Piso radiante', field:'art_calefaccion'},
          ].map(function(item) {
            return <ActRow key={item.field} label={item.label} field={item.field}
              options={['', 'si', 'no', 'na']}
              labels={{'':'—', 'si':'Conforme', 'no':'No conforme', 'na':'N/A'}} form={form} set={set} isSigned={isSigned} />
          })}
        </ActSection>

        {/* IV. Medidores */}
        <ActSection title="IV. Lectura de medidores">
          <div style={{padding:'0.75rem 0'}}>
            {[
              {label:'Agua fría', num:'med_agua_fria_num', val:'med_agua_fria_val'},
              {label:'Agua caliente', num:'med_agua_caliente_num', val:'med_agua_caliente_val'},
              {label:'Gas', num:'med_gas_num', val:'med_gas_val'},
              {label:'Electricidad', num:'med_luz_num', val:'med_luz_val'},
            ].map(function(item) {
              return (
                <div key={item.label} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',alignItems:'center',marginBottom:'0.75rem'}}>
                  <span style={{fontSize:'0.875rem',color:'#1A1814'}}>{item.label}</span>
                  <input disabled={!!isSigned} className="text-input" value={form[item.num]} onChange={set(item.num)} placeholder="N° medidor" style={{fontSize:'0.8rem'}} />
                  <input disabled={!!isSigned} className="text-input" inputMode="decimal" value={form[item.val]} onChange={set(item.val)} placeholder="Lectura" style={{fontSize:'0.8rem'}} />
                </div>
              )
            })}
          </div>
        </ActSection>

        {/* V. Conformidad */}
        <ActSection title="V. Conformidad del proceso">
          {[
            {label:'¿Se inició en el horario acordado?', field:'conf_horario'},
            {label:'¿Se explicaron los documentos de entrega?', field:'conf_documentos'},
            {label:'¿Se explicó el programa de garantía y plazos?', field:'conf_garantia'},
            {label:'¿Se realizó la prueba de artefactos?', field:'conf_artefactos'},
            {label:'¿Se explicó tablero, corte de agua y gas?', field:'conf_tablero'},
            {label:'¿Se explicaron los teléfonos de emergencia?', field:'conf_emergencias'},
          ].map(function(item) {
            return <ActRow key={item.field} label={item.label} field={item.field}
              options={['', 'si', 'no']}
              labels={{'':'—', 'si':'Sí', 'no':'No'}} form={form} set={set} isSigned={isSigned} />
          })}
        </ActSection>

        {/* Observaciones */}
        <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2DDD6',marginBottom:'1rem',overflow:'hidden'}}>
          <div style={{padding:'0.875rem 1.25rem',borderBottom:'1px solid #F3F0EB',background:'#FAFAF9'}}>
            <h3 style={{margin:0,fontSize:'0.875rem',fontWeight:'700',color:'#1A1814'}}>Observaciones</h3>
          </div>
          <div style={{padding:'1rem 1.25rem'}}>
            <textarea disabled={!!isSigned} className="text-area" rows={3} value={form.observaciones} onChange={set('observaciones')} placeholder="Observaciones generales al momento de la entrega..." style={{fontSize:'0.875rem'}} />
          </div>
        </div>

        {/* Hallazgos adjuntos */}
        {entries.length > 0 && (
          <div style={{background:'#F7F5F0',borderRadius:'12px',border:'1px solid #E2DDD6',padding:'1rem 1.25rem',marginBottom:'1rem'}}>
            <p style={{fontSize:'0.8rem',fontWeight:'600',color:'#6B6760',margin:'0 0 0.5rem'}}>
              {isSigned ? 'Anexo I — Hallazgos declarados al firmar' : 'Se adjuntarán ' + entriesCount + ' hallazgo' + (entriesCount !== 1 ? 's' : '') + ' al acta como Anexo I'}
            </p>
            {(isSigned && deliveryAct.entries_snapshot ? deliveryAct.entries_snapshot : entries).map(function(e) {
              return (
                <div key={e.id} style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',padding:'0.3rem 0',borderBottom:'1px solid #E2DDD6',color:'#374151'}}>
                  <span>{e.title}</span>
                  <span style={{color:'#6B6760',textTransform:'capitalize'}}>{e.severity}</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Firmas */}
        {!isSigned && (
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2DDD6',padding:'1.25rem',marginBottom:'1rem'}}>
            <h3 style={{margin:'0 0 1rem',fontSize:'0.875rem',fontWeight:'700',color:'#1A1814'}}>Firmas</h3>
            <ActSigCanvas label={'Firma del propietario' + (property.owner_name ? ' (' + property.owner_name + ')' : '')} value={ownerSigData} onChange={setOwnerSigData} disabled={false} />
            <ActSigCanvas label={'Firma del inspector (' + (form.inspector_nombre || currentUser.name) + ')'} value={inspectorSigData} onChange={setInspectorSigData} disabled={false} />
            <button onClick={handleSign} disabled={signing || !ownerSigData || !inspectorSigData}
              style={{width:'100%',padding:'0.875rem',background: (ownerSigData && inspectorSigData) ? '#1A1814' : '#E2DDD6',color: (ownerSigData && inspectorSigData) ? '#fff' : '#6B6760',border:'none',borderRadius:'10px',fontWeight:'600',fontSize:'0.95rem',cursor:(ownerSigData && inspectorSigData)?'pointer':'default',marginTop:'0.5rem'}}>
              {signing ? 'Firmando...' : '✅ Firmar y cerrar acta'}
            </button>
          </div>
        )}

        {/* Vista firmas si ya está firmada */}
        {isSigned && (
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #BBF7D0',padding:'1.25rem',marginBottom:'1rem'}}>
            <h3 style={{margin:'0 0 1rem',fontSize:'0.875rem',fontWeight:'700',color:'#166534'}}>✅ Acta firmada el {new Date(deliveryAct.signed_at).toLocaleDateString('es-CL', {day:'2-digit',month:'long',year:'numeric'})}</h3>
            {deliveryAct.edited_after_signing && (
              <div style={{background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:'8px',padding:'0.6rem 0.875rem',marginBottom:'1rem',fontSize:'0.8rem',color:'#92400E'}}>
                ⚠️ Este acta fue modificada después de ser firmada.
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              {deliveryAct.signature_owner && (
                <div>
                  <p style={{fontSize:'0.72rem',color:'#6B6760',marginBottom:'0.4rem'}}>Propietario</p>
                  <img src={deliveryAct.signature_owner} alt="Firma propietario" style={{width:'100%',border:'1px solid #E2DDD6',borderRadius:'8px',background:'#FAFAF9'}} />
                </div>
              )}
              {deliveryAct.signature_inspector && (
                <div>
                  <p style={{fontSize:'0.72rem',color:'#6B6760',marginBottom:'0.4rem'}}>Inspector</p>
                  <img src={deliveryAct.signature_inspector} alt="Firma inspector" style={{width:'100%',border:'1px solid #E2DDD6',borderRadius:'8px',background:'#FAFAF9'}} />
                </div>
              )}
            </div>
            <button
              onClick={function() { generateActaPDF(deliveryAct, property, project && project.name) }}
              style={{marginTop:'1rem',width:'100%',padding:'0.75rem',background:'#1A1814',color:'#fff',border:'none',borderRadius:'10px',fontWeight:'600',fontSize:'0.9rem',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'0.5rem'}}>
              📄 Descargar PDF del acta
            </button>
          </div>
        )}

      </div>

      {/* Sticky bottom — botón registrar hallazgo (solo cuando no está firmada) */}
      {!isSigned && (
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'0.875rem 1rem',background:'rgba(247,245,240,0.95)',backdropFilter:'blur(8px)',borderTop:'1px solid #E2DDD6',zIndex:20}}>
          <button onClick={function() { onRegisterEntry() }}
            style={{width:'100%',padding:'0.875rem',background:'#2D5A3D',color:'#fff',border:'none',borderRadius:'10px',fontWeight:'600',fontSize:'0.95rem',cursor:'pointer'}}>
            + Registrar hallazgo
          </button>
        </div>
      )}
    </div>
  )
}) // end React.memo DeliveryActScreen

function PublicPropertyScreen() {
  var { token } = useParams()
  var [data, setData] = useState(null)
  var [loading, setLoading] = useState(true)
  var [error, setError] = useState('')
  var [lightbox, setLightbox] = useState(null)

  useEffect(function() {
    fetch(API_URL + '/public/properties/' + token)
      .then(function(r) { return r.json() })
      .then(function(d) {
        if (d.error) { setError(d.error) } else { setData(d) }
        setLoading(false)
      })
      .catch(function() { setError('No se pudo cargar la información'); setLoading(false) })
  }, [token])

  useEffect(function() {
    if (!lightbox) return
    var handler = function(e) {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') setLightbox(function(lb) { return lb ? { images: lb.images, index: (lb.index - 1 + lb.images.length) % lb.images.length } : null })
      if (e.key === 'ArrowRight') setLightbox(function(lb) { return lb ? { images: lb.images, index: (lb.index + 1) % lb.images.length } : null })
    }
    window.addEventListener('keydown', handler)
    return function() { window.removeEventListener('keydown', handler) }
  }, [lightbox])

  var severityColor = function(s) {
    if (s === 'critico') return { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', label: 'Crítico' }
    if (s === 'grave') return { bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412', label: 'Grave' }
    if (s === 'moderado') return { bg: '#FEFCE8', border: '#FDE68A', text: '#92400E', label: 'Moderado' }
    return { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', label: 'Leve' }
  }

  var statusLabel = function(s) {
    if (s === 'resuelto') return { label: 'Resuelto', bg: '#F0FDF4', color: '#166534', border: '#BBF7D0', dot: '#22C55E' }
    if (s === 'en_progreso') return { label: 'En progreso', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: '#3B82F6' }
    return { label: 'Pendiente', bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA', dot: '#F97316' }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F7F5F0'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'1.2rem',fontWeight:'700',color:'#1A1814',marginBottom:'0.5rem'}}>BitácoraPro<span style={{color:'#2D5A3D'}}>.</span></div>
        <p style={{color:'#6B6760',fontSize:'0.9rem'}}>Cargando información...</p>
      </div>
    </div>
  )

  if (error) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#F7F5F0'}}>
      <div style={{textAlign:'center',padding:'2rem'}}>
        <div style={{fontFamily:'Georgia,serif',fontSize:'1.2rem',fontWeight:'700',color:'#1A1814',marginBottom:'1rem'}}>BitácoraPro<span style={{color:'#2D5A3D'}}>.</span></div>
        <p style={{color:'#B91C1C'}}>{error}</p>
      </div>
    </div>
  )

  var summary = data.summary
  var entries = data.entries

  return (
    <div style={{minHeight:'100vh',background:'#F7F5F0',fontFamily:"'DM Sans',system-ui,sans-serif",color:'#1A1814'}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #E2DDD6',padding:'1rem 1.25rem',position:'sticky',top:0,zIndex:10}}>
        <div style={{maxWidth:'680px',margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontFamily:'Georgia,serif',fontSize:'1.1rem',fontWeight:'700',color:'#1A1814'}}>BitácoraPro<span style={{color:'#2D5A3D'}}>.</span></div>
          <div style={{fontSize:'0.75rem',color:'#6B6760',background:'#F7F5F0',padding:'0.3rem 0.75rem',borderRadius:'100px',border:'1px solid #E2DDD6'}}>Vista propietario</div>
        </div>
      </div>

      <div style={{maxWidth:'680px',margin:'0 auto',padding:'1.5rem 1.25rem 4rem'}}>

        {/* Info propiedad */}
        <div style={{background:'#fff',borderRadius:'14px',border:'1px solid #E2DDD6',padding:'1.5rem',marginBottom:'1.25rem'}}>
          <p style={{fontSize:'0.7rem',fontWeight:'600',letterSpacing:'0.1em',textTransform:'uppercase',color:'#2D5A3D',marginBottom:'0.25rem'}}>{data.project_name}</p>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'1.5rem',fontWeight:'700',margin:'0 0 0.25rem'}}>{data.unit_number}</h1>
          {data.owner_name && <p style={{color:'#6B6760',fontSize:'0.9rem',margin:0}}>{data.owner_name}</p>}
        </div>

        {/* Dashboard resumen */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.75rem',marginBottom:'1.5rem'}}>
          <div style={{background:'#F0FDF4',borderRadius:'12px',border:'1px solid #BBF7D0',padding:'1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',fontWeight:'700',color:'#166534'}}>{summary.resueltos}</div>
            <div style={{fontSize:'0.72rem',color:'#166534',marginTop:'0.15rem'}}>Resuelto{summary.resueltos !== 1 ? 's' : ''}</div>
          </div>
          <div style={{background:'#EFF6FF',borderRadius:'12px',border:'1px solid #BFDBFE',padding:'1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',fontWeight:'700',color:'#1D4ED8'}}>{summary.en_progreso}</div>
            <div style={{fontSize:'0.72rem',color:'#1D4ED8',marginTop:'0.15rem'}}>En progreso</div>
          </div>
          <div style={{background:'#FFF7ED',borderRadius:'12px',border:'1px solid #FED7AA',padding:'1rem',textAlign:'center'}}>
            <div style={{fontSize:'1.5rem',fontWeight:'700',color:'#9A3412'}}>{summary.pendientes}</div>
            <div style={{fontSize:'0.72rem',color:'#9A3412',marginTop:'0.15rem'}}>Pendiente{summary.pendientes !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Barra de progreso */}
        {summary.total > 0 && (
          <div style={{background:'#fff',borderRadius:'12px',border:'1px solid #E2DDD6',padding:'1rem 1.25rem',marginBottom:'1.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.6rem'}}>
              <span style={{fontSize:'0.8rem',color:'#6B6760'}}>Progreso de resolución</span>
              <span style={{fontSize:'0.8rem',fontWeight:'600',color:'#166534'}}>{summary.resueltos} de {summary.total} resueltos</span>
            </div>
            <div style={{height:'8px',background:'#E2DDD6',borderRadius:'100px',overflow:'hidden'}}>
              <div style={{height:'100%',background:'#22C55E',borderRadius:'100px',width:(summary.resueltos / summary.total * 100) + '%',transition:'width 0.5s ease'}} />
            </div>
          </div>
        )}

        {/* Lista hallazgos */}
        {entries.length === 0 ? (
          <div style={{textAlign:'center',padding:'3rem 1rem',color:'#6B6760'}}>
            <p style={{fontSize:'2rem',marginBottom:'0.5rem'}}>✅</p>
            <p>No hay hallazgos registrados para esta propiedad.</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {entries.map(function(entry) {
              var sev = severityColor(entry.severity)
              var st = statusLabel(entry.status)
              return (
                <div key={entry.id} style={{background:'#fff',borderRadius:'14px',border:'1px solid #E2DDD6',overflow:'hidden'}}>
                  {/* Header hallazgo */}
                  <div style={{padding:'1rem 1.25rem 0.75rem',borderBottom:'1px solid #F3F0EB'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'0.75rem',marginBottom:'0.5rem'}}>
                      <h3 style={{fontSize:'0.95rem',fontWeight:'600',margin:0,lineHeight:1.4}}>{entry.title}</h3>
                      <span style={{flexShrink:0,fontSize:'0.7rem',fontWeight:'600',padding:'0.2rem 0.6rem',borderRadius:'100px',background:st.bg,color:st.color,border:'1px solid '+st.border,display:'flex',alignItems:'center',gap:'0.3rem'}}>
                        <span style={{width:'6px',height:'6px',borderRadius:'50%',background:st.dot,flexShrink:0}} />
                        {st.label}
                      </span>
                    </div>
                    <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
                      <span style={{fontSize:'0.7rem',padding:'0.15rem 0.5rem',borderRadius:'100px',background:sev.bg,color:sev.text,border:'1px solid '+sev.border,fontWeight:'500'}}>{sev.label}</span>
                      {entry.category && <span style={{fontSize:'0.7rem',padding:'0.15rem 0.5rem',borderRadius:'100px',background:'#F3F4F6',color:'#374151',border:'1px solid #E5E7EB',textTransform:'capitalize'}}>{entry.category}</span>}
                      {entry.location && <span style={{fontSize:'0.7rem',color:'#6B6760'}}>📍 {entry.location}</span>}
                    </div>
                  </div>
                  {/* Fotos */}
                  {entry.images && entry.images.length > 0 && (
                    <div style={{padding:'0.75rem 1.25rem 0'}}>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:'0.4rem'}}>
                        {entry.images.map(function(img, idx) {
                          return <img key={img.id} src={img.filename} alt="" onClick={function() { setLightbox({ images: entry.images, index: idx }) }} style={{width:'100%',aspectRatio:'4/3',objectFit:'cover',cursor:'zoom-in',borderRadius:'8px',border:'1px solid #E2DDD6'}} />
                        })}
                      </div>
                    </div>
                  )}
                  {/* Cuerpo */}
                  <div style={{padding:'1rem 1.25rem',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
                    {entry.description && <p style={{fontSize:'0.875rem',color:'#374151',lineHeight:1.7,margin:0}}>{entry.description}</p>}
                    {entry.recommendation && (
                      <div style={{background:'#FFFBEB',borderRadius:'8px',padding:'0.75rem',border:'1px solid #FDE68A'}}>
                        <p style={{fontSize:'0.7rem',fontWeight:'600',letterSpacing:'0.08em',textTransform:'uppercase',color:'#D97706',marginBottom:'0.3rem'}}>💡 Recomendación</p>
                        <p style={{fontSize:'0.85rem',color:'#78350F',lineHeight:1.6,margin:0}}>{entry.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:'center',marginTop:'3rem',paddingTop:'1.5rem',borderTop:'1px solid #E2DDD6'}}>
          <p style={{fontSize:'0.75rem',color:'#C0BBB5'}}>Generado con <strong style={{color:'#2D5A3D'}}>BitácoraPro</strong> — Gestión de postventa inmobiliaria</p>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={function() { setLightbox(null) }} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={lightbox.images[lightbox.index].filename} alt="" onClick={function(e) { e.stopPropagation() }} style={{maxWidth:'92vw',maxHeight:'85vh',objectFit:'contain',borderRadius:'8px'}} />
          {lightbox.images.length > 1 && <>
            <button onClick={function(e) { e.stopPropagation(); setLightbox(function(lb) { return { images: lb.images, index: (lb.index - 1 + lb.images.length) % lb.images.length } }) }} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <button onClick={function(e) { e.stopPropagation(); setLightbox(function(lb) { return { images: lb.images, index: (lb.index + 1) % lb.images.length } }) }} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.5rem',width:'44px',height:'44px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </>}
          <button onClick={function() { setLightbox(null) }} style={{position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.12)',border:'none',color:'white',fontSize:'1.1rem',width:'36px',height:'36px',borderRadius:'50%',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
        </div>
      )}
    </div>
  )
}

function ResetPasswordScreen({ onLogin }) {
  var navigate = useNavigate()
  var params = useParams()
  var [password, setPassword] = useState('')
  var [password2, setPassword2] = useState('')
  var [loading, setLoading] = useState(false)
  var [error, setError] = useState('')

  var handleSubmit = async function() {
    if (!password || !password2) return setError('Completa ambos campos')
    if (password !== password2) return setError('Las contraseñas no coinciden')
    if (password.length < 6) return setError('Mínimo 6 caracteres')
    setLoading(true)
    setError('')
    try {
      var res = await fetch(API_URL + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token, new_password: password })
      })
      var data = await res.json()
      if (!res.ok) return setError(data.error || 'Error al restablecer')
      onLogin(data.token, data.user)
      navigate('/proyectos', { replace: true })
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">BitácoraPro<span style={{color:'#2D5A3D'}}>.</span></div>
        <h2 style={{fontFamily:'Georgia,serif', marginBottom:'0.5rem'}}>Nueva contraseña</h2>
        <p style={{color:'#6B6760', fontSize:'0.9rem', marginBottom:'1.25rem'}}>Elige una contraseña nueva para tu cuenta.</p>
        <div className="form-field">
          <label>Nueva contraseña</label>
          <input type="password" className="text-input" value={password} onChange={function(e) { setPassword(e.target.value) }} placeholder="Mínimo 6 caracteres" />
        </div>
        <div className="form-field">
          <label>Repetir contraseña</label>
          <input type="password" className="text-input" value={password2} onChange={function(e) { setPassword2(e.target.value) }} placeholder="Repite la contraseña" onKeyDown={function(e) { if(e.key === 'Enter') handleSubmit() }} />
        </div>
        {error && <p style={{color:'#B91C1C', fontSize:'0.875rem', marginBottom:'1rem'}}>{error}</p>}
        <button className="submit-button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar contraseña →'}
        </button>
      </div>
    </div>
  )
}

export default App
