import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthContextType, User } from '../types';
import { createUser, getUserByEmail, getUserById, initUserAnalytics } from '../database';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (userId) {
        const userData = getUserById(userId);
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const userData = getUserByEmail(email);
      
      if (!userData) {
        throw new Error('User not found');
      }

      // Simple password check (in production, use proper hashing)
      if (userData.passwordHash !== password) {
        throw new Error('Invalid password');
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt
      };

      await SecureStore.setItemAsync('userId', user.id);
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Check if user already exists
      const existingUser = getUserByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const userId = createUser({
        name,
        email,
        passwordHash: password, // In production, hash the password
        createdAt: new Date().toISOString()
      });

      // Initialize analytics for new user
      initUserAnalytics(userId);

      const user: User = {
        id: userId,
        name,
        email,
        createdAt: new Date().toISOString()
      };

      await SecureStore.setItemAsync('userId', user.id);
      setUser(user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userId');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
