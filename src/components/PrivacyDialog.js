import { 
  Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button, Typography, List, ListItem, ListItemText 
} from '@mui/material';

export default function PrivacyDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Informativa sulla Privacy (Artt. 13 e 14 GDPR)</DialogTitle>
      <DialogContent dividers>
        <DialogContentText tabIndex={-1} component="div" sx={{ color: 'text.primary' }}>
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>1. Titolare del Trattamento e DPO</Typography>
          <Typography variant="body2" paragraph>
            Il Titolare del trattamento è Clinica Eir. Per garantire la massima tutela dei dati sanitari, il Titolare ha nominato un Responsabile della Protezione dei Dati (DPO), contattabile all'indirizzo dpo@clinicaeir.it.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>2. Finalità e Base Giuridica del Trattamento</Typography>
          <Typography variant="body2" paragraph>
            I dati personali comuni e appartenenti a categorie particolari (dati relativi alla salute ex Art. 9 GDPR) sono trattati esclusivamente per:
          </Typography>
          <List dense disablePadding sx={{ mb: 2 }}>
            <ListItem>
              <ListItemText 
                primary="a) Erogazione dei servizi sanitari" 
                secondary="Prenotazione visite, refertazione e gestione della cartella clinica (Base giuridica: Consenso esplicito, Art. 9 par. 2 lett. a GDPR e Finalità di cura, lett. h)." 
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="b) Adempimenti amministrativi e contabili" 
                secondary="Fatturazione e gestione flussi di incasso (Base giuridica: Obbligo di legge, Art. 6 par. 1 lett. c GDPR)." 
              />
            </ListItem>
          </List>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>3. Destinatari dei Dati</Typography>
          <Typography variant="body2" paragraph>
            I dati clinici sono trattati con protocolli di crittografia. Potranno essere resi accessibili esclusivamente a personale medico autorizzato e a responsabili esterni (es. provider del servizio cloud di hosting) contrattualmente vincolati al rispetto del GDPR. In nessun caso i dati sanitari saranno ceduti a terzi per finalità commerciali.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>4. Periodo di Conservazione (Data Retention)</Typography>
          <Typography variant="body2" paragraph>
            I dati sanitari e le cartelle cliniche saranno conservati a tempo indeterminato o comunque per il tempo imposto dalla normativa nazionale vigente in materia di conservazione della documentazione medica. I dati di log e accesso ai sistemi (Audit Trail) sono conservati per 12 mesi per finalità di sicurezza.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>5. Diritti dell'Interessato</Typography>
          <Typography variant="body2" paragraph>
            L'utente ha il diritto di chiedere al Titolare l'accesso ai propri dati, la rettifica, la cancellazione (ove applicabile e non in contrasto con gli obblighi di conservazione medica), la portabilità dei dati in formato strutturato e la revoca del consenso, senza pregiudicare la liceità del trattamento basata sul consenso prestato prima della revoca.
          </Typography>

        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary" disableElevation>
          Ho compreso e chiudi
        </Button>
      </DialogActions>
    </Dialog>
  );
}