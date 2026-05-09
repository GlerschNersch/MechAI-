import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '@/lib/store';
import { obd2 } from '@/lib/obd2/connection';
import { AT_COMMANDS } from '@/lib/obd2/commands';
import { GaugeCard } from '@/components/GaugeCard';

const LIVE_PIDS = [
  AT_COMMANDS.ENGINE_RPM,
  AT_COMMANDS.VEHICLE_SPEED,
  AT_COMMANDS.COOLANT_TEMP,
  AT_COMMANDS.THROTTLE_POS,
  AT_COMMANDS.ENGINE_LOAD,
  AT_COMMANDS.INTAKE_TEMP,
  AT_COMMANDS.FUEL_LEVEL,
  AT_COMMANDS.BATTERY_VOLTAGE,
];

export default function LiveDataScreen() {
  const { connectionStatus, liveData, updateLiveData, isDemoMode } = useAppStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (connectionStatus === 'connected' && !isDemoMode) {
      pollingRef.current = setInterval(async () => {
        for (const pid of LIVE_PIDS) {
          const data = await obd2.pollPID(pid);
          updateLiveData(data);
        }
      }, 1000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [connectionStatus, isDemoMode, updateLiveData]);

  const isConnected = connectionStatus === 'connected';

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-white text-2xl font-bold">Live Data</Text>
            <Text className="text-slate-400 text-sm">
              {isConnected ? 'Updating every second' : 'No scanner connected'}
            </Text>
          </View>
          {isConnected && (
            <View className="flex-row items-center gap-1.5 bg-green-900 px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-400" />
              <Text className="text-green-400 text-xs font-semibold">Live</Text>
            </View>
          )}
        </View>
        {!isConnected && (
          <View className="bg-surface-raised rounded-2xl p-8 items-center mb-4">
            <Text className="text-4xl mb-3">📡</Text>
            <Text className="text-white text-lg font-bold mb-1">Not Connected</Text>
            <Text className="text-slate-400 text-sm text-center">
              Connect your OBD2 adapter to see live sensor data
            </Text>
          </View>
        )}
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Engine</Text>
        <View className="flex-row flex-wrap -m-1 mb-4">
          <GaugeCard label="RPM" value={liveData.rpm} unit="rpm" min={0} max={7000} warnAbove={5500} dangerAbove={6500} />
          <GaugeCard label="Speed" value={liveData.speed} unit="km/h" min={0} max={200} warnAbove={140} />
          <GaugeCard label="Engine Load" value={liveData.engineLoad} unit="%" warnAbove={85} dangerAbove={95} />
          <GaugeCard label="Throttle" value={liveData.throttlePos} unit="%" />
        </View>
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Temperature</Text>
        <View className="flex-row flex-wrap -m-1 mb-4">
          <GaugeCard label="Coolant" value={liveData.coolantTemp} unit="°C" min={-40} max={130} warnAbove={100} dangerAbove={115} />
          <GaugeCard label="Intake Air" value={liveData.intakeTemp} unit="°C" min={-40} max={80} warnAbove={60} />
        </View>
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Fuel & Electrical</Text>
        <View className="flex-row flex-wrap -m-1 mb-4">
          <GaugeCard label="Fuel Level" value={liveData.fuelLevel} unit="%" warnBelow={15} />
          <GaugeCard label="Battery" value={liveData.batteryVoltage} unit="V" min={10} max={16} warnBelow={11.5} dangerAbove={15} />
        </View>
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Raw Values</Text>
        <View className="bg-surface-raised rounded-2xl overflow-hidden">
          {[
            { label: 'Engine RPM',    value: liveData.rpm,            unit: 'rpm' },
            { label: 'Vehicle Speed', value: liveData.speed,          unit: 'km/h' },
            { label: 'Coolant Temp',  value: liveData.coolantTemp,    unit: '°C' },
            { label: 'Intake Temp',   value: liveData.intakeTemp,     unit: '°C' },
            { label: 'Throttle Pos',  value: liveData.throttlePos,    unit: '%' },
            { label: 'Engine Load',   value: liveData.engineLoad,     unit: '%' },
            { label: 'Fuel Level',    value: liveData.fuelLevel,      unit: '%' },
            { label: 'Battery',       value: liveData.batteryVoltage, unit: 'V' },
          ].map((row, i, arr) => (
            <View key={row.label} className={`flex-row justify-between items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-slate-700' : ''}`}>
              <Text className="text-slate-400 text-sm">{row.label}</Text>
              <Text className="text-white text-sm font-mono font-semibold">{row.value !== null ? `${row.value} ${row.unit}` : '--'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
