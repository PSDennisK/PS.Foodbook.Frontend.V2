export interface JWTPayload {
  sub: string;
  iat: number;
  exp: number;
  [key: string]: unknown;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

export interface TokenValidation {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
}
