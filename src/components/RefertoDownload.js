import { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { refertiService } from '../api/services';

// Component that renders a referto title as a clickable element which triggers
// download using `refertiService.download`. Reusable across pages.
export default function RefertoDownload({ referto, onError }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!referto) return;
    const refId = referto.referto_id;
    if (!refId) return;

    try {
      setLoading(true);
      // If guest token/cf are present (guest flow), include them as params so backend can authorize
      const guestToken = localStorage.getItem('guest_token');
      const guestCf = localStorage.getItem('guest_cf');
      const params = {};
      if (guestToken) params.token = guestToken;
      if (guestCf) params.codice_fiscale = guestCf;

      const res = await refertiService.download(refId, Object.keys(params).length ? params : undefined);
      const blob = res.data || res;
      const url = window.URL.createObjectURL(blob);

      // extension: prefer the API-provided `formato` (exact extension), fallback to mime-type
      let ext = '';
      if (referto.formato) {
        ext = String(referto.formato).replace(/[^a-z0-9]/gi, '').toLowerCase();
      } else {
        const t = blob.type || '';
        if (t.includes('pdf')) ext = 'pdf';
        else if (t.startsWith('image/')) ext = t.split('/')[1];
        else ext = 'bin';
      }

      const filenameSafe = (referto.titolo || `referto_${refId}`).replace(/[^a-z0-9_.-]/gi, '_');

      const a = document.createElement('a');
      a.href = url;
      a.download = `${filenameSafe}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore download referto', err);
      if (typeof onError === 'function') onError('Errore durante il download del referto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button variant="text" onClick={handleDownload}>
        {referto.titolo || `Referto ${referto.referto_id}`}
      </Button>
      {loading && <CircularProgress size={14} />}
    </Box>
  );
}
