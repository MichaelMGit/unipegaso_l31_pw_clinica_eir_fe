import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Paper, CircularProgress, TextField, Button, Alert, Chip, Tabs, Tab, Grid, MenuItem } from '@mui/material';
import PrenotazioniTable from '../../components/PrenotazioniTable';
import { pazientiService, prenotazioniService, mediciService, specialitaService } from '../../api/services';
import FoglioQrCodeGuest from '../../components/FoglioQrCodeGuest';
import { Dialog, DialogContent, DialogTitle, DialogActions } from '@mui/material';
import { confirm, success as swalSuccess, error as swalError } from '../../components/SwalHelper';
import PrenotazioneStatus from '../../constants/prenotazioneStatus';

export default function PazienteSegreteria() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paziente, setPaziente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const successTimerRef = useRef(null);

  const [form, setForm] = useState({ nome: '', cognome: '', email: '', telefono: '', codice_fiscale: '' });
  // prenotazioni (future / passate)
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [mediciMap, setMediciMap] = useState({});
  const [specialitaMap, setSpecialitaMap] = useState({});
  const [loadingPren, setLoadingPren] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await pazientiService.get(id);
        const data = res.data || res;
        if (!mounted) return;
        setPaziente(data);
        setForm({
          nome: data.nome || '',
          cognome: data.cognome || '',
          email: data.email || '',
          telefono: data.telefono || '',
          codice_fiscale: data.codice_fiscale || ''
        });
      } catch (err) {
        console.error('Errore caricamento paziente', err);
        if (mounted) setError('Impossibile caricare i dati del paziente.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) fetch();
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: '' }));
  };

  const validate = () => {
    const fe = {};
    if (!form.nome) fe.nome = 'Inserisci il nome';
    if (!form.cognome) fe.cognome = 'Inserisci il cognome';

    // validate codice fiscale if provided
    if (form.codice_fiscale && !/^[A-Za-z0-9]{16}$/.test(form.codice_fiscale)) fe.codice_fiscale = 'CF non valido';

    // validate telefono if provided
    const phoneDigits = (form.telefono || '').replace(/\D/g, '');
    if (paziente?.is_guest) {
      // for guest, telefono is required
      if (!form.telefono) fe.telefono = 'Inserisci il telefono del guest';
      else if (phoneDigits.length < 6) fe.telefono = 'Telefono non valido';
    } else {
      // non-guest: telefono optional but validate if provided
      if (form.telefono && phoneDigits.length < 6) fe.telefono = 'Telefono non valido';
    }

    // email is editable only for guest users — validate only in that case
    if (paziente?.is_guest && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = 'Email non valida';

    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleSave = async () => {
    setError('');
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        nome: form.nome,
        cognome: form.cognome,
        codice_fiscale: form.codice_fiscale || undefined,
        telefono: form.telefono || undefined,
      };
      if (paziente?.is_guest) payload.email = form.email || undefined;

      await pazientiService.update(id, payload);
      // non effettuare redirect dopo il salvataggio; restare sulla stessa pagina
      setSuccess('Dati paziente aggiornati.');
      // aggiornare lo state locale del paziente così la UI riflette i cambiamenti
      setPaziente((prev) => ({ ...(prev || {}), ...payload }));
      // pulire il messaggio di successo dopo 3s
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Errore salvataggio paziente', err);
      setError('Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  // pulire eventuale timer al dismontaggio
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const fetchPrenotazioni = React.useCallback(async () => {
    setLoadingPren(true);
    try {
      const params = { paziente_id: id, page: page + 1, page_size: rowsPerPage };
      const today = new Date().toISOString().slice(0,10);
      if (tabValue === 0) params.data_da = today; else params.data_a = today;

      const [prenRes, mediciRes, specialitaRes] = await Promise.all([
        prenotazioniService.list(params),
        mediciService.list(),
        specialitaService.list()
      ]);

      const mappa = {};
      (mediciRes.data || []).forEach(medico => {
        mappa[medico.id] = `Dott. ${medico.nome} ${medico.cognome}`;
      });
      setMediciMap(mappa);

      const s_mappa = {};
      (specialitaRes.data || []).forEach(s => s_mappa[s.id] = s.nome);
      setSpecialitaMap(s_mappa);

      const items = prenRes.data && prenRes.data.items ? prenRes.data.items : (prenRes.data || []);
      setPrenotazioni(items || []);
      setTotalCount(prenRes.data && prenRes.data.total ? prenRes.data.total : (Array.isArray(prenRes.data) ? prenRes.data.length : 0));
    } catch (err) {
      console.error('Errore caricamento prenotazioni', err);
      setPrenotazioni([]);
      setTotalCount(0);
    } finally {
      setLoadingPren(false);
    }
  }, [id, tabValue, page, rowsPerPage]);

  useEffect(() => {
    if (id) fetchPrenotazioni();
  }, [id, tabValue, page, rowsPerPage, fetchPrenotazioni]);

  const handleMarkPaid = async (prenId) => {
    try {
      // mark as paid via service
      await prenotazioniService.markPaid(prenId, true);
      // refresh list
      await fetchPrenotazioni();
      swalSuccess('Prenotazione segnata come pagata.');
    } catch (err) {
      console.error('Errore segnare come pagata', err);
      swalError('Impossibile segnare la prenotazione come pagata.');
    }
  };

  // --- Nuova prenotazione (form inline con paziente preselezionato) ---
  const [resForm, setResForm] = useState({ specialita_id: '', medico_id: '', data_prenotazione: '', ora_prenotazione: '', prestazione_richiesta_id: '' });
  const [resError, setResError] = useState('');
  const [resFieldErrors, setResFieldErrors] = useState({});
  const [specialitaDisponibili, setSpecialitaDisponibili] = useState([]);
  const [mediciFiltrati, setMediciFiltrati] = useState([]);
  const [prestazioniDisponibili, setPrestazioniDisponibili] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // QR dialog state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  // load specialita for the creation form
  useEffect(() => {
    const fetch = async () => {
      try {
        const resp = await specialitaService.list();
        setSpecialitaDisponibili(resp.data || []);
      } catch (err) {
        console.error('Errore caricamento specialita', err);
      }
    };
    fetch();
  }, []);

  // load medici when specialita changes for creation form
  useEffect(() => {
    if (!resForm.specialita_id) {
      setMediciFiltrati([]);
      return;
    }
    const fetch = async () => {
      try {
        const resp = await mediciService.list({ specialita_id: resForm.specialita_id });
        setMediciFiltrati(resp.data || []);
      } catch (err) {
        console.error('Errore caricamento medici', err);
        setMediciFiltrati([]);
      }
    };
    fetch();
  }, [resForm.specialita_id]);

  // load prestazioni when specialita changes
  useEffect(() => {
    if (!resForm.specialita_id) {
      setPrestazioniDisponibili([]);
      return;
    }
    const fetch = async () => {
      try {
        const resp = await specialitaService.prestazioni(resForm.specialita_id);
        setPrestazioniDisponibili(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error('Errore caricamento prestazioni', err);
        setPrestazioniDisponibili([]);
      }
    };
    fetch();
  }, [resForm.specialita_id]);

  // load slots when medico or date changes
  useEffect(() => {
    setResForm((prev) => ({ ...prev, ora_prenotazione: '' }));
    setSlots([]);
    if (!resForm.medico_id || !resForm.data_prenotazione) return;
    const fetch = async () => {
      setSlotsLoading(true);
      try {
        const r = await mediciService.getSlots(resForm.medico_id, resForm.data_prenotazione);
        setSlots(Array.isArray(r.data) ? r.data : []);
      } catch (err) {
        console.error('Errore caricamento slot', err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetch();
  }, [resForm.medico_id, resForm.data_prenotazione]);

  const handleResChange = (e) => {
    const { name, value } = e.target;
    setResForm((s) => ({ ...s, [name]: value }));
    setResFieldErrors((fe) => ({ ...fe, [name]: '' }));
  };

  const validateRes = () => {
    const fe = {};
    if (!resForm.specialita_id) fe.specialita_id = 'Seleziona la specialità';
    if (!resForm.medico_id) fe.medico_id = 'Seleziona un medico';
    if (!resForm.data_prenotazione) fe.data_prenotazione = 'Inserisci la data';
    if (!resForm.ora_prenotazione) fe.ora_prenotazione = 'Seleziona l\'orario';
    if (!resForm.prestazione_richiesta_id) fe.prestazione_richiesta_id = 'Seleziona la prestazione';
    setResFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleResSubmit = async (e) => {
    e.preventDefault();
    setResError('');
    if (!validateRes()) { setResError('Completa i campi obbligatori.'); return; }
    setCreating(true);
    try {
      const payload = {
        medico_id: resForm.medico_id,
        specialita_id: resForm.specialita_id,
        data_visita: resForm.data_prenotazione,
        orario_inizio: resForm.ora_prenotazione,
        prestazione_richiesta_id: resForm.prestazione_richiesta_id,
        paziente_id: id,
      };

      await prenotazioniService.create(payload);
      // refresh table
      await fetchPrenotazioni();
      setResForm({ specialita_id: '', medico_id: '', data_prenotazione: '', ora_prenotazione: '', prestazione_richiesta_id: '' });
      await swalSuccess('Prenotazione creata con successo.', 'Creata');
    } catch (err) {
      console.error('Errore creazione prenotazione', err);
      setResError('Errore durante la creazione della prenotazione.');
    } finally {
      setCreating(false);
    }
  };

  const handleResReset = () => {
    setResForm({ specialita_id: '', medico_id: '', data_prenotazione: '', ora_prenotazione: '', prestazione_richiesta_id: '' });
    setResFieldErrors({});
    setResError('');
  };

  const handleCloseQr = () => {
    setQrOpen(false);
    setQrToken('');
  };

  const handleStampaQr = async (pren) => {
    // otteniamo un token per l'accesso guest (resend o generazione)
    setQrLoading(true);
    try {
      const res = await prenotazioniService.resendGuestToken(pren.id);
      const data = (res && res.data) ? res.data : res;
      // possibile shape: { token: 'xxx' } oppure stringa semplice
      let token = null;
      if (!data) token = null;
      else if (typeof data === 'string') token = data;
      else token = data.guest_token || null;

      if (!token) {
        // if no token returned, try fetching detail
        const detail = await prenotazioniService.get(pren.id);
        const d = detail && detail.data ? detail.data : detail;
        token = d?.guest_token || d?.token || d?.token_access || null;
      }

      if (!token) {
        await swalError('Impossibile ottenere il token per la stampa del QR.');
        return;
      }

      setQrToken(token);
      setQrOpen(true);
    } catch (err) {
      console.error('Errore ottenimento token guest', err);
      await swalError('Errore durante la generazione del token per il guest.');
    } finally {
      setQrLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  const handleAnnulla = async (prenotazioneId) => {
    const ok = await confirm({
      title: 'Conferma annullamento',
      text: 'Sei sicuro di voler annullare questa prenotazione?',
      confirmButtonText: 'Sì, annulla',
      cancelButtonText: 'No, mantieni'
    });

    if (!ok) return;

    try {
      await prenotazioniService.updateStatus(prenotazioneId, { stato: PrenotazioneStatus.ANNULLATA });
      // ricarichiamo subito le prenotazioni per mostrare il nuovo stato
      try {
        setLoadingPren(true);
        const params = { paziente_id: id, page: page + 1, page_size: rowsPerPage };
        const today = new Date().toISOString().slice(0,10);
        if (tabValue === 0) params.data_da = today; else params.data_a = today;
        const prenRes = await prenotazioniService.list(params);
        const items = prenRes.data && prenRes.data.items ? prenRes.data.items : (prenRes.data || []);
        setPrenotazioni(items || []);
        setTotalCount(prenRes.data && prenRes.data.total ? prenRes.data.total : (Array.isArray(prenRes.data) ? prenRes.data.length : 0));
      } catch (err) {
        console.error('Errore ricaricamento prenotazioni dopo annullamento', err);
      } finally {
        setLoadingPren(false);
      }

      await swalSuccess('La prenotazione è stata annullata con successo.', 'Annullata');
    } catch (err) {
      await swalError('Errore durante l\'annullamento della prenotazione.');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Paziente</Typography>
          {paziente && (
            paziente.is_guest ? (
              <Chip label="Guest" color="warning" size="small" />
            ) : (
              <Chip label="Registrato" color="success" size="small" />
            )
          )}
        </Box>
        <Button variant="outlined" onClick={() => navigate(-1)}>Torna indietro</Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Informazioni Paziente</Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} error={!!fieldErrors.nome} helperText={fieldErrors.nome || ''} />
          <TextField label="Cognome" name="cognome" value={form.cognome} onChange={handleChange} error={!!fieldErrors.cognome} helperText={fieldErrors.cognome || ''} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} error={!!fieldErrors.email} helperText={fieldErrors.email || ''} disabled={!paziente?.is_guest} />
          <TextField label="Telefono" name="telefono" value={form.telefono} onChange={handleChange} error={!!fieldErrors.telefono} helperText={fieldErrors.telefono || ''} required={!!paziente?.is_guest} />
          <TextField label="Codice Fiscale" name="codice_fiscale" value={form.codice_fiscale} onChange={handleChange} error={!!fieldErrors.codice_fiscale} helperText={fieldErrors.codice_fiscale || ''} inputProps={{ maxLength: 16 }} sx={{ gridColumn: '1 / -1' }} />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Salvataggio...' : 'Salva'}</Button>
        </Box>
      </Paper>
      {/* --- Tabella Prenotazioni (future / passate) --- */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6">Prenotazioni</Typography>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs prenotazioni">
            <Tab label="Visite Future" sx={{ fontWeight: 'bold' }} />
            <Tab label="Visite Passate" sx={{ fontWeight: 'bold' }} />
          </Tabs>
        </Box>

        <PrenotazioniTable
          prenotazioni={prenotazioni}
          loading={loadingPren}
          tabValue={tabValue}
          mediciMap={mediciMap}
          specialitaMap={specialitaMap}
          onAnnulla={handleAnnulla}
          onMarkPaid={handleMarkPaid}
          showPaidColumn={true}
          canMarkPaid={true}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          showQrButton={!!paziente?.is_guest}
          onStampaQr={handleStampaQr}
        />
      </Paper>
      {/* --- Form inline per creare una nuova prenotazione per questo paziente --- */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Crea nuova prenotazione</Typography>

        {resError && <Alert severity="error" sx={{ mb: 2 }}>{resError}</Alert>}

        <Box component="form" onSubmit={handleResSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Paziente" value={paziente ? `${paziente.cognome || ''} ${paziente.nome || ''}`.trim() : ''} disabled />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select required fullWidth label="Specialità" name="specialita_id" value={resForm.specialita_id} onChange={handleResChange} error={!!resFieldErrors.specialita_id} helperText={resFieldErrors.specialita_id || ''}>
                {specialitaDisponibili.map(s => <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select required fullWidth label="Medico" name="medico_id" value={resForm.medico_id} onChange={handleResChange} disabled={!resForm.specialita_id} error={!!resFieldErrors.medico_id} helperText={resFieldErrors.medico_id || ''}>
                {mediciFiltrati.length > 0 ? mediciFiltrati.map(m => <MenuItem key={m.id} value={m.id}>Dott. {m.nome} {m.cognome}</MenuItem>) : <MenuItem value="" disabled>Nessun medico</MenuItem>}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField required fullWidth type="date" label="Data" name="data_prenotazione" value={resForm.data_prenotazione} onChange={handleResChange} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} error={!!resFieldErrors.data_prenotazione} helperText={resFieldErrors.data_prenotazione || ''} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select required fullWidth label="Orario" name="ora_prenotazione" value={resForm.ora_prenotazione} onChange={handleResChange} disabled={!resForm.medico_id || !resForm.data_prenotazione || slotsLoading} error={!!resFieldErrors.ora_prenotazione} helperText={resFieldErrors.ora_prenotazione || ''}>
                {slotsLoading ? <MenuItem value="" disabled>Caricamento...</MenuItem> : (slots.length > 0 ? slots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>) : <MenuItem value="" disabled>Nessun orario</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField select required fullWidth label="Prestazione richiesta" name="prestazione_richiesta_id" value={resForm.prestazione_richiesta_id} onChange={handleResChange} disabled={!resForm.specialita_id} error={!!resFieldErrors.prestazione_richiesta_id} helperText={resFieldErrors.prestazione_richiesta_id || ''}>
                {prestazioniDisponibili.length > 0 ? prestazioniDisponibili.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>) : <MenuItem value="" disabled>Nessuna prestazione</MenuItem>}
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Button variant="outlined" onClick={handleResReset}>Annulla</Button>
              <Button type="submit" variant="contained" disabled={creating}>{creating ? <CircularProgress size={18} /> : 'Conferma Prenotazione'}</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {/* Dialog per Foglio QR Guest */}
      <Dialog open={qrOpen} onClose={handleCloseQr} maxWidth="md" fullWidth>
        <DialogTitle>Foglio QR per il Guest</DialogTitle>
            <DialogContent>
          {qrLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <FoglioQrCodeGuest compact pazienteNome={`${paziente?.cognome || ''} ${paziente?.nome || ''}`.trim()} tokenAccesso={qrToken} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQr}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
