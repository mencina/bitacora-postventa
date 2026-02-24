var express = require('express')
var cors = require('cors')
var path = require('path')
var fs = require('fs')
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
var Anthropic = require('@anthropic-ai/sdk').default
var { Pool } = require('pg')
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

var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      unit_number TEXT NOT NULL,
      owner_name TEXT,
      owner_rut TEXT,
      owner_email TEXT,
      owner_phone TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id),
      title TEXT,
      description TEXT,
      inspector_note TEXT,
      category TEXT DEFAULT 'otro',
      severity TEXT DEFAULT 'leve',
      location TEXT,
      recommendation TEXT,
      affected_elements TEXT,
      ai_generated INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('Base de datos lista')
}

var app = express()
app.use(cors({
  origin: [
    'https://bitacora-postventa.vercel.app',
    'https://bitacorapro.cl',
    'https://www.bitacorapro.cl',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(express.json({ limit: '50mb' }))
app.use('/uploads', express.static(uploadsDir))

var anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// === PROYECTOS ===
app.get('/projects', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM projects ORDER BY created_at DESC')
    var projects = result.rows
    for (var i = 0; i < projects.length; i++) {
      var count = await pool.query('SELECT COUNT(*) as count FROM properties WHERE project_id = $1', [projects[i].id])
      projects[i].property_count = parseInt(count.rows[0].count)
    }
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/projects', async function(req, res) {
  try {
    var name = req.body.name
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' })
    var result = await pool.query('INSERT INTO projects (name) VALUES ($1) RETURNING *', [name.trim()])
    var project = result.rows[0]
    project.property_count = 0
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/projects/:id', async function(req, res) {
  try {
    var projectId = req.params.id
    var props = await pool.query('SELECT id FROM properties WHERE project_id = $1', [projectId])
    for (var i = 0; i < props.rows.length; i++) {
      var propId = props.rows[i].id
      var images = await pool.query(
        'SELECT i.filename FROM images i JOIN entries e ON i.entry_id = e.id WHERE e.property_id = $1',
        [propId]
      )
      images.rows.forEach(function(img) {
        var filepath = path.join(uploadsDir, img.filename)
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
      })
      await pool.query('DELETE FROM images WHERE entry_id IN (SELECT id FROM entries WHERE property_id = $1)', [propId])
      await pool.query('DELETE FROM entries WHERE property_id = $1', [propId])
    }
    await pool.query('DELETE FROM properties WHERE project_id = $1', [projectId])
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === PROPIEDADES ===
app.get('/projects/:projectId/properties', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM properties WHERE project_id = $1 ORDER BY unit_number ASC', [req.params.projectId])
    var properties = result.rows
    for (var i = 0; i < properties.length; i++) {
      var count = await pool.query('SELECT COUNT(*) as count FROM entries WHERE property_id = $1', [properties[i].id])
      properties[i].entry_count = parseInt(count.rows[0].count)
    }
    res.json(properties)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/projects/:projectId/properties', async function(req, res) {
  try {
    var b = req.body
    if (!b.unit_number || !b.unit_number.trim()) return res.status(400).json({ error: 'Numero de propiedad requerido' })
    var result = await pool.query(
      'INSERT INTO properties (project_id, unit_number, owner_name, owner_rut, owner_email, owner_phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.params.projectId, b.unit_number.trim(), b.owner_name || '', b.owner_rut || '', b.owner_email || '', b.owner_phone || '']
    )
    var property = result.rows[0]
    property.entry_count = 0
    res.json(property)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.put('/properties/:id', async function(req, res) {
  try {
    var b = req.body
    await pool.query(
      'UPDATE properties SET unit_number = $1, owner_name = $2, owner_rut = $3, owner_email = $4, owner_phone = $5 WHERE id = $6',
      [b.unit_number || '', b.owner_name || '', b.owner_rut || '', b.owner_email || '', b.owner_phone || '', req.params.id]
    )
    var result = await pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id])
    var property = result.rows[0]
    var count = await pool.query('SELECT COUNT(*) as count FROM entries WHERE property_id = $1', [property.id])
    property.entry_count = parseInt(count.rows[0].count)
    res.json(property)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/properties/:id', async function(req, res) {
  try {
    var propId = req.params.id
    var images = await pool.query(
      'SELECT i.filename FROM images i JOIN entries e ON i.entry_id = e.id WHERE e.property_id = $1',
      [propId]
    )
    images.rows.forEach(function(img) {
      var filepath = path.join(uploadsDir, img.filename)
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    })
    await pool.query('DELETE FROM images WHERE entry_id IN (SELECT id FROM entries WHERE property_id = $1)', [propId])
    await pool.query('DELETE FROM entries WHERE property_id = $1', [propId])
    await pool.query('DELETE FROM properties WHERE id = $1', [propId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === HALLAZGOS ===
app.get('/properties/:propertyId/entries', async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM entries WHERE property_id = $1 ORDER BY created_at DESC', [req.params.propertyId])
    var entries = result.rows
    for (var i = 0; i < entries.length; i++) {
      var imgs = await pool.query('SELECT * FROM images WHERE entry_id = $1', [entries[i].id])
      entries[i].images = imgs.rows
      entries[i].affected_elements = entries[i].affected_elements ? JSON.parse(entries[i].affected_elements) : []
    }
    res.json(entries)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
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

    var entryResult = await pool.query(
      'INSERT INTO entries (property_id, title, description, inspector_note, category, severity, location, recommendation, affected_elements, ai_generated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1) RETURNING *',
      [propertyId, analysis.titulo, analysis.descripcion, inspectorNote, analysis.categoria, analysis.severidad, analysis.ubicacion_sugerida, analysis.recomendacion, JSON.stringify(analysis.elementos_afectados)]
    )
    var entry = entryResult.rows[0]

    for (var k = 0; k < req.files.length; k++) {
      await pool.query('INSERT INTO images (entry_id, filename, original_name) VALUES ($1, $2, $3)', [entry.id, req.files[k].filename, req.files[k].originalname])
    }

    var imgs = await pool.query('SELECT * FROM images WHERE entry_id = $1', [entry.id])
    entry.images = imgs.rows
    entry.affected_elements = JSON.parse(entry.affected_elements)

    res.json({ success: true, entry: entry })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

app.delete('/entries/:id', async function(req, res) {
  try {
    var entryId = req.params.id
    var images = await pool.query('SELECT filename FROM images WHERE entry_id = $1', [entryId])
    images.rows.forEach(function(img) {
      var filepath = path.join(uploadsDir, img.filename)
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
    })
    await pool.query('DELETE FROM images WHERE entry_id = $1', [entryId])
    await pool.query('DELETE FROM entries WHERE id = $1', [entryId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

var PORT = process.env.PORT || 3001
initDB().then(function() {
  app.listen(PORT, function() { console.log('Servidor corriendo en puerto ' + PORT) })
}).catch(function(err) {
  console.error('Error iniciando base de datos:', err)
  process.exit(1)
})
