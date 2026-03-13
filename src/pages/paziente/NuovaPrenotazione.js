import { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Box, TextField, MenuItem, Button, Grid, Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { prenotazioniService, specialitaService, mediciService } from '../../api/services';

export default function NuovaPrenotazione() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    specialita_id: '',
    medico_id: '',
    data_prenotazione: '',
    ora_prenotazione: '',
    prestazione_richiesta_id: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    specialita_id: '',
    medico_id: '',
    data_prenotazione: '',
    ora_prenotazione: '',
    prestazione_richiesta_id: ''
  });

  const [specialitaDisponibili, setSpecialitaDisponibili] = useState([]);
  const [mediciFiltrati, setMediciFiltrati] = useState([]);
  const [prestazioniDisponibili, setPrestazioniDisponibili] = useState([]);
  const [prestazioniLoading, setPrestazioniLoading] = useState(false);

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);


  useEffect(() => {
    const fetchSpecialita = async () => {
      try {
        const response = await specialitaService.list();
        setSpecialitaDisponibili(response.data);
      } catch (err) {
        console.error("Errore nel caricamento delle specialità", err);
        setError("Impossibile caricare le specialità mediche.");
      }
    };
    fetchSpecialita();
  }, []);

  useEffect(() => {
    const fetchMedici = async () => {
      if (!formData.specialita_id) {
        setMediciFiltrati([]);
        return;
      }
      try {
        const response = await mediciService.list({ specialita_id: formData.specialita_id });
        setMediciFiltrati(response.data);
      } catch (err) {
        console.error("Errore nel caricamento dei medici", err);
        setError("Impossibile caricare i medici per questa specialità.");
      }
    };
    fetchMedici();
  }, [formData.specialita_id]);

  useEffect(() => {
    const fetchPrestazioni = async () => {
      if (!formData.specialita_id) {
        setPrestazioniDisponibili([]);
        setFormData((f) => ({ ...f, prestazione_richiesta_id: '' }));
        return;
      }
      setPrestazioniLoading(true);
      try {
        const resp = await specialitaService.prestazioni(formData.specialita_id);
        setPrestazioniDisponibili(Array.isArray(resp.data) ? resp.data : []);
      } catch (err) {
        console.error('Errore nel caricamento delle prestazioni', err);
        setError('Impossibile caricare le prestazioni per questa specialità.');
        setPrestazioniDisponibili([]);
      } finally {
        setPrestazioniLoading(false);
      }
    };

    fetchPrestazioni();
  }, [formData.specialita_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'specialita_id') {
      setFormData({ ...formData, specialita_id: value, medico_id: '', prestazione_richiesta_id: '' });
      setFieldErrors({ ...fieldErrors, specialita_id: '', medico_id: '', prestazione_richiesta_id: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      if (fieldErrors[name]) {
        setFieldErrors({ ...fieldErrors, [name]: '' });
      }
    }
  };

  const medicoIdForSlots = formData.medico_id;
  const dataForSlots = formData.data_prenotazione;
  useEffect(() => {
    setFormData((prev) => ({ ...prev, ora_prenotazione: '' }));
    setSlots([]);

    if (!medicoIdForSlots || !dataForSlots) return;

    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const resp = await mediciService.getSlots(medicoIdForSlots, dataForSlots);
        setSlots(Array.isArray(resp.data) ? resp.data : []);
        setFieldErrors((fe) => ({ ...fe, ora_prenotazione: '' }));
      } catch (err) {
        console.error('Errore nel caricamento degli slot', err);
        setError('Impossibile caricare gli orari disponibili per la data selezionata.');
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [medicoIdForSlots, dataForSlots]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const newFieldErrors = {};
    if (!formData.specialita_id) newFieldErrors.specialita_id = 'Seleziona la specialità';
    if (!formData.medico_id) newFieldErrors.medico_id = 'Seleziona un medico';
    if (!formData.data_prenotazione) newFieldErrors.data_prenotazione = 'Inserisci la data della visita';
    if (!formData.ora_prenotazione) newFieldErrors.ora_prenotazione = 'Seleziona un orario';
    if (!formData.prestazione_richiesta_id) newFieldErrors.prestazione_richiesta_id = 'Seleziona la prestazione richiesta';

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors({ ...fieldErrors, ...newFieldErrors });
      setError('Per favore, compila tutti i campi obbligatori.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        medico_id: formData.medico_id,
        specialita_id: formData.specialita_id,
        data_visita: formData.data_prenotazione,
        orario_inizio: formData.ora_prenotazione,
        prestazione_richiesta_id: formData.prestazione_richiesta_id,
      };

      await prenotazioniService.create(payload);
      navigate('/paziente/dashboard', { state: { successMessage: 'Prenotazione creata con successo.' } });
      
    } catch (err) {
      setError('Errore durante la prenotazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const oggi = new Date().toISOString().split('T')[0];

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
          Prenota una nuova visita
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Seleziona la specialità, scegli un medico e indica la data e l'orario che preferisci.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Specialità Medica"
                name="specialita_id"
                value={formData.specialita_id}
                onChange={handleChange}
                error={!!fieldErrors.specialita_id}
                helperText={fieldErrors.specialita_id || ''}
              >
                {specialitaDisponibili.map((spec) => (
                  <MenuItem key={spec.id} value={spec.id}>
                    {spec.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Medico Specialista"
                name="medico_id"
                value={formData.medico_id}
                onChange={handleChange}
                disabled={!formData.specialita_id}
                error={!!fieldErrors.medico_id}
                helperText={fieldErrors.medico_id || ''}
              >
                {mediciFiltrati.length > 0 ? (
                  mediciFiltrati.map((medico) => (
                    <MenuItem key={medico.id} value={medico.id}>
                      Dott. {medico.nome} {medico.cognome}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>Nessun medico disponibile</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Data della visita"
                name="data_prenotazione"
                value={formData.data_prenotazione}
                onChange={handleChange}
                error={!!fieldErrors.data_prenotazione}
                helperText={fieldErrors.data_prenotazione || ''}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: oggi }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Orario"
                name="ora_prenotazione"
                value={formData.ora_prenotazione}
                onChange={handleChange}
                error={!!fieldErrors.ora_prenotazione}
                helperText={
                  fieldErrors.ora_prenotazione ||
                  (!slotsLoading && formData.medico_id && formData.data_prenotazione && slots.length === 0
                    ? 'Nessun orario disponibile per la data selezionata'
                    : '')
                }
                disabled={!formData.medico_id || !formData.data_prenotazione || slotsLoading}
              >
                {slotsLoading ? (
                  <MenuItem value="" disabled>Caricamento orari...</MenuItem>
                ) : formData.medico_id && formData.data_prenotazione ? (
                  slots.length > 0 ? (
                    slots.map((ora) => (
                      <MenuItem key={ora} value={ora}>
                        {ora}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled>Nessun orario disponibile</MenuItem>
                  )
                ) : (
                  <MenuItem value="" disabled>Seleziona medico e data</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                label="Prestazione richiesta"
                name="prestazione_richiesta_id"
                value={formData.prestazione_richiesta_id}
                onChange={handleChange}
                disabled={!formData.specialita_id || prestazioniLoading}
                error={!!fieldErrors.prestazione_richiesta_id}
                helperText={
                  fieldErrors.prestazione_richiesta_id || (
                    prestazioniLoading
                      ? 'Caricamento prestazioni...'
                      : !formData.specialita_id
                      ? 'Seleziona prima la specialità'
                      : prestazioniDisponibili.length === 0
                      ? 'Nessuna prestazione disponibile per questa specialità'
                      : ''
                  )
                }
              >
                {prestazioniLoading ? (
                  <MenuItem value="" disabled>Caricamento...</MenuItem>
                ) : !formData.specialita_id ? (
                  <MenuItem value="" disabled>Seleziona una specialità</MenuItem>
                ) : prestazioniDisponibili.length > 0 ? (
                  prestazioniDisponibili.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled>Nessuna prestazione</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button variant="outlined" color="inherit" onClick={() => navigate('/paziente/dashboard')}>
                Annulla e Torna indietro
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                Conferma Prenotazione
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}