const { Pool } = require('./server/node_modules/pg')
const bcrypt = require('./server/node_modules/bcryptjs')

const pool = new Pool({
  connectionString: 'postgresql://postgres:rrptyanuphkItIsWukuXzLIaDmNQqGpe@interchange.proxy.rlwy.net:20738/railway',
  ssl: { rejectUnauthorized: false }
})

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

function rutDigito(n) {
  let sum = 0, factor = 2
  while (n > 0) {
    sum += (n % 10) * factor
    n = Math.floor(n / 10)
    factor = factor === 7 ? 2 : factor + 1
  }
  const r = 11 - (sum % 11)
  if (r === 11) return '0'
  if (r === 10) return 'K'
  return String(r)
}

function generarRut() {
  const n = rand(5000000, 25000000)
  const dv = rutDigito(n)
  return `${n.toLocaleString('es-CL')}-${dv}`
}

const nombres = ['Carlos Andrés','María José','Jorge Ignacio','Valentina','Luis Alberto','Camila Andrea','Pedro Pablo','Francisca','Roberto','Daniela','Sebastián','Patricia','Alejandro','Catalina','Felipe','Sofía','Rodrigo','Verónica','Diego','Natalia','Héctor','Lorena','Miguel','Beatriz','Nicolás','Carolina','Tomás','Claudia','Ignacio','Marcela']
const apellidos = ['González','Muñoz','Rojas','Díaz','Pérez','Soto','Contreras','Silva','Martínez','Sepúlveda','Morales','Torres','Flores','Ramírez','Castro','Gutiérrez','Vargas','Álvarez','Fuentes','Herrera','Figueroa','Mendoza','Navarro','Espinoza','Valenzuela','Castillo','Reyes','Salinas','Lagos','Campos']

function nombreCompleto() {
  return `${pick(nombres)} ${pick(apellidos)} ${pick(apellidos)}`
}
function emailFicticio(nombre) {
  const clean = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'.')
  return `${clean}${rand(1,99)}@gmail.com`
}
function telefonoFicticio() {
  return `+569${rand(10000000,99999999)}`
}

const hallazgosPool = [
  // TERMINACIONES
  { cat: 'terminaciones', sev: 'leve', titulo: 'Pintura con manchas en muro de living', desc: 'Se observan manchas de pintura mal aplicada en el muro sur del living-comedor. El color presenta irregularidades en la textura, probablemente por aplicación en condiciones de humedad. Área afectada aproximada: 0,8 m².', rec: 'Lijar zona afectada, aplicar sellador y repintar con rodillo en dos manos.', elem: 'Muro sur, pintura látex' },
  { cat: 'terminaciones', sev: 'leve', titulo: 'Zócalo despegado en dormitorio', desc: 'Zócalo de madera MDF se encuentra despegado del muro en tramo de 40 cm. Se evidencia que el adhesivo no hizo correcta adherencia, posiblemente por superficie polvorienta al momento de la instalación.', rec: 'Remover zócalo, limpiar superficie, aplicar adhesivo de contacto y fijar con clavos perdidos.', elem: 'Zócalo MDF, adhesivo' },
  { cat: 'terminaciones', sev: 'moderado', titulo: 'Cerámica de baño con fisura diagonal', desc: 'Cerámica del piso del baño principal presenta fisura diagonal de aproximadamente 12 cm. La fisura atraviesa completamente la pieza, lo que podría permitir infiltración de agua en el tiempo.', rec: 'Reemplazar pieza cerámica completa. Verificar que el mortero de soporte esté en buen estado antes de reinstalar.', elem: 'Piso cerámico, mortero de base' },
  { cat: 'terminaciones', sev: 'leve', titulo: 'Burlete de puerta exterior desgastado', desc: 'El burlete de goma perimetral de la puerta de entrada presenta desgaste prematuro, lo que genera filtración de corriente de aire al interior. No cumple con estándar de hermeticidad.', rec: 'Reemplazar burlete completo con producto de silicona de igual sección.', elem: 'Burlete perimetral, puerta entrada' },
  { cat: 'terminaciones', sev: 'moderado', titulo: 'Porcelanato de cocina desnivelado', desc: 'Se detectan 3 piezas de porcelanato en el sector de la cocina con diferencia de nivel superior a 2 mm respecto a las piezas adyacentes. Genera riesgo de tropiezo y acumulación de suciedad en las uniones.', rec: 'Retirar piezas afectadas, nivelar mortero de base y reinstalar con niveladores.', elem: 'Porcelanato, niveladores de instalación' },
  { cat: 'terminaciones', sev: 'grave', titulo: 'Ventana con sellado deficiente', desc: 'La ventana del dormitorio 2 presenta filtración de agua por sellado perimetral deficiente. Se detecta humedad en el marco inferior y manchas de agua en el muro adyacente. El sellante presenta grietas y separación del marco.', rec: 'Remover sellante deteriorado, limpiar superficie, aplicar sello de poliuretano de alta adherencia en todo el perímetro.', elem: 'Ventana termopanel, marco aluminio, sellante' },
  { cat: 'terminaciones', sev: 'leve', titulo: 'Puertas de closet con desalineación', desc: 'Las puertas correderas del closet del dormitorio principal presentan desalineación vertical de 5 mm, lo que impide el cierre correcto y genera ruido al deslizarse.', rec: 'Ajustar rodamientos superiores e inferiores del sistema de riel. Verificar plomo del vano.', elem: 'Riel de corredera, rodamientos, puertas MDF' },
  { cat: 'terminaciones', sev: 'leve', titulo: 'Junta de expansión mal terminada en logia', desc: 'La junta de expansión del piso de la logia fue rellenada con mortero en lugar de sellante flexible, lo que provoca microfisuras al dilatar.', rec: 'Retirar mortero, limpiar canal y aplicar sellante poliuretánico flexible apto para exteriores.', elem: 'Junta de expansión, piso logia' },
  { cat: 'terminaciones', sev: 'moderado', titulo: 'Mesón de cocina con borde despegado', desc: 'El revestimiento de postformado del mesón de cocina presenta levantamiento en el borde frontal de 25 cm. La humedad del lavaplatos cercano aceleró el despegue del adhesivo de contacto.', rec: 'Aplicar adhesivo de neopreno en borde, prensar con sargento y sellar unión con silicona transparente.', elem: 'Mesón postformado, adhesivo de contacto' },
  { cat: 'terminaciones', sev: 'leve', titulo: 'Sello perimetral de tina deteriorado', desc: 'El sello de silicona entre la tina y el revestimiento cerámico del muro presenta fisuras y coloración negruzca (hongos). El deterioro compromete la impermeabilidad de la unión.', rec: 'Retirar sello deteriorado con espátula, limpiar y aplicar silicona fungicida neutra blanca.', elem: 'Sello silicona, unión tina-cerámica' },
  { cat: 'terminaciones', sev: 'moderado', titulo: 'Cielo laminado con deformación', desc: 'El cielo de volcanita del dormitorio principal presenta deformación tipo pandeo en placa central de 1,2 m². Posiblemente causado por humedad durante la construcción o fijación insuficiente.', rec: 'Verificar fijación de perfiles metálicos. Reemplazar placa deformada y retapar con pasta muro.', elem: 'Cielo volcanita, perfiles metálicos' },
  { cat: 'terminaciones', sev: 'leve', titulo: 'Empaque de puerta de ducha deteriorado', desc: 'El empaque magnético de la puerta de vidrio de la ducha no cierra herméticamente, permitiendo escape de agua hacia el piso del baño durante su uso.', rec: 'Reemplazar empaque magnético por uno del mismo perfil. Verificar alineación de la puerta.', elem: 'Puerta ducha vidrio, empaque magnético' },

  // INSTALACIONES
  { cat: 'instalaciones', sev: 'moderado', titulo: 'Presión de agua insuficiente en ducha', desc: 'La ducha del baño principal presenta presión de agua notoriamente inferior al mínimo reglamentario (15 m.c.a. según NCh 2485). Se estima 8 m.c.a. aproximado. Reductor de presión posiblemente mal calibrado.', rec: 'Verificar calibración del reductor de presión general. Inspeccionar válvula de paso y posibles obstrucciones en tubería de 1/2".', elem: 'Tubería PVC 1/2", reductor de presión, mezcladora ducha' },
  { cat: 'instalaciones', sev: 'grave', titulo: 'Pérdida de agua en unión bajo lavabo', desc: 'Se detecta pérdida activa de agua en la unión entre sifón y tubería de desagüe del lavamanos. La humedad acumulada bajo el mueble presenta inicio de deterioro en el aglomerado del gabinete.', rec: 'Reemplazar sifón y conectores flexibles. Ajustar con teflón. Secar y revisar deterioro del mueble.', elem: 'Sifón PVC, tubería desagüe 2", gabinete bajo lavamanos' },
  { cat: 'instalaciones', sev: 'leve', titulo: 'Grifo de lavaplatos con goteo', desc: 'El grifo monomando del lavaplatos presenta goteo continuo desde el pico al estar cerrado. Goteo estimado: 1 gota cada 3 segundos. Indica desgaste del cartucho cerámico.', rec: 'Reemplazar cartucho cerámico del grifo. Si el modelo no tiene repuesto disponible, reemplazar grifo completo.', elem: 'Grifo monomando, cartucho cerámico' },
  { cat: 'instalaciones', sev: 'moderado', titulo: 'Calefont sin encendido automático', desc: 'El calefont de tiro forzado no enciende automáticamente al abrir el paso de agua. Requiere encendido manual repetido. El sensor de flujo podría estar obstruido por sedimentos.', rec: 'Limpiar sensor de flujo y electroválvula. Verificar presión de gas. Si persiste, reemplazar sensor.', elem: 'Calefont tiro forzado, sensor de flujo, electroválvula' },
  { cat: 'instalaciones', sev: 'grave', titulo: 'Caño de desagüe con obstrucción', desc: 'El desagüe de la tina presenta evacuación lenta, tardando más de 90 segundos en drenar. Probable obstrucción por residuos de obra (mortero) en la trampa sifónica.', rec: 'Desatascar con máquina de cable hasta 10 metros. Si obstrucción es mortero endurecido, reemplazar tramo afectado.', elem: 'Desagüe tina, trampa sifónica, tubería PVC 2"' },
  { cat: 'instalaciones', sev: 'leve', titulo: 'Válvula de corte de WC difícil de operar', desc: 'La válvula de corte del WC presenta resistencia al cierre, requiriendo excesiva fuerza. Indica inicio de corrosión interna o sarro acumulado.', rec: 'Aplicar lubricante penetrante. Si no mejora, reemplazar válvula por una de esfera de 1/2" de latón.', elem: 'Válvula de corte 1/2", WC' },
  { cat: 'instalaciones', sev: 'moderado', titulo: 'Extractor de cocina con caudal insuficiente', desc: 'El extractor de la campana de cocina opera con caudal inferior al especificado (mínimo 300 m³/h). Se aprecia vibración anormal. El ducto de evacuación podría estar parcialmente obstruido.', rec: 'Revisar ducto de evacuación exterior. Limpiar filtros de grasa. Verificar sentido de giro del motor.', elem: 'Campana extractora, ducto PVC, filtros de carbón activo' },
  { cat: 'instalaciones', sev: 'moderado', titulo: 'Termostato de piso radiante descalibrado', desc: 'El termostato del sistema de piso radiante no alcanza la temperatura configurada, operando 3–5°C bajo el setpoint. Podría indicar falta de calibración o sensor defectuoso.', rec: 'Recalibrar termostato según manual del fabricante. Verificar sonda de temperatura en piso.', elem: 'Termostato digital, sistema piso radiante, sonda temperatura' },
  { cat: 'instalaciones', sev: 'leve', titulo: 'WC con llenado lento del estanque', desc: 'El estanque del WC demora más de 4 minutos en llenarse completamente tras el descargo, lo que indica restricción en la válvula de ingreso. El llenado normal debería ser inferior a 90 segundos.', rec: 'Limpiar o reemplazar válvula de llenado. Verificar presión de agua en el punto.', elem: 'Válvula llenado, estanque WC, flotador' },

  // ESTRUCTURAL
  { cat: 'estructural', sev: 'grave', titulo: 'Fisura diagonal en muro de carga', desc: 'Se observa fisura diagonal de 35 cm en muro de carga del dormitorio principal, partiendo desde el vértice superior de la ventana. Ancho: 1,2 mm. Posible asentamiento diferencial o concentración de tensiones.', rec: 'Informe de especialista estructural requerido. No rellenar hasta evaluar causa. Monitorear con testigos de yeso.', elem: 'Muro de carga HA, vano ventana, estructura' },
  { cat: 'estructural', sev: 'moderado', titulo: 'Grieta en unión losa-muro en terraza', desc: 'Se detecta grieta horizontal en la unión entre la losa de terraza y el muro perimetral. Ancho aproximado 0,8 mm, extensión 60 cm. Posible movimiento diferencial entre elementos.', rec: 'Sellar con mortero polimérico flexible después de verificar ausencia de movimiento activo. Monitorear por 30 días.', elem: 'Losa terraza, muro perimetral, junta constructiva' },
  { cat: 'estructural', sev: 'leve', titulo: 'Contrapiso con sonido hueco en cocina', desc: 'Al caminar sobre el contrapiso de la cocina se detecta sonido hueco en área de 0,5 m², indicando despegue del mortero de la losa base. No presenta fisuras visibles pero puede evolucionar.', rec: 'Inyectar lechada de cemento con jeringas en perforaciones de 6 mm para consolidar el plano de apoyo.', elem: 'Contrapiso mortero, losa base, adhesivo' },
  { cat: 'estructural', sev: 'critico', titulo: 'Viga de terraza con armadura expuesta', desc: 'En la viga perimetral de la terraza se detecta armadura de acero expuesta por desprendimiento del recubrimiento de hormigón en tramo de 20 cm. La armadura presenta inicio de oxidación superficial.', rec: 'Urgente: limpiar armadura con cepillo metálico, aplicar inhibidor de corrosión, reponer recubrimiento con mortero sin retracción. Informe estructural.', elem: 'Viga HA, armadura acero, recubrimiento' },
  { cat: 'estructural', sev: 'moderado', titulo: 'Tabique de baño con desplome', desc: 'El tabique divisorio del baño presenta desplome de 8 mm en su altura de 2,4 m (1/300). Supera la tolerancia admisible y puede afectar la instalación de cerámicas.', rec: 'Verificar si el desplome es de obra o posterior. Evaluar corrección con mortero o construcción de nuevo tabique.', elem: 'Tabique albañilería, aplomado, revestimiento cerámico' },

  // HUMEDAD
  { cat: 'humedad', sev: 'grave', titulo: 'Manchas de humedad bajo ventana', desc: 'Se detectan manchas de humedad en la parte baja del muro bajo la ventana del dormitorio 2, con eflorescencias salinas (manchas blancas). Área afectada: 0,4 m². Posible infiltración por sellado deficiente del marco.', rec: 'Verificar y reemplazar sellante perimetral de ventana. Aplicar impermeabilizante cristalizante en muro afectado.', elem: 'Muro interior, marco ventana, sellante, revestimiento' },
  { cat: 'humedad', sev: 'moderado', titulo: 'Condensación en muro norte con hongos', desc: 'El muro norte del dormitorio principal presenta condensación recurrente en la esquina superior, con inicio de manchas de hongos superficiales. El muro presenta temperatura inferior a la del ambiente por puente térmico.', rec: 'Aplicar pintura antimicótica en zona afectada. Mejorar ventilación del dormitorio. Evaluar aislación térmica en muro.', elem: 'Muro norte, esquina superior, puente térmico' },
  { cat: 'humedad', sev: 'grave', titulo: 'Filtración activa en losa de terraza', desc: 'La losa de la terraza presenta filtración activa de agua hacia el entrepiso durante lluvia. Se detectan manchas de humedad en el cielo del dormitorio ubicado bajo la terraza. La membrana impermeabilizante habría fallado.', rec: 'Retirar cerámicas de terraza, inspeccionar membrana, reparar zonas de falla o aplicar membrana nueva. Urgente antes de próximas lluvias.', elem: 'Membrana impermeabilizante terraza, losa, revestimiento cerámico' },
  { cat: 'humedad', sev: 'moderado', titulo: 'Piso de baño con humedad bajo cerámica', desc: 'Se detecta humedad en el piso bajo la cerámica con oscurecimiento del mortero. Posible falla en la membrana del baño húmedo.', rec: 'Verificar estado de la impermeabilización. Si hay falla, retirar cerámicas, reparar membrana y reinstalar.', elem: 'Membrana baño húmedo, mortero base, cerámicas piso' },
  { cat: 'humedad', sev: 'critico', titulo: 'Humedad ascendente en muro de logia', desc: 'El muro inferior de la logia presenta humedad ascendente capilar hasta 35 cm de altura, con eflorescencias y desconchamiento del revestimiento. Indica falla en la barrera de humedad del cimiento.', rec: 'Aplicar sistema de inyección de resina hidrofóbica en la base del muro para crear barrera horizontal. Reparar revestimiento afectado.', elem: 'Muro logia, barrera capilar, revestimiento' },

  // ELECTRICO
  { cat: 'electrico', sev: 'grave', titulo: 'Enchufe de baño sin protección diferencial', desc: 'El enchufe del baño principal no está protegido con disyuntor diferencial (IDR) de alta sensibilidad (30 mA) según exige la norma NCh Elec. 4/2003 para locales húmedos. Riesgo eléctrico directo.', rec: 'Instalar IDR 30 mA en el circuito del baño. Verificar toda la instalación de locales húmedos.', elem: 'Enchufe baño, tablero eléctrico, IDR 30mA' },
  { cat: 'electrico', sev: 'moderado', titulo: 'Interruptor con chispazo al operar', desc: 'El interruptor del dormitorio 2 produce chispazo visible al encender/apagar la luz. Indica contactos oxidados o desgastados. El interruptor tiene temperatura elevada al tacto.', rec: 'Reemplazar interruptor completo. Verificar estado del cableado en la caja y ajustar conexiones.', elem: 'Interruptor simple, cableado fase 1.5mm²' },
  { cat: 'electrico', sev: 'leve', titulo: 'Tomacorriente sin tensión en living', desc: 'Uno de los tomacorrientes dobles del living no tiene tensión en ninguno de sus módulos. Los demás circuitos del sector funcionan correctamente. Probable conexión suelta en la caja.', rec: 'Abrir caja y verificar conexiones. Revisar continuidad del circuito. Reconectar o reemplazar según sea necesario.', elem: 'Tomacorriente doble, cableado 2.5mm², caja de empalme' },
  { cat: 'electrico', sev: 'moderado', titulo: 'Breaker de cocina se dispara recurrente', desc: 'El breaker del circuito de cocina se dispara recurrentemente al utilizar simultáneamente horno y microondas. El circuito está dimensionado en 16A pero la carga instalada supera los 20A.', rec: 'Revisar dimensionamiento del circuito de cocina. Considerar circuito dedicado de 20A para electrodomésticos de alta potencia.', elem: 'Tablero eléctrico, breaker 16A, cableado cocina' },

  // OTRO
  { cat: 'otro', sev: 'leve', titulo: 'Rejilla de ventilación de baño obstruida', desc: 'La rejilla de ventilación del baño de visitas está parcialmente obstruida con residuos de obra (pintura seca y polvo). El caudal de renovación de aire es insuficiente.', rec: 'Limpiar rejilla y ducto de ventilación. Verificar continuidad del ducto hasta el exterior del edificio.', elem: 'Rejilla ventilación, ducto PVC, ventilador extractor' },
  { cat: 'otro', sev: 'leve', titulo: 'Citófono sin respuesta desde exterior', desc: 'El módulo interior del citófono no responde cuando se llama desde el módulo de acceso del edificio. Los vecinos del mismo nivel no presentan el problema. Posible falla en el módulo interior o en el cableado del ramal.', rec: 'Verificar alimentación 12V del módulo interior. Revisar continuidad del cableado del ramal. Reemplazar módulo si es necesario.', elem: 'Citófono interior, cableado ramal, módulo acceso' },
  { cat: 'otro', sev: 'moderado', titulo: 'Puerta de acceso con cerradura dura', desc: 'La puerta de acceso principal presenta resistencia al girar la llave, requiriendo fuerza excesiva. La cerradura tiene juego lateral visible. Indica desalineación entre picaporte y guarnición.', rec: 'Ajustar posición de la guarnición. Lubricar mecanismo con grafito en polvo. Si persiste, reemplazar cilindro.', elem: 'Cerradura, picaporte, guarnición, marco puerta' },
]

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Empresa
    console.log('Creando empresa...')
    const empRes = await client.query(
      "INSERT INTO companies (name) VALUES ($1) RETURNING id",
      ['Inmobiliaria San Manuel']
    )
    const companyId = empRes.rows[0].id
    console.log(`  empresa id: ${companyId}`)

    // 2. Usuario admin
    console.log('Creando usuario admin...')
    const hash = await bcrypt.hash('Demo2026!', 10)
    const userRes = await client.query(
      "INSERT INTO users (company_id, name, email, password_hash, role, must_change_password) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
      [companyId, 'Alejandro Vega Soto', 'demo@vistaverde.cl', hash, 'admin', false]
    )
    const userId = userRes.rows[0].id
    console.log(`  user id: ${userId}`)

    // 3. Proyecto
    console.log('Creando proyecto...')
    const projRes = await client.query(
      "INSERT INTO projects (company_id, name) VALUES ($1,$2) RETURNING id",
      [companyId, 'Condominio Los Cerezos — Etapa 2']
    )
    const projectId = projRes.rows[0].id
    console.log(`  project id: ${projectId}`)

    // 4. Project member
    await client.query(
      "INSERT INTO project_members (project_id, user_id) VALUES ($1,$2)",
      [projectId, userId]
    )

    // 5. Propiedades (80)
    console.log('Creando 80 propiedades...')
    const propertyIds = []
    for (let piso = 1; piso <= 4; piso++) {
      for (let u = 1; u <= 20; u++) {
        const unit = `${piso}${String(u).padStart(2,'0')}`
        const nombre = nombreCompleto()
        const rut = generarRut()
        const email = emailFicticio(nombre)
        const phone = telefonoFicticio()
        const res = await client.query(
          "INSERT INTO properties (project_id, unit_number, owner_name, owner_rut, owner_email, owner_phone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
          [projectId, unit, nombre, rut, email, phone]
        )
        propertyIds.push(res.rows[0].id)
      }
    }
    console.log(`  ${propertyIds.length} propiedades creadas`)

    // 6. Hallazgos (300)
    console.log('Creando 300 hallazgos...')
    const statuses = [
      ...Array(150).fill('pendiente'),
      ...Array(90).fill('en_progreso'),
      ...Array(60).fill('resuelto')
    ]
    for (let i = statuses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [statuses[i], statuses[j]] = [statuses[j], statuses[i]]
    }
    const ubicaciones = ['Baño principal','Cocina','Dormitorio principal','Dormitorio 2','Living-comedor','Terraza','Logia','Estacionamiento','Pasillo interior']

    for (let i = 0; i < 300; i++) {
      const propId = pick(propertyIds)
      const h = pick(hallazgosPool)
      const status = statuses[i]
      const ubicacion = pick(ubicaciones)
      const createdDaysAgo = rand(1, 90)
      const createdAt = new Date(Date.now() - createdDaysAgo * 86400000)
      await client.query(
        `INSERT INTO entries (property_id, created_by, title, description, recommendation, category, severity, location, affected_elements, ai_generated, status, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [propId, userId, h.titulo, h.desc, h.rec, h.cat, h.sev, ubicacion, h.elem, 1, status, createdAt]
      )
    }
    console.log('  300 hallazgos creados')

    await client.query('COMMIT')
    console.log('\n✓ Seed completado exitosamente')
    console.log(`  Empresa id: ${companyId}`)
    console.log(`  Usuario: demo@vistaverde.cl / Demo2026!`)
    console.log(`  Proyecto: "Condominio Los Cerezos — Etapa 2"`)
    console.log(`  Propiedades: 80 | Hallazgos: 300`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error — rollback ejecutado:', err.message)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
