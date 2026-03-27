import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeColors } from "@/constants/colors";

type ThemeMode = "light" | "dark";

const STORAGE_KEY = "app_theme_mode";

export type Theme = typeof ThemeColors.light;

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setThemeMode(stored);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = useCallback(async () => {
    try {
      const newMode: ThemeMode = themeMode === "light" ? "dark" : "light";
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      setThemeMode(newMode);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  }, [themeMode]);

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
      setThemeMode(mode);
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  }, []);

  const theme: Theme = ThemeColors[themeMode];

  return useMemo(
    () => ({
      theme,
      themeMode,
      isLoading,
      toggleTheme,
      setTheme,
      isDark: themeMode === "dark",
    }),
    [theme, themeMode, isLoading, toggleTheme, setTheme]
  );
});
