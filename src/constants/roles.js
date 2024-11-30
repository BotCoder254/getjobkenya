export const ROLES = {
  ADMIN: 'admin',
  COMPANY: 'company',
  APPLICANT: 'applicant',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    canManageUsers: true,
    canManageJobs: true,
    canManageApplications: true,
    canAccessAdminPanel: true,
  },
  [ROLES.COMPANY]: {
    canPostJobs: true,
    canManageCompanyProfile: true,
    canViewApplications: true,
  },
  [ROLES.APPLICANT]: {
    canApplyToJobs: true,
    canSaveJobs: true,
    canManageProfile: true,
  },
};

export const checkPermission = (userRole, permission) => {
  return PERMISSIONS[userRole]?.[permission] || false;
}; 