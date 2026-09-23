import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { initCsrf } from '../services/api';

const AuthContext = createContext(null);

export const TEST_ACCOUNTS = {
  admin: {
    name: 'Administrator',
    email: 'admin@tasktutorials.com',
    password: 'Password@123',
    role: 'admin',
    roleId: 3,
    badge: 'System Admin',
  },
  faculty1: {
    name: 'Mr. Ravi Sharma (Math & Physics)',
    email: 'faculty1@tasktutorials.com',
    password: 'Password@123',
    role: 'faculty',
    roleId: 2,
    badge: 'Faculty Member',
  },
  faculty2: {
    name: 'Ms. Priya Nair (Physics & Chemistry)',
    email: 'faculty2@tasktutorials.com',
    password: 'Password@123',
    role: 'faculty',
    roleId: 2,
    badge: 'Faculty Member',
  },
  student1: {
    name: 'Student 1 (Enrolled Grade 9 & 10)',
    email: 'student1@tasktutorials.com',
    password: 'Password@123',
    role: 'student',
    roleId: 1,
    badge: 'Enrolled Student',
  },
  student2: {
    name: 'Student 2',
    email: 'student2@tasktutorials.com',
    password: 'Password@123',
    role: 'student',
    roleId: 1,
    badge: 'Student',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('task_tutorials_token') || null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('task_tutorials_theme') || 'light');
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);

  // Sync theme attribute on <html> element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('task_tutorials_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Helper to map role ID to string name
  const getRoleName = (roleId) => {
    switch (Number(roleId)) {
      case 3: return 'admin';
      case 2: return 'faculty';
      case 1: return 'student';
      default: return 'student';
    }
  };

  // Load current user from session / token
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/me');
      if (res.success && res.data) {
        const u = res.data;
        const role = getRoleName(u.role_id);
        setUser({
          ...u,
          role,
        });
        setHasAccess(u.role_id === 3 || u.role_id === 2 || true);
        return { success: true, user: u };
      } else {
        // Only clear if token was invalid
        if (localStorage.getItem('task_tutorials_token')) {
          localStorage.removeItem('task_tutorials_token');
          setToken(null);
          setUser(null);
        }
        return { success: false };
      }
    } catch (err) {
      console.error('Error fetching /api/me:', err);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Standard Login
  const login = useCallback(async ({ email, password }) => {
    try {
      await initCsrf();
      const res = await api.post('/login', { email, password });
      if (res.success && res.data) {
        const { user: userData, token: authToken, has_access } = res.data;
        if (authToken) {
          localStorage.setItem('task_tutorials_token', authToken);
          setToken(authToken);
        }
        const role = getRoleName(userData.role_id);
        const enrichedUser = {
          ...userData,
          role,
        };
        setUser(enrichedUser);
        setHasAccess(Boolean(has_access));
        return { success: true, user: enrichedUser };
      }
      return {
        success: false,
        message: res.message || 'Invalid credentials',
        errors: res.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error or backend is not running',
      };
    }
  }, []);

  // Quick Switch for Testing
  const quickLogin = useCallback(async (accountKey) => {
    const acc = TEST_ACCOUNTS[accountKey];
    if (!acc) return { success: false, message: 'Invalid test account' };
    return await login({ email: acc.email, password: acc.password });
  }, [login]);

  // Register (for new student registration test)
  const register = useCallback(async ({ name, email, password, phone_no }) => {
    try {
      await initCsrf();
      const res = await api.post('/register', { name, email, password, phone_no });
      if (res.success && res.data) {
        const { user: userData, token: authToken } = res.data;
        if (authToken) {
          localStorage.setItem('task_tutorials_token', authToken);
          setToken(authToken);
        }
        const role = getRoleName(userData.role_id);
        const enrichedUser = {
          ...userData,
          role,
        };
        setUser(enrichedUser);
        setHasAccess(false); // newly registered students need enrollment approval
        return { success: true, user: enrichedUser };
      }
      return {
        success: false,
        message: res.message || 'Registration failed',
        errors: res.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error during registration',
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.warn('Backend logout request notice:', e);
    } finally {
      localStorage.removeItem('task_tutorials_token');
      setToken(null);
      setUser(null);
      setHasAccess(false);
    }
  }, []);

  const value = {
    user,
    role: user?.role || null,
    token,
    loading,
    hasAccess,
    theme,
    toggleTheme,
    isTestConsoleOpen,
    setIsTestConsoleOpen,
    login,
    quickLogin,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
