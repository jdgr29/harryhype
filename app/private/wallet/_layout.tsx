import { Stack } from "expo-router";

export default function Wallet() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen options={{ headerShown: false }} name="index" />
    </Stack>
  );
}
