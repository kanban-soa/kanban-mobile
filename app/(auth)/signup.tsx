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

export default function SignupScreen() {
  const router = useRouter();
  const signUp = useAuthStore((state) => state.signUp);
  const status = useAuthStore((state) => state.status);
  const authError = useAuthStore((state) => state.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = status === 'loading';
  const isValid = useMemo(() => {
    return (
      name.trim().length >= 2 &&
      EMAIL_REGEX.test(email.trim()) &&
      password.length >= 8 &&
      password === confirmPassword
    );
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async () => {
    setFormError(null);
    if (name.trim().length < 2) {
      setFormError('Name must be at least 2 characters.');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    await signUp({ name: name.trim(), email: email.trim(), password });
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
          <Text className="text-2xl font-semibold text-foreground">Create your account</Text>
          <Text className="mt-2 text-sm text-muted-foreground">Start organizing with kan.bn</Text>
        </View>

        <Card className="gap-4">
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Full name</Text>
            <Input placeholder="Ada Lovelace" value={name} onChangeText={setName} returnKeyType="next" />
          </View>
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
              returnKeyType="next"
            />
          </View>
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Confirm password</Text>
            <Input
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              returnKeyType="done"
            />
          </View>

          {(formError || authError) && (
            <Text className="text-sm text-destructive">{formError ?? authError}</Text>
          )}

          <Button onPress={handleSubmit} disabled={!isValid || isLoading}>
            <Text className="text-sm font-medium text-primary-foreground">
              {isLoading ? 'Creating account...' : 'Create account'}
            </Text>
          </Button>
        </Card>

        <Separator className="my-6" />

        <View className="flex-row items-center justify-center gap-2">
          <Text className="text-sm text-muted-foreground">Already have an account?</Text>
          <Link href="/(auth)/login" className="text-sm font-semibold text-foreground">
            Sign in
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

