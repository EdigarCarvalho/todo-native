import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ArrowLeft, ChevronDownIcon, ChevronUpIcon, Edit2, Plus, Paperclip, X } from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";
import { useAuth } from "@/stores/AuthStore";
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
import { SearchInput } from "@/components/SearchInput";
import { ThemedText } from "@/components/ThemedText";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from "@/components/ui/select";
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import apiService from "@/services/ApiService";

interface Word {
  id: number;
  word: string;
  meaning: string;
  attachments: any[];
}

export default function HomeScreen() {
  const { fetchData, state, setWordInFocus } = useDictionary();
  const { state: authState } = useAuth();
  const [filter, setFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [wordName, setWordName] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [wordMeaning, setWordMeaning] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const isAdmin = authState?.isAuthenticated || false;

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

  const openAddModal = () => {
    setEditingWord(null);
    setWordName("");
    setWordTranslation("");
    setWordMeaning("");
    setSelectedCategory("");
    setAttachments([]);
    setIsModalOpen(true);
  };

  const openEditModal = (word: Word) => {
    setEditingWord(word);
    setWordName(word.word);
    setWordTranslation(word.meaning); // Assuming meaning is the translation
    setWordMeaning(word.meaning);
    setSelectedCategory(""); // Would need category info from word
    setAttachments([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
    setWordName("");
    setWordTranslation("");
    setWordMeaning("");
    setSelectedCategory("");
    setAttachments([]);
  };

  const handleSubmit = async () => {
    if (!wordName.trim() || !wordTranslation.trim() || !selectedCategory) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>Por favor, preencha todos os campos obrigatórios</ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (editingWord) {
        result = await apiService.updateWord(editingWord.id, {
          name: wordName.trim(),
          meaning: wordTranslation.trim()
        });
      } else {
        result = await apiService.createWord({
          name: wordName.trim(),
          meaning: wordTranslation.trim(),
          category_id: parseInt(selectedCategory),
          attachments
        });
      }

      if (result.success) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>Sucesso</ToastTitle>
              <ToastDescription>
                Palavra {editingWord ? "atualizada" : "criada"} com sucesso!
              </ToastDescription>
            </Toast>
          ),
        });
        
        closeModal();
        await fetchData();
      } else {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>
                {result.error || `Falha ao ${editingWord ? "atualizar" : "criar"} palavra`}
              </ToastDescription>
            </Toast>
          ),
        });
      }
    } catch (error) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>Erro de conexão. Tente novamente.</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <CustomInputContent setWordInFocus={setWordInFocus} state={state} />
          }
          condition={!!state?.wordInFocus}
        />

        {!state.wordInFocus && (
          <View className="px-2 pt-1">
            <ThemedText style={{ color: "#212121" }} type="title">
              Dicionário
            </ThemedText>
          </View>
        )}

        {state.isLoading ? (
          <View className="py-10 flex justify-center items-center">
            <ActivityIndicator size="large" color="#A30122" />
            <Text className="mt-2 text-center">
              Carregando dados do dicionário...
            </Text>
          </View>
        ) : !state.wordInFocus ? (
          <View className="mt-1">
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
                          <View key={word.id} className="flex flex-row items-center py-2">
                            {isAdmin && (
                              <TouchableOpacity
                                className="p-2 mr-2"
                                onPress={() => openEditModal(word)}
                              >
                                <Edit2 size={16} color="#DC6803" />
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              className="flex-1"
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
                          </View>
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

        {/* Floating Add Button - Only for Admin */}
      
      </ParallaxScrollView>

      {/* Modal for Add/Edit Word */}
      <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
        <ModalBackdrop />
        <ModalContent className="bg-white max-h-[90%]">
          <ModalHeader className="text-center">
            <Text className="text-lg font-bold text-[#212121] mx-auto text-center">
              {editingWord ? "Editar palavra" : "Cadastrar palavra"}
            </Text>
          </ModalHeader>
          
          <ModalBody className="py-6">
            <View className="space-y-4">
              <Input className="border-[#DC6803] border-2" label="Insira a palavra" size="xl">
                <InputField
                  value={wordName}
                  onChangeText={setWordName}
                  placeholder="Digite a palavra"
                />
              </Input>

              <Input className="border-[#DC6803] border-2" label="Insira a tradução" size="xl">
                <InputField
                  value={wordTranslation}
                  onChangeText={setWordTranslation}
                  placeholder="Digite a tradução"
                />
              </Input>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Escolha a categoria</Text>
                <Select selectedValue={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger variant="outline" size="xl" className="border-[#DC6803] border-2">
                    <SelectInput placeholder="Selecione uma categoria" />
                    <SelectIcon className="mr-3" />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {state.categories.map((category) => (
                        <SelectItem key={category.id} label={category.name} value={category.id.toString()} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </View>

              <Input className="border-[#DC6803] border-2" label="Significado (opcional)" size="xl">
                <InputField
                  value={wordMeaning}
                  onChangeText={setWordMeaning}
                  placeholder="Digite o significado"
                  multiline
                  numberOfLines={3}
                />
              </Input>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Anexos</Text>
                <TouchableOpacity className="border-2 border-dashed border-[#DC6803] rounded-lg p-4 flex flex-row items-center justify-center">
                  <Paperclip size={20} color="#DC6803" />
                  <Text className="ml-2 text-[#DC6803]">Adicionar arquivos</Text>
                </TouchableOpacity>
                {attachments.length > 0 && (
                  <View className="mt-2">
                    {attachments.map((file, index) => (
                      <View key={index} className="flex flex-row items-center justify-between p-2 bg-gray-100 rounded mb-1">
                        <Text className="flex-1 text-sm">{file.name}</Text>
                        <TouchableOpacity onPress={() => {
                          setAttachments(attachments.filter((_, i) => i !== index));
                        }}>
                          <X size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ModalBody>
          
          <ModalFooter className="flex flex-row gap-3">
            <Button
              className="flex-1 bg-white border-[#DC6803] border-2"
              onPress={closeModal}
              disabled={isSubmitting}
            >
              <ButtonText className="text-[#DC6803] font-bold">Cancelar</ButtonText>
            </Button>
            
            <Button
              className="flex-1 bg-[#DC6803]"
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <ButtonText className="text-white font-bold">
                {isSubmitting 
                  ? (editingWord ? "Salvando..." : "Adicionando...") 
                  : (editingWord ? "Salvar" : "Adicionar palavra")
                }
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {isAdmin && !state.wordInFocus && (
          <TouchableOpacity
            className="absolute bottom-6 right-6 w-14 h-14 bg-[#DC6803] rounded-2xl flex items-center justify-center shadow-lg"
            onPress={openAddModal}
            style={styles.floatingButton}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        )}
    </>
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
  floatingButton: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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

interface CustomInputContentProps {
  setWordInFocus: any;
  state: any;
}

function CustomInputContent({
  setWordInFocus,
  state,
}: CustomInputContentProps) {
  return (
    <View className="flex flex-row w-full items-center justify-between">
      <View className="flex-1 text-center ml-6">
        <Text className="text-xl font-bold">{state.wordInFocus.word}</Text>
      </View>
      <TouchableOpacity
        className="mr-5 pr-2 flex  gap-1 flex-row items-center justify-center"
        onPress={() => setWordInFocus(null)}
      >
        <ArrowLeft size={17} />
        <Text className="flex">Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
