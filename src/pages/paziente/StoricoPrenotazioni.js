import { useState, useEffect, useCallback } from 'react';
import {
    Container, Paper, Typography, Box, Button, Alert,
    Tabs, Tab
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { prenotazioniService, mediciService, specialitaService } from '../../api/services';
import { confirm, success, error as swalError } from '../../components/SwalHelper';
import PrenotazioneStatus from '../../constants/prenotazioneStatus';
import PrenotazioniTable from '../../components/PrenotazioniTable';

export default function StoricoPrenotazioni() {
    const navigate = useNavigate();
    // component handles responsive rendering internally

    const [prenotazioni, setPrenotazioni] = useState([]);
    const [mediciMap, setMediciMap] = useState({});
    const [specialitaMap, setSpecialitaMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 0 = Future, 1 = Passate
    const [tabValue, setTabValue] = useState(0);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);

            // Decidiamo quale filtro inviare a FastAPI in base alla Tab selezionata
            const periodo = tabValue === 0 ? 'future' : 'passate';

                // Build params using new API: data_da / data_a
                const params = { page: page + 1, page_size: rowsPerPage };
                const today = new Date().toISOString().slice(0,10);
                if (periodo === 'future') params.data_da = today;
                else params.data_a = today;

                const [prenotazioniRes, mediciRes, specialitaRes] = await Promise.all([
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

            // Normalize items to support new API shape { total, items: [...] }
            const rawItems = prenotazioniRes.data.items || [];
            setPrenotazioni(rawItems);
            setTotalCount(prenotazioniRes.data.total || 0);

        } catch (err) {
            console.error(err);
            setError('Impossibile caricare lo storico delle prenotazioni.');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, tabValue]); // Riesegue anche quando cambia tabValue

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Gestione del cambio Tab
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0); // Rimettiamo la pagina a 0 ogni volta che cambiamo scheda
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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
            await fetchData();
            await success('La prenotazione è stata annullata con successo.', 'Annullata');
        } catch (err) {
            await swalError("Errore durante l'annullamento della prenotazione.");
        }
    };


    return (
        <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    Le mie Prenotazioni
                </Typography>
                <Button variant="outlined" onClick={() => navigate('/paziente/dashboard')}>
                    Torna alla Dashboard
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper elevation={3}>
                {/* --- LE TABS (SCHEDE) --- */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs prenotazioni">
                        <Tab label="Visite Future" sx={{ fontWeight: 'bold' }} />
                        <Tab label="Visite Passate" sx={{ fontWeight: 'bold' }} />
                    </Tabs>
                </Box>

                <PrenotazioniTable
                    prenotazioni={prenotazioni}
                    loading={loading}
                    tabValue={tabValue}
                    mediciMap={mediciMap}
                    specialitaMap={specialitaMap}
                    onAnnulla={handleAnnulla}
                    onApri={(pren) => navigate(`/paziente/visita/${pren.visita_id}`)}
                    page={page}
                    showPaidColumn={true}
                    rowsPerPage={rowsPerPage}
                    totalCount={totalCount}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {/* pagination rendered inside PrenotazioniTable */}
            </Paper>
        </Container>
    );
}