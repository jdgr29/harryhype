import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useStartups } from "@/hooks/useStartups";
import { useUser } from "@/hooks/useUser";
import { Startup } from "@/types/startups.types";
import { getTokenMetadata } from "@/services/token";
import { SupabaseTokenRecord, TokenData } from "@/types/token.types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

const CompanyDetail = () => {
  const { id } = useLocalSearchParams();
  const { startups, error, loading } = useStartups();
  const { user, error: userError, loading: userLoading } = useUser();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);

  // Find the company by ID
  //TODO actually create a hook to get one company and not need to filter all companies
  const company = startups?.find((company) => company.id === id);

  const getterHandler = async () => {
    const metadata = await getTokenMetadata({
      mint: company?.token.mint_address!,
      userTokenAddress: user?.wallet_public_key!,
    });
    if (metadata) setTokenData(metadata);
  };

  useEffect(() => {
    if (company && user) {
      getterHandler();
    }
  }, [company, user]);

  if (!company) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorText}>Company not found</Text>
      </View>
    );
  }

  const handleCall = () => {
    const phoneNumber = company.telephone_number;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert(
        "No Phone Number",
        "Este startup aún no tiene un número al cual llamar"
      );
    }
  };

  const handleWhatsApp = () => {
    const message = "¡Hola! Me gustaría saber más.";
    const phoneNumber = company.whatsapp;
    if (phoneNumber) {
      Linking.openURL(
        `whatsapp://send?text=${encodeURIComponent(
          message
        )}&phone=${phoneNumber}`
      );
    } else {
      Alert.alert("No WhatsApp", "Este startup aún no tiene WhatsApp");
    }
  };

  const handleOpenURL = (url) => {
    if (url) {
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL: ", err)
      );
    } else {
      Alert.alert("No URL", "Este startup aún no tiene un enlace disponible");
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Company Image */}
      <Image
        source={{ uri: company?.startup_image }}
        style={styles.companyImage}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Token Information */}
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
        {/* Company Name */}
        <Text style={styles.companyName}>{company?.name}</Text>

        {/* Company Description */}
        <Text style={styles.companyDescription}>{company?.description}</Text>

        <View style={styles.divider} />
        <View style={{ justifyContent: "flex-start", gap: 8 }}>
          <TouchableOpacity
            style={styles.socials}
            // onPress={() => handleOpenURL(company.facebook)}
          >
            <FontAwesome5 name="facebook-square" size={24} color="#1877F2" />
            <Text style={{ color: "white" }}>
              {company.facebook || "Este startup aún no tiene Facebook"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socials}
            // onPress={() => handleOpenURL(company.instagram)}
          >
            <FontAwesome6 name="square-instagram" size={24} color="#FD1D1D" />
            <Text style={{ color: "white" }}>
              {company.instagram || "Este startup aún no tiene Instagram"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socials}
            onPress={() => handleOpenURL(company.website)}
          >
            <MaterialCommunityIcons name="web" size={24} color="white" />
            <Text style={{ color: "white" }}>
              {company.website || "Este startup aún no tiene website"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socials} onPress={handleCall}>
            <FontAwesome name="phone" size={24} color="white" />
            <Text style={{ color: "white" }}>
              {company.telephone_number ||
                "Este startup aún no tiene un número al cual llamar"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socials} onPress={handleWhatsApp}>
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
            <Text style={{ color: "white" }}>
              {company.whatsapp || "Este startup aún no tiene WhatsApp"}
            </Text>
          </TouchableOpacity>
        </View>
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
    height: "auto",
    paddingBottom: 220,
  },
  companyImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
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
  errorText: {
    color: "#FF4D4D",
    textAlign: "center",
    marginTop: 20,
  },
  socials: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
});

export default CompanyDetail;
