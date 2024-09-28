import React, { useRef, useState, useEffect } from "react";
import { View, Text } from "react-native";
import LottieView from "lottie-react-native";
export default function Profile() {
  const animation = useRef<null | any>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#121212",
      }}
    >
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 200,
          height: 200,
        }}
        // Find more Lottie files at https://lottiefiles.com/featured
        source={require("./../../../assets/animations/construction-animation.json")}
      />
      <Text style={{ color: "#f1f1f1", fontSize: 16 }}>En construcción!</Text>
    </View>
  );
}
