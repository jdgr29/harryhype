import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/libs/supabase";

const AuthScreen = () => {
  const goToLoginPage = () => router.push("/auth/");
  const goToRegisterPage = () => router.push("/auth/register");
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Harry Hype</Text>
        <Text style={styles.subtitle}>Turn your ideas into investments</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={goToLoginPage} style={styles.loginButton}>
          <Text style={[styles.buttonText, { color: "#FBFBFB" }]}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToRegisterPage}
          style={styles.registerButton}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark mode background
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    color: "#FFFFFF", // White text color for dark mode
    fontWeight: "bold",
    fontStyle: "italic",
  },
  subtitle: {
    fontSize: 16,
    color: "#BBBBBB",
    marginTop: 10,
  },
  buttonContainer: {
    width: "100%",
  },
  loginButton: {
    backgroundColor: "#6200ee", // Cool blue for login button
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  registerButton: {
    backgroundColor: "#ACF41A", // Vibrant green for register button
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#121212", // Button text color
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AuthScreen;
