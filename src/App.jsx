import { useState, useRef, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
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
        .hp-nav{position:sticky;top:0;z-index:200;display:flex;align-items:center;justify-content:space-between;padding:1.1rem var(--gutter);background:rgba(247,245,240,0.96);backdrop-filter:blur(16px);border-bottom:1px solid var(--line);}
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
function LoginScreen({ onLogin }) {
  var navigate = useNavigate()
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
          <h1>BitacoraPro</h1>
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

function App() {
  // Auth
  var [token, setToken] = useState(null)
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
    setCurrentUser(user)
  }

  var handleLogout = function() {
    setToken(null)
    setCurrentUser(null)
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

  // === COMPONENTE INTERIOR DE LA APP (requiere token) ===
  function AppInterior() {
    var navigate = useNavigate()

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

    // === VISTA 1: PROYECTOS ===
    if (!currentProject) {
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
                <div><h1>BitácoraPro</h1></div>
              </div>
              <div className="header-info">
                <div className="entry-count">{entries.length} hallazgo{entries.length !== 1 ? 's' : ''}</div>
                <button className="logout-button" onClick={handleLogoutAndRedirect}>Cerrar sesión</button>
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

  // === RUTAS ===
  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/login" element={token ? <Navigate to="/proyectos" replace /> : <LoginScreen onLogin={handleLogin} />} />
      <Route path="/invitacion/:token" element={<InviteRegisterScreen onLogin={handleLogin} />} />
      <Route path="/admin" element={<AdminScreen />} />
      <Route path="/proyectos" element={<AppInterior />} />
      <Route path="/propiedades" element={<AppInterior />} />
      <Route path="/hallazgos" element={<AppInterior />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
export default App
