import { Stack } from "expo-router";

export default function PmarketLayout() {
  return (
    <Stack>
      <Stack.Screen options={{ headerShown: false }} name="index" />
    </Stack>
  );
}
