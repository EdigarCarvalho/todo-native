import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useDictionary } from "@/stores/Dictionary";
import { useAuth } from "@/stores/AuthStore";
import { SearchInput } from "@/components/SearchInput";
import { ThemedText } from "@/components/ThemedText";
import { WordsList } from "@/components/words/WordsList";
import { SelectedWord } from "@/components/words/SelectedWord";
import { WordForm } from "@/components/words/WordForm";
import { CustomInputContent } from "@/components/words/CustomInputContent";
import { FloatingAddButton } from "@/components/words/FloatingAddButton";

interface Word {
  id: number;
  word: string;
  meaning: string;
  attachments: any[];
}

type ViewMode = "list" | "detail" | "form";

export default function HomeScreen() {
  const { fetchData, state, setWordInFocus } = useDictionary();
  const { state: authState } = useAuth();
  const [filter, setFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  const isAdmin = Boolean(authState?.isAuthenticated);

  useEffect(() => {
    fetchData();
  }, []);

  // Determine current view mode based on state
  useEffect(() => {
    if (state.wordInFocus) {
      setViewMode("detail");
    } else if (editingWord !== null) {
      setViewMode("form");
    } else {
      setViewMode("list");
    }
  }, [state.wordInFocus, editingWord]);

  const handleAddWord = () => {
    setEditingWord(null);
    setWordInFocus(null);
    setViewMode("form");
  };

  const handleEditWord = (word: Word & {
    categoryId?: number;
    category?: { id: number; name: string };
  }) => {
    // Find which category this word belongs to
    let wordWithCategory = { ...word };
    
    // Search through wordsByCategory to find the category
    Object.entries(state.wordsByCategory).forEach(([categoryId, words]) => {
      const foundWord = words.find(w => w.id === word.id);
      if (foundWord) {
        wordWithCategory.categoryId = parseInt(categoryId);
        // Also find the category object
        const category = state.categories.find(cat => cat.id === parseInt(categoryId));
        if (category) {
          wordWithCategory.category = category;
        }
      }
    });
    
    setEditingWord(wordWithCategory);
    setWordInFocus(null);
    setViewMode("form");
  };

  const handleBackToList = () => {
    setEditingWord(null);
    setWordInFocus(null);
    setViewMode("list");
  };

  const handleWordFormSuccess = async () => {
    setEditingWord(null);
    setViewMode("list");
    await fetchData();
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "inherit", dark: "inherit" }}
        title=""
      >
        <SearchInput
          value={filter}
          onChangeValue={setFilter}
          CustomInputContent={
            <CustomInputContent
              setWordInFocus={setWordInFocus}
              state={state}
              viewMode={viewMode}
              onBack={handleBackToList}
              editingWord={editingWord}
            />
          }
          condition={viewMode !== "list"}
        />

        {viewMode === "list" && (
          <View className="px-2 pt-1">
            <ThemedText style={{ color: "#212121" }} type="title">
              Dicionário
            </ThemedText>
          </View>
        )}

        {state.isLoading ? (
          <LoadingView />
        ) : (
          <>
            {viewMode === "list" && (
              <WordsList
                state={state}
                filter={filter}
                isAdmin={isAdmin}
                onWordSelect={setWordInFocus}
                onWordEdit={handleEditWord}
              />
            )}

            {viewMode === "detail" && <SelectedWord state={state} />}

            {viewMode === "form" && (
              <WordForm
                editingWord={editingWord}
                categories={state.categories}
                onSuccess={handleWordFormSuccess}
                onCancel={handleBackToList}
              />
            )}

            {/* Floating Add Button - Only for Admin in list view */}
          </>
        )}
      </ParallaxScrollView>

      {isAdmin && viewMode === "list" && (
        <FloatingAddButton onPress={handleAddWord} />
      )}
    </>
  );
}

// Loading component
function LoadingView() {
  return (
    <View className="py-10 flex justify-center items-center">
      <ActivityIndicator size="large" color="#A30122" />
      <Text className="mt-2 text-center">
        Carregando dados do dicionário...
      </Text>
    </View>
  );
}
