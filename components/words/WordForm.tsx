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
import { useToast, Toast, ToastTitle, ToastDescription } from "@/components/ui/toast";
import apiService from "@/services/ApiService";

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

interface WordFormProps {
  editingWord: Word | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function WordForm({ editingWord, categories, onSuccess, onCancel }: WordFormProps) {
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
      setSelectedCategory(""); // Would need category info from word
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
        
        onSuccess();
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
    <View className="py-1 px-2">
      <View className="py-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] rounded-xl">
        <Text className="text-lg font-bold text-[#212121] mb-6 text-center">
          {editingWord ? "Editar palavra" : "Cadastrar palavra"}
        </Text>

        <View className="space-y-4">
          <Input className="border-[#DC6803] border-2 mb-4" label="Insira a palavra" size="xl">
            <InputField
              value={wordName}
              onChangeText={setWordName}
              placeholder="Digite a palavra"
            />
          </Input>

          <Input className="border-[#DC6803] border-2 mb-4" label="Insira a tradução" size="xl">
            <InputField
              value={wordTranslation}
              onChangeText={setWordTranslation}
              placeholder="Digite a tradução"
            />
          </Input>

          <View className="mb-4">
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
                  {categories.map((category) => (
                    <SelectItem key={category.id} label={category.name} value={category.id.toString()} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </View>

          <Input className="border-[#DC6803] border-2 mb-4" label="Significado (opcional)" size="xl">
            <InputField
              value={wordMeaning}
              onChangeText={setWordMeaning}
              placeholder="Digite o significado"
              multiline
              numberOfLines={3}
            />
          </Input>

          <View className="mb-6">
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

          <View className="flex flex-row gap-3">
            <Button
              className="flex-1 bg-white border-[#DC6803] border-2"
              onPress={onCancel}
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
          </View>
        </View>
      </View>
    </View>
  );
}
