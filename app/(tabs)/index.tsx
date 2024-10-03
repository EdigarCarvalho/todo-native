import { Image, StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Keyboard, Mic } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <Input
        variant="rounded"
        size="md"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="bg-[#f1f1f1] border-none"
      >
        <InputField placeholder="Search" className="text-sm" />
        <InputSlot className="mr-4 ">
          <InputIcon>
            <Mic size={20} color={"#110626"} />
          </InputIcon>
        </InputSlot>
        <InputSlot className="mr-4">
          <InputIcon>
            <Keyboard size={19} color={"#110626"} />
          </InputIcon>
        </InputSlot>
      </Input>
      <ThemedView style={styles.titleContainer}></ThemedView>
      <ThemedView style={styles.stepContainer}></ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    color: "#000",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    color: "#000",
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
    color: "#000",
  },
});
