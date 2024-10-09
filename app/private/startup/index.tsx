import React, { useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useStartups } from "@/hooks/useStartups"; // Make sure this is the correct import
import { useUser } from "@/hooks/useUser"; // Import your user hook
import { Startup } from "@/types";

const MyStartups = () => {
  const router = useRouter();
  const { startups, loading, error } = useStartups(); // Get startups from your hook
  const { user } = useUser(); // Get user from your hook

  // Filter startups that belong to the current user
  const userStartups = startups?.filter(
    (startup) => startup.user_id.id === user?.id // Ensure user?.id is defined
  );

  const handleDelete = (id: string) => {
    console.log("Delete Startup", id);
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

  const renderStartup = ({ item }: { item: Startup }) => (
    <View style={styles.startupCard}>
      <Image source={{ uri: item.startup_image }} style={styles.startupImage} />
      <View style={styles.startupInfo}>
        <Text style={styles.startupName}>{item.name}</Text>
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
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <FlatList
        data={userStartups} // Use filtered startups for the user
        renderItem={renderStartup}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
    height: 700,
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
    width: 80,
    alignItems: "center",
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#FF4136",
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: 80,
    alignItems: "center",
  },
  buttonText: {
    color: "#f1f1f1",
    fontSize: 14,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#ACF41A",
    borderRadius: 5,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#f1f1f1",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyStartups;
