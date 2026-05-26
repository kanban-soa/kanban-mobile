import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
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
import { useAuthStore } from '~/store/auth.store';
import { useSurfaceColors } from '~/lib/surface-colors';

type Role = 'Owner' | 'Admin' | 'Member';

type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
};

const buildInitialMembers = (
  currentUser: { id: string; name: string; email: string; avatarUrl: string | null } | null,
): Member[] => {
  const base: Member[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Owner', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
  ];
  if (currentUser) {
    base.push({
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      email: currentUser.email,
      role: 'Admin',
      avatarUrl: currentUser.avatarUrl,
    });
  }
  return base;
};

export default function MembersScreen() {
  const router = useRouter();
  const colors = useSurfaceColors();

  const currentUser = useAuthStore((state) => state.session?.user) ?? null;
  const initial = useMemo(
    () =>
      buildInitialMembers(
        currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name ?? 'You',
              email: currentUser.email ?? '',
              avatarUrl: currentUser.avatarUrl ?? null,
            }
          : null,
      ),
    [currentUser],
  );

  const [members, setMembers] = useState<Member[]>(initial);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const [roleSwitchMember, setRoleSwitchMember] = useState<Member | null>(null);
  const [removingMember, setRemovingMember] = useState<Member | null>(null);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);

  const activeMember = members.find((m) => m.id === activeMemberId) ?? null;
  const currentMember = currentUser
    ? members.find((m) => m.id === currentUser.id) ?? null
    : null;
  const canManage = currentMember?.role === 'Owner' || currentMember?.role === 'Admin';

  const closeActions = () => setActiveMemberId(null);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      setIsInviting(false);
      return;
    }
    const newMember: Member = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: 'Member',
      avatarUrl: null,
    };
    setMembers([...members, newMember]);
    setInviteEmail('');
    setIsInviting(false);
  };

  const handleRoleChange = (role: ManageableRole) => {
    if (!roleSwitchMember) return;
    setMembers((prev) =>
      prev.map((m) => (m.id === roleSwitchMember.id ? { ...m, role } : m)),
    );
    setRoleSwitchMember(null);
  };

  const handleRemoveMember = () => {
    if (!removingMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== removingMember.id));
    setRemovingMember(null);
  };

  const handleLeave = () => {
    if (!currentMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== currentMember.id));
    setIsLeaveOpen(false);
    router.back();
  };

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
          <Feather name="user-plus" size={18} className="text-white" />
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
            <Button className="flex-1" onPress={handleInvite}>
              <Text className="text-white font-semibold">Send Invite</Text>
            </Button>
            <Button variant="ghost" className="flex-1" onPress={() => setIsInviting(false)}>
              <Text className="text-muted-foreground">Cancel</Text>
            </Button>
          </View>
        </Card>
      )}

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelf = currentUser?.id === item.id;
          const canLeave = isSelf && item.role !== 'Owner';
          const canManageOther = !isSelf && canManage && item.role !== 'Owner';
          const canShowMenu = canLeave || canManageOther;
          return (
            <Card className="mb-3 p-4">
              <View className="flex-row items-center">
                <Avatar className="h-12 w-12 mr-4">
                  {item.avatarUrl && <AvatarImage source={{ uri: item.avatarUrl }} />}
                  <AvatarFallback initials={item.name.charAt(0).toUpperCase()} />
                </Avatar>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-base font-semibold text-foreground mr-2">{item.name}</Text>
                    <Badge variant={item.role === 'Owner' ? 'default' : 'outline'}>
                      <Text
                        className={
                          item.role === 'Owner' ? 'text-[10px] text-white' : 'text-[10px]'
                        }
                      >
                        {item.role}
                      </Text>
                    </Badge>
                  </View>
                  <Text className="text-sm text-muted-foreground">{item.email}</Text>
                </View>
                {canShowMenu && (
                  <Pressable
                    accessibilityLabel={`Open actions for ${item.name}`}
                    onPress={() => setActiveMemberId(item.id)}
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
                      {activeMember.avatarUrl && (
                        <AvatarImage source={{ uri: activeMember.avatarUrl }} />
                      )}
                      <AvatarFallback initials={activeMember.name.charAt(0).toUpperCase()} />
                    </Avatar>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {activeMember.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground">{activeMember.email}</Text>
                    </View>
                  </View>

                  {canManage &&
                    activeMember.role !== 'Owner' &&
                    currentUser?.id !== activeMember.id && (
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

                  {currentUser?.id === activeMember.id && activeMember.role !== 'Owner' && (
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
          roleSwitchMember && roleSwitchMember.role !== 'Owner'
            ? {
                id: roleSwitchMember.id,
                name: roleSwitchMember.name,
                email: roleSwitchMember.email,
                avatarUrl: roleSwitchMember.avatarUrl,
                role: roleSwitchMember.role,
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
            ? `Remove ${removingMember.name} from this workspace? They will lose access immediately.`
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
