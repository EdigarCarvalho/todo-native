import { StyleSheet, View, Text } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react-native";
import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from "@/components/ui/slider";
import { useDictionary } from "@/stores/Dictionary";
import { ScalableText } from "@/components/FontSizeProvider";

export default function SettingsScreen() {
  const { state, updateSettings } = useDictionary();
  const { darkMode, fontSize } = state.settings;


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
        <ScalableText className="text-2xl font-bold">Configurações</ScalableText>
      </View>
      <View className="flex flex-col gap-6 px-4 py-6">
        <ScalableText className="text-gray-500 text-base font-medium">Geral</ScalableText>

        <View className="flex flex-row justify-between items-center">
          <ScalableText className="text-gray-800 ">Modo Escuro</ScalableText>
          <Switch
            checked={Boolean(darkMode)}
            onCheckedChange={() => {
              updateSettings({ darkMode: !darkMode});
            }}
            className="data-[state=checked]:bg-[#5A2E0A]"
            trackColor={{ 
              false: '#E5D5C8', 
              true: '#E5D5C8', 
            }}
          />
        </View>

        <View className="flex flex-col gap-2">
          <ScalableText className="text-gray-800 ">Tamanho da fonte</ScalableText>
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
          
          <View className="flex flex-row justify-between mt-1">
            <ScalableText className="text-xs">Pequeno</ScalableText>
            <ScalableText className="text-xs">Grande</ScalableText>
          </View>
        </View>
      </View>
    </ParallaxScrollView>
  );
}