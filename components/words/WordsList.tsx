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
}

export function WordsList({ 
  state, 
  filter, 
  isAdmin, 
  onWordSelect, 
  onWordEdit 
}: WordsListProps) {
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
      (category: Category) => getFilteredWords(category.id.toString()).length > 0
    );
  };

  if (state.categories.length === 0) {
    return (
      <Text className="text-center py-4">
        Nenhuma categoria encontrada
      </Text>
    );
  }

  return (
    <View className="mt-1">
      {state.categories.map((category: Category) => {
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
                {filteredWords.map((word: Word) => (
                  <WordItem
                    key={word.id}
                    word={word}
                    isAdmin={isAdmin}
                    onWordSelect={onWordSelect}
                    onWordEdit={onWordEdit}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
            <Divider />
          </Accordion>
        );
      })}

      {filter && !hasFilteredWords() && (
        <Text className="text-center py-4">
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
}

function WordItem({ word, isAdmin, onWordSelect, onWordEdit }: WordItemProps) {
  return (
    <View className="flex flex-row items-center py-2">
      {isAdmin && (
        <TouchableOpacity
          className="p-2 mr-2"
          onPress={() => onWordEdit(word)}
        >
          <Edit2 size={16} color="#C74B0B" />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        className="flex-1"
        onPress={() => onWordSelect(word)}
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
    </View>
  );
}
