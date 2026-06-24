import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import "../global.css";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [ready, setReady] = useState(false);
  const hasInitialized = useRef(false);

  // ✅ Delay ready state to ensure Stack is fully mounted
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Use microtask queue to ensure render is complete
    queueMicrotask(() => {
      setReady(true);
    });
  }, []);

  // ✅ Only run auth check after Stack is mounted
  useEffect(() => {
    if (!ready) return;

    const inTabs = segments[0] === "(tabs)";
    if (!isAuthenticated && inTabs) {
      router.replace("/");
    }
  }, [isAuthenticated, segments, ready]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
