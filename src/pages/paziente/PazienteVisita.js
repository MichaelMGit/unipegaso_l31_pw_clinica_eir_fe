import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, CircularProgress, Alert, Stack, Grid, List } from '@mui/material';
import { prenotazioniService, visiteService } from '../../api/services';
import RefertoItem from '../../components/RefertoItem';
import { formatStatusLabel } from '../../constants/prenotazioneStatus';

export default function PazienteVisita() {
  const { id } = useParams(); // prenotazione id or visita id depending on routing
  const navigate = useNavigate();

  const [pren, setPren] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [referti, setReferti] = useState([]);
  const [refertiLoading, setRefertiLoading] = useState(false);
  const [relazioneClinica, setRelazioneClinica] = useState('');
  const [printingRelazione, setPrintingRelazione] = useState(false);

  const fetchPren = useCallback(async () => {
    try {
      setLoading(true);
      const res = await prenotazioniService.get(id);
      const raw = res.data && (res.data.items ? res.data.items : res.data);
      setPren(raw);
      // Immediately try to fetch referti for the fetched prenotazione to avoid timing issues
      (async () => {
        try {
          let visitaId = raw?.visita_id || null;
          if (!visitaId) {
            try {
              const vres = await visiteService.list({ prenotazione_id: id, page: 1, page_size: 1 });
              const vdata = vres.data.items;
              if (Array.isArray(vdata) && vdata.length > 0) visitaId = vdata[0].id;
            } catch (e) {
              // ignore
            }
          }
          if (visitaId) {
            // fetch visita details (read-only for patient)
            try {
              const vres = await visiteService.get(visitaId);
              const vdata = vres.data;
              setRelazioneClinica(vdata?.relazione_clinica || '');
            } catch (e) {
              // ignore
            }
            setRefertiLoading(true);
            // fetch all referti for the visita (no pagination on this page)
            const r = await visiteService.getReferti(visitaId);
            const items = r.data || [];
            setReferti(items || []);
          }
        } catch (e) {
          console.error('Errore fetchReferti immediato dopo fetchPren', e);
        } finally {
          setRefertiLoading(false);
        }
      })();
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare i dettagli della prenotazione.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPren(); }, [fetchPren]);

  // helper to fetch referti for a given visita id (page is 1-based)
  const fetchRefertiForVisita = React.useCallback(async (visitaId) => {
    try {
      setRefertiLoading(true);
      if (!visitaId) {
        setReferti([]);
        return;
      }
      const r = await visiteService.getReferti(visitaId);
      const items = r.data.items || [];
      setReferti(items || []);
      // no pagination: set total to items length for compatibility
      // (we removed refertiTotal state used only for pagination visibility)
    } catch (err) {
      console.error('Errore caricamento referti', err);
      setReferti([]);
    } finally {
      setRefertiLoading(false);
    }
  }, []);

  useEffect(() => {
    // fetch referti when pren becomes available (no pagination)
    const doFetch = async () => {
      if (!pren) return;
      let visitaId = pren.visita_id || null;
      if (!visitaId) {
        try {
          const vres = await visiteService.list({ prenotazione_id: id, page: 1, page_size: 1 });
          const vdata = vres.data;
          if (Array.isArray(vdata) && vdata.length > 0) visitaId = vdata[0].id;
        } catch (e) {
          // ignore
        }
      }
      await fetchRefertiForVisita(visitaId);
    };
    doFetch();
  }, [pren, id, fetchRefertiForVisita]);

  // no pagination: nothing to reset when pren changes

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Dettaglio visita {pren?.specialita?.nome || ''}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!pren ? (
        <Card>
          <CardContent>
            <Typography>Dettaglio non disponibile</Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start' }}>
              <Button variant="text" onClick={() => navigate(-1)}>Indietro</Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{pren.medico?.nome || ''} {pren.medico?.cognome || ''}</Typography>
                <Typography sx={{ mt: 1 }}>Paziente: {(pren.paziente?.nome || pren.paziente?.cognome)
                  ? `${pren.paziente?.nome || ''} ${pren.paziente?.cognome || ''}`.trim()
                  : (pren.paziente?.id || pren.paziente_id ? `#${pren.paziente?.id || pren.paziente_id}` : '-')}
                </Typography>
                <Typography>
                  Data visita: {pren.data_visita ? new Date(pren.data_visita).toLocaleDateString('it-IT') : '-'} alle {pren.orario_inizio ? pren.orario_inizio.substring(0, 5) : '-'}
                </Typography>
                <Typography>Stato: {formatStatusLabel(pren.stato)}</Typography>
                <Typography sx={{ mt: 1 }}>Prestazione richiesta: {pren.prestazione_richiesta?.nome || '-'}</Typography>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button variant="text" onClick={() => navigate(-1)}>Indietro</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Referti della visita</Typography>
                {refertiLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24} /></Box>
                ) : (
                  referti.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">Nessun referto trovato per questa visita</Typography>
                  ) : (
                    <Box sx={{ overflow: 'auto', flex: 1, mt: 1 }}>
                      <List>
                        {referti.map((r, idx) => (
                          <RefertoItem key={`${r.referto_id}-${idx}`} referto={r} onError={setError} />
                        ))}
                      </List>
                    </Box>
                  )
                )}

                {/* no pagination on this page */}
              </CardContent>
            </Card>
          </Grid>

          {/* Relazione clinica in sola lettura */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6">Relazione clinica</Typography>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        setPrintingRelazione(true);
                        setError('');
                        // determine visita id
                        let visitaId = pren?.visita_id || null;
                        if (!visitaId) {
                          try {
                            const vres = await visiteService.list({ prenotazione_id: id, page: 1, page_size: 1 });
                            const vdata = vres.data;
                            if (Array.isArray(vdata) && vdata.length > 0) visitaId = vdata[0].id;
                          } catch (e) {
                            // ignore
                          }
                        }
                        if (!visitaId) throw new Error('Nessuna visita associata per la stampa.');
                        const res = await visiteService.printRelazione(visitaId);
                        const blob = res.data || res;
                        const url = window.URL.createObjectURL(blob);
                        const newTab = window.open(url, '_blank');
                        if (!newTab) {
                          // fallback download
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
                        console.error('Errore stampa relazione paziente', err);
                        setError('Errore durante la generazione del PDF della relazione.');
                      } finally {
                        setPrintingRelazione(false);
                      }
                    }}
                    disabled={printingRelazione}
                  >
                    {printingRelazione ? <CircularProgress size={18} color="inherit" /> : 'Stampa PDF'}
                  </Button>
                </Box>
                {relazioneClinica ? (
                  <Box sx={{ whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: relazioneClinica }} />
                ) : (
                  <Typography variant="body2" color="textSecondary">Nessuna relazione clinica disponibile per questa visita.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
