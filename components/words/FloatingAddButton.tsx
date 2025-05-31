import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";

interface FloatingAddButtonProps {
  onPress: () => void;
}

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  return (
    <TouchableOpacity
      className="absolute bottom-6 right-6 w-14 h-14 bg-[#C74B0B] rounded-2xl flex items-center justify-center shadow-lg"
      onPress={onPress}
      style={styles.floatingButton}
    >
      <Plus size={24} color="white" />
    </TouchableOpacity>
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
