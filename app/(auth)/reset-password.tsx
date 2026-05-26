import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = typeof params.email === 'string' ? params.email : '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return (
      EMAIL_REGEX.test(email.trim()) &&
      code.trim().length >= 4 &&
      password.length >= 8 &&
      password === confirmPassword
    );
  }, [email, code, password, confirmPassword]);

  const handleSubmit = async () => {
    setFormError(null);
    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (code.trim().length < 4) {
      setFormError('Enter the verification code from your email.');
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

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.replace('/(auth)/login');
    } catch {
      setFormError('Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1">
        <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-10">
          <View className="mb-8">
            <Text className="text-2xl font-semibold text-foreground">Set new password</Text>
            <Text className="mt-2 text-sm text-muted-foreground">
              Enter the verification code we sent to your email and your new password.
            </Text>
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
                editable={!initialEmail}
                returnKeyType="next"
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Verification code</Text>
              <Input
                placeholder="Enter 6-digit code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">New password</Text>
              <Input
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                returnKeyType="next"
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-foreground">Confirm new password</Text>
              <Input
                placeholder="••••••••"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
              />
            </View>

            {formError && <Text className="text-sm text-destructive">{formError}</Text>}

            <Button onPress={handleSubmit} disabled={!isValid || isLoading}>
              <Text className="text-sm font-medium text-primary-foreground">
                {isLoading ? 'Resetting...' : 'Reset password'}
              </Text>
            </Button>
          </Card>

          <Separator className="my-6" />

          <View className="flex-row items-center justify-center gap-2">
            <Text className="text-sm text-muted-foreground">Remember your password?</Text>
            <Link href="/(auth)/login" className="text-sm font-semibold text-foreground">
              Back to login
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
