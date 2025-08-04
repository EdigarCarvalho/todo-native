import { Tabs } from "expo-router";
import React from "react";
import { CogSvg, MenuSvg, TextSvg } from "@/components/customIcons";
import { View, Text } from "react-native";
import { useAuth } from "@/stores/AuthStore";
import { FolderOpen } from "lucide-react-native";
import { useColorScheme } from "@/hooks/useThemeColor";

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
  const colorScheme = useColorScheme();
  const bgColor = focused ? (isAdmin ? "bg-[#C74B0B] dark:bg-[#740018]" : "bg-[#A30122]  dark:bg-[#740018]") : "";
  const textColor = focused ? "text-[#212121] dark:text-[#E7E4D8]" : "text-[#474747] dark:text-[#E7E4D8]";
  const iconColor = focused ? color : colorScheme === 'light' ? "#474747" : "#E7E4D8";

  // Make sure Icon is a valid component before rendering
  if (!Icon) {
    console.error(`Invalid icon component for tab: ${label}`);
    return null;
  }

  return (
    <View className="flex flex-col justify-center items-center">
      <View className={`${bgColor} px-3 py-[5px] rounded-xl flex flex-col justify-center items-center`}>
        <Icon size={size} color={iconColor} />
      </View>
      <Text className={`text-xs font-semibold ${textColor}`}>
        {label}
      </Text>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
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
        tabBarActiveTintColor: colorScheme === 'light' ? "#E7E4D8" : "#E7E4D8",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'light' ? "#E7E4D8" : "#7C4F2C",
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