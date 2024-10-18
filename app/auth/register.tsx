import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { supabase } from "@/libs/supabase";
import * as SecureStore from "expo-secure-store"; // Import SecureStore

const base_url = process.env.EXPO_PUBLIC_BASE_API_URL!;
const register_api = process.env.EXPO_PUBLIC_REGISTER!;

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState<null | ImageManipulator.ImageResult>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  // Function to pick and compress the image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 250 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (compressedImage) {
        setPhoto(compressedImage); // Set the photo URI
      }
    }
  };

  // Function to handle the form submission using FormData
  const handleRegister = async () => {
    setLoading(true);
    if (!name || !email || !password || password !== confirmPassword) {
      setError("Please fill all fields and ensure passwords match.");
      setLoading(false); // Add loading false here
      return;
    }

    setError("");

    // Create a FormData object
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);

    // Check if the user uploaded a photo
    if (photo) {
      const fileUri = photo.uri;
      const fileName = fileUri.split("/").pop();
      const fileType = fileName?.split(".").pop();

      // Append the photo to FormData
      formData.append("photo", {
        uri: fileUri,
        name: fileName,
        type: `image/${fileType}`,
      });
    }

    try {
      const response = await fetch(`${base_url}${register_api}`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();

      if (result.error) {
        setLoading(false);
        setError(result.message);
      } else {
        // Save password in Secure Store
        await SecureStore.setItemAsync("userPassword", password); // Save password

        setLoading(false);
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error) {
          router.replace({
            pathname: "/private",
          });
        }
      }
    } catch (err) {
      setLoading(false);
      console.error("Error during registration:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#121212" }}
    >
      {!loading ? (
        <ScrollView contentContainerStyle={styles.container}>
          <StatusBar barStyle="light-content" />

          <Text style={styles.title}>Register</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={(text) => setName(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
            textContentType="password"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry
            textContentType="password"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity onPress={pickImage} style={styles.photoButton}>
            <Text style={styles.photoButtonText}>
              {photo?.uri ? "Change Profile Photo" : "Upload Profile Photo"}
            </Text>
          </TouchableOpacity>

          {photo?.uri && (
            <Image source={{ uri: photo?.uri }} style={styles.image} />
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={[styles.buttonText, { color: "#121212" }]}>
              Register
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size={"large"} color="white" />
          <Text style={{ color: "white" }}>Estamos creando tu cuenta...</Text>
        </View>
      )}
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
  photoButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginVertical: 20,
  },
  registerButton: {
    backgroundColor: "#ACF41A",
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
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default RegisterScreen;
