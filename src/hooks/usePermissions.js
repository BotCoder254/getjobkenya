import { useAuth } from '../contexts/AuthContext';
import { checkPermission } from '../constants/roles';

export const usePermissions = () => {
  const { userType } = useAuth();

  const hasPermission = (permission) => {
    return checkPermission(userType, permission);
  };

  return {
    hasPermission,
    isAdmin: userType === 'admin',
    isCompany: userType === 'company',
    isApplicant: userType === 'applicant',
  };
}; 