import React, { useState, useEffect, useRef } from "react";
import { Tabs, Redirect } from "expo-router";
import { BlurView } from "expo-blur";
import { StyleSheet, View, ActivityIndicator, AppState } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/libs/supabase"; // Ensure the correct path to supabase instance

export default function RootLayout() {
  const [session, setSession] = useState<null | any>(null);
  const [loading, setLoading] = useState(true);
  const [appState, setAppState] = useState(AppState.currentState);
  const lastActiveTimeRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<null | NodeJS.Timeout>(null);

  const logOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const refreshSession = async () => {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
      logOut();
    }
  };

  const startTokenRefreshTimer = () => {
    refreshIntervalRef.current = setInterval(refreshSession, 55 * 60 * 1000); // Refresh every 55 minutes
  };

  const clearTokenRefreshTimer = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setSession(session);
        startTokenRefreshTimer();
      }

      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      clearTokenRefreshTimer();
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      const now = Date.now();

      if (appState === "active" && nextAppState !== "active") {
        // App going to background, store the time
        lastActiveTimeRef.current = now;
      } else if (appState !== "active" && nextAppState === "active") {
        // App becomes active again
        if (
          lastActiveTimeRef.current &&
          now - lastActiveTimeRef.current >= 54 * 60 * 1000
        ) {
          // If the app was inactive for more than 54 minutes, log out
          logOut();
        } else {
          // If the app became active before 54 minutes, refresh the token
          refreshSession();
        }
      }

      setAppState(nextAppState);
    };

    const states = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      states.remove();
    };
  }, [appState]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ACF41A" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/" />;
  }

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
        name="startup"
        options={{
          title: "Startups",
          headerShown: false,
          tabBarIcon: ({ color, size = 20 }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          // title: "Wallet",
          // headerTransparent: true,
          // headerTitleStyle: {
          //   color: "#f1f1f1",
          // },
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="wallet-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
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
    height: 90,
    width: "100%",
    paddingBottom: 30,
    borderTopWidth: 0,
    overflow: "visible",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  tabLabel: {
    fontSize: 14,
  },
  tabIcon: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});
