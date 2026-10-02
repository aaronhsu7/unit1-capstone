// filename: src/context/AuthContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AuthData = Record<string, unknown>;

type AuthContextValue = {
  session: AuthData | null;
  isAuthenticated: boolean;
  signIn: (authData: AuthData) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthData | null>(null);

  function signIn(authData: AuthData) {
    setSession(authData);
  }

  function signOut() {
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: Boolean(session),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
