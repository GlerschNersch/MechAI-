/**
 * ELM327 OBD2 AT Commands
 * These are sent over Bluetooth to the ELM327 adapter.
 */

export const AT_COMMANDS = {
  // Initialization
  RESET: 'ATZ',                  // Reset all
  ECHO_OFF: 'ATE0',             // Echo off
  LINE_FEED_OFF: 'ATL0',        // Line feeds off
  HEADERS_OFF: 'ATH0',          // Headers off
  SPACES_OFF: 'ATS0',           // Spaces off
  PROTOCOL_AUTO: 'ATSP0',       // Auto-select protocol
  DESCRIBE_PROTOCOL: 'ATDP',    // Describe current protocol

  // PIDs - Mode 01 (Current Data)
  ENGINE_RPM: '010C',           // RPM
  VEHICLE_SPEED: '010D',        // Speed (km/h)
  COOLANT_TEMP: '0105',         // Coolant temperature
  THROTTLE_POS: '0111',         // Throttle position
  ENGINE_LOAD: '0104',          // Calculated engine load
  INTAKE_TEMP: '010F',          // Intake air temperature
  FUEL_LEVEL: '012F',           // Fuel tank level
  MONITOR_STATUS: '0101',       // Monitor status since DTCs cleared (Emissions Readiness)
  BATTERY_VOLTAGE: 'ATRV',      // Battery voltage (ELM327 specific)
  O2_SENSOR_1: '0114',          // O2 sensor 1
  MAF_RATE: '0110',             // Mass air flow rate

  // Mode 03 - Read DTCs
  READ_DTCS: '03',

  // Mode 04 - Clear DTCs
  CLEAR_DTCS: '04',

  // Mode 09 - Vehicle Info
  VIN: '0902',                  // Vehicle Identification Number
} as const;

export const INIT_SEQUENCE = [
  AT_COMMANDS.RESET,
  AT_COMMANDS.ECHO_OFF,
  AT_COMMANDS.LINE_FEED_OFF,
  AT_COMMANDS.HEADERS_OFF,
  AT_COMMANDS.SPACES_OFF,
  AT_COMMANDS.PROTOCOL_AUTO,
];
