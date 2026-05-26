import { Link, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);

  const handleSubmit = async () => {
    setFormError(null);
    setSuccessMessage(null);
    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Verification code has been sent to your email.');
      router.push({
        pathname: '/(auth)/reset-password',
        params: { email: email.trim() },
      });
    } catch {
      setFormError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        className="flex-1 justify-center px-6">
        <View className="mb-8">
          <Text className="text-2xl font-semibold text-foreground">Forgot password?</Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a verification code to reset your password.
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
              returnKeyType="done"
            />
          </View>

          {formError && <Text className="text-sm text-destructive">{formError}</Text>}
          {successMessage && <Text className="text-sm text-foreground">{successMessage}</Text>}

          <Button onPress={handleSubmit} disabled={!isValid || isLoading}>
            <Text className="text-sm font-medium text-primary-foreground">
              {isLoading ? 'Sending...' : 'Send reset code'}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
