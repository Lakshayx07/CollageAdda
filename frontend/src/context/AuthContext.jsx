import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const stored = localStorage.getItem('collageadda_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('collageadda_user', JSON.stringify(userData));
    setUser(userData);
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const newUser = { ...prev, ...updates };
      localStorage.setItem('collageadda_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    localStorage.removeItem('collageadda_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
