import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, CircularProgress, Button,
  TablePagination, Tabs, Tab, List
} from '@mui/material';
import PrenotazioniTable from '../../components/PrenotazioniTable';
import { pazientiService, prenotazioniService, specialitaService } from '../../api/services';
import RefertoItem from '../../components/RefertoItem';
import { useAuth } from '../../contexts/AuthContext';
// prenotazioneStatus helpers used inside PrenotazioniTable

export default function Paziente() {
  const { id: pazienteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [paziente, setPaziente] = useState(null);
  const [referti, setReferti] = useState([]);
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReferti, setLoadingReferti] = useState(true);
  const [loadingPren, setLoadingPren] = useState(true);
  const [specialitaMap, setSpecialitaMap] = useState({});
  // pagination for referti
  const [refertiPage, setRefertiPage] = useState(0);
  const [refertiRowsPerPage, setRefertiRowsPerPage] = useState(3);
  const [refertiTotalCount, setRefertiTotalCount] = useState(0);
  // pagination + tabs for prenotazioni
  const [tabValue, setTabValue] = useState(0); // 0 = future, 1 = past
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const specRes = await specialitaService.list();
        const s = {};
        (specRes.data || []).forEach(sp => s[sp.id] = sp.nome);
        setSpecialitaMap(s);
      } catch (err) {
        console.error('Errore caricamento metadati', err);
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // patient details
        const pRes = await pazientiService.get(pazienteId);
        setPaziente(pRes.data || pRes);
      } catch (err) {
        console.error('Errore caricamento paziente', err);
      } finally {
        setLoading(false);
      }
    };
    if (pazienteId) fetchAll();
  }, [pazienteId]);

  useEffect(() => {
    const fetchReferti = async () => {
      setLoadingReferti(true);
      try {
        const params = { page: refertiPage + 1, page_size: refertiRowsPerPage };
        const r = await pazientiService.getReferti(pazienteId, params);
        const items = r.data.items || [];
        setReferti(items || []);
        setRefertiTotalCount(r.data.total);
      } catch (err) {
        console.error('Errore caricamento referti', err);
        setReferti([]);
        setRefertiTotalCount(0);
      } finally {
        setLoadingReferti(false);
      }
    };
    if (pazienteId) fetchReferti();
  }, [pazienteId, refertiPage, refertiRowsPerPage]);

  useEffect(() => {
    const fetchPrenotazioni = async () => {
      setLoadingPren(true);
      try {
        const params = { paziente_id: pazienteId, page: page + 1, page_size: rowsPerPage };
        if (user && user.id) params.medico_id = user.id;
        const today = new Date().toISOString().slice(0,10);
        if (tabValue === 0) params.data_da = today; else params.data_a = today;
        const r = await prenotazioniService.list(params);
        const items = r.data.items || [];
        setPrenotazioni(items || []);
        setTotalCount(r.data.total);
      } catch (err) {
        console.error('Errore caricamento prenotazioni', err);
        setPrenotazioni([]);
        setTotalCount(0);
      } finally {
        setLoadingPren(false);
      }
    };
    if (pazienteId) fetchPrenotazioni();
  }, [pazienteId, user, tabValue, page, rowsPerPage]);

  // handlers for pagination and tabs
  const handleRefertiPageChange = (event, newPage) => {
    setRefertiPage(newPage);
  };
  const handleRefertiRowsPerPageChange = (event) => {
    setRefertiRowsPerPage(parseInt(event.target.value, 10));
    setRefertiPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };
  const handlePrenPageChange = (event, newPage) => {
    setPage(newPage);
  };
  const handlePrenRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // time formatting handled by PrenotazioniTable

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Dettaglio Paziente</Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Torna indietro</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ p: 2, mb: 3 }} elevation={2}>
          <Typography variant="h6">{paziente?.nome} {paziente?.cognome}</Typography>
          <Typography variant="body2" color="textSecondary">Codice fiscale: {paziente?.codice_fiscale || '-'}</Typography>
          <Typography variant="body2" color="textSecondary">Email: {paziente?.email || '-'}</Typography>
        </Paper>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Referti</Typography>
          {loadingReferti ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : referti.length === 0 ? (
            <Typography variant="body2" color="textSecondary">Nessun referto disponibile per questo paziente.</Typography>
          ) : (
            <Box>
              <List>
                {referti.map((r, idx) => (
                  <RefertoItem key={`${r.referto_id}-${idx}`} referto={r} onError={() => {}} />
                ))}
              </List>
              <TablePagination
                component="div"
                count={refertiTotalCount}
                page={refertiPage}
                onPageChange={handleRefertiPageChange}
                rowsPerPage={refertiRowsPerPage}
                onRowsPerPageChange={handleRefertiRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Righe per pagina:"
              />
            </Box>
          )}
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Storico Prenotazioni</Typography>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs prenotazioni">
              <Tab label="Visite Future" />
              <Tab label="Visite Passate" />
            </Tabs>
          </Box>
          {loadingPren ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : prenotazioni.length === 0 ? (
            <Typography variant="body2" color="textSecondary">Nessuna prenotazione trovata per questo paziente con il medico corrente.</Typography>
          ) : (
            <PrenotazioniTable
              prenotazioni={prenotazioni}
              loading={loadingPren}
              tabValue={tabValue}
              specialitaMap={specialitaMap}
              onApri={(pren) => navigate(`/medico/visita/${pren.visita_id}`)}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={handlePrenPageChange}
              onRowsPerPageChange={handlePrenRowsPerPageChange}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}
