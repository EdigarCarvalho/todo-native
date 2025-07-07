import React, { useState } from "react";
import { Text, View, Image, TextInput, Button } from "react-native";

interface SelectedWordProps {
  state: any;
}

export function SelectedWord({ state }: SelectedWordProps) {
  return (
    <View className="py-1 px-2">
      <View className="py-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] rounded-xl">
        <Text className="text-base">
          <strong>Significado:</strong> {state?.wordInFocus?.meaning}
        </Text>
      </View>

       {/* Translation - Only show if it exists */}
       {state?.wordInFocus?.translation && (
        <View className="py-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] my-2 rounded-xl">
        <Text className="text-base">
          <strong>Tradução:</strong> {state?.wordInFocus?.translation}
        </Text>
      </View>
      )}

      {state?.wordInFocus?.attachments &&
        state?.wordInFocus?.attachments.length > 0 && (
          <View className="mt-4 py-4 px-3 bg-[#FBF0E8] border-[#A30122] border-[1px] rounded-xl">
            <Text className="font-bold mb-2">Anexos:</Text>
            {state?.wordInFocus?.attachments?.map((attachment: any) => (
              <View
                key={attachment.id}
                className="mb-2 p-2 flex flex-col items-center bg-gray-100 rounded text-center"
              >
                <Text className="mb-2 font-medium">{attachment?.source}</Text>
                <Image
                  source={{ uri: attachment?.url }}
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    height: 200,
                    borderRadius: 8,
                  }}
                  resizeMode="contain"
                  alt={`Attachment ${attachment?.id}`}
                />
                <Text className="text-[8px] max-w-full text-center mt-2 text-gray-600 px-1">
                  Fonte: {attachment?.url}
                </Text>
              </View>
            ))}
          </View>
        )}
    </View>
  );
}
