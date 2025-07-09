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
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { DictionaryProvider, useDictionary } from "@/stores/Dictionary";
import { TextsProvider } from "@/stores/TextsStore";
import { AppConfigProvider, useAppConfig } from "@/stores/AppConfigStore";
import { AuthProvider, useAuth } from "@/stores/AuthStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

  // This useEffect will run whenever the colorScheme changes
  useEffect(() => {
    console.log(`App theme changed to: ${colorScheme}`);
    // You could add any global theme-related side effects here
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
    <GluestackUIProvider mode="light">
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
    </GluestackUIProvider>
  );
}