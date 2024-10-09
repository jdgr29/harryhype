import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { GroqAI } from "@/libs/groq.ai";
import Ionicons from "@expo/vector-icons/Ionicons";

const AddStartup = () => {
  const [name, setName] = useState<string | null>("");
  const [description, setDescription] = useState<string | null>("");
  const [tokenName, setTokenName] = useState<string | null>("");
  const [tokenSymbol, setTokenSymbol] = useState<string | null>("");
  const [tokenImage, setTokenImage] = useState<string | null | Blob>(null);
  const [startupImage, setStartupImage] = useState<string | null | Blob>(null);
  const [aiModalVisible, setAiModalVisible] = useState<boolean>(false);
  const [businessIdea, setBusinessIdea] = useState<string | null>("");

  const AiHandler = async () => {
    try {
      const businessName = await GroqAI([
        {
          role: "user",
          content: `give me a name for just one string with the name no comments of your own just for example answer: Example Name or Name if it only has one word and without quotations marks and if you need more than two words just add an empty space between them, be creative not such an obvious name ${businessIdea}. The answer must be in spanish remember to use spaces to separate words if needed. The answer must be for example: Some Name`,
        },
      ]);

      const tokenSymbol = await GroqAI([
        {
          role: "user",
          content: `give me a 3-4 letter symbol suggestion for this business idea, just one string and that's it please not comments just the characters in UPPERCASE ${businessIdea}. The answer must be in spanish. The answer must be for example: ABCD`,
        },
      ]);

      const description = await GroqAI([
        {
          role: "user",
          content: `give me a description for this business idea the name of the business is ${businessName}. Just give me the description right away, do not add comments of your own just imagine you are describing the business idea to an investor right away, but please just describe it. use passive voice and speak about what the business is, what it does and etc... information that potential investors would like to see. This is the business idea: ${businessIdea}. It is very important that the 2-3 paragraphs do not exceed 700-800 words The answer must be in spanish`,
        },
      ]);

      // Assuming the AI response is an object with name, tokenSymbol, and description fields
      setName(businessName);
      setTokenSymbol(tokenSymbol);
      setDescription(description);
      setTokenName(businessName);

      setAiModalVisible(false); // Close the modal after filling the fields
    } catch (error) {
      Alert.alert("Error", "Failed to get AI response");
      console.error(error);
    }
  };

  const [errors, setErrors] = useState<{
    name: string | null | Blob;
    description: string | null | Blob;
    tokenName: string | null | Blob;
    tokenSymbol: string | null | Blob;
    tokenImage: string | null | Blob;
    startupImage: string | null | Blob;
  }>({
    name: null,
    description: null,
    tokenName: null,
    tokenSymbol: null,
    tokenImage: null,
    startupImage: null,
  });

  const [descriptionHeight, setDescriptionHeight] = useState(53); // Initial height for description input

  // Function to pick an image from the user's library
  const pickImage = async (setImage: Function) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      //TODO check if we actually need the uri or the entire thing omg jaja
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: "",
      description: "",
      tokenName: "",
      tokenSymbol: "",
      tokenImage: "",
      startupImage: "",
    };

    // Validate input
    if (!name) newErrors.name = "Startup name is required.";
    if (!description) newErrors.description = "Description is required.";
    if (!tokenName) newErrors.tokenName = "Token name is required.";

    if (tokenSymbol?.length! < 3 || tokenSymbol?.length! > 5) {
      newErrors.tokenSymbol = "Token symbol must be 3 to 5 characters long.";
    }

    if (!tokenImage) newErrors.tokenImage = "Token image is required.";
    if (!startupImage) newErrors.startupImage = "Startup image is required.";

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    const formData = new FormData();
    formData.append("name", name ?? ""); // Provide default empty string if `name` is null or undefined
    formData.append("description", description ?? "");
    formData.append("token_name", tokenName ?? "");
    formData.append("token_symbol", tokenSymbol ?? "");

    // Append images
    formData.append("token_image", {
      uri: tokenImage,
      type: "image/jpeg", // Adjust the type as necessary
      name: "token_image.jpg",
    });
    formData.append("startup_image", {
      uri: startupImage,
      type: "image/jpeg", // Adjust the type as necessary
      name: "startup_image.jpg",
    });

    try {
      const response = await fetch("YOUR_API_ENDPOINT_HERE", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Startup created successfully!");
        //TODO add success animation
        router.push("/my-startups"); // Navigate to the My Startups page
      } else {
        Alert.alert("Error", data.message || "Something went wrong");
        //TODO add failed animation
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create startup");
      //TODO add failed animation
      console.error(error);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        height: Dimensions.get("screen").height,
        backgroundColor: "#121212",
      }}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingBottom: 16,
        }}
      >
        <Ionicons name="create" size={48} color="white" />
      </View>
      <ScrollView style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Startup Name"
          placeholderTextColor="#797A7B"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors((prev) => ({ ...prev, name: "" })); // Clear error on change
          }}
        />
        {errors.name ? (
          <Text style={styles.errorText}>{errors.name}</Text>
        ) : null}

        <TextInput
          style={[styles.input, { height: descriptionHeight }]} // Set dynamic height
          placeholder="Description (max 3 paragraphs)"
          placeholderTextColor="#797A7B"
          value={description}
          onChangeText={(text) => {
            const paragraphs = text.split("\n").filter(Boolean);
            if (paragraphs.length <= 3) {
              setDescription(text);
              setErrors((prev) => ({ ...prev, description: "" })); // Clear error on change
            } else {
              Alert.alert(
                "Limit exceeded",
                "Description can have a maximum of 3 paragraphs."
              );
            }
          }}
          onContentSizeChange={(contentSize) => {
            setDescriptionHeight(
              contentSize.nativeEvent.contentSize.height + 10
            ); // Adjust height based on content
          }}
          multiline
          textAlignVertical="top" // Start typing from the top
        />
        {errors.description ? (
          <Text style={styles.errorText}>{errors.description}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Token Name"
          placeholderTextColor="#797A7B"
          value={tokenName}
          onChangeText={(text) => {
            setTokenName(text);
            setErrors((prev) => ({ ...prev, tokenName: "" })); // Clear error on change
          }}
        />
        {errors.tokenName ? (
          <Text style={styles.errorText}>{errors.tokenName}</Text>
        ) : null}

        <TextInput
          style={styles.input}
          placeholder="Token Symbol (3-5 chars)"
          placeholderTextColor="#797A7B"
          value={tokenSymbol}
          onChangeText={(text) => {
            setTokenSymbol(text);
            setErrors((prev) => ({ ...prev, tokenSymbol: "" })); // Clear error on change
          }}
        />
        {errors.tokenSymbol ? (
          <Text style={styles.errorText}>{errors.tokenSymbol}</Text>
        ) : null}

        {/* Token Image Picker */}
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => pickImage(setTokenImage)}
        >
          <Text style={styles.imagePickerText}>
            {tokenImage ? "Change Shares Image" : "Pick Shares Image"}
          </Text>
        </TouchableOpacity>
        {errors.tokenImage ? (
          <Text style={styles.errorText}>{errors.tokenImage}</Text>
        ) : null}
        {tokenImage && (
          <Image source={{ uri: tokenImage }} style={styles.image} />
        )}

        {/* Startup Image Picker */}
        <TouchableOpacity
          style={styles.imagePicker}
          onPress={() => pickImage(setStartupImage)}
        >
          <Text style={styles.imagePickerText}>
            {startupImage ? "Change Startup Image" : "Pick Startup Image"}
          </Text>
        </TouchableOpacity>
        {errors.startupImage ? (
          <Text style={styles.errorText}>{errors.startupImage}</Text>
        ) : null}
        {startupImage && (
          <Image source={{ uri: startupImage }} style={styles.image} />
        )}

        {/* AI Assistance Button */}
        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => setAiModalVisible(true)}
        >
          <Text style={styles.aiButtonText}>Harry's AI Assistance</Text>
          <Ionicons name="sparkles" size={24} color="white" />
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Startup</Text>
        </TouchableOpacity>

        {/* AI Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={aiModalVisible}
          onRequestClose={() => setAiModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>AI Assistance</Text>
              <Text style={styles.modalDescription}>
                Describe o habla acerca de tu idea o negocio:
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your business idea"
                placeholderTextColor="#797A7B"
                value={businessIdea}
                onChangeText={setBusinessIdea}
              />
              <TouchableOpacity style={styles.modalButton} onPress={AiHandler}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setAiModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 120,
  },
  input: {
    height: 50,
    borderColor: "#797A7B",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "#ffffff",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  imagePicker: {
    backgroundColor: "#424242",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {
    color: "#ffffff",
  },
  image: {
    width: "auto",
    height: 300,
    borderRadius: 8,
    marginBottom: 10,
  },
  aiButton: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  aiButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#ACF41A",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 15,
  },
  modalInput: {
    height: 50,
    borderColor: "#797A7B",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#ffffff",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  modalButtonText: {
    color: "#ffffff",
  },
  closeButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    borderColor: "#ffffff",
    borderWidth: 1,
    width: "100%",
  },
  closeButtonText: {
    color: "#ffffff",
  },
});

export default AddStartup;
