import { Tabs } from "expo-router";
import React from "react";
import { Feather } from "@expo/vector-icons";

import { useColorScheme } from "~/hooks/useColorScheme";

export default function AppTabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = (colorScheme ?? "light") === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? "hsl(240 10% 3.9%)" : "hsl(0 0% 100%)",
          borderTopColor: isDark ? "hsl(240 3.7% 15.9%)" : "hsl(240 5.9% 90%)",
        },
        tabBarActiveTintColor: isDark ? "hsl(0 0% 98%)" : "hsl(240 5.9% 10%)",
        tabBarInactiveTintColor: isDark
          ? "hsl(240 5% 64.9%)"
          : "hsl(240 3.8% 46.1%)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspaces/[workspaceId]/boards"
        options={{
          title: "Boards",
          tabBarIcon: ({ color, size }) => (
            <Feather name="layout" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workspaces/[workspaceId]/members"
        options={{
          title: "Members",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistic/index"
        options={{
          title: "Stats",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Feather name="settings" size={size ?? 20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statistic/activities"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="statistic/self"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="workspaces/[workspaceId]/boards/[boardId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="workspaces/[workspaceId]/boards/[boardId]/cards/[cardId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
