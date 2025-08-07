import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";

interface Word {
  id: number;
  word: string;
  meaning: string;
  attachments: any[];
}

interface CustomInputContentProps {
  setWordInFocus: (word: Word | null) => void;
  state: any;
  viewMode: 'list' | 'detail' | 'form';
  onBack: () => void;
  editingWord: Word | null;
}

export function CustomInputContent({
  setWordInFocus,
  state,
  viewMode,
  onBack,
  editingWord
}: CustomInputContentProps) {
  const { state: dictionaryState } = useDictionary();
  const { darkMode } = dictionaryState.settings;
  const isDarkMode = Boolean(darkMode);
  
  // Theme colors
  const textColor = isDarkMode ? "#E7E4D8" : "#212121";
  
  const getTitle = () => {
    if (viewMode === 'detail' && state.wordInFocus) {
      return state.wordInFocus.word;
    }
    if (viewMode === 'form') {
      return editingWord ? "Editar palavra" : "Cadastrar palavra";
    }
    return "Dicionário";
  };

  const handleBack = () => {
    if (viewMode === 'detail') {
      setWordInFocus(null);
    } else {
      onBack();
    }
  };

  return (
    <View className="flex flex-row w-full items-center justify-between">
      <View className="flex-1 text-center ml-6">
        <Text 
          className="text-xl font-bold overflow-hidden truncate text-ellipsis"
          style={{ color: textColor }}
        >
          {getTitle()}
        </Text>
      </View>
      <TouchableOpacity
        className="mr-5 pr-2 flex gap-1 flex-row items-center justify-center"
        onPress={handleBack}
      >
        <ArrowLeft size={17} color={textColor} />
        <Text style={{ color: textColor }}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
