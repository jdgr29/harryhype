import { Stack } from "expo-router";

export default function Profile() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTitle: "Perfil",
          headerTitleStyle: {
            fontSize: 24,
            color: "white",
          },
        }}
        name="index"
      />
    </Stack>
  );
}
