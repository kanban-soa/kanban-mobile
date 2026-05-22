import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '~/lib/utils';

const buttonVariants = cva(
  'items-center justify-center rounded-md border border-transparent px-4 py-2 active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border-border bg-background text-foreground',
        ghost: 'bg-transparent text-foreground',
        destructive: 'bg-destructive text-white',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-3',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = PressableProps & VariantProps<typeof buttonVariants> & { className?: string };

export const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }), disabled && 'opacity-50')}
        accessibilityRole="button"
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

