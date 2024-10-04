import { Image, StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { ArrowRight, Keyboard, Mic } from "lucide-react-native";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Search"
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <Input
        variant="rounded"
        size="lg"
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

      <div className="bg-[#f1f1f1] flex flex-col p-8 rounded-xl gap-6">
        <div className="flex flex-col gap-2 text-center">
          <p className="text-2xl font-bold">Word</p>
          <p className="text-[15px]">
            n. (wɜːd): a single unit of language that means something and can be
            spoken or written
          </p>
        </div>
        <span className="flex justify-end text-right gap-1 text-[#6c00e5]">
         <span className="text-[15px]"> See more meanings </span>
         <ArrowRight size={24} color={"#6c00e5"} />
        </span>
      </div>
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
