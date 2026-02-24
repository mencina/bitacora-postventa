import { useState, useRef, useEffect } from 'react'
import jsPDF from 'jspdf'
import './App.css'

// === PANTALLA HOME ===
function HomeScreen({ onGoLogin, onGoRegister }) {
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
        .hp-root{--bg:#F7F5F0;--ink:#1A1814;--muted:#6B6760;--accent:#2D5A3D;--accent-light:#EAF1EC;--line:#E2DDD6;--white:#FFFFFF;--serif:'Playfair Display',Georgia,serif;--sans:'DM Sans',sans-serif;font-family:var(--sans);background:var(--bg);color:var(--ink);overflow-x:hidden;font-weight:300;line-height:1.6;min-height:100vh;}
        .hp-nav{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.25rem 5vw;background:rgba(247,245,240,0.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);}
        .hp-logo{font-family:var(--serif);font-size:1.2rem;font-weight:700;color:var(--ink);cursor:pointer;letter-spacing:-0.02em;}
        .hp-logo span{color:var(--accent);}
        .hp-nav-links{display:flex;align-items:center;gap:1.5rem;}
        .hp-nav-link{background:none;border:none;cursor:pointer;color:var(--muted);font-size:0.875rem;font-family:var(--sans);transition:color 0.2s;padding:0;}
        .hp-nav-link:hover{color:var(--ink);}
        .hp-btn-nav{background:var(--ink)!important;color:var(--white)!important;padding:0.55rem 1.25rem;border-radius:6px;font-weight:500!important;font-size:0.875rem;font-family:var(--sans);border:none;cursor:pointer;transition:background 0.2s,transform 0.15s;}
        .hp-btn-nav:hover{background:var(--accent)!important;transform:translateY(-1px);}
        .hp-hero{min-height:90vh;display:flex;flex-direction:column;justify-content:center;padding:6rem 5vw 5rem;position:relative;overflow:hidden;}
        .hp-hero::before{content:'';position:absolute;top:-20%;right:-10%;width:600px;height:600px;background:radial-gradient(circle,rgba(45,90,61,0.07) 0%,transparent 70%);pointer-events:none;}
        .hp-eyebrow{display:inline-flex;align-items:center;gap:0.5rem;background:var(--accent-light);color:var(--accent);font-size:0.78rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;padding:0.4rem 1rem;border-radius:100px;margin-bottom:2rem;width:fit-content;animation:hp-fadeUp 0.7s 0.1s both;}
        .hp-eyebrow::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);}
        .hp-hero-title{font-family:var(--serif);font-size:clamp(2.8rem,6vw,5.5rem);line-height:1.05;font-weight:700;letter-spacing:-0.03em;max-width:14ch;margin-bottom:1.5rem;animation:hp-fadeUp 0.8s 0.2s both;}
        .hp-hero-title em{font-style:italic;color:var(--accent);}
        .hp-hero-sub{font-size:1.05rem;color:var(--muted);max-width:48ch;line-height:1.75;margin-bottom:2.5rem;animation:hp-fadeUp 0.8s 0.35s both;}
        .hp-hero-actions{display:flex;gap:1rem;align-items:center;flex-wrap:wrap;animation:hp-fadeUp 0.8s 0.5s both;}
        .hp-btn-primary{background:var(--ink);color:var(--white);padding:0.875rem 2rem;border-radius:8px;font-weight:500;font-size:0.95rem;font-family:var(--sans);border:none;cursor:pointer;transition:background 0.2s,transform 0.15s,box-shadow 0.2s;display:inline-flex;align-items:center;gap:0.5rem;}
        .hp-btn-primary:hover{background:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,90,61,0.2);}
        .hp-btn-ghost{background:none;border:none;color:var(--ink);font-size:0.9rem;font-family:var(--sans);cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;padding:0.875rem 0;transition:gap 0.2s;}
        .hp-btn-ghost:hover{gap:0.75rem;}
        .hp-stats{margin-top:5rem;padding-top:2.5rem;border-top:1px solid var(--line);display:flex;gap:3rem;animation:hp-fadeUp 0.8s 0.65s both;flex-wrap:wrap;}
        .hp-stat strong{display:block;font-family:var(--serif);font-size:2rem;font-weight:700;line-height:1;}
        .hp-stat span{font-size:0.8rem;color:var(--muted);font-weight:400;letter-spacing:0.03em;}
        .hp-section{padding:6rem 5vw;}
        .hp-label{font-size:0.75rem;font-weight:500;text-transform:uppercase;letter-spacing:0.12em;color:var(--accent);margin-bottom:1rem;display:block;}
        .hp-section-title{font-family:var(--serif);font-size:clamp(1.8rem,3.5vw,3rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:1.25rem;max-width:20ch;}
        .hp-section-body{font-size:1rem;color:var(--muted);max-width:48ch;line-height:1.75;}
        .hp-how{background:var(--white);border-top:1px solid var(--line);border-bottom:1px solid var(--line);}
        .hp-how-inner{display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;}
        .hp-steps{display:flex;flex-direction:column;gap:2rem;margin-top:3rem;}
        .hp-step{display:flex;gap:1.25rem;align-items:flex-start;}
        .hp-step-num{flex-shrink:0;width:36px;height:36px;border-radius:50%;background:var(--accent-light);color:var(--accent);font-family:var(--serif);font-size:1rem;font-weight:700;display:flex;align-items:center;justify-content:center;}
        .hp-step h4{font-weight:500;font-size:0.95rem;margin-bottom:0.25rem;}
        .hp-step p{font-size:0.875rem;color:var(--muted);line-height:1.6;}
        .hp-flow{display:flex;flex-direction:column;gap:1rem;}
        .hp-flow-card{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:1.25rem 1.5rem;display:flex;align-items:center;gap:1rem;transition:box-shadow 0.2s,transform 0.2s;}
        .hp-flow-card:hover{box-shadow:0 4px 20px rgba(26,24,20,0.06);transform:translateX(4px);}
        .hp-flow-icon{font-size:1.5rem;width:44px;height:44px;display:flex;align-items:center;justify-content:center;background:var(--white);border-radius:10px;border:1px solid var(--line);flex-shrink:0;}
        .hp-flow-card h5{font-weight:500;font-size:0.9rem;margin-bottom:0.15rem;}
        .hp-flow-card p{font-size:0.78rem;color:var(--muted);}
        .hp-flow-arrow{text-align:center;color:var(--line);font-size:1.2rem;padding:0.1rem 0;}
        .hp-feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5px;background:var(--line);border:1.5px solid var(--line);border-radius:16px;overflow:hidden;margin-top:4rem;}
        .hp-feat-card{background:var(--white);padding:2.5rem 2rem;transition:background 0.2s;}
        .hp-feat-card:hover{background:#FAFAF7;}
        .hp-feat-icon{font-size:1.75rem;margin-bottom:1.25rem;display:block;}
        .hp-feat-card h3{font-family:var(--serif);font-size:1.1rem;font-weight:700;margin-bottom:0.6rem;line-height:1.2;}
        .hp-feat-card p{font-size:0.875rem;color:var(--muted);line-height:1.65;}
        .hp-dark{background:var(--ink);color:var(--white);}
        .hp-dark .hp-label{color:#7CB891;}
        .hp-dark .hp-section-title{color:var(--white);max-width:none;}
        .hp-dark .hp-section-body{color:rgba(255,255,255,0.55);}
        .hp-personas{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:4rem;}
        .hp-persona{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:2rem;transition:background 0.2s,border-color 0.2s;}
        .hp-persona:hover{background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.2);}
        .hp-persona-role{font-size:0.72rem;text-transform:uppercase;letter-spacing:0.1em;color:#7CB891;font-weight:500;margin-bottom:0.75rem;}
        .hp-persona h3{font-family:var(--serif);font-size:1.2rem;font-weight:700;margin-bottom:0.75rem;color:var(--white);}
        .hp-persona p{font-size:0.875rem;color:rgba(255,255,255,0.5);line-height:1.65;}
        .hp-cta{text-align:center;padding:9rem 5vw;position:relative;overflow:hidden;}
        .hp-cta::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(45,90,61,0.06) 0%,transparent 65%);pointer-events:none;}
        .hp-cta-title{font-family:var(--serif);font-size:clamp(2rem,4.5vw,4.5rem);font-weight:700;letter-spacing:-0.03em;line-height:1.05;margin-bottom:1.5rem;}
        .hp-cta-sub{font-size:1rem;color:var(--muted);max-width:44ch;margin:0 auto 2.5rem;line-height:1.7;}
        .hp-footer{border-top:1px solid var(--line);padding:2rem 5vw;display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;color:var(--muted);flex-wrap:wrap;gap:0.75rem;}
        .hp-footer-logo{font-family:var(--serif);font-weight:700;color:var(--ink);font-size:1rem;}
        .hp-footer-link{background:none;border:none;color:var(--muted);cursor:pointer;font-size:0.8rem;font-family:var(--sans);transition:color 0.2s;padding:0;}
        .hp-footer-link:hover{color:var(--ink);}
        .hp-reveal{opacity:0;transform:translateY(28px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .hp-visible{opacity:1!important;transform:none!important;}
        @keyframes hp-fadeUp{from{opacity:0;transform:translateY(24px);}to{opacity:1;transform:translateY(0);}}
        @media(max-width:1024px){.hp-how-inner{grid-template-columns:1fr;gap:3rem;}.hp-feat-grid{grid-template-columns:repeat(2,1fr);}.hp-personas{grid-template-columns:1fr 1fr;}}
        @media(max-width:640px){.hp-nav-links{gap:0.75rem;}.hp-feat-grid{grid-template-columns:1fr;}.hp-personas{grid-template-columns:1fr;}.hp-stats{gap:1.5rem;}.hp-footer{flex-direction:column;text-align:center;}.hp-how-inner{grid-template-columns:1fr;}}
      `}</style>

      {/* NAV */}
      <nav className="hp-nav">
        <div className="hp-logo">Bitácora<span>.</span></div>
        <div className="hp-nav-links">
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Cómo funciona</button>
          <button className="hp-nav-link" onClick={function() { document.getElementById('hp-feat').scrollIntoView({ behavior: 'smooth' }) }}>Funcionalidades</button>
          <button className="hp-btn-nav" onClick={onGoLogin}>Iniciar sesión →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-eyebrow">Post venta inmobiliaria con IA</div>
        <h1 className="hp-hero-title">Del hallazgo al informe, <em>en segundos.</em></h1>
        <p className="hp-hero-sub">Bitácora convierte las fotos y notas de voz de tus inspectores en reportes técnicos completos. Menos papeleo, más tiempo en terreno.</p>
        <div className="hp-hero-actions">
          <button className="hp-btn-primary" onClick={onGoRegister}>Comenzar gratis →</button>
          <button className="hp-btn-ghost" onClick={function() { document.getElementById('hp-como').scrollIntoView({ behavior: 'smooth' }) }}>Ver cómo funciona ↓</button>
        </div>
        <div className="hp-stats">
          <div className="hp-stat"><strong>10×</strong><span>más rápido que a mano</span></div>
          <div className="hp-stat"><strong>100%</strong><span>registro fotográfico</span></div>
          <div className="hp-stat"><strong>PDF</strong><span>profesional al instante</span></div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="hp-section hp-how" id="hp-como">
        <div className="hp-how-inner">
          <div>
            <span className="hp-label hp-reveal">Proceso</span>
            <h2 className="hp-section-title hp-reveal">Así funciona en la práctica</h2>
            <p className="hp-section-body hp-reveal">Diseñado para inspectores que trabajan en terreno, no frente a un computador.</p>
            <div className="hp-steps">
              <div className="hp-step hp-reveal"><div className="hp-step-num">1</div><div><h4>El inspector llega a la propiedad</h4><p>Abre la app, selecciona la unidad y comienza la inspección desde su teléfono.</p></div></div>
              <div className="hp-step hp-reveal"><div className="hp-step-num">2</div><div><h4>Foto + nota de voz del hallazgo</h4><p>Fotografía el problema y graba una nota de voz. Sin formularios, sin escribir.</p></div></div>
              <div className="hp-step hp-reveal"><div className="hp-step-num">3</div><div><h4>La IA genera el reporte</h4><p>Claude analiza imagen y audio, y produce título, descripción técnica, categoría, severidad y recomendación.</p></div></div>
              <div className="hp-step hp-reveal"><div className="hp-step-num">4</div><div><h4>PDF listo para entregar</h4><p>Un informe profesional descargable, listo para el propietario o el equipo de constructora.</p></div></div>
            </div>
          </div>
          <div className="hp-flow hp-reveal">
            <div className="hp-flow-card"><div className="hp-flow-icon">📸</div><div><h5>Subida de fotos múltiples</h5><p>Registra todos los ángulos del hallazgo</p></div></div>
            <div className="hp-flow-arrow">↓</div>
            <div className="hp-flow-card"><div className="hp-flow-icon">🎙️</div><div><h5>Grabación de audio</h5><p>Transcripción en tiempo real mientras hablas</p></div></div>
            <div className="hp-flow-arrow">↓</div>
            <div className="hp-flow-card"><div className="hp-flow-icon">✦</div><div><h5>Análisis con IA</h5><p>Claude genera el contenido técnico completo</p></div></div>
            <div className="hp-flow-arrow">↓</div>
            <div className="hp-flow-card"><div className="hp-flow-icon">📄</div><div><h5>PDF profesional</h5><p>Informe listo para descargar y entregar</p></div></div>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="hp-section" id="hp-feat">
        <span className="hp-label hp-reveal">Funcionalidades</span>
        <h2 className="hp-section-title hp-reveal">Todo lo que necesita un equipo de post venta</h2>
        <div className="hp-feat-grid">
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">🏢</span><h3>Multi-proyecto</h3><p>Organiza por proyecto, propiedad e inspector. Cada empresa ve solo sus propios datos.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">✦</span><h3>IA integrada</h3><p>Claude analiza fotos y audio para generar descripciones técnicas, categorías y recomendaciones.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">📄</span><h3>PDF automático</h3><p>Informe profesional descargable con todos los hallazgos, fotos y datos del propietario.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">👥</span><h3>Roles y permisos</h3><p>Administradores gestionan proyectos. Inspectores registran hallazgos. Cada uno ve lo suyo.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">🎙️</span><h3>Notas de voz</h3><p>Graba mientras inspeccionas. Transcripción en tiempo real, sin teclear nada en terreno.</p></div>
          <div className="hp-feat-card hp-reveal"><span className="hp-feat-icon">📊</span><h3>Fichas de propiedades</h3><p>Gestiona nombre, RUT, email y teléfono de cada propietario en un solo lugar.</p></div>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="hp-section hp-dark">
        <span className="hp-label hp-reveal">Para quién</span>
        <h2 className="hp-section-title hp-reveal">Hecho para la industria inmobiliaria</h2>
        <div className="hp-personas">
          <div className="hp-persona hp-reveal"><div className="hp-persona-role">Inmobiliaria</div><h3>Gerente de Post Venta</h3><p>Supervisa el trabajo de todos los inspectores. Informes consistentes y bien documentados en cada entrega.</p></div>
          <div className="hp-persona hp-reveal"><div className="hp-persona-role">Terreno</div><h3>Inspector de Viviendas</h3><p>Trabaja desde el teléfono. Sin formularios manuales. La IA hace el informe mientras tú sigues inspeccionando.</p></div>
          <div className="hp-persona hp-reveal"><div className="hp-persona-role">Constructora</div><h3>Equipo de Calidad</h3><p>Registra todos los hallazgos con evidencia fotográfica. Trazabilidad completa de cada defecto y su resolución.</p></div>
        </div>
      </section>

      {/* CTA */}
      <section className="hp-cta">
        <span className="hp-label hp-reveal">Comenzar</span>
        <h2 className="hp-cta-title hp-reveal">¿Listo para modernizar<br/>tu post venta?</h2>
        <p className="hp-cta-sub hp-reveal">Crea tu cuenta gratis y empieza a registrar hallazgos en minutos. Sin tarjeta de crédito.</p>
        <div className="hp-reveal">
          <button className="hp-btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.25rem' }} onClick={onGoRegister}>Crear cuenta gratis →</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hp-footer">
        <span className="hp-footer-logo">Bitácora.</span>
        <span>© 2025 Bitácora. Hecho con ✦ y Claude.</span>
        <span>
          <button className="hp-footer-link" onClick={onGoLogin}>Iniciar sesión</button>
          {' · '}
          <button className="hp-footer-link" onClick={onGoRegister}>Registrarse</button>
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
          var imgData = await loadImageAsBase64(API_URL + '/uploads/' + entry.images[ii].filename)
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

function App() {
  // Auth
  var [token, setToken] = useState(null)
  var [currentUser, setCurrentUser] = useState(null)
  var [authScreen, setAuthScreen] = useState('home') // 'home' | 'login' | 'register'

  // App state
  var [projects, setProjects] = useState([])
  var [currentProject, setCurrentProject] = useState(null)
  var [properties, setProperties] = useState([])
  var [currentProperty, setCurrentProperty] = useState(null)
  var [entries, setEntries] = useState([])
  var [showForm, setShowForm] = useState(false)
  var [isAnalyzing, setIsAnalyzing] = useState(false)

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

  // === PANTALLAS DE AUTH ===
  if (!token) {
    if (authScreen === 'home') return <HomeScreen onGoLogin={function() { setAuthScreen('login') }} onGoRegister={function() { setAuthScreen('register') }} />
    if (authScreen === 'register') return <RegisterScreen onLogin={handleLogin} onGoLogin={function() { setAuthScreen('login') }} />
    return <LoginScreen onLogin={handleLogin} onGoRegister={function() { setAuthScreen('register') }} />
  }

  // === VISTA 1: PROYECTOS ===
  if (!currentProject) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="header-title">
              <span className="header-icon">📋</span>
              <div><h1>Bitacora Post Venta</h1><p className="header-subtitle">{currentUser && currentUser.company_name}</p></div>
            </div>
            <div className="header-info">
              <span className="user-name">👤 {currentUser && currentUser.name}</span>
              <button className="logout-button" onClick={handleLogout}>Cerrar sesion</button>
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
            <div className="header-title">
              <span className="header-icon">📋</span>
              <div><h1>Bitacora Post Venta</h1><p className="header-subtitle">{currentUser && currentUser.company_name}</p></div>
            </div>
            <div className="header-info">
              <button className="back-button" onClick={function() { setCurrentProject(null) }}>← Proyectos</button>
              <div className="project-name-display">{currentProject.name}</div>
              <button className="logout-button" onClick={handleLogout}>Cerrar sesion</button>
            </div>
          </div>
        </header>
        <main className="main">
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
              return (
                <div key={prop.id} className="project-card property-card">
                  <div className="project-card-content" onClick={function() { setCurrentProperty(prop) }}>
                    <h3>🏠 {prop.unit_number}</h3>
                    <p className="property-owner">{prop.owner_name || 'Sin propietario asignado'}</p>
                    <p className="project-date">{prop.entry_count || 0} hallazgos | {prop.owner_email || ''} {prop.owner_phone ? '| ' + prop.owner_phone : ''}</p>
                  </div>
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
          <div className="header-title">
            <span className="header-icon">📋</span>
            <div><h1>Bitacora Post Venta</h1><p className="header-subtitle">Sistema inteligente de registro de hallazgos</p></div>
          </div>
          <div className="header-info">
            <button className="back-button" onClick={function() { setCurrentProperty(null); setShowForm(false) }}>← Propiedades</button>
            <div className="project-name-display">{currentProperty.unit_number} — {currentProperty.owner_name || 'Sin propietario'}</div>
            <div className="entry-count">{entries.length} hallazgo{entries.length !== 1 ? 's' : ''}</div>
            <button className="logout-button" onClick={handleLogout}>Cerrar sesion</button>
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
              return (
                <div key={entry.id} className="entry-card">
                  <button className="delete-button" onClick={function() { handleDeleteEntry(entry.id) }}>🗑</button>
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
                    <div className="entry-images">{entry.images.map(function(img) { return <img key={img.id} src={API_URL + '/uploads/' + img.filename} alt="" className="entry-image" /> })}</div>
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
    </div>
  )
}

export default App
