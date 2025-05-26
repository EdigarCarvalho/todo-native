import { Redirect } from "expo-router";
import { useAppConfig } from "@/stores/AppConfigStore";

export default function Index() {
  const { isAdmin } = useAppConfig();
  
  // Redirect based on app mode
  if (isAdmin()) {
    return <Redirect href="/(auth)/signin" />;
  }
  
  return <Redirect href="/(tabs)" />;
}
