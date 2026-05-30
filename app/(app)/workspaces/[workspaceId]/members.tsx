import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { ConfirmDialog } from '~/components/confirm-dialog';
import {
  RoleSwitchModal,
  type ManageableRole,
} from '~/components/member/role-switch-modal';
import { WorkspaceBanner } from '~/components/workspace-banner';
import {
  useChangeRole,
  useInviteMember,
  useMembers,
  useRemoveMember,
} from '~/hooks/use-workspaces';
import { useAuthStore } from '~/store/auth.store';
import { useSurfaceColors } from '~/lib/surface-colors';
import type { MemberRequest, WorkspaceRole } from '~/lib/api/types';

type DisplayRole = 'Owner' | 'Admin' | 'Member' | 'Observer';

function normalizeRole(raw: string): DisplayRole {
  const lower = raw?.toLowerCase();
  if (lower === 'owner') return 'Owner';
  if (lower === 'admin') return 'Admin';
  if (lower === 'observer') return 'Observer';
  return 'Member';
}

function manageableToApiRole(role: ManageableRole): WorkspaceRole {
  return role.toLowerCase() as WorkspaceRole;
}

function memberDisplayName(member: MemberRequest, isSelf: boolean): string {
  const base = member.name?.trim() || member.email.split('@')[0];
  return isSelf ? `${base} (You)` : base;
}

export default function MembersScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const router = useRouter();
  const colors = useSurfaceColors();

  const currentUser = useAuthStore((state) => state.session?.user) ?? null;

  const {
    data: members = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useMembers(workspaceId ?? '');
  const inviteMutation = useInviteMember(workspaceId ?? '');
  const changeRoleMutation = useChangeRole(workspaceId ?? '');
  const removeMemberMutation = useRemoveMember(workspaceId ?? '');

  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [roleSwitchMember, setRoleSwitchMember] = useState<MemberRequest | null>(null);
  const [removingMember, setRemovingMember] = useState<MemberRequest | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const activeMember = members.find((m) => m.publicId === activeMemberId) ?? null;
  const currentMember = currentUser
    ? members.find((m) => m.userId === currentUser.id) ?? null
    : null;
  const currentDisplayRole = currentMember
    ? normalizeRole(currentMember.role)
    : 'Member';
  const canManage =
    currentDisplayRole === 'Owner' || currentDisplayRole === 'Admin';

  const closeActions = () => setActiveMemberId(null);

  const handleInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) {
      setIsInviting(false);
      return;
    }
    try {
      await inviteMutation.mutateAsync({ email });
      setInviteEmail('');
      setIsInviting(false);
    } catch (err) {
      console.error('Invite failed', err);
    }
  };

  const handleRoleChange = async (role: ManageableRole) => {
    if (!roleSwitchMember) return;
    try {
      await changeRoleMutation.mutateAsync({
        memberId: roleSwitchMember.publicId,
        payload: { role: manageableToApiRole(role) },
      });
    } catch (err) {
      console.error('Role change failed', err);
    } finally {
      setRoleSwitchMember(null);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;
    try {
      await removeMemberMutation.mutateAsync(removingMember.publicId);
    } catch (err) {
      console.error('Remove member failed', err);
    } finally {
      setRemovingMember(null);
    }
  };

  const handleLeave = async () => {
    if (!currentMember) return;
    try {
      await removeMemberMutation.mutateAsync(currentMember.publicId);
      router.back();
    } catch (err) {
      console.error('Leave workspace failed', err);
    } finally {
      setIsLeaveOpen(false);
    }
  };

  const activeMemberDisplayRole = useMemo(
    () => (activeMember ? normalizeRole(activeMember.role) : 'Member'),
    [activeMember],
  );

  return (
    <View className="flex-1 bg-background p-4">
      <WorkspaceBanner />
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-foreground">Workspace Members</Text>
        <Button
          size="sm"
          onPress={() => setIsInviting(true)}
          className="rounded-full w-10 h-10 p-0"
        >
          <Feather name="user-plus" size={18} className="text-primary-foreground" />
        </Button>
      </View>

      {isInviting && (
        <Card className="mb-6 p-4 border-primary/20">
          <Text className="text-lg font-semibold text-foreground mb-3">Invite Member</Text>
          <Input
            autoFocus
            placeholder="Email address"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType="email-address"
            className="mb-4"
          />
          <View className="flex-row gap-3">
            <Button
              className="flex-1"
              onPress={handleInvite}
              disabled={inviteMutation.isPending}
            >
              <Text className="text-primary-foreground font-semibold">
                {inviteMutation.isPending ? 'Sending…' : 'Send Invite'}
              </Text>
            </Button>
            <Button variant="ghost" className="flex-1" onPress={() => setIsInviting(false)}>
              <Text className="text-muted-foreground">Cancel</Text>
            </Button>
          </View>
        </Card>
      )}

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.publicId}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center mt-10">
              <Text className="text-muted-foreground">
                {isError ? 'Failed to load members.' : 'No members yet.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const role = normalizeRole(item.role);
            const isSelf = currentUser?.id === item.userId;
            const canLeave = isSelf && role !== 'Owner';
            const canManageOther = !isSelf && canManage && role !== 'Owner';
            const canShowMenu = canLeave || canManageOther;
            const name = memberDisplayName(item, isSelf);
            return (
              <Card className="mb-3 p-4">
                <View className="flex-row items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarFallback initials={(name.charAt(0) || '?').toUpperCase()} />
                  </Avatar>
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-base font-semibold text-foreground mr-2">{name}</Text>
                      <Badge variant={role === 'Owner' ? 'default' : 'outline'}>
                        <Text
                          className={
                            role === 'Owner' ? 'text-[10px] text-white' : 'text-[10px]'
                          }
                        >
                          {role}
                        </Text>
                      </Badge>
                    </View>
                    <Text className="text-sm text-muted-foreground">{item.email}</Text>
                  </View>
                  {canShowMenu && (
                    <Pressable
                      accessibilityLabel={`Open actions for ${name}`}
                      onPress={() => setActiveMemberId(item.publicId)}
                      className="p-2"
                    >
                      <Feather name="more-vertical" size={18} className="text-muted-foreground" />
                    </Pressable>
                  )}
                </View>
              </Card>
            );
          }}
        />
      )}

      <Modal
        visible={activeMember !== null}
        transparent
        animationType="fade"
        onRequestClose={closeActions}
      >
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={closeActions}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View
              className="rounded-t-2xl p-4 pb-8"
              style={{
                backgroundColor: colors.background,
                borderTopWidth: 1,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 12,
              }}
            >
              {activeMember && (
                <>
                  <View
                    className="self-center w-10 h-1 rounded-full mb-4"
                    style={{ backgroundColor: colors.border }}
                  />
                  <View className="flex-row items-center mb-4">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarFallback
                        initials={(activeMember.name?.charAt(0) || activeMember.email.charAt(0)).toUpperCase()}
                      />
                    </Avatar>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {activeMember.name?.trim() || activeMember.email.split('@')[0]}
                      </Text>
                      <Text className="text-sm text-muted-foreground">{activeMember.email}</Text>
                    </View>
                  </View>

                  {canManage &&
                    activeMemberDisplayRole !== 'Owner' &&
                    currentUser?.id !== activeMember.userId && (
                      <>
                        <ActionRow
                          icon="shield"
                          label="Change role"
                          onPress={() => {
                            setRoleSwitchMember(activeMember);
                            closeActions();
                          }}
                        />
                        <ActionRow
                          icon="user-x"
                          label="Remove from workspace"
                          destructive
                          onPress={() => {
                            setRemovingMember(activeMember);
                            closeActions();
                          }}
                        />
                      </>
                    )}

                  {currentUser?.id === activeMember.userId &&
                    activeMemberDisplayRole !== 'Owner' && (
                      <ActionRow
                        icon="log-out"
                        label="Leave workspace"
                        destructive
                        onPress={() => {
                          setIsLeaveOpen(true);
                          closeActions();
                        }}
                      />
                    )}

                  <Pressable onPress={closeActions} className="mt-2 p-3 items-center">
                    <Text className="text-muted-foreground font-medium">Cancel</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <RoleSwitchModal
        visible={roleSwitchMember !== null}
        member={
          roleSwitchMember && normalizeRole(roleSwitchMember.role) !== 'Owner'
            ? {
                id: roleSwitchMember.publicId,
                name: roleSwitchMember.name?.trim() || roleSwitchMember.email.split('@')[0],
                email: roleSwitchMember.email,
                avatarUrl: null,
                role: (normalizeRole(roleSwitchMember.role) === 'Admin'
                  ? 'Admin'
                  : 'Member') as ManageableRole,
              }
            : null
        }
        onClose={() => setRoleSwitchMember(null)}
        onConfirm={handleRoleChange}
      />

      <ConfirmDialog
        visible={removingMember !== null}
        title="Remove member"
        message={
          removingMember
            ? `Remove ${removingMember.name?.trim() || removingMember.email} from this workspace? They will lose access immediately.`
            : ''
        }
        confirmLabel="Remove"
        destructive
        onClose={() => setRemovingMember(null)}
        onConfirm={handleRemoveMember}
      />

      <ConfirmDialog
        visible={isLeaveOpen}
        title="Leave workspace"
        message="Are you sure you want to leave this workspace? You will lose access to all its boards."
        confirmLabel="Leave"
        destructive
        onClose={() => setIsLeaveOpen(false)}
        onConfirm={handleLeave}
      />
    </View>
  );
}

type ActionRowProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  destructive?: boolean;
  onPress: () => void;
};

function ActionRow({ icon, label, destructive, onPress }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="flex-row items-center py-3 px-1 active:opacity-70"
    >
      <Feather
        name={icon}
        size={18}
        className={destructive ? 'text-destructive' : 'text-foreground'}
      />
      <Text
        className={`ml-3 text-base ${destructive ? 'text-destructive' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
