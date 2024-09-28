import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PostCard = ({ content }: { content: string }) => {
  return (
    <View style={styles.card}>
      <Text>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});

export default PostCard;
