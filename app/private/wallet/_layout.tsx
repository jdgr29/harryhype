import { Stack } from "expo-router";

export default function Wallet() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen options={{ headerShown: false }} name="index" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerBackTitle: "Atrás",
          title: "Historial",
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTitleStyle: {
            color: "#f1f1f1",
            fontSize: 24,
          },
        }}
        name="history"
      />
    </Stack>
  );
}
