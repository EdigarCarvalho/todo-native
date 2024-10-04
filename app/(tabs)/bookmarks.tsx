import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, CheckIcon, Keyboard, Mic } from "lucide-react-native";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-[#f1f1f1] p-4 rounded-lg flex justify-between">
      {children}
    </div>
  );
};

const glossary = [
  {
    title: "Abacist",
    definition: "n. (ab-uh-sist): a person skilled in using an abacus",
  },
  {
    title: "Axiom",
    definition:
      "n. (ak-see-uhm): a statement or proposition that is regarded as being established, accepted, or self-evidently true",
  },
  {
    title: "Biocentrism",
    definition:
      "n. (bio-sen-triz-uhm): the belief that life and biology are central to reality and the universe",
  },
  {
    title: "Conundrum",
    definition:
      "n. (kuh-nuhn-druhm): a confusing and difficult problem or question",
  },
  {
    title: "Diaphanous",
    definition:
      "adj. (dai-a-fuh-nuhs): light, delicate, and translucent, especially fabric",
  },
  {
    title: "Ebullient",
    definition: "adj. (ih-buhl-yuhnt): cheerful and full of energy",
  },
  {
    title: "Fugacious",
    definition: "adj. (fyoo-gay-shuhs): tending to disappear; fleeting",
  },
  {
    title: "Halcyon",
    definition:
      "adj. (hal-see-uhn): denoting a period of time in the past that was idyllically happy and peaceful",
  },
];

export default function BookMarksScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Bookmarks"
      headerImage={
        <Ionicons size={310} name="code-slash" style={styles.headerImage} />
      }
    >
           <Input
        variant="rounded"
        size="lg"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="bg-[#f1f1f1] border-none mb-4"
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
      <div className="flex flex-col gap-3">
        {glossary?.map((word, index) => (
          <Container key={index}>
            <ThemedText className="truncate w-[70vw]">
              {word?.title}
              <ThemedText className="text-sm truncate">
                {word?.definition}
              </ThemedText>
            </ThemedText>

            <Checkbox
              size="md"
              isInvalid={false}
              isDisabled={false}
              defaultIsChecked={true}
            >
              <CheckboxIndicator>
                <CheckboxIcon className="text-white " as={CheckIcon} />
              </CheckboxIndicator>
            </Checkbox>
          </Container>
        ))}
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
