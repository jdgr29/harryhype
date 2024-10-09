import { Stack } from "expo-router";

export default function DetailsLayout() {
  return (
    <Stack initialRouteName="[id]">
      <Stack.Screen
        options={{
          gestureEnabled: true, // Enable gesture-based navigation
          gestureDirection: "horizontal", // Set the swipe direction
          headerShown: false, // Hide the header if you don't need it
        }}
        name="[id]"
      />
    </Stack>
  );
}
