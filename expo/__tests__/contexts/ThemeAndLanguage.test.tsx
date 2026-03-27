import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

jest.mock('@react-native-async-storage/async-storage');

const themeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const languageWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should initialize with light theme by default', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: themeWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.themeMode).toBe('light');
    expect(result.current.isDark).toBe(false);
    expect(result.current.theme).toBeDefined();
  });

  it('should load saved theme from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('dark');

    const { result } = renderHook(() => useTheme(), { wrapper: themeWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('should toggle theme', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: themeWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialMode = result.current.themeMode;

    await act(async () => {
      await result.current.toggleTheme();
    });

    expect(result.current.themeMode).toBe(initialMode === 'light' ? 'dark' : 'light');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'app_theme_mode',
      initialMode === 'light' ? 'dark' : 'light'
    );
  });

  it('should set theme to specific mode', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: themeWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.setTheme('dark');
    });

    expect(result.current.themeMode).toBe('dark');
    expect(result.current.isDark).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_theme_mode', 'dark');
  });

  it('should handle storage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const { result } = renderHook(() => useTheme(), { wrapper: themeWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.themeMode).toBe('light');
  });
});

describe('LanguageContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should initialize with English by default', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: languageWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.language).toBe('en');
    expect(result.current.isRTL).toBe(false);
  });

  it('should load saved language from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('ar');

    const { result } = renderHook(() => useLanguage(), { wrapper: languageWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.language).toBe('ar');
    expect(result.current.isRTL).toBe(true);
  });

  it('should change language', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: languageWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.changeLanguage('ar');
    });

    await waitFor(() => {
      expect(result.current.isChanging).toBe(false);
    });

    expect(result.current.language).toBe('ar');
    expect(result.current.isRTL).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_language', 'ar');
  });

  it('should translate strings correctly', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: languageWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.t('home')).toBe('Home');
    expect(result.current.t('explore')).toBe('Explore');

    await act(async () => {
      await result.current.changeLanguage('ar');
    });

    await waitFor(() => {
      expect(result.current.isChanging).toBe(false);
    });

    expect(result.current.t('home')).toBe('الرئيسية');
    expect(result.current.t('explore')).toBe('استكشف');
  });

  it('should return key for missing translations', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper: languageWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.t('nonexistent_key')).toBe('nonexistent_key');
  });

  it('should handle storage errors gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error('Storage error')
    );

    const { result } = renderHook(() => useLanguage(), { wrapper: languageWrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.language).toBe('en');
  });
});
