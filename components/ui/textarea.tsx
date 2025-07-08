import React from "react";
import { View, Text, StyleSheet, TextInput, TextInputProps } from "react-native";

interface TextAreaProps {
  children: React.ReactNode;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function TextArea({ children, label, size = "md", className = "" }: TextAreaProps) {
  const sizeStyles = {
    sm: { paddingVertical: 2, paddingHorizontal: 4 },
    md: { paddingVertical: 4, paddingHorizontal: 8 },
    lg: { paddingVertical: 6, paddingHorizontal: 12 },
    xl: { paddingVertical: 8, paddingHorizontal: 16 },
  };

  return (
    <View className={className}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 mb-2">{label}</Text>
      )}
      <View
        style={[
          styles.container,
          sizeStyles[size],
        ]}
      >
        {children}
      </View>
    </View>
  );
}

interface TextAreaInputProps extends TextInputProps {
  className?: string;
}

export function TextAreaInput({
  className = "",
  ...props
}: TextAreaInputProps) {
  return (
    <TextInput
      className={`flex-1 text-base text-gray-900 ${className}`}
      placeholderTextColor="#9ca3af"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    backgroundColor: "white",
    minHeight: 120,
  },
  input: {
    flex: 1,
    textAlignVertical: 'top',
  },
});
