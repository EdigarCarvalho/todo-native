import { useDictionary } from "@/stores/Dictionary";
import { ArrowRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  word: string;
  meanings: string[];
  showAllMeanings?: boolean;
  disableToggleSeeAll?: boolean;
};

export function WordCard({
  meanings,
  word,
  showAllMeanings,
  disableToggleSeeAll,
}: Props) {
  const [showAll, setShowAll] = useState(!!showAllMeanings);
  const { setWordInFocus } = useDictionary();

  const seeMore = () => {
    if (disableToggleSeeAll) return;

    if (showAll) {
      setWordInFocus({ word: "", meanings: [] });
      setShowAll(false);
      return;
    }

    setWordInFocus({ word, meanings });
    setShowAll(true);
  };

  return (
    <Pressable onPress={seeMore} disabled={disableToggleSeeAll}>
      <View className="bg-[#ebe2e2] cursor-pointer flex flex-col p-8 rounded-xl gap-6">
        {!showAll ? (
          <View className="flex flex-col gap-2 text-justify">
            <Text className="text-2xl font-bold mx-auto">{word}</Text>
            <Text className="text-[14px]">1. {meanings[0]}</Text>
          </View>
        ) : (
          meanings.map((meaning, idx) => (
            <Text key={meaning} className="text-[14px]">
              {idx + 1}. {meaning}
            </Text>
          ))
        )}
        {!disableToggleSeeAll && (
          <View className="flex flex-row justify-end text-right gap-1 text-[#6c00e5]">
            <View className="text-[14px] cursor-pointer">
              <Text>Ver {showAll ? "menos" : "mais"} significados</Text>
            </View>
            <ArrowRight size={24} color={"#6c00e5"} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
