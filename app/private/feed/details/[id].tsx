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
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { TokenData } from "@/types/token.types";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useStartup } from "@/hooks/useStartup";

const base_url = process.env.EXPO_PUBLIC_BASE_API_URL!;
const shares_getter_api = process.env.EXPO_PUBLIC_SHARES_ISSUES_GETTER!;
const token_data_getter =
  process.env.EXPO_PUBLIC_TOKEN_BALANCE_AND_METADATA_GETTER!;

const CompanyDetail = () => {
  const { id } = useLocalSearchParams();
  const { user } = useUser();
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const {
    startup,
    loading: startupLoading,
    error: startupError,
  } = useStartup(id as string);
  const [publishedShares, setPublishedShares] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    if (startup?.token?.mint_address) getSharesIssued(); //TODO finish
  }, [startup?.token?.mint_address]);
  const getterHandler = async () => {
    if (startup?.token?.mint_address && user?.id) {
      const call = await fetch(
        `${base_url}${token_data_getter}?mint=${startup?.token
          ?.mint_address!}&userWallet=${user?.wallet_public_key!}`
      );
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
  };

  useEffect(() => {
    if (startup?.token?.mint_address && user?.id) {
      getterHandler();
    }
  }, [startup?.token?.mint_address, user?.id]);

  if (!startup) {
    return (
      <View style={styles.wrapper}>
        <Text style={styles.errorText}>Company not found</Text>
      </View>
    );
  }

  const handleCall = () => {
    const phoneNumber = startup.telephone_number;
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
    const phoneNumber = startup.whatsapp;
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
  const getSharesIssued = async () => {
    try {
      // Ensure mintAddress exists
      const mintAddress = startup?.token?.mint_address;
      if (!mintAddress) {
        console.error("Mint address is missing");
        return;
      }

      const response = await fetch(`${base_url}${shares_getter_api}`, {
        method: "POST",
        body: JSON.stringify({ mintAddress: mintAddress }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        Alert.alert(
          "no hemos podido conseguir la cantidad de shares publicadas"
        );
      }

      const data = await response.json();
      if (!data.err) {
        setPublishedShares(data?.supply);
      }
      return data;
    } catch (err) {
      console.error("Error getting shares:", err);
    }
  };

  const handleOpenURL = (url: string) => {
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
      {tokenData?.metadata?.uri ? (
        <>
          {/* Company Image */}

          <Image
            source={{ uri: startup?.startup_image }}
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
                  {publishedShares || "N/A"} shares issued
                </Text>
              </View>
            </View>
            {/* Company Name */}
            <Text style={styles.companyName}>{startup?.name}</Text>

            {/* Company Description */}
            <Text style={styles.companyDescription}>
              {startup?.description}
            </Text>

            <View style={styles.divider} />
            <View style={{ justifyContent: "flex-start", gap: 8 }}>
              <TouchableOpacity
                style={styles.socials}
                // onPress={() => handleOpenURL(startup.facebook)}
              >
                <FontAwesome5
                  name="facebook-square"
                  size={24}
                  color="#1877F2"
                />
                <Text style={{ color: "white" }}>
                  {startup.facebook || "Este startup aún no tiene Facebook"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socials}
                // onPress={() => handleOpenURL(startup.instagram)}
              >
                <FontAwesome6
                  name="square-instagram"
                  size={24}
                  color="#FD1D1D"
                />
                <Text style={{ color: "white" }}>
                  {startup.instagram || "Este startup aún no tiene Instagram"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socials}
                onPress={() => handleOpenURL(startup.website)}
              >
                <MaterialCommunityIcons name="web" size={24} color="white" />
                <Text style={{ color: "white" }}>
                  {startup.website || "Este startup aún no tiene website"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socials} onPress={handleCall}>
                <FontAwesome name="phone" size={24} color="white" />
                <Text style={{ color: "white" }}>
                  {startup.telephone_number ||
                    "Este startup aún no tiene un número al cual llamar"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socials} onPress={handleWhatsApp}>
                <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
                <Text style={{ color: "white" }}>
                  {startup.whatsapp || "Este startup aún no tiene WhatsApp"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      ) : (
        <View
          style={{ justifyContent: "center", alignItems: "center", flex: 1 }}
        >
          <ActivityIndicator color="white" size={"large"} />
        </View>
      )}
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
    objectFit: "cover",
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
