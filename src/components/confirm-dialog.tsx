import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Button } from '~/components/ui/button';
import { useSurfaceColors } from '~/lib/surface-colors';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onClose,
  onConfirm,
}: Props) {
  const colors = useSurfaceColors();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 justify-center px-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View
            className="rounded-2xl p-5"
            style={{
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-base font-semibold text-foreground">{title}</Text>
              <Pressable onPress={onClose} className="p-1">
                <Feather name="x" size={18} className="text-muted-foreground" />
              </Pressable>
            </View>
            <Text className="text-sm text-muted-foreground mb-5">{message}</Text>

            <View className="flex-row justify-end gap-2">
              <Button variant="outline" size="sm" onPress={onClose}>
                <Text className="text-foreground">{cancelLabel}</Text>
              </Button>
              <Button
                variant={destructive ? 'destructive' : 'default'}
                size="sm"
                onPress={onConfirm}
                style={
                  destructive
                    ? { backgroundColor: '#dc2626' }
                    : { backgroundColor: colors.foreground }
                }
              >
                <Text
                  style={{
                    color: destructive ? '#ffffff' : colors.background,
                    fontWeight: '600',
                  }}
                >
                  {confirmLabel}
                </Text>
              </Button>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
