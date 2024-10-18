import React, { useState, useEffect } from "react";
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
  Animated,
  ActivityIndicator,
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
import * as SecureStore from "expo-secure-store"; // For secure storage

const base_url = process.env.EXPO_PUBLIC_BASE_API_URL!;
const tokens_metadata_and_balance_getter =
  process.env.getalltokenmetadataandbalance!;
const WalletScreen = () => {
  const [privateKeyVisible, setPrivateKeyVisible] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [tokenDataMap, setTokenDataMap] = useState<{
    [key: string]: TokenData;
  }>({});
  const { user } = useUser();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  // Loading states
  const [loading, setLoading] = useState(true);
  const [sendingTokens, setSendingTokens] = useState(false);

  // Animation for modal
  const modalAnim = new Animated.Value(0);

  // Start modal animation
  const animateModal = () => {
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCopyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text); // Copy text to clipboard
      Alert.alert("Copied to Clipboard", text); // Show confirmation alert
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      Alert.alert("Error", "Failed to copy to clipboard.");
    }
  };

  const handlePrivateKeyToggle = async () => {
    if (privateKeyVisible) {
      setPrivateKeyVisible(false);
    } else {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to view private key",
        });
        if (result.success) {
          const secretKey = await SecureStore.getItemAsync("wallet_secret_key");
          setPrivateKeyVisible(true);
        } else {
          Alert.alert("Authentication Failed", "Unable to unlock private key.");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        Alert.alert("Error", "Failed to authenticate.");
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

  // UseEffect to fetch token data once
  useEffect(() => {
    const fetchTokenData = async () => {
      setLoading(true); // Start loading
      try {
        if (!user?.id) {
          console.log(" fetching token necesita el user id");
          
          return;
        }
        const response = await fetch(
          `${base_url}${tokens_metadata_and_balance_getter}?userId=${user?.id}`
        );
        if (!response.ok) {
          console.log("algo ha salido mal", response.status);
          return;
        }
        const data = await response.json();

        if (data.error) {
          console.log("algo ha salido mal", data.message);
          return;
        }
        setTokenDataMap(data?.message);
      } catch (error) {
        console.error("Error fetching token metadata:", error);
        Alert.alert("Error", "Failed to fetch token metadata.");
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchTokenData();
  }, [user?.id]);

  const renderToken = ({ item }: { item: TokenData }) => {
    if (!item?.metadata?.uri) {
      return <ActivityIndicator size={"large"} color={"yellow"} />;
    }

    return (
      <TouchableOpacity
        onPress={() => handleTokenPress(item)}
        style={styles.tokenItem}
      >
        <Image
          style={styles.tokenImage}
          source={{ uri: item?.metadata?.uri }}
        />
        <View>
          <Text style={styles.tokenName}>
            {item?.metadata?.name || "n/a"} ({item?.metadata?.symbol || "n/a"})
          </Text>
          <Text style={styles.tokenAmount}>
            Balance: {item?.balance || "n/a"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Input validation for the modal
  const handleSendTokens = async () => {
    if (!recipientAddress || !amount) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (isNaN(Number(amount))) {
      Alert.alert("Error", "Amount must be a valid number.");
      return;
    }

    setSendingTokens(true); // Start sending tokens
    try {
      // Proceed with sending tokens logic here
      // Example: await sendTokens(recipientAddress, amount);

      Alert.alert("Success", "Tokens sent successfully!");
    } catch (error) {
      console.error("Error sending tokens:", error);
      Alert.alert("Error", "Failed to send tokens.");
    } finally {
      setSendingTokens(false); // Stop sending tokens
      setShowSendModal(false); // Close modal after sending
    }
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
                  {user?.wallet_secret_key?.slice(0, 15)}...
                </Text>
                <AntDesign name="copy1" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePrivateKeyToggle}
                style={styles.showKeyButton}
              >
                <AntDesign name="eyeo" size={24} color="white" />
                <Text style={[styles.showKeyText, { fontWeight: "bold" }]}>
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
        {loading ? (
          <ActivityIndicator size="large" color="#6200ee" />
        ) : (
          <FlatList
            data={tokenDataMap || []} // Ensures tokens is always iterable
            renderItem={renderToken}
            keyExtractor={(item) => item?.metadata?.uri}
            style={styles.tokenList}
            ListHeaderComponent={
              <Text style={styles.tokenHeader}>My Token Shares</Text>
            }
          />
        )}

        {/* Modal for Sending Transactions */}
        <Modal
          visible={showSendModal}
          transparent={true}
          animationType="slide"
          onShow={animateModal}
        >
          <Animated.View
            style={[styles.modalContainer, { opacity: modalAnim }]}
          >
            <Text style={styles.modalTitle}>Send Tokens</Text>
            <TextInput
              placeholder="Recipient Address"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              style={styles.input}
            />
            <TextInput
              placeholder="Amount"
              value={amount}
              keyboardType="numeric"
              onChangeText={setAmount}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={handleSendTokens}
              style={styles.sendButton}
              disabled={sendingTokens}
            >
              {sendingTokens ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send Tokens</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSendModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Add your existing styles here
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    color: "white",
    fontSize: 24,
    marginTop: 8,
  },
  walletAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  walletAddress: {
    color: "white",
    fontSize: 16,
  },
  privateKeyContainer: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  privateKeyLabel: {
    color: "gray",
    fontSize: 14,
  },
  privateKey: {
    color: "white",
    fontSize: 16,
  },
  showKeyButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  showKeyText: {
    color: "white",
    marginLeft: 8,
  },
  tokenList: {
    marginBottom: 16,
  },
  tokenHeader: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tokenItem: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tokenImage: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  tokenName: {
    color: "white",
    fontSize: 16,
  },
  tokenAmount: {
    color: "gray",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    padding: 24,
    borderRadius: 8,
  },
  modalTitle: {
    color: "white",
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    height: 48,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    color: "white",
  },
  sendButton: {
    backgroundColor: "#6200ee",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "gray",
    fontSize: 16,
  },
});

export default WalletScreen;
