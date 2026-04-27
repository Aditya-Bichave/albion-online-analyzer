'use client';

import { createContext, useContext, ReactNode } from 'react';

interface LoginModalContextType {
  openLoginModal: (message?: string) => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const openLoginModal = (message?: string) => {
    if (message) {
      console.info(`[Albion Online Analyzer] Login disabled: ${message}`);
    } else {
      console.info('[Albion Online Analyzer] Login disabled in guest mode.');
    }
  };

  const closeLoginModal = () => {};

  return (
    <LoginModalContext.Provider value={{ openLoginModal, closeLoginModal, isLoginModalOpen: false }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
}
