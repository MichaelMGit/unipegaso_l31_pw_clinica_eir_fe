import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import UserRoles from './constants/userRoles';

import Login from './pages/Login';
import Registrazione from './pages/Registrazione';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import PazienteDashboard from './pages/paziente/PazienteDashboard';
import NuovaPrenotazione from './pages/paziente/NuovaPrenotazione';
import StoricoPrenotazioni from './pages/paziente/StoricoPrenotazioni';
import PazienteReferti from './pages/paziente/PazienteReferti';
import PazienteProfilo from './pages/paziente/PazienteProfilo';
import MedicoDashboard from './pages/medico/MedicoDashboard';
import MedicoVisita from './pages/medico/MedicoVisita';
import MedicoPaziente from './pages/medico/Paziente';
import PazienteVisita from './pages/paziente/PazienteVisita';

import SegreteriaDashboard from './pages/segreteria/SegreteriaDashboard';
import NuovaPrenotazioneSegreteria from './pages/segreteria/NuovaPrenotazione';
import SegreteriaPaziente from './pages/segreteria/Paziente';
import AmministratoreDashboard from './pages/amministratore/AmministratoreDashboard';
import VisitaGuest from './pages/VisitaGuest';
import AccessoGuest from './pages/AccessoGuest';



function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        {/* Rotte Pubbliche Protette (Solo per ospiti) */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/registrazione" 
          element={
            <PublicRoute>
              <Registrazione />
            </PublicRoute>
          } 
        />
        
        {/* Rotte Protette - Paziente */}
        <Route 
          path="/paziente/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRoles.PAZIENTE]}>
              <PazienteDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/paziente/nuova-prenotazione" 
          element={<ProtectedRoute allowedRoles={[UserRoles.PAZIENTE]}><NuovaPrenotazione /></ProtectedRoute>} 
        />
        <Route 
          path="/paziente/storico-prenotazioni" 
          element={<ProtectedRoute allowedRoles={[UserRoles.PAZIENTE]}><StoricoPrenotazioni /></ProtectedRoute>} 
        />
        <Route 
          path="/paziente/referti" 
          element={<ProtectedRoute allowedRoles={[UserRoles.PAZIENTE]}><PazienteReferti /></ProtectedRoute>} 
        />

        <Route
          path="/paziente/profilo"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.PAZIENTE]}>
              <PazienteProfilo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/paziente/visita/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.PAZIENTE]}>
              <PazienteVisita />
            </ProtectedRoute>
          }
        />

        {/* Rotte Protette - Medico */}
        <Route 
          path="/medico/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRoles.MEDICO]}>
              <MedicoDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/medico/visita/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.MEDICO]}>
              <MedicoVisita />
            </ProtectedRoute>
          }
        />

          <Route
            path="/medico/paziente/:id"
            element={
              <ProtectedRoute allowedRoles={[UserRoles.MEDICO]}>
                <MedicoPaziente />
              </ProtectedRoute>
            }
          />

        {/* Rotte Protette - Segreteria */}
        <Route 
          path="/segreteria/dashboard" 
          element={
            <ProtectedRoute allowedRoles={[UserRoles.SEGRETERIA]}>
              <SegreteriaDashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/segreteria/nuova-prenotazione"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.SEGRETERIA]}>
              <NuovaPrenotazioneSegreteria />
            </ProtectedRoute>
          }
        />
        <Route
          path="/segreteria/paziente/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.SEGRETERIA]}>
              <SegreteriaPaziente />
            </ProtectedRoute>
          }
        />

        {/* Rotta Protetta - Amministratore */}
        <Route
          path="/amministratore/dashboard"
          element={
            <ProtectedRoute allowedRoles={[UserRoles.ADMIN]}>
              <AmministratoreDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback per rotte inesistenti */}
        {/* Pagina pubblica per accesso tramite token guest (link QR) */}
        <Route
          path="/accesso-guest"
          element={
            <PublicRoute>
              <AccessoGuest />
            </PublicRoute>
          }
        />
        <Route
          path="/visita-guest/:id"
          element={
            <PublicRoute>
              <VisitaGuest />
            </PublicRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;