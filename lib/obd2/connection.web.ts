// Web stub — BLE is not available in browsers.
// On web, demo mode is used exclusively.
import type { LiveData } from '../store';

export class OBD2Connection {
  async checkBluetooth(): Promise<boolean> { return false; }
  scanForDevices(_onDevice: (device: any) => void): () => void { return () => {}; }
  async connect(_device: any): Promise<void> { throw new Error('BLE not available on web'); }
  async sendCommand(_command: string): Promise<string> { throw new Error('BLE not available on web'); }
  async readDTCs(): Promise<string[]> { return []; }
  async clearDTCs(): Promise<void> {}
  async pollPID(_pid: string): Promise<Partial<LiveData>> { return {}; }
  async disconnect(): Promise<void> {}
  destroy() {}
}

export const obd2 = new OBD2Connection();
