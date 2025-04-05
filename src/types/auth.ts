
export interface AuthResponse {
  data: { user?: { id?: string; email?: string } } | null;
  error: { 
    code?: string; 
    message?: string;
    status?: number;
  } | null;
}

export interface SignupState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  errorMessage: string | null;
  showTimeoutDialog: boolean;
}
