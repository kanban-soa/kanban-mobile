import React from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '~/lib/utils';

export type SeparatorProps = ViewProps & { className?: string };

export function Separator({ className, ...props }: SeparatorProps) {
  return <View className={cn('h-px w-full bg-border', className)} {...props} />;
}

