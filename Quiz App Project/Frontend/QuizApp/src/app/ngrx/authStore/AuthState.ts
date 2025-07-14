export interface AuthState {
    isAuthenticated: boolean;
    user: {} | null;
    token: string | null;
    error: string | null;
    loading: boolean;
}

export const initialAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    error: null,
    loading: false,
};