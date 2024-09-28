import React from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Harry Hype</Text>
      <Pressable onPress={() => router.replace("./private")}>
        <Text>Go to private</Text>
      </Pressable>
      <Pressable onPress={() => router.push("./auth")}>
        <Text>Go to auth</Text>
      </Pressable>
    </View>
  );
}
