import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen options={{ headerShown: false }} name="index" />
      <Stack.Screen
        name="auth"
        options={{
          title: "",
          headerTransparent: true,
          headerBackTitle: "Atrás",
          headerStyle: {
            backgroundColor: "#121212",
          },
        }}
      />
      <Stack.Screen options={{ headerShown: false }} name="private" />
    </Stack>
  );
}
