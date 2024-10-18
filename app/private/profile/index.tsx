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
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import Animated from "react-native-reanimated";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/libs/supabase";
import { supabaseImageUploader } from "@/utils/supabase.bucket";

const ProfilePage = () => {
  const { user, loading, error } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [photo, setPhoto] = useState<{} | null>(user?.photo || null);
  const [fileName, setFileName] = useState<string | null | undefined>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false); // Loading state for photo upload
  const [loadingSave, setLoadingSave] = useState(false); // Loading state for profile save

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 250 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (compressedImage) {
        setPhoto(compressedImage);
      }

      setFileName(
        result.assets[0].fileName || String(Math.floor(Math.random() * 100))
      );
    }
  };

  const handleSave = async () => {
    setLoadingSave(true); // Set loading state
    const validFileName = fileName?.replace(/[^a-zA-Z0-9-_\.]/g, "_");

    const form = new FormData();

    form.append("photo", {
      uri: photo?.uri!,
      name: fileName || "photo.jpg",
      type: photo?.mimeType,
    });

    const updatedPhoto = await supabaseImageUploader(
      form,
      fileName,
      false,
      true
    );

    if (updatedPhoto) {
      const { data, error } = await supabase
        .from("users")
        .update({ photo: updatedPhoto })
        .eq("id", user?.id);
      if (error) {
        Alert.alert(
          "Error",
          "An unknown error occurred while updating your photo ❌"
        );
      } else {
        Alert.alert(
          "Profile Updated ✅",
          "Your profile has been updated successfully."
        );
      }
    }
    setLoadingSave(false); // Reset loading state
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("Error signing out?", error.message, error);
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
                source={{ uri: photo?.uri ? photo?.uri : user?.photo }}
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
          value={name || user?.name}
          onChangeText={setName}
          placeholder={user?.name || "Enter your name"}
          style={styles.input}
        />
        <Text style={styles.email}>{user?.email || email}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          {loadingSave ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
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
    color: "#FFFFFF",
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
