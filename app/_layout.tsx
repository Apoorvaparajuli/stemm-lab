import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#2563EB",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "700",
          },
          contentStyle: {
            backgroundColor: "#F8FAFC",
          },
        }}
      >
        <Stack.Screen
          name="login/index"
          options={{
            title: "Login",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="register/index"
          options={{
            title: "Register",
          }}
        />

        <Stack.Screen
          name="home/index"
          options={{
            title: "STEM App",
          }}
        />

        <Stack.Screen
          name="tasks/index"
          options={{
            title: "Tasks",
          }}
        />

        <Stack.Screen
          name="resources/index"
          options={{
            title: "Resources",
          }}
        />

        <Stack.Screen
          name="map/index"
          options={{
            title: "Map",
          }}
        />

        <Stack.Screen
          name="safety/index"
          options={{
            title: "Safety",
          }}
        />

        <Stack.Screen
          name="profile/index"
          options={{
            title: "Profile",
          }}
        />

        <Stack.Screen
          name="settings/index"
          options={{
            title: "Settings",
          }}
        />
      </Stack>
    </>
  );
}