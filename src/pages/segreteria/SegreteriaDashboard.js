import { useEffect, useState } from 'react';
import { Box, Container, Typography, Grid, Alert } from '@mui/material';

import { useNavigate, useLocation } from 'react-router-dom';
import CalendarAppointments from '../../components/CalendarAppointments';
import PatientSearch from '../../components/PatientSearch';
import { mediciService } from '../../api/services';

export default function SegreteriaDashboard() {
    const navigate = useNavigate();

    

    const [doctorsList, setDoctorsList] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const [selectedPatientId, setSelectedPatientId] = useState('');
    const location = useLocation();
    const [successMessage, setSuccessMessage] = useState('');



    

    useEffect(() => {
        let mounted = true;
        const fetchDoctors = async () => {
            try {
                setDoctorsLoading(true);
                const res = await mediciService.list({ page: 1, page_size: 200 });
                const items = (res.data && (res.data.items ? res.data.items : res.data)) || [];
                if (mounted) setDoctorsList(Array.isArray(items) ? items : []);
            } catch (err) {
                console.error('Errore caricamento medici', err);
                if (mounted) setDoctorsList([]);
            } finally {
                if (mounted) setDoctorsLoading(false);
            }
        };

        fetchDoctors();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        if (location && location.state && location.state.successMessage) {
            setSuccessMessage(location.state.successMessage);
            navigate(location.pathname, { replace: true, state: {} });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    useEffect(() => {
        if (!successMessage) return undefined;
        const t = setTimeout(() => setSuccessMessage(''), 5000);
        return () => clearTimeout(t);
    }, [successMessage]);

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Area Segreteria</Typography>
                <Typography variant="subtitle1" color="textSecondary">Panoramica appuntamenti e ricerca rapida</Typography>
            </Box>

            {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                    <CalendarAppointments
                        medicoId={selectedDoctorId || undefined}
                        title="Calendario e Lista Prenotazioni"
                        sx={{ height: 'calc(100vh - 140px)' }}
                        showDoctorFilter={true}
                        doctorsList={doctorsList}
                        doctorsLoading={doctorsLoading}
                        selectedDoctorId={selectedDoctorId}
                        onSelectedDoctorChange={(id) => setSelectedDoctorId(id)}
                        showPatientFilter={true}
                        selectedPatientId={selectedPatientId}
                        onSelectedPatientChange={(id) => setSelectedPatientId(id)}
                        onCreate={() => navigate('/segreteria/nuova-prenotazione')}
                        eventClickable={false}
                    />
                </Grid>

                <Grid item xs={12} md={3}>
                      <PatientSearch title="Ricerca Pazienti" placeholder="Nome, cognome o CF" minLength={3} onOpen={(p) => navigate(`/segreteria/paziente/${p.id}`)} />
                </Grid>
            </Grid>
        </Container>
    );
}
