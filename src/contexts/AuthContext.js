import { createContext, useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/services';
import { getDashboardRoute } from '../constants/userRoles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // loading previene il rendering delle rotte protette prima di aver controllato il token
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      clearInterval(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const scheduleRefreshFromToken = useCallback((accessToken) => {
    clearRefreshTimer();
    if (!accessToken) return;
    try {
      const parts = String(accessToken).split('.');
      if (parts.length < 2) return;
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp; // seconds since epoch
      const now = Math.floor(Date.now() / 1000);
      // refresh 60s before expiry
      const msUntilRefresh = (exp - now - 60) * 1000;
      const delay = Math.max(msUntilRefresh, 30 * 1000);
      refreshTimeoutRef.current = setTimeout(async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          // no refresh token -> force logout
          clearRefreshTimer();
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          navigate('/login');
          return;
        }
        try {
          const r = await authService.refresh(refreshToken);
          const { access_token, refresh_token: new_refresh } = r.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', new_refresh);
          // refresh user data and reschedule
          try {
            const userRes = await authService.me();
            setUser(userRes.data);
          } catch (_) { /* ignore */ }
          scheduleRefreshFromToken(access_token);
        } catch (err) {
          // refresh failed -> logout
          clearRefreshTimer();
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          navigate('/login');
        }
      }, delay);
    } catch (e) {
      // cannot decode token: fallback to periodic refresh every 10 minutes
      refreshTimeoutRef.current = setInterval(async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return;
        try {
          const r = await authService.refresh(refreshToken);
          const { access_token, refresh_token: new_refresh } = r.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', new_refresh);
          try { const userRes = await authService.me(); setUser(userRes.data); } catch (_) {}
        } catch (err) {
          clearRefreshTimer();
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          navigate('/login');
        }
      }, 10 * 60 * 1000);
    }
  }, [clearRefreshTimer, navigate]);

  useEffect(() => {
    // Al refresh della pagina, recupera la sessione dal localStorage
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Invece di decodificare il token, chiediamo i dati freschi al server
            const response = await authService.me();
            setUser(response.data); // Salva l'intero oggetto (nome, cognome, ruolo, ecc.)
            // Programmiamo un refresh proattivo basato sul token
            scheduleRefreshFromToken(token);
        } catch (error) {
          console.error("Sessione scaduta o non valida");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
    return () => clearRefreshTimer();
  }, [clearRefreshTimer, scheduleRefreshFromToken]);

  const login = async (email, password) => {
    // ATTENZIONE: FastAPI (OAuth2PasswordRequestForm) esige i dati come x-www-form-urlencoded, non come JSON.
  const response = await authService.login(email, password);
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);

    // Subito dopo aver salvato il token, chiediamo i dati dell'utente
  const userResponse = await authService.me();
    setUser(userResponse.data); // Popola lo stato globale con i dati reali

    // Programmiamo il refresh proattivo
    scheduleRefreshFromToken(access_token);

    // Smistamento automatico basato sul ruolo (RBAC)
    navigate(getDashboardRoute(userResponse.data.ruolo));
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // Chiama l'endpoint di FastAPI per revocare il token nel database
  await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error("Errore durante il logout lato server", error);
    } finally {
      // Pulizia totale e redirect, anche se la chiamata API fallisce
      clearRefreshTimer();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  };

  // Consente alle pagine di richiedere un refresh esplicito dei dati dell'utente
  const refreshUser = async () => {
    try {
      const res = await authService.me();
      setUser(res.data);
      return res.data;
    } catch (err) {
      console.error('Impossibile aggiornare i dati utente', err);
      return null;
    }
  };

  // Riascolta gli eventi di refresh emessi dall'API client per rischedulare
  useEffect(() => {
    const handler = (e) => {
      const token = e?.detail?.access_token;
      if (token) scheduleRefreshFromToken(token);
    };
    window.addEventListener('token_refreshed', handler);
    return () => window.removeEventListener('token_refreshed', handler);
  }, [scheduleRefreshFromToken]);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);