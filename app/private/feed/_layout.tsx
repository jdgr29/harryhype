// app/feed/_layout.tsx
import { Stack } from "expo-router";
import React, { useState } from "react";
import CustomHeader from "@/components/customHeader";

export default function FeedLayout() {
  const [selectedTab, setSelectedTab] = useState("Feed"); // State to manage selected tab
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // You can implement search logic here
  };

  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        options={{
          headerTransparent: true,
          header: (props) => (
            <CustomHeader
              {...props}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              onSearch={handleSearch}
            />
          ),
        }}
        name="index"
      />
      <Stack.Screen
        options={{
          title: "",
          headerBackVisible: true,
          headerBackTitle: "Regresar",
          headerTransparent: true,
        }}
        name="details"
      />
    </Stack>
  );
}
