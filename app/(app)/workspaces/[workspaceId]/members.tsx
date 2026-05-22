import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Card } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Feather } from '@expo/vector-icons';
import { Input } from '~/components/ui/input';

// Mock data for members
type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
};

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Owner', avatarUrl: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Admin', avatarUrl: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Member', avatarUrl: 'https://i.pravatar.cc/150?u=3' },
];

export default function MembersScreen() {
  const { workspaceId } = useLocalSearchParams();
  const displayWorkspaceId = workspaceId === 'default' ? 'Personal Workspace' : `Workspace ${workspaceId}`;
  
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      setIsInviting(false);
      return;
    }
    // Mock invite action
    const newMember = {
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

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-foreground">Workspace Members</Text>
          <Text className="text-sm text-muted-foreground">{displayWorkspaceId}</Text>
        </View>
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
        renderItem={({ item }) => (
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
                    <Text className={item.role === 'Owner' ? 'text-[10px] text-white' : 'text-[10px]'}>{item.role}</Text>
                  </Badge>
                </View>
                <Text className="text-sm text-muted-foreground">{item.email}</Text>
              </View>
              {item.role !== 'Owner' && (
                <Pressable onPress={() => removeMember(item.id)} className="p-2">
                  <Feather name="more-vertical" size={18} className="text-muted-foreground" />
                </Pressable>
              )}
            </View>
          </Card>
        )}
      />
    </View>
  );
}
