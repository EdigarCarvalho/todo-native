import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowRight } from "lucide-react-native";

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-[#f1f1f1] p-4 rounded-lg flex justify-between">
      {children}
    </div>
  );
};

export default function SettingsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Settings"
      headerImage={
        <Ionicons size={310} name="code-slash" style={styles.headerImage} />
      }
    >
      <div className="flex flex-col gap-3">
        <Container>
          <ThemedText>Show suggestions</ThemedText>
          <Switch />
        </Container>
        <Container>
          <ThemedText>Show keyboard</ThemedText>
          <Switch />
        </Container>
        <Container>
          <ThemedText>Remove ads</ThemedText>
          <ArrowRight size={24} color={'#6c00e5'}/>
        </Container>
        <Container>
          <ThemedText>Terms of use</ThemedText>
          <ArrowRight size={24} color={'#6c00e5'} />
        </Container>
      </div>
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
