import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Album, House, Settings } from "lucide-react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#101d25'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => <House size={24} color={"#f1f1f1"} />,
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => <Album size={24} color={"#f1f1f1"}/>,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",

          tabBarIcon: ({ color, focused }) => <Settings size={24} color={"#f1f1f1"} />,
        }}
      />
    </Tabs>
  );
}
