import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, CreateUserData } from '../types';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: CreateUserData) => Promise<boolean>;
  updateUser: (userId: string, userData: Partial<User>) => Promise<boolean>;
  updateCurrentUser: (userData: Partial<User>) => void;
  deleteUser: (userId: string) => Promise<boolean>;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        return true;
      } else {
        toast.error(response.data.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const createUser = async (userData: CreateUserData): Promise<boolean> => {
    try {
      const response = await api.post('/auth/users', userData);
      
      if (response.data.success) {
        toast.success('User created successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Failed to create user');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user');
      return false;
    }
  };

  const updateUser = async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
      const response = await api.put(`/auth/users/${userId}`, userData);
      
      if (response.data.success) {
        // Update current user if it's the logged-in user
        if (user?.id === userId) {
          setUser(response.data.data);
        }
        toast.success('User updated successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Failed to update user');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user');
      return false;
    }
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/auth/users/${userId}`);
      
      if (response.data.success) {
        // Logout if the deleted user is the current user
        if (user?.id === userId) {
          logout();
        }
        toast.success('User deleted successfully');
        return true;
      } else {
        toast.error(response.data.message || 'Failed to delete user');
        return false;
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      return false;
    }
  };

  const contextValue = {
    user,
    loading,
    login,
    logout,
    createUser,
    updateUser,
    updateCurrentUser,
    deleteUser,
    isAdmin: user?.role === 'admin' || user?.role === 'supreme_admin',
    isSupremeAdmin: user?.role === 'supreme_admin',
    isStaff: user?.role === 'team_member' || user?.role === 'manager' || user?.role === 'dean' || user?.role === 'senior_leadership' || user?.role === 'university_admin',
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
