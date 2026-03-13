import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Card, CardContent, Button, CircularProgress, Alert, Stack, Grid, List, TextField, Pagination } from '@mui/material';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { prenotazioniService, pazientiService, refertiService, visiteService } from '../../api/services';
import RefertoItem from '../../components/RefertoItem';
import PrenotazioneStatus, { formatStatusLabel } from '../../constants/prenotazioneStatus';

export default function MedicoVisita() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pren, setPren] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [referti, setReferti] = useState([]);
  const [refertiLoading, setRefertiLoading] = useState(false);
  const [refertiPage, setRefertiPage] = useState(1);
  const [refertiPageSize] = useState(3);
  const [refertiTotal, setRefertiTotal] = useState(0);
  const [visita, setVisita] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingReferto, setUploadingReferto] = useState(false);
  const [titoloReferto, setTitoloReferto] = useState('');
  const [testoReferto, setTestoReferto] = useState('');
  const [relazioneClinica, setRelazioneClinica] = useState('');
  const [savingRelazione, setSavingRelazione] = useState(false);
  const [printingRelazione, setPrintingRelazione] = useState(false);
  const fileInputRef = useRef(null);

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setTitoloReferto('');
    setTestoReferto('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fetchPren = useCallback(async () => {
    try {
      setLoading(true);
      const res = await prenotazioniService.get(id);
      const raw = res.data;
      setPren(raw);
      const visitaId = raw.visita_id;
      if (visitaId) {
        fetchVisita(visitaId);
      } else {
        setVisita(null);
      }
    } catch (err) {
      console.error(err);
      setError('Impossibile caricare i dettagli della prenotazione.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchVisita = async (visitaId) => {
    try {
      const vres = await visiteService.get(visitaId);
      const vdata = vres.data;
      setVisita(vdata);
      setRelazioneClinica(vdata?.relazione_clinica || '');
    } catch (e) {
      console.error('Errore caricamento visita', e);
      setVisita(null);
      setRelazioneClinica('');
    }
  };

  useEffect(() => { fetchPren(); }, [fetchPren]);

  const fetchReferti = useCallback(async () => {
    if (!pren) return;
    setRefertiLoading(true);
    try {
      const pazienteId = pren.paziente.id;
      if (pazienteId) {
        const res = await pazientiService.getReferti(pazienteId, { page: refertiPage, page_size: refertiPageSize });
        const data = res.data && (res.data.items ? res.data.items : res.data);
        setReferti(Array.isArray(data) ? data : []);
        const total = res.data.total || 0;
        setRefertiTotal(total || (Array.isArray(data) ? data.length : 0));
      } else {
        setReferti([]);
        setRefertiTotal(0);
      }
    } catch (err) {
      console.error('Errore caricamento referti', err);
      setReferti([]);
      setRefertiTotal(0);
    } finally {
      setRefertiLoading(false);
    }
  }, [pren, refertiPage, refertiPageSize]);

  useEffect(() => { fetchReferti(); }, [fetchReferti]);

  useEffect(() => {
    setRefertiPage(1);
  }, [pren]);

  useEffect(() => {
    if (!visita) setRelazioneClinica('');
  }, [visita, pren]);

  const changeStatus = async (newStatus) => {
    try {
      setError('');
      await prenotazioniService.updateStatus(id, { stato: newStatus });
      setSuccess('Stato aggiornato.');
      fetchPren();
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      console.error(err);
      setError('Errore durante l\'aggiornamento dello stato.');
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setSelectedFile(f || null);
    if (f && !titoloReferto) setTitoloReferto(f.name);
  };

  const uploadReferto = async () => {
    if (!selectedFile) return setError('Seleziona un file da caricare.');
    try {
      setUploadingReferto(true);
      setError('');
      const payload = { titolo: titoloReferto || selectedFile.name, testo_referto: testoReferto };
      let visitaId = pren.visita_id;
      if (!visitaId) {
        try {
          const vres = await visiteService.list({ prenotazione_id: id, page: 1, page_size: 1 });
          const vdata = vres.data && (vres.data.items ? vres.data.items : vres.data);
          if (Array.isArray(vdata) && vdata.length > 0) visitaId = vdata[0].id;
        } catch (e) {
          console.error('Errore ricerca visita associata', e);
        }
      }

      if (!visitaId) {
        throw new Error('Nessuna visita associata a questa prenotazione. Impossibile creare il referto.');
      }

      const createRes = await refertiService.create(visitaId, payload);
      const created = createRes.data && (createRes.data.item ? createRes.data.item : createRes.data);
      const refertoId = created.referto_id;
      if (!refertoId) throw new Error('Impossibile ottenere l\'id del referto creato.');

      const formData = new FormData();
      formData.append('file', selectedFile);
      await refertiService.uploadAttachment(refertoId, formData);

      setSuccess('Referto caricato con successo.');
      setSelectedFile(null);
      setTitoloReferto('');
      setTestoReferto('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchReferti();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Errore upload referto', err);
      setError('Errore durante il caricamento del referto.');
    } finally {
      setUploadingReferto(false);
    }
  };

  const saveRelazione = async () => {
    if (!pren) return;
    try {
      setSavingRelazione(true);
      setError('');

      let visitaId = pren.visita_id;
      if (!visitaId) {
        try {
          const vres = await visiteService.list({ prenotazione_id: id, page: 1, page_size: 1 });
          const vdata = vres.data && (vres.data.items ? vres.data.items : vres.data);
          if (Array.isArray(vdata) && vdata.length > 0) visitaId = vdata[0].id;
        } catch (e) {
          console.error('Errore ricerca visita associata', e);
        }
      }

      if (!visitaId) throw new Error('Nessuna visita associata a questa prenotazione. Impossibile salvare la relazione.');

      await visiteService.updateRelazione(visitaId, { relazione_clinica: relazioneClinica });
      setSuccess('Relazione clinica salvata con successo.');
      setVisita((v) => v ? { ...v, relazione_clinica: relazioneClinica } : v);
      setTimeout(() => setSuccess(''), 3000);
      return true;
    } catch (err) {
      console.error('Errore salvataggio relazione', err);
      setError('Errore durante il salvataggio della relazione clinica.');
      return false;
    } finally {
      setSavingRelazione(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Dettaglio visita {pren?.specialita?.nome || ''}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
                <Typography sx={{ mt: 1 }}>
                  Paziente:{' '}
                  {(() => {
                    const pid = pren.paziente?.id;
                    const displayName = (pren.paziente?.nome || pren.paziente?.cognome)
                      ? `${pren.paziente?.nome || ''} ${pren.paziente?.cognome || ''}`.trim()
                      : (pid ? `#${pid}` : '-');
                    if (pid) {
                      return (
                        <Button variant="text" size="small" onClick={() => navigate(`/medico/paziente/${pid}`)}>
                          {displayName}
                        </Button>
                      );
                    }
                    return displayName;
                  })()}
                </Typography>
                <Typography>
                  Data visita: {pren.data_visita ? new Date(pren.data_visita).toLocaleDateString('it-IT') : '-'} alle {pren.orario_inizio ? pren.orario_inizio.substring(0,5) : '-'}
                </Typography>
                <Typography>Stato: {formatStatusLabel(pren.stato)}</Typography>
                <Typography sx={{ mt: 1 }}>Prestazione richiesta: {pren.prestazione_richiesta?.nome || '-'}</Typography>

                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  {pren.stato !== PrenotazioneStatus.COMPLETATA && (
                    <Button variant="contained" color="success" onClick={() => changeStatus(PrenotazioneStatus.COMPLETATA)}>Segna come completata</Button>
                  )}
                  <Button variant="text" onClick={() => navigate(-1)}>Indietro</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Tutti i referti del paziente</Typography>
                {refertiLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24} /></Box>
                ) : (
                  referti.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">Nessun referto trovato per questo paziente</Typography>
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
                {refertiTotal > refertiPageSize && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Pagination
                      count={Math.ceil(refertiTotal / refertiPageSize)}
                      page={refertiPage}
                      onChange={(e, p) => setRefertiPage(p)}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Relazione clinica</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ position: 'relative', zIndex: 1, '& .ql-container': { minHeight: 200, pointerEvents: 'auto' }, '& .ql-editor': { minHeight: 180 } }}>
                    <ReactQuill theme="snow" value={relazioneClinica} onChange={setRelazioneClinica} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="primary" onClick={saveRelazione} disabled={savingRelazione}>
                      {savingRelazione ? <CircularProgress size={18} color="inherit" /> : 'Salva relazione'}
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={async () => {
                      try {
                        setPrintingRelazione(true);
                        setError('');

                        const saved = await saveRelazione();
                        if (!saved) throw new Error('Salvataggio relazione fallito.');

                        let visitaId = visita.id;
                        if (!visitaId) throw new Error('Nessuna visita associata per la stampa.');

                        const res = await visiteService.printRelazione(visitaId);
                        const blob = res.data || res;
                        const url = window.URL.createObjectURL(blob);

                        const newTab = window.open(url, '_blank');
                        if (!newTab) {
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
                        setError('Errore durante la generazione del PDF della relazione.');
                      } finally {
                        setPrintingRelazione(false);
                      }
                    }} disabled={printingRelazione}>
                      {printingRelazione ? <CircularProgress size={18} color="inherit" /> : 'Stampa PDF'}
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>Carica referto</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Titolo referto"
                    value={titoloReferto}
                    onChange={(e) => setTitoloReferto(e.target.value)}
                    fullWidth
                  />

                  <Box sx={{ position: 'relative', zIndex: 1, '& .ql-container': { minHeight: 160, pointerEvents: 'auto' }, '& .ql-editor': { minHeight: 140 } }}>
                    <ReactQuill theme="snow" value={testoReferto} onChange={setTestoReferto} />
                  </Box>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="outlined" component="label">
                      Seleziona file
                      <input hidden ref={fileInputRef} type="file" onChange={handleFileChange} />
                    </Button>
                    <Typography variant="body2" sx={{ ml: 1 }}>{selectedFile ? selectedFile.name : 'Nessun file selezionato'}</Typography>
                  </Stack>

                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button variant="contained" color="primary" onClick={uploadReferto} disabled={!selectedFile || uploadingReferto}>
                      {uploadingReferto ? <CircularProgress size={18} color="inherit" /> : 'Carica'}
                    </Button>
                    <Button variant="text" onClick={clearSelectedFile} disabled={uploadingReferto}>Annulla</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
