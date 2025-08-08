import React from "react";
import { Text, View, Image } from "react-native";

interface Attachment {
  id: number;
  source: string;
  url: string;
}

interface Word {
  id: number;
  word: string;
  meaning: string;
  translation?: string;
  attachments: Attachment[];
}

interface SelectedWordProps {
  state: {
    wordInFocus: Word | null;
  };
  isDarkMode?: boolean;
}

export function SelectedWord({ state, isDarkMode = false }: SelectedWordProps) {
  // Theme colors
  const textColor = isDarkMode ? "#E7E4D8" : "#212121";
  const subtitleColor = isDarkMode ? "#e7e4d8d5" : "#474747";
  const bgColor = isDarkMode ? "#3E1C00" : "#FBF0E8";
  const borderColor = isDarkMode ? "#eb5a12" : "#A30122";
  
  // Get attachments only for the current word in focus
  const currentWordAttachments = state?.wordInFocus?.attachments || [];
  
  return (
    <View className="py-1 px-2">
      <View 
        className="py-4 px-3 border-[1px] rounded-xl"
        style={{ backgroundColor: bgColor, borderColor }}
      >
        <Text style={{ color: textColor, fontSize: 16 }}>
          <Text style={{ fontWeight: 'bold' }}>Significado:</Text> {state?.wordInFocus?.meaning}
        </Text>
      </View>

      {/* Translation - Only show if it exists */}
      {state?.wordInFocus?.translation && (
        <View 
          className="py-4 px-3 border-[1px] my-2 rounded-xl"
          style={{ backgroundColor: bgColor, borderColor }}
        >
          <Text style={{ color: textColor, fontSize: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>Tradução:</Text> {state?.wordInFocus?.translation}
          </Text>
        </View>
      )}

      {/* Only show attachments section if the current word has attachments */}
      {currentWordAttachments.length > 0 && (
          <View 
            className="mt-4 py-4 px-3 border-[1px] rounded-xl"
            style={{ backgroundColor: bgColor, borderColor }}
          >
            <Text style={{ fontWeight: 'bold', color: textColor, marginBottom: 8 }}>Anexos:</Text>
            {currentWordAttachments.map((attachment: Attachment) => (
              <View
                key={attachment.id}
                className="mb-2 p-2 flex flex-col items-center rounded text-center"
                style={{ backgroundColor: isDarkMode ? '#2c2c2c' : '#f5f5f5' }}
              >
                <Text 
                  className="mb-2 font-medium"
                  style={{ color: textColor }}
                >
                  {attachment.source}
                </Text>
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
                <Text 
                  className="text-[8px] max-w-full text-center mt-2 px-1"
                  style={{ color: isDarkMode ? '#c4c4c4' : '#666666' }}
                >
                  Fonte: {attachment.url}
                </Text>
              </View>
            ))}
          </View>
        )}
    </View>
  );
}
