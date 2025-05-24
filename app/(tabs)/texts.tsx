import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useState } from "react";
import { SearchInput } from "@/components/SearchInput";

export default function TextsScreen() {
  const [filter, setFilter] = useState<string>("");

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#101d25" }}
      title="Textos"
    >
      <SearchInput
        value={filter}
        onChangeValue={setFilter}
        CustomInputContent={<></>}
        condition={!!false}
      />
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
