import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, View } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowRight } from "lucide-react-native";

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <View className="bg-[#f1f1f1] p-4 rounded-lg flex flex-row items-center justify-between">
      {children}
    </View>
  );
};

export default function SettingsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Configurações"
    >
      <View className="flex flex-col gap-3">
        <Container>
          <ThemedText>Mostrar sugestões</ThemedText>
          <Switch />
        </Container>
        <Container>
          <ThemedText>Mostrar teclado</ThemedText>
          <Switch />
        </Container>
        <Container>
          <ThemedText>Remover ads</ThemedText>
          <ArrowRight size={24} color={"#6c00e5"} />
        </Container>
        <Container>
          <ThemedText>Termos de uso</ThemedText>
          <ArrowRight size={24} color={"#6c00e5"} />
        </Container>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
