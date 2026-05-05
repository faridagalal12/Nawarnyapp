// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load stored session on mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("token");
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedToken && storedUser) {
          setAuthToken(storedToken); // attach token to all future requests
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.log("Failed to load auth", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  // Called from LoginScreen with real token from API
  const signIn = async (token, email) => {
    try {
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify({ email, token }));
      setAuthToken(token); // attach token to all future api requests
      setUser({ email, token });
      return { success: true };
    } catch (e) {
      console.log("signIn error", e);
      return { success: false, error: e.message };
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    setAuthToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
      isAuthenticated: !!user,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);