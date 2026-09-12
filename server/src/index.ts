import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { apiRouter } from './routes/api.js';
import { telemetrySimulator } from './simulators/telemetrySimulator.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'POLARIS Logistics Server',
    organization: 'NCPOR / MoES',
    uptimeSec: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

const server = http.createServer(app);

// WebSocket Server for live polar telemetry & SOS broadcast
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  // Send welcome packet
  ws.send(JSON.stringify({
    type: 'CONNECTION_ESTABLISHED',
    message: 'Connected to NCPOR Polar Logistics Telemetry Gateway',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      console.error('WS Error parsing message:', e);
    }
  });
});

// Start IoT & Weather Simulation
telemetrySimulator.init(wss);

server.listen(port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 POLARIS Backend Server listening on http://localhost:${port}`);
  console.log(`📡 WebSocket Gateway active on ws://localhost:${port}/ws`);
  console.log(`🧊 Stations: Bharati, Maitri, Himadri, IndARC`);
  console.log(`🚢 Vessels: MV Vasiliy Golovnin, ORV Sagar Kanya`);
  console.log(`=======================================================`);
});
