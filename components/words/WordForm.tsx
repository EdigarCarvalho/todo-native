import React, { useState, useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Paperclip, X } from "lucide-react-native";
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
import apiService from "@/services/ApiService";
import { ThemedText } from "../ThemedText";

interface Word {
  id: number;
  word: string;
  meaning: string;
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
}

export function WordForm({
  editingWord,
  categories,
  onSuccess,
  onCancel,
}: WordFormProps) {
  const [wordName, setWordName] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [wordMeaning, setWordMeaning] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Initialize form data when editingWord changes
  useEffect(() => {
    if (editingWord) {
      setWordName(editingWord.word || "");
      setWordTranslation(editingWord.meaning || "");
      setWordMeaning(editingWord.meaning || "");

      console.log("Editing word with category info:", editingWord);
      
      // Set the category based on categoryId or category object
      const categoryId = editingWord.categoryId || editingWord.category?.id;
      console.log("Category ID found:", categoryId);
      
      setSelectedCategory(categoryId ? categoryId.toString() : "");
    } else {
      setWordName("");
      setWordTranslation("");
      setWordMeaning("");
      setSelectedCategory("");
    }
    setAttachments([]);
  }, [editingWord]);

  const handleSubmit = async () => {
    if (!wordName.trim() || !wordTranslation.trim() || !selectedCategory) {
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
        // Include category_id in the update payload
        result = await apiService.updateWord(editingWord.id, {
          name: wordName.trim(),
          meaning: wordTranslation.trim(),
          category_id: parseInt(selectedCategory),
        });
      } else {
        result = await apiService.createWord({
          name: wordName.trim(),
          meaning: wordTranslation.trim(),
          category_id: parseInt(selectedCategory),
          attachments,
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

  return (
    <View className="py-1 px-2">
      <View className=" px-3">
        <View className="flex justify-center text-center mb-5">
          <ThemedText
            style={{ color: "#C74B0B", textAlign: "center" }}
            type="title"
          >
            {editingWord ? "Editar palavra" : "Cadastrar palavra"}
          </ThemedText>
        </View>

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
            label="Insira a tradução"
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
                  value={selectedCategory ? 
                    categories.find(cat => cat.id.toString() === selectedCategory)?.name || ""
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

          <Input
            className="border-[#C74B0B] border-2 "
            label="Significado (opcional)"
            size="xl"
          >
            <InputField 
              value={wordMeaning}
              onChangeText={setWordMeaning}
              multiline
              numberOfLines={3}
            />
          </Input>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Anexos
            </Text>
            <TouchableOpacity className="border-2 border-dashed border-[#C74B0B] rounded-lg p-4 flex flex-row items-center justify-center">
              <Paperclip size={20} color="#C74B0B" />
              <Text className="ml-2 text-[#C74B0B]">Adicionar arquivos</Text>
            </TouchableOpacity>
            {attachments.length > 0 && (
              <View className="mt-2">
                {attachments.map((file, index) => (
                  <View
                    key={index}
                    className="flex flex-row items-center justify-between p-2 bg-gray-100 rounded mb-1"
                  >
                    <Text className="flex-1 text-sm">{file.name}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setAttachments(
                          attachments.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <X size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="flex flex-row gap-3">
            <Button
              className="flex-1 bg-white border-[#C74B0B] border-2"
              onPress={onCancel}
              disabled={isSubmitting}
            >
              <ButtonText className="text-[#C74B0B] font-bold">
                Cancelar
              </ButtonText>
            </Button>

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
                    : "Adicionar palavra"}
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
