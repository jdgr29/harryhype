import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageSourcePropType,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useStartups } from "@/hooks/useStartups";
import { useUser } from "@/hooks/useUser";
import { getTokenMetadata } from "@/services/token";
import { TokenData } from "@/types/token.types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const CompanyDetail = () => {
  const { id } = useLocalSearchParams();
  const { startups } = useStartups();
  const { user } = useUser();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [editableDescription, setEditableDescription] = useState("");
  const [editableFacebook, setEditableFacebook] = useState("");
  const [editableInstagram, setEditableInstagram] = useState("");
  const [editableWebsite, setEditableWebsite] = useState("");
  const [editableImage, setEditableImage] = useState<
    ImageSourcePropType | null | string
  >(null);

  const tokenDataGetter = async () => {
    const metadata = await getTokenMetadata({
      mint: company?.token.mint_address!,
      userTokenAddress: user?.wallet_public_key!,
    });
    if (metadata) setTokenData(metadata);
  };

  // Find the company by ID
  const company = startups?.find((company) => company.id === id);

  useEffect(() => {
    tokenDataGetter();
    if (company && user) {
      setEditableDescription(company?.description || "");
      setEditableFacebook(company?.facebook || "");
      setEditableInstagram(company?.instagram || "");
      setEditableWebsite(company?.website || "");
      setEditableImage(company?.startup_image || null);
    }
  }, [company, user]);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEditableImage(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    const updatedData = {
      description: editableDescription,
      facebook: editableFacebook,
      instagram: editableInstagram,
      website: editableWebsite,
      startup_image: editableImage,
    };

    // Send updatedData via HTTP request
    console.log("Updated data to be sent: ", updatedData);
    // Add your HTTP request logic here
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Editable Image */}
        <TouchableOpacity onPress={handleImagePicker}>
          <Image source={{ uri: editableImage }} style={styles.companyImage} />
          <Text style={styles.editText}>Edit Image</Text>
        </TouchableOpacity>

        {/* Editable Token Information */}
        <View style={styles.tokenSection}>
          <Image
            source={{ uri: tokenData?.metadata.uri }}
            style={styles.tokenImage}
          />
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>
              {tokenData?.metadata.name} (
              {tokenData?.metadata.symbol?.toUpperCase()})
            </Text>
            <Text style={styles.issuedShares}>
              {company?.shares} shares issued
            </Text>
          </View>
        </View>

        {/* Editable Company Name */}
        <Text style={styles.companyName}>{company?.name}</Text>

        {/* Editable Company Description */}
        <TextInput
          style={styles.companyDescription}
          value={editableDescription}
          onChangeText={setEditableDescription}
          multiline
        />

        <View style={styles.divider} />

        {/* Editable Social Links */}
        <View style={{ justifyContent: "flex-start", gap: 8 }}>
          <View style={styles.socials}>
            <FontAwesome5 name="facebook-square" size={24} color="#1877F2" />
            <TextInput
              style={styles.socialInput}
              value={editableFacebook}
              onChangeText={setEditableFacebook}
              placeholder="Enter Facebook URL"
            />
          </View>
          <View style={styles.socials}>
            <FontAwesome6 name="square-instagram" size={24} color="#FD1D1D" />
            <TextInput
              style={styles.socialInput}
              value={editableInstagram}
              onChangeText={setEditableInstagram}
              placeholder="Enter Instagram URL"
            />
          </View>
          <View style={styles.socials}>
            <MaterialCommunityIcons name="web" size={24} color="white" />
            <TextInput
              style={styles.socialInput}
              value={editableWebsite}
              onChangeText={setEditableWebsite}
              placeholder="Enter Website URL"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 220,
  },
  companyImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  editText: {
    color: "#ACF41A",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FBFBFB",
    textAlign: "center",
    marginBottom: 8,
  },
  companyDescription: {
    fontSize: 16,
    color: "#797A7B",
    textAlign: "justify",
    marginBottom: 20,
    borderColor: "#797A7B",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#2D2E2D",
    marginVertical: 16,
  },
  tokenSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2D2E2D",
    borderRadius: 8,
    padding: 12,
  },
  tokenImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FBFBFB",
    marginBottom: 4,
  },
  issuedShares: {
    fontSize: 14,
    color: "#ACF41A",
  },
  socials: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  socialInput: {
    flex: 1,
    color: "white",
    borderBottomColor: "#797A7B",
    borderBottomWidth: 1,
    marginLeft: 8,
    padding: 4,
  },
  saveButton: {
    backgroundColor: "#ACF41A",
    borderRadius: 5,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#121212",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CompanyDetail;
