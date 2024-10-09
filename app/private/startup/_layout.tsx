import CustomAddStartUpHeader from "@/components/addStartUpHeader";
import { Stack } from "expo-router";

export default function Tab() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#121212",
        },
        headerTitleStyle: {
          color: "#f1f1f1",
          fontSize: 24,
        },
      }}
      initialRouteName="index"
    >
      <Stack.Screen
        options={{
          title: "My StartUps",
          headerRight: () => CustomAddStartUpHeader(),
        }}
        name="index"
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Crea tu Startup",
          headerBackTitle: "Atrás",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edita tu Startup",
          headerBackTitle: "Atrás",
        }}
      />
    </Stack>
  );
}
