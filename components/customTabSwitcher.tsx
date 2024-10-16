// components/TabSwitcher.js
import { BlurView } from "expo-blur";
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

const TabSwitcher = ({ tabs, selectedTab, onTabChange }: any) => {
  return (
    <View style={{ width: "100%" }}>
      <BlurView
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          width: "100%",
          padding: 8,
        }}
        intensity={10}
      >
        <Text
          style={{
            color: "#FBFBFB",
            fontSize: 44,
            fontStyle: "italic",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Harry Hype
        </Text>
      </BlurView>
      <View style={styles.tabContainer}>
        {tabs.map((tab: any) => (
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
    backgroundColor: "#6200ee", // Active tab color
  },
  inactiveTab: {
    backgroundColor: "#2D2E2D", // Inactive tab color
  },
  activeTabText: {
    color: "#FBFBFB", // Active tab text color
    fontWeight: "bold",
  },
  inactiveTabText: {
    color: "#FBFBFB", // Inactive tab text color
  },
});

export default TabSwitcher;
