import {
  StyleSheet,
  Text as ReactText,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ArrowLeft, Edit2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SearchInput } from "@/components/SearchInput";
import { useTexts } from "@/stores/TextsStore";
import { ThemedText } from "@/components/ThemedText";
import { FloatingAddButton } from "@/components/words/FloatingAddButton";
import { TextForm } from "@/components/texts/TextForm";
import { useAuth } from "@/stores/AuthStore";
import { useDictionary } from "@/stores/Dictionary";

interface Text {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  cover_url: string;
}

type ViewMode = "list" | "detail" | "form";

export default function TextsScreen() {
  const { fetchTexts, state, setTextInFocus } = useTexts();
  const { state: dictionaryState } = useDictionary();
  const { darkMode } = dictionaryState.settings;
  const isDarkMode = Boolean(darkMode);
  
  const { state: authState } = useAuth();
  const [filter, setFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingText, setEditingText] = useState<Text | null>(null);
  
  // Theme colors
  const textColor = isDarkMode ? "#E7E4D8" : "#212121";
  const subTextColor = isDarkMode ? "#e7e4d8d5" : "#474747";
  const contentTextColor = isDarkMode ? "#E7E4D8" : "#49454F"; 
  const highlightColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  const titleColor = isDarkMode ? "#E7E4D8" : "#A30122";
  const loaderColor = isDarkMode ? "#E7E4D8" : "#A30122";
  const headerBgColor = isDarkMode ? "#101d25" : "#A1CEDC";

  const isAdmin = Boolean(authState?.isAuthenticated);

  useEffect(() => {
    fetchTexts();
  }, []);

  // Determine current view mode based on state
  useEffect(() => {
    if (state.textInFocus) {
      setViewMode("detail");
    } else if (editingText !== null) {
      setViewMode("form");
    } else {
      setViewMode("list");
    }
  }, [state.textInFocus, editingText]);

  // Filter texts based on search input
  const getFilteredTexts = () => {
    if (!filter) return state.texts;

    return state.texts.filter(
      (text) =>
        text.title.toLowerCase().includes(filter.toLowerCase()) ||
        text.subtitle.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const filteredTexts = getFilteredTexts();

  const handleAddText = () => {
    setEditingText(null);
    setTextInFocus(null);
    setViewMode("form");
  };

  const handleEditText = (text: Text) => {
    setEditingText(text);
    setTextInFocus(null);
    setViewMode("form");
  };

  const handleBackToList = () => {
    setEditingText(null);
    setTextInFocus(null);
    setViewMode("list");
  };

  const handleTextFormSuccess = async () => {
    setEditingText(null);
    setViewMode("list");
    // Force a complete refresh of data after edits
    await fetchTexts();
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
        title="Textos"
      >
        <SearchInput
          value={filter}
          onChangeValue={setFilter}
          placeholder="Pesquise um texto"
          CustomInputContent={
            <CustomInputContent
              setTextInFocus={setTextInFocus}
              state={state}
              viewMode={viewMode}
              onBack={handleBackToList}
              editingText={editingText}
              isDarkMode={isDarkMode}
            />
          }
          condition={viewMode !== "list"}
        />

        {viewMode === "list" && (
          <View className="px-2 pt-2">
            <ThemedText
              style={{ color: textColor }}
              type="title"
            >
              Textos
            </ThemedText>
          </View>
        )}

        {state.isLoading ? (
          <View className="py-10 flex justify-center items-center">
            <ActivityIndicator size="large" color={loaderColor} />
            <ReactText className="mt-2 text-center" style={{ color: textColor }}>
              Carregando textos...
            </ReactText>
          </View>
        ) : (
          <>
            {viewMode === "list" && (
              <View className="mt-2">
                {filteredTexts.length > 0 ? (
                  <View className="px-1">
                    {filteredTexts.map((text) => (
                      <TextItem
                        key={text.id}
                        text={text}
                        isAdmin={isAdmin}
                        onTextSelect={setTextInFocus}
                        onTextEdit={handleEditText}
                        isDarkMode={isDarkMode}
                      />
                    ))}
                  </View>
                ) : (
                  <ReactText className="text-center py-4" style={{ color: textColor }}>
                    {filter
                      ? `Nenhum texto encontrado para "${filter}"`
                      : "Nenhum texto disponível"}
                  </ReactText>
                )}
              </View>
            )}

            {viewMode === "detail" && <SelectedText state={state} isDarkMode={isDarkMode} />}

            {viewMode === "form" && (
              <TextForm
                editingText={editingText}
                onSuccess={handleTextFormSuccess}
                onCancel={handleBackToList}
                isDarkMode={isDarkMode}
              />
            )}
          </>
        )}
      </ParallaxScrollView>

      {isAdmin && viewMode === "list" && (
        <FloatingAddButton onPress={handleAddText} isDarkMode={isDarkMode} />
      )}
    </>
  );
}

interface TextItemProps {
  text: Text;
  isAdmin: boolean;
  onTextSelect: (text: Text) => void;
  onTextEdit: (text: Text) => void;
  isDarkMode: boolean;
}

function TextItem({ text, isAdmin, onTextSelect, onTextEdit, isDarkMode }: TextItemProps) {
  const titleColor = isDarkMode ? "#E7E4D8" : "#A30122";
  const subtitleColor = isDarkMode ? "#E7E4D8" : "#474747";
  const highlightColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  const borderColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  
  return (
    <View 
      className="mb-4 border-[1px] rounded-xl overflow-hidden flex flex-row min-h-[80px] max-h-[80px]"
      style={{ borderColor }}
    >
      <View className="p-3 bg-transparent w-[78%] flex flex-row">
        <TouchableOpacity className="flex-1" onPress={() => onTextSelect(text)}>
          <ReactText 
            className="font-bold text-lg overflow-hidden truncate text-ellipsis"
            style={{ color: titleColor }}
          >
            {text?.title}
          </ReactText>
          {text?.subtitle && (
            <ReactText 
              className="text-sm mt-1"
              style={{ color: subtitleColor }}
            >
              {text?.subtitle}
            </ReactText>
          )}
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            className="p-2 self-center"
            onPress={() => onTextEdit(text)}
          >
            <Edit2 size={16} color={highlightColor} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        className="w-[22%] h-full"
        onPress={() => onTextSelect(text)}
      >
        {text?.cover_url && (
          <Image
            source={{ uri: text?.cover_url }}
            style={{ height: "100%", width: "100%" }}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>
    </View>
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

interface SelectedTextProps {
  state: any;
  isDarkMode: boolean;
}

function SelectedText({ state, isDarkMode }: SelectedTextProps) {
  const titleColor = isDarkMode ? "#E7E4D8" : "#212121";
  const subtitleColor = isDarkMode ? "#e7e4d8d5" : "#474747";
  const contentColor = isDarkMode ? "#E7E4D8" : "#49454F";
  const borderColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  
  return (
    <View 
      className="border-[1px] rounded-xl"
      style={{ borderColor }}
    >
      {state?.textInFocus?.cover_url && (
        <Image
          source={{ uri: state?.textInFocus?.cover_url || "" }}
          style={{
            width: "100%",
            height: 200,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
          resizeMode="cover"
        />
      )}

      <View className="py-4 px-3 rounded-xl">
        <ReactText 
          className="text-xl font-bold mb-1"
          style={{ color: titleColor }}
        >
          {state?.textInFocus?.title}
        </ReactText>

        {state?.textInFocus?.subtitle && (
          <ReactText 
            className="text-base font-medium mb-4"
            style={{ color: subtitleColor }}
          >
            {state?.textInFocus?.subtitle}
          </ReactText>
        )}

        <ReactText 
          className="text-base leading-relaxed whitespace-pre-line"
          style={{ color: contentColor }}
        >
          {state?.textInFocus?.content}
        </ReactText>
      </View>
    </View>
  );
}

interface CustomInputContentProps {
  setTextInFocus: (text: Text | null) => void;
  state: any;
  viewMode: ViewMode;
  onBack: () => void;
  editingText: Text | null;
  isDarkMode: boolean;
}

function CustomInputContent({
  setTextInFocus,
  state,
  viewMode,
  onBack,
  editingText,
  isDarkMode,
}: CustomInputContentProps) {
  const textColor = isDarkMode ? "#E7E4D8" : "#212121";
  
  const getTitle = () => {
    if (viewMode === "detail" && state.textInFocus) {
      return state.textInFocus.title;
    }
    if (viewMode === "form") {
      return editingText ? "Editar texto" : "Cadastrar texto";
    }
    return "Textos";
  };

  const handleBack = () => {
    if (viewMode === "detail") {
      setTextInFocus(null);
    } else {
      onBack();
    }
  };

  return (
    <View className="flex flex-row w-full items-center justify-between">
      <View className="flex-1 text-center ml-6">
        <ReactText 
          className="text-xl font-bold overflow-hidden truncate text-ellipsis"
          style={{ color: textColor }}
        >
          {getTitle()}
        </ReactText>
      </View>
      <TouchableOpacity
        className="mr-5 pr-2 flex gap-1 flex-row items-center justify-center"
        onPress={handleBack}
      >
        <ArrowLeft size={17} color={textColor} />
        <ReactText style={{ color: textColor }}>Voltar</ReactText>
      </TouchableOpacity>
    </View>
  );
}
