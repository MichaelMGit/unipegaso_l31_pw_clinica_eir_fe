import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, Card, CardContent, Typography, Chip, Button, CircularProgress, Paper, TablePagination, IconButton
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import PrenotazioneStatus, { getStatusColor, formatStatusLabel } from '../constants/prenotazioneStatus';
import QrCodeIcon from '@mui/icons-material/QrCode';

export default function PrenotazioniTable({
  prenotazioni = [],
  loading = false,
  tabValue = 0,
  mediciMap = {},
  specialitaMap = {},
  onAnnulla, // function(prenId)
  onApri, // function(pren)
  onStampaQr, // function(pren)
  onMarkPaid, // function(prenId)
  showQrButton = false,
  showPaidColumn = false,
  canMarkPaid = false,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange, // (e, newPage)
  onRowsPerPageChange // (e)
}) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const formatTime = (time) => {
    if (!time) return '';
    const parts = String(time).split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
  };

  if (isSmall) {
    return (
      <Stack spacing={2} sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
        ) : prenotazioni.length === 0 ? (
          <Typography variant="body1" color="textSecondary">{tabValue === 0 ? "Non hai nessuna visita futura in programma." : "Nessuno storico disponibile."}</Typography>
        ) : (
          prenotazioni.map(pren => (
                <Card key={pren.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{new Date(pren.data_visita).toLocaleDateString('it-IT')}</Typography>
                  <Typography variant="subtitle2">{formatTime(pren.orario_inizio)}</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">{specialitaMap[pren.specialita?.id] || 'Specialità non trovata'}</Typography>
                <Typography variant="body2" color="textSecondary">{mediciMap[pren.medico?.id] || 'Medico non trovato'}</Typography>
                <Typography variant="body2" color="textSecondary">{pren.prestazione_richiesta_nome || pren.prestazione_richiesta?.nome || '-'}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip label={formatStatusLabel(pren.stato)} color={getStatusColor(pren.stato)} size="small" sx={{ fontWeight: 'bold' }} />
                  <Box>
                    {tabValue === 0 && pren.stato === PrenotazioneStatus.CONFERMATA && onAnnulla && (
                      <Button variant="contained" color="error" size="small" onClick={() => onAnnulla(pren.id)}>Annulla</Button>
                    )}
                    {onApri && (
                      <Button size="small" onClick={() => onApri(pren)} sx={{ ml: 1 }}>Apri</Button>
                    )}
                    {showPaidColumn && pren.stato === PrenotazioneStatus.COMPLETATA && canMarkPaid && onMarkPaid && (
                      !pren.pagato && (
                        <Button size="small" variant="contained" color="primary" onClick={() => onMarkPaid(pren.id)} sx={{ ml: 1 }}>Segna pagata</Button>
                      )
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}

        <Paper elevation={0}>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Righe per pagina:"
          />
        </Paper>
      </Stack>
    );
  }

  return (
    <>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="tabella prenotazioni">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ora</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specialità</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Specialista</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prestazione richiesta</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Stato</TableCell>
                {showPaidColumn && <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pagata</TableCell>}
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : prenotazioni.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography variant="body1" color="textSecondary">
                    {tabValue === 0 ? "Non hai nessuna visita futura in programma." : "Nessuno storico disponibile."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              prenotazioni.map((pren) => (
                <TableRow key={pren.id} hover>
                  <TableCell>{new Date(pren.data_visita).toLocaleDateString('it-IT')}</TableCell>
                  <TableCell>{formatTime(pren.orario_inizio)}</TableCell>
                  <TableCell>{specialitaMap[pren.specialita?.id] || 'Specialità non trovata'}</TableCell>
                  <TableCell>{mediciMap[pren.medico?.id] || 'Medico non trovato'}</TableCell>
                  <TableCell>{pren.prestazione_richiesta?.nome || pren.prestazione_richiesta_nome || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatStatusLabel(pren.stato)}
                      color={getStatusColor(pren.stato)}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  {showPaidColumn && (
                    <TableCell>
                      {/* determine paid flag from common property names */}
                      {(() => {
                        const paid = pren.pagato ?? false;
                        return paid ? (
                          <Chip label="Pagata" color="success" size="small" />
                        ) : (
                          <Chip label="Non pagata" color="default" size="small" />
                        );
                      })()}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    {tabValue === 0 && pren.stato === PrenotazioneStatus.CONFERMATA && onAnnulla && (
                      <Button variant="contained" color="error" size="small" onClick={() => onAnnulla(pren.id)}>Annulla</Button>
                    )}
                    {onApri && (
                      <Button size="small" onClick={() => onApri(pren)} sx={{ ml: 1 }}>Apri</Button>
                    )}
                    {/* allow segreteria to mark as paid when completed */}
                    {showPaidColumn && pren.stato === PrenotazioneStatus.COMPLETATA && canMarkPaid && onMarkPaid && (
                      // only show action if not already paid
                      !pren.pagato && (
                        <Button size="small" variant="contained" color="primary" onClick={() => onMarkPaid(pren.id)} sx={{ ml: 1 }}>Segna pagata</Button>
                      )
                    )}
                    {/* Stampa QR per guest su prenotazioni completate */}
                    {pren.stato === PrenotazioneStatus.COMPLETATA && showQrButton && onStampaQr && (
                      <IconButton size="small" onClick={() => onStampaQr(pren)} sx={{ ml: 1 }} aria-label="Stampa QR">
                        <QrCodeIcon fontSize="small" />
                      </IconButton>
                    )}
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
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Righe per pagina:"
        rowsPerPageOptions={[5, 10, 25]}
      />
    </>
  );
}
