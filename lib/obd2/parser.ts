import type { LiveData } from '../store';

/**
 * Parse raw OBD2 hex responses into human-readable values.
 */

function hexToInt(hex: string): number {
  return parseInt(hex.replace(/\s/g, ''), 16);
}

/** RPM: ((A*256)+B)/4 */
export function parseRPM(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^410C/, '');
  if (clean.length < 4) return null;
  const A = hexToInt(clean.slice(0, 2));
  const B = hexToInt(clean.slice(2, 4));
  return ((A * 256) + B) / 4;
}

/** Speed: A (km/h) */
export function parseSpeed(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^410D/, '');
  if (clean.length < 2) return null;
  return hexToInt(clean.slice(0, 2));
}

/** Coolant temp: A - 40 (°C) */
export function parseCoolantTemp(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^4105/, '');
  if (clean.length < 2) return null;
  return hexToInt(clean.slice(0, 2)) - 40;
}

/** Throttle: (A * 100) / 255 (%) */
export function parseThrottlePos(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^4111/, '');
  if (clean.length < 2) return null;
  return Math.round((hexToInt(clean.slice(0, 2)) * 100) / 255);
}

/** Engine load: (A * 100) / 255 (%) */
export function parseEngineLoad(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^4104/, '');
  if (clean.length < 2) return null;
  return Math.round((hexToInt(clean.slice(0, 2)) * 100) / 255);
}

/** Intake temp: A - 40 (°C) */
export function parseIntakeTemp(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^410F/, '');
  if (clean.length < 2) return null;
  return hexToInt(clean.slice(0, 2)) - 40;
}

/** Fuel level: (A * 100) / 255 (%) */
export function parseFuelLevel(response: string): number | null {
  const clean = response.replace(/\s/g, '').replace(/^412F/, '');
  if (clean.length < 2) return null;
  return Math.round((hexToInt(clean.slice(0, 2)) * 100) / 255);
}

/** Battery voltage: direct from ATRV response e.g. "12.3V" */
export function parseBatteryVoltage(response: string): number | null {
  const match = response.match(/(\d+\.\d+)V/);
  if (!match) return null;
  return parseFloat(match[1]);
}

/** Emissions Readiness (0101) */
export function parseReadiness(response: string): any {
  const clean = response.replace(/\s/g, '').replace(/^4101/, '');
  if (clean.length < 8) return null;

  const A = hexToInt(clean.slice(0, 2));
  const B = hexToInt(clean.slice(2, 4));
  const C = hexToInt(clean.slice(4, 6));
  const D = hexToInt(clean.slice(6, 8));

  const milOn = (A & 0x80) !== 0;
  const dtcCount = A & 0x7F;

  // Simplified monitor mapping for common monitors
  // B bits 0-2: Available, 4-6: Incomplete (for Spark ignition)
  // C bits 0-7: Available, D bits 0-7: Incomplete
  
  const resultMonitors = [];
  
  const commonMonitors = [
    { name: 'Misfire', availByte: B, availBit: 0, incByte: B, incBit: 4 },
    { name: 'Fuel System', availByte: B, availBit: 1, incByte: B, incBit: 5 },
    { name: 'Components', availByte: B, availBit: 2, incByte: B, incBit: 6 },
    { name: 'Catalyst', availByte: C, availBit: 0, incByte: D, incBit: 0 },
    { name: 'Heated Catalyst', availByte: C, availBit: 1, incByte: D, incBit: 1 },
    { name: 'Evaporative System', availByte: C, availBit: 2, incByte: D, incBit: 2 },
    { name: 'Secondary Air System', availByte: C, availBit: 3, incByte: D, incBit: 3 },
    { name: 'A/C Refrigerant', availByte: C, availBit: 4, incByte: D, incBit: 4 },
    { name: 'Oxygen Sensor', availByte: C, availBit: 5, incByte: D, incBit: 5 },
    { name: 'Oxygen Sensor Heater', availByte: C, availBit: 6, incByte: D, incBit: 6 },
    { name: 'EGR System', availByte: C, availBit: 7, incByte: D, incBit: 7 },
  ];

  for (const m of commonMonitors) {
    const available = (m.availByte & (1 << m.availBit)) !== 0;
    if (available) {
      const incomplete = (m.incByte & (1 << m.incBit)) !== 0;
      resultMonitors.push({
        name: m.name,
        available: true,
        complete: !incomplete,
      });
    }
  }

  return { milOn, dtcCount, monitors: resultMonitors };
}

/**
 * Parse Mode 03 DTC response.
 * Response format: 43 XX YY XX YY ... (each pair is one code)
 */
export function parseDTCs(response: string): string[] {
  const codes: string[] = [];
  const clean = response.replace(/\s/g, '').replace(/^43/, '');

  for (let i = 0; i < clean.length; i += 4) {
    const chunk = clean.slice(i, i + 4);
    if (chunk.length < 4 || chunk === '0000') continue;

    const firstNibble = parseInt(chunk[0], 16);
    const prefix = ['P', 'C', 'B', 'U'][firstNibble >> 2] ?? 'P';
    const rest = (firstNibble & 0x03).toString() + chunk.slice(1);
    codes.push(`${prefix}${rest.toUpperCase()}`);
  }

  return codes;
}

/** Map PID response to a LiveData key */
export function parseLiveDataResponse(pid: string, response: string): Partial<LiveData> {
  if (response.includes('NO DATA') || response.includes('ERROR')) return {};

  switch (pid) {
    case '010C': return { rpm: parseRPM(response) };
    case '010D': return { speed: parseSpeed(response) };
    case '0105': return { coolantTemp: parseCoolantTemp(response) };
    case '0111': return { throttlePos: parseThrottlePos(response) };
    case '0104': return { engineLoad: parseEngineLoad(response) };
    case '010F': return { intakeTemp: parseIntakeTemp(response) };
    case '012F': return { fuelLevel: parseFuelLevel(response) };
    case '0101': return { readiness: parseReadiness(response) };
    case 'ATRV': return { batteryVoltage: parseBatteryVoltage(response) };
    default:     return {};
  }
}
