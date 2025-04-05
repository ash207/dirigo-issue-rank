
/**
 * Validates an email address format
 * @param email The email to validate
 * @returns Boolean indicating if the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Comprehensive validation for signup form
 * @returns Error message if validation fails, null if valid
 */
export function validateSignupForm(email: string, password: string, confirmPassword: string): string | null {
  if (!email || !password || !confirmPassword) {
    return "All fields are required";
  }
  
  if (!isValidEmail(email)) {
    return "Please enter a valid email address";
  }
  
  if (password !== confirmPassword) {
    return "Passwords do not match";
  }
  
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  
  return null;
}
