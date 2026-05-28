import { create } from "zustand";

interface AuthUser {
  userId: string;
  role: "PATIENT" | "DOCTOR";
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
