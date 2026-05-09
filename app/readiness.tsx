import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '@/lib/store';
import { obd2 } from '@/lib/obd2/connection';
import { AT_COMMANDS } from '@/lib/obd2/commands';

export default function ReadinessScreen() {
  const router = useRouter();
  const { connectionStatus, liveData, updateLiveData, isDemoMode } = useAppStore();

  useEffect(() => {
    async function fetchReadiness() {
      if (connectionStatus === 'connected' && !isDemoMode) {
        const data = await obd2.pollPID(AT_COMMANDS.MONITOR_STATUS);
        updateLiveData(data);
      }
    }
    fetchReadiness();
  }, [connectionStatus, isDemoMode, updateLiveData]);

  const readiness = liveData.readiness;
  const isConnected = connectionStatus === 'connected';

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <View className="flex-row items-center px-4 py-3 border-b border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Emissions Readiness</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {!isConnected && (
          <View className="bg-surface-raised rounded-2xl p-8 items-center mb-6">
            <Text className="text-4xl mb-3">📡</Text>
            <Text className="text-white text-lg font-bold mb-1">Not Connected</Text>
            <Text className="text-slate-400 text-sm text-center">
              Connect your OBD2 adapter to check emissions readiness status
            </Text>
          </View>
        )}

        {isConnected && readiness && (
          <>
            {/* Overview Card */}
            <View className="bg-surface-raised rounded-2xl p-5 mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    Overall Status
                  </Text>
                  <Text className={`text-2xl font-bold ${readiness.monitors.every(m => m.complete) ? 'text-green-400' : 'text-yellow-400'}`}>
                    {readiness.monitors.every(m => m.complete) ? 'Ready for Smog' : 'Not Ready'}
                  </Text>
                </View>
                <View className={`w-12 h-12 rounded-full items-center justify-center ${readiness.monitors.every(m => m.complete) ? 'bg-green-900' : 'bg-yellow-900'}`}>
                  <Ionicons 
                    name={readiness.monitors.every(m => m.complete) ? "checkmark-circle" : "alert-circle"} 
                    size={32} 
                    color={readiness.monitors.every(m => m.complete) ? "#4ade80" : "#fbbf24"} 
                  />
                </View>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-slate-400 text-xs mb-1">MIL Status</Text>
                  <Text className={`text-lg font-bold ${readiness.milOn ? 'text-red-400' : 'text-green-400'}`}>
                    {readiness.milOn ? 'ON' : 'OFF'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 text-xs mb-1">DTC Count</Text>
                  <Text className="text-white text-lg font-bold">{readiness.dtcCount}</Text>
                </View>
              </View>
            </View>

            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3 px-1">
              Monitors
            </Text>

            <View className="bg-surface-raised rounded-2xl overflow-hidden">
              {readiness.monitors.map((m, i, arr) => (
                <View 
                  key={m.name} 
                  className={`flex-row justify-between items-center px-5 py-4 ${i < arr.length - 1 ? 'border-b border-slate-700' : ''}`}
                >
                  <View>
                    <Text className="text-white font-semibold">{m.name}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Text className={`text-xs font-bold uppercase ${m.complete ? 'text-green-400' : 'text-yellow-400'}`}>
                      {m.complete ? 'Complete' : 'Incomplete'}
                    </Text>
                    <Ionicons 
                      name={m.complete ? "checkmark-circle" : "ellipse-outline"} 
                      size={18} 
                      color={m.complete ? "#4ade80" : "#fbbf24"} 
                    />
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-6 p-4 bg-slate-800 rounded-xl">
              <Text className="text-slate-400 text-xs leading-5">
                <Ionicons name="information-circle-outline" size={14} /> Emissions readiness monitors are self-tests performed by your car's computer. All monitors must be "Complete" to pass a state smog inspection. If you recently cleared codes or disconnected the battery, you may need to drive your car for several days to complete these tests.
              </Text>
            </View>
          </>
        )}

        {isConnected && !readiness && (
          <View className="p-10 items-center">
            <Text className="text-slate-400">Loading readiness data...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
