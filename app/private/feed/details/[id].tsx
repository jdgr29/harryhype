// app/company/[id].js
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";

const CompanyDetail = () => {
  const { id } = useLocalSearchParams();

  // Sample data
  const company = {
    id: id,
    imageUrl: `https://picsum.photos/seed/${id}/600/800`,
    name: `Company ${id}`,
    description: `Description for Company ${id}. This is a brief overview of what the company does.`,
    sharesIssued: (Math.floor(Math.random() * 10000) + 1000).toLocaleString(),
    shareName: "Share Name",
    shareAbbreviation: "SHR",
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: company.imageUrl }} style={styles.image} />
      <Text style={styles.companyName}>{company.name}</Text>
      <Text style={styles.companyDescription}>{company.description}</Text>
      <Text style={styles.sharesText}>
        Shares Issued: {company.sharesIssued} {company.shareName} (
        {company.shareAbbreviation})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 10,
  },
  companyDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  sharesText: {
    fontSize: 16,
  },
});

export default CompanyDetail;
