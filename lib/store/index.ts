import { create } from 'zustand';

export type ConnectionStatus = 'disconnected' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface DtcCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  system: string;
  cleared?: boolean;
}

export interface LiveData {
  rpm: number | null;
  speed: number | null;
  coolantTemp: number | null;
  throttlePos: number | null;
  fuelLevel: number | null;
  batteryVoltage: number | null;
  intakeTemp: number | null;
  engineLoad: number | null;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
}

export interface ScanSession {
  id: string;
  date: string;
  vehicleId: string;
  codes: DtcCode[];
}

interface AppState {
  // Connection
  connectionStatus: ConnectionStatus;
  connectedDevice: { id: string; name: string } | null;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setConnectedDevice: (device: { id: string; name: string } | null) => void;

  // DTCs
  activeCodes: DtcCode[];
  setActiveCodes: (codes: DtcCode[]) => void;
  clearCode: (code: string) => void;

  // Live data
  liveData: LiveData;
  updateLiveData: (data: Partial<LiveData>) => void;

  // Vehicle
  vehicles: Vehicle[];
  activeVehicleId: string | null;
  addVehicle: (vehicle: Vehicle) => void;
  setActiveVehicle: (id: string) => void;

  // History
  scanHistory: ScanSession[];
  addScanSession: (session: ScanSession) => void;

  // Demo mode
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  connectionStatus: 'disconnected',
  connectedDevice: null,
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setConnectedDevice: (device) => set({ connectedDevice: device }),

  activeCodes: [],
  setActiveCodes: (codes) => set({ activeCodes: codes }),
  clearCode: (code) =>
    set((state) => ({
      activeCodes: state.activeCodes.map((c) =>
        c.code === code ? { ...c, cleared: true } : c
      ),
    })),

  liveData: {
    rpm: null,
    speed: null,
    coolantTemp: null,
    throttlePos: null,
    fuelLevel: null,
    batteryVoltage: null,
    intakeTemp: null,
    engineLoad: null,
  },
  updateLiveData: (data) =>
    set((state) => ({ liveData: { ...state.liveData, ...data } })),

  vehicles: [],
  activeVehicleId: null,
  addVehicle: (vehicle) =>
    set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
  setActiveVehicle: (id) => set({ activeVehicleId: id }),

  scanHistory: [],
  addScanSession: (session) =>
    set((state) => ({ scanHistory: [session, ...state.scanHistory] })),

  isDemoMode: false,
  setDemoMode: (enabled) => set({ isDemoMode: enabled }),
}));
