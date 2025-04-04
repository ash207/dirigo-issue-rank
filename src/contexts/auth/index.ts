
export * from './AuthProvider';
export * from './types';
export * from './useAuth';
export * from './useUserRole';

// Re-export useAuthContext as useAuth for backward compatibility
export { useAuthContext as useAuth } from './AuthProvider';
