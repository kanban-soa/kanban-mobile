import React from 'react';
import { Image, Text, View, type ImageProps, type ViewProps } from 'react-native';

import { cn } from '~/lib/utils';

export type AvatarProps = ViewProps & { className?: string };
export type AvatarImageProps = ImageProps & { className?: string };
export type AvatarFallbackProps = ViewProps & { initials: string; className?: string };

export function Avatar({ className, ...props }: AvatarProps) {
  return (
    <View
      className={cn('h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-muted', className)}
      {...props}
    />
  );
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return <Image className={cn('h-full w-full', className)} {...props} />;
}

export function AvatarFallback({ initials, className, ...props }: AvatarFallbackProps) {
  return (
    <View className={cn('h-full w-full items-center justify-center', className)} {...props}>
      <Text className="text-sm font-medium text-foreground">{initials}</Text>
    </View>
  );
}

