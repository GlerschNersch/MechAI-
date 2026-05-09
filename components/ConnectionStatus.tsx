import React from 'react';
import { View, Text } from 'react-native';
import type { ConnectionStatus } from '@/lib/store';

interface ConnectionStatusBadgeProps {
  status: ConnectionStatus;
  deviceName?: string | null;
}

const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; dot: string }> = {
  disconnected: { label: 'Disconnected',  color: 'text-slate-400',  dot: 'bg-slate-500' },
  scanning:     { label: 'Scanning...',   color: 'text-blue-400',   dot: 'bg-blue-400' },
  connecting:   { label: 'Connecting...', color: 'text-yellow-400', dot: 'bg-yellow-400' },
  connected:    { label: 'Connected',     color: 'text-green-400',  dot: 'bg-green-400' },
  error:        { label: 'Error',         color: 'text-red-400',    dot: 'bg-red-400' },
};

export function ConnectionStatusBadge({ status, deviceName }: ConnectionStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];

  return (
    <View className="flex-row items-center gap-2 bg-surface-raised px-3 py-1.5 rounded-full">
      <View className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <Text className={`text-xs font-medium ${cfg.color}`}>
        {status === 'connected' && deviceName ? deviceName : cfg.label}
      </Text>
    </View>
  );
}
