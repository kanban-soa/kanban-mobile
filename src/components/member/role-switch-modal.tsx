import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { useSurfaceColors } from '~/lib/surface-colors';

export type ManageableRole = 'Admin' | 'Member';

const ROLES: { value: ManageableRole; description: string }[] = [
  { value: 'Admin', description: 'Can manage members, boards, and workspace settings.' },
  { value: 'Member', description: 'Can view and contribute to boards.' },
];

type Props = {
  visible: boolean;
  member: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: ManageableRole;
  } | null;
  onClose: () => void;
  onConfirm: (role: ManageableRole) => void;
};

export function RoleSwitchModal({ visible, member, onClose, onConfirm }: Props) {
  const colors = useSurfaceColors();
  const [selectedRole, setSelectedRole] = useState<ManageableRole>('Member');

  useEffect(() => {
    if (visible && member) setSelectedRole(member.role);
  }, [visible, member?.id, member?.role]);

  if (!member) return null;

  const handleConfirm = () => {
    if (selectedRole !== member.role) {
      onConfirm(selectedRole);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-base font-semibold text-foreground">Change role</Text>
              <Pressable onPress={onClose} className="p-1">
                <Feather name="x" size={18} className="text-muted-foreground" />
              </Pressable>
            </View>

            <View className="flex-row items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                {member.avatarUrl && <AvatarImage source={{ uri: member.avatarUrl }} />}
                <AvatarFallback initials={member.name.charAt(0).toUpperCase()} />
              </Avatar>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{member.name}</Text>
                <Text className="text-xs text-muted-foreground">{member.email}</Text>
              </View>
            </View>

            <Text className="text-xs font-medium text-muted-foreground mb-2">
              Select role
            </Text>
            <View className="mb-4">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.value;
                return (
                  <Pressable
                    key={role.value}
                    onPress={() => setSelectedRole(role.value)}
                    className={`flex-row items-start p-3 rounded-md border mb-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-background'
                    }`}
                  >
                    <View
                      className={`h-5 w-5 rounded-full border items-center justify-center mr-3 mt-0.5 ${
                        isSelected ? 'border-primary bg-primary' : 'border-border'
                      }`}
                    >
                      {isSelected && <Feather name="check" size={12} color="#fff" />}
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-foreground' : 'text-foreground'
                        }`}
                      >
                        {role.value}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        {role.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row justify-end gap-2">
              <Button variant="outline" size="sm" onPress={onClose}>
                <Text className="text-foreground">Cancel</Text>
              </Button>
              <Button
                size="sm"
                onPress={handleConfirm}
                disabled={selectedRole === member.role}
              >
                <Text className="text-white">Update role</Text>
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
