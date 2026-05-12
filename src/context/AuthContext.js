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
        const storedUser = await SecureStore.getItemAsync("user");
        const storedToken = await SecureStore.getItemAsync("token");
        if (storedUser && storedToken) {
          setAuthToken(storedToken);
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

  // Called from LoginScreen with (token, email)
  // Called from VerifyOtp with the full user object + token
  const signIn = async (token, emailOrUser) => {
    try {
      let userData;

      if (typeof emailOrUser === "object") {
        // called from OTP verify with full user object
        userData = emailOrUser;
      } else {
        // called from login screen — decode token to get user info
        const base64 = token.split(".")[1];
        const decoded = JSON.parse(atob(base64));
        userData = {
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role,
        };
      }

      setAuthToken(token);
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (e) {
      console.error("signIn error:", e);
      return { success: false, error: "Failed to save session" };
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("token");
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