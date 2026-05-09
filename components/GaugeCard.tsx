import React from 'react';
import { View, Text } from 'react-native';

interface GaugeCardProps {
  label: string;
  value: number | null;
  unit: string;
  min?: number;
  max?: number;
  warnAbove?: number;
  dangerAbove?: number;
  warnBelow?: number;
}

export function GaugeCard({
  label,
  value,
  unit,
  min = 0,
  max = 100,
  warnAbove,
  dangerAbove,
  warnBelow,
}: GaugeCardProps) {
  const displayValue = value !== null ? value : '--';
  const pct = value !== null ? Math.min(1, Math.max(0, (value - min) / (max - min))) : 0;

  let barColor = 'bg-brand-500';
  if (value !== null) {
    if (dangerAbove && value >= dangerAbove) barColor = 'bg-danger';
    else if (warnAbove && value >= warnAbove) barColor = 'bg-warning';
    else if (warnBelow && value <= warnBelow) barColor = 'bg-warning';
  }

  return (
    <View className="bg-surface-raised rounded-2xl p-4 flex-1 min-w-[44%] m-1">
      <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
        {label}
      </Text>
      <View className="flex-row items-end gap-1 mb-3">
        <Text className="text-white text-3xl font-bold">{displayValue}</Text>
        <Text className="text-slate-400 text-sm mb-1">{unit}</Text>
      </View>
      {/* Bar */}
      <View className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${pct * 100}%` }}
        />
      </View>
    </View>
  );
}
