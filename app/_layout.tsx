import { AppSplashScreen } from "@/components/splash/SplashScreen";
import { Colors } from "@/constants/theme";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TodoProvider } from "@/contexts/TodoContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [isSplashReady, setIsSplashReady] = useState(false);

  const handleSplashFinish = () => {
    setIsSplashReady(true);
  };

  return (
    <ThemeProvider>
      <TodoProvider>
        <StatusBar style="light" />
        <GestureHandlerRootView style={styles.container}>
          {!isSplashReady && (
            <View style={StyleSheet.absoluteFill}>
              <AppSplashScreen onFinish={handleSplashFinish} />
            </View>
          )}
          {isSplashReady && (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: Colors.dark.background,
                },
              }}
            />
          )}
        </GestureHandlerRootView>
      </TodoProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});

