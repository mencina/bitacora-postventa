import { useState, useRef, useEffect } from 'react'
import jsPDF from 'jspdf'
import './App.css'

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

  // PORTADA
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

function App() {
  // State
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

  // Load projects
  useEffect(function() {
    fetch(API_URL + '/projects').then(function(r) { return r.json() }).then(setProjects).catch(console.error)
  }, [])

  // Load properties when project changes
  useEffect(function() {
    if (currentProject) {
      fetch(API_URL + '/projects/' + currentProject.id + '/properties').then(function(r) { return r.json() }).then(setProperties).catch(console.error)
    } else { setProperties([]); setCurrentProperty(null) }
  }, [currentProject])

  // Load entries when property changes
  useEffect(function() {
    if (currentProperty) {
      fetch(API_URL + '/properties/' + currentProperty.id + '/entries').then(function(r) { return r.json() }).then(setEntries).catch(console.error)
    } else { setEntries([]) }
  }, [currentProperty])

  // Project handlers
  var handleCreateProject = function() {
    if (!newProjectName.trim()) return
    fetch(API_URL + '/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newProjectName.trim() }) })
      .then(function(r) { return r.json() })
      .then(function(p) { setProjects(function(prev) { return [p].concat(prev) }); setCurrentProject(p); setNewProjectName(''); setShowNewProject(false) })
  }

  var handleDeleteProject = function(id) {
    if (!window.confirm('Eliminar este proyecto y todo su contenido?')) return
    fetch(API_URL + '/projects/' + id, { method: 'DELETE' }).then(function() {
      setProjects(function(prev) { return prev.filter(function(p) { return p.id !== id }) })
      if (currentProject && currentProject.id === id) { setCurrentProject(null) }
    })
  }

  // Property handlers
  var handleCreateProperty = function() {
    if (!propForm.unit_number.trim()) { alert('El numero de propiedad es requerido'); return }
    fetch(API_URL + '/projects/' + currentProject.id + '/properties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(propForm) })
      .then(function(r) { return r.json() })
      .then(function(p) { setProperties(function(prev) { return prev.concat([p]) }); setPropForm({ unit_number: '', owner_name: '', owner_rut: '', owner_email: '', owner_phone: '' }); setShowNewProperty(false) })
  }

  var handleDeleteProperty = function(id) {
    if (!window.confirm('Eliminar esta propiedad y todos sus hallazgos?')) return
    fetch(API_URL + '/properties/' + id, { method: 'DELETE' }).then(function() {
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

      var response = await fetch(API_URL + '/properties/' + currentProperty.id + '/entries', { method: 'POST', body: formData })
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
    fetch(API_URL + '/entries/' + id, { method: 'DELETE' }).then(function() {
      setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id }) })
    })
  }

  var handleExportPDF = function() {
    if (entries.length === 0) { alert('No hay hallazgos para exportar'); return }
    generatePDF(currentProject.name, currentProperty, entries)
  }

  // === VISTA 1: PROYECTOS ===
  if (!currentProject) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-content">
            <div className="header-title">
              <span className="header-icon">📋</span>
              <div><h1>Bitacora Post Venta</h1><p className="header-subtitle">Sistema inteligente de registro de hallazgos</p></div>
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
            <div className="welcome-message"><h2>👋 Bienvenido</h2><p>Crea tu primer proyecto para comenzar.</p></div>
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
              <div><h1>Bitacora Post Venta</h1><p className="header-subtitle">Sistema inteligente de registro de hallazgos</p></div>
            </div>
            <div className="header-info">
              <button className="back-button" onClick={function() { setCurrentProject(null) }}>← Proyectos</button>
              <div className="project-name-display">{currentProject.name}</div>
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