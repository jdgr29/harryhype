import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useStartups } from "@/hooks/useStartups";
import { useUser } from "@/hooks/useUser";
import { Startup } from "@/types";
import { supabase } from "@/libs/supabase";
import Ionicons from "@expo/vector-icons/Ionicons";

const base_url = process.env.EXPO_PUBLIC_BASE_API_URL!;
const mint_shares_api = process.env.EXPO_PUBLIC_MINT_SHARES!;
const MyStartups = () => {
  const router = useRouter();
  const { startups, loading, error } = useStartups();
  const { user } = useUser();
  const [sessionToken, setSessionToken] = useState<null | string | undefined>(
    null
  );
  const [isMinting, setIsMinting] = useState(false);

  useEffect(() => {
    const sessionGetter = async () => {
      const token = await supabase.auth.getSession();
      if (!token.data) {
        return;
      }
      setSessionToken(token.data.session?.access_token);
    };
    sessionGetter();
  }, []);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Delete confirmation modal state
  const [tokensToMint, setTokensToMint] = useState(""); // Token amount input
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(
    null
  );

  // Filter startups for the current user
  const userStartups = startups?.filter(
    (startup) => startup.user_id.id === user?.id
  );

  // Trigger the delete confirmation modal
  const handleConfirmDelete = (id: string) => {
    setSelectedStartupId(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    const { status, error } = await supabase
      .from("startups")
      .delete()
      .eq("id", selectedStartupId);

    if (error) {
      console.log("error deleting startup", error.message);
    }
    if (status === 204) {
      Alert.alert("Startup borrada ✅");
    }
    setDeleteModalVisible(false); // Close delete modal
  };

  const handlerNavigate = useCallback(
    (id: string) => {
      router.push({
        params: { id: id },
        pathname: "/private/startup/edit/[id]",
      });
    },
    [router]
  );

  // Handle the Tokenizar button
  const handleTokenizarPress = (startupId: string) => {
    setSelectedStartupId(startupId);
    setModalVisible(true); // Show modal
  };

  // Handle Mint button
  const handleMint = async () => {
    if (!tokensToMint || !selectedStartupId) {
      Alert.alert("Error", "Please specify a valid amount.");
      return;
    }

    const body = {
      amount_to_mint: tokensToMint,
      startup_id: selectedStartupId,
    };

    setIsMinting(true); // Set minting state to true

    try {
      const response = await fetch(`${base_url}${mint_shares_api}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Tokens minted successfully!");
        setModalVisible(false);
        setTokensToMint("");
      } else {
        Alert.alert("Error", result.message || "Failed to mint tokens.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong while minting.");
    } finally {
      setIsMinting(false); // Reset minting state
    }
  };

  const renderStartup = ({ item }: { item: Startup }) => (
    <View style={styles.startupCard}>
      <Image source={{ uri: item.startup_image }} style={styles.startupImage} />
      <View style={styles.startupInfo}>
        <Text numberOfLines={2} style={styles.startupName}>
          {item.name}
        </Text>
        <Text
          numberOfLines={3}
          ellipsizeMode="tail"
          style={styles.startupDescription}
        >
          {item.description}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handlerNavigate(item.id)}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleConfirmDelete(item.id)} // Show delete confirmation modal
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tokenizeButton}
          onPress={() => handleTokenizarPress(item.id)}
        >
          <Text style={styles.tokenizeButtonText}>
            Tokenizar <Ionicons name="sparkles-sharp" size={24} color="black" />
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          backgroundColor: "#121212",
        }}
      >
        <ActivityIndicator size={"large"} color="white" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={{ height: "100%" }}>
        <FlatList
          data={userStartups}
          renderItem={renderStartup}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Token Minting Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mint Tokens</Text>
            <TextInput
              style={styles.input}
              placeholder="Amount to mint"
              keyboardType="numeric"
              value={tokensToMint}
              placeholderTextColor={"#f1f1f1"}
              onChangeText={setTokensToMint}
            />
            <TouchableOpacity
              style={styles.mintButton}
              onPress={handleMint}
              disabled={isMinting}
            >
              <Text style={styles.mintButtonText}>
                {isMinting ? "Minting..." : "Mint"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Startup</Text>
            <Text style={{ color: "white" }}>
              Are you sure you want to delete this startup?
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.mintButtonText}>Yes, Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDeleteModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  startupCard: {
    backgroundColor: "#2D2E2D",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  startupImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  startupInfo: {
    flex: 1,
    gap: 8,
  },
  startupName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FBFBFB",
    marginBottom: 4,
  },
  startupDescription: {
    fontSize: 14,
    color: "#797A7B",
  },
  actionButtons: {
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#6200ee",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: 100,
    alignItems: "center",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#FF4136",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: 100,
    alignItems: "center",
  },
  tokenizeButton: {
    backgroundColor: "#FADA5E",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: 100,
    alignItems: "center",
  },
  tokenizeButtonText: {
    fontSize: 14,
    color: "#121212",
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: "white",
  },
  mintButton: {
    backgroundColor: "#6200ee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  mintButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#121212",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  buttonText: {},
});

export default MyStartups;
