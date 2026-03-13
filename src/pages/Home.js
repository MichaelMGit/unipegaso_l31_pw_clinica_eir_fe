import { Typography, Card, CardContent, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Home() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Benvenuto nella Clinica Eir
        </Typography>
        <Typography sx={{ mb: 2 }}>
          Questo è un front-end dimostrativo collegato a un backend FastAPI con OAuth2/JWT.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/login">
          Accedi
        </Button>
      </CardContent>
    </Card>
  );
}
