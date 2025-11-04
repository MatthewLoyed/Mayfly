import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Colors } from "@/constants/theme";
import { AppSplashScreen } from "@/components/splash/SplashScreen";

export default function RootLayout() {
  const [isSplashReady, setIsSplashReady] = useState(false);

  const handleSplashFinish = () => {
    setIsSplashReady(true);
  };

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
});

