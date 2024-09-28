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
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 60; // Adjust this value according to your header height
const FOOTER_HEIGHT = 18; // Adjust this value according to your footer height
const HEIGHT = Dimensions.get("window").height - HEADER_HEIGHT - FOOTER_HEIGHT; // Adjusted height

// Memoized Item Component
const CompanyItem = React.memo(
  ({ item, onNavigate }: { item: any; onNavigate: any }) => (
    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={() => onNavigate(item)} activeOpacity={1}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
          onError={() => console.log("Failed to load image")}
        />

        <View style={styles.overlay}>
          <Text style={styles.companyName}>{item.name}</Text>
          <Text style={styles.companyDescription}>{item.description}</Text>
          <View style={styles.shareInfo}>
            <Text style={styles.sharesText}>
              {item.sharesIssued}
              <Image
                source={{ uri: "https://via.placeholder.com/20" }}
                style={styles.shareIcon}
              />
              {item.shareName} ({item.shareAbbreviation})
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.interactionContainer}>
        <TouchableOpacity onPress={() => alert(`Comment on image ${item.id}`)}>
          <Text style={styles.interactionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert(`Share image ${item.id}`)}>
          <Text style={styles.interactionText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert(`Liked image ${item.id}`)}>
          <Text style={styles.interactionText}>Contact Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
);

const ImageFeed = () => {
  const [companies, setCompanies] = useState(
    Array.from({ length: 20 }, (_, index) => ({
      id: String(index + 1),
      imageUrl: `https://picsum.photos/seed/${index}/600/800`,
      name: `Company ${index + 1}`,
      description: `Description for Company ${
        index + 1
      }. This is a brief overview of what the company does.`,
      sharesIssued: (Math.floor(Math.random() * 10000) + 1000).toLocaleString(),
      shareName: "Share Name",
      shareAbbreviation: "SHR",
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const router = useRouter();

  const handleScroll = (event: any) => {
    const index = Math.floor(event.nativeEvent.contentOffset.y / HEIGHT);
    setCurrentIndex(index);
  };

  const loadMoreImages = () => {
    if (loadingMore) return; // Prevent multiple triggers
    setLoadingMore(true);

    // Simulate fetching new data
    setTimeout(() => {
      const newCompanies = Array.from({ length: 20 }, (_, index) => ({
        id: String(companies.length + index + 1),
        imageUrl: `https://picsum.photos/seed/${
          companies.length + index
        }/600/800`,
        name: `Company ${companies.length + index + 1}`,
        description: `Description for Company ${
          companies.length + index + 1
        }. This is a brief overview of what the company does.`,
        sharesIssued: (
          Math.floor(Math.random() * 10000) + 1000
        ).toLocaleString(),
        shareName: "Share Name",
        shareAbbreviation: "SHR",
      }));
      setCompanies((prevCompanies) => [...prevCompanies, ...newCompanies]);
      setLoadingMore(false);
    }, 1500); // Simulate a 2-second load
  };

  const handleNavigate = useCallback(
    (company: any) => {
      router.push({
        params: { id: company.id },
        pathname: "/private/feed/details/[id]",
      });
    },
    [router]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      // Optionally reset your data here
      setRefreshing(false);
    }, 2000); // Simulate a 2-second load
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <CompanyItem item={item} onNavigate={handleNavigate} />
    ),
    [handleNavigate]
  );

  return (
    <>
      <StatusBar animated barStyle={"default"} />
      <FlatList
        data={companies}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        onScroll={handleScroll}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreImages}
        onEndReachedThreshold={0.1}
        snapToInterval={HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: HEIGHT,
          offset: HEIGHT * index,
          index,
        })}
        maxToRenderPerBatch={5} // Customize as needed
        windowSize={10} // Customize as needed
        extraData={currentIndex} // Include state that affects rendering
        refreshing={refreshing} // Pass the refreshing state
        onRefresh={onRefresh} // Set the refresh function
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={{ backgroundColor: "#121212" }}
              size="large"
              color="#f1f1f1"
            />
          ) : null
        } // Loader at the bottom
      />
    </>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
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
    bottom: 100,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  interactionText: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    padding: 10,
    borderRadius: 5,
  },
});

export default ImageFeed;
