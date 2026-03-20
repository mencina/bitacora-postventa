# Resumen del Proyecto — BitácoraPro

## Qué es
Plataforma B2B de gestión de entrega de propiedades para inmobiliarias. Cubre todo el ciclo: acta de entrega digital con firma en pantalla → registro de hallazgos con IA → gestión de postventa → vista del propietario en tiempo real.

Los inspectores suben fotos y graban audio de hallazgos, y la IA (Claude) genera automáticamente: título, descripción técnica, categoría, severidad, recomendación y elementos afectados. Genera PDFs del acta firmada descargables.

**Modelo de negocio:** venta directa 1 a 1 a inmobiliarias. Sin planes públicos ni registro abierto. Los clientes se crean manualmente desde el panel de superadmin.

## Stack técnico
- **Frontend:** React + Vite (desplegado en Vercel)
- **Backend:** Node.js + Express (desplegado en Railway)
- **Base de datos:** PostgreSQL (Railway en producción, Homebrew local en Mac)
- **IA:** API de Anthropic (Claude Sonnet 4)
- **Autenticación:** JWT (jsonwebtoken) + bcryptjs
- **Routing:** React Router DOM (react-router-dom)
- **Almacenamiento imágenes:** Cloudinary (reemplazó disco local de Railway)
- **Email:** Resend (dominio verificado: contacto.bitacorapro.cl)
- **PDF:** jsPDF (solo para acta firmada)
- **Audio:** Web Speech API
- **Íconos:** Lucide React (`lucide-react`) — instalado en la raíz del proyecto

## URLs
- **App:** https://bitacora-postventa.vercel.app (también https://www.bitacorapro.cl)
- **Backend:** https://bitacora-postventa-production.up.railway.app
- **GitHub:** https://github.com/mencina/bitacora-postventa
- **Panel admin:** https://www.bitacorapro.cl/admin (solo uso interno)

## Rutas de la app (React Router)
- `/` → Homepage
- `/login` → Login
- `/invitacion/:token` → Registro por invitación
- `/admin` → Panel de superadmin
- `/proyectos` → Lista de proyectos (requiere login)
- `/proyectos/nuevo` → Formulario crear proyecto (pantalla independiente)
- `/proyectos/:projectId` → Propiedades de un proyecto (requiere login)
- `/proyectos/:projectId/propiedades/nueva` → Formulario crear propiedad (pantalla independiente)
- `/proyectos/:projectId/propiedades/:propertyId` → Hallazgos de una propiedad (requiere login)
- `/proyectos/:projectId/propiedades/:propertyId/nuevo-hallazgo` → Formulario registrar hallazgo (pantalla independiente)
- `/proyectos/:projectId/propiedades/:propertyId/acta` → Acta de entrega (pantalla independiente)
- `/proyectos/:projectId/dashboard` → Dashboard del proyecto — métricas, análisis IA y gestión de hallazgos (ancho completo desktop)
- `/proyectos/:projectId/equipo` → Gestión de equipo del proyecto (solo admin) — pantalla independiente
- `/h/:entryId` → Vista pública de un hallazgo (sin login, solo lectura)
- `/p/:token` → Vista pública de propiedad completa para el propietario (sin login, solo lectura)
- `/reset-password/:token` → Restablecer contraseña desde email

Nota: la navegación usa IDs numéricos en la URL (los mismos que existen en la BD). Al hacer refresh o acceder directamente a una URL, el frontend hidrata el estado desde la API automáticamente.

## Estructura del proyecto
```
~/Desktop/bitacora-postventa/
├── public/
│   └── isotipo.svg      ← isotipo real de BitácoraPro (para el header de la app)
├── src/
│   ├── App.jsx          ← componente principal (toda la app + login + homepage + admin)
│   ├── App.css          ← design system v2 completo (tokens, tipografía, componentes)
│   ├── index.css        ← estilos globales
│   └── main.jsx         ← punto de entrada (envuelve con BrowserRouter)
├── server/
│   ├── index.js         ← backend (API + auth + JWT + PostgreSQL + Cloudinary + Resend)
│   ├── .env             ← variables de entorno (no se sube a GitHub)
├── vercel.json          ← configuración de rewrites para que React Router funcione
└── vite.config.js
```

## Variables de entorno (.env local y Railway)
```
ANTHROPIC_API_KEY=...
DATABASE_URL=...
JWT_SECRET=...
RESEND_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_SECRET=...         ← clave del panel de superadmin (definir en Railway)
APP_URL=...              ← URL pública de la app (ej: https://www.bitacorapro.cl), usada en emails de invitación
```

## vercel.json
Necesario para que las URLs de React Router funcionen al acceder directamente (ej: bitacorapro.cl/login). Cubre también las rutas dinámicas y las vistas públicas `/h/:entryId` y `/p/:token`. Debe estar en la raíz del proyecto:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

## Base de datos — PostgreSQL
### Tablas
- **companies:** id, name, active (boolean), created_at
- **users:** id, company_id, name, email, password_hash, role (admin/inspector), must_change_password (boolean), created_at
- **projects:** id, company_id, name, created_at
- **project_members:** id, project_id, user_id, created_at
- **properties:** id, project_id, unit_number, owner_name, owner_rut, owner_email, owner_phone, created_at
- **entries:** id, property_id, created_by, title, description, inspector_note, category, severity, location, recommendation, affected_elements, ai_generated, status, created_at
- **images:** id, entry_id, filename (URL de Cloudinary), original_name, created_at
- **invitations:** id, email, project_id, company_id, token, status (pending/accepted), created_at
- **property_tokens:** id, property_id (UNIQUE), token (UNIQUE), created_at — tokens para vista pública de propiedad
- **delivery_acts:** id, property_id (UNIQUE), data (JSONB), signature_owner (TEXT/base64), signature_inspector (TEXT/base64), signed_at, signed_by_name, edited_after_signing (boolean), entries_snapshot (JSONB), created_at, updated_at

### Migraciones automáticas al iniciar servidor
- `ALTER TABLE companies ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`
- `ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE`
- Las tablas `property_tokens` y `delivery_acts` se crean con `CREATE TABLE IF NOT EXISTS` en `initDB()`

### Configuración local (Mac)
- PostgreSQL instalado con Homebrew (`brew install postgresql@16`)
- Servicio iniciado con `brew services start postgresql@16`
- Base de datos local: `bitacora`
- psql: `/opt/homebrew/opt/postgresql@16/bin/psql bitacora`
- Variable en `.env`: `DATABASE_URL=postgresql://localhost/bitacora`

### Configuración producción (Railway)
- PostgreSQL y backend en el mismo proyecto Railway (`just-prosperity`)
- Para conectarse desde Mac a la BD de Railway: `/opt/homebrew/opt/postgresql@16/bin/psql "DATABASE_PUBLIC_URL"`

## Sistema de autenticación
- **JWT** con expiración de 7 días
- **Roles:** admin (crea empresa, proyectos, invita inspectores) e inspector (crea propiedades y hallazgos)
- Cada empresa ve solo sus propios proyectos
- Token guardado en localStorage — la sesión persiste al hacer refresh
- **Registro público deshabilitado** — los clientes los crea Mario desde el panel de superadmin

## Arquitectura de componentes React
- `App()` — maneja todo el estado global y las rutas. Incluye objeto `interiorProps` que pasa todos los props a AppInterior con spread (`{...interiorProps}`)
- `AppHeader(props)` — header **fixed** de 52px con isotipo + título centrado + menú `⋯`. El menú abre un dropdown con nombre/empresa del usuario y cerrar sesión
- `AppBreadcrumb(props)` — barra **fixed** de 36px en `top: 52px` con flecha para volver + contexto. Aparece solo en vistas con subniveles. El `.main` tiene `padding-top: 104px` para no quedar tapado
- `IsotipoSVG` — wrapper del isotipo (`/isotipo.svg`) usado en el header
- `AppInterior(props)` — componente separado (fuera de App) que recibe todo como props. Usa `useParams()` y el prop `vista` ('proyectos' | 'propiedades' | 'hallazgos') para decidir qué renderizar. Importante: debe estar fuera de App() para evitar re-montaje en cada render, lo que causaba bugs de teclado en mobile
- `DeliveryActScreen` — pantalla fullscreen overlay del acta de entrega. Envuelto en `React.memo`. Recibe `deliveryActRef` y `entriesRef` en lugar de los objetos directos para evitar re-renders. Los sub-componentes (`ActSection`, `ActRow`, `ActTriToggle`, `ActSigCanvas`) están definidos **fuera** del componente — si estuvieran adentro, React los re-montaría en cada render perdiendo el foco del teclado
- `PublicPropertyScreen` — vista pública completa de una propiedad para el propietario. Sin login. Accede vía `/p/:token`
- `ProjectDashboardScreen` — dashboard de proyecto en ancho completo desktop. Recibe `project`, `authFetch` y `navigate` como props. Carga datos del endpoint `/projects/:id/dashboard`. Incluye: cards de métricas, barras de categoría/severidad, progreso por propiedad, panel de análisis IA (genera reporte ejecutivo al hacer clic), y tabla de gestión con filtros por propiedad/estado/categoría/severidad, ordenamiento por columna y cambio de estado inline.
- `PublicEntryScreen` — vista pública de un hallazgo, sin login, solo lectura. Usa `useParams()` para obtener el `entryId` y llama a `/public/entries/:entryId`
- `HomeScreen` — usa `useNavigate` internamente
- `LoginScreen` — usa `useNavigate` internamente
- `ScrollToTop` — componente que resetea el scroll en cada cambio de ruta

### Navegación interna en AppInterior
La navegación entre vistas usa funciones que combinan setState + navigate:
- `goToProject(project)` → setCurrentProject + navigate('/proyectos/:id')
- `goToProperty(prop)` → setCurrentProperty + navigate('/proyectos/:projectId/propiedades/:id')
- `goBackToProjects()` → setCurrentProject(null) + navigate('/proyectos')
- `goBackToProperties()` → setCurrentProperty(null) + navigate('/proyectos/:projectId')

### Hidratación desde URL
Si el usuario accede directamente a `/proyectos/42` o `/proyectos/42/propiedades/17` (refresh o link), dos useEffect en AppInterior cargan el proyecto y la propiedad desde la API. Mientras cargan, muestra pantalla "Cargando...". Si el ID no existe, redirige a `/proyectos`.

## Primer login — cambio de contraseña obligatorio
- Al crear un cliente desde el panel admin, el usuario queda con `must_change_password = TRUE`
- Al hacer login, si el flag está activo, se muestra la pantalla `ChangePasswordScreen` antes de entrar a la app
- El usuario no puede saltarse esta pantalla
- Al guardar la nueva contraseña, el flag queda en `FALSE` permanentemente
- Endpoint: `POST /auth/change-password` (requiere JWT)

## Onboarding de nuevo cliente
1. Mario crea la cuenta desde `bitacorapro.cl/admin`
2. El sistema envía automáticamente un email con usuario y contraseña temporal (via Resend)
3. El email incluye botón "Iniciar sesión" que apunta a `bitacorapro.cl/login`
4. El cliente hace login → ve pantalla de cambio de contraseña → entra a la app

## Panel de superadmin
- **URL:** `bitacorapro.cl/admin` (no está linkeado desde ningún lado)
- **Acceso:** clave definida en variable de entorno `ADMIN_SECRET` en Railway
- **Autenticación:** header `x-admin-secret` en cada request (no usa JWT)

### Funcionalidades del panel
- Ver todas las empresas con métricas: proyectos, propiedades, hallazgos, inspectores, última actividad
- Crear empresa + usuario admin → envía email de bienvenida automáticamente
- Desactivar/reactivar empresas (bloquea login de sus usuarios)
- Eliminar empresas con todos sus datos en cascada

## Vista pública de propiedad (`/p/:token`)
- Accesible sin login, mediante un token único por propiedad
- El botón de link en la card de cada propiedad genera/obtiene el token y copia el link al portapapeles
- Muestra: datos de la propiedad, dashboard de resumen (Resueltos / En progreso / Pendientes), barra de progreso, lista completa de hallazgos con fotos y lightbox
- No expone datos sensibles del propietario (sin RUT, email ni teléfono)
- Tabla `property_tokens` en BD — se reutiliza el mismo token si ya existe

## Acta de entrega digital
Feature para documentar el proceso de entrega de una propiedad a un nuevo propietario. Es un documento que se usa **una única vez** por propiedad.

### Estados del acta en la pantalla de hallazgos
- **Sin acta:** botón discreto "Iniciar acta de entrega" (dashed border)
- **En progreso:** badge amarillo "Acta en progreso · Continuar →"
- **Firmada:** badge verde "Acta firmada · fecha → Ver" + botón "Descargar PDF"

### Flujo de uso
1. Inspector llega a la propiedad, abre el acta desde la pantalla de hallazgos
2. El acta abre como pantalla fullscreen overlay
3. Inspector completa las secciones (autosave cada 1.2 segundos)
4. Si encuentra un problema, toca "Registrar hallazgo" (botón sticky abajo) → abre el form de hallazgo → al guardar vuelve al acta con toast "Hallazgo registrado"
5. Al terminar, firma el propietario y el inspector en pantalla con el dedo
6. Al firmar se congela el listado de hallazgos existentes como Anexo I
7. Acta queda completamente bloqueada en solo lectura — todos los campos quedan deshabilitados, no hay botón de editar
8. Aparece botón "Descargar PDF" que genera el acta completa con firmas y hallazgos

### Secciones del acta
1. **Datos generales** — heredados de la card de propiedad (editables), proyecto/etapa, inspector, bodega, estacionamiento
2. **Documentación entregada** — 10 ítems con Si / No / N/A
3. **Recepción de artefactos** — 13 artefactos con Conforme / No conforme / N/A (ítem "Climatización (AC)" para aire acondicionado)
4. **Lectura de medidores** — agua fría, agua caliente, gas, electricidad (N° medidor + lectura)
5. **Conformidad del proceso** — 6 preguntas con Sí / No
6. **Observaciones** — campo libre
7. **Firmas** — canvas táctil para propietario e inspector
8. **Anexo I** — lista de hallazgos declarados al momento de firmar

### Propiedades ya entregadas
Las propiedades antiguas que entran al sistema simplemente nunca usan el acta — la pantalla de hallazgos muestra el botón "Iniciar acta" de forma discreta pero nunca invade el flujo normal.

### Tabla delivery_acts
- Una por propiedad (UNIQUE en property_id)
- `data` JSONB — todos los campos del formulario
- `signature_owner` / `signature_inspector` — imágenes base64 de las firmas
- `entries_snapshot` JSONB — lista de hallazgos al momento de firmar
- `edited_after_signing` boolean — campo en BD preparado para futura funcionalidad, no se usa en el frontend actualmente

## Design System v2 — Visual System

### Referente de diseño
Linear (limpio, simple, liviano). Sin emojis funcionales en la UI de la app. Íconos con Lucide React.

### Tipografía
Inter (reemplaza Playfair Display + DM Sans). Importada desde Google Fonts en App.css.

### Color primario
`#1800AD` (extraído del logo real). Escala de 8 niveles definida como tokens CSS.

### Archivos de diseño
- **`App.css`** — design system completo: tokens CSS en `:root`, base global, componentes, app shell, homepage
- **`public/isotipo.svg`** — isotipo real de BitácoraPro, optimizado con viewBox correcto (`140 255 1185 905`)

### Tokens principales
```css
--primary-700: #1800AD   /* color principal */
--gray-50: #F5F6FA       /* surface-page */
--surface-1: #FFFFFF     /* cards */
--border-subtle: #E0E2EB
--text-primary: #0F111A
--text-tertiary: #6B6F82
--font-sans: 'Inter', system-ui, sans-serif
--radius-xl: 16px        /* cards */
--shadow-md: 0 4px 8px rgba(15,17,26,0.08)
```

### Arquitectura de navegación mobile
- **Header fijo (52px):** isotipo izquierda + título centrado + botón `⋯` derecha
- **Breadcrumb (32px):** solo en vistas 2 y 3. `← Proyecto · Propietario`
- **Menú `⋯`:** dropdown con usuario + empresa + cerrar sesión
- Sin botón cerrar sesión visible en el header

### CTAs sticky
Los tres botones principales están fijos en la parte inferior de la pantalla:
- Vista proyectos: "**+ Nuevo Proyecto**" (solo admin)
- Vista propiedades: "**+ Nueva Propiedad**"
- Vista hallazgos: "**+ Nuevo Hallazgo**"
Se ocultan cuando el formulario correspondiente está abierto. Usan `position: fixed; bottom: 0` con `backdrop-filter: blur(12px)` y `safe-area-inset-bottom` para el notch del iPhone.

### Íconos (Lucide React)
Instalado con `npm install lucide-react` en la raíz del proyecto. Importados en App.jsx:
```js
import { Smartphone, Camera, FileText, ClipboardList, Building2, FolderOpen, Home, KeyRound, Trash2, Link, Pencil, Mic, Eye, Users } from 'lucide-react'
```
Mapeo principal:
| Contexto | Ícono |
|----------|-------|
| Eliminar (proyecto, propiedad, hallazgo, empresa) | `Trash2` |
| Editar (propiedad, hallazgo) | `Pencil` |
| Copiar link público | `Link` |
| Grabar audio | `Mic` |
| Ver hallazgo (dashboard) | `Eye` |
| Gestionar Equipo (nav-card) | `Users` |
| Cambio de contraseña | `KeyRound` |
| Stat Clientes (admin) | `Building2` |
| Stat Proyectos (admin) | `FolderOpen` |
| Stat Propiedades (admin) | `Home` |
| Stat Hallazgos (admin) | `ClipboardList` |
| Homepage paso 1 | `Smartphone` |
| Homepage paso 2 | `Camera` |
| Homepage paso 4 | `FileText` |

### Categorías de hallazgos (sin emojis)
| Key | Label | Color |
|-----|-------|-------|
| estructural | Estructural | Rojo (#B91C1C) |
| terminaciones | Terminaciones | Azul (#1D4ED8) |
| instalaciones | Instalaciones | Naranja (#B45309) |
| humedad | Humedad | Verde azulado (#0F766E) |
| electrico | Eléctrico | Violeta (#7C3AED) |
| otro | Otro | Gris (#6B6F82) |

### Severidades (alineadas al design system)
| Key | Label | Color |
|-----|-------|-------|
| leve | Leve | Verde (#15803D) |
| moderado | Moderado | Naranja (#B45309) |
| grave | Grave | Naranja quemado (#9A3412) |
| critico | Crítico | Violeta (#6D28D9) |

### Estados de hallazgo
| Key | Label | Color |
|-----|-------|-------|
| pendiente | Pendiente | Naranja (#B45309) |
| en_progreso | En progreso | Azul (#1D4ED8) |
| resuelto | Resuelto | Verde (#15803D) |

## Homepage — arquitectura de secciones
1. **Nav** — logo + links (Por qué BitácoraPro `#hp-dolores`, Cómo funciona `#hp-como`, Contacto `#hp-contacto`) + botón Iniciar sesión
2. **Hero** — título, subtítulo, CTA "Solicitar demo →" (mailto)
3. **Dolores** (`#hp-dolores`) — 3 problemas del sector con su solución (sección oscura)
4. **Cómo funciona** (`#hp-como`) — 4 pasos del flujo
5. **CTA final** (`#hp-contacto`) — llamada a demo
6. **Footer** — logo + copyright

### Decisiones de diseño homepage
- Sin sección de precios (estrategia B2B venta directa)
- Sin botón "Registrarse" visible — solo "Solicitar demo" y "Iniciar sesión"
- CTA principal apunta a `mailto:contacto@bitacorapro.cl`
- Menú hamburguesa mobile: solo "Solicitar demo" (primario) e "Iniciar sesión" (secundario)

## Flujo de la app
Homepage (`/`) → Login (`/login`) → (Cambio de contraseña si es primer login) → Proyectos (`/proyectos`) → Proyecto (`/proyectos/42`) → Propiedad (`/proyectos/42/propiedades/17`) → Hallazgos + Acta de entrega

## Flujo de invitación de inspector
Admin invita email → Inspector recibe email con link → Clic en link → `/invitacion/:token` → Pantalla de registro → Entra al proyecto

## Flujo de creación de cliente (B2B)
Mario abre `bitacorapro.cl/admin` → crea empresa + admin → sistema envía email con credenciales → cliente hace login en `bitacorapro.cl/login` → cambia contraseña → entra a la app

## Funcionalidades completadas
- ✅ Homepage B2B (sin planes, sin registro público, CTA a demo)
- ✅ Nav con links a todas las secciones (desktop + hamburguesa mobile)
- ✅ Sistema de proyectos (crear, eliminar)
- ✅ Fichas de propiedades (número, nombre, RUT, email, teléfono)
- ✅ Subida de fotos múltiples (almacenadas en Cloudinary)
- ✅ Grabación de audio con transcripción en tiempo real
- ✅ Análisis con IA (categoría, severidad, descripción, recomendación)
- ✅ Eliminar hallazgos, propiedades y proyectos
- ✅ Editar propiedades (formulario inline con todos los campos)
- ✅ Editar hallazgos (título, categoría, severidad, ubicación, descripción, recomendación)
- ✅ Base de datos persistente (PostgreSQL en local y producción)
- ✅ Login con JWT (sin registro público)
- ✅ Roles: Administrador e Inspector
- ✅ Multi-empresa (cada empresa ve solo sus datos)
- ✅ Invitar inspectores por email (Resend)
- ✅ Inspectores solo ven proyectos asignados
- ✅ Pantalla de equipo del proyecto (`/proyectos/:id/equipo`) — pantalla independiente con miembros, invitar por email e invitaciones pendientes (solo admin)
- ✅ Nav-cards "Dashboard" y "Gestionar Equipo" en la vista de propiedades — lado a lado, responsive: columna centrada en mobile, horizontal en desktop (>= 640px)
- ✅ Lightbox de fotos (click en thumbnail → foto grande, navegación con flechas, teclado y swipe)
- ✅ Design system v2 completo — Inter, tokens CSS, referente Linear, sin emojis funcionales
- ✅ Íconos con Lucide React (reemplazó todos los emojis funcionales de la UI)
- ✅ Isotipo real en header, login y favicon
- ✅ Navegación mobile: header 52px + breadcrumb 32px + menú `⋯` con dropdown
- ✅ CTAs sticky en parte inferior: Nuevo Proyecto / Nueva Propiedad / Nuevo Hallazgo
- ✅ Desplegado en internet (Vercel + Railway)
- ✅ Panel de superadmin (`/admin`) con métricas de uso por empresa
- ✅ Crear clientes desde panel admin con email de bienvenida automático
- ✅ Desactivar/reactivar empresas (bloquea login de sus usuarios)
- ✅ Eliminar empresas con todos sus datos en cascada
- ✅ Cambio de contraseña obligatorio en primer login
- ✅ Empresas inactivas bloqueadas en login con mensaje claro
- ✅ URLs dinámicas por proyecto y propiedad (`/proyectos/:id` y `/proyectos/:id/propiedades/:id`)
- ✅ Hidratación de estado desde URL (refresh y links directos funcionan correctamente)
- ✅ Vista pública de hallazgo sin login (`/h/:entryId`) para compartir con contratistas
- ✅ Vista pública de propiedad completa (`/p/:token`) — dashboard, hallazgos con fotos, lightbox, sin datos sensibles
- ✅ Botón de link en cada hallazgo que copia el link público al portapapeles
- ✅ Botón de link en card de propiedad que genera token y copia link al portapapeles
- ✅ vercel.json configurado para que todas las URLs funcionen
- ✅ Email de bienvenida apunta a `bitacorapro.cl/login`
- ✅ Inputs con `inputMode` correcto en mobile (teléfono: numeric, email: email)
- ✅ Campo RUT con `inputMode="text"` para permitir escribir el dígito verificador K en teclado mobile (ej: `12.345.678-K`)
- ✅ Fix zoom automático en inputs mobile (font-size: 16px forzado globalmente en App.css)
- ✅ Fix teclado que se cerraba al escribir en formulario de propiedades (AppInterior fuera de App)
- ✅ Fix email de invitación apunta a bitacorapro.cl (variable APP_URL en Railway)
- ✅ Fix nombre del admin en email de invitación (query a BD en lugar de JWT)
- ✅ Inspector queda logueado automáticamente al aceptar invitación
- ✅ Persistir sesión al hacer refresh (token guardado en localStorage)
- ✅ Permisos por rol en el frontend (inspectores no ven botones de eliminar proyectos ni gestionar equipo)
- ✅ Permisos por rol en el backend (endpoints protegidos con validación de rol en el servidor)
- ✅ "Olvidé mi contraseña" (recuperación por email via Resend + tabla password_resets)
- ✅ Estados de hallazgo: Pendiente / En progreso / Resuelto (selector inline en tarjeta, badge en vista pública y PDF)
- ✅ Fix rehidratación de currentUser al hacer refresh (llamada a /auth/me si hay token pero no hay usuario en memoria)
- ✅ Fix cambio de estado de hallazgo borraba atributos (se envían todos los campos al hacer PUT, no solo el status)
- ✅ Acta de entrega digital con firma táctil en pantalla (propietario + inspector)
- ✅ Acta con 5 secciones: datos generales, documentación, artefactos, medidores, conformidad
- ✅ Autosave del acta cada 1.2 segundos
- ✅ Botón sticky "Registrar hallazgo" dentro del acta — vuelve al acta con toast al guardar
- ✅ Anexo I: hallazgos congelados al momento de la firma
- ✅ Acta completamente bloqueada en solo lectura tras firma
- ✅ PDF del acta firmada con portada, 5 secciones, firmas y Anexo I (solo disponible tras firma)
- ✅ Botón sticky "Enviar PDF a Cliente" en acta firmada — genera PDF con jsPDF y lo envía por email con Resend al propietario como adjunto
- ✅ Fix URL endpoint send-delivery-act-pdf usa API_URL (funciona en local y producción)
- ✅ Formularios en pantallas independientes con URLs propias (crear proyecto, propiedad, hallazgo, acta)
- ✅ Dashboard de proyecto (`/proyectos/:projectId/dashboard`) — métricas agregadas, barras por categoría y severidad, progreso por propiedad, análisis IA de patrones sistémicos, tabla de gestión de hallazgos con filtros, cambio de estado inline, editar y eliminar hallazgos desde la tabla, y botón Ver con modal del hallazgo completo (fotos, descripción, recomendación, elementos afectados)
- ✅ Dashboard ocupa ancho completo en desktop (override de `.main` y header con clases `.app--dashboard` y `.main--dashboard`)
- ✅ Navegación automática al guardar/cancelar en formularios (replace: true para no volver al formulario vacío)
- ✅ Header y breadcrumb fixed (no desaparecen al hacer scroll)
- ✅ Botones de formulario con padding uniforme (clase `.form-actions`)
- ✅ Cards de proyecto y propiedad con botones de acción correctamente alineados y sin cortes
- ✅ Fix padding del header en mobile (safe-area sobreescribía los 16px base)
- ✅ Fix card "Sin proyectos aún" aparecía siempre por condicional JSX mal cerrado
- ✅ Fix parpadeo de "Sin propiedades" al cargar — estado `loadingProperties` evita mostrar empty state durante el fetch
- ✅ Fix botones de compartir link (propiedad y hallazgo) — reemplazado `navigator.clipboard` por helper con fallback `execCommand` compatible con HTTP, Safari iOS y Android
- ✅ Fix placeholders aparecían siempre al cargar — estados `loadingProjects`, `loadingEntries` y `loadingAct` evitan mostrar empty states durante el fetch inicial
- ✅ Fix botón "Iniciar acta" aparecía siempre primero — `loadingAct` se maneja directamente en el `useEffect` de la propiedad (no dentro del `useCallback`) para evitar cierre de scope; los fetches de entries y acta arrancan en paralelo y resetean sus flags al cambiar de propiedad
- ✅ Vistas públicas (`/h/:entryId` y `/p/:token`) actualizadas al design system v2 — isotipo SVG real, Inter, tokens CSS, clases de componentes, sin colores hexadecimales hardcodeados ni emojis funcionales
- ✅ Fix layout vistas públicas — caja de recomendación y tags/título de cards con padding correcto (eliminado doble padding generado por clases CSS con padding propio dentro de entry-header)
- ✅ Fix hover rojo en botones de acción de cards (borrar, editar, compartir) → cambiado a gris claro (`var(--gray-100)`) acorde al design system

## Backlog — Bugs
- 🐛 Scroll en Chrome iOS no resetea al tope al cambiar de pantalla

## Backlog — Features
- 💳 Integración de pagos cuando escale

## Endpoints del backend
### Auth
- `POST /auth/register` — registro (solo usado por invitaciones, no hay registro público)
- `POST /auth/login` — login, devuelve JWT + flag `must_change_password`
- `GET /auth/me` — obtener usuario actual
- `POST /auth/change-password` — cambiar contraseña (primer login obligatorio)

### Proyectos
- `GET /projects` — listar proyectos de la empresa
- `POST /projects` — crear proyecto
- `DELETE /projects/:id` — eliminar proyecto

### Propiedades
- `GET /projects/:id/properties` — listar propiedades
- `POST /projects/:id/properties` — crear propiedad
- `PUT /properties/:id` — editar propiedad
- `DELETE /properties/:id` — eliminar propiedad
- `GET /properties/:id/public-token` — obtener o generar token público (requiere auth)

### Hallazgos
- `GET /properties/:id/entries` — listar hallazgos
- `POST /properties/:id/entries` — crear hallazgo (multipart, analiza con IA)
- `PUT /entries/:id` — editar hallazgo
- `DELETE /entries/:id` — eliminar hallazgo

### Acta de entrega
- `GET /properties/:id/delivery-act` — obtener acta (null si no existe)
- `POST /properties/:id/delivery-act` — crear acta
- `PUT /properties/:id/delivery-act` — actualizar acta (el backend soporta edición post-firma con flag edited_after_signing, pero el frontend lo bloquea completamente)
- `POST /properties/:id/send-delivery-act-pdf` — genera PDF del acta y lo envía por email al propietario (requiere auth)

### Público (sin autenticación)
- `GET /public/entries/:entryId` — datos de un hallazgo para vista pública
- `GET /public/properties/:token` — datos completos de una propiedad para vista del propietario

### Equipo e invitaciones
- `GET /projects/:id/team` — listar equipo (admin only)
- `POST /projects/:id/invite` — invitar inspector por email
- `DELETE /projects/:id/members/:userId` — quitar inspector
- `GET /invitations/:token` — verificar token de invitación
- `POST /invitations/:token/accept` — aceptar invitación y crear cuenta
- `DELETE /invitations/:id` — cancelar invitación pendiente

### Panel superadmin (requiere header `x-admin-secret`)
- `GET /admin/stats` — todas las empresas con métricas de uso
- `POST /admin/create-company` — crear empresa + admin + enviar email de bienvenida
- `PUT /admin/companies/:id/toggle` — activar/desactivar empresa
- `DELETE /admin/companies/:id` — eliminar empresa y todos sus datos

### Dashboard de proyecto
- `GET /projects/:id/dashboard` — métricas agregadas (por estado, categoría, severidad, progreso por propiedad) + listado completo de hallazgos + contexto compacto para IA. Respeta permisos: admin ve todos sus proyectos, inspector solo los asignados.
- `POST /projects/:id/dashboard/ai-analysis` — análisis IA de patrones: recibe contexto compacto y genera reporte ejecutivo con patrones sistémicos, posibles causas y recomendaciones para el equipo de gestión

## Cómo levantar en local
Pestaña 1: `cd ~/Desktop/bitacora-postventa && npm run dev`
Pestaña 2: `cd ~/Desktop/bitacora-postventa/server && node index.js`
Abrir: http://localhost:5173

## Nota importante
Mario no es programador. Explicar todo paso a paso, como si fuera la primera vez. Claude es su co-founder técnico.
