import { Tabs } from "expo-router";
import React from "react";
import { useColorScheme } from "@/hooks/useColorScheme";
import { CogSvg, MenuSvg, TextSvg } from "@/components/customIcons";
import { View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E7E4D8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#E7E4D8",
          height: 74,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View className={` flex flex-col justify-center items-center`}>
              <View
                className={`${focused ? "bg-[#A30122]" : ""} px-3 py-[5px] rounded-xl flex flex-col justify-center items-center`}
              >
                <MenuSvg size={26} color={focused ? color : "#474747"} />
              </View>
              <span
                className={`text-xs font-semibold ${focused ? "text-[#212121]]" : "text-[#474747]"} `}
              >
                Dicionário
              </span>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="texts"
        options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <View className={` flex flex-col justify-center items-center`}>
              <View
                className={`${focused ? "bg-[#A30122]" : ""} px-3 py-[5px] rounded-xl flex flex-col justify-center items-center`}
              >
                <TextSvg size={24} color={focused ? color : "#474747"} />
              </View>
              <span
                className={`text-xs font-semibold ${focused ? "text-[#212121]]" : "text-[#474747]"} `}
              >
                Textos
              </span>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",

          tabBarIcon: ({ color, focused }) => (
            <View className={` flex flex-col justify-center items-center`}>
              <View
                className={`${focused ? "bg-[#A30122]" : ""} px-3 py-[5px] rounded-xl flex flex-col justify-center items-center`}
              >
                <CogSvg size={24} color={focused ? color : "#474747"} />
              </View>
              <span
                className={`text-xs font-semibold ${focused ? "text-[#212121]]" : "text-[#474747]"} `}
              >
                Configurações
              </span>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
