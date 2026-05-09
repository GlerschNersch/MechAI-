import { useAppStore } from './store';

/** Loads fake data so you can test the UI without an OBD2 adapter */
export function activateDemoMode() {
  const store = useAppStore.getState();

  store.setDemoMode(true);
  store.setConnectionStatus('connected');
  store.setConnectedDevice({ id: 'demo-device', name: 'Demo OBD2 Adapter' });

  store.addVehicle({ id: '1', make: 'Toyota', model: 'Camry', year: 2019 });
  store.setActiveVehicle('1');

  store.setActiveCodes([
    {
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      severity: 'medium',
      system: 'Emissions',
    },
    {
      code: 'P0300',
      description: 'Random/Multiple Cylinder Misfire Detected',
      severity: 'critical',
      system: 'Ignition',
    },
    {
      code: 'P0171',
      description: 'System Too Lean (Bank 1)',
      severity: 'medium',
      system: 'Fuel & Air',
    },
  ]);

  store.updateLiveData({
    rpm: 820,
    speed: 0,
    coolantTemp: 88,
    throttlePos: 12,
    fuelLevel: 62,
    batteryVoltage: 13.8,
    intakeTemp: 24,
    engineLoad: 18,
  });
}

/** Simulate live data fluctuations for demo mode */
export function startDemoLiveDataSimulation(): () => void {
  const store = useAppStore.getState();
  let rpm = 820;
  let speed = 0;

  const interval = setInterval(() => {
    rpm = Math.max(700, Math.min(4000, rpm + (Math.random() - 0.5) * 80));
    speed = Math.max(0, Math.min(120, speed + (Math.random() - 0.5) * 5));

    store.updateLiveData({
      rpm: Math.round(rpm),
      speed: Math.round(speed),
      coolantTemp: 85 + Math.round((Math.random() - 0.5) * 6),
      throttlePos: Math.round(10 + Math.random() * 20),
      engineLoad: Math.round(15 + Math.random() * 25),
      batteryVoltage: parseFloat((13.5 + Math.random() * 0.8).toFixed(1)),
    });
  }, 1000);

  return () => clearInterval(interval);
}
