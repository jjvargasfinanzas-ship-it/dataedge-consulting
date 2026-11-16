// Entrega las plantillas gratis SOLO a usuarios registrados.
// El navegador llama a /api/descargar?f=<slug> con el token de sesión de Supabase
// en la cabecera Authorization. Sin token válido no se entrega nada.
// Los archivos viven en _privado/plantillas/ y esa ruta está bloqueada en vercel.json.

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://fammwgjikfvfkydrhjfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhbW13Z2ppa2Z2Zmt5ZHJoamZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzQ0MDIsImV4cCI6MjA5MTc1MDQwMn0.-ryWEneBxj9GBcjnb0KLgUT8cPOjcgu-tbSQE-BOAg8';

// Lista cerrada: solo estos archivos se pueden pedir.
const PLANTILLAS = {
  'flujo-de-caja':       'Fp_Flujo_de_caja_mensual.xlsx',
  'finanzas-personales': 'DataEdge_Finanzas_Personales.xlsx',
  'amortizacion':        'DataEdge_Tabla_de_Amortizacion.xlsx',
  'presupuesto-2027':    'DataEdge_Presupuesto_2027_Cierre_2026.xlsx'
};

async function usuarioValido(token) {
  if (!token) return null;
  try {
    const r = await fetch(SUPABASE_URL + '/auth/v1/user', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token }
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u && u.id ? u : null;
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  const slug = String((req.query && req.query.f) || '');
  const nombre = PLANTILLAS[slug];
  if (!nombre) {
    res.status(404).json({ error: 'Plantilla no encontrada' });
    return;
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const user = await usuarioValido(token);
  if (!user) {
    res.status(401).json({ error: 'Debes registrarte e iniciar sesión para descargar esta plantilla.' });
    return;
  }

  const ruta = path.join(process.cwd(), '_privado', 'plantillas', nombre);
  let data;
  try {
    data = fs.readFileSync(ruta);
  } catch (e) {
    res.status(500).json({ error: 'Archivo no disponible' });
    return;
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="' + nombre + '"');
  res.setHeader('Content-Length', data.length);
  res.status(200).send(data);
};
