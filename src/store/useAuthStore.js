import { create } from 'zustand';
import { api, clearSession, getStoredSession, saveSession } from '../services/api';

const initialSession = getStoredSession();

export const useAuthStore = create((set, get) => ({
  session: initialSession,
  user: initialSession?.user || null,
  isLoading: false,

  setSession: (session) => {
    saveSession(session);
    set({ session, user: session.user });
  },

  setUser: (user) => {
    const session = get().session;
    if (!session) return;
    const nextSession = { ...session, user };
    saveSession(nextSession);
    set({ session: nextSession, user });
  },

  clearAuth: () => {
    clearSession();
    set({ session: null, user: null });
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const session = await api.post('/auth/login', credentials, { skipAuth: true });
      get().setSession(session);
      return session;
    } finally {
      set({ isLoading: false });
    }
  },

  register: (details) => api.post('/auth/register', details, { skipAuth: true }),
  resendOtp: (details) => api.post('/auth/resend-otp', details, { skipAuth: true }),

  verifyOtp: async (details) => {
    const session = await api.post('/auth/verify-otp', details, { skipAuth: true });
    get().setSession(session);
    return session;
  },

  logout: async () => {
    const session = get().session;
    try {
      if (session?.access_token) {
        await api.post('/auth/logout', { refresh_token: session.refresh_token });
      }
    } finally {
      get().clearAuth();
    }
  },
}));
