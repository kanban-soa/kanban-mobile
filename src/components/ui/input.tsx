import React, { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { cn } from '~/lib/utils';

export type InputProps = TextInputProps & { className?: string };

export function Input({ className, onBlur, onFocus, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      className={cn(
        'h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground',
        isFocused && 'border-foreground',
        className,
      )}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      {...props}
    />
  );
}
