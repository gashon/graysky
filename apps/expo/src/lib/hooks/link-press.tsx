import { useCallback } from "react";
import { Platform, Share } from "react-native";
import { showToastable } from "react-native-toastable";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useTheme } from "@react-navigation/native";
import { CopyIcon, ExternalLinkIcon, Share2Icon } from "lucide-react-native";

import { actionSheetStyles } from "../utils/action-sheet";

export const useLinkPress = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const theme = useTheme();

  return useCallback(
    (url: string) => {
      const options = ["Open link", "Copy link", "Share link"] as const;
      const icons = [
        <ExternalLinkIcon size={24} color={theme.colors.text} key={0} />,
        <CopyIcon size={24} color={theme.colors.text} key={1} />,
        <Share2Icon size={24} color={theme.colors.text} key={2} />,
        <></>,
      ];
      showActionSheetWithOptions(
        {
          title: url,
          options: [...options, "Cancel"],
          cancelButtonIndex: options.length,
          icons,
          ...actionSheetStyles(theme),
        },
        (index) => {
          if (index === undefined) return;
          switch (options[index]) {
            case "Open link":
              void Linking.openURL(url);
              break;
            case "Copy link":
              void Clipboard.setUrlAsync(url);
              showToastable({
                title: "Copied link",
                message: "Link copied to clipboard",
              });
              break;
            case "Share link":
              void Share.share(
                Platform.select({
                  ios: { url },
                  default: { message: url },
                }),
              );
              break;
          }
        },
      );
    },
    [showActionSheetWithOptions, theme],
  );
};