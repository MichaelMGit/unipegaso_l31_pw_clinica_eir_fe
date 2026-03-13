import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell,
  TableBody, CircularProgress, Box, TablePagination, Alert, Button
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { pazientiService } from '../../api/services';
import { refertiService } from '../../api/services';

export default function PazienteReferti() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [referti, setReferti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0); // 0-based
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [downloading, setDownloading] = useState({});

  const fetchReferti = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      const params = { page: page + 1, page_size: rowsPerPage };
      const res = await pazientiService.getReferti(user.id, params);
      const items = res.data.items || [];
      setReferti(Array.isArray(items) ? items : []);
      setTotalCount(res.data.total);
    } catch (e) {
      console.error('Errore caricamento referti paziente', e);
      setError('Impossibile caricare i referti.');
      setReferti([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [user, page, rowsPerPage]);

  useEffect(() => { fetchReferti(); }, [fetchReferti]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">I miei Referti</Typography>
        <Button variant="outlined" onClick={() => navigate('/paziente/dashboard')}>Torna alla Dashboard</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="tabella referti">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Titolo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Medico</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Azioni</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referti.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Nessun referto disponibile</TableCell>
                    </TableRow>
                  ) : (
                    referti.map((r) => (
                      <TableRow key={r.referto_id ?? r.id ?? r.prenotazione_id} hover>
                        <TableCell>{r.data_visita ? new Date(r.data_visita).toLocaleDateString('it-IT') : '-'}</TableCell>
                        <TableCell>{r.titolo || '-'}</TableCell>
                        <TableCell>{typeof r.medico === 'string' ? r.medico : (r.medico?.nome ? `${r.medico.nome} ${r.medico.cognome || ''}` : '-')}</TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                            <Button size="small" variant="text" onClick={() => navigate(`/paziente/visita/${r.visita_id || ''}`)}>
                              Apri visita
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={async () => {
                                const refId = r.referto_id;
                                if (!refId) return;
                                try {
                                  setDownloading(d => ({ ...d, [refId]: true }));
                                  const res = await refertiService.download(refId);
                                  const blob = res.data || res;
                                  const url = window.URL.createObjectURL(blob);
                                  const ext = r.formato ? String(r.formato).replace(/[^a-z0-9]/gi, '').toLowerCase() : 'pdf';
                                  const filenameSafe = (r.titolo || `referto_${refId}`).replace(/[^a-z0-9_.-]/gi, '_');
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `${filenameSafe}.${ext}`;
                                  document.body.appendChild(a);
                                  a.click();
                                  a.remove();
                                  window.URL.revokeObjectURL(url);
                                } catch (err) {
                                  console.error('Errore download referto', err);
                                  setError('Errore durante il download del referto.');
                                } finally {
                                  setDownloading(d => ({ ...d, [r.referto_id]: false }));
                                }
                              }}
                            >
                              {downloading[r.referto_id] ? <CircularProgress size={14} /> : 'Scarica'}
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10]}
              labelRowsPerPage="Righe per pagina:"
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
