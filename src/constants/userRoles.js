// Centralizza i ruoli utente e helper per le rotte di default
export const UserRoles = {
  MEDICO: 'medico',
  PAZIENTE: 'paziente',
  SEGRETERIA: 'segreteria',
  ADMIN: 'amministratore',
  GUEST: 'guest'
};

export const getDashboardRoute = (ruolo) => {
  switch ((ruolo || '').toLowerCase()) {
    case UserRoles.MEDICO: return '/medico/dashboard';
    case UserRoles.SEGRETERIA: return '/segreteria/dashboard';
    case UserRoles.ADMIN: return '/amministratore/dashboard';
    case UserRoles.PAZIENTE: return '/paziente/dashboard';
    default: return '/login';
  }
};

export default UserRoles;
