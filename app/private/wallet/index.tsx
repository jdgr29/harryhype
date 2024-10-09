import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTokens } from "@/hooks/useTokens";
import { SupabaseTokenRecord, TokenData } from "@/types";
import { useUser } from "@/hooks/useUser";
import { getTokenMetadata } from "@/services/token";
import * as Clipboard from "expo-clipboard";
import Entypo from "@expo/vector-icons/Entypo";
const WalletScreen = () => {
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [tokenDataMap, setTokenDataMap] = useState<{
    [key: string]: TokenData;
  }>({});
  const { user } = useUser();
  const { tokens } = useTokens();

  const handleCopyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text); // Copy text to clipboard
    Alert.alert("Copied to Clipboard", text); // Show confirmation alert
  };

  const handlePrivateKeyToggle = async () => {
    if (privateKeyVisible) {
      setPrivateKeyVisible(false);
    } else {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to view private key",
      });
      if (result.success) {
        setPrivateKeyVisible(true);
      } else {
        Alert.alert("Authentication Failed", "Unable to unlock private key.");
      }
    }
  };

  const handleTokenPress = (token: TokenData) => {
    router.push({
      params: {
        token: JSON.stringify(token),
      },
      pathname: "/private/wallet/history/[token]",
    });
  };

  const fetchTokenData = async (mintAddress: string) => {
    if (!tokenDataMap[mintAddress]) {
      const metadata = await getTokenMetadata({
        mint: mintAddress,
        userTokenAddress: user?.wallet_public_key!,
      });
      setTokenDataMap((prev) => ({ ...prev, [mintAddress]: metadata }));
    }
  };

  const renderToken = ({ item }: { item: SupabaseTokenRecord }) => {
    fetchTokenData(item.mint_address);

    const tokenData = tokenDataMap[item.mint_address];
    if (!tokenData) {
      return <Text>Loading...</Text>;
    }

    return (
      <TouchableOpacity
        onPress={() => handleTokenPress(tokenData)}
        style={styles.tokenItem}
      >
        <Image
          style={styles.tokenImage}
          source={{ uri: tokenData.metadata.uri }}
        />
        <View>
          <Text style={styles.tokenName}>
            {tokenData.metadata.name || "n/a"} (
            {tokenData.metadata.symbol || "n/a"})
          </Text>
          <Text style={styles.tokenAmount}>
            Balance: {tokenData.balance || "n/a"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        {/* User Profile Section */}
        <View style={styles.profileContainer}>
          <Entypo name="wallet" size={64} color="#6200ee" />
          <Text style={styles.name}>{`${user?.name}'s Wallet` || "n/a"}</Text>
          <View style={styles.walletAddressContainer}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={async () =>
                await handleCopyToClipboard(user?.wallet_public_key!)
              }
            >
              <Text style={styles.walletAddress}>
                {user?.wallet_public_key.slice(0, 15)}...
              </Text>
              <Text style={[styles.walletAddress, { fontWeight: "bold" }]}>
                PublicKey
              </Text>
              <AntDesign name="copy1" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Private Key Section */}
        <View style={styles.privateKeyContainer}>
          <Text style={styles.privateKeyLabel}>Private Key</Text>
          {privateKeyVisible ? (
            <>
              <TouchableOpacity
                onPress={async () =>
                  await handleCopyToClipboard(user?.wallet_secret_key!)
                }
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text style={styles.privateKey}>
                  {user?.wallet_secret_key.slice(0, 15)}...
                </Text>
                <AntDesign name="copy1" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePrivateKeyToggle}
                style={styles.showKeyButton}
              >
                <AntDesign
                  name="eyeo"
                  size={24}
                  color={privateKeyVisible ? "white" : "#FF0000"}
                />
                <Text
                  style={[
                    styles.showKeyText,
                    {
                      color: privateKeyVisible ? "white" : "#FF0000",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  Hide Private Key
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handlePrivateKeyToggle}
              style={styles.showKeyButton}
            >
              <AntDesign name="eye" size={24} color="white" />
              <Text style={styles.showKeyText}>Show Private Key</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Token List Section */}
        <FlatList
          data={tokens}
          renderItem={renderToken}
          keyExtractor={(item) => item.id}
          style={styles.tokenList}
          ListHeaderComponent={
            <Text style={styles.tokenHeader}>My Tokens</Text>
          }
        />

        {/* Modal for Sending Transactions */}
        <Modal visible={showSendModal} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Send Tokens</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Recipient Address"
              placeholderTextColor="#ccc"
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Amount"
              placeholderTextColor="#ccc"
              keyboardType="numeric"
            />
            <TouchableOpacity
              onPress={() => setShowSendModal(false)}
              style={styles.modalSendButton}
            >
              <Text style={styles.modalSendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20 },
  profileContainer: { alignItems: "center", marginBottom: 30 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 18, color: "#FBFBFB" },
  walletAddressContainer: { flexDirection: "row", alignItems: "center" },
  walletAddress: { color: "#ccc", marginRight: 5 },
  privateKeyContainer: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  privateKeyLabel: { color: "white", marginBottom: 10 },
  privateKey: { color: "#f1f1f1" },
  showKeyButton: { flexDirection: "row", alignItems: "center" },
  showKeyText: { color: "white", marginLeft: 10 },
  tokenList: { marginTop: 20 },
  tokenHeader: { color: "white", fontSize: 18, marginBottom: 10 },
  tokenItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 10,
  },
  tokenImage: { width: 50, height: 50, marginRight: 10 },
  tokenName: { color: "white", fontSize: 16 },
  tokenAmount: { color: "#aaa" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalTitle: { color: "white", fontSize: 24, marginBottom: 20 },
  modalInput: {
    backgroundColor: "#333",
    color: "white",
    padding: 10,
    marginVertical: 10,
    width: "80%",
    borderRadius: 10,
  },
  modalSendButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
  },
  modalSendButtonText: { color: "white", fontWeight: "bold" },
});

export default WalletScreen;
