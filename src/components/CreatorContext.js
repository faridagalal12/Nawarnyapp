// src/context/CreatorContext.js
// Global creator state — persisted in AsyncStorage.
// Wrap your root navigator with <CreatorProvider>.
// Any screen can call useCreator() to read/write creator status.

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@nawarny_creator_profile";

const CreatorContext = createContext(null);

export function CreatorProvider({ children }) {
  const [creatorProfile, setCreatorProfileState] = useState(null); // null = not a creator
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setCreatorProfileState(JSON.parse(raw));
      } catch (e) {
        console.warn("[CreatorContext] load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist whenever profile changes
  const setCreatorProfile = useCallback(async (profile) => {
    try {
      if (profile === null) {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }
      setCreatorProfileState(profile);
    } catch (e) {
      console.warn("[CreatorContext] save error:", e);
    }
  }, []);

  const clearCreator = useCallback(() => setCreatorProfile(null), [setCreatorProfile]);

  const isCreator = creatorProfile !== null;

  return (
    <CreatorContext.Provider value={{ creatorProfile, isCreator, setCreatorProfile, clearCreator, loading }}>
      {children}
    </CreatorContext.Provider>
  );
}

export function useCreator() {
  const ctx = useContext(CreatorContext);
  if (!ctx) throw new Error("useCreator must be used inside <CreatorProvider>");
  return ctx;
}