import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTitleStyle: {
            color: "#f1f1f1",
          },
          headerTransparent: true,
        }}
        name="index"
      />
      <Stack.Screen
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#121212",
          },
          headerTitleStyle: {
            color: "#f1f1f1",
          },
          headerTransparent: true,
        }}
        name="register"
      />
    </Stack>
  );
}
