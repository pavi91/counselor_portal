// src/hooks/usePermissions.js
import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS } from '../utils/mockDB';

export const usePermissions = () => {
  const { user } = useAuth();
  
  if (!user || !user.role) return {};

  // Return the permissions object for the current user's role
  // defaults to empty object if role not defined
  return ROLE_PERMISSIONS[user.role] || {};
};