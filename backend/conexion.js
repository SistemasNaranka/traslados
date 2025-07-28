require('dotenv').config();
const {
  createDirectus,
  rest,
  authentication,

} = require('@directus/sdk');

const DIRECTUS_URL = process.env.DIRECTUS_URL;

// Cliente global persistente
const directus = createDirectus(DIRECTUS_URL)
  .with(authentication('json')) //Para manejar refresh
  .with(rest());

async function autenticarUsuario(email, password) {
  try {
    await directus.login({ email, password });
    const token = await directus.getToken();

    const user = await directus.request(() => ({
      method: 'GET',
      path: '/users/me',
      params: {
        fields: ['email','codigo_ultra', 'empresa']
      }
    }));

    return { token, user }; // no uses user.data
  } catch (err) {
    
    throw new Error('Credenciales inválidas o sin acceso');
  }
}
// Función reutilizable para intentar una solicitud y refrescar si el token expiró
async function solicitarConRefresh(callback) {
  try {
    return await directus.request(callback);
  } catch (err) {
    if (err.errors?.[0]?.message === 'Token expired.') {
      console.log('Token expirado, intentando refresh...');
      await directus.refresh();
      return await directus.request(callback); // reintentar
    }
    throw err;
  }
}
module.exports = {
  autenticarUsuario,
};
