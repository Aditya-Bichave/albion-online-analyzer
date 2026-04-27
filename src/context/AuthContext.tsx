'use client';

import { createContext, useContext } from 'react';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../lib/user-profile';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const authDisabledError = new Error('Authentication has been removed from this local build.');

const disabledAuthMethod = async () => {
  throw authDisabledError;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  signInWithGoogle: disabledAuthMethod,
  signInWithTwitter: disabledAuthMethod,
  signInWithEmail: disabledAuthMethod,
  registerWithEmail: disabledAuthMethod,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        profile: null,
        loading: false,
        signInWithGoogle: disabledAuthMethod,
        signInWithTwitter: disabledAuthMethod,
        signInWithEmail: disabledAuthMethod,
        registerWithEmail: disabledAuthMethod,
        logout: async () => {},
        refreshProfile: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
