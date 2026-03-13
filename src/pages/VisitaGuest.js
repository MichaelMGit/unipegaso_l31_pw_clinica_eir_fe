import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Divider, List, CircularProgress, Alert } from '@mui/material';
import visiteService from '../api/services/visite';
import RefertoItem from '../components/RefertoItem';

export default function VisitaGuest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visita, setVisita] = useState(null);
  const [referti, setReferti] = useState([]);
  const [printingRelazione, setPrintingRelazione] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Leggiamo i dati memorizzati in localStorage dalla pagina di accesso
    const token = localStorage.getItem('guest_token');
    const cf = localStorage.getItem('guest_cf');
    const visitaRaw = localStorage.getItem('guest_visita');
    const refertiRaw = localStorage.getItem('guest_referti');

    if (!token || !cf || !visitaRaw) {
      // niente da mostrare -> ritorna alla pagina di accesso
      navigate('/accesso-guest', { replace: true });
      return;
    }

    try {
      const v = JSON.parse(visitaRaw);
      const r = refertiRaw ? JSON.parse(refertiRaw) : [];
      // optional: verify id matches
      if (id && String(v.id) !== String(id)) {
        // mismatch: prefer mostrare quello memorizzato
      }
      setVisita(v);
      setReferti(r);
    } catch (e) {
      console.error('Errore parsing guest data', e);
      navigate('/accesso-guest', { replace: true });
    }
  }, [id, navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('guest_token');
      localStorage.removeItem('guest_cf');
      localStorage.removeItem('guest_visita');
      localStorage.removeItem('guest_referti');
    } catch (e) {
      // noop
    }
    navigate('/login', { replace: true });
  };

  const handlePrintRelazione = async () => {
    try {
      setPrintingRelazione(true);

      const visitaId = visita && (visita.id || visita.visita_id);
      if (!visitaId) throw new Error('Nessuna visita associata per la stampa.');

      // Recupera token e codice_fiscale dal localStorage e passali come params
      const token = localStorage.getItem('guest_token');
      const codice_fiscale = localStorage.getItem('guest_cf');

      const res = await visiteService.printRelazione(visitaId, { token, codice_fiscale });
      // res.data is a blob when using axios client
      const blob = res.data || res;
      const url = window.URL.createObjectURL(blob);

      const newTab = window.open(url, '_blank');
      if (!newTab) {
        // popup bloccato: fallback al download forzato
        const a = document.createElement('a');
        a.href = url;
        a.download = `relazione_visita_${visitaId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setTimeout(() => window.URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      console.error('Errore stampa relazione', err);
      window.alert('Errore durante la generazione del PDF della relazione.');
    } finally {
      setPrintingRelazione(false);
    }
  };

  if (!visita) return null;

  // token and cf are stored in localStorage if needed for downloads; RefertoItem/RefertoDownload handle downloads

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }} elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Visita Ospite</Typography>
          <Button color="inherit" onClick={handleLogout}>Esci</Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Paziente: {visita.prenotazione.paziente.nome} {visita.prenotazione.paziente.cognome}
        </Typography>

        <Typography>Medico: {visita.prenotazione.medico.nome} {visita.prenotazione.medico.cognome}</Typography>
        <Typography>Specialità: {visita.prenotazione.specialita.nome}</Typography>
        <Typography>Data: {visita.prenotazione.data_visita} · Ora: {visita.prenotazione.orario_inizio}</Typography>
        <Typography>Prestazione: {visita.prenotazione.prestazione_richiesta?.nome || '-'}</Typography>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Relazione clinica</Typography>
            <Button variant="outlined" size="small" onClick={handlePrintRelazione} disabled={printingRelazione}>
              {printingRelazione ? <CircularProgress size={18} /> : 'Stampa relazione'}
            </Button>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
            <div dangerouslySetInnerHTML={{ __html: visita.relazione_clinica || '<i>Nessuna relazione</i>' }} />
          </Paper>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Referti</Typography>
          {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
          {referti.length === 0 ? (
            <Typography sx={{ mt: 1 }}>Nessun referto associato.</Typography>
          ) : (
            <List>
              {referti.map((r, idx) => (
                // Reuse RefertoItem for consistent rendering and download behavior
                <RefertoItem key={`${r.referto_id ?? r.prenotazione_id ?? r.id ?? idx}-${idx}`} referto={r} onError={setError} />
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
