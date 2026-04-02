import { createContext, useContext, useState, useCallback } from 'react';

const USERS = {
  'jeancarlosgf13@gmail.com': {
    password: (import.meta.env.VITE_JEAN_PASSWORD || 'Jean1301@').trim(),
    role: 'admin',
    name: 'Jean',
  },
  'equipo@carbot.online': {
    password: (import.meta.env.VITE_EQUIPO_PASSWORD || 'viewer123').trim(),
    role: 'viewer',
    name: 'Equipo',
  },
};

const SESSION_KEY = 'carbot_session';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email, password) => {
    const match = USERS[email.toLowerCase()];
    if (!match || match.password !== password) {
      return { success: false, error: 'Email o contraseña incorrectos.' };
    }
    const session = { email: email.toLowerCase(), role: match.role, name: match.name };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
