import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIO } from "socket.io";
import rankingRoutes from './routes/ranking.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  // origin: ['https://coders-cup-scoreboard-frontend.vercel.app', 'https://leaderboard.acmnuceskhi.com'],
  origin: ['http://localhost:5173/'],
  // origin: ['http://localhost:5174/'],
  credentials: true
}));

const io = new SocketIO(server, {
  cors: {
    // origin: ['https://coders-cup-scoreboard-frontend.vercel.app', 'https://leaderboard.acmnuceskhi.com'],
    origin: ['http://localhost:5173'],
    // origin: ['http://localhost:5143'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ msg: "Coders cup scoreboard" });
});

app.use('/api', rankingRoutes(io));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log('Connected and listening to requests on', PORT);
});