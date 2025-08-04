import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { FontSizeProvider } from "@/components/FontSizeProvider";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Platform } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { DictionaryProvider, useDictionary } from "@/stores/Dictionary";
import { TextsProvider } from "@/stores/TextsStore";
import { AppConfigProvider, useAppConfig } from "@/stores/AppConfigStore";
import { AuthProvider, useAuth } from "@/stores/AuthStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Theme manager component to initialize theme before content renders
function ThemeManager({ children }: { children: React.ReactNode }) {
  const [themeReady, setThemeReady] = useState(false);
  const [initialTheme, setInitialTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedSettings = await AsyncStorage.getItem("dictionary_settings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.darkMode) {
            setInitialTheme('dark');
            // Apply theme to HTML element only on web
            if (Platform.OS === 'web' && typeof document !== 'undefined') {
              document.documentElement.classList.remove('light');
              document.documentElement.classList.add('dark');
              document.documentElement.style.colorScheme = 'dark';
            }
          }
        }
        setThemeReady(true);
      } catch (error) {
        console.error("Failed to load theme:", error);
        setThemeReady(true); // Continue with default theme if error
      }
    }
    
    loadTheme();
  }, []);
  
  if (!themeReady) {
    return null; // Or a simple loading indicator
  }
  
  return (
    <GluestackUIProvider mode={initialTheme}>
      {children}
    </GluestackUIProvider>
  );
}

// App route guard to check app type and redirect accordingly
function AppRouteGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { state: appConfigState, isAdmin } = useAppConfig();
  const { state: authState } = useAuth();
  const isAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (appConfigState.isLoading || authState.isLoading) return;

    // If user is authenticated, don't redirect to auth pages
    if (authState.isAuthenticated) {
      if (isAuthGroup) {
        // Redirect authenticated user away from auth pages
        router.replace("/(tabs)");
      }
      return;
    }

    // If user is not authenticated and in admin mode, redirect to auth
    if (isAdmin() && !isAuthGroup && !authState.isAuthenticated) {
      router.replace("/(auth)/signin");
    } else if (!isAdmin() && isAuthGroup) {
      // Redirect to main app if in user mode but trying to access auth
      router.replace("/(tabs)");
    }
  }, [appConfigState.appType, authState.isAuthenticated, isAuthGroup, appConfigState.isLoading, authState.isLoading]);

  return <>{children}</>;
}

function AppContent() {
  const { state } = useDictionary();
  const colorScheme = state.settings.darkMode ? "dark" : "light";

  // Apply theme changes to HTML element when settings change - web only
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      if (colorScheme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';
      }
    }
    console.log(`App theme changed to: ${colorScheme}`);
  }, [colorScheme]);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GluestackUIProvider mode={colorScheme as "light" | "dark"}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeManager>
      <AppConfigProvider>
        <AuthProvider>
          <DictionaryProvider>
            <TextsProvider>
              <FontSizeProvider>
                <AppRouteGuard>
                  <AppContent />
                </AppRouteGuard>
              </FontSizeProvider>
            </TextsProvider>
          </DictionaryProvider>
        </AuthProvider>
      </AppConfigProvider>
    </ThemeManager>
  );
}