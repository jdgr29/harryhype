import React, { useState } from "react";
import { Button, Image, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "image.jpg", // Adjust the file name and type as needed
      type: "image/jpeg",
    });

    try {
      const response = await fetch("YOUR_SERVER_URL/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const data = await response.json();
      console.log("Uploaded Image URL:", data.url); // The URL of the uploaded image
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <View>
      <Button title="Pick an Image" onPress={pickImage} />
      {selectedImage && (
        <Image
          source={{ uri: selectedImage }}
          style={{ width: 200, height: 200 }}
        />
      )}
    </View>
  );
};

export default App;
