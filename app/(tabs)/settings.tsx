import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, LogOut } from "lucide-react-native";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { useDictionary } from "@/stores/Dictionary";
import { ScalableText } from "@/components/FontSizeProvider";
import { router } from "expo-router";
import { useAuth } from "@/stores/AuthStore";

export default function SettingsScreen() {
  const { state, updateSettings } = useDictionary();
  const { state: authState, logout } = useAuth();
  const { darkMode, fontSize } = state.settings;
  const isDarkMode = Boolean(darkMode);
  
  const isAdmin = Boolean(authState?.isAuthenticated);

  const handleThemeChange = () => {
    const newDarkMode = !darkMode;
    updateSettings({ darkMode: newDarkMode });
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by AppRouteGuard
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Configurações"
      customCss={{
        content: {
          padding: "0 !important",
          paddingLeft: "0 !important",
          paddingRight: "0 !important",
          paddingTop: "0 !important",
          paddingBottom: "0 !important",
        },
      }}
    >
      <View className="flex flex-col gap-2 bg-[#E7E4D8] dark:bg-[#7C4F2C] p-4 pt-8">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={isDarkMode ? "#E7E4D8" : "#212121"} />
        </TouchableOpacity>
        <ScalableText className="text-2xl font-bold dark:text-[#E7E4D8]">Configurações</ScalableText>
      </View>
      <View className="flex flex-col gap-6 px-4 py-6">
        <ScalableText className="text-gray-500  dark:text-[#E7E4D8] text-base font-medium">Geral</ScalableText>

        <View className="flex flex-row justify-between items-center">
          <ScalableText className="text-gray-800 dark:text-[#E7E4D8] ">Modo Escuro</ScalableText>
          <Switch
            value={Boolean(darkMode)}
            onToggle={handleThemeChange}
            className="data-[state=checked]:bg-[#5A2E0A]"
            trackColor={{ 
              false: '#E5D5C8', 
              true: '#E5D5C8', 
            }}
          />
        </View>

        <View className="flex flex-col gap-2">
          <ScalableText className="text-gray-800 dark:text-[#E7E4D8] ">Tamanho da fonte</ScalableText>
          <Slider
            minValue={1}
            maxValue={5}
            value={fontSize}
            onChange={(value) => {
              updateSettings({ fontSize: value });
            }}
            step={1}

          >
            <SliderTrack >
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          
          <View className="flex flex-row justify-between mt-1 ">
            <ScalableText className="text-xs dark:text-[#E7E4D8]">Pequeno</ScalableText>
            <ScalableText className="text-xs dark:text-[#E7E4D8]">Grande</ScalableText>
          </View>
        </View>

        {isAdmin && (
          <>
            <ScalableText className="text-gray-500 dark:text-[#E7E4D8] text-base font-medium mt-4">Conta</ScalableText>
            
            <TouchableOpacity 
              onPress={handleLogout}
              className="flex flex-row items-center justify-between py-3 px-4 bg-red-50 rounded-lg border border-red-200"
            >
              <View className="flex flex-row items-center gap-3">
                <LogOut size={20} color="#DC2626" />
                <ScalableText className="text-red-600 font-medium">Sair da conta</ScalableText>
              </View>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ParallaxScrollView>
  );
}

