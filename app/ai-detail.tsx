import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { lookupDTC } from '@/lib/dtc/database';
import { diagnoseDTC, type DiagnosisResult } from '@/lib/ai/claude';

const URGENCY_CONFIG = {
  low:      { label: 'Low Urgency',      bg: 'bg-green-900',  text: 'text-green-400',  emoji: '🟢' },
  medium:   { label: 'Moderate Urgency', bg: 'bg-yellow-900', text: 'text-yellow-400', emoji: '🟡' },
  high:     { label: 'High Urgency',     bg: 'bg-orange-900', text: 'text-orange-400', emoji: '🟠' },
  critical: { label: 'Critical',         bg: 'bg-red-900',    text: 'text-red-400',    emoji: '🔴' },
};

export default function AIDetailScreen() {
  const { code: codeParam } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const { vehicles, activeVehicleId } = useAppStore();
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) ?? null;

  const dtc = lookupDTC(codeParam ?? '');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const diagnosis = await diagnoseDTC(dtc, activeVehicle);
        setResult(diagnosis);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const urgencyConfig = result ? URGENCY_CONFIG[result.urgency] : null;

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="bg-surface-raised px-4 py-2 rounded-xl">
            <Text className="text-slate-300 font-semibold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-slate-400 text-sm">AI Diagnosis</Text>
        </View>

        {/* Code info */}
        <View className="bg-surface-raised rounded-2xl p-4 mb-4">
          <Text className="text-white text-2xl font-bold">{dtc.code}</Text>
          <Text className="text-slate-300 text-sm mt-1">{dtc.description}</Text>
          <Text className="text-slate-500 text-xs mt-1">{dtc.system}</Text>
        </View>

        {loading && (
          <View className="bg-surface-raised rounded-2xl p-8 items-center">
            <ActivityIndicator size="large" color="#0ea5e9" />
            <Text className="text-slate-400 text-sm mt-4">✨ Analyzing fault code...</Text>
          </View>
        )}

        {error && (
          <View className="bg-red-900 rounded-2xl p-4">
            <Text className="text-red-400 font-semibold mb-1">AI Unavailable</Text>
            <Text className="text-red-300 text-sm">{error}</Text>
            <Text className="text-red-400 text-xs mt-2">
              Add your EXPO_PUBLIC_ANTHROPIC_API_KEY to .env to enable AI diagnosis.
            </Text>
          </View>
        )}

        {result && urgencyConfig && (
          <>
            {/* Urgency banner */}
            <View className={`${urgencyConfig.bg} rounded-2xl p-4 mb-4 flex-row items-center gap-3`}>
              <Text className="text-3xl">{urgencyConfig.emoji}</Text>
              <View className="flex-1">
                <Text className={`font-bold ${urgencyConfig.text}`}>{urgencyConfig.label}</Text>
                <Text className={`text-sm mt-0.5 ${urgencyConfig.text} opacity-80`}>
                  {result.canDriveSafely ? 'Safe to drive for now' : '⚠️ Do not drive — seek immediate repair'}
                </Text>
              </View>
            </View>

            {/* Explanation */}
            <View className="bg-surface-raised rounded-2xl p-4 mb-4">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                What's Wrong
              </Text>
              <Text className="text-slate-200 text-sm leading-6">{result.explanation}</Text>
            </View>

            {/* Causes */}
            <View className="bg-surface-raised rounded-2xl p-4 mb-4">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Possible Causes
              </Text>
              {result.possibleCauses.map((cause, i) => (
                <View key={i} className="flex-row items-start gap-2 mb-2">
                  <Text className="text-brand-400 text-sm mt-0.5">•</Text>
                  <Text className="text-slate-200 text-sm flex-1 leading-5">{cause}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View className="bg-surface-raised rounded-2xl p-4 mb-4">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Recommended Actions
              </Text>
              {result.recommendedActions.map((action, i) => (
                <View key={i} className="flex-row items-start gap-2 mb-2">
                  <Text className="text-green-400 text-sm mt-0.5">{i + 1}.</Text>
                  <Text className="text-slate-200 text-sm flex-1 leading-5">{action}</Text>
                </View>
              ))}
            </View>

            {/* Cost estimate */}
            {result.estimatedCostRange && (
              <View className="bg-surface-raised rounded-2xl p-4 mb-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    Estimated Repair Cost
                  </Text>
                  <Text className="text-slate-500 text-xs mt-0.5">Parts + labor, US average</Text>
                </View>
                <Text className="text-white text-xl font-bold">{result.estimatedCostRange}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
