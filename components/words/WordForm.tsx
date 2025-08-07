import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { Paperclip, X, Upload } from "lucide-react-native";
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
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import apiService, { RNFile } from "@/services/ApiService";
import { ThemedText } from "../ThemedText";
import { useDictionary } from "@/stores/Dictionary";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import { useColorScheme } from "@/hooks/useThemeColor";

interface Word {
  id: number;
  word: string;
  meaning: string;
  translation?: string; // Add translation field
  categoryId?: number;
  category?: Category;
  attachments: any[];
}

interface Category {
  id: number;
  name: string;
}

interface WordFormProps {
  editingWord: Word | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
  isDarkMode?: boolean;
}

export function WordForm({
  editingWord,
  categories,
  onSuccess,
  onCancel,
  isDarkMode = false
}: WordFormProps) {
  const [wordName, setWordName] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [wordMeaning, setWordMeaning] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [attachments, setAttachments] = useState<RNFile[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const { deleteWord } = useDictionary();
  const theme = useColorScheme();

  // Theme colors
  const textColor = isDarkMode ? "#E7E4D8" : "#212121";
  const accentColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  const bgColor = isDarkMode ? "#3E1C00" : "#f9f9f9";
  const borderColor = isDarkMode ? "#eb5a12" : "#C74B0B";

  useEffect(() => {
    if (editingWord) {
      setWordName(editingWord.word || "");
      setWordMeaning(editingWord.meaning || "");
      setWordTranslation(editingWord.translation || ""); // Correctly initialize translation

      console.log("Editing word with category info:", editingWord);

      // Set the category based on categoryId or category object
      const categoryId = editingWord.categoryId || editingWord.category?.id;
      console.log("Category ID found:", categoryId);

      setSelectedCategory(categoryId ? categoryId.toString() : "");

      // Set attachments previews from existing word attachments
      if (editingWord.attachments && editingWord.attachments.length > 0) {
        const previews = editingWord.attachments.map(
          (attachment) => attachment.url
        );
        setAttachmentPreviews(previews);
      } else {
        setAttachmentPreviews([]);
      }
    } else {
      setWordName("");
      setWordMeaning("");
      setWordTranslation("");
      setSelectedCategory("");
      setAttachmentPreviews([]);
    }
    setAttachments([]);
  }, [editingWord]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true, // Request base64 data
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];

      // Determine if we have a data URI or a file URI
      let uri = selectedAsset.uri;
      let type = selectedAsset.mimeType || "image/jpeg";
      let name = "attachment.jpg";

      // If we have base64 data but not a data URI, create one
      if (selectedAsset.base64 && !uri.startsWith("data:")) {
        uri = `data:${type};base64,${selectedAsset.base64}`;
      }

      // If it's a file URI, try to get the extension for the filename
      if (!uri.startsWith("data:")) {
        const uriParts = uri.split(".");
        const fileExtension = uriParts[uriParts.length - 1];
        if (fileExtension) {
          name = `attachment.${fileExtension}`;
        }
      } else {
        // For data URIs, extract the extension from mime type
        const ext = type.split("/")[1] || "jpg";
        name = `attachment.${ext}`;
      }

      // Create a proper RNFile object
      const file: RNFile = {
        uri,
        type,
        name,
      };

      console.log("Selected image file:", {
        uri: uri.substring(0, 30) + "...", // Trim URI for logging
        type,
        name,
      });

      // Add to attachments and previews
      setAttachments([...attachments, file]);
      setAttachmentPreviews([...attachmentPreviews, uri]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setAttachmentPreviews(attachmentPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!wordName.trim() || !wordMeaning.trim() || !selectedCategory) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>
              Por favor, preencha todos os campos obrigatórios
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (editingWord) {
        // First update the word details
        result = await apiService.updateWord(editingWord.id, {
          name: wordName.trim(),
          meaning: wordMeaning.trim(),
          translation: wordTranslation.trim(),
          category_id: parseInt(selectedCategory),
        });

        // Then handle attachments if there are any new ones
        if (attachments.length > 0) {
          console.log(
            `Adding ${attachments.length} attachments to word ${editingWord.id}`
          );
          const attachmentResult = await apiService.addWordAttachment(
            editingWord.id,
            attachments
          );

          if (!attachmentResult.success) {
            console.error("Failed to add attachments:", attachmentResult.error);
            toast.show({
              placement: "top",
              render: ({ id }) => (
                <Toast
                  nativeID={`toast-${id}`}
                  action="warning"
                  variant="solid"
                >
                  <ToastTitle>Atenção</ToastTitle>
                  <ToastDescription>
                    Palavra atualizada, mas houve um problema ao adicionar
                    imagens.
                  </ToastDescription>
                </Toast>
              ),
            });
          }
        }
      } else {
        // For new words, create with all data including attachments in one request
        console.log("Creating new word with attachments:", attachments.length);
        result = await apiService.createWord({
          name: wordName.trim(),
          meaning: wordMeaning.trim(),
          translation: wordTranslation.trim(),
          category_id: parseInt(selectedCategory),
          attachments: attachments,
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

        onSuccess();
      } else {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>
                {result.error ||
                  `Falha ao ${editingWord ? "atualizar" : "criar"} palavra`}
              </ToastDescription>
            </Toast>
          ),
        });
      }
    } catch (error) {
      console.error("Error in word submission:", error);
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>
              Erro de conexão. Tente novamente.
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingWord) return;

    setIsDeleting(true);
    try {
      const success = await deleteWord(editingWord.id);

      if (success) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>Sucesso</ToastTitle>
              <ToastDescription>Palavra excluída com sucesso!</ToastDescription>
            </Toast>
          ),
        });
        onSuccess();
      } else {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>Falha ao excluir palavra</ToastDescription>
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
            <ToastDescription>
              Erro de conexão. Tente novamente.
            </ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <View className="py-1 px-2">
        <View className="px-3">
          <View className="flex justify-center text-center mb-5">
            <ThemedText
              style={{ color: accentColor, textAlign: "center" }}
              type="title"
            >
              {editingWord ? "Editar palavra" : "Cadastrar palavra"}
            </ThemedText>
          </View>

          {/* Form fields with inline styles */}
          <View className="space-y-4 flex flex-col gap-2">
            <Input
              className="border-[#C74B0B] border-2 "
              label="Insira a palavra"
              size="xl"
            >
              <InputField value={wordName} onChangeText={setWordName} />
            </Input>

            <Input
              className="border-[#C74B0B] border-2 "
              label="Insira o significado"
              size="xl"
            >
              <InputField value={wordMeaning} onChangeText={setWordMeaning} />
            </Input>

            <Input
              className="border-[#C74B0B] border-2 "
              label="Insira a tradução (opcional)"
              size="xl"
            >
              <InputField
                value={wordTranslation}
                onChangeText={setWordTranslation}
              />
            </Input>

            <View className="">
              <Select
                selectedValue={selectedCategory}
                onValueChange={setSelectedCategory}
                label="Escolha a categoria"
              >
                <SelectTrigger
                  variant="outline"
                  size="xl"
                  className="border-[#C74B0B] border-2"
                >
                  <SelectInput
                    value={
                      selectedCategory
                        ? categories.find(
                            (cat) => cat.id.toString() === selectedCategory
                          )?.name || ""
                        : ""
                    }
                    editable={false}
                  />
                  <SelectIcon className="mr-3" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        label={category.name}
                        value={category.id.toString()}
                      />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>

            {/* Updated Attachments UI */}
            <View className="relative">
              <View
                className="border-dashed border-2 rounded p-2 min-h-[80px]"
                style={{ borderColor }}
              >
                {attachmentPreviews.length > 0 ? (
                  <View className="flex flex-row flex-wrap">
                    {attachmentPreviews.map((preview, index) => (
                      <View key={index} className="relative w-1/3 p-1">
                        <Image
                          source={{ uri: preview }}
                          className="w-full h-24 rounded"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                          onPress={() => removeAttachment(index)}
                        >
                          <X size={16} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity
                      className="w-1/3 h-24 p-1"
                      onPress={pickImage}
                    >
                      <View
                        className="border-2 border-dashed rounded h-full flex items-center justify-center"
                        style={{ borderColor }}
                      >
                        <Upload size={20} color={accentColor} />
                        <Text
                          style={{
                            fontSize: 12,
                            color: accentColor,
                            marginTop: 4,
                          }}
                        >
                          Adicionar
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="rounded p-4 flex flex-row items-center justify-center h-[60px]"
                    onPress={pickImage}
                  >
                    <Upload size={20} color={accentColor} />
                    <Text style={{ marginLeft: 8, color: accentColor }}>
                      Adicionar imagens
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text
                className="absolute -top-3 left-4 px-2 font-medium text-sm"
                style={{ backgroundColor: bgColor, color: textColor }}
              >
                Imagens
              </Text>
            </View>

            <View className="flex flex-row gap-3">
              {editingWord ? (
                <Button
                  className="flex-1 bg-white border-red-500 border-2"
                  onPress={() => setIsDeleteModalOpen(true)}
                  disabled={isSubmitting}
                >
                  <ButtonText className="text-red-500 font-bold">
                    Deletar
                  </ButtonText>
                </Button>
              ) : (
                <Button
                  className="flex-1 bg-white border-[#C74B0B] border-2"
                  onPress={onCancel}
                  disabled={isSubmitting}
                >
                  <ButtonText className="text-[#C74B0B] font-bold">
                    Cancelar
                  </ButtonText>
                </Button>
              )}

              <Button
                className="flex-1 bg-[#C74B0B]"
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <ButtonText className="text-white font-bold">
                  {isSubmitting
                    ? editingWord
                      ? "Salvando..."
                      : "Adicionando..."
                    : editingWord
                      ? "Salvar"
                      : "Adicionar"}
                </ButtonText>
              </Button>
            </View>
          </View>
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader className="text-center">
            <Text className="text-lg font-bold text-[#212121] mx-auto text-center">
              Tem certeza que deseja excluir a palavra?
            </Text>
          </ModalHeader>

          <ModalBody className="py-2">
            <Text className="text-center text-gray-700">
              Esta ação não pode ser desfeita.
            </Text>
          </ModalBody>

          <ModalFooter className="flex flex-row gap-3">
            <Button
              className="flex-1 bg-white border-[#C74B0B] border-2"
              onPress={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              <ButtonText className="text-[#C74B0B] font-bold">
                Cancelar
              </ButtonText>
            </Button>

            <Button
              className="flex-1 bg-red-500"
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <ButtonText className="text-white font-bold">
                {isDeleting ? "Excluindo..." : "Excluir"}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
