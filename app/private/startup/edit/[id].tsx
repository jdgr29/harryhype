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
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { TokenData } from "@/types/token.types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { supabase } from "@/libs/supabase";
import * as ImageManipulator from "expo-image-manipulator";
import { supabaseImageUploader } from "@/utils/supabase.bucket";
import { useStartup } from "@/hooks/useStartup";

const base_url = process.env.EXPO_PUBLIC_BASE_API_URL!;
const token_data_getter =
  process.env.EXPO_PUBLIC_TOKEN_BALANCE_AND_METADATA_GETTER!;
const CompanyDetail = () => {
  const { id } = useLocalSearchParams();
  const { startup: company } = useStartup(id as string);
  const { user, loading: userLoading } = useUser();
  const [tokenLoading, setTokenLoading] = useState<boolean>(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [editableDescription, setEditableDescription] = useState("");
  const [editableFacebook, setEditableFacebook] = useState("");
  const [editableInstagram, setEditableInstagram] = useState("");
  const [editableWebsite, setEditableWebsite] = useState("");
  const [editableImage, setEditableImage] = useState<
    ImageSourcePropType | null | string
  >(null);

  const tokenDataGetter = async () => {
    try {
      if (company?.token?.mint_address && user?.wallet_public_key) {
        const call = await fetch(
          `${base_url}${token_data_getter}?mint=${company?.token
            ?.mint_address!}&userWallet=${user?.wallet_public_key!}`
        );

        const s = await call.json();
        if (!call.ok) {
          console.log(
            "something has happened getting the token metadata",
            call.status
          );

          return;
        }
        const response = await call.json();

        if (response?.error) {
          console.log("something has happened wrongly", response?.message);
          return;
        }

        setTokenData(response?.message);
      }
    } catch (err) {
      console.log("error getting token metadata while editing startup", err);
    }
  };

  useEffect(() => {
    tokenDataGetter();
    if (company && user) {
      setEditableDescription(company?.description || "");
      setEditableFacebook(company?.facebook || "");
      setEditableInstagram(company?.instagram || "");
      setEditableWebsite(company?.website || "");
      setEditableImage(company?.startup_image || null);
    }
  }, [company?.token?.mint_address, user?.id]);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const compressedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      setEditableImage({
        ...compressedImage,
        fileName: result.assets[0].fileName,
      });
    }
  };

  const form = new FormData();
  const handleSave = async () => {
    form.append("startup_image", {
      uri: editableImage?.uri,
      type: "image/jpeg", // Adjust the type as necessary (ensure this is correct)
      name: editableImage?.fileName,
    });

    const newStartupPhoto = await supabaseImageUploader(
      form!,
      editableImage?.fileName,
      false
    );

    if (!newStartupPhoto) {
      return;
    }
    const updatedData = {
      description: editableDescription,
      facebook: editableFacebook,
      instagram: editableInstagram,
      website: editableWebsite,
      startup_image: newStartupPhoto!,
    };

    const { data, error } = await supabase
      .from("startups")
      .update(updatedData)
      .eq("id", company?.id);

    if (error) {
      Alert.alert("Ha ocurrido algún error ❌");
      console.log("something went wrong update", error);
      return;
    }
    if (!error) {
      Alert.alert("Startup Actualizada ✅");
    }
    return true;
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Editable Image */}
        <TouchableOpacity style={{ width: "100%" }} onPress={handleImagePicker}>
          {!company?.startup_image ? (
            <View
              style={[
                styles.companyImage,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ActivityIndicator size={"large"} color="white" />
            </View>
          ) : (
            <Image
              source={{ uri: editableImage?.uri || company?.startup_image }}
              style={styles.companyImage}
            />
          )}
          <Text style={styles.editText}>Edit Image</Text>
        </TouchableOpacity>

        {/* Editable Token Information */}
        <View style={styles.tokenSection}>
          {tokenData?.metadata?.uri ? (
            <>
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
                  {tokenData?.balance} shares issued
                </Text>
              </View>
            </>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              <ActivityIndicator color={"white"} size={"large"} />
            </View>
          )}
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
    objectFit: "cover",
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
