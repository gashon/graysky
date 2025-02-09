import { Platform, TouchableOpacity } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Stack, useRouter } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";

import { StatusBar } from "~/components/status-bar";
import { Text } from "~/components/text";

export default function ComposerLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <BottomSheetModalProvider>
      <StatusBar modal />
      <Stack screenOptions={{ customAnimationOnGesture: true }}>
        <Stack.Screen name="index" options={{ title: "New Post" }} />
        <Stack.Screen name="drafts" options={{ title: "Drafts" }} />
        <Stack.Screen
          name="gifs"
          options={{
            title: "GIFs",
            headerSearchBarOptions: {},
            headerLargeTitle: true,
            headerLargeTitleShadowVisible: false,
            headerLargeStyle: {
              backgroundColor: theme.colors.card,
            },
            presentation: "modal",
            headerRight:
              Platform.OS === "android"
                ? undefined
                : () => (
                    <Animated.View entering={FadeIn}>
                      <TouchableOpacity onPress={() => router.push("../")}>
                        <Text
                          style={{ color: theme.colors.primary }}
                          className="text-lg font-medium"
                        >
                          Done
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ),
          }}
        />
      </Stack>
    </BottomSheetModalProvider>
  );
}
