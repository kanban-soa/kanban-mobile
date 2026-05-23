import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { useAuthStore } from '~/store/auth.store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isValid = useMemo(() => EMAIL_REGEX.test(email.trim()) && password.length >= 8, [email, password]);

  const handleSubmit = async () => {
    setFormError(null);
    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    await signIn({ email: email.trim(), password });
    if (useAuthStore.getState().status === 'authenticated') {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1 justify-center px-6">
        <View className="mb-8">
          <Text className="text-2xl font-semibold text-foreground">Welcome back</Text>
          <Text className="mt-2 text-sm text-muted-foreground">Sign in to continue to kan.bn</Text>
        </View>

        <Card className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Email</Text>
            <Input
              placeholder="you@company.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
            />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Password</Text>
            <Input
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
            />
          </View>

          {(formError || authError) && (
            <Text className="text-sm text-destructive">{formError ?? authError}</Text>
          )}

          <Button onPress={handleSubmit} disabled={!isValid || isLoading}>
            <Text className="text-sm font-medium text-primary-foreground">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Text>
          </Button>
        </Card>

        <Separator className="my-6" />

        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-sm text-muted-foreground">New to kan.bn?</Text>
          <Link href="/(auth)/signup" className="text-sm font-semibold text-foreground">
            Create account
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

