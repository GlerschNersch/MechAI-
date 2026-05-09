# MechAI 🔧

A mobile app that connects to OBD2 scanners and uses AI to diagnose your vehicle's issues in plain English.

## Features

- **Bluetooth OBD2 Connection** — Pairs with any ELM327-based adapter (Veepeak, Carista, BAFX, vLink)
- **Fault Code Reader** — Reads and explains Diagnostic Trouble Codes (DTCs) with severity levels
- **Live Data Dashboard** — Real-time gauges for RPM, speed, coolant temp, fuel level, battery voltage, and more
- **AI Diagnosis** — Powered by Claude: plain-English explanations, likely causes, repair costs, and safety advice
- **Demo Mode** — Try the full app without an OBD2 adapter

## Tech Stack

- **React Native + Expo** (cross-platform iOS & Android)
- **Expo Router** — file-based navigation
- **react-native-ble-plx** — Bluetooth Low Energy OBD2 communication
- **Zustand** — lightweight state management
- **NativeWind (Tailwind CSS)** — styling
- **Anthropic Claude API** — AI diagnosis

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your API key

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
EXPO_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run the app

```bash
npm start
```

Then scan the QR code with Expo Go (iOS/Android) or press `a` for Android emulator / `i` for iOS simulator.

## Hardware Requirements

Any **ELM327 Bluetooth LE** (BLE) OBD2 adapter. Recommended:

- Veepeak OBDCheck BLE
- Carista OBD2 Adapter
- BAFX Products Bluetooth OBD2

> ⚠️ Note: Classic Bluetooth (non-BLE) adapters require a different setup. WiFi adapters are not currently supported.

## Project Structure

```
app/
  (tabs)/
    index.tsx       # Home dashboard
    scanner.tsx     # Bluetooth scanner & connection
    codes.tsx       # Fault codes list
    live.tsx        # Live sensor data
    ai.tsx          # AI chat interface
  ai-detail.tsx     # Deep-dive AI diagnosis for a specific code
lib/
  obd2/
    commands.ts     # ELM327 AT command definitions
    parser.ts       # OBD2 response parsing
    connection.ts   # BLE connection manager
  dtc/
    database.ts     # DTC code lookup database
  ai/
    claude.ts       # Anthropic Claude API client
  store/
    index.ts        # Zustand global state
  demo.ts           # Demo mode simulator
components/
  GaugeCard.tsx
  CodeCard.tsx
  ConnectionStatus.tsx
```

## Roadmap

- [ ] Repair cost estimator (RepairPal API integration)
- [ ] Mechanic finder (nearby shops)
- [ ] Trip logging & fuel economy tracking
- [ ] Pre-purchase inspection mode
- [ ] Emissions / smog test readiness check
- [ ] Push notifications for new codes
- [ ] Multi-vehicle garage
- [ ] WiFi OBD2 adapter support
- [ ] Offline AI mode (on-device model)

## License

MIT
