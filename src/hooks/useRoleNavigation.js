import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useRoleNavigation = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();

  const getDefaultRoute = () => {
    switch (userType) {
      case 'admin':
        return '/admin';
      case 'company':
        return '/company';
      case 'applicant':
        return '/jobs';
      default:
        return '/';
    }
  };

  const navigateToDefault = () => {
    navigate(getDefaultRoute());
  };

  const navigateByRole = (routes) => {
    const route = routes[userType] || routes.default;
    navigate(route);
  };

  return {
    getDefaultRoute,
    navigateToDefault,
    navigateByRole,
  };
}; 