
/**
 * Validates signup form data
 * @returns Error message if validation fails, null if valid
 */
export function validateSignupForm(email: string, password: string, confirmPassword: string): string | null {
  if (!email || !password) {
    return "Please fill in all fields";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }
  
  return null;
}
