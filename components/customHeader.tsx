import React from "react";
import { TextInput, StyleSheet, SafeAreaView } from "react-native";
import { BlurView } from "expo-blur"; // Import the BlurView
import TabSwitcher from "./customTabSwitcher";

interface CustomHeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  onSearch: (text: string) => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  selectedTab,
  onTabChange,
  onSearch,
}) => {
  return (
    <SafeAreaView>
      <BlurView intensity={6} style={styles.headerContainer}>
        <TabSwitcher
          tabs={["Todas", "Recientes", "Populares"]}
          selectedTab={selectedTab}
          onTabChange={onTabChange}
        />
        <BlurView intensity={10} style={{ width: "100%", borderRadius: 8 }}>
          <TextInput
            placeholder="Search"
            placeholderTextColor="#f1f1f1"
            style={styles.searchBar}
            onChangeText={onSearch} // Pass search text up to parent
          />
        </BlurView>
      </BlurView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    width: "100%", // Ensure it takes full width
  },
  searchBar: {
    height: 44,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    paddingHorizontal: 10,
    color: "#FBFBFB",
  },
});

export default CustomHeader;
