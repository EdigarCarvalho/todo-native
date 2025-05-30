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
import { ThemedText } from "@/components/ThemedText";

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

      {!state.textInFocus && (
        <View className="px-2 pt-1">
          <ThemedText style={{ color: "#212121" }} type="title">
            Textos
          </ThemedText>
        </View>
      )}

      {state.isLoading ? (
        <View className="py-10 flex justify-center items-center">
          <ActivityIndicator size="large" color="#A30122" />
          <Text className="mt-2 text-center">Carregando textos...</Text>
        </View>
      ) : !state.textInFocus ? (
        <View className="mt-2">
          {/* {state.lastApiFetch && (
            <Text className="text-xs text-center text-gray-500 mb-2">
              Última atualização:{" "}
              {new Date(state.lastApiFetch).toLocaleString()}
            </Text>
          )} */}

          {filteredTexts.length > 0 ? (
            <View className="px-1">
              {filteredTexts.map((text) => (
                <TouchableOpacity
                  key={text.id}
                  className="mb-4 border-[#C74B0B] border-[1px] rounded-xl overflow-hidden flex flex-row min-h-[80px] max-h-[80px] items-center"
                  onPress={() => setTextInFocus(text)}
                >
                  <View
                    className={`p-3 ${state?.textInFocus?.id === text?.id ? "bg-[#FBF0E8]" : "bg-white"}  w-[78%]`}
                  >
                    <Text className="font-bold text-lg text-[#A30122] overflow-hidden truncate text-ellipsis">
                      {text.title}
                    </Text>
                    {text.subtitle && (
                      <Text className="text-sm text-[#474747] mt-1">
                        {text.subtitle}
                      </Text>
                    )}
                  </View>
                  {text.cover_url && (
                    <Image
                      source={{ uri: text.cover_url }}
                      style={{ height: "100%", width: "22%" }}
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text className="text-center py-4">
              {filter
                ? `Nenhum texto encontrado para "${filter}"`
                : "Nenhum texto disponível"}
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
    <View className=" border-[#C74B0B] border-[1px] rounded-xl">
      {state.textInFocus.cover_url && (
        <Image
          source={{ uri: state.textInFocus.cover_url }}
          style={{
            width: "100%",
            height: 200,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
          }}
          resizeMode="cover"
        />
      )}

      <View className="py-4  px-3  rounded-xl">
        <Text className="text-xl font-bold text-[#212121] mb-1">
          {state.textInFocus.title}
        </Text>

        {state.textInFocus.subtitle && (
          <Text className="text-base font-medium  text-[#474747] mb-4">
            {state.textInFocus.subtitle}
          </Text>
        )}

        <Text className="text-base text-[#49454F] leading-relaxed whitespace-pre-line">
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
        <Text className="text-xl font-bold overflow-hidden truncate text-ellipsis">
          {state.textInFocus.title}
        </Text>
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
