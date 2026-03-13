import { useState } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import visiteService from '../api/services/visite';

export default function AccessoGuest() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const [token] = useState(tokenFromUrl);
  const [codiceFiscale, setCodiceFiscale] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  // Se manca il token nella URL, reindirizza alla login (l'utente guest non deve vedere il token)
  if (!tokenFromUrl) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!token) {
      setError('Token mancante nell\'URL. Assicurati di aver aperto il link completo ricevuto via QR.');
      return;
    }

    if (!codiceFiscale || codiceFiscale.trim().length < 6) {
      setError('Inserisci un codice fiscale valido.');
      return;
    }

    try {
  setLoading(true);
  // POST to the new /api/visite/guest endpoint via the visite service
  const payload = { token, codice_fiscale: codiceFiscale.trim().toUpperCase() };
  const resp = await visiteService.guestAccess(payload);

  // Resp format is intentionally flexible: may contain download_url, referto, message
      const data = resp.data || { message: 'Accesso completato.' };
      setResult(data);

      // Se l'autenticazione è andata a buon fine (presenza di visita), memorizziamo token + CF e navighiamo
      if (data.visita && data.visita.id) {
        try {
          // memorizza per sessione (persistente) in localStorage
          localStorage.setItem('guest_token', token);
          localStorage.setItem('guest_cf', payload.codice_fiscale);
          localStorage.setItem('guest_visita', JSON.stringify(data.visita));
          localStorage.setItem('guest_referti', JSON.stringify(data.referti || []));
        } catch (e) {
          // ignore storage errors
        }

        // navighiamo alla pagina visita-guest
        navigate(`/visita-guest/${data.visita.id}`, { replace: true });
        return;
      }
    } catch (err) {
      console.error('Errore guest access:', err);
      const message = err?.response?.data?.detail || err?.response?.data?.message || err.message || 'Errore durante la richiesta.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          Accesso rapido visita
        </Typography>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Apri il link ricevuto tramite QR e inserisci il tuo Codice Fiscale per visualizzare il referto.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Codice Fiscale"
            fullWidth
            margin="normal"
            value={codiceFiscale}
            onChange={(e) => setCodiceFiscale(e.target.value)}
            inputProps={{ maxLength: 16 }}
          />

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Accedi al referto'}
            </Button>
          </Box>
        </Box>

        {result && (
          <Box sx={{ mt: 3 }}>
            <Alert severity="success">Accesso effettuato con successo.</Alert>

            {/* Se il backend ha restituito un link per il download, mostriamolo */}
            {result.download_url && (
              <Typography sx={{ mt: 2 }}>
                Puoi scaricare il documento qui: <Link href={result.download_url} target="_blank" rel="noreferrer">Scarica referto</Link>
              </Typography>
            )}

            {/* Se il backend ha restituito un oggetto 'referto' con id, offriamo un link convenzionale */}
            {result.referto_id && (
              <Typography sx={{ mt: 2 }}>
                Referto trovato: <Link href={`/referti/${result.referto_id}`} target="_blank">Apri referto</Link>
              </Typography>
            )}

            {/* Fallback: mostra l'oggetto restituito */}
            {!result.download_url && !result.referto_id && (
              <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</Typography>
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
