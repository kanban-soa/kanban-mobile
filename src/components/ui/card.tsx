import React from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '~/lib/utils';

export type CardProps = ViewProps & { className?: string };

export function Card({ className, ...props }: CardProps) {
  return <View className={cn('rounded-lg border border-border bg-card p-4', className)} {...props} />;
}

