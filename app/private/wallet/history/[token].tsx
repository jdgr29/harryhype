import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { TokenData } from "@/types";

const TransactionHistoryScreen = () => {
  const { token: stringifiedToken } = useLocalSearchParams();
  const token: TokenData = JSON.parse(stringifiedToken);

  const transactions: any = [];

  const renderTransaction = ({ item }: { item: any }) =>
    transactions.length !== 0 ? (
      <View style={styles.transactionItem}>
        <Text style={styles.transactionType}>{item.type}</Text>
        <Text style={styles.transactionAmount}>Amount: {item.amount}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
    ) : (
      <Text style={{ color: "#f1f1f1", fontSize: 26 }}>
        Aún no tienes transacciones
      </Text>
    );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Image
          style={{
            width: 73,
            height: 73,
            objectFit: "cover",
            borderRadius: 100,
          }}
          source={{ uri: token.metadata.uri }}
          alt="token image"
        />
        <View>
          <Text style={styles.header}>
            {token.metadata.name} ({token.metadata.symbol?.toUpperCase()})
          </Text>
          <Text style={styles.balance}>Balance: {token.balance} Tokens</Text>
        </View>
        {/* //TODO fetch the company creating the fetch startup (only one) method  */}
        <TouchableOpacity>
          <Text>Go to Startup</Text>
        </TouchableOpacity>
      </View>

      {/* Send Button */}
      <TouchableOpacity
        style={styles.sendButton}
        onPress={() => {
          Alert.alert("Aún me encuentro trabajando en ello ;)");
        }}
      >
        <Text style={styles.sendButtonText}>Enviar Tokens</Text>
      </TouchableOpacity>

      {/* Transaction History */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={styles.transactionHeader}>Transaction History</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 20, gap: 16 },
  header: { color: "white", fontSize: 24, marginBottom: 10 },
  balance: { color: "white", fontSize: 18, marginBottom: 10 },
  publicAddress: { color: "#007bff", marginBottom: 5 },
  privateKey: { color: "#ffcc00", marginBottom: 20 },
  sendButton: {
    backgroundColor: "#6200ee",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  sendButtonText: { color: "white", fontWeight: "bold" },
  transactionHeader: { color: "white", fontSize: 18, marginVertical: 10 },
  transactionItem: {
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionType: { color: "white", fontSize: 16 },
  transactionAmount: { color: "#aaa" },
  transactionDate: { color: "#888" },
});

export default TransactionHistoryScreen;
