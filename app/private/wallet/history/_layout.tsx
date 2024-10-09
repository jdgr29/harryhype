import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="[token]"
    >
      <Stack.Screen name="[token]" />
    </Stack>
  );
}
