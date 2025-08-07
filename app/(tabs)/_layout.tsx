import { Tabs } from "expo-router";
import React from "react";
import { CogSvg, MenuSvg, TextSvg } from "@/components/customIcons";
import { View, Text } from "react-native";
import { useAuth } from "@/stores/AuthStore";
import { FolderOpen } from "lucide-react-native";
import { useDictionary } from "@/stores/Dictionary";

const TabIcon = ({ 
  focused, 
  isAdmin, 
  color, 
  icon: Icon, 
  size, 
  label 
}: {
  focused: boolean;
  isAdmin: boolean;
  color: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  size: number;
  label: string;
}) => {
  const { state } = useDictionary();
  const { darkMode } = state.settings;
  const isDarkMode = Boolean(darkMode);

  // Background colors based on theme and focus state
  const bgColor = focused 
    ? (isAdmin 
      ? (isDarkMode ? "#740018" : "#C74B0B") 
      : (isDarkMode ? "#740018" : "#A30122"))
    : "transparent";
    
  // Text colors
  const textColor = isDarkMode 
    ? "#E7E4D8" 
    : (focused ? "#212121" : "#474747");
    
  // Icon colors
  const iconColor = focused 
    ? color 
    : (isDarkMode ? "#E7E4D8" : "#474747");

  // Make sure Icon is a valid component before rendering
  if (!Icon) {
    console.error(`Invalid icon component for tab: ${label}`);
    return null;
  }

  return (
    <View className="flex flex-col justify-center items-center">
      <View 
        className="px-3 py-[5px] rounded-xl flex flex-col justify-center items-center"
        style={{ backgroundColor: bgColor }}
      >
        <Icon size={size} color={iconColor} />
      </View>
      <Text 
        className="text-xs font-semibold"
        style={{ color: textColor }}
      >
        {label}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const { state: dictionaryState } = useDictionary();
  const { darkMode } = dictionaryState.settings;
  const isDarkMode = Boolean(darkMode);
  
  const { state } = useAuth();
  const isAdmin = Boolean(state?.isAuthenticated);

  const tabScreens = [
    {
      name: "index",
      icon: MenuSvg,
      size: 26,
      label: "Dicionário",
      href: undefined
    },
    {
      name: "categories",
      icon: FolderOpen,
      size: 24,
      label: "Categorias",
      href: isAdmin ? "/categories" : null
    },
    {
      name: "texts",
      icon: TextSvg,
      size: 24,
      label: "Textos",
      href: undefined
    },
    {
      name: "settings",
      icon: CogSvg,
      size: 24,
      label: "Configurações",
      href: undefined
    }
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#E7E4D8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDarkMode ? "#7C4F2C" : "#E7E4D8",
          height: 74,
        },
      }}
    >
      {tabScreens.map((screen) => {
        if (!screen.icon) {
          console.error(`Missing icon for tab: ${screen.name}`);
          return null;
        }
        
        return (
          <Tabs.Screen
            key={screen.name}
            name={screen.name}
            options={{
              href: screen?.href,
              title: "",
              tabBarIcon: ({ color, focused }) => (
                <TabIcon
                  focused={focused}
                  isAdmin={isAdmin}
                  color={color}
                  icon={screen.icon}
                  size={screen.size}
                  label={screen.label}
                />
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}