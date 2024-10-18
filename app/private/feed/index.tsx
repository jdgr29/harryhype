import React, { useState, useCallback, useRef } from "react";
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
  Animated,
} from "react-native";
import { router } from "expo-router";
import { useStartups } from "@/hooks/useStartups";
import { Startup } from "@/types/startups.types";

const { width, height } = Dimensions.get("window");

const CompanyItem: React.FC<{
  item: Startup;
  onNavigate: (id: string) => void;
  index: number;
  scrollY: Animated.Value;
}> = React.memo(({ item, onNavigate, index, scrollY }) => {
  const inputRange = [
    (index - 1) * height,
    index * height,
    (index + 1) * height,
  ];
  const scale = scrollY.interpolate({
    inputRange,
    outputRange: [0.9, 1, 0.9],
    extrapolate: "clamp",
  });
  const opacity = scrollY.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[styles.imageContainer, { transform: [{ scale }], opacity }]}
    >
      <TouchableOpacity onPress={() => onNavigate(item.id)} activeOpacity={0.9}>
        <Image
          source={{
            uri: item?.startup_image,
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.companyName}>{item.name}</Text>
          <Text numberOfLines={5} style={styles.companyDescription}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
      {/* <View style={styles.interactionContainer}>
        <TouchableOpacity style={styles.likeButton}>
          <AntDesign name="heart" size={24} color="red" />
          <Text style={styles.interactionText}>{item.likes}</Text>
        </TouchableOpacity>
      </View> */}
    </Animated.View>
  );
});

const ImageFeed: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filters] = useState("Todas");
  const [search] = useState("");
  const { startups, loading, error, hasMore } = useStartups(
    page,
    10,
    filters,
    search
  );

  const flatListRef = useRef<FlatList>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const loadMoreImages = useCallback(() => {
    if (!loading && hasMore) {
      setTimeout(() => setPage((prev) => prev + 1), 300); // Debounce the load more function
    }
  }, [loading, hasMore]);

  const handleViewableItemsChanged = useCallback(
    ({ changed }: { changed: any[] }) => {
      if (changed && changed.length > 0) {
        // You can use this to track the current visible item if needed
      }
    },
    []
  );

  const viewabilityConfig = { itemVisiblePercentThreshold: 50 };

  const renderItem = useCallback(
    ({ item, index }: { item: Startup; index: number }) => (
      <CompanyItem
        item={item}
        onNavigate={(id) =>
          router.push({
            pathname: "/private/feed/details/[id]",
            params: { id },
          })
        }
        index={index}
        scrollY={scrollY}
      />
    ),
    [scrollY] // Ensure dependencies are minimal and won't trigger re-renders
  );

  const getItemLayout = useCallback(
    (_: any, index: any) => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  const keyExtractor = useCallback((item: Startup) => item.id, []);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  if (loading && page === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f1f1f1" />
      </View>
    );
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={"default"}
        translucent
        backgroundColor="transparent"
      />
      <Animated.FlatList
        ref={flatListRef}
        data={startups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={loadMoreImages}
        onEndReachedThreshold={0.1}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={3} // Reduce windowSize for better performance
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={onScroll}
        scrollEventThrottle={30} // Reduce the scroll event throttle to reduce event frequency
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  imageContainer: {
    height: height,
    width: width,
    justifyContent: "flex-end",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 200,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 10,
  },
  companyName: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  companyDescription: {
    fontSize: 16,
    color: "white",
  },
  interactionContainer: {
    position: "absolute",
    right: 10,
    bottom: 100,
  },
  likeButton: {
    alignItems: "center",
  },
  interactionText: {
    color: "white",
    marginTop: 5,
  },
});

export default ImageFeed;
