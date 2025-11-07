import express from 'express';
import Authenticate from '../middleware/auth.js';
import updateBuffer from '../bufferController/bufferFunctions.js';

export default function rankingRoutes(io) {
    const router = express.Router();

    let score = {
        'Gunners': { '22k': 0, '23k': 0, '24k': 0, '25k': 0 },
        'Culers': { '22k': 0, '23k': 0, '24k': 0, '25k': 0 },
        'Red Devils': { '22k': 0, '23k': 0, '24k': 0, '25k': 0 },
        'Galacticos': { '22k': 0, '23k': 0, '24k': 0, '25k': 0 }
    };
    const buffer = {
        'Houses': score,
        '22k': [],
        '23k': [],
        '24k': [],
        '25k': [],
    };

    let versions = new Map(); // batch -> version
    let lastSnapshot = new Map(); // batch -> rows

    io.on("connection", (socket) => {
        console.log("A user connected");

        socket.on("joinRoom", (room) => {
            if (["22k", "23k", "24k", "25k", "Houses"].includes(room)) {
                socket.join(room);
                console.log(`User joined ${room}`);
                if (buffer[room]) {
                    socket.emit("sendData", buffer[room]);
                }
            } else {
                console.log("Invalid room");
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });

    router.post('/postRanking', Authenticate, async (req, res) => {
        const { data, batch } = req.body;

        if (!data) {
            console.log("No data found");
            return res.status(500).json({ error: "No data found" });
        }
        if (!batch || !["22k", "23k", "24k", "25k"].includes(batch)) {
            console.log("Invalid batch");
            return res.status(500).json({ error: "Invalid batch" });
        }

        // get version and increment it
        const version = (versions.get(batch) ?? 0) + 1;
        versions.set(batch, version);

        // Normalize to socket payload
        const rows = data.map(row => ({
            teamId: row.teamName,
            rank: Number(row.rank),
            teamName: row.teamName,
            score: Number(row.score),
            problems: row.problems
        }));

        lastSnapshot.set(batch, rows);

        const updatedData = updateBuffer(rows, batch, buffer['Houses']);

        const payload = {
            batch,
            version,
            ts: Date.now(),
            rows: updatedData.data
        };

        buffer[batch] = payload;
        buffer['Houses'] = updatedData.score;
        console.log(`Buffer updated for batch ${batch}...`);

        // console.log("data: ", data);
        // console.log("rows: ", rows)
        io.to(batch).emit("sendData", payload);
        // io.to(batch).emit("ranking:update", {
        //     batch,
        //     version,
        //     ts: Date.now(),
        //     rows
        // });
        // io.to('Houses').emit("sendData", buffer['Houses']);

        return res.status(200).json({ message: "Buffer updated" });
    });

    router.get('/getRanking', (req, res) => {
        if (buffer) {
            return res.status(200).json(buffer);
        }
        return res.status(404).json({ error: "No buffer data found" });
    });

    return router;
};