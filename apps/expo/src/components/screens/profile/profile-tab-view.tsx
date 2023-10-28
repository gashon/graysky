import { useCallback, useState } from "react";
import { Platform, RefreshControl } from "react-native";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";

import { createTopTabsScreenOptions } from "~/lib/utils/top-tabs";
import { QueryWithoutData } from "../../query-without-data";
import {
  useDefaultHeaderHeight,
  useProfile,
  useProfileFeeds,
  useProfileLists,
} from "./hooks";
import { ProfileFeeds } from "./profile-feeds";
import { ProfileInfo } from "./profile-info";
import { ProfileLists } from "./profile-lists";
import { ProfilePosts } from "./profile-posts";

interface Props {
  handle: string;
  initial?: string;
  backButton?: boolean;
}

export const ProfileTabView = ({
  handle,
  initial = "posts",
  backButton,
}: Props) => {
  const profile = useProfile(handle);
  const feeds = useProfileFeeds(handle);
  const lists = useProfileLists(handle);
  const theme = useTheme();
  const headerHeight = useDefaultHeaderHeight();
  const queryClient = useQueryClient();
  const { top } = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);

  const numberOfFeeds = feeds.data?.pages?.[0]?.feeds?.length ?? 0;
  const numberOfLists = lists.data?.pages?.[0]?.lists?.length ?? 0;

  const profileRefetch = profile.refetch;
  const feedsRefetch = feeds.refetch;
  const listsRefetch = lists.refetch;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      profileRefetch(),
      feedsRefetch(),
      listsRefetch(),
      queryClient.invalidateQueries(["profile", handle, "feed"]),
    ])
      .catch(() => console.error("Failed to refresh profile"))
      .finally(() => setRefreshing(false));
  }, [profileRefetch, feedsRefetch, listsRefetch, handle, queryClient]);

  const renderProfileInfo = useCallback(() => {
    if (profile.data) {
      return <ProfileInfo profile={profile.data} backButton={backButton} />;
    }
    return null;
  }, [profile.data, backButton]);

  if (profile.data) {
    return (
      <ScrollView
        nestedScrollEnabled
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.text}
            progressViewOffset={Platform.OS === "ios" ? top / 2 : undefined}
          />
        }
      >
        <StatusBar style="light" backgroundColor="black" />
        <Stack.Screen
          options={{
            headerShown: false,
            title: profile.data.displayName ?? `@${profile.data.handle}`,
          }}
        />
        <Tabs.Container
          minHeaderHeight={headerHeight}
          initialTabName={initial}
          headerContainerStyle={{ shadowOpacity: 0, elevation: 0 }}
          renderTabBar={(props) => (
            <MaterialTabBar {...props} {...createTopTabsScreenOptions(theme)} />
          )}
          renderHeader={renderProfileInfo}
          lazy
        >
          <Tabs.Tab name="posts" label="Posts">
            <ProfilePosts mode="posts" handle={handle} />
          </Tabs.Tab>
          <Tabs.Tab name="replies" label="Replies">
            <ProfilePosts mode="replies" handle={handle} />
          </Tabs.Tab>
          <Tabs.Tab name="media" label="Media">
            <ProfilePosts mode="media" handle={handle} />
          </Tabs.Tab>
          <Tabs.Tab name="likes" label="Likes">
            <ProfilePosts mode="likes" handle={handle} />
          </Tabs.Tab>
          {numberOfFeeds === 0 ? null : (
            <Tabs.Tab name="feeds" label="Feeds">
              <ProfileFeeds handle={handle} />
            </Tabs.Tab>
          )}
          {numberOfLists === 0 ? null : (
            <Tabs.Tab name="lists" label="Lists">
              <ProfileLists handle={handle} />
            </Tabs.Tab>
          )}
        </Tabs.Container>
      </ScrollView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerTransparent: true,
        }}
      />
      <QueryWithoutData query={profile} />
    </>
  );
};
