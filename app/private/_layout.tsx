// app/_layout.tsx
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs
      initialRouteName="feed"
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={100} style={StyleSheet.absoluteFill} />
        ),
        tabBarActiveTintColor: "#ACF41A",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: styles.tabIcon,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="pmarket"
        options={{
          title: "Market",
          headerTransparent: true,
          headerTitleStyle: {
            color: "#f1f1f1",
          },
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          headerTransparent: true,
          headerTitleStyle: {
            color: "#f1f1f1",
          },
          href: null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="startup"
        options={{
          title: "Startups",
          headerTransparent: true,
          headerTitleStyle: {
            color: "#f1f1f1",
          },
          tabBarIcon: ({ color, size = 20 }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          headerTransparent: true,

          headerTitleStyle: {
            color: "#f1f1f1",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          headerTransparent: true,

          headerTitleStyle: {
            color: "#f1f1f1",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 10,
    height: 90, // Increased height for more space
    width: "100%",
    paddingBottom: 30, // Adds extra space at the bottom
    borderTopWidth: 0,
    overflow: "visible", // Ensure icons aren't cut off
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  tabLabel: {
    fontSize: 14,
  },
  tabIcon: {
    marginTop: 5, // Adds extra space around the icon
    paddingHorizontal: 5, // Ensures the icons are not squashed
  },
});
