import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Divider } from "@/components/ui/divider";
import { SearchInput } from "@/components/SearchInput";
import { useTexts } from "@/stores/TextsStore";

export default function TextsScreen() {
  const { fetchTexts, state, setTextInFocus } = useTexts();
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetchTexts();
  }, []);

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Textos"
    >
      <SearchInput
        value={filter}
        onChangeValue={setFilter}
        CustomInputContent={
          <CustomInputContent setTextInFocus={setTextInFocus} state={state} />
        }
        condition={!!state?.textInFocus}
      />

      {state.isLoading ? (
        <View className="py-10 flex justify-center items-center">
          <ActivityIndicator size="large" color="#A30122" />
          <Text className="mt-2 text-center">
            Carregando textos...
          </Text>
        </View>
      ) : !state.textInFocus ? (
        <View className="mt-4">
          {state.lastApiFetch && (
            <Text className="text-xs text-center text-gray-500 mb-2">
              Última atualização:{" "}
              {new Date(state.lastApiFetch).toLocaleString()}
            </Text>
          )}

          {filteredTexts.length > 0 ? (
            <View className="px-4">
              {filteredTexts.map((text) => (
                <TouchableOpacity
                  key={text.id}
                  className="mb-4 border-[#A30122] border-[1px] rounded-xl overflow-hidden"
                  onPress={() => setTextInFocus(text)}
                >
                  {text.cover_url && (
                    <Image
                      source={{ uri: text.cover_url }}
                      style={{ width: "100%", height: 150 }}
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-3 bg-[#FBF0E8]">
                    <Text className="font-bold text-lg text-[#A30122]">
                      {text.title}
                    </Text>
                    {text.subtitle && (
                      <Text className="text-sm text-[#474747] mt-1">
                        {text.subtitle}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className="text-center py-4">
              {filter ? `Nenhum texto encontrado para "${filter}"` : "Nenhum texto disponível"}
            </Text>
          )}
        </View>
      ) : (
        <SelectedText state={state} />
      )}
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

interface SelectedTextProps {
  state: any;
}

function SelectedText({ state }: SelectedTextProps) {
  return (
    <View className="py-1 px-4">
      {state.textInFocus.cover_url && (
        <Image
          source={{ uri: state.textInFocus.cover_url }}
          style={{ width: "100%", height: 200, borderRadius: 8 }}
          resizeMode="cover"
        />
      )}
      
      <View className="py-4 mt-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] rounded-xl">
        <Text className="text-xl font-bold text-[#A30122] mb-2">
          {state.textInFocus.title}
        </Text>
        
        {state.textInFocus.subtitle && (
          <Text className="text-base font-medium text-[#474747] mb-4">
            {state.textInFocus.subtitle}
          </Text>
        )}
        
        <Divider className="mb-4" />
        
        <Text className="text-base leading-relaxed whitespace-pre-line">
          {state.textInFocus.content}
        </Text>
      </View>
    </View>
  );
}

interface CustomInputContentProps {
  setTextInFocus: any;
  state: any;
}

function CustomInputContent({
  setTextInFocus,
  state,
}: CustomInputContentProps) {
  return (
    <View className="flex flex-row w-full items-center justify-between">
      <View className="flex-1 text-center ml-6">
        <Text className="text-xl font-bold">{state.textInFocus.title}</Text>
      </View>
      <TouchableOpacity
        className="mr-5 pr-2 flex gap-1 flex-row items-center justify-center"
        onPress={() => setTextInFocus(null)}
      >
        <ArrowLeft size={17} />
        <Text className="flex">Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
