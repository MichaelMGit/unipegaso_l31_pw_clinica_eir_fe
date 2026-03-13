import { useEffect, useState, useCallback } from 'react';
import { Box, Card, CardContent, TextField, InputAdornment, IconButton, CircularProgress, Typography, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { pazientiService } from '../api/services';

export default function PatientSearch({ title = 'Ricerca Pazienti', placeholder = 'Cerca paziente', minLength = 3, onOpen }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async (qParam) => {
    const q = (qParam || '').trim();
    if (!q || q.length < minLength) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await pazientiService.list({ q, page: 1, page_size: 10 });
      const items = res.data.items || [];
      setResults(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Errore ricerca pazienti', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [minLength]);

  useEffect(() => {
    const q = (query || '').trim();
    if (q.length < minLength) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => doSearch(q), 350);
    return () => clearTimeout(t);
  }, [query, doSearch, minLength]);

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Cerca per nome, cognome o CF.</Typography>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') doSearch(query); }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {query ? (
                  <IconButton size="small" onClick={() => { setQuery(''); setResults([]); }}>
                    <ClearIcon />
                  </IconButton>
                ) : null}
                <IconButton size="small" onClick={() => doSearch(query)}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress size={24} /></Box>
        ) : (
          results.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Risultati:</Typography>
              {results.map(r => (
                <Card key={r.id} variant="outlined" sx={{ mt: 1 }}>
                  <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{r.cognome ? `${r.cognome} ${r.nome}` : `${r.nome || '-'} ${r.cognome || ''}`}</Typography>
                      <Typography variant="caption" color="textSecondary">CF: {r.codice_fiscale || '-'}</Typography>
                    </Box>
                    <Button size="small" variant="contained" onClick={() => onOpen && onOpen(r)}>Apri</Button>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            (query || '').trim().length >= minLength ? (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>Nessun paziente trovato</Typography>
            ) : null
          )
        )}
      </CardContent>
    </Card>
  );
}
