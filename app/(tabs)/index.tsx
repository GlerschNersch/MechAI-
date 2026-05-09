import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/lib/store';
import { activateDemoMode, startDemoLiveDataSimulation } from '@/lib/demo';
import { ConnectionStatusBadge } from '@/components/ConnectionStatus';
import { GaugeCard } from '@/components/GaugeCard';

export default function DashboardScreen() {
  const router = useRouter();
  const { connectionStatus, connectedDevice, activeCodes, liveData, isDemoMode } = useAppStore();

  useEffect(() => {
    if (isDemoMode) {
      const stop = startDemoLiveDataSimulation();
      return stop;
    }
  }, [isDemoMode]);

  const criticalCodes = activeCodes.filter((c) => c.severity === 'critical' && !c.cleared);
  const allActiveCodes = activeCodes.filter((c) => !c.cleared);

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">MechAI</Text>
            <Text className="text-slate-400 text-sm">Your AI mechanic</Text>
          </View>
          <ConnectionStatusBadge status={connectionStatus} deviceName={connectedDevice?.name} />
        </View>

        {/* Critical alert banner */}
        {criticalCodes.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/codes')}
            className="bg-red-900 border border-red-700 rounded-2xl p-4 mb-4">
            <Text className="text-red-400 font-bold text-sm mb-1">⚠️ Critical Issue Detected</Text>
            <Text className="text-red-300 text-xs">
              {criticalCodes[0].code} — {criticalCodes[0].description}
            </Text>
            <Text className="text-red-400 text-xs mt-1 font-semibold">Tap to view →</Text>
          </TouchableOpacity>
        )}

        {/* Connection prompt */}
        {connectionStatus === 'disconnected' && (
          <View className="bg-surface-raised rounded-2xl p-6 mb-4 items-center">
            <Text className="text-4xl mb-3">🔌</Text>
            <Text className="text-white text-lg font-semibold mb-1">No Scanner Connected</Text>
            <Text className="text-slate-400 text-sm text-center mb-4">
              Connect your OBD2 adapter to start diagnosing your vehicle
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/scanner')}
                className="bg-brand-600 px-5 py-2.5 rounded-xl"
              >
                <Text className="text-white font-semibold">Connect Scanner</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={activateDemoMode}
                className="bg-slate-700 px-5 py-2.5 rounded-xl"
              >
                <Text className="text-slate-300 font-semibold">Try Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Health summary */}
        {connectionStatus === 'connected' && (
          <View className="bg-surface-raised rounded-2xl p-4 mb-4">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Vehicle Health
            </Text>
            <View className="flex-row items-center gap-3">
              <View
                className={`w-14 h-14 rounded-full items-center justify-center ${
                  allActiveCodes.length === 0
                    ? 'bg-green-900'
                    : criticalCodes.length > 0
                    ? 'bg-red-900'
                    : 'bg-yellow-900'
                }`}
              >
                <Text className="text-2xl">
                  {allActiveCodes.length === 0 ? '✅' : criticalCodes.length > 0 ? '🚨' : '⚠️'}
                </Text>
              </View>
              <View>
                <Text className="text-white text-lg font-bold">
                  {allActiveCodes.length === 0
                    ? 'All Clear'
                    : `${allActiveCodes.length} Issue${allActiveCodes.length > 1 ? 's' : ''} Found`}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {allActiveCodes.length === 0
                    ? 'No fault codes detected'
                    : `${criticalCodes.length} critical, ${allActiveCodes.length - criticalCodes.length} other`}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Live data gauges */}
        {connectionStatus === 'connected' && (
          <>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Live Data
            </Text>
            <View className="flex-row flex-wrap -m-1 mb-4">
              <GaugeCard label="RPM" value={liveData.rpm} unit="rpm" min={0} max={7000} warnAbove={5500} dangerAbove={6500} />
              <GaugeCard label="Speed" value={liveData.speed} unit="km/h" min={0} max={180} warnAbove={130} />
              <GaugeCard label="Coolant" value={liveData.coolantTemp} unit="°C" min={-40} max={130} warnAbove={100} dangerAbove={115} />
              <GaugeCard label="Fuel" value={liveData.fuelLevel} unit="%" warnBelow={15} />
              <GaugeCard label="Battery" value={liveData.batteryVoltage} unit="V" min={10} max={16} warnBelow={11.5} dangerAbove={15} />
              <GaugeCard label="Engine Load" value={liveData.engineLoad} unit="%" warnAbove={85} dangerAbove={95} />
            </View>
          </>
        )}

        {/* Quick actions */}
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Quick Actions
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/codes')}
            className="flex-1 bg-surface-raised rounded-2xl p-4 items-center"
          >
            <Text className="text-2xl mb-1">🔍</Text>
            <Text className="text-white text-sm font-semibold">Read Codes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/ai')}
            className="flex-1 bg-surface-raised rounded-2xl p-4 items-center"
          >
            <Text className="text-2xl mb-1">⒨</Text>
            <Text className="text-white text-sm font-semibold">Ask AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/live')}
            className="flex-1 bg-surface-raised rounded-2xl p-4 items-center"
          >
            <Text className="text-2xl mb-1">📊</Text>
            <Text className="text-white text-sm font-semibold">Live Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
