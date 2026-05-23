import React from 'react';
import { View, Text, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '~/store/auth.store';
import { Button } from '~/components/ui/button';
import { useColorScheme } from '~/hooks/useColorScheme';
import { Card } from '~/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

export default function SettingsScreen() {
  const router = useRouter();
  const signOut = useAuthStore((state) => state.signOut);
  const session = useAuthStore((state) => state.session);
  const user = session?.user;

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = (colorScheme ?? 'light') === 'dark';

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-3xl font-bold text-foreground mb-6">Settings</Text>
      
      <Card className="mb-4">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-medium text-foreground">Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleColorScheme} />
        </View>
        <Text className="text-sm text-muted-foreground">
          Toggle switch to change between light and dark themes.
        </Text>
      </Card>

      <Card>
        <Text className="text-lg font-medium text-foreground mb-4">Account</Text>
        
        <View className="flex-row items-center mb-6">
          <Avatar className="h-16 w-16 mr-4">
            {user?.avatarUrl && <AvatarImage source={{ uri: user.avatarUrl }} />}
            <AvatarFallback initials={user?.name ? user.name.charAt(0).toUpperCase() : 'D'} />
          </Avatar>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-foreground">{user?.name || 'Demo User'}</Text>
            <Text className="text-base text-muted-foreground">{user?.email || 'demo@qmcloud.io.vn'}</Text>
          </View>
        </View>

        <Button variant="destructive" onPress={handleLogout}>
          <Text className="text-white font-semibold">Log out</Text>
        </Button>
      </Card>
    </View>
  );
}
