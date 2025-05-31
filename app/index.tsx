import { Redirect } from "expo-router";
import { useAppConfig } from "@/stores/AppConfigStore";
import { useAuth } from "@/stores/AuthStore";

export default function Index() {
  const { isAdmin } = useAppConfig();
  const { state } = useAuth();
  
  // Check if user is authenticated admin
  const isAuthenticatedAdmin = isAdmin() && Boolean(state?.isAuthenticated);
  
  // If configured as admin mode but not authenticated, go to sign in
  if (isAdmin() && !state?.isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  }
  
  // Otherwise go to main app
  return <Redirect href="/(tabs)" />;
}
