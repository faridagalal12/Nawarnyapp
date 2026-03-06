// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = not checked, {} = logged in
  const [isLoading, setIsLoading] = useState(true);

  // Load stored session on mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync("user");
        if (storedUser) {
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

  const signIn = async (email, password) => {
    // ── MOCK LOGIC ── (replace later with real API)
    if (email === "test@example.com" && password === "123456") {
      const mockUser = { email, id: "mock-123", name: "Test User" };
      await SecureStore.setItemAsync("user", JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  };

  const signUp = async (email, password, name) => {
    // ── MOCK SIGNUP ── (later → real API + email verification)
    const mockUser = { email, id: "mock-" + Date.now(), name };
    await SecureStore.setItemAsync("user", JSON.stringify(mockUser));
    setUser(mockUser);
    return { success: true };
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      isAuthenticated: !!user,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
