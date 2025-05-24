import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import {
  ArrowLeft,
  ChevronDownIcon,
  ChevronUpIcon,
  Search,
} from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";
import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Accordion,
  AccordionContent,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Divider } from "@/components/ui/divider";

export default function HomeScreen() {
  const { fetchData, state, setWordInFocus } = useDictionary();
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  // Filter words based on search input
  const getFilteredWords = (categoryId: string) => {
    const words = state.wordsByCategory[categoryId] || [];
    if (!filter) return words;

    return words.filter(
      (word) =>
        word.word.toLowerCase().includes(filter.toLowerCase()) ||
        word.meaning.toLowerCase().includes(filter.toLowerCase())
    );
  };

  // Check if any category has words matching the filter
  const hasFilteredWords = () => {
    return state.categories.some(
      (category) => getFilteredWords(category.id.toString()).length > 0
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "inherit", dark: "inherit" }}
      title=""
    >
      <Input
        variant="rounded"
        size="xl"
        isDisabled={false}
        isInvalid={false}
        isReadOnly={false}
        className="bg-[#E7E4D8] border-none sticky"
      >
        {!state.wordInFocus ? (
          <>
            <InputField
              placeholder="Pesquise uma palavra"
              className="text-sm placeholder:text-[#474747] font-normal"
              value={filter}
              onChangeText={setFilter}
            />
            <InputSlot className="mr-5 mt-1">
              <InputIcon>
                <Search size={20} color={"#110626"} />
              </InputIcon>
            </InputSlot>
          </>
        ) : (
          <View className="flex flex-row w-full items-center justify-between">
            <View className="flex-1 text-center ml-6">
              <Text className="text-xl font-bold">
                {state.wordInFocus.word}
              </Text>
            </View>
            <TouchableOpacity
              className="mr-5 pr-2 flex  gap-1 flex-row items-center justify-center"
              onPress={() => setWordInFocus(null)}
            >
              <ArrowLeft size={17} />
              <Text className="flex">Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Input>

      {state.isLoading ? (
        <View className="py-10 flex justify-center items-center">
          <ActivityIndicator size="large" color="#A30122" />
          <Text className="mt-2 text-center">
            Carregando dados do dicionário...
          </Text>
        </View>
      ) : !state.wordInFocus ? (
        <View className="mt-4">
          {state.lastApiFetch && (
            <Text className="text-xs text-center text-gray-500 mb-2">
              Última atualização:{" "}
              {new Date(state.lastApiFetch).toLocaleString()}
            </Text>
          )}

          {state.categories.length > 0 ? (
            state.categories.map((category) => {
              const filteredWords = getFilteredWords(category.id.toString());

              // Only show categories with matching words when filtering
              if (filteredWords.length === 0) return null;

              return (
                <Accordion
                  key={category.id}
                  type="single"
                  variant="unfilled"
                  className=""
                >
                  <AccordionItem value={category.id.toString()}>
                    <AccordionTrigger>
                      {({ isExpanded }) => {
                        return (
                          <>
                            <AccordionTitleText>
                              {category.name}
                            </AccordionTitleText>
                            {isExpanded ? (
                              <AccordionIcon
                                as={ChevronUpIcon}
                                className="ml-3"
                              />
                            ) : (
                              <AccordionIcon
                                as={ChevronDownIcon}
                                className="ml-3"
                              />
                            )}
                          </>
                        );
                      }}
                    </AccordionTrigger>
                    <AccordionContent>
                      {filteredWords.map((word) => (
                        <TouchableOpacity
                          key={word.id}
                          className="py-2 "
                          onPress={() => setWordInFocus(word)}
                        >
                          <View className="flex flex-col text-[#A30122]">
                            <Text className="font-bold text-base text-[#A30122]">
                              {word.word}
                            </Text>
                            <Text className="text-sm text-[#474747]">
                              {word.meaning}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  <Divider />
                </Accordion>
              );
            })
          ) : (
            <Text className="text-center py-4">
              Nenhuma categoria encontrada
            </Text>
          )}

          {filter && !hasFilteredWords() && (
            <Text className="text-center py-4">
              Nenhuma palavra encontrada para "{filter}"
            </Text>
          )}
        </View>
      ) : (
        <SelectedWord state={state} />
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

interface SelectedWordProps {
  state: any;
}

function SelectedWord({ state }: SelectedWordProps) {
  return (
    <View className="py-1 px-2">
      <View className="py-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] rounded-xl">
        <Text className="text-base">
          <strong>Significado:</strong> {state.wordInFocus.meaning}
        </Text>
      </View>

      {state.wordInFocus.attachments &&
        state.wordInFocus.attachments.length > 0 && (
          <View className="mt-4 py-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] rounded-xl">
            <Text className="font-bold mb-2">Anexos:</Text>
            {state.wordInFocus.attachments.map((attachment) => (
              <View
                key={attachment.id}
                className="mb-2 p-2 flex flex-col items-center bg-gray-100 rounded text-center"
              >
                <Text className="mb-2 font-medium">{attachment.source}</Text>
                <Image
                  source={{ uri: attachment.url }}
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    height: 200,
                    borderRadius: 8,
                  }}
                  resizeMode="contain"
                  alt={`Attachment ${attachment.id}`}
                />
                <Text className="text-[8px] max-w-full text-center mt-2 text-gray-600 px-1">
                  Fonte: {attachment.url}
                </Text>
              </View>
            ))}
          </View>
        )}
    </View>
  );
}
