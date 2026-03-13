import { useState } from 'react';
import {
    Box, Button, TextField, Typography, Container, Paper, Alert,
    FormControlLabel, Checkbox, Link, FormControl, FormHelperText, Grid
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { authService } from '../api/services';
import TermsDialog from '../components/TermsDialog';
import PrivacyDialog from '../components/PrivacyDialog';
import { useAuth } from '../contexts/AuthContext';

export default function Registrazione() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        password_confirm: '',
        codice_fiscale: '',
        telefono: '',
    });

    const [accettaTermini, setAccettaTermini] = useState(false);
    const [accettaPrivacy, setAccettaPrivacy] = useState(false);
    const [healthDataAccepted, setHealthDataAccepted] = useState(false);
    const [openTermini, setOpenTermini] = useState(false);
    const [openPrivacy, setOpenPrivacy] = useState(false);

    const [accettaTerminiError, setAccettaTerminiError] = useState('');
    const [accettaPrivacyError, setAccettaPrivacyError] = useState('');
    const [healthDataAcceptedError, setHealthDataAcceptedError] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordConfirmError, setPasswordConfirmError] = useState('');
    const [nomeError, setNomeError] = useState('');
    const [cognomeError, setCognomeError] = useState('');
    const [codiceFiscaleError, setCodiceFiscaleError] = useState('');
    const [telefonoError, setTelefonoError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setEmailError('');
        setPasswordError('');
        setPasswordConfirmError('');
        setNomeError('');
        setCognomeError('');
        setCodiceFiscaleError('');
        setTelefonoError('');
        setAccettaTerminiError('');
        setAccettaPrivacyError('');
        setHealthDataAcceptedError('');
        setFormError(false);

        let valid = true;
        const emailValue = formData.email ? formData.email.trim() : '';
        if (!emailValue) {
            setEmailError('Email obbligatoria');
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
            setEmailError('Formato email non valido');
            valid = false;
        }

        if (!formData.password) {
            setPasswordError('Password obbligatoria');
            valid = false;
        } else if (formData.password.length < 8) {
            setPasswordError('La password deve essere lunga almeno 8 caratteri');
            valid = false;
        }

        if (!formData.password_confirm) {
            setPasswordConfirmError('Conferma la password');
            valid = false;
        } else if (formData.password !== formData.password_confirm) {
            setPasswordConfirmError('Le password non coincidono');
            valid = false;
        }

        let anagraficaValid = true;
        if (!formData.nome.trim()) {
            setNomeError('Nome obbligatorio');
            anagraficaValid = false;
        }
        if (!formData.cognome.trim()) {
            setCognomeError('Cognome obbligatorio');
            anagraficaValid = false;
        }
        if (!formData.codice_fiscale.trim()) {
            setCodiceFiscaleError('Codice Fiscale obbligatorio');
            anagraficaValid = false;
        } else if (formData.codice_fiscale.length !== 16) {
            setCodiceFiscaleError('Il Codice Fiscale deve essere esattamente di 16 caratteri.');
            anagraficaValid = false;
        }

        const phoneRaw = formData.telefono ? formData.telefono.trim() : '';
        const phoneAllowed = /^[+\d\s\-().]+$/;
        if (!phoneRaw) {
            setTelefonoError('Numero di telefono obbligatorio');
            anagraficaValid = false;
        } else if (!phoneAllowed.test(phoneRaw)) {
            setTelefonoError('Formato del numero non valido');
            anagraficaValid = false;
        } else {
            const digits = phoneRaw.replace(/\D/g, '');
            if (digits.length < 6 || digits.length > 15) {
                setTelefonoError('Inserisci un numero di telefono valido');
                anagraficaValid = false;
            }
        }

        let gdprValid = true;
        if (!accettaTermini) {
            setAccettaTerminiError('Devi accettare i Termini di Servizio');
            gdprValid = false;
        }
        if (!accettaPrivacy) {
            setAccettaPrivacyError('Devi accettare la Privacy Policy');
            gdprValid = false;
        }
        if (!healthDataAccepted) {
            setHealthDataAcceptedError('Devi acconsentire al trattamento dei dati sanitari');
            gdprValid = false;
        }

        const overallValid = valid && anagraficaValid && gdprValid;
        if (!overallValid) {
            setFormError(true);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nome: formData.nome,
                cognome: formData.cognome,
                email: formData.email,
                password: formData.password,
                codice_fiscale: formData.codice_fiscale,
                telefono: formData.telefono,
                is_guest: false
            };
            await authService.register(payload);

            setSuccess('Registrazione completata con successo! Verrai reindirizzato al login...');

            await login(formData.email, formData.password);

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.detail) {
                setError(err.response.data.detail);
            } else {
                setError('Errore di connessione al server. Riprova più tardi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2, border: formError ? '1px solid #d32f2f' : undefined }}>
                    <Box component="img" src="/images/logo_full.png" alt="Clinica Eir" sx={{ width: 320, height: 'auto', mb: 1, display: 'block', mx: 'auto' }} />
                    <Typography component="h2" variant="subtitle1" align="center" gutterBottom>
                        Registrazione Nuovo Paziente
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="nome"
                                    label="Nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    error={!!nomeError}
                                    helperText={nomeError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="cognome"
                                    label="Cognome"
                                    name="cognome"
                                    value={formData.cognome}
                                    onChange={handleChange}
                                    error={!!cognomeError}
                                    helperText={cognomeError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="codice_fiscale"
                                    label="Codice Fiscale"
                                    name="codice_fiscale"
                                    inputProps={{ maxLength: 16, style: { textTransform: 'uppercase' } }}
                                    value={formData.codice_fiscale}
                                    onChange={(e) => {
                                        e.target.value = e.target.value.toUpperCase();
                                        handleChange(e);
                                    }}
                                    error={!!codiceFiscaleError}
                                    helperText={codiceFiscaleError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="telefono"
                                    label="Numero di telefono"
                                    name="telefono"
                                    inputProps={{ maxLength: 10 }}
                                    inputMode="tel"
                                    autoComplete="tel"
                                    value={formData.telefono}
                                    onChange={(e) => {
                                        const sanitized = e.target.value.replace(/[^+\d\s\-().]/g, '');
                                        e.target.value = sanitized;
                                        handleChange(e);
                                    }}
                                    onPaste={(e) => {
                                        const paste = (e.clipboardData || window.clipboardData).getData('text');
                                        const sanitized = paste.replace(/[^+\d\s\-().]/g, '');
                                        e.preventDefault();
                                        const input = e.target;
                                        const start = input.selectionStart || 0;
                                        const end = input.selectionEnd || 0;
                                        const newValue = input.value.slice(0, start) + sanitized + input.value.slice(end);
                                        const event = { target: { name: input.name, value: newValue } };
                                        handleChange(event);
                                    }}
                                    error={!!telefonoError}
                                    helperText={telefonoError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Indirizzo Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!emailError}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    inputProps={{ maxLength: 64 }}
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password_confirm"
                                    label="Ripeti Password"
                                    type="password"
                                    id="password_confirm"
                                    inputProps={{ maxLength: 64 }}
                                    value={formData.password_confirm}
                                    onChange={handleChange}
                                    error={!!passwordConfirmError}
                                    helperText={passwordConfirmError}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Consensi Obbligatori
                            </Typography>
                            <FormControl component="fieldset" error={!!accettaTerminiError || !!accettaPrivacyError || !!healthDataAcceptedError} sx={{ width: '100%' }}>
                                <FormControlLabel
                                    control={<Checkbox checked={accettaTermini} onChange={(e) => setAccettaTermini(e.target.checked)} color="primary" />}
                                    label={
                                        <Typography variant="body2">
                                            Accetto i <Link component="button" type="button" onClick={() => setOpenTermini(true)} underline="hover">Termini e Condizioni di Servizio</Link>
                                        </Typography>
                                    }
                                />
                                {accettaTerminiError && <FormHelperText error>{accettaTerminiError}</FormHelperText>}

                                <FormControlLabel
                                    control={<Checkbox checked={accettaPrivacy} onChange={(e) => setAccettaPrivacy(e.target.checked)} color="primary" />}
                                    label={
                                        <Typography variant="body2">
                                            Acconsento al trattamento dei dati sanitari secondo la <Link component="button" type="button" onClick={() => setOpenPrivacy(true)} underline="hover">Privacy Policy (Art. 9 GDPR)</Link>
                                        </Typography>
                                    }
                                />
                                {accettaPrivacyError && <FormHelperText error>{accettaPrivacyError}</FormHelperText>}

                                <FormControlLabel
                                    control={<Checkbox checked={healthDataAccepted} onChange={(e) => setHealthDataAccepted(e.target.checked)} color="primary" />}
                                    label={
                                        <Typography variant="body2">
                                            Acconsento esplicitamente al trattamento dei miei dati relativi alla salute per l'erogazione dei servizi
                                        </Typography>
                                    }
                                />
                                {healthDataAcceptedError && <FormHelperText error>{healthDataAcceptedError}</FormHelperText>}
                            </FormControl>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 4, mb: 2, py: 1.5 }}
                            disabled={loading}
                        >
                            {loading ? 'Registrazione in corso...' : 'Registrati'}
                        </Button>

                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link component={RouterLink} to="/login" variant="body2">
                                    Hai già un account? Accedi qui
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Box>

            <TermsDialog open={openTermini} onClose={() => setOpenTermini(false)} />
            <PrivacyDialog open={openPrivacy} onClose={() => setOpenPrivacy(false)} />

        </Container>
    );
}