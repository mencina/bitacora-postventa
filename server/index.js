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
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var { Resend } = require('resend')
var cloudinary = require('cloudinary').v2

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Multer en memoria (no guarda en disco)
var upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

// Subir buffer a Cloudinary
function uploadToCloudinary(buffer, mimetype) {
  return new Promise(function(resolve, reject) {
    var stream = cloudinary.uploader.upload_stream(
      { folder: 'bitacora', resource_type: 'image' },
      function(error, result) {
        if (error) reject(error)
        else resolve(result.secure_url)
      }
    )
    stream.end(buffer)
  })
}

var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

async function initDB() {
  // Empresas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Migración: agregar columna active si no existe (para BD ya creadas)
  await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`)
  // Usuarios
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'inspector',
      must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Migración: agregar columna must_change_password si no existe
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE`)
  // Migración: agregar columna status en entries si no existe
  await pool.query(`ALTER TABLE entries ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pendiente'`)
  // Proyectos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Miembros de proyecto
  await pool.query(`
    CREATE TABLE IF NOT EXISTS project_members (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(project_id, user_id)
    )
  `)
  // Propiedades
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
  // Hallazgos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id),
      created_by INTEGER REFERENCES users(id),
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
  // Imágenes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      original_name TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Invitaciones
  await pool.query(`
    CREATE TABLE IF NOT EXISTS invitations (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Recuperación de contraseña
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Tokens de vista pública de propiedad
  await pool.query(`
    CREATE TABLE IF NOT EXISTS property_tokens (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE UNIQUE,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Actas de entrega
  await pool.query(`
    CREATE TABLE IF NOT EXISTS delivery_acts (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE UNIQUE,
      data JSONB NOT NULL DEFAULT '{}',
      signature_owner TEXT,
      signature_inspector TEXT,
      signed_at TIMESTAMP,
      signed_by_name TEXT,
      edited_after_signing BOOLEAN NOT NULL DEFAULT FALSE,
      entries_snapshot JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
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
    'http://localhost:5173',
    'http://192.168.6.1:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret']
}))
app.use(express.json({ limit: '50mb' }))

var anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
var JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal'
var resend = new Resend(process.env.RESEND_API_KEY)
var APP_URL = process.env.APP_URL || (process.env.NODE_ENV === 'production' ? 'https://www.bitacorapro.cl' : 'http://localhost:5173')

// Middleware para verificar token
function authMiddleware(req, res, next) {
  var authHeader = req.headers['authorization']
  if (!authHeader) return res.status(401).json({ error: 'No autorizado' })
  var token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No autorizado' })
  try {
    var decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// Middleware solo para admin
function adminMiddleware(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Solo el administrador puede hacer esto' })
  next()
}

// === AUTENTICACIÓN ===

app.post('/auth/register', async function(req, res) {
  try {
    var { company_name, name, email, password } = req.body
    if (!company_name || !name || !email || !password) return res.status(400).json({ error: 'Todos los campos son requeridos' })

    var existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Ya existe una cuenta con ese email' })

    var companyResult = await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING *', [company_name.trim()])
    var company = companyResult.rows[0]

    var hash = await bcrypt.hash(password, 10)
    var userResult = await pool.query(
      'INSERT INTO users (company_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, company_id',
      [company.id, name.trim(), email.trim().toLowerCase(), hash, 'admin']
    )
    var user = userResult.rows[0]
    user.company_name = company.name

    var token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: user.company_id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/auth/login', async function(req, res) {
  try {
    var { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' })

    var result = await pool.query(
      'SELECT u.*, c.name as company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.email = $1',
      [email.trim().toLowerCase()]
    )
    if (result.rows.length === 0) return res.status(400).json({ error: 'Email o contraseña incorrectos' })

    var user = result.rows[0]
    var valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(400).json({ error: 'Email o contraseña incorrectos' })

    // Verificar que la empresa esté activa
    var company = await pool.query('SELECT active FROM companies WHERE id = $1', [user.company_id])
    if (company.rows.length > 0 && !company.rows[0].active) {
      return res.status(403).json({ error: 'Esta cuenta está desactivada. Contacta a BitácoraPro.' })
    }

    var token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: user.company_id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id, company_name: user.company_name, must_change_password: user.must_change_password }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/auth/me', authMiddleware, async function(req, res) {
  try {
    var result = await pool.query(
      'SELECT u.id, u.name, u.email, u.role, u.company_id, c.name as company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.id = $1',
      [req.user.id]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === PROYECTOS ===
app.get('/projects', authMiddleware, async function(req, res) {
  try {
    var result
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM projects WHERE company_id = $1 ORDER BY created_at DESC', [req.user.company_id])
    } else {
      // Inspectores solo ven proyectos donde fueron invitados
      result = await pool.query(
        'SELECT p.* FROM projects p JOIN project_members pm ON p.id = pm.project_id WHERE pm.user_id = $1 ORDER BY p.created_at DESC',
        [req.user.id]
      )
    }
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

app.post('/projects', authMiddleware, adminMiddleware, async function(req, res) {
  try {
    var name = req.body.name
    if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' })
    var result = await pool.query('INSERT INTO projects (name, company_id) VALUES ($1, $2) RETURNING *', [name.trim(), req.user.company_id])
    var project = result.rows[0]
    project.property_count = 0
    res.json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/projects/:id', authMiddleware, adminMiddleware, async function(req, res) {
  try {
    var projectId = req.params.id
    var props = await pool.query('SELECT id FROM properties WHERE project_id = $1', [projectId])
    for (var i = 0; i < props.rows.length; i++) {
      var propId = props.rows[i].id
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
app.get('/projects/:projectId/properties', authMiddleware, async function(req, res) {
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

app.post('/projects/:projectId/properties', authMiddleware, async function(req, res) {
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

app.put('/properties/:id', authMiddleware, async function(req, res) {
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

app.delete('/properties/:id', authMiddleware, async function(req, res) {
  try {
    var propId = req.params.id
    await pool.query('DELETE FROM images WHERE entry_id IN (SELECT id FROM entries WHERE property_id = $1)', [propId])
    await pool.query('DELETE FROM entries WHERE property_id = $1', [propId])
    await pool.query('DELETE FROM properties WHERE id = $1', [propId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === HALLAZGOS ===
app.get('/properties/:propertyId/entries', authMiddleware, async function(req, res) {
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

app.post('/properties/:propertyId/entries', authMiddleware, upload.array('photos', 10), async function(req, res) {
  try {
    var propertyId = req.params.propertyId
    var inspectorNote = req.body.inspector_note || ''
    var projectName = req.body.project_name || ''
    var unitNumber = req.body.unit_number || ''

    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'Se requiere al menos una foto' })

    // 1. Subir originales a Cloudinary primero (máxima calidad para el registro)
    var cloudUrls = []
    for (var k = 0; k < req.files.length; k++) {
      var cloudUrl = await uploadToCloudinary(req.files[k].buffer, req.files[k].mimetype)
      cloudUrls.push({ url: cloudUrl, originalName: req.files[k].originalname })
    }

    // 2. Preparar imágenes para IA usando URL transformada de Cloudinary
    // c_limit,w_1200,h_1200 reduce a máx 1200px sin recortar, q_auto optimiza calidad
    // Esto garantiza que cada imagen sea < 4MB para la API de Anthropic
    var content = []
    for (var j = 0; j < cloudUrls.length; j++) {
      // Insertar transformación en la URL de Cloudinary: /upload/ → /upload/c_limit,w_1200,h_1200,q_auto/
      var originalUrl = cloudUrls[j].url
      var aiUrl = originalUrl.replace('/upload/', '/upload/c_limit,w_1200,h_1200,q_auto:good,f_jpg/')
      content.push({ type: 'image', source: { type: 'url', url: aiUrl } })
    }

    content.push({
      type: 'text',
      text: 'Eres un inspector experto de post venta inmobiliaria en Chile. Analiza las imagenes de un hallazgo encontrado durante una inspeccion.\n\nProyecto: ' + (projectName || 'No especificado') + '\nPropiedad: ' + (unitNumber || 'No especificada') + '\n' + (inspectorNote ? 'Descripcion del inspector: "' + inspectorNote + '"' : '') + '\n\nBasandote en las imagenes' + (inspectorNote ? ' y la descripcion del inspector' : '') + ', genera un analisis detallado.\n\nResponde SOLO con un JSON valido (sin backticks, sin markdown, solo el JSON puro) con esta estructura:\n{"titulo": "Titulo corto y descriptivo del hallazgo", "descripcion": "Descripcion detallada y tecnica del hallazgo (2-3 oraciones)", "categoria": "Una de: estructural, terminaciones, instalaciones, humedad, electrico, otro", "severidad": "Una de: leve, moderado, grave, critico", "ubicacion_sugerida": "Ubicacion probable dentro de la propiedad", "recomendacion": "Accion correctiva recomendada (1-2 oraciones)", "elementos_afectados": ["lista", "de", "elementos", "afectados"]}',
    })

    // 3. Analizar con Claude
    var message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: content }],
    })

    var responseText = message.content.filter(function(b) { return b.type === 'text' }).map(function(b) { return b.text }).join('')
    var analysis = JSON.parse(responseText)

    // 4. Guardar hallazgo en BD
    var entryResult = await pool.query(
      'INSERT INTO entries (property_id, created_by, title, description, inspector_note, category, severity, location, recommendation, affected_elements, ai_generated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1) RETURNING *',
      [propertyId, req.user.id, analysis.titulo, analysis.descripcion, inspectorNote, analysis.categoria, analysis.severidad, analysis.ubicacion_sugerida, analysis.recomendacion, JSON.stringify(analysis.elementos_afectados)]
    )
    var entry = entryResult.rows[0]

    // 5. Guardar URLs originales de Cloudinary en BD
    for (var m = 0; m < cloudUrls.length; m++) {
      await pool.query('INSERT INTO images (entry_id, filename, original_name) VALUES ($1, $2, $3)', [entry.id, cloudUrls[m].url, cloudUrls[m].originalName])
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

app.put('/entries/:id', authMiddleware, async function(req, res) {
  try {
    var b = req.body
    var validStatuses = ['pendiente', 'en_progreso', 'resuelto']
    var newStatus = b.status && validStatuses.includes(b.status) ? b.status : null
    await pool.query(
      `UPDATE entries SET title = $1, description = $2, recommendation = $3, category = $4, severity = $5, location = $6, status = CASE WHEN $8::text IS NOT NULL THEN $8::text ELSE status END WHERE id = $7`,
      [b.title || '', b.description || '', b.recommendation || '', b.category || 'otro', b.severity || 'leve', b.location || '', req.params.id, newStatus]
    )
    var result = await pool.query(
      'SELECT e.*, array_to_json(array(SELECT row_to_json(i) FROM images i WHERE i.entry_id = e.id)) as images_raw FROM entries e WHERE e.id = $1',
      [req.params.id]
    )
    var entry = result.rows[0]
    entry.affected_elements = entry.affected_elements ? JSON.parse(entry.affected_elements) : []
    // Re-fetch images properly
    var imgs = await pool.query('SELECT * FROM images WHERE entry_id = $1', [entry.id])
    entry.images = imgs.rows
    delete entry.images_raw
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/entries/:id', authMiddleware, async function(req, res) {
  try {
    var entryId = req.params.id
    await pool.query('DELETE FROM images WHERE entry_id = $1', [entryId])
    await pool.query('DELETE FROM entries WHERE id = $1', [entryId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === INVITACIONES ===

// GET /projects/:id/team — listar miembros e invitaciones pendientes del proyecto
app.get('/projects/:id/team', authMiddleware, adminMiddleware, async function(req, res) {
  try {
    var projectId = req.params.id
    var members = await pool.query(
      'SELECT u.id, u.name, u.email, u.role, pm.created_at as joined_at FROM users u JOIN project_members pm ON u.id = pm.user_id WHERE pm.project_id = $1',
      [projectId]
    )
    var pending = await pool.query(
      'SELECT id, email, created_at FROM invitations WHERE project_id = $1 AND status = $2',
      [projectId, 'pending']
    )
    res.json({ members: members.rows, pending_invitations: pending.rows })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /projects/:id/invite — enviar invitación
app.post('/projects/:id/invite', authMiddleware, adminMiddleware, async function(req, res) {
  try {
    var projectId = req.params.id
    var { email } = req.body
    if (!email || !email.trim()) return res.status(400).json({ error: 'Email requerido' })
    var emailNorm = email.trim().toLowerCase()

    // Verificar que el proyecto pertenece a la empresa del admin
    var project = await pool.query('SELECT * FROM projects WHERE id = $1 AND company_id = $2', [projectId, req.user.company_id])
    if (project.rows.length === 0) return res.status(403).json({ error: 'No autorizado' })

    // Ver si ya es miembro
    var existing = await pool.query(
      'SELECT u.id FROM users u JOIN project_members pm ON u.id = pm.user_id WHERE u.email = $1 AND pm.project_id = $2',
      [emailNorm, projectId]
    )
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Ese usuario ya es miembro del proyecto' })

    // Ver si ya hay invitación pendiente
    var existingInv = await pool.query(
      'SELECT id FROM invitations WHERE email = $1 AND project_id = $2 AND status = $3',
      [emailNorm, projectId, 'pending']
    )
    if (existingInv.rows.length > 0) return res.status(400).json({ error: 'Ya hay una invitación pendiente para ese email' })

    // Crear token único
    var invToken = require('crypto').randomBytes(32).toString('hex')
    await pool.query(
      'INSERT INTO invitations (email, project_id, company_id, token, status) VALUES ($1, $2, $3, $4, $5)',
      [emailNorm, projectId, req.user.company_id, invToken, 'pending']
    )

    var inviteUrl = process.env.APP_URL + '/invitacion/' + invToken
    var projectName = project.rows[0].name

    // Obtener nombre de la empresa
    var companyResult = await pool.query('SELECT name FROM companies WHERE id = $1', [req.user.company_id])
    var companyName = companyResult.rows[0].name
    
    // Obtener nombre del usuario
    var adminResult = await pool.query('SELECT name FROM users WHERE id = $1', [req.user.id])
    var adminName = adminResult.rows[0].name

    // Enviar email con Resend
    await resend.emails.send({
      from: 'BitácoraPro <noreply@contacto.bitacorapro.cl>',
      to: emailNorm,
      subject: 'Te invitaron a unirte a ' + projectName + ' en BitácoraPro',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1A1814; font-size: 24px; margin-bottom: 8px;">Te invitaron a BitácoraPro</h2>
          <p style="color: #6B6760; margin-bottom: 24px;">
            <strong>${adminName}</strong> de <strong>${companyName}</strong> te invita a colaborar en el proyecto <strong>${projectName}</strong>.
          </p>
          <a href="${inviteUrl}" style="display:inline-block;background:#1A1814;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500;font-size:15px;">
            Aceptar invitación →
          </a>
          <p style="color:#aaa;font-size:12px;margin-top:32px;">Si no esperabas esta invitación, puedes ignorar este email.</p>
        </div>
      `
    })

    res.json({ success: true, message: 'Invitación enviada a ' + emailNorm })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /invitations/:token — validar token de invitación (pantalla de registro)
app.get('/invitations/:token', async function(req, res) {
  try {
    var result = await pool.query(
      'SELECT i.*, p.name as project_name, c.name as company_name FROM invitations i JOIN projects p ON i.project_id = p.id JOIN companies c ON i.company_id = c.id WHERE i.token = $1',
      [req.params.token]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Invitación no encontrada' })
    var inv = result.rows[0]
    if (inv.status !== 'pending') return res.status(400).json({ error: 'Esta invitación ya fue utilizada' })
    res.json({ email: inv.email, project_name: inv.project_name, company_name: inv.company_name, company_id: inv.company_id, project_id: inv.project_id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /invitations/:token/accept — el inspector se registra via invitación
app.post('/invitations/:token/accept', async function(req, res) {
  try {
    var { name, password } = req.body
    if (!name || !password) return res.status(400).json({ error: 'Nombre y contraseña requeridos' })
    if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

    var invResult = await pool.query(
      'SELECT i.*, p.name as project_name, c.name as company_name FROM invitations i JOIN projects p ON i.project_id = p.id JOIN companies c ON i.company_id = c.id WHERE i.token = $1',
      [req.params.token]
    )
    if (invResult.rows.length === 0) return res.status(404).json({ error: 'Invitación no encontrada' })
    var inv = invResult.rows[0]
    if (inv.status !== 'pending') return res.status(400).json({ error: 'Esta invitación ya fue utilizada' })

    // Ver si ya existe usuario con ese email
    var existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [inv.email])
    var user
    if (existingUser.rows.length > 0) {
      // El usuario ya existe, solo lo agregamos al proyecto
      user = existingUser.rows[0]
    } else {
      // Crear usuario nuevo como inspector
      var hash = await bcrypt.hash(password, 10)
      var userResult = await pool.query(
        'INSERT INTO users (company_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [inv.company_id, name.trim(), inv.email, hash, 'inspector']
      )
      user = userResult.rows[0]
    }

    // Agregar al proyecto (ignorar si ya es miembro)
    await pool.query(
      'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [inv.project_id, user.id]
    )

    // Marcar invitación como aceptada
    await pool.query('UPDATE invitations SET status = $1 WHERE token = $2', ['accepted', req.params.token])

    var token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: user.company_id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id, company_name: inv.company_name } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /projects/:projectId/members/:userId — eliminar inspector del proyecto
app.delete('/projects/:projectId/members/:userId', authMiddleware, adminMiddleware, async function(req, res) {
  try {
    await pool.query('DELETE FROM project_members WHERE project_id = $1 AND user_id = $2', [req.params.projectId, req.params.userId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /invitations/:id — cancelar invitación pendiente
app.delete('/invitations/:id', authMiddleware, adminMiddleware, async function(req, res) {
  try {
    await pool.query('DELETE FROM invitations WHERE id = $1 AND company_id = $2', [req.params.id, req.user.company_id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === PANEL DE SUPERADMIN ===

var ADMIN_SECRET = process.env.ADMIN_SECRET || 'bitacora-admin-2026'

function superadminMiddleware(req, res, next) {
  var secret = req.headers['x-admin-secret']
  if (!secret || secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' })
  next()
}

// === ACTAS DE ENTREGA ===

// GET /properties/:id/delivery-act — obtener acta (o null si no existe)
app.get('/properties/:id/delivery-act', authMiddleware, async function(req, res) {
  try {
    var result = await pool.query('SELECT * FROM delivery_acts WHERE property_id = $1', [req.params.id])
    if (result.rows.length === 0) return res.json(null)
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /properties/:id/delivery-act — crear acta
app.post('/properties/:id/delivery-act', authMiddleware, async function(req, res) {
  try {
    var existing = await pool.query('SELECT id FROM delivery_acts WHERE property_id = $1', [req.params.id])
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Ya existe un acta para esta propiedad' })
    var result = await pool.query(
      'INSERT INTO delivery_acts (property_id, data) VALUES ($1, $2) RETURNING *',
      [req.params.id, JSON.stringify(req.body.data || {})]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /properties/:id/delivery-act — actualizar acta
app.put('/properties/:id/delivery-act', authMiddleware, async function(req, res) {
  try {
    var existing = await pool.query('SELECT * FROM delivery_acts WHERE property_id = $1', [req.params.id])
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Acta no encontrada' })
    var act = existing.rows[0]
    var wasSigned = !!act.signed_at
    var { data, signature_owner, signature_inspector, signed_by_name, sign_now, entries_snapshot } = req.body

    var signedAt = act.signed_at
    var editedAfterSigning = act.edited_after_signing

    // Si se está firmando ahora
    if (sign_now && !wasSigned) {
      signedAt = new Date()
    }
    // Si ya estaba firmada y se editan datos
    if (wasSigned && !sign_now && data) {
      editedAfterSigning = true
    }

    var result = await pool.query(
      `UPDATE delivery_acts SET
        data = COALESCE($1::jsonb, data),
        signature_owner = COALESCE($2, signature_owner),
        signature_inspector = COALESCE($3, signature_inspector),
        signed_by_name = COALESCE($4, signed_by_name),
        signed_at = $5,
        edited_after_signing = $6,
        entries_snapshot = COALESCE($7::jsonb, entries_snapshot),
        updated_at = NOW()
      WHERE property_id = $8 RETURNING *`,
      [
        data ? JSON.stringify(data) : null,
        signature_owner || null,
        signature_inspector || null,
        signed_by_name || null,
        signedAt,
        editedAfterSigning,
        entries_snapshot ? JSON.stringify(entries_snapshot) : null,
        req.params.id
      ]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /properties/:id/send-delivery-act-pdf — enviar PDF del acta al propietario por email
app.post('/properties/:id/send-delivery-act-pdf', authMiddleware, async function(req, res) {
  try {
    var { pdfBase64, ownerEmail, ownerName, unitNumber, projectName } = req.body
    if (!pdfBase64) return res.status(400).json({ error: 'Falta el PDF' })
    if (!ownerEmail) return res.status(400).json({ error: 'El acta no tiene un email de propietario registrado' })

    var { error } = await resend.emails.send({
      from: 'BitácoraPro <noreply@contacto.bitacorapro.cl>',
      to: ownerEmail,
      subject: 'Acta de entrega — ' + (unitNumber || 'Propiedad'),
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #1800AD; border-radius: 10px 10px 0 0; padding: 24px 28px;">
            <h2 style="color: #fff; margin: 0; font-size: 20px; font-weight: 700;">BitácoraPro</h2>
          </div>
          <div style="background: #fff; border: 1px solid #E0E2EB; border-top: none; border-radius: 0 0 10px 10px; padding: 28px;">
            <p style="color: #0F111A; margin: 0 0 14px; font-size: 15px;">
              Estimado/a <strong>${ownerName || 'propietario/a'}</strong>,
            </p>
            <p style="color: #374151; margin: 0 0 14px; font-size: 15px;">
              Adjunto encontrará el acta de entrega de la propiedad <strong>${unitNumber || ''}</strong>
              del proyecto <strong>${projectName || ''}</strong>, firmada por ambas partes.
            </p>
            <p style="color: #374151; margin: 0 0 24px; font-size: 15px;">
              Le recomendamos guardar este documento como respaldo del proceso de entrega.
            </p>
            <hr style="border: none; border-top: 1px solid #E0E2EB; margin: 0 0 20px;" />
            <p style="color: #6B6F82; font-size: 12px; margin: 0;">
              Este correo fue enviado automáticamente por BitácoraPro.<br/>
              Si tiene dudas, contacte directamente a su ejecutivo.
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'Acta_' + (unitNumber || 'propiedad').replace(/\s+/g, '_') + '.pdf',
          content: pdfBase64,
        }
      ]
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: 'Error al enviar el email' })
    }

    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /properties/:id/public-token — obtener (o crear) token público de una propiedad
app.get('/properties/:id/public-token', authMiddleware, async function(req, res) {
  try {
    var propertyId = req.params.id
    var existing = await pool.query('SELECT token FROM property_tokens WHERE property_id = $1', [propertyId])
    if (existing.rows.length > 0) return res.json({ token: existing.rows[0].token })
    var crypto = require('crypto')
    var token = crypto.randomBytes(20).toString('hex')
    await pool.query('INSERT INTO property_tokens (property_id, token) VALUES ($1, $2)', [propertyId, token])
    res.json({ token: token })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /public/properties/:token — vista pública de una propiedad con todos sus hallazgos
app.get('/public/properties/:token', async function(req, res) {
  try {
    var tokenResult = await pool.query(
      `SELECT pt.property_id, p.unit_number, p.owner_name, p.project_id, proj.name AS project_name
       FROM property_tokens pt
       JOIN properties p ON pt.property_id = p.id
       JOIN projects proj ON p.project_id = proj.id
       WHERE pt.token = $1`,
      [req.params.token]
    )
    if (tokenResult.rows.length === 0) return res.status(404).json({ error: 'Página no encontrada' })
    var prop = tokenResult.rows[0]

    var entriesResult = await pool.query(
      'SELECT * FROM entries WHERE property_id = $1 ORDER BY created_at DESC',
      [prop.property_id]
    )
    var entries = entriesResult.rows
    for (var i = 0; i < entries.length; i++) {
      var imgs = await pool.query('SELECT * FROM images WHERE entry_id = $1', [entries[i].id])
      entries[i].images = imgs.rows
      entries[i].affected_elements = entries[i].affected_elements ? JSON.parse(entries[i].affected_elements) : []
    }

    var resueltos = entries.filter(function(e) { return e.status === 'resuelto' }).length
    var en_progreso = entries.filter(function(e) { return e.status === 'en_progreso' }).length
    var pendientes = entries.filter(function(e) { return e.status === 'pendiente' || !e.status }).length

    res.json({
      unit_number: prop.unit_number,
      owner_name: prop.owner_name,
      project_name: prop.project_name,
      entries: entries,
      summary: { total: entries.length, resueltos: resueltos, en_progreso: en_progreso, pendientes: pendientes }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /public/entries/:entryId — vista pública de un hallazgo (sin autenticación)
app.get('/public/entries/:entryId', async function(req, res) {
  try {
    var entryId = req.params.entryId
    // Obtener hallazgo con contexto de propiedad y proyecto
    var result = await pool.query(
      `SELECT e.*, p.unit_number, p.project_id,
              proj.name AS project_name
       FROM entries e
       JOIN properties p ON e.property_id = p.id
       JOIN projects proj ON p.project_id = proj.id
       WHERE e.id = $1`,
      [entryId]
    )
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hallazgo no encontrado' })
    var entry = result.rows[0]
    // Imágenes
    var imgs = await pool.query('SELECT * FROM images WHERE entry_id = $1', [entry.id])
    entry.images = imgs.rows
    entry.affected_elements = entry.affected_elements ? JSON.parse(entry.affected_elements) : []
    // Omitir datos sensibles del propietario
    delete entry.property_id
    res.json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /admin/stats — todas las empresas con métricas de uso
app.get('/admin/stats', superadminMiddleware, async function(req, res) {
  try {
    var companies = await pool.query('SELECT * FROM companies ORDER BY created_at DESC')
    var result = []
    for (var i = 0; i < companies.rows.length; i++) {
      var c = companies.rows[i]
      var adminUser = await pool.query(
        'SELECT name, email, created_at FROM users WHERE company_id = $1 AND role = $2 LIMIT 1',
        [c.id, 'admin']
      )
      var userCount = await pool.query('SELECT COUNT(*) as count FROM users WHERE company_id = $1', [c.id])
      var projectCount = await pool.query('SELECT COUNT(*) as count FROM projects WHERE company_id = $1', [c.id])
      var propertyCount = await pool.query(
        'SELECT COUNT(*) as count FROM properties p JOIN projects pr ON p.project_id = pr.id WHERE pr.company_id = $1',
        [c.id]
      )
      var entryCount = await pool.query(
        'SELECT COUNT(*) as count FROM entries e JOIN properties p ON e.property_id = p.id JOIN projects pr ON p.project_id = pr.id WHERE pr.company_id = $1',
        [c.id]
      )
      var lastActivity = await pool.query(
        'SELECT MAX(e.created_at) as last_entry FROM entries e JOIN properties p ON e.property_id = p.id JOIN projects pr ON p.project_id = pr.id WHERE pr.company_id = $1',
        [c.id]
      )
      result.push({
        id: c.id,
        company_name: c.name,
        active: c.active,
        created_at: c.created_at,
        admin_name: adminUser.rows[0] ? adminUser.rows[0].name : '-',
        admin_email: adminUser.rows[0] ? adminUser.rows[0].email : '-',
        users: parseInt(userCount.rows[0].count),
        projects: parseInt(projectCount.rows[0].count),
        properties: parseInt(propertyCount.rows[0].count),
        entries: parseInt(entryCount.rows[0].count),
        last_activity: lastActivity.rows[0].last_entry || null
      })
    }
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/companies/:id — editar nombre de empresa y datos del admin
app.put('/admin/companies/:id', superadminMiddleware, async function(req, res) {
  try {
    var { company_name, admin_name, admin_email } = req.body
    if (!company_name || !admin_name || !admin_email) return res.status(400).json({ error: 'Todos los campos son requeridos' })
    var companyCheck = await pool.query('SELECT id FROM companies WHERE id = $1', [req.params.id])
    if (companyCheck.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' })
    await pool.query('UPDATE companies SET name = $1 WHERE id = $2', [company_name, req.params.id])
    await pool.query('UPDATE users SET name = $1, email = $2 WHERE company_id = $3 AND role = $4', [admin_name, admin_email, req.params.id, 'admin'])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /admin/companies/:id/toggle — desactivar o reactivar empresa
app.put('/admin/companies/:id/toggle', superadminMiddleware, async function(req, res) {
  try {
    var result = await pool.query('SELECT active FROM companies WHERE id = $1', [req.params.id])
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' })
    var newActive = !result.rows[0].active
    await pool.query('UPDATE companies SET active = $1 WHERE id = $2', [newActive, req.params.id])
    res.json({ success: true, active: newActive })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /admin/companies/:id — eliminar empresa y todos sus datos
app.delete('/admin/companies/:id', superadminMiddleware, async function(req, res) {
  try {
    var companyId = req.params.id
    // Eliminar en cascada: imágenes → hallazgos → propiedades → proyectos → miembros → invitaciones → usuarios → empresa
    var projects = await pool.query('SELECT id FROM projects WHERE company_id = $1', [companyId])
    for (var i = 0; i < projects.rows.length; i++) {
      var pid = projects.rows[i].id
      var props = await pool.query('SELECT id FROM properties WHERE project_id = $1', [pid])
      for (var j = 0; j < props.rows.length; j++) {
        await pool.query('DELETE FROM images WHERE entry_id IN (SELECT id FROM entries WHERE property_id = $1)', [props.rows[j].id])
        await pool.query('DELETE FROM entries WHERE property_id = $1', [props.rows[j].id])
      }
      await pool.query('DELETE FROM properties WHERE project_id = $1', [pid])
      await pool.query('DELETE FROM project_members WHERE project_id = $1', [pid])
      await pool.query('DELETE FROM invitations WHERE project_id = $1', [pid])
    }
    await pool.query('DELETE FROM projects WHERE company_id = $1', [companyId])
    await pool.query('DELETE FROM users WHERE company_id = $1', [companyId])
    await pool.query('DELETE FROM companies WHERE id = $1', [companyId])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /auth/forgot-password — solicitar recuperación de contraseña
app.post('/auth/forgot-password', async function(req, res) {
  try {
    var { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email requerido' })

    var result = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()])
    // Siempre respondemos lo mismo para no revelar si el email existe
    if (result.rows.length === 0) return res.json({ success: true })

    var user = result.rows[0]
    var crypto = require('crypto')
    var token = crypto.randomBytes(32).toString('hex')
    var expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hora

    // Invalidar tokens anteriores del mismo usuario
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id])
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    )

    var resetUrl = APP_URL + '/reset-password/' + token
    try {
      await resend.emails.send({
        from: 'BitácoraPro <noreply@contacto.bitacorapro.cl>',
        to: user.email,
        subject: 'Recupera tu contraseña — BitácoraPro',
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="margin-bottom: 2rem;">
              <span style="font-family: Georgia, serif; font-size: 1.3rem; font-weight: 700;">BitácoraPro<span style="color: #2D5A3D;">.</span></span>
            </div>
            <h2 style="font-family: Georgia, serif; font-size: 1.5rem; margin-bottom: 0.5rem;">Recupera tu contraseña</h2>
            <p style="color: #6B6760; margin-bottom: 1.5rem;">Hola ${user.name}, recibimos una solicitud para restablecer tu contraseña. El link es válido por 1 hora.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#1A1814;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500;font-size:15px;">
              Restablecer contraseña →
            </a>
            <p style="color: #6B6760; font-size: 0.9rem; margin-top: 1.5rem;">Si no solicitaste esto, ignora este email. Tu contraseña no cambiará.</p>
            <p style="color: #C0BBB5; font-size: 0.78rem; margin-top: 2rem;">¿Dudas? Escríbenos a contacto@bitacorapro.cl</p>
          </div>
        `
      })
    } catch (emailErr) {
      console.error('Error enviando email de recuperación:', emailErr)
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /auth/reset-password — establecer nueva contraseña con token
app.post('/auth/reset-password', async function(req, res) {
  try {
    var { token, new_password } = req.body
    if (!token || !new_password) return res.status(400).json({ error: 'Datos incompletos' })
    if (new_password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

    var result = await pool.query(
      'SELECT pr.*, u.email, u.name, u.company_id, u.role FROM password_resets pr JOIN users u ON pr.user_id = u.id WHERE pr.token = $1',
      [token]
    )
    if (result.rows.length === 0) return res.status(400).json({ error: 'Link inválido o expirado' })

    var reset = result.rows[0]
    if (reset.used) return res.status(400).json({ error: 'Este link ya fue utilizado' })
    if (new Date() > new Date(reset.expires_at)) return res.status(400).json({ error: 'El link expiró. Solicita uno nuevo.' })

    var hash = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [hash, reset.user_id])
    await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [reset.id])

    // Loguear automáticamente al usuario
    var newToken = jwt.sign({ id: reset.user_id, email: reset.email, role: reset.role, company_id: reset.company_id }, JWT_SECRET, { expiresIn: '7d' })
    var userResult = await pool.query(
      'SELECT u.id, u.name, u.email, u.role, u.company_id, c.name as company_name FROM users u JOIN companies c ON u.company_id = c.id WHERE u.id = $1',
      [reset.user_id]
    )
    res.json({ success: true, token: newToken, user: userResult.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /auth/change-password — cambiar contraseña (primer login)
app.post('/auth/change-password', authMiddleware, async function(req, res) {
  try {
    var { new_password } = req.body
    if (!new_password || new_password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    var hash = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [hash, req.user.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /admin/create-company — crear empresa + usuario admin
app.post('/admin/create-company', superadminMiddleware, async function(req, res) {
  try {
    var { company_name, name, email, password } = req.body
    if (!company_name || !name || !email || !password) return res.status(400).json({ error: 'Todos los campos son requeridos' })

    var existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Ya existe una cuenta con ese email' })

    var companyResult = await pool.query('INSERT INTO companies (name) VALUES ($1) RETURNING *', [company_name.trim()])
    var company = companyResult.rows[0]

    var hash = await bcrypt.hash(password, 10)
    var userResult = await pool.query(
      'INSERT INTO users (company_id, name, email, password_hash, role, must_change_password) VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING id, name, email, role',
      [company.id, name.trim(), email.trim().toLowerCase(), hash, 'admin']
    )

    // Enviar email de bienvenida con credenciales
    var loginUrl = process.env.NODE_ENV === 'production' ? 'https://www.bitacorapro.cl/login' : 'http://localhost:5173/login'
    try {
      await resend.emails.send({
        from: 'BitácoraPro <noreply@contacto.bitacorapro.cl>',
        to: email.trim().toLowerCase(),
        subject: 'Bienvenido a BitácoraPro — tus credenciales de acceso',
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px; color: #1A1814;">
            <div style="margin-bottom: 2rem;">
              <span style="font-family: Georgia, serif; font-size: 1.3rem; font-weight: 700;">BitácoraPro<span style="color: #2D5A3D;">.</span></span>
            </div>
            <h2 style="font-family: Georgia, serif; font-size: 1.5rem; margin-bottom: 0.5rem;">Hola ${name.trim()}, bienvenido 👋</h2>
            <p style="color: #6B6760; margin-bottom: 1.5rem;">Tu cuenta para <strong>${company_name.trim()}</strong> está lista. Aquí están tus credenciales de acceso:</p>
            <div style="background: #F7F5F0; border-radius: 10px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; border: 1px solid #E2DDD6;">
              <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #6B6760;">Usuario</p>
              <p style="margin: 0 0 1rem; font-weight: 600; font-size: 1rem;">${email.trim().toLowerCase()}</p>
              <p style="margin: 0 0 0.5rem; font-size: 0.9rem; color: #6B6760;">Contraseña temporal</p>
              <p style="margin: 0; font-weight: 600; font-size: 1rem; font-family: monospace; letter-spacing: 0.05em;">${password}</p>
            </div>
            <p style="color: #6B6760; font-size: 0.9rem; margin-bottom: 1.75rem;">Al iniciar sesión por primera vez, te pediremos que cambies tu contraseña temporal por una propia.</p>
            <a href="${loginUrl}" style="display:inline-block;background:#1A1814;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:500;font-size:15px;">
              Iniciar sesión →
            </a>
            <p style="color: #C0BBB5; font-size: 0.78rem; margin-top: 2.5rem;">Si tienes dudas, responde este email o escríbenos a contacto@bitacorapro.cl</p>
          </div>
        `
      })
    } catch (emailErr) {
      console.error('Error enviando email de bienvenida:', emailErr)
      // No falla el endpoint si el email falla — la cuenta igual queda creada
    }

    res.json({ success: true, company: company, user: userResult.rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /projects/:id/dashboard/ai-analysis — análisis IA de patrones
app.post('/projects/:id/dashboard/ai-analysis', authMiddleware, async function(req, res) {
  try {
    var projectId = req.params.id
    var { ai_context, project_name, total_entries, by_category, by_severity, by_status } = req.body

    if (!ai_context || !total_entries) return res.status(400).json({ error: 'Datos insuficientes' })

    // Construir resumen compacto de métricas para el prompt
    var catSummary = Object.entries(by_category || {}).sort(function(a,b) { return b[1]-a[1] }).map(function(kv) { return kv[0] + ': ' + kv[1] }).join(', ')
    var sevSummary = Object.entries(by_severity || {}).map(function(kv) { return kv[0] + ': ' + kv[1] }).join(', ')
    var stSummary = Object.entries(by_status || {}).map(function(kv) { return kv[0] + ': ' + kv[1] }).join(', ')

    var prompt = 'Eres un experto en gestión de calidad y postventa inmobiliaria en Chile. Analiza los siguientes hallazgos de inspección del proyecto "' + project_name + '" y detecta patrones que indiquen problemas sistémicos con subcontratistas o la constructora.\n\n' +
      'RESUMEN DE MÉTRICAS:\n' +
      '- Total hallazgos: ' + total_entries + '\n' +
      '- Por categoría: ' + catSummary + '\n' +
      '- Por severidad: ' + sevSummary + '\n' +
      '- Por estado: ' + stSummary + '\n\n' +
      'DETALLE DE HALLAZGOS (formato: categoría|severidad|ubicación|propiedad):\n' + ai_context + '\n\n' +
      'Genera un análisis ejecutivo breve con:\n' +
      '1. Los 2-3 patrones más preocupantes (categorías o ubicaciones que se repiten en múltiples propiedades)\n' +
      '2. Posibles causas sistémicas (subcontratista específico, material, proceso)\n' +
      '3. Recomendaciones concretas para el equipo de gestión\n\n' +
      'Sé directo, usa lenguaje de negocios. Máximo 250 palabras. Sin markdown, solo texto plano con saltos de línea.'

    var message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    })

    var analysis = message.content.filter(function(b) { return b.type === 'text' }).map(function(b) { return b.text }).join('')
    res.json({ analysis: analysis })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// === DASHBOARD DE PROYECTO ===
app.get('/projects/:id/dashboard', authMiddleware, async function(req, res) {
  try {
    var projectId = req.params.id

    // Verificar acceso: admin ve todos sus proyectos, inspector solo los que fue invitado
    var projectCheck
    if (req.user.role === 'admin') {
      projectCheck = await pool.query('SELECT id, name FROM projects WHERE id = $1 AND company_id = $2', [projectId, req.user.company_id])
    } else {
      projectCheck = await pool.query(
        'SELECT p.id, p.name FROM projects p JOIN project_members pm ON p.id = pm.project_id WHERE p.id = $1 AND pm.user_id = $2',
        [projectId, req.user.id]
      )
    }
    if (projectCheck.rows.length === 0) return res.status(404).json({ error: 'Proyecto no encontrado' })

    // Todas las propiedades del proyecto
    var propertiesResult = await pool.query(
      'SELECT id, unit_number, owner_name FROM properties WHERE project_id = $1 ORDER BY unit_number ASC',
      [projectId]
    )
    var properties = propertiesResult.rows

    // Todos los hallazgos del proyecto (datos suficientes, sin imágenes ni texto largo)
    var entriesResult = await pool.query(
      `SELECT e.id, e.title, e.category, e.severity, e.status, e.location, e.property_id, p.unit_number
       FROM entries e
       JOIN properties p ON e.property_id = p.id
       WHERE p.project_id = $1
       ORDER BY e.created_at DESC`,
      [projectId]
    )
    var entries = entriesResult.rows

    // --- Métricas calculadas ---
    var byStatus = { pendiente: 0, en_progreso: 0, resuelto: 0 }
    var byCategory = {}
    var bySeverity = { leve: 0, moderado: 0, grave: 0, critico: 0 }
    var byProperty = {}

    entries.forEach(function(e) {
      // Estado
      var st = e.status || 'pendiente'
      byStatus[st] = (byStatus[st] || 0) + 1

      // Categoría
      byCategory[e.category] = (byCategory[e.category] || 0) + 1

      // Severidad
      var sv = e.severity || 'leve'
      bySeverity[sv] = (bySeverity[sv] || 0) + 1

      // Por propiedad
      if (!byProperty[e.property_id]) {
        byProperty[e.property_id] = { unit_number: e.unit_number, total: 0, pendiente: 0, en_progreso: 0, resuelto: 0 }
      }
      byProperty[e.property_id].total++
      byProperty[e.property_id][st] = (byProperty[e.property_id][st] || 0) + 1
    })

    // Progreso de propiedades: cuántas tienen todos sus hallazgos resueltos
    var propsWithEntries = Object.values(byProperty)
    var propsCompleted = propsWithEntries.filter(function(p) { return p.total > 0 && p.resuelto === p.total }).length
    var propsInProgress = propsWithEntries.filter(function(p) { return p.en_progreso > 0 || (p.resuelto > 0 && p.resuelto < p.total) }).length
    var propsPending = propsWithEntries.filter(function(p) { return p.total > 0 && p.pendiente === p.total }).length
    var propsNoEntries = properties.length - propsWithEntries.length

    // Contexto compacto para IA: solo lo necesario para detectar patrones
    var aiContext = entries.map(function(e) {
      return e.category + '|' + e.severity + '|' + (e.location || '') + '|' + e.unit_number
    }).join('\n')

    res.json({
      project: projectCheck.rows[0],
      total_entries: entries.length,
      total_properties: properties.length,
      by_status: byStatus,
      by_category: byCategory,
      by_severity: bySeverity,
      by_property: byProperty,
      progress: {
        completed: propsCompleted,
        in_progress: propsInProgress,
        pending: propsPending,
        no_entries: propsNoEntries
      },
      // Lista completa para la tabla de gestión
      entries: entries,
      properties: properties,
      // Contexto compacto para análisis IA
      ai_context: aiContext
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

var PORT = process.env.PORT || 3001
initDB().then(function() {
  app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor corriendo en puerto ' + PORT)
})
}).catch(function(err) {
  console.error('Error iniciando base de datos:', err)
  process.exit(1)
})
