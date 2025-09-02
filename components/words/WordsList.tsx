import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Edit2, ChevronDownIcon, ChevronUpIcon } from "lucide-react-native";
import {
  Accordion,
  AccordionContent,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Divider } from "@/components/ui/divider";

interface Word {
  id: number;
  word: string;
  meaning: string;
  attachments: any[];
}

interface Category {
  id: number;
  name: string;
}

interface WordsListProps {
  state: {
    categories: Category[];
    wordsByCategory: Record<string, Word[]>;
  };
  filter: string;
  isAdmin: boolean;
  onWordSelect: (word: Word) => void;
  onWordEdit: (word: Word) => void;
  isDarkMode?: boolean;
}

export function WordsList({
  state,
  filter,
  isAdmin,
  onWordSelect,
  onWordEdit,
  isDarkMode = false
}: WordsListProps) {
  // Theme colors
  const textColor = isDarkMode ? "#E7E4D8" : "#212121";

  // Filter words based on search input
  const getFilteredWords = (categoryId: string) => {
    const words = state.wordsByCategory[categoryId] || [];
    if (!filter) return words;

    return words.filter(
      (word: Word) =>
        word.word.toLowerCase().includes(filter.toLowerCase()) ||
        word.meaning.toLowerCase().includes(filter.toLowerCase())
    );
  };

  // Check if any category has words matching the filter
  const hasFilteredWords = () => {
    return state.categories.some(
      (category: Category) =>
        getFilteredWords(category.id.toString()).length > 0
    );
  };

  if (state.categories.length === 0) {
    return (
      <Text className="text-center py-4" style={{ color: textColor }}>
        Nenhuma categoria encontrada
      </Text>
    );
  }

  return (
    <View className="mt-1">
      {state.categories?.sort((a, b) => a.name.localeCompare(b.name)).map((category: Category) => {
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
                      <AccordionTitleText style={{ color: textColor }}>
                        {category.name}
                      </AccordionTitleText>
                      {isExpanded ? (
                        <AccordionIcon as={ChevronUpIcon} className="ml-3" color={textColor} />
                      ) : (
                        <AccordionIcon as={ChevronDownIcon} className="ml-3" color={textColor} />
                      )}
                    </>
                  );
                }}
              </AccordionTrigger>
              <AccordionContent>
                {filteredWords?.sort((a, b) => a.word.localeCompare(b.word)).map((word: Word) => (
                  <WordItem
                    key={word.id}
                    word={word}
                    isAdmin={isAdmin}
                    onWordSelect={onWordSelect}
                    onWordEdit={onWordEdit}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
            <Divider />
          </Accordion>
        );
      })}

      {filter && !hasFilteredWords() && (
        <Text className="text-center py-4" style={{ color: textColor }}>
          Nenhuma palavra encontrada para "{filter}"
        </Text>
      )}
    </View>
  );
}

// Individual word item component
interface WordItemProps {
  word: Word;
  isAdmin: boolean;
  onWordSelect: (word: Word) => void;
  onWordEdit: (word: Word) => void;
  isDarkMode: boolean;
}

function WordItem({ word, isAdmin, onWordSelect, onWordEdit, isDarkMode }: WordItemProps) {
  const highlightColor = isDarkMode ? "#E7E4D8" : "#A30122";
  const accentColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  const textColor = isDarkMode ? "#E7E4D8" : "#474747";

  return (
    <View className="flex flex-row items-center py-2">
      {isAdmin && (
        <TouchableOpacity className="p-2 mr-2" onPress={() => onWordEdit(word)}>
          <Edit2 size={16} color={accentColor} />
        </TouchableOpacity>
      )}
      <TouchableOpacity className="flex-1" onPress={() => onWordSelect(word)}>
        <View className="flex flex-col ">
          <Text 
            className="font-bold text-base"
            style={{ color: highlightColor }}
          >
            {word.word}
          </Text>
          <Text 
            className="text-sm"
            style={{ color: textColor }}
          >
            {word.meaning}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
