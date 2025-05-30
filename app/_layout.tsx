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
import { AuthProvider } from "@/stores/AuthStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// App route guard to check app type and redirect accordingly
function AppRouteGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const { state, isAdmin } = useAppConfig();
  const isAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (state.isLoading) return;

    // Check if we're in admin mode and not in auth group
    if (isAdmin() && !isAuthGroup) {
      // Redirect to auth if in admin mode
      router.replace("/(auth)/signin");
    } else if (!isAdmin() && isAuthGroup) {
      // Redirect to main app if in user mode but trying to access auth
      router.replace("/(tabs)");
    }
  }, [state.appType, isAuthGroup, state.isLoading]);

  return <>{children}</>;
}

function AppContent() {
  const { state } = useDictionary();
  const colorScheme = state.settings.darkMode ? "dark" : "light";

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