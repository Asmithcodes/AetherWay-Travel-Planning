
import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

interface AuthState {
  user: any | null;
  session: any | null;
  isLoading: boolean;
  setUser: (session: any) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (session) => set({ 
    session, 
    user: session?.user ?? null, 
    isLoading: false 
  }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, isLoading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  }
}));
