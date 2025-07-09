import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from "react-native";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Edit2, Plus } from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";
import { Divider } from "@/components/ui/divider";
import { SearchInput } from "@/components/SearchInput";
import { ThemedText } from "@/components/ThemedText";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { X } from "lucide-react-native";
import apiService from "@/services/ApiService";
import {
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui/toast";
import { useAuth } from "@/stores/AuthStore";
import { router } from "expo-router";
import { useColorScheme } from "@/hooks/useThemeColor";

interface Category {
  id: number;
  name: string;
}

export default function CategoriesScreen() {
  const { state, fetchData, refreshCategories } = useDictionary();
  const theme = useColorScheme();
  const { state: authState } = useAuth();
  const [filter, setFilter] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const isAdmin = Boolean(authState?.isAuthenticated);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(tabs)");
      return;
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Don't render anything for non-admin users
  if (!isAdmin) {
    return null;
  }

  // Filter categories based on search input
  const getFilteredCategories = () => {
    if (!filter) return state.categories;
    return state.categories.filter((category) =>
      category.name.toLowerCase().includes(filter.toLowerCase())
    );
  };

  const filteredCategories = getFilteredCategories();

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setCategoryName("");
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      toast.show({
        placement: "top",
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastTitle>Erro</ToastTitle>
            <ToastDescription>
              Por favor, insira um nome para a categoria
            </ToastDescription>
          </Toast>
        ),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (editingCategory) {
        result = await apiService.updateCategory(
          editingCategory.id,
          categoryName.trim()
        );
      } else {
        result = await apiService.createCategory(categoryName.trim());
      }

      if (result.success) {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="success" variant="solid">
              <ToastTitle>Sucesso</ToastTitle>
              <ToastDescription>
                Categoria {editingCategory ? "atualizada" : "criada"} com
                sucesso!
              </ToastDescription>
            </Toast>
          ),
        });

        // Close modal first
        closeModal();

        // Then refresh data - try refreshCategories first, fallback to full fetchData
        const refreshSuccess = await refreshCategories();
        if (!refreshSuccess) {
          console.log("Refresh categories failed, falling back to full fetch");
          await fetchData();
        }
      } else {
        toast.show({
          placement: "top",
          render: ({ id }) => (
            <Toast nativeID={`toast-${id}`} action="error" variant="solid">
              <ToastTitle>Erro</ToastTitle>
              <ToastDescription>
                {result.error ||
                  `Falha ao ${editingCategory ? "atualizar" : "criar"} categoria`}
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
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
        title="Categorias"
      >
        <SearchInput
          value={filter}
          onChangeValue={setFilter}
          placeholder="Pesquise uma categoria"
          CustomInputContent={
            <View className="flex flex-row w-full items-center justify-center">
              <Text className="text-lg font-medium">
                Pesquise uma categoria
              </Text>
            </View>
          }
          condition={false}
        />

        <View className="px-2 pt-2">
          <ThemedText
            style={{ color: theme === "dark" ? "#E7E4D8" : "#212121" }}
            type="title"
          >
            Categorias
          </ThemedText>
        </View>

        {state.isLoading ? (
          <View className="py-10 flex justify-center items-center">
            <ActivityIndicator size="large" color={theme === 'dark' ? "#E7E4D8" : "#A30122"} />
            <Text className="mt-2 text-center dark:text-[#E7E4D8]">Carregando categorias...</Text>
          </View>
        ) : (
          <View className="mt-2">
            {filteredCategories.length > 0 ? (
              <View className="px-1">
                {filteredCategories.map((category, index) => (
                  <View key={category.id}>
                    <View className="flex flex-row justify-between items-center py-3 px-2">
                      <Text className="font-bold text-base text-[#212121] dark:text-[#E7E4D8] flex-1">
                        {category.name}
                      </Text>
                      <TouchableOpacity
                        className="p-2"
                        onPress={() => openEditModal(category)}
                      >
                        <Edit2 size={20} color={theme === "dark" ? "#eb5a12" : "#C74B0B"} />
                      </TouchableOpacity>
                    </View>
                    {index < filteredCategories.length - 1 && <Divider />}
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-center py-4">
                {filter
                  ? `Nenhuma categoria encontrada para "${filter}"`
                  : "Nenhuma categoria cadastrada"}
              </Text>
            )}
          </View>
        )}

        {/* Floating Add Button */}
      </ParallaxScrollView>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalBackdrop />
        <ModalContent className="bg-white">
          <ModalHeader className=" text-center">
            <Text className="text-lg font-bold text-[#212121] mx-auto  text-center">
              {editingCategory ? "Editar categoria" : "Adicionar categoria"}
            </Text>
            {/* <ModalCloseButton onPress={closeModal}>
              <X size={20} color="#666" />
            </ModalCloseButton> */}
          </ModalHeader>

          <ModalBody className="py-6">
            <Input
              className="border-[#C74B0B] border-2"
              label="Categoria"
              size="xl"
            >
              <InputField
                value={categoryName}
                onChangeText={setCategoryName}
                autoFocus
              />
            </Input>
          </ModalBody>

          <ModalFooter className="flex flex-row gap-3 ">
            <Button
              className="flex-1 bg-white border-[#C74B0B] border-2"
              onPress={closeModal}
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
                  ? editingCategory
                    ? "Salvando..."
                    : "Adicionando..."
                  : editingCategory
                    ? "Salvar"
                    : "Adicionar"}
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#C74B0B] rounded-2xl flex items-center justify-center shadow-lg"
        onPress={openAddModal}
        style={styles.floatingButton}
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
