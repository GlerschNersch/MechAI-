import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { obd2 } from '@/lib/obd2/connection';
import { lookupMultipleDTCs } from '@/lib/dtc/database';
import { CodeCard } from '@/components/CodeCard';

export default function CodesScreen() {
  const router = useRouter();
  const { connectionStatus, activeCodes, setActiveCodes, clearCode, isDemoMode } = useAppStore();
  const [reading, setReading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const readCodes = async () => {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'In demo mode, codes are pre-loaded. Connect a real OBD2 adapter to read live codes.');
      return;
    }
    if (connectionStatus !== 'connected') {
      Alert.alert('Not Connected', 'Please connect your OBD2 adapter first.');
      return;
    }

    setReading(true);
    try {
      const rawCodes = await obd2.readDTCs();
      const dtcs = lookupMultipleDTCs(rawCodes);
      setActiveCodes(dtcs);
    } catch (err) {
      Alert.alert('Error', `Failed to read codes: ${String(err)}`);
    } finally {
      setReading(false);
    }
  };

  const handleClearCode = (code: string) => {
    Alert.alert(
      'Clear Code',
      `Clear fault code ${code}? This will reset the check engine light for this code.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (!isDemoMode) {
              try {
                await obd2.clearDTCs();
              } catch {
                // Silently fail in demo
              }
            }
            clearCode(code);
          },
        },
      ]
    );
  };

  const handleAskAI = (code: string) => {
    setSelectedCode(code);
    router.push({ pathname: '/ai-detail', params: { code } });
  };

  const activeCodes_ = activeCodes.filter((c) => !c.cleared);
  const clearedCodes = activeCodes.filter((c) => c.cleared);

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Fault Codes</Text>
            <Text className="text-slate-400 text-sm">
              {activeCodes_.length} active · {clearedCodes.length} cleared
            </Text>
          </View>
          <TouchableOpacity
            onPress={readCodes}
            disabled={reading}
            className="bg-brand-600 px-4 py-2 rounded-xl flex-row items-center gap-2"
          >
            {reading && <ActivityIndicator size="small" color="#fff" />}
            <Text className="text-white font-semibold text-sm">
              {reading ? 'Reading...' : '🔍 Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Empty state */}
        {activeCodes.length === 0 && (
          <View className="bg-surface-raised rounded-2xl p-8 items-center">
            <Text className="text-4xl mb-3">✅</Text>
            <Text className="text-white text-lg font-bold mb-1">No Fault Codes</Text>
            <Text className="text-slate-400 text-sm text-center">
              {connectionStatus === 'connected'
                ? 'Tap Scan to read codes from your vehicle'
                : 'Connect your OBD2 adapter and tap Scan'}
            </Text>
          </View>
        )}

        {/* Active codes */}
        {activeCodes_.length > 0 && (
          <>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Active ({activeCodes_.length})
            </Text>
            {activeCodes_.map((code) => (
              <CodeCard
                key={code.code}
                code={code}
                onPressAI={() => handleAskAI(code.code)}
                onPressClear={() => handleClearCode(code.code)}
              />
            ))}
          </>
        )}

        {/* Cleared codes */}
        {clearedCodes.length > 0 && (
          <>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 mt-2">
              Cleared ({clearedCodes.length})
            </Text>
            {clearedCodes.map((code) => (
              <CodeCard key={code.code} code={code} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
