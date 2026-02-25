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
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  // Usuarios
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      company_id INTEGER REFERENCES companies(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'inspector',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
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

var anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
var JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_temporal'
var resend = new Resend(process.env.RESEND_API_KEY)
var APP_URL = process.env.NODE_ENV === 'production' ? 'https://bitacora-postventa.vercel.app' : 'http://localhost:5173'

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

    var token = jwt.sign({ id: user.id, email: user.email, role: user.role, company_id: user.company_id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, company_id: user.company_id, company_name: user.company_name }
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

    // Preparar imágenes para IA (desde buffer en memoria)
    var imagesForAI = req.files.map(function(file) {
      return { base64: file.buffer.toString('base64'), type: file.mimetype }
    })

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
      'INSERT INTO entries (property_id, created_by, title, description, inspector_note, category, severity, location, recommendation, affected_elements, ai_generated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 1) RETURNING *',
      [propertyId, req.user.id, analysis.titulo, analysis.descripcion, inspectorNote, analysis.categoria, analysis.severidad, analysis.ubicacion_sugerida, analysis.recomendacion, JSON.stringify(analysis.elementos_afectados)]
    )
    var entry = entryResult.rows[0]

    // Subir imágenes a Cloudinary y guardar URLs
    for (var k = 0; k < req.files.length; k++) {
      var cloudUrl = await uploadToCloudinary(req.files[k].buffer, req.files[k].mimetype)
      await pool.query('INSERT INTO images (entry_id, filename, original_name) VALUES ($1, $2, $3)', [entry.id, cloudUrl, req.files[k].originalname])
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
    await pool.query(
      'UPDATE entries SET title = $1, description = $2, recommendation = $3, category = $4, severity = $5, location = $6 WHERE id = $7',
      [b.title || '', b.description || '', b.recommendation || '', b.category || 'otro', b.severity || 'leve', b.location || '', req.params.id]
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

    var inviteUrl = APP_URL + '?invite=' + invToken
    var projectName = project.rows[0].name

    // Obtener nombre de la empresa
    var companyResult = await pool.query('SELECT name FROM companies WHERE id = $1', [req.user.company_id])
    var companyName = companyResult.rows[0].name

    // Enviar email con Resend
    await resend.emails.send({
      from: 'Bitácora <noreply@contacto.bitacorapro.cl>',
      to: emailNorm,
      subject: 'Te invitaron a unirte a ' + projectName + ' en Bitácora',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1A1814; font-size: 24px; margin-bottom: 8px;">Te invitaron a Bitácora</h2>
          <p style="color: #6B6760; margin-bottom: 24px;">
            <strong>${req.user.name}</strong> de <strong>${companyName}</strong> te invita a colaborar en el proyecto <strong>${projectName}</strong>.
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

var PORT = process.env.PORT || 3001
initDB().then(function() {
  app.listen(PORT, function() { console.log('Servidor corriendo en puerto ' + PORT) })
}).catch(function(err) {
  console.error('Error iniciando base de datos:', err)
  process.exit(1)
})
