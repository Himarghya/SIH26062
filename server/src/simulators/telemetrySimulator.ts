import { db } from '../store.js';
import { WebSocketServer, WebSocket } from 'ws';

export class TelemetrySimulator {
  private wss: WebSocketServer | null = null;
  private timer: NodeJS.Timeout | null = null;

  init(wss: WebSocketServer) {
    this.wss = wss;
    this.startSimulation();
  }

  broadcast(type: string, data: any) {
    if (!this.wss) return;
    const payload = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  private startSimulation() {
    this.timer = setInterval(() => {
      this.tickTelemetry();
    }, 4000);
  }

  private tickTelemetry() {
    // 1. Simulate Antarctic & Arctic weather fluctuations
    const stations = db.getStations();
    stations.forEach(station => {
      const tempDelta = (Math.random() - 0.5) * 0.4;
      const windDelta = (Math.random() - 0.5) * 2;
      
      station.weather.temperatureC = Number((station.weather.temperatureC + tempDelta).toFixed(1));
      station.weather.windSpeedKmh = Math.max(5, Number((station.weather.windSpeedKmh + windDelta).toFixed(1)));
      
      // Calculate realistic Wind Chill Index: Twc = 13.12 + 0.6215*T - 11.37*(V^0.16) + 0.3965*T*(V^0.16)
      const T = station.weather.temperatureC;
      const V = station.weather.windSpeedKmh;
      const windChill = 13.12 + (0.6215 * T) - (11.37 * Math.pow(V, 0.16)) + (0.3965 * T * Math.pow(V, 0.16));
      station.weather.windChillC = Number(windChill.toFixed(1));
      station.weather.lastUpdated = new Date().toISOString();

      // Dynamic fuel consumption based on cold degree days
      // Colder temperatures increase heating fuel burn
      const baseBurn = station.id === 'stn-bharati' ? 480 : 390;
      const thermalFactor = Math.max(1.0, 1.0 + Math.abs(T) / 50.0);
      const todayEstimatedBurn = Math.round(baseBurn * thermalFactor);
      
      // Minor fuel burn depletion simulation
      station.resources.polarDieselLiters = Math.max(0, station.resources.polarDieselLiters - Math.round(todayEstimatedBurn / 100));
    });

    // 2. Simulate Vessel Movements (e.g. MV Vasiliy Golovnin heading South to Larsemann Hills)
    const vessels = db.getVessels();
    vessels.forEach(vessel => {
      if (vessel.status === 'Underway') {
        // Move slightly south towards Antarctica (negative latitude)
        const latSpeed = 0.008 * (vessel.speedKnots / 10);
        const lngSpeed = (Math.random() - 0.48) * 0.005;
        
        vessel.latitude = Number((vessel.latitude - latSpeed).toFixed(4));
        vessel.longitude = Number((vessel.longitude + lngSpeed).toFixed(4));
        vessel.lastTelemetry = new Date().toISOString();
      }
    });

    // 3. Cold chain telemetry fluctuations
    const cargo = db.getCargo();
    cargo.forEach(c => {
      if (c.isColdChain && c.temperatureSensor) {
        const tempNoise = (Math.random() - 0.5) * 0.15;
        c.temperatureSensor.currentC = Number((c.temperatureSensor.currentC + tempNoise).toFixed(1));
        c.temperatureSensor.batteryPct = Math.max(1, Number((c.temperatureSensor.batteryPct - 0.005).toFixed(1)));
        c.temperatureSensor.lastChecked = new Date().toISOString();
      }
    });

    // Broadcast full live telemetry state to all connected polar dashboard clients
    this.broadcast('TELEMETRY_UPDATE', {
      stations,
      vessels,
      cargo: cargo.filter(c => c.isColdChain),
      serverTime: new Date().toISOString()
    });
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

export const telemetrySimulator = new TelemetrySimulator();
