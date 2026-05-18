import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Text, View, type ViewProps } from 'react-native';

import { cn } from '~/lib/utils';

const badgeVariants = cva('rounded-md border px-2 py-0.5', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary',
      secondary: 'border-transparent bg-muted',
      outline: 'border-border bg-transparent',
      destructive: 'border-transparent bg-destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const textVariants = cva('text-xs font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-foreground',
      outline: 'text-foreground',
      destructive: 'text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type BadgeProps = ViewProps & VariantProps<typeof badgeVariants> & { className?: string };

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant, className }))} {...props}>
      <Text className={cn(textVariants({ variant }))}>{children}</Text>
    </View>
  );
}

