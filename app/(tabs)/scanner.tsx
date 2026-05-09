import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Device } from 'react-native-ble-plx';
import { obd2 } from '@/lib/obd2/connection';
import { useAppStore } from '@/lib/store';
import { ConnectionStatusBadge } from '@/components/ConnectionStatus';

export default function ScannerScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const stopScanRef = useRef<(() => void) | null>(null);
  const { connectionStatus, connectedDevice, setConnectionStatus, setConnectedDevice } = useAppStore();

  useEffect(() => {
    return () => { stopScanRef.current?.(); };
  }, []);

  const startScan = async () => {
    const btOk = await obd2.checkBluetooth();
    if (!btOk) { Alert.alert('Bluetooth Off', 'Please enable Bluetooth and try again.'); return; }
    setDevices([]);
    setScanning(true);
    setConnectionStatus('scanning');
    const stop = obd2.scanForDevices((device) => {
      setDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });
    stopScanRef.current = stop;
    setTimeout(() => {
      stop(); setScanning(false);
      if (connectionStatus !== 'connected') setConnectionStatus('disconnected');
    }, 15000);
  };

  const connectToDevice = async (device: Device) => {
    stopScanRef.current?.(); setScanning(false);
    setConnectionStatus('connecting');
    try {
      await obd2.connect(device);
      setConnectedDevice({ id: device.id, name: device.name ?? 'OBD2 Adapter' });
      setConnectionStatus('connected');
    } catch (err) {
      setConnectionStatus('error');
      Alert.alert('Connection Failed', String(err));
    }
  };

  const disconnect = async () => {
    await obd2.disconnect();
    setConnectedDevice(null); setConnectionStatus('disconnected'); setDevices([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-muted">
      <View className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-bold">Scanner</Text>
          <ConnectionStatusBadge status={connectionStatus} deviceName={connectedDevice?.name} />
        </View>
        {connectionStatus === 'connected' && (
          <View className="bg-green-900 border border-green-700 rounded-2xl p-5 mb-4 items-center">
            <Text className="text-3xl mb-2">🔗</Text>
            <Text className="text-green-300 text-lg font-bold mb-1">Connected!</Text>
            <Text className="text-green-400 text-sm mb-4">{connectedDevice?.name}</Text>
            <TouchableOpacity onPress={disconnect} className="bg-red-800 px-6 py-2.5 rounded-xl">
              <Text className="text-red-200 font-semibold">Disconnect</Text>
            </TouchableOpacity>
          </View>
        )}
        {connectionStatus !== 'connected' && (
          <TouchableOpacity onPress={startScan} disabled={scanning} className={`rounded-2xl p-5 items-center mb-6 ${scanning ? 'bg-slate-700' : 'bg-brand-600'}`}>
            {scanning ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator color="#fff" />
                <Text className="text-white font-semibold text-lg">Scanning for adapters...</Text>
              </View>
            ) : (
              <>
                <Text className="text-3xl mb-2">📡</Text>
                <Text className="text-white font-bold text-lg">Scan for OBD2 Adapter</Text>
                <Text className="text-blue-200 text-sm mt-1">Make sure Bluetooth is enabled</Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <View className="bg-surface-raised rounded-2xl p-4 mb-4">
          <Text className="text-slate-300 text-sm font-semibold mb-2">💡 Tips</Text>
          <Text className="text-slate-400 text-sm leading-5">
            {'▢ Plug in your ELM327 adapter into the OBD2 port(usually under the dash)\n• Turn ignition to ON position\n Supported: ELM327, Veepeak, Carista, BAFX, vLink'}
          </Text>
        </View>
        {devices.length > 0 && (
          <>
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Found Devices ({devices.length})</Text>
            <FlatList data={devices} keyExtractor={(d) => d.id} renderItem={({ item }) => (
              <TouchableOpacity onPress={() => connectToDevice(item)} className="bg-surface-raised rounded-2xl p-4 mb-2 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <Text className="text-2xl">🔵</Text>
                  <View>
                    <Text className="text-white font-semibold">{item.name ?? 'Unknown Device'}</Text>
                    <Text className="text-slate-400 text-xs">{item.id}</Text>
                  </View>
                </View>
                <Text className="text-brand-400 text-sm font-semibold">Connect →</Text>
              </TouchableOpacity>
             )} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
