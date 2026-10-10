import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiRequest } from './apiClient';

interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<{ id: string; name: string; email: string; role: string }>('/api/v1/auth/me')
      .then((user) => setSession({ user } as unknown as Session))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const user = await apiRequest<{ name: string; email: string; role: string }>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setSession({ user } as unknown as Session);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unable to sign in' };
    }
  };

  const signUp = async (_email: string, _password: string, _name: string) => {
    return { error: 'Admin accounts must be created by a super administrator.' };
  };

  const signOut = async () => {
    await apiRequest('/api/v1/auth/logout', { method: 'POST' });
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
