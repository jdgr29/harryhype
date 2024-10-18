import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/libs/supabase";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store"; // Import SecureStore
import AntDesign from "@expo/vector-icons/AntDesign";
const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Function to handle biometric authentication
  const authenticate = async () => {
    const result = await LocalAuthentication.authenticateAsync();
    if (result.error) {
      Alert.alert("Biometric Authentication Failed", "Please try again.");
      return false;
    }
    return result.success;
  };

  // Check for biometric authentication availability
  // useEffect(() => {
  //   (async () => {
  //     const hasHardware = await LocalAuthentication.hasHardwareAsync();
  //     const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  //     setBiometricAvailable(hasHardware && isEnrolled);
  //   })();
  // }, []);

  const handleBiometricLogin = async () => {
    const authenticated = await authenticate();
    if (authenticated) {
      const storedEmail = await SecureStore.getItemAsync("email");
      const storedPassword = await SecureStore.getItemAsync("password");

      if (storedEmail && storedPassword) {
        const { error } = await supabase.auth.signInWithPassword({
          email: storedEmail,
          password: storedPassword,
        });

        if (error) {
          Alert.alert(error.message);
        } else {
          router.push("/private");
        }
      } else {
        Alert.alert("No saved credentials found. Please log in manually.");
      }
    }
  };

  const validateForm = async () => {
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    } else {
      await SecureStore.setItemAsync("email", email);
      await SecureStore.setItemAsync("password", password);
      router.push("/private");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="light-content" />

        <Text style={styles.title}>Harry Hype</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(""); // Remove error on typing
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(""); // Remove error on typing
          }}
          secureTextEntry
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <AntDesign name="scan1" size={44} color="white" />
          <Text style={styles.buttonText}>Login with Face ID</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={validateForm}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity> */}

        {/* Biometric login button */}
        {/* {biometricAvailable && ( */}

        {/* )} */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center",
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    borderColor: "#333",
    borderWidth: 1,
  },
  loginButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  biometricButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  forgotPasswordText: {
    color: "#BBBBBB",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default LoginScreen;
