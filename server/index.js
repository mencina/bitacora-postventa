var express = require('express')
var cors = require('cors')
var path = require('path')
var fs = require('fs')
require('dotenv').config()
var Anthropic = require('@anthropic-ai/sdk').default
var Database = require('better-sqlite3')
var multer = require('multer')

var uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

var storage = multer.diskStorage({
  destination: function(req, file, cb) { cb(null, uploadsDir) },
  filename: function(req, file, cb) {
    var uniqueName = Date.now() + '-' + Math.random().toString(36).slice(2) + path.extname(file.originalname)
    cb(null, uniqueName)
  }
})
var upload = multer({ storage: storage, limits: { fileSize: 20 * 1024 * 1024 } })

var db = new Database(path.join(__dirname, 'bitacora.db'))
db.pragma('journal_mode = WAL')

// TABLAS
db.exec(
  'CREATE TABLE IF NOT EXISTS projects (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  name TEXT NOT NULL,' +
  '  created_at TEXT DEFAULT (datetime(\'now\', \'localtime\'))' +
  ')'
)

db.exec(
  'CREATE TABLE IF NOT EXISTS properties (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  project_id INTEGER NOT NULL,' +
  '  unit_number TEXT NOT NULL,' +
  '  owner_name TEXT,' +
  '  owner_rut TEXT,' +
  '  owner_email TEXT,' +
  '  owner_phone TEXT,' +
  '  created_at TEXT DEFAULT (datetime(\'now\', \'localtime\')),' +
  '  FOREIGN KEY (project_id) REFERENCES projects(id)' +
  ')'
)

db.exec(
  'CREATE TABLE IF NOT EXISTS entries (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  property_id INTEGER NOT NULL,' +
  '  title TEXT,' +
  '  description TEXT,' +
  '  inspector_note TEXT,' +
  '  category TEXT DEFAULT \'otro\',' +
  '  severity TEXT DEFAULT \'leve\',' +
  '  location TEXT,' +
  '  recommendation TEXT,' +
  '  affected_elements TEXT,' +
  '  ai_generated INTEGER DEFAULT 0,' +
  '  created_at TEXT DEFAULT (datetime(\'now\', \'localtime\')),' +
  '  FOREIGN KEY (property_id) REFERENCES properties(id)' +
  ')'
)

db.exec(
  'CREATE TABLE IF NOT EXISTS images (' +
  '  id INTEGER PRIMARY KEY AUTOINCREMENT,' +
  '  entry_id INTEGER NOT NULL,' +
  '  filename TEXT NOT NULL,' +
  '  original_name TEXT,' +
  '  created_at TEXT DEFAULT (datetime(\'now\', \'localtime\')),' +
  '  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE' +
  ')'
)

var app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(uploadsDir))

var anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// === PROYECTOS ===
app.get('/projects', function(req, res) {
  var projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all()
  // Agregar conteo de propiedades
  var countProps = db.prepare('SELECT COUNT(*) as count FROM properties WHERE project_id = ?')
  projects.forEach(function(p) { p.property_count = countProps.get(p.id).count })
  res.json(projects)
})

app.post('/projects', function(req, res) {
  var name = req.body.name
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' })
  var result = db.prepare('INSERT INTO projects (name) VALUES (?)').run(name.trim())
  var project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid)
  project.property_count = 0
  res.json(project)
})

app.delete('/projects/:id', function(req, res) {
  var projectId = req.params.id
  var properties = db.prepare('SELECT id FROM properties WHERE project_id = ?').all(projectId)
  properties.forEach(function(prop) {
    var images = db.prepare('SELECT i.filename FROM images i JOIN entries e ON i.entry_id = e.id WHERE e.property_id = ?').all(prop.id)
    images.forEach(function(img) {
      var filepath = path.join(uploadsDir, img.filename)
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    })
    db.prepare('DELETE FROM images WHERE entry_id IN (SELECT id FROM entries WHERE property_id = ?)').run(prop.id)
    db.prepare('DELETE FROM entries WHERE property_id = ?').run(prop.id)
  })
  db.prepare('DELETE FROM properties WHERE project_id = ?').run(projectId)
  db.prepare('DELETE FROM projects WHERE id = ?').run(projectId)
  res.json({ success: true })
})

// === PROPIEDADES ===
app.get('/projects/:projectId/properties', function(req, res) {
  var properties = db.prepare('SELECT * FROM properties WHERE project_id = ? ORDER BY unit_number ASC').all(req.params.projectId)
  var countEntries = db.prepare('SELECT COUNT(*) as count FROM entries WHERE property_id = ?')
  properties.forEach(function(p) { p.entry_count = countEntries.get(p.id).count })
  res.json(properties)
})

app.post('/projects/:projectId/properties', function(req, res) {
  var b = req.body
  if (!b.unit_number || !b.unit_number.trim()) return res.status(400).json({ error: 'Numero de propiedad requerido' })
  var result = db.prepare(
    'INSERT INTO properties (project_id, unit_number, owner_name, owner_rut, owner_email, owner_phone) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.params.projectId, b.unit_number.trim(), b.owner_name || '', b.owner_rut || '', b.owner_email || '', b.owner_phone || '')
  var property = db.prepare('SELECT * FROM properties WHERE id = ?').get(result.lastInsertRowid)
  property.entry_count = 0
  res.json(property)
})

app.put('/properties/:id', function(req, res) {
  var b = req.body
  db.prepare(
    'UPDATE properties SET unit_number = ?, owner_name = ?, owner_rut = ?, owner_email = ?, owner_phone = ? WHERE id = ?'
  ).run(b.unit_number || '', b.owner_name || '', b.owner_rut || '', b.owner_email || '', b.owner_phone || '', req.params.id)
  var property = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id)
  var countEntries = db.prepare('SELECT COUNT(*) as count FROM entries WHERE property_id = ?')
  property.entry_count = countEntries.get(property.id).count
  res.json(property)
})

app.delete('/properties/:id', function(req, res) {
  var propId = req.params.id
  var images = db.prepare('SELECT i.filename FROM images i JOIN entries e ON i.entry_id = e.id WHERE e.property_id = ?').all(propId)
  images.forEach(function(img) {
    var filepath = path.join(uploadsDir, img.filename)
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  })
  db.prepare('DELETE FROM images WHERE entry_id IN (SELECT id FROM entries WHERE property_id = ?)').run(propId)
  db.prepare('DELETE FROM entries WHERE property_id = ?').run(propId)
  db.prepare('DELETE FROM properties WHERE id = ?').run(propId)
  res.json({ success: true })
})

// === HALLAZGOS ===
app.get('/properties/:propertyId/entries', function(req, res) {
  var entries = db.prepare('SELECT * FROM entries WHERE property_id = ? ORDER BY created_at DESC').all(req.params.propertyId)
  var getImages = db.prepare('SELECT * FROM images WHERE entry_id = ?')
  entries.forEach(function(entry) {
    entry.images = getImages.all(entry.id)
    entry.affected_elements = entry.affected_elements ? JSON.parse(entry.affected_elements) : []
  })
  res.json(entries)
})

app.post('/properties/:propertyId/entries', upload.array('photos', 10), async function(req, res) {
  try {
    var propertyId = req.params.propertyId
    var inspectorNote = req.body.inspector_note || ''
    var projectName = req.body.project_name || ''
    var unitNumber = req.body.unit_number || ''

    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Se requiere al menos una foto' })

    var imagesForAI = []
    for (var i = 0; i < req.files.length; i++) {
      var file = req.files[i]
      var imageBuffer = fs.readFileSync(file.path)
      imagesForAI.push({ base64: imageBuffer.toString('base64'), type: file.mimetype })
    }

    var content = []
    for (var j = 0; j < imagesForAI.length; j++) {
      content.push({ type: 'image', source: { type: 'base64', media_type: imagesForAI[j].type || 'image/jpeg', data: imagesForAI[j].base64 } })
    }

    content.push({
      type: 'text',
      text: 'Eres un inspector experto de post venta inmobiliaria en Chile. Analiza las imagenes de un hallazgo encontrado durante una inspeccion.\n\nProyecto: ' + (projectName || 'No especificado') + '\nPropiedad: ' + (unitNumber || 'No especificada') + '\n' + (inspectorNote ? 'Descripcion del inspector: "' + inspectorNote + '"' : '') + '\n\nBasandote en las imagenes' + (inspectorNote ? ' y la descripcion del inspector' : '') + ', genera un analisis detallado.\n\nResponde SOLO con un JSON valido (sin backticks, sin markdown, solo el JSON puro) con esta estructura:\n{"titulo": "Titulo corto y descriptivo del hallazgo", "descripcion": "Descripcion detallada y tecnica del hallazgo (2-3 oraciones)", "categoria": "Una de: estructural, terminaciones, instalaciones, humedad, electrico, otro", "severidad": "Una de: leve, moderado, grave, critico", "ubicacion_sugerida": "Ubicacion probable dentro de la propiedad", "recomendacion": "Accion correctiva recomendada (1-2 oraciones)", "elementos_afectados": ["lista", "de", "elementos", "afectados"]}',
    })

    var message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: content }],
    })

    var responseText = message.content.filter(function(b) { return b.type === 'text' }).map(function(b) { return b.text }).join('')
    var analysis = JSON.parse(responseText)

    var result = db.prepare(
      'INSERT INTO entries (property_id, title, description, inspector_note, category, severity, location, recommendation, affected_elements, ai_generated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)'
    ).run(propertyId, analysis.titulo, analysis.descripcion, inspectorNote, analysis.categoria, analysis.severidad, analysis.ubicacion_sugerida, analysis.recomendacion, JSON.stringify(analysis.elementos_afectados))

    var entryId = result.lastInsertRowid
    var insertImage = db.prepare('INSERT INTO images (entry_id, filename, original_name) VALUES (?, ?, ?)')
    for (var k = 0; k < req.files.length; k++) {
      insertImage.run(entryId, req.files[k].filename, req.files[k].originalname)
    }

    var entry = db.prepare('SELECT * FROM entries WHERE id = ?').get(entryId)
    entry.images = db.prepare('SELECT * FROM images WHERE entry_id = ?').all(entryId)
    entry.affected_elements = JSON.parse(entry.affected_elements)

    res.json({ success: true, entry: entry })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/entries/:id', function(req, res) {
  var entryId = req.params.id
  var images = db.prepare('SELECT filename FROM images WHERE entry_id = ?').all(entryId)
  images.forEach(function(img) {
    var filepath = path.join(uploadsDir, img.filename)
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
  })
  db.prepare('DELETE FROM images WHERE entry_id = ?').run(entryId)
  db.prepare('DELETE FROM entries WHERE id = ?').run(entryId)
  res.json({ success: true })
})

var PORT = process.env.PORT || 3001
app.listen(PORT, function() { console.log('Servidor corriendo en puerto ' + PORT) })