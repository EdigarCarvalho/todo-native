import { Image, Pressable, StyleSheet } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { CheckIcon, Keyboard, Mic } from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { WordCard } from "@/components/Word";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
} from "@/components/ui/checkbox";

export default function HomeScreen() {
  const { fetchWords, state, bookmarkWord, removeBookmark } = useDictionary();
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchWords();
  }, []);

  const filterSearch = (e: any) => {
    setFilter(e.target.value);
  };

  const toggleBookmark = (word: string) => {
    if (state.bookmarks.some((w) => w.word === word)) {
      removeBookmark(word);
    } else {
      bookmarkWord({ word });
    }
  };

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
        {!state.wordInFocus.word ? (
          <>
            <InputField
              placeholder="Search"
              className="text-sm"
              value={filter}
              onChange={filterSearch}
            />
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
          </>
        ) : (
          <View className="flex flex-row w-full items-center justify-between">
            <View className="flex-1 text-center">
              <p className="text-xl font-bold">{state.wordInFocus.word}</p>
            </View>
            <Pressable
              className="flex-none mr-6"
              onPress={() => toggleBookmark(state.wordInFocus.word)}
            >
              <Checkbox
                value=""
                size="md"
                isInvalid={false}
                isDisabled={false}
                defaultIsChecked={false}
                isChecked={state.bookmarks.some((word) => {
                  return word.word === state.wordInFocus.word;
                })}
              >
                <CheckboxIndicator>
                  <CheckboxIcon className="text-white" as={CheckIcon} />
                </CheckboxIndicator>
              </Checkbox>
            </Pressable>
          </View>
        )}
      </Input>

      {!state.wordInFocus.word ? (
        state.words
          .filter((word) =>
            word.word.toLowerCase().includes(filter.toLowerCase())
          )
          .map((word) => (
            <WordCard
              key={word.word}
              word={word.word}
              meanings={word.meanings}
            />
          ))
      ) : (
        <>
          <WordCard
            key={state.wordInFocus.word + "-focus"}
            word={state.wordInFocus.word}
            meanings={state.wordInFocus.meanings}
            showAllMeanings={true}
          />
        </>
      )}
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
