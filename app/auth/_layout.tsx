import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" />
    </Stack>
  );
}
