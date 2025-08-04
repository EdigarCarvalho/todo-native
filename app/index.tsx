import { Redirect } from "expo-router";
import { useAppConfig } from "@/stores/AppConfigStore";
import { useAuth } from "@/stores/AuthStore";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAdmin } = useAppConfig();
  const { state } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Delay navigation until component is mounted
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show a loading spinner until ready to navigate
  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  // If configured as admin mode but not authenticated, go to sign in
  if (isAdmin() && !state?.isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  }
  
  // Otherwise go to main app
  return <Redirect href="/(tabs)" />;
}
