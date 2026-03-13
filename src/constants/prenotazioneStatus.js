// Centralizza gli stati possibili per le prenotazioni
export const PrenotazioneStatus = {
    CONFERMATA: 'confermata',
    COMPLETATA: 'completata',
    ANNULLATA: 'annullata'
};

export const getStatusColor = (stato) => {
    switch (stato) {
        case PrenotazioneStatus.CONFERMATA: return 'success';
        case PrenotazioneStatus.COMPLETATA: return 'default';
        case PrenotazioneStatus.ANNULLATA: return 'error';
        default: return 'primary';
    }
};

export const formatStatusLabel = (stato) => {
    if (!stato && stato !== '') return '';
    const s = String(stato).toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};

export default PrenotazioneStatus;
