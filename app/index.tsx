import { Redirect } from "expo-router";
import { useAppConfig } from "@/stores/AppConfigStore";
import { useAuth } from "@/stores/AuthStore";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function Index() {
  const { isAdmin, state: appConfigState } = useAppConfig();
  const { state: authState } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Delay navigation until component is mounted and app config is loaded
  useEffect(() => {
    if (!appConfigState.isLoading) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [appConfigState.isLoading]);
  
  // Show a loading spinner until ready to navigate
  if (!isReady || appConfigState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: '#4B2C0B' }}>
          Carregando app no modo: {appConfigState.appType}
        </Text>
      </View>
    );
  }
  
  // Check app type for navigation decision
  // console.log("App type:", appConfigState.appType);
  // console.log("Is admin:", isAdmin());
  // console.log("Is authenticated:", authState?.isAuthenticated);
  
  // If user mode, always go to tabs
  if (appConfigState.appType === "user") {
    // console.log("Redirecting to tabs (user mode)");
    return <Redirect href="/(tabs)" />;
  }
  
  // If admin mode but not authenticated, go to sign in
  if (appConfigState.appType === "admin" && !authState?.isAuthenticated) {
    // console.log("Redirecting to signin (admin mode, not authenticated)");
    return <Redirect href="/(auth)/signin" />;
  }
  
  // Otherwise (admin mode and authenticated) go to main app
  // console.log("Redirecting to tabs (admin mode, authenticated)");
  return <Redirect href="/(tabs)" />;
}
