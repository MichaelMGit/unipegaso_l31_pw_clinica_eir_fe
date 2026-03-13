import axios from 'axios';
import { endpoints } from './endpoints';
import { authService } from './services';

// Creiamo un'istanza dedicata. Grazie al "proxy" nel package.json, 
// la baseURL può essere la root e le chiamate a /api/ andranno a FastAPI.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Interceptor delle RICHIESTE: inietta l'Access Token prima di ogni chiamata
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor delle RISPOSTE: gestisce la logica di Refresh automatico
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se l'errore è 401 (Unauthorized), non abbiamo già tentato il refresh (_retry),
    // e non stiamo già cercando di fare login o refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== endpoints.auth.login &&
      originalRequest.url !== endpoints.auth.refresh
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Usiamo axios base (non l'istanza 'api') per chiamare il refresh,
          // altrimenti rischiamo un loop infinito se anche il refresh dà 401.
          const response = await authService.refresh(refreshToken);

          const { access_token, refresh_token: new_refresh_token } = response.data;

          // Aggiorniamo i token nel localStorage
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', new_refresh_token);

          // Notifichiamo l'app che i token sono stati aggiornati (utile per reschedulare refresh proattivo)
          try {
            window.dispatchEvent(new CustomEvent('token_refreshed', { detail: { access_token, refresh_token: new_refresh_token } }));
          } catch (e) {
            // ignore in non-browser environments
          }

          // Aggiorniamo l'header della richiesta originale fallita e la ripetiamo
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
          
        } catch (refreshError) {
          // Il refresh token è scaduto o revocato. Pulizia totale e redirect.
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      } else {
        // Niente refresh token presente. Pulizia e redirect.
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }

    // Per tutti gli altri errori (es. 400, 403, 500) propaga l'errore ai componenti
    return Promise.reject(error);
  }
);

export default api;