import React, { useState, useCallback } from "react";
import {
  View,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { useStartups } from "@/hooks/useStartups";
import { Startup } from "@/types/startups.types";
import AntDesign from "@expo/vector-icons/AntDesign";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 60; // Adjust this value according to your header height
const FOOTER_HEIGHT = 18; // Adjust this value according to your footer height
const HEIGHT = Dimensions.get("window").height - HEADER_HEIGHT - FOOTER_HEIGHT; // Adjusted height

// Memoized Item Component
const CompanyItem = React.memo(
  ({ item, onNavigate }: { item: Startup; onNavigate: any }) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={() => onNavigate(item)} activeOpacity={1}>
        <Image
          source={{
            uri:
              item.startup_image ||
              "https://st4.depositphotos.com/17828278/24401/v/450/depositphotos_244011872-stock-illustration-image-vector-symbol-missing-available.jpg",
          }}
          style={styles.image}
          resizeMode="cover"
          onError={() => console.log("Failed to load image")}
        />

        <View style={styles.overlay}>
          <Text style={styles.companyName}>{item.name}</Text>
          <View style={{ height: 200 }}>
            <Text
              ellipsizeMode="tail"
              numberOfLines={11}
              style={styles.companyDescription}
            >
              {item.description}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.interactionContainer}>
        {/* //TODO create function to give likes. or take them out */}
        <TouchableOpacity
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            flexDirection: "row",
            padding: 8,
            alignItems: "center",
            borderRadius: 8,
          }}
        >
          <AntDesign name="heart" size={24} color="red" />
          <Text style={styles.interactionText}>Likes {item.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
);

const ImageFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState("Todas");
  const [search, setSearch] = useState("");
  const { startups, loading, error } = useStartups(page, 10, filters, search);

  const loadMoreImages = () => {
    if (!loadingMore && !loading) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0); // Reset page to 0 to fetch first batch
    setSearch(""); // Reset search if necessary
    setFilters("Todas"); // Reset filters if necessary
    // Call the hook again (it'll fetch the first page)
    setRefreshing(false);
  }, []);

  const handleTabChange = (tab: string) => {
    setFilters(tab);
    setPage(0); // Reset page when changing tabs
  };

  // Define the handleNavigate function
  const handleNavigate = (id: string) => {
    router.push({
      params: {
        id: id,
      },
      pathname: "/private/feed/details/[id]",
    }); // Adjust the route according to your structure
  };

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <CompanyItem item={item} onNavigate={() => handleNavigate(item.id)} /> // Pass the id to the function
    ),
    [handleNavigate]
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#f1f1f1" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={{ backgroundColor: "#121212" }}>
      <StatusBar animated barStyle={"default"} />
      <FlatList
        data={startups}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreImages}
        onEndReachedThreshold={0.1}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator size="large" color="#f1f1f1" />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    height: HEIGHT, // Use the adjusted height
    width: width,
    justifyContent: "flex-end",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 160,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  companyName: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  companyDescription: {
    fontSize: 14,
    color: "white",
    marginBottom: 10,
  },
  shareInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sharesText: {
    fontSize: 16,
    color: "white",
  },
  shareIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 5,
  },
  interactionContainer: {
    position: "absolute",
    padding: 1,
    bottom: 80,
    left: 10,
    right: 10,
    gap: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  interactionText: {
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
});

export default ImageFeed;
