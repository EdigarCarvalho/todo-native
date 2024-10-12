import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ReactNode, useState } from "react";
import { CheckIcon, Keyboard, Mic } from "lucide-react-native";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from "@/components/ui/checkbox";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { useDictionary } from "@/stores/Dictionary";
import { WordCard } from "@/components/Word";

const Container = ({ children }: { children: ReactNode }) => {
  return (
    <View className="bg-[#f1f1f1] p-4 rounded-lg flex justify-between flex-row">
      {children}
    </View>
  );
};

export default function BookMarksScreen() {
  const { state, removeBookmark } = useDictionary();
  const [timers, setTimers] = useState<
    Record<string, NodeJS.Timeout | undefined>
  >({});
  const [showFull, setShowFull] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("");

  const onToggleBookmark = (word: string) => {
    if (timers[word]) {
      clearTimeout(timers[word]);
      setTimers((prev) => {
        const newTimers = { ...prev, [word]: undefined };
        return newTimers;
      });
      return;
    }

    const newTimer = setTimeout(() => {
      removeBookmark(word);
      setTimers((prev) => {
        const newTimers = { ...prev, [word]: undefined };
        return newTimers;
      });
    }, 5000);

    setTimers((prev) => ({ ...prev, [word]: newTimer }));
  };

  const showFullWord = (word: string) => {
    setShowFull((prev) => {
      if (prev.includes(word)) {
        return prev.filter((w) => w !== word);
      }

      return [...prev, word];
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Favoritados"
    >
      <Input
        variant="rounded"
        size="lg"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="bg-[#f1f1f1] border-none mb-4"
      >
        <InputField
          placeholder="Search"
          className="text-sm"
          onChangeText={setFilter}
        />
        <InputSlot className="mr-5">
          <InputIcon>
            <Mic size={20} color={"#110626"} />
          </InputIcon>
        </InputSlot>
        <InputSlot className="mr-4">
          <InputIcon>
            <Keyboard size={18} color={"#110626"} />
          </InputIcon>
        </InputSlot>
      </Input>
      <View className="flex flex-col gap-3">
        {state.bookmarks
          .filter(
            (word) =>
              !filter || word.word.toLowerCase().includes(filter.toLowerCase())
          )
          .map((word) => {
            const shouldShowFull = showFull.includes(word.word);

            return (
              <Container key={word.word}>
                <Pressable
                  onPress={() => showFullWord(word.word)}
                  className="max-w-full"
                >
                  {shouldShowFull ? (
                    <WordCard
                      meanings={word.meanings}
                      word={word.word}
                      showAllMeanings
                      disableToggleSeeAll
                    />
                  ) : (
                    <View className="flex flex-row justify-start items-center w-[70vw]">
                      <Text className="text-[#4B33E1] text-sm">
                        {word?.word}
                      </Text>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-xs text-[#0D0D25]"
                      >
                        {" . "}
                        {word?.meanings[0]}
                      </Text>
                    </View>
                  )}
                </Pressable>
                {!shouldShowFull && (
                  <Checkbox
                    size="md"
                    value=""
                    isInvalid={false}
                    isDisabled={false}
                    defaultIsChecked={true}
                    isChecked={!timers[word.word]}
                    onChange={() => {
                      onToggleBookmark(word.word);
                    }}
                  >
                    <CheckboxIndicator>
                      <CheckboxIcon
                        className="text-white bg-black"
                        as={CheckIcon}
                      />
                    </CheckboxIndicator>
                  </Checkbox>
                )}
              </Container>
            );
          })}
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
