import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { WorkspaceBanner } from '~/components/workspace-banner';
import { useWorkspaceActivities } from '~/hooks/use-statistics';
import { useActiveWorkspaceStore } from '~/store/active-workspace.store';

const PAGE_SIZE = 10;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatInitials(value: string) {
  if (!value) return 'NA';
  const parts = value.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  return value.slice(0, 2).toUpperCase();
}

export default function ActivityLogScreen() {
  const router = useRouter();
  const activeWorkspace = useActiveWorkspaceStore((s) => s.activeWorkspace);
  const workspaceId = activeWorkspace?.id;

  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useWorkspaceActivities(workspaceId, {
    page,
    limit: PAGE_SIZE,
  });

  const items = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <View className="flex-1 bg-background p-4">
      <WorkspaceBanner />

      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-2xl font-bold text-foreground">Activity log</Text>
          <Text className="text-xs text-muted-foreground">All activity in this workspace.</Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back to statistics"
          className="flex-row items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 active:opacity-80">
          <Feather name="chevron-left" size={14} className="text-foreground" />
          <Text className="text-xs font-medium text-foreground">Back</Text>
        </Pressable>
      </View>

      {!workspaceId ? (
        <Card>
          <Text className="text-sm text-muted-foreground">
            Select a workspace to view activity.
          </Text>
        </Card>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.publicId}
          ItemSeparatorComponent={() => <View className="h-2" />}
          ListEmptyComponent={
            <Card>
              <Text className="text-sm text-muted-foreground">
                {isError ? 'Failed to load activity.' : 'No activity yet.'}
              </Text>
            </Card>
          }
          renderItem={({ item }) => {
            const [, verb] = item.actionType.split('.');
            const actor =
              (item.metadata.actor as { name?: string })?.username ?? 'Someone';
            const target =
              item.metadata.title ?? item.metadata.name ?? item.entityId;
            const context =
              item.metadata.boardName ?? item.metadata.listName ?? undefined;
            return (
              <Card className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Text className="text-xs font-bold text-foreground">
                    {formatInitials(actor)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-foreground" numberOfLines={2}>
                    <Text className="font-semibold text-primary">{actor}</Text>{' '}
                    <Text className="italic text-muted-foreground">{verb}</Text>{' '}
                    on <Text className="font-semibold">{item.entityType}</Text>{' '}
                    <Text className="text-muted-foreground">{target}</Text>
                    {context && (
                      <>
                        {' '}
                        in <Text className="font-medium">{context}</Text>
                      </>
                    )}
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <Badge variant="outline">
                  <Text className="text-[10px] uppercase">{verb}</Text>
                </Badge>
              </Card>
            );
          }}
        />
      )}

      {workspaceId && !isLoading && (
        <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </Text>
          <View className="flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onPress={() => setPage(1)}>
              <Feather name="chevrons-left" size={14} className="text-foreground" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onPress={() => setPage((p) => Math.max(1, p - 1))}>
              <Feather name="chevron-left" size={14} className="text-foreground" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}>
              <Feather name="chevron-right" size={14} className="text-foreground" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onPress={() => setPage(totalPages)}>
              <Feather name="chevrons-right" size={14} className="text-foreground" />
            </Button>
          </View>
        </View>
      )}
    </View>
  );
}
