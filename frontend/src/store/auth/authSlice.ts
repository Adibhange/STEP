import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface UserProfile {
  id: number | null;
  name: string;
  email: string;
  role: string;
  employeeCode: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const loadStorageAuthState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,
    };
  }

  try {
    const token = localStorage.getItem('step_token');
    const refreshToken = localStorage.getItem('step_refresh_token');
    const email = localStorage.getItem('step_email') || '';
    const role = localStorage.getItem('step_role') || '';
    const name = localStorage.getItem('step_name') || '';
    const employeeCode = localStorage.getItem('step_emp_code') || '';
    const userIdStr = localStorage.getItem('step_user_id');
    const userId = userIdStr ? Number(userIdStr) : null;
    const hasToken = Boolean(token && token.trim().length > 0);

    return {
      token: hasToken ? token : null,
      refreshToken: hasToken ? refreshToken : null,
      user: hasToken
        ? {
            id: userId,
            name: name || 'Enterprise User',
            email,
            role: role || 'Evaluator',
            employeeCode,
          }
        : null,
      isAuthenticated: hasToken,
      isInitialized: true,
    };
  } catch {
    return {
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    };
  }
};

const initialState: AuthState = loadStorageAuthState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken?: string;
        user: {
          id?: number | null;
          name?: string;
          email?: string;
          role?: string;
          employeeCode?: string;
        };
      }>
    ) => {
      const { token, refreshToken, user } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken || null;
      state.user = {
        id: user.id ?? null,
        name: user.name || 'Enterprise User',
        email: user.email || '',
        role: user.role || 'Evaluator',
        employeeCode: user.employeeCode || '',
      };
      state.isAuthenticated = true;
      state.isInitialized = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('step_token', token);
        if (refreshToken) localStorage.setItem('step_refresh_token', refreshToken);
        if (user.email) localStorage.setItem('step_email', user.email);
        if (user.role) localStorage.setItem('step_role', user.role);
        if (user.name) localStorage.setItem('step_name', user.name);
        if (user.employeeCode) localStorage.setItem('step_emp_code', user.employeeCode);
        if (user.id) localStorage.setItem('step_user_id', String(user.id));
      }
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('step_token');
        localStorage.removeItem('step_refresh_token');
        localStorage.removeItem('step_email');
        localStorage.removeItem('step_role');
        localStorage.removeItem('step_name');
        localStorage.removeItem('step_emp_code');
        localStorage.removeItem('step_user_id');
      }
    },
    syncFromStorage: (state) => {
      if (typeof window === 'undefined') return;
      try {
        const token = localStorage.getItem('step_token');
        const refreshToken = localStorage.getItem('step_refresh_token');
        const email = localStorage.getItem('step_email') || '';
        const role = localStorage.getItem('step_role') || '';
        const name = localStorage.getItem('step_name') || '';
        const employeeCode = localStorage.getItem('step_emp_code') || '';
        const userIdStr = localStorage.getItem('step_user_id');
        const userId = userIdStr ? Number(userIdStr) : null;
        const hasToken = Boolean(token && token.trim().length > 0);

        state.token = hasToken ? token : null;
        state.refreshToken = hasToken ? refreshToken : null;
        state.user = hasToken
          ? {
              id: userId,
              name: name || 'Enterprise User',
              email,
              role: role || 'Evaluator',
              employeeCode,
            }
          : null;
        state.isAuthenticated = hasToken;
        state.isInitialized = true;
      } catch {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      }
    },
  },
});

export const { setCredentials, logout, syncFromStorage } = authSlice.actions;

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectIsAuthInitialized = (state: RootState) => state.auth.isInitialized;

export default authSlice.reducer;
