import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './AuthState';
import * as AuthActions from './auth.action';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state, { email, password }) => ({
    ...state,
    loading: true,
    error: null,
    isAuthenticated: false,
    user: null,
    token: null,
  })),
  on(AuthActions.loginSuccess, (state, { token, user }) => ({
    ...state,
    loading: false,
    isAuthenticated: true,
    user: user,
    token: token,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    isAuthenticated: false,
    user: null,
    token: null,
    error: error,
  })),
  on(AuthActions.logout, () => initialAuthState)
);
