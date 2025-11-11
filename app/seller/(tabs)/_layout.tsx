import { BrandColors } from "@/constants/colors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Tabs } from "expo-router";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  MessageCircle, 
  BarChart3 
} from "lucide-react-native";
import React from "react";

export default function SellerTabLayout() {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: theme.headerBackground,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarShowLabel: false,
        headerStyle: {
          backgroundColor: theme.headerBackground,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("sellerDashboard"),
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gigs"
        options={{
          title: t("myGigs"),
          tabBarIcon: ({ color }) => <Package size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t("orders"),
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: t("inbox"),
          tabBarIcon: ({ color }) => <MessageCircle size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: t("analytics"),
          tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
