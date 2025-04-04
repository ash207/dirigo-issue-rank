
// Export types
export * from './types';

// Export the AuthProvider component and hook
export { AuthProvider } from './AuthProvider';

// Export the useAuth hook
export { useAuth } from './useAuth';

// Export the useUserRole hook
export { useUserRole } from './useUserRole';

// Don't re-export useAuthContext as useAuth anymore to prevent circular dependency
// Instead, directly export the useAuthContext 
export { useAuthContext } from './AuthProvider';
