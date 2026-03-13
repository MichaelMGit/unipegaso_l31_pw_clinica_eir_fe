import { useEffect, useState } from 'react';
import { 
  Container, Typography, Grid, Card, CardContent, CardActions, Button, Box, Alert, CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { prenotazioniService, mediciService, specialitaService } from '../../api/services';

export default function PazienteDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location?.state?.successMessage;
  const [nextPrenotazione, setNextPrenotazione] = useState(null);
  const [nextLoading, setNextLoading] = useState(true);
  const [nextError, setNextError] = useState('');
  const [mediciMap, setMediciMap] = useState({});
  const [specialitaMap, setSpecialitaMap] = useState({});

  const formatTime = (time) => {
    if (!time) return '';
    if (typeof time !== 'string') return String(time);
    const parts = time.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
  };

  useEffect(() => {
    let mounted = true;
    const fetchNext = async () => {
      try {
        setNextLoading(true);
        const today = new Date().toISOString().slice(0,10);
        const [prenRes, medRes, specRes] = await Promise.all([
          prenotazioniService.list({ data_da: today, page: 1, page_size: 1 }),
          mediciService.list(),
          specialitaService.list()
        ]);

        if (!mounted) return;

        const rawPren = prenRes.data.items[0] || null;
        setNextPrenotazione(rawPren);

        const mMap = {};
        (medRes.data || []).forEach(m => mMap[m.id] = `Dott. ${m.nome} ${m.cognome}`);
        setMediciMap(mMap);

        const sMap = {};
        (specRes.data || []).forEach(s => sMap[s.id] = s.nome);
        setSpecialitaMap(sMap);
      } catch (err) {
        console.error(err);
        if (mounted) setNextError('Impossibile caricare la prossima prenotazione.');
      } finally {
        if (mounted) setNextLoading(false);
      }
    };

    fetchNext();
    return () => { mounted = false; };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
      <Box sx={{ mb: 4 }}>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          Area Personale Paziente
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Gestisci le tue visite mediche, prenota nuovi appuntamenti e consulta i tuoi referti in completa sicurezza.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }} gutterBottom>
                Prossima Prenotazione
              </Typography>
              {nextLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 2 }} />
                  <Typography variant="body2" color="textSecondary">Caricamento...</Typography>
                </Box>
              ) : nextError ? (
                <Alert severity="error">{nextError}</Alert>
              ) : nextPrenotazione ? (
                <Box>
                  <Typography variant="body1">{new Date(nextPrenotazione.data_visita).toLocaleDateString('it-IT')} - {formatTime(nextPrenotazione.orario_inizio)}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {specialitaMap[nextPrenotazione?.specialita?.id] || 'Specialità non trovata'} • {mediciMap[nextPrenotazione?.medico?.id] || 'Medico non trovato'}
                      {nextPrenotazione?.prestazione_richiesta?.nome ? ` • ${nextPrenotazione.prestazione_richiesta.nome}` : ''}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">Nessuna prenotazione futura.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Le mie Prenotazioni
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Visualizza l'elenco dei tuoi appuntamenti futuri e passati. Puoi anche prenotare una nuova visita scegliendo lo specialista e l'orario che preferisci.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/paziente/nuova-prenotazione')}
              >
                Nuova Prenotazione
              </Button>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/paziente/storico-prenotazioni')}
              >
                Storico Visite
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h5" gutterBottom color="primary">
                I miei Referti
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Consulta i risultati delle tue visite mediche. I referti sono disponibili non appena il medico avrà completato l'inserimento nel sistema.
              </Typography>
            </CardContent>
            <CardActions sx={{ p: 2, pt: 0 }}>
              <Button 
                variant="contained" 
                color="secondary"
                onClick={() => navigate('/paziente/referti')}
              >
                Visualizza Referti
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}