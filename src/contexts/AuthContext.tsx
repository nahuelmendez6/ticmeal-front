import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Company {
  name: string;
  taxId?: string;
  industryType?: string;
}

interface Admin {
  email: string;
  password: string;
}

interface RegisterData {
  company: Company;
  admin: Admin;
}

interface User {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  groups?: string[];
  department?: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  registerCompany: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUserProfile = localStorage.getItem('userProfile');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedUserProfile) {
      setUserProfile(JSON.parse(storedUserProfile));
    }
  }, []);

  const loginWithCredentials = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Store user data
      const userData: User = {
        username: data.username || username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        groups: data.groups,
        department: data.department,
      };

      setUser(userData);
      setUserProfile(userData);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userProfile', JSON.stringify(userData));
      localStorage.setItem('token', data.token || data.access_token || '');

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const registerCompany = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3000/auth/register-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      
      // After successful registration, automatically log in
      if (result.admin?.email) {
        return await loginWithCredentials(result.admin.email, data.admin.password);
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loginWithCredentials,
    registerCompany,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

