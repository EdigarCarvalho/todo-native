import React, { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { useDictionary } from '@/stores/Dictionary';

// Scale factors for each font size level (1-5)
const FONT_SCALE_FACTORS = {
  1: 0.8,  // Small
  2: 0.9,  // Medium-small
  3: 1.0,  // Medium (default)
  4: 1.1,  // Medium-large
  5: 1.2,  // Large
};

// Create a context for font-size related utilities
const FontSizeContext = createContext({
  getFontSize: (baseSize: number) => baseSize,
});

export const FontSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const { state } = useDictionary();
  const { fontSize } = state.settings;
  
  const scaleFactor = FONT_SCALE_FACTORS[fontSize as keyof typeof FONT_SCALE_FACTORS] || 1;
  
  const getFontSize = (baseSize: number) => {
    return baseSize * scaleFactor;
  };

  return (
    <FontSizeContext.Provider value={{ getFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);

// Create a text component that automatically adjusts based on font size setting
export function ScalableText({ style, children, ...props }: TextProps) {
  const { getFontSize } = useFontSize();
  
  const styles = StyleSheet.create({
    text: {
      fontSize: getFontSize(16), // Default size
    },
  });

  const fontSize = style && StyleSheet.flatten(style)?.fontSize;
  
  const scaledStyle = fontSize
    ? [style, { fontSize: getFontSize(fontSize as number) }]
    : [styles.text, style];

  return (
    <RNText style={scaledStyle} {...props}>
      {children}
    </RNText>
  );
}