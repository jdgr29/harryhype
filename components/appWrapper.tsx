import React from "react";
import { SafeAreaView, View } from "react-native";
import { Slot } from "expo-router";

export default function AppWrapper({ children }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Slot />
    </SafeAreaView>
  );
}
