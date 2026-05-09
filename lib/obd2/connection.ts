import { BleManager, Device, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { AT_COMMANDS, INIT_SEQUENCE } from './commands';
import { parseDTCs, parseLiveDataResponse } from './parser';
import type { LiveData } from '../store';

// Common ELM327 BLE service/characteristic UUIDs
const OBD2_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD2_WRITE_UUID   = '0000fff2-0000-1000-8000-00805f9b34fb';
const OBD2_NOTIFY_UUID  = '0000fff1-0000-1000-8000-00805f9b34fb';

export class OBD2Connection {
  private manager: BleManager;
  private device: Device | null = null;
  private responseBuffer = '';
  private pendingResolve: ((value: string) => void) | null = null;

  constructor() {
    this.manager = new BleManager();
  }

  /** Check if Bluetooth is powered on */
  async checkBluetooth(): Promise<boolean> {
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  /** Scan for nearby OBD2 adapters */
  scanForDevices(onDevice: (device: Device) => void): () => void {
    this.manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error || !device) return;
      // Filter for likely OBD2 adapters by name
      const name = device.name?.toUpperCase() ?? '';
      if (
        name.includes('OBD') ||
        name.includes('ELM') ||
        name.includes('VLINK') ||
        name.includes('VEEPEAK') ||
        name.includes('CARISTA') ||
        device.rssi && device.rssi > -80
      ) {
        onDevice(device);
      }
    });

    return () => this.manager.stopDeviceScan();
  }

  /** Connect to a device and run the ELM327 init sequence */
  async connect(device: Device): Promise<void> {
    this.device = await device.connect();
    await this.device.discoverAllServicesAndCharacteristics();

    // Subscribe to notifications
    this.device.monitorCharacteristicForService(
      OBD2_SERVICE_UUID,
      OBD2_NOTIFY_UUID,
      (error, characteristic) => {
        if (error || !characteristic?.value) return;
        const chunk = Buffer.from(characteristic.value, 'base64').toString('utf-8');
        this.responseBuffer += chunk;

        // ELM327 ends responses with '>'
        if (this.responseBuffer.includes('>') && this.pendingResolve) {
          const response = this.responseBuffer.trim().replace('>', '').trim();
          this.responseBuffer = '';
          this.pendingResolve(response);
          this.pendingResolve = null;
        }
      }
    );

    // Run init sequence
    for (const cmd of INIT_SEQUENCE) {
      await this.sendCommand(cmd);
      await this.delay(100);
    }
  }

  /** Send a command and wait for a response */
  async sendCommand(command: string, timeoutMs = 3000): Promise<string> {
    if (!this.device) throw new Error('Not connected');

    const encoded = Buffer.from(command + '\r').toString('base64');
    await this.device.writeCharacteristicWithoutResponseForService(
      OBD2_SERVICE_UUID,
      OBD2_WRITE_UUID,
      encoded
    );

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingResolve = null;
        reject(new Error(`Timeout waiting for response to: ${command}`));
      }, timeoutMs);

      this.pendingResolve = (value) => {
        clearTimeout(timer);
        resolve(value);
      };
    });
  }

  /** Read all active DTCs */
  async readDTCs(): Promise<string[]> {
    const response = await this.sendCommand(AT_COMMANDS.READ_DTCS);
    return parseDTCs(response);
  }

  /** Clear all DTCs (reset check engine light) */
  async clearDTCs(): Promise<void> {
    await this.sendCommand(AT_COMMANDS.CLEAR_DTCS);
  }

  /** Poll a single live data PID */
  async pollPID(pid: string): Promise<Partial<LiveData>> {
    try {
      const response = await this.sendCommand(pid);
      return parseLiveDataResponse(pid, response);
    } catch {
      return {};
    }
  }

  /** Disconnect from the device */
  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.cancelConnection();
      this.device = null;
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  destroy() {
    this.manager.destroy();
  }
}

// Singleton instance
export const obd2 = new OBD2Connection();
