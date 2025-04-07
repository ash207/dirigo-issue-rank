
// Helper to check if a string is a valid UUID
export const isValidUUID = (str: string | undefined): boolean => {
  if (!str) return false;
  // Basic UUID format validation (simplified)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Validate vote parameters
export const validateVoteParams = (
  userId: string | undefined,
  issueId: string | undefined,
  isAuthenticated: boolean,
  isActiveUser: boolean
): { isValid: boolean; errorMessage?: string } => {
  if (!isAuthenticated) {
    return { isValid: false, errorMessage: "Please sign in to vote on positions" };
  }

  if (!isActiveUser) {
    return { isValid: false, errorMessage: "Your account needs to be active to vote" };
  }

  if (!userId) {
    return { isValid: false, errorMessage: "Unable to process vote: User ID is missing" };
  }
  
  if (!issueId) {
    return { isValid: false, errorMessage: "Unable to process vote: Issue ID is missing" };
  }

  return { isValid: true };
};
