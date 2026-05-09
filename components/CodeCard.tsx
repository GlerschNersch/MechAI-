import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { DtcCode } from '@/lib/store';

interface CodeCardProps {
  code: DtcCode;
  onPressAI?: () => void;
  onPressClear?: () => void;
}

const SEVERITY_CONFIG = {
  low:      { label: 'Low',      bg: 'bg-green-900',  text: 'text-green-400',  dot: 'bg-green-400' },
  medium:   { label: 'Medium',   bg: 'bg-yellow-900', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  high:     { label: 'High',     bg: 'bg-orange-900', text: 'text-orange-400', dot: 'bg-orange-400' },
  critical: { label: 'Critical', bg: 'bg-red-900',    text: 'text-red-400',    dot: 'bg-red-400' },
};

export function CodeCard({ code, onPressAI, onPressClear }: CodeCardProps) {
  const sev = SEVERITY_CONFIG[code.severity];

  return (
    <View className={`bg-surface-raised rounded-2xl p-4 mb-3 ${code.cleared ? 'opacity-50' : ''}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <Text className="text-white text-lg font-bold">{code.code}</Text>
          <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${sev.bg}`}>
            <View className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
            <Text className={`text-xs font-semibold ${sev.text}`}>{sev.label}</Text>
          </View>
        </View>
        <Text className="text-slate-500 text-xs">{code.system}</Text>
      </View>

      {/* Description */}
      <Text className="text-slate-300 text-sm mb-3 leading-5">{code.description}</Text>

      {/* Actions */}
      {!code.cleared && (
        <View className="flex-row gap-2">
          {onPressAI && (
            <TouchableOpacity
              onPress={onPressAI}
              className="flex-1 bg-brand-600 rounded-xl py-2 items-center"
            >
              <Text className="text-white text-sm font-semibold">✨ Ask AI</Text>
            </TouchableOpacity>
          )}
          {onPressClear && (
            <TouchableOpacity
              onPress={onPressClear}
              className="flex-1 bg-slate-700 rounded-xl py-2 items-center"
            >
              <Text className="text-slate-300 text-sm font-semibold">Clear Code</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {code.cleared && (
        <Text className="text-green-500 text-sm font-medium">✓ Cleared</Text>
      )}
    </View>
  );
}
