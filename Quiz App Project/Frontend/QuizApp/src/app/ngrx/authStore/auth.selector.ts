import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "./AuthState";

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectUser = createSelector(selectAuthState,(state)=> state.user);
export const selectToken = createSelector(selectAuthState, (state) => state.token);
export const selectIsAuthenticated = createSelector(selectAuthState,(state) => state.isAuthenticated);
export const selectError = createSelector(selectAuthState, (state) => state.error);
export const selectLoading = createSelector(selectAuthState, (state) => state.loading);

