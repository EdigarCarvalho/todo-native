import React, { useState, useEffect } from "react";
import { Text as ReactText, TouchableOpacity, View, Image, Platform } from "react-native";
import { Upload, X } from "lucide-react-native";
import { Input, InputField } from "@/components/ui/input";
// Fix the import to use the correct case or path
import { Button, ButtonText } from "@/components/ui/button";
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
import { useTexts } from "@/stores/TextsStore";
import * as ImagePicker from "expo-image-picker";
import {
  Textarea,
  TextareaInput,
} from "../ui/textarea";
import { useColorScheme } from "@/hooks/useThemeColor";

interface Text {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  cover_url: string;
}

interface TextFormProps {
  editingText: Text | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TextForm({ editingText, onSuccess, onCancel }: TextFormProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [cover, setCover] = useState<RNFile | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const { createText, updateText, deleteText } = useTexts();
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  
  // Theme colors
  const uploadTextColor = isDarkMode ? "#eb5a12" : "#C74B0B";
  const labelBgColor = isDarkMode ? "#3E1C00" : "#f9f9f9";
  const labelTextColor = isDarkMode ? "#E7E4D8" : "#4B2C0B";
  
  useEffect(() => {
    if (editingText) {
      setTitle(editingText?.title || "");
      setSubtitle(editingText?.subtitle || "");
      setContent(editingText?.content || "");
      setCoverPreview(editingText?.cover_url || null);
    } else {
      setTitle("");
      setSubtitle("");
      setContent("");
      setCoverPreview(null);
    }
    setCover(null);
  }, [editingText]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true, // Request base64 data
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      
      // Determine if we have a data URI or a file URI
      let uri = selectedAsset.uri;
      let type = selectedAsset.mimeType || 'image/jpeg';
      let name = 'cover.jpg';
      
      // If we have base64 data but not a data URI, create one
      if (selectedAsset.base64 && !uri.startsWith('data:')) {
        uri = `data:${type};base64,${selectedAsset.base64}`;
      }
      
      // If it's a file URI, try to get the extension for the filename
      if (!uri.startsWith('data:')) {
        const uriParts = uri.split('.');
        const fileExtension = uriParts[uriParts.length - 1];
        if (fileExtension) {
          name = `cover.${fileExtension}`;
        }
      } else {
        // For data URIs, extract the extension from mime type
        const ext = type.split('/')[1] || 'jpg';
        name = `cover.${ext}`;
      }
      
      // Create a proper RNFile object
      const file: RNFile = {
        uri,
        type,
        name,
      };
      
      console.log("Selected image file:", JSON.stringify({
        uri: uri.substring(0, 100) + "...", // Trim the URI for logging
        type,
        name
      }));
      
      setCover(file);
      setCoverPreview(uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !subtitle.trim() || !content.trim()) {
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
      let success;
      if (editingText) {
        success = await updateText(editingText.id, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          cover: cover,
        });
      } else {
        // New texts must have a cover
        if (!cover && !editingText) {
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={`toast-${id}`} action="error" variant="solid">
                <ToastTitle>Erro</ToastTitle>
                <ToastDescription>
                  Por favor, selecione uma imagem de capa
                </ToastDescription>
              </Toast>
            ),
          });
          setIsSubmitting(false);
          return;
        }

        success = await createText({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content: content.trim(),
          cover: cover,
        });
      }

      if (success) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>Sucesso</ToastTitle>
              <ToastDescription>
                Texto {editingText ? "atualizado" : "criado"} com sucesso!
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
                {`Falha ao ${editingText ? "atualizar" : "criar"} texto`}
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

  const handleDelete = async () => {
    if (!editingText) return;

    setIsDeleting(true);
    try {
      const success = await deleteText(editingText.id);

      if (success) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>Sucesso</ToastTitle>
              <ToastDescription>Texto excluído com sucesso!</ToastDescription>
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
              <ToastDescription>Falha ao excluir texto</ToastDescription>
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
              style={{ color: "#C74B0B", textAlign: "center" }}
              type="title"
            >
              {editingText ? "Editar texto" : "Cadastrar texto"}
            </ThemedText>
          </View>

          <View className="space-y-4 flex flex-col gap-4">
            <Input
              className="border-[#C74B0B] border-2"
              label="Título"
              size="xl"
            >
              <InputField value={title} onChangeText={setTitle} />
            </Input>

            <Input
              className="border-[#C74B0B] border-2"
              label="Subtítulo"
              size="xl"
            >
              <InputField value={subtitle} onChangeText={setSubtitle} />
            </Input>

            <Textarea
              label="Conteúdo"
              isReadOnly={false}
              isInvalid={false}
              isDisabled={false}
              className="h-52"
            >
              <TextareaInput
                value={content}
                onChangeText={setContent}
              />
            </Textarea>

            {/* Cover Image with styled floating label */}
            <View className="relative">
              <View className="border-[#C74B0B] border-dashed border-2 rounded p-2 min-h-[80px]">
                {coverPreview ? (
                  <View className="relative">
                    <Image
                      source={{ uri: coverPreview }}
                      className="w-full h-40 rounded"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                      onPress={() => {
                        setCover(null);
                        setCoverPreview(null);
                      }}
                    >
                      <X size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    className="rounded p-4 flex flex-row items-center justify-center h-[60px]"
                    onPress={pickImage}
                  >
                    <Upload size={20} color={isDarkMode ? "#eb5a12" : "#C74B0B"} />
                    <ReactText 
                      className="ml-2"
                      style={{ color: uploadTextColor }}
                    >
                      Escolher imagem
                    </ReactText>
                  </TouchableOpacity>
                )}
              </View>
              <ReactText 
                className="absolute -top-3 left-4 px-2 font-semibold text-sm"
                style={{ 
                  backgroundColor: labelBgColor, 
                  color: labelTextColor 
                }}
              >
                Imagem de capa
              </ReactText>
            </View>

            <View className="flex flex-row gap-3">
              {editingText ? (
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
                    ? editingText
                      ? "Salvando..."
                      : "Adicionando..."
                    : editingText
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
        <ModalContent className="bg-white">
          <ModalHeader className="text-center">
            <ReactText className="text-lg font-bold text-[#212121] mx-auto text-center">
              Tem certeza que deseja excluir o texto?
            </ReactText>
          </ModalHeader>

          <ModalBody className="py-2">
            <ReactText className="text-center text-gray-700">
              Esta ação não pode ser desfeita.
            </ReactText>
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
