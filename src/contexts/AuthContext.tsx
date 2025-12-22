import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

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

interface RegisterResult {
  company: any;
  admin: { email: string; [key: string]: any };
}

interface User {
  username: string;
  email?: string;
  role?: string;
  company?: {
    id: number;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  token: string | null;
  loginWithCredentials: (username: string, password: string) => Promise<boolean>;
  registerCompany: (data: RegisterData) => Promise<RegisterResult | null>;
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
  const [token, setToken] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Función auxiliar para decodificar el token y obtener datos de la empresa si faltan
  const getCompanyFromToken = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      if (decoded.companyId) {
        return { id: decoded.companyId, name: decoded.companyName || 'Mi Empresa' };
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
    return undefined;
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedUserProfile = localStorage.getItem('userProfile');
    const storedToken = localStorage.getItem('token');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Si falta la empresa, intentar recuperarla del token
      if (!parsedUser.company && storedToken) {
        parsedUser.company = getCompanyFromToken(storedToken);
      }
      setUser(parsedUser);
    }
    if (storedUserProfile) {
      const parsedProfile = JSON.parse(storedUserProfile);
      if (!parsedProfile.company && storedToken) {
        parsedProfile.company = getCompanyFromToken(storedToken);
      }
      setUserProfile(parsedProfile);
    }
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const loginWithCredentials = async (username: string, password: string): Promise<boolean> => {
      try {
        // 1. Petición al Backend
        const response = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          // Mejorar el manejo de errores para incluir el mensaje del backend si está disponible
          const errorText = await response.text();
          throw new Error(`Login failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // 2. Extracción Correcta de Datos del Payload 🔑
        // La respuesta del backend tiene la forma: { access_token: "...", payload: { ...datos_usuario } }
        const accessToken = data.access_token || '';
        const payload = data.payload || {};
        
        // Intentar obtener la empresa del payload o del token
        let companyData = payload.company;
        if (!companyData && accessToken) {
          companyData = getCompanyFromToken(accessToken);
        }

        // Store user data
        const userData: User = {
          // Usar el username del payload, que es el que valida el backend
          username: payload.username || username,
          // Acceder a la propiedad 'role' dentro de 'payload'
          role: payload.role, 
          // El email no está en el payload actual, lo dejamos como undefined
          email: payload.email, // O undefined si estás seguro de que el backend no lo devuelve
          company: companyData,
        };

        // 3. Actualización de Estados y Almacenamiento
        setUser(userData);
        setUserProfile(userData);
        setToken(accessToken);
        
        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userProfile', JSON.stringify(userData));
        
        // Usar 'data.access_token' que es el nombre exacto de la propiedad en la respuesta
        localStorage.setItem('token', accessToken); 

        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
  };

  const registerCompany = async (data: RegisterData): Promise<RegisterResult | null> => {
    try {
      const response = await fetch(`${baseUrl}/auth/register-company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData.message || 'Unknown error');
        throw new Error(errorData.message || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  };

  const logout = () => {
    setUser(null);
    setUserProfile(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('token');
  };

  const value: AuthContextType = {
    user,
    userProfile,
    token,
    loginWithCredentials,
    registerCompany,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
