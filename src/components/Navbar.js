import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import UserRoles from '../constants/userRoles';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rotteNascoste = ['/login', '/registrazione'];

  if (rotteNascoste.includes(location.pathname)) {
    return null;
  }

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => navigate('/')}
        >
          <Box
            component="img"
            src="/images/logo_nome_b.png"
            alt="Clinica Eir"
            sx={{ height: 40, display: { xs: 'none', sm: 'block' } }}
          />
          <Box
            component="img"
            src="/images/logo_b.png"
            alt="Clinica Eir"
            sx={{ height: 36, display: { xs: 'block', sm: 'none' } }}
          />
        </Box>

        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 500,
                display: user?.ruolo === UserRoles.PAZIENTE ? { xs: 'none', sm: 'block' } : { xs: 'block' },
              }}
            >
              Benvenuto, {user.nome} {user.cognome}
            </Typography>
            {user?.ruolo === UserRoles.PAZIENTE && (
              <Button color="inherit" variant="outlined" onClick={() => navigate('/paziente/profilo')} sx={{ borderColor: 'white' }}>
                Il mio profilo
              </Button>
            )}
            <Button color="inherit" variant="outlined" onClick={logout} sx={{ borderColor: 'white' }}>
              Esci
            </Button>
          </Box>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            Accedi
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}