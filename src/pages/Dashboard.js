import { useEffect, useState } from 'react';
import { Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { prenotazioniService } from '../api/services';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    setLoading(true);
    prenotazioniService
      .list()
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Dashboard
        </Typography>
        <Typography sx={{ mb: 2 }}>Benvenuto, {user?.nome || 'utente'}.</Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>
        )}
      </CardContent>
    </Card>
  );
}
