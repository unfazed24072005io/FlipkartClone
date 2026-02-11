import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: "AIzaSyAjcNi9k_gZymMKOCHOl2yvRSVMpnfd8Xk",
  authDomain: "a17-app.firebaseapp.com",
  databaseURL: "https://a17-app-default-rtdb.firebaseio.com",
  projectId: "a17-app",
  storageBucket: "a17-app.firebasestorage.app",
  messagingSenderId: "358315150007",
  appId: "1:358315150007:web:a454a2cb4ac162d9d19b32",
  measurementId: "G-Q8F95V1JYL"
};

const DB_PREFIX = 'flipkart_';

export const database = {
  async get<T>(path: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(DB_PREFIX + path);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('Database get error:', error);
      return null;
    }
  },

  async set(path: string, data: unknown): Promise<void> {
    try {
      await AsyncStorage.setItem(DB_PREFIX + path, JSON.stringify(data));
    } catch (error) {
      console.log('Database set error:', error);
    }
  },

  async remove(path: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(DB_PREFIX + path);
    } catch (error) {
      console.log('Database remove error:', error);
    }
  },

  async getAll<T>(prefix: string): Promise<Record<string, T>> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const relevantKeys = keys.filter(k => k.startsWith(DB_PREFIX + prefix));
      const result: Record<string, T> = {};
      
      for (const key of relevantKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const id = key.replace(DB_PREFIX + prefix + '/', '');
          result[id] = JSON.parse(data);
        }
      }
      return result;
    } catch (error) {
      console.log('Database getAll error:', error);
      return {};
    }
  },

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};
