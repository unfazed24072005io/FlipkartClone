import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, UserRole } from '@/types';
import { database } from '@/config/firebase';

const AUTH_KEY = 'flipkart_auth_user';
const USERS_PREFIX = 'users';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        const userData = JSON.parse(stored) as User;
        const freshUser = await database.get<User>(`${USERS_PREFIX}/${userData.uid}`);
        if (freshUser && freshUser.status !== 'blocked') {
          setUser(freshUser);
          setIsAuthenticated(true);
        } else if (freshUser?.status === 'blocked') {
          await AsyncStorage.removeItem(AUTH_KEY);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.log('Load user error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const allUsers = await database.getAll<User>(USERS_PREFIX);
      const foundUser = Object.values(allUsers).find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!foundUser) {
        return { success: false, error: 'User not found. Please register first.' };
      }

      const storedPassword = await AsyncStorage.getItem(`password_${foundUser.uid}`);
      if (storedPassword !== password) {
        return { success: false, error: 'Invalid password.' };
      }

      if (foundUser.status === 'blocked') {
        return { success: false, error: 'Your account has been blocked. Contact support.' };
      }

      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(foundUser));
      setUser(foundUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const allUsers = await database.getAll<User>(USERS_PREFIX);
      const existingUser = Object.values(allUsers).find(
        u => u.email.toLowerCase() === email.toLowerCase()
      );

      if (existingUser) {
        return { success: false, error: 'Email already registered.' };
      }

      const uid = database.generateId();
      const newUser: User = {
        uid,
        name,
        email,
        role,
        status: 'active',
        createdAt: Date.now(),
      };

      await database.set(`${USERS_PREFIX}/${uid}`, newUser);
      await AsyncStorage.setItem(`password_${uid}`, password);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      console.log('Register error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.log('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    try {
      const updatedUser = { ...user, ...updates };
      await database.set(`${USERS_PREFIX}/${user.uid}`, updatedUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.log('Update profile error:', error);
      return false;
    }
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const freshUser = await database.get<User>(`${USERS_PREFIX}/${user.uid}`);
    if (freshUser) {
      setUser(freshUser);
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(freshUser));
    }
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };
});
