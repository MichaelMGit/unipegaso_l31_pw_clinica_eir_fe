import { ListItem, ListItemText } from '@mui/material';
import RefertoDownload from './RefertoDownload';

export default function RefertoItem({ referto, onError }) {
  const dateStr = referto?.data_visita ? new Date(referto.data_visita).toLocaleDateString('it-IT') : '';
  const medico = referto?.medico || '';
  const secondary = `${dateStr}${medico ? ` — ${medico}` : ''}`;

  return (
    <ListItem divider>
      <ListItemText
        primary={<RefertoDownload referto={referto} onError={onError} />}
        secondary={secondary}
      />
    </ListItem>
  );
}
