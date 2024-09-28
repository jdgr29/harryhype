// components/TabSwitcher.js
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const TabSwitcher = ({ tabs, selectedTab, onTabChange }) => {
  return (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            selectedTab === tab ? styles.activeTab : styles.inactiveTab,
            { marginHorizontal: 8 },
          ]}
          onPress={() => onTabChange(tab)}
        >
          <Text
            style={
              selectedTab === tab
                ? styles.activeTabText
                : styles.inactiveTabText
            }
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#ACF41A", // Active tab color
  },
  inactiveTab: {
    backgroundColor: "#2D2E2D", // Inactive tab color
  },
  activeTabText: {
    color: "#000", // Active tab text color
    fontWeight: "bold",
  },
  inactiveTabText: {
    color: "#FBFBFB", // Inactive tab text color
  },
});

export default TabSwitcher;
