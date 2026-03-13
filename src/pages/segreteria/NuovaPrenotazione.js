import { useEffect, useState, useCallback } from 'react';
import {
  Container, Paper, Typography, Box, TextField, MenuItem, Button, Grid, Alert, CircularProgress, FormControlLabel, Switch
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useNavigate } from 'react-router-dom';
import { prenotazioniService, specialitaService, mediciService, pazientiService, authService } from '../../api/services';

export default function NuovaPrenotazioneSegreteria() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    specialita_id: '',
    medico_id: '',
    data_prenotazione: '',
    ora_prenotazione: '',
    prestazione_richiesta_id: ''
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientQuery, setPatientQuery] = useState('');
  const [patientOptions, setPatientOptions] = useState([]);
  const [patientLoading, setPatientLoading] = useState(false);

  const [guestMode, setGuestMode] = useState(false);
  const [guestData, setGuestData] = useState({ nome: '', cognome: '', codice_fiscale: '', email: '', telefono: '' });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [specialitaDisponibili, setSpecialitaDisponibili] = useState([]);
  const [mediciFiltrati, setMediciFiltrati] = useState([]);
  const [prestazioniDisponibili, setPrestazioniDisponibili] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    const fetchSpecialita = async () => {
      try {
        const resp = await specialitaService.list();
        setSpecialitaDisponibili(resp.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSpecialita();
  }, []);

  useEffect(() => {
    if (!formData.specialita_id) {
      setMediciFiltrati([]);
      return;
    }
    const fetch = async () => {
      try {
        const resp = await mediciService.list({ specialita_id: formData.specialita_id });
        setMediciFiltrati(resp.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [formData.specialita_id]);

  useEffect(() => {
    if (!formData.specialita_id) {
      setPrestazioniDisponibili([]);
      return;
    }
    const fetch = async () => {
      try {
        const resp = await specialitaService.prestazioni(formData.specialita_id);
        setPrestazioniDisponibili(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error(err);
        setPrestazioniDisponibili([]);
      }
    };
    fetch();
  }, [formData.specialita_id]);

  // slots
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ora_prenotazione: '' }));
    setSlots([]);
    if (!formData.medico_id || !formData.data_prenotazione) return;
    const fetch = async () => {
      setSlotsLoading(true);
      try {
        const resp = await mediciService.getSlots(formData.medico_id, formData.data_prenotazione);
        setSlots(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error(err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetch();
  }, [formData.medico_id, formData.data_prenotazione]);

  // patient autocomplete search
  const doPatientSearch = useCallback(async (q) => {
    if (!q || q.length < 2) {
      setPatientOptions([]);
      return;
    }
    try {
      setPatientLoading(true);
      const res = await pazientiService.list({ q, page: 1, page_size: 10 });
  const items = (res.data && (res.data.items ? res.data.items : res.data)) || [];
      setPatientOptions(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setPatientOptions([]);
    } finally {
      setPatientLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doPatientSearch(patientQuery), 300);
    return () => clearTimeout(t);
  }, [patientQuery, doPatientSearch]);

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    if (name === 'codice_fiscale') {
      // keep only alphanumeric, uppercase, limit to 16 chars
      const cleaned = (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
      setGuestData({ ...guestData, [name]: cleaned });
    } else if (name === 'telefono') {
      // allow digits, plus, space, hyphen, keep reasonable length
      const cleaned = (value || '').replace(/[^0-9+\-\s]/g, '').slice(0, 24);
      setGuestData({ ...guestData, [name]: cleaned });
    } else {
      setGuestData({ ...guestData, [name]: value });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors((fe) => ({ ...fe, [name]: '' }));
  };

  const validate = () => {
    const fe = {};
    if (!formData.specialita_id) fe.specialita_id = 'Seleziona la specialità';
    if (!formData.medico_id) fe.medico_id = 'Seleziona un medico';
    if (!formData.data_prenotazione) fe.data_prenotazione = 'Inserisci la data';
    if (!formData.ora_prenotazione) fe.ora_prenotazione = 'Seleziona l\'orario';
    if (!formData.prestazione_richiesta_id) fe.prestazione_richiesta_id = 'Seleziona la prestazione';

    if (!selectedPatient && !guestMode) fe.patient = 'Seleziona un paziente o crea un guest';
    if (!selectedPatient && guestMode) {
      if (!guestData.nome) fe.guest_nome = 'Inserisci nome guest';
      if (!guestData.cognome) fe.guest_cognome = 'Inserisci cognome guest';
      if (!guestData.telefono) fe.guest_telefono = 'Inserisci telefono guest';
      // telefono validation: at least 6 digits
      const phoneDigits = (guestData.telefono || '').replace(/\D/g, '');
      if (guestData.telefono && phoneDigits.length < 6) fe.guest_telefono = 'Numero di telefono non valido';
      // email validation (if provided)
      if (guestData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestData.email)) fe.guest_email = 'Email non valida';
      // codice fiscale validation (if provided) - basic check: 16 alfanumerici
      if (guestData.codice_fiscale && !/^[A-Za-z0-9]{16}$/.test(guestData.codice_fiscale)) fe.guest_codice_fiscale = 'Codice fiscale non valido';
    }

    setFieldErrors(fe);
    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) {
      setError('Completa i campi obbligatori.');
      return;
    }
    setLoading(true);
    try {
      // If guest mode and no selected patient, create a user first
      let pazienteId = selectedPatient ? selectedPatient.id : null;
      if (!pazienteId && guestMode) {
        // generate simple random password
        const genPassword = () => {
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          let pw = '';
          for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
          return pw;
        };
        const password = genPassword();
        const regPayload = {
          nome: guestData.nome,
          cognome: guestData.cognome,
          email: guestData.email || `guest+${Date.now()}@example.invalid`,
          password,
          codice_fiscale: guestData.codice_fiscale || undefined,
          telefono: guestData.telefono || undefined,
          is_guest: true,
        };

        try {
          const regResp = await authService.register(regPayload);
          pazienteId = regResp?.data?.id || regResp?.data?.user?.id || regResp?.data?.paziente_id || regResp?.data?.paziente?.id || null;
          // fallback: try to find by email if response didn't include id
          if (!pazienteId && regPayload.email) {
            const search = await pazientiService.list({ q: regPayload.email, page: 1, page_size: 1 });
            const items = (search.data && (search.data.items ? search.data.items : search.data)) || [];
            if (items.length > 0) pazienteId = items[0].id;
          }
        } catch (regErr) {
          console.error('Errore creazione guest user', regErr);
          // try to lookup by email if available
          if (guestData.email) {
            try {
              const search = await pazientiService.list({ q: guestData.email, page: 1, page_size: 1 });
              const items = (search.data && (search.data.items ? search.data.items : search.data)) || [];
              if (items.length > 0) pazienteId = items[0].id;
            } catch (sErr) {
              console.error('Errore ricerca paziente dopo fallimento registrazione', sErr);
            }
          }
          if (!pazienteId) throw regErr;
        }
      }

      const payload = {
        medico_id: formData.medico_id,
        specialita_id: formData.specialita_id,
        data_visita: formData.data_prenotazione,
        orario_inizio: formData.ora_prenotazione,
        prestazione_richiesta_id: formData.prestazione_richiesta_id,
      };
      if (pazienteId) payload.paziente_id = pazienteId;
      else payload.guest = {
        nome: guestData.nome,
        cognome: guestData.cognome,
        codice_fiscale: guestData.codice_fiscale,
        email: guestData.email,
        telefono: guestData.telefono,
      };

      await prenotazioniService.create(payload);
      navigate('/segreteria/dashboard', { state: { successMessage: 'Prenotazione creata.' } });
    } catch (err) {
      console.error(err);
      setError('Errore durante la creazione della prenotazione.');
    } finally {
      setLoading(false);
    }
  };

  const oggi = new Date().toISOString().split('T')[0];

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>Nuova Prenotazione</Typography>
        <Typography variant="body1" color="textSecondary" paragraph>Compila i dati della prenotazione e associa un paziente oppure crea un guest.</Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                options={patientOptions}
                getOptionLabel={(o) => o ? `${o.cognome || ''} ${o.nome || ''}`.trim() : ''}
                filterOptions={(x) => x}
                value={selectedPatient}
                onChange={(e, v) => { setSelectedPatient(v); setGuestMode(false); }}
                onInputChange={(e, v) => setPatientQuery(v)}
                loading={patientLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Seleziona Paziente"
                    placeholder="Cerca per nome, cognome o CF"
                    error={!!fieldErrors.patient}
                    helperText={fieldErrors.patient || ''}
                  />
                )}
              />
              <Box sx={{ mt: 1 }}>
                <FormControlLabel control={<Switch checked={guestMode} onChange={() => { setGuestMode((s) => !s); setSelectedPatient(null); }} />} label="Crea guest" />
              </Box>
            </Grid>

            {guestMode && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Nome"
                    name="nome"
                    value={guestData.nome}
                    onChange={handleGuestChange}
                    error={!!fieldErrors.guest_nome}
                    helperText={fieldErrors.guest_nome || ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Cognome"
                    name="cognome"
                    value={guestData.cognome}
                    onChange={handleGuestChange}
                    error={!!fieldErrors.guest_cognome}
                    helperText={fieldErrors.guest_cognome || ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Codice Fiscale"
                    name="codice_fiscale"
                    value={guestData.codice_fiscale}
                    onChange={handleGuestChange}
                    error={!!fieldErrors.guest_codice_fiscale}
                    helperText={fieldErrors.guest_codice_fiscale || ''}
                    inputProps={{ maxLength: 16 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={guestData.email}
                    onChange={handleGuestChange}
                    error={!!fieldErrors.guest_email}
                    helperText={fieldErrors.guest_email || ''}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Telefono"
                    name="telefono"
                    value={guestData.telefono}
                    onChange={handleGuestChange}
                    error={!!fieldErrors.guest_telefono}
                    helperText={fieldErrors.guest_telefono || ''}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField select required fullWidth label="Specialità Medica" name="specialita_id" value={formData.specialita_id} onChange={handleChange}>
                {specialitaDisponibili.map((s) => <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select required fullWidth label="Medico" name="medico_id" value={formData.medico_id} onChange={handleChange} disabled={!formData.specialita_id}>
                {mediciFiltrati.length > 0 ? mediciFiltrati.map(m => <MenuItem key={m.id} value={m.id}>Dott. {m.nome} {m.cognome}</MenuItem>) : <MenuItem value="" disabled>Nessun medico</MenuItem>}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField required fullWidth type="date" label="Data" name="data_prenotazione" value={formData.data_prenotazione} onChange={handleChange} InputLabelProps={{ shrink: true }} inputProps={{ min: oggi }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField select required fullWidth label="Orario" name="ora_prenotazione" value={formData.ora_prenotazione} onChange={handleChange} disabled={!formData.medico_id || !formData.data_prenotazione || slotsLoading}>
                {slotsLoading ? <MenuItem value="" disabled>Caricamento...</MenuItem> : (slots.length > 0 ? slots.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>) : <MenuItem value="" disabled>Nessun orario</MenuItem>)}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField select required fullWidth label="Prestazione richiesta" name="prestazione_richiesta_id" value={formData.prestazione_richiesta_id} onChange={handleChange} disabled={!formData.specialita_id}>
                {prestazioniDisponibili.length > 0 ? prestazioniDisponibili.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>) : <MenuItem value="" disabled>Nessuna prestazione</MenuItem>}
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate('/segreteria/dashboard')}>Annulla</Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>{loading ? <CircularProgress size={20} /> : 'Conferma Prenotazione'}</Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
