import { useState, useEffect } from 'react';
import { Container, Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/services';

export default function ProfiloPaziente() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    codice_fiscale: '',
  });

  const [passwords, setPasswords] = useState({
    nuovaPassword: '',
    confermaPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    setFormData({
      nome: user.nome || '',
      cognome: user.cognome || '',
      email: user.email || '',
      telefono: user.telefono || '',
      codice_fiscale: user.codice_fiscale || user.codiceFiscale || '',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    setError('');
    const errs = {};

    if (!formData.nome.trim()) {
      errs.nome = 'Nome è obbligatorio';
    }
    if (!formData.cognome.trim()) {
      errs.cognome = 'Cognome è obbligatorio';
    }

    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errs.email = 'Inserisci un indirizzo email valido';
    }

    const phone = formData.telefono ? formData.telefono.replace(/\D/g, '') : '';
    if (!phone || phone.length < 6) {
      errs.telefono = 'Inserisci un numero di telefono valido';
    }

    if (passwords.nuovaPassword || passwords.confermaPassword) {
      if (passwords.nuovaPassword.length < 6) {
        errs.nuovaPassword = 'La nuova password deve avere almeno 6 caratteri';
      }
      if (passwords.nuovaPassword !== passwords.confermaPassword) {
        errs.confermaPassword = 'Le password non corrispondono';
      }
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user || !user.id) {
      setError('Utente non valido');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nome: formData.nome.trim(),
        cognome: formData.cognome.trim(),
        telefono: formData.telefono.trim(),
      };
      if (passwords.nuovaPassword) {
        payload.password = passwords.nuovaPassword;
      }
      await authService.update(payload);
      await refreshUser();
      setSuccess('Profilo aggiornato con successo');
      setPasswords({ nuovaPassword: '', confermaPassword: '' });
    } catch (err) {
      console.error('Errore aggiornamento profilo', err);
      if (err?.response?.data?.detail) setError(err.response.data.detail);
      else setError('Errore durante l\'aggiornamento. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Modifica profilo</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={!!fieldErrors.nome}
            helperText={fieldErrors.nome || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Cognome"
            name="cognome"
            value={formData.cognome}
            onChange={handleChange}
            error={!!fieldErrors.cognome}
            helperText={fieldErrors.cognome || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Codice Fiscale"
            name="codice_fiscale"
            value={formData.codice_fiscale}
            InputProps={{ readOnly: true }}
            error={!!fieldErrors.codice_fiscale}
            helperText={fieldErrors.codice_fiscale || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            InputProps={{ readOnly: true }}
            error={!!fieldErrors.email}
            helperText={fieldErrors.email || ''}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            error={!!fieldErrors.telefono}
            helperText={fieldErrors.telefono || ''}
            sx={{ mb: 2 }}
          />

          <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'transparent' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Cambio password (opzionale)</Typography>
            <TextField
              fullWidth
              label="Nuova password"
              name="nuovaPassword"
              type="password"
              value={passwords.nuovaPassword}
              onChange={handlePasswordChange}
              error={!!fieldErrors.nuovaPassword}
              helperText={fieldErrors.nuovaPassword || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Conferma nuova password"
              name="confermaPassword"
              type="password"
              value={passwords.confermaPassword}
              onChange={handlePasswordChange}
              error={!!fieldErrors.confermaPassword}
              helperText={fieldErrors.confermaPassword || ''}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIosNewIcon />}
              onClick={() => navigate(-1)}
            >
              Torna indietro
            </Button>

            <Box sx={{ ml: 'auto' }}>
              <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Salvataggio...' : 'Salva modifiche'}</Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
