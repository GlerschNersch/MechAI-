import type { DtcCode } from '../store';

interface DtcEntry {
  description: string;
  severity: DtcCode['severity'];
  system: string;
}

const DTC_DATABASE: Record<string, DtcEntry> = {
  // Powertrain - Fuel & Air
  P0100: { description: 'Mass or Volume Air Flow Circuit Malfunction', severity: 'medium', system: 'Fuel & Air' },
  P0101: { description: 'Mass or Volume Air Flow Circuit Range/Performance', severity: 'medium', system: 'Fuel & Air' },
  P0102: { description: 'Mass or Volume Air Flow Circuit Low Input', severity: 'medium', system: 'Fuel & Air' },
  P0103: { description: 'Mass or Volume Air Flow Circuit High Input', severity: 'medium', system: 'Fuel & Air' },
  P0110: { description: 'Intake Air Temperature Circuit Malfunction', severity: 'low', system: 'Fuel & Air' },
  P0111: { description: 'Intake Air Temperature Circuit Range/Performance', severity: 'low', system: 'Fuel & Air' },
  P0120: { description: 'Throttle/Pedal Position Sensor/Switch A Circuit', severity: 'high', system: 'Fuel & Air' },
  P0121: { description: 'Throttle/Pedal Position Sensor/Switch A Range/Performance', severity: 'high', system: 'Fuel & Air' },
  P0130: { description: 'O2 Sensor Circuit Malfunction (Bank 1, Sensor 1)', severity: 'medium', system: 'Fuel & Air' },
  P0131: { description: 'O2 Sensor Circuit Low Voltage (Bank 1, Sensor 1)', severity: 'medium', system: 'Fuel & Air' },
  P0132: { description: 'O2 Sensor Circuit High Voltage (Bank 1, Sensor 1)', severity: 'medium', system: 'Fuel & Air' },
  P0133: { description: 'O2 Sensor Circuit Slow Response (Bank 1, Sensor 1)', severity: 'medium', system: 'Fuel & Air' },
  P0134: { description: 'O2 Sensor Circuit No Activity Detected (Bank 1, Sensor 1)', severity: 'medium', system: 'Fuel & Air' },
  P0135: { description: 'O2 Sensor Heater Circuit Malfunction (Bank 1, Sensor 1)', severity: 'low', system: 'Fuel & Air' },
  P0171: { description: 'System Too Lean (Bank 1)', severity: 'medium', system: 'Fuel & Air' },
  P0172: { description: 'System Too Rich (Bank 1)', severity: 'medium', system: 'Fuel & Air' },
  P0174: { description: 'System Too Lean (Bank 2)', severity: 'medium', system: 'Fuel & Air' },
  P0175: { description: 'System Too Rich (Bank 2)', severity: 'medium', system: 'Fuel & Air' },

  // Powertrain - Ignition
  P0300: { description: 'Random/Multiple Cylinder Misfire Detected', severity: 'critical', system: 'Ignition' },
  P0301: { description: 'Cylinder 1 Misfire Detected', severity: 'high', system: 'Ignition' },
  P0302: { description: 'Cylinder 2 Misfire Detected', severity: 'high', system: 'Ignition' },
  P0303: { description: 'Cylinder 3 Misfire Detected', severity: 'high', system: 'Ignition' },
  P0304: { description: 'Cylinder 4 Misfire Detected', severity: 'high', system: 'Ignition' },
  P0305: { description: 'Cylinder 5 Misfire Detected', severity: 'high', system: 'Ignition' },
  P0306: { description: 'Cylinder 6 Misfire Detected', severity: 'high', system: 'Ignition' },
  P0320: { description: 'Ignition/Distributor Engine Speed Input Circuit Malfunction', severity: 'critical', system: 'Ignition' },
  P0325: { description: 'Knock Sensor 1 Circuit Malfunction (Bank 1)', severity: 'medium', system: 'Ignition' },
  P0340: { description: 'Camshaft Position Sensor A Circuit Malfunction (Bank 1)', severity: 'high', system: 'Ignition' },
  P0351: { description: 'Ignition Coil A Primary/Secondary Circuit Malfunction', severity: 'high', system: 'Ignition' },

  // Powertrain - Emission Control
  P0400: { description: 'Exhaust Gas Recirculation Flow Malfunction', severity: 'low', system: 'Emissions' },
  P0401: { description: 'Exhaust Gas Recirculation Flow Insufficient', severity: 'low', system: 'Emissions' },
  P0420: { description: 'Catalyst System Efficiency Below Threshold (Bank 1)', severity: 'medium', system: 'Emissions' },
  P0430: { description: 'Catalyst System Efficiency Below Threshold (Bank 2)', severity: 'medium', system: 'Emissions' },
  P0440: { description: 'Evaporative Emission Control System Malfunction', severity: 'low', system: 'Emissions' },
  P0441: { description: 'Evaporative Emission Control System Incorrect Purge Flow', severity: 'low', system: 'Emissions' },
  P0442: { description: 'Evaporative Emission Control System Leak Detected (Small)', severity: 'low', system: 'Emissions' },
  P0445: { description: 'Evaporative Emission Control System Purge Control Valve Shorted', severity: 'low', system: 'Emissions' },
  P0455: { description: 'Evaporative Emission Control System Leak Detected (Large)', severity: 'medium', system: 'Emissions' },
  P0456: { description: 'Evaporative Emission Control System Leak Detected (Very Small)', severity: 'low', system: 'Emissions' },

  // Powertrain - Speed/Idle Control
  P0500: { description: 'Vehicle Speed Sensor Malfunction', severity: 'high', system: 'Speed Control' },
  P0505: { description: 'Idle Control System Malfunction', severity: 'medium', system: 'Speed Control' },
  P0506: { description: 'Idle Control System RPM Too Low', severity: 'medium', system: 'Speed Control' },
  P0507: { description: 'Idle Control System RPM Too High', severity: 'medium', system: 'Speed Control' },

  // Powertrain - Cooling
  P0115: { description: 'Engine Coolant Temperature Circuit Malfunction', severity: 'high', system: 'Cooling' },
  P0116: { description: 'Engine Coolant Temperature Circuit Range/Performance', severity: 'medium', system: 'Cooling' },
  P0117: { description: 'Engine Coolant Temperature Circuit Low Input', severity: 'high', system: 'Cooling' },
  P0118: { description: 'Engine Coolant Temperature Circuit High Input', severity: 'high', system: 'Cooling' },
  P0128: { description: 'Coolant Thermostat — Coolant Temperature Below Thermostat Regulating Temperature', severity: 'medium', system: 'Cooling' },

  // Transmission
  P0700: { description: 'Transmission Control System Malfunction', severity: 'high', system: 'Transmission' },
  P0711: { description: 'Transmission Fluid Temperature Sensor Range/Performance', severity: 'medium', system: 'Transmission' },
  P0720: { description: 'Output Speed Sensor Circuit Malfunction', severity: 'high', system: 'Transmission' },
  P0730: { description: 'Incorrect Gear Ratio', severity: 'high', system: 'Transmission' },
  P0740: { description: 'Torque Converter Clutch Circuit Malfunction', severity: 'medium', system: 'Transmission' },
  P0750: { description: 'Shift Solenoid A Malfunction', severity: 'high', system: 'Transmission' },

  // Fuel System
  P0087: { description: 'Fuel Rail/System Pressure Too Low', severity: 'critical', system: 'Fuel System' },
  P0088: { description: 'Fuel Rail/System Pressure Too High', severity: 'critical', system: 'Fuel System' },
  P0089: { description: 'Fuel Pressure Regulator Performance', severity: 'high', system: 'Fuel System' },
  P0090: { description: 'Fuel Pressure Regulator Control Circuit', severity: 'high', system: 'Fuel System' },
  P0193: { description: 'Fuel Rail Pressure Sensor Circuit High Input', severity: 'high', system: 'Fuel System' },

  // Battery / Charging
  P0562: { description: 'System Voltage Low', severity: 'high', system: 'Electrical' },
  P0563: { description: 'System Voltage High', severity: 'high', system: 'Electrical' },
  P0620: { description: 'Generator Control Circuit Malfunction', severity: 'high', system: 'Electrical' },
  P0625: { description: 'Generator Field Terminal Circuit Low', severity: 'medium', system: 'Electrical' },
};

const UNKNOWN_CODE: DtcEntry = {
  description: 'Unknown fault code — consult a mechanic for diagnosis',
  severity: 'medium',
  system: 'Unknown',
};

export function lookupDTC(code: string): DtcCode {
  const entry = DTC_DATABASE[code.toUpperCase()] ?? UNKNOWN_CODE;
  return { code: code.toUpperCase(), ...entry };
}

export function lookupMultipleDTCs(codes: string[]): DtcCode[] {
  return codes.map(lookupDTC);
}
