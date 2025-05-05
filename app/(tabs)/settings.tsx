import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View, Text } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ReactNode, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(3);

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
      <View className="flex flex-col gap-2 bg-[#E7E4D8] p-4 pt-8">
        <ArrowLeft size={24} color={"#212121"} />
        <Text className="text-2xl font-bold ">{"Configurações"}</Text>
      </View>
      <View className="flex flex-col gap-6 px-4 py-6">
        <Text className="text-gray-500 text-base font-medium">Geral</Text>

        <View className="flex flex-row justify-between items-center">
          <Text className="text-gray-800 text-lg">Modo Escuro</Text>
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
            className="0 data-[state=checked]:bg-amber-900"
          />
        </View>

        <View className="flex flex-col gap-2">
          <Text className="text-gray-800 text-lg">Tamanho da fonte</Text>
          <Slider minValue={1} maxValue={5} value={fontSize} onChange={setFontSize}>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
         
        </View>
      </View>
    </ParallaxScrollView>
  );
}
