import React from "react";
import { View, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
export default function CustomAddStartUpHeader() {
  const goToStartUpCreationPage = () => {
    router.push("/private/startup/add");
  };
  return (
    <>
      <View>
        <TouchableOpacity onPress={goToStartUpCreationPage}>
          <Ionicons name="add-circle-sharp" size={32} color="#ACF41A" />
        </TouchableOpacity>
      </View>
    </>
  );
}
