import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen options={{ headerShown: false }} name="private" />
    </Stack>
  );
}
