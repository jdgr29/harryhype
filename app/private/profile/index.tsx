import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
} from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import Animated, { Easing } from "react-native-reanimated";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/libs/supabase";

const ProfilePage = () => {
  const { user, loading, error } = useUser();
  const [name, setName] = useState(user?.name! || ""); // Placeholder for user's name
  const [email, setEmail] = useState(user?.email! || ""); // Placeholder for user's email
  const [photo, setPhoto] = useState<string | null>(user?.photo! || null); // Photo state

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri); // Set the photo URI
    }
  };

  const handleSave = () => {
    //TODO create function to do the updates
    // Implement save functionality
    Alert.alert(
      "Profile Updated",
      "Your profile has been updated successfully."
    );
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("error signount out?", error.message, error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <Text style={styles.title}>Harry Hype</Text>
        <TouchableOpacity onPress={handleImagePick}>
          <Animated.View style={styles.photoContainer}>
            {user?.photo ? (
              <Image
                source={{ uri: user?.photo || photo }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>Add Photo</Text>
              </View>
            )}
          </Animated.View>
          <Text style={{ color: "#FBFBFB", fontWeight: "bold" }}>
            Cambiar foto
          </Text>
        </TouchableOpacity>
        <TextInput
          value={user?.name || name}
          onChangeText={setName}
          placeholder={user?.name || name || "Enter your name"}
          style={styles.input}
        />
        <Text style={styles.email}>{user?.email || email}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.saveButton, { backgroundColor: "#121212" }]}
        >
          <Text style={styles.saveButtonText}>Logout</Text>
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    padding: 16,
    backgroundColor: "#121212",
  },
  blurContainer: {
    width: "95%",
    padding: 20,
    borderRadius: 32,
    alignItems: "center",
    gap: 8,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderColor: "#fff",
    borderWidth: 2,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  placeholderText: {
    color: "#f1f1f1",
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#f1f1f1",
    marginBottom: 12,
  },
  email: {
    color: "#f1f1f1",
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    color: "#FFFFFF", // White text color for dark mode
    fontWeight: "bold",
    fontStyle: "italic",
  },
  saveButton: {
    backgroundColor: "#6200ee",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ProfilePage;
