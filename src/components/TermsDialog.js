import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Typography } from '@mui/material';

export default function TermsDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{ fontWeight: 'bold' }}>Termini e Condizioni di Servizio</DialogTitle>
      <DialogContent dividers>
        <DialogContentText tabIndex={-1} component="div" sx={{ color: 'text.primary' }}>
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>1. Oggetto e Accettazione</Typography>
          <Typography variant="body2" paragraph>
            L'accesso e l'utilizzo del portale "Clinica Eir" (di seguito "Piattaforma") sono subordinati all'accettazione integrale dei presenti Termini e Condizioni. La Piattaforma fornisce servizi digitali di prenotazione visite, consultazione referti e gestione amministrativa.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>2. Natura del Servizio e Limitazione di Responsabilità Medica</Typography>
          <Typography variant="body2" paragraph>
            <strong>ATTENZIONE:</strong> La Piattaforma non è un dispositivo medico né uno strumento di gestione delle emergenze. In caso di grave malore o pericolo di vita, l'Utente è tenuto a contattare immediatamente il Numero Unico per le Emergenze (112). 
            I dati, i referti e le comunicazioni presenti sulla Piattaforma hanno scopo unicamente informativo e tracciabile, e non sostituiscono in alcun caso la valutazione clinica diretta, la diagnosi o il consulto con il proprio medico curante. L'organizzazione declina ogni responsabilità per decisioni mediche prese dall'Utente basandosi esclusivamente sui dati esposti nell'applicativo.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>3. Sicurezza e Credenziali di Accesso</Typography>
          <Typography variant="body2" paragraph>
            L'Utente è l'unico ed esclusivo responsabile della segretezza e della custodia delle proprie credenziali di accesso (email e password). Qualsiasi operazione effettuata all'interno della Piattaforma utilizzando tali credenziali sarà considerata legalmente e operativamente imputabile all'Utente titolare dell'account. L'Utente si impegna a notificare tempestivamente all'Amministrazione qualsiasi uso non autorizzato del proprio account.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>4. Disponibilità del Servizio (SLA)</Typography>
          <Typography variant="body2" paragraph>
            La Piattaforma è fornita "as is" (così com'è). Pur adottando le migliori pratiche architetturali per garantire l'uptime, non si garantisce un accesso continuo e ininterrotto. L'accesso può essere temporaneamente sospeso per manutenzione programmata, aggiornamenti di sicurezza o cause di forza maggiore.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>5. Sospensione e Revoca dell'Account</Typography>
          <Typography variant="body2" paragraph>
            L'Amministrazione si riserva il diritto insindacabile di sospendere o revocare l'accesso alla Piattaforma qualora venga rilevato un utilizzo fraudolento, un tentativo di violazione dei sistemi di sicurezza (es. penetration testing non autorizzato), o la violazione dei presenti Termini.
          </Typography>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>6. Rinvio alla Privacy Policy</Typography>
          <Typography variant="body2" paragraph>
            Per le informazioni relative al trattamento dei dati personali e dei dati particolari (sanitari), si rimanda all'apposita Privacy Policy fornita in fase di registrazione, il cui consenso viene raccolto separatamente in conformità al Regolamento (UE) 2016/679 (GDPR).
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