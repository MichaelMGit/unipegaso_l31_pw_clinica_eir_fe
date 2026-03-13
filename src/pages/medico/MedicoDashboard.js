import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Button, CircularProgress, Alert, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { prenotazioniService } from '../../api/services';
import CalendarAppointments from '../../components/CalendarAppointments';
import PatientSearch from '../../components/PatientSearch';
import { useAuth } from '../../contexts/AuthContext';
import PrenotazioneStatus, { getStatusColor, formatStatusLabel } from '../../constants/prenotazioneStatus';

export default function MedicoDashboard() {
    const navigate = useNavigate();

    const [medico, setMedico] = useState(null);
    const { user } = useAuth();

    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatTime = (time) => {
        if (!time) return '';
        if (typeof time !== 'string') return String(time);
        const parts = time.split(':');
        return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
    };

    useEffect(() => {
        let mounted = true;
        const fetch = async () => {
            try {
                setLoading(true);
                const m = user;
                if (!m) {
                    // se non abbiamo user (improbabile su rotte protette), mostriamo errore
                    if (mounted) setError('Utente non autenticato.');
                    return;
                }
                setMedico(m);

                // Carichiamo le prossime 3 prenotazioni per questo medico usando il servizio `prenotazioni`
                const today = new Date().toISOString().slice(0,10);
                const prenRes = await prenotazioniService.list({ medico_id: m.id, data_da: today, stato: PrenotazioneStatus.CONFERMATA, page: 1, page_size: 3 });

                if (!mounted) return;
                        // Supporto nuova struttura: l'API ora ritorna oggetti annidati in `items`
                        const items = prenRes.data.items || [];
                        setUpcoming(items || []);
            } catch (err) {
                console.error(err);
                if (mounted) setError('Impossibile caricare i dati del medico.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetch();
        return () => { mounted = false; };
    }, [user]);

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Area Medico</Typography>
                <Typography variant="subtitle1" color="textSecondary">Benvenuto{medico ? `, Dott. ${medico.nome} ${medico.cognome}` : ''}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Prossime Visite</Typography>
                    {upcoming.length === 0 ? (
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="body2" color="textSecondary">Nessuna visita programmata.</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Grid container spacing={2}>
                            {upcoming.map(p => (
                                <Grid key={p.id} item xs={12} sm={6} md={4}>
                                    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #1976d2' }}>
                                        <CardContent sx={{ flexGrow: 1 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                        {new Date(p.data_visita).toLocaleDateString('it-IT')} alle ore {formatTime(p.orario_inizio)}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                        Paziente: {(p.paziente?.nome || p.paziente?.cognome)
                                                            ? `${p.paziente?.nome || ''} ${p.paziente?.cognome || ''}`.trim()
                                                            : (p.paziente?.id ? `#${p.paziente.id}` : '-')}
                                                    </Typography>
                                                </Box>
                                                <Chip
                                                    label={formatStatusLabel(p.stato)}
                                                    color={getStatusColor(p.stato)}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </Box>

                                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, mt: 1 }}>
                                                <strong>Prestazione richiesta:</strong> {p.prestazione_richiesta?.nome || 'Nessuna nota specifica inserita.'}
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => navigate(`/medico/visita/${p.visita_id}`)}
                                            >
                                                Apri Visita
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Grid>

                <Grid item xs={12} md={4}>
                    <PatientSearch title="Ricerca Paziente" placeholder="Inserisci nome, cognome o codice fiscale" minLength={3} onOpen={(p) => navigate(`/medico/paziente/${p.id}`)} />
                </Grid>

                <Grid item xs={12} md={8}>
                    <CalendarAppointments medicoId={user?.id} />
                </Grid>
            </Grid>
        </Container>
    );
}

