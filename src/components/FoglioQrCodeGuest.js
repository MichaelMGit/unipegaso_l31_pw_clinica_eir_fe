import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Box, Typography, Paper } from '@mui/material';

export default function FoglioQrCodeGuest({ pazienteNome, tokenAccesso, compact = false }) {
  // Riferimento al div che vogliamo stampare
  const printRef = useRef();

  // Costruiamo l'URL completo che il paziente aprirà col telefono
  const baseUrl = window.location.origin;
  const linkReferto = `${baseUrl}/accesso-guest?token=${tokenAccesso}`;

  // Nel modal vogliamo dimensioni più compatte
  const paperSx = compact
    ? { p: 2, width: '100%', maxWidth: 720, minHeight: 'auto', border: '1px solid #ccc' }
    : { p: 4, width: '210mm', minHeight: '297mm', border: '1px solid #ccc' };

  const qrSize = compact ? 160 : 256;

  const handleStampa = () => {
    // Stampa tramite iframe nascosto: non apre una nuova scheda e non riscrive il body
    try {
      const printContents = printRef.current ? printRef.current.outerHTML : '';

      // Creiamo un iframe nascosto
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      iframe.id = 'print-iframe';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      // Include Roboto via Google Fonts for better visual parity and a minimal stylesheet
      doc.write(`<!doctype html><html><head><title>Foglio QR</title><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
          @media print { body { -webkit-print-color-adjust: exact; } }
          body{font-family: Roboto, Helvetica, Arial, sans-serif; padding:20px; color:#000;}
          .paper{box-sizing:border-box}
        </style>
        </head><body class="paper">`);
      doc.write(printContents);
      doc.write('</body></html>');
      doc.close();

      const tryPrint = () => {
        try {
          // focus e print dalla finestra dell'iframe apriranno il dialog di stampa classico
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (e) {
          console.error('Errore durante la stampa', e);
        } finally {
          // Rimuoviamo l'iframe dopo un ritardo per dare tempo all'utente di completare l'azione
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch (e) { /* noop */ }
          }, 1000);
        }
      };

      // Alcuni browser non scatenano onload per documenti scritti dinamicamente, quindi usiamo readyState
      if (iframe.contentWindow.document.readyState === 'complete') {
        setTimeout(tryPrint, 200);
      } else {
        iframe.onload = () => setTimeout(tryPrint, 200);
        // Fallback: se onload non viene chiamato, prova comunque dopo 500ms
        setTimeout(tryPrint, 500);
      }
    } catch (err) {
      console.error('Errore durante la stampa', err);
      window.alert('Errore durante la preparazione della stampa. Controlla la console per dettagli.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={handleStampa}>
          Stampa Foglio Ritiro per il Paziente
        </Button>
      </Box>

      {/* Il foglio stampabile/adattato */}
      <Box sx={{ mt: 1 }}>
        <Paper ref={printRef} elevation={0} sx={paperSx} className="foglio-qr">
          <Typography variant={compact ? 'h5' : 'h4'} align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            POLIAMBULATORIO MEDICO
          </Typography>

          <Typography variant={compact ? 'subtitle1' : 'h6'} align="center" gutterBottom>
            Istruzioni per il ritiro referti online
          </Typography>

          <Box sx={{ my: compact ? 3 : 6 }}>
            <Typography variant="body1" gutterBottom>
              Gentile <strong>{pazienteNome}</strong>,
            </Typography>
            <Typography variant="body1" gutterBottom>
              Non appena il medico avrà completato e firmato la sua relazione clinica,
              potrà scaricare il referto comodamente da casa, inquadrando il codice QR sottostante
              con la fotocamera del suo smartphone.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', my: compact ? 3 : 6 }}>
            <QRCodeSVG
              value={linkReferto}
              size={qrSize}
              level={"H"}
              includeMargin={true}
            />
          </Box>

          <Box sx={{ my: compact ? 3 : 6, p: 2, border: '2px dashed #000' }}>
            <Typography variant="body1" align="center" sx={{ fontWeight: 'bold' }}>
              Per motivi di sicurezza e rispetto della privacy (GDPR), la pagina le chiederà di inserire il suo CODICE FISCALE per sbloccare il documento.
            </Typography>
          </Box>

          <Typography variant="body2" align="center" color="textSecondary" sx={{ mt: compact ? 4 : 10 }}>
            Se non dispone di uno smartphone, può visitare la pagina:
            <br />{linkReferto}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}