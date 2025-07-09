import type { CSSProperties, PropsWithChildren, ReactElement } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "./ThemedText";
import { useDictionary } from "@/stores/Dictionary";

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  scrollViewBackgroundColor?: { dark?: string; light?: string };
  title: string;
  customCss?: {
    container?: CSSProperties;
    header?: CSSProperties;
    content?: CSSProperties;
  };
}>;

export default function ParallaxScrollView({
  children,
  headerBackgroundColor,
  scrollViewBackgroundColor,
  title = "",
  customCss = {},
}: Props) {
  const { state } = useDictionary();
  const { darkMode } = state.settings;
  const isDarkMode = Boolean(darkMode);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const styles = getStyles({
    content: {
      backgroundColor: isDarkMode ? "#3E1C00" : "#f9f9f9",
    },
    ...customCss,
  });

  

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        style={{ backgroundColor:  isDarkMode ? "#3E1C00" : scrollViewBackgroundColor?.light || "#f9f9f9" }}
      >
        <Animated.View
          style={[
            styles.header,
            {
              backgroundColor: headerBackgroundColor[isDarkMode ? "dark" : "light"],
              paddingTop: 0,
            },
            headerAnimatedStyle,
          ]}
        >
          <ThemedText style={{ color: "#f1f1f1" }} type="subtitle">
            {title}
          </ThemedText>
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const getStyles = (customCss: {
  container?: object;
  header?: object;
  content?: object;
}) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      ...(customCss?.container || {}),
    },
    header: {
      height: 0,
      overflow: "hidden",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      ...(customCss?.header || {}),
    },
    content: {
      flex: 1,
      padding: 32,
      paddingRight: 20,
      paddingLeft: 20,
      gap: 16,
      overflow: "hidden",
      ...(customCss?.content || {}),
    },
  });
};
