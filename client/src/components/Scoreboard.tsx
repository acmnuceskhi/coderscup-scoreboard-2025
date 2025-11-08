import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import TableSpinner from "./TableSpinner";
import { motion, AnimatePresence } from "framer-motion";

type Row = {
    teamId: string;
    rank: number;
    teamName: string;
    score: number;
    problems: Array<{ status: string; time: string; penalty: string }>;
};

type Payload = { batch: string; version: number; ts: number; rows: Row[] };


const getStatusStyle = (status: string) => {
    switch (status) {
        case 'Accepted':
            return { backgroundColor: 'rgba(0, 128, 0, 0.3)' };
        case 'Failed':
            return { backgroundColor: 'rgba(255, 0, 0, 0.3)' };
        default:
            return {};
    }
}

const ScoreBoard = ({ room, onDataUpdate }: any) => {
    const [rows, setRows] = useState<Row[] | ''>([]);
    const [version, setVersion] = useState<number>(0);
    const [fields, setFields] = useState<string[]>(["Rank", "Team Name", "Score"]);


    const prevRowsRef = useRef<Map<string, Row>>(new Map());
    const blinkUntilRef = useRef<Map<string, number>>(new Map());

    const [soundEnabled, setSoundEnabled] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("audio/clock-chime.mp3");
        audioRef.current.preload = "auto";
    }, []);

    useEffect(() => {
        const unlock = () => {
            setSoundEnabled(true);
            console.log("sound unlocked")
        };
        window.addEventListener("pointerdown", unlock, { once: true });
        return () => window.removeEventListener("pointerdown", unlock);
    }, []);

    const playChime = () => {
        console.log("in playchime")
        if (!soundEnabled || !audioRef.current) return;
        console.log("after")
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
    };

    useEffect(() => {
        const socket = io("http://localhost:4000");
        socket.emit("joinRoom", room);
        const onUpdate = (payload: Payload) => {
            if (payload.batch !== room) return;
            if (payload.version <= version) return; // ignore older versions

            const prevMap = prevRowsRef.current;
            const nextMap = new Map(payload.rows.map(r => [r.teamId, r]));

            const now = Date.now();
            const blinkForMs = 4000;

            let anyChime = false;
            payload.rows.forEach(r => {
                const prev = prevMap.get(r.teamId);
                if (!prev) {
                    blinkUntilRef.current.set(r.teamId, now + blinkForMs);
                    return;
                }
                if (prev.rank !== r.rank) {
                    blinkUntilRef.current.set(r.teamId, now + blinkForMs);
                    if (prev.rank > r.rank && r.rank <= 3) anyChime = true; // improved rank
                }
                if (prev.score < r.score) {
                    blinkUntilRef.current.set(r.teamId, now + blinkForMs);
                }
            });

            if (anyChime && audioRef.current) {
                playChime();
            }

            prevRowsRef.current = nextMap;
            setVersion(payload.version);
            setRows(payload.rows.slice().sort((a, b) => a.rank - b.rank));
        }

        socket.on("sendData", (payload: Payload) => {
            try {
                console.log(payload)
                if (payload && payload.rows && payload.rows.length > 0 && payload.rows[0].problems) {
                    const newFields = ["Rank", "Team Name", "Score"];
                    for (let i = 0; i < payload.rows[0].problems.length; i++) {
                        newFields.push(String.fromCharCode(65 + i));
                    }
                    setFields(newFields);
                }
                console.log("Fields:", fields);
                onUpdate(payload);
                // setData(payload);
                if (onDataUpdate) {
                    onDataUpdate(payload);
                }
            } catch (error) {
                console.error("Error parsing data:", error);
            }
        });

        return () => {
            socket.off("sendData");
            socket.disconnect();
        };
    }, [room, onDataUpdate, version]);

    const now = Date.now();
    return (
        rows !== '' ?
            rows && rows.length > 0 ?
                <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-md [box-shadow:0_0_10px_rgba(0,0,0,1)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-700/50 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-track]:bg-gray-700/10">
                    <table className="min-w-full table-fixed border-collapse">
                        <thead>
                            <tr>
                                {fields.map((element, index) => (
                                    <th
                                        key={index}
                                        className="sticky top-0 z-20 bg-black/90 text-[rgba(171,126,12,1)] sm:text-xl vsm:text-base text-sm font-bold whitespace-nowrap sm:px-4 px-2 py-2 h-12"
                                    >
                                        {element}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y-2 divide-black/20 bg-gray-700/10" aria-live="polite">
                            <AnimatePresence initial={false}>
                                {rows.map((row: Row) => {
                                    const blink = (blinkUntilRef.current.get(row.teamId) ?? 0) > now;

                                    return (
                                        <motion.tr
                                            key={row.teamId}
                                            layout
                                            initial={{ opacity: 0.6, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ type: "spring", stiffness: 100, damping: 40, mass: 0.6 }}
                                            className={`rounded-2xl p-3 shadow ${blink ? "animate-blink" : ""} bg-zinc-900/40 border border-zinc-800`}
                                        >
                                            <td className="whitespace-nowrap vsm:text-base text-xs px-4 py-2 h-12 font-normal bg-black/25 text-gray-200 text-center">
                                                {row.rank}
                                            </td>
                                            <td className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-2 font-normal text-gray-200 text-center">
                                                {row.teamName}
                                            </td>
                                            <td className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-2 font-normal bg-black/15 text-gray-200 text-center">
                                                {row.score}
                                            </td>
                                            {row.problems.map((problem: any, jdx: number) => (
                                                <td
                                                    key={jdx}
                                                    style={getStatusStyle(problem.status)}
                                                    className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-2 font-normal text-gray-200 text-center"
                                                >
                                                    <div className="flex flex-col justify-center items-center h-12">
                                                        <div>{problem.time}</div>
                                                        <div>{problem.penalty}</div>
                                                    </div>
                                                </td>
                                            ))}
                                        </motion.tr>
                                    )
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                :
                <div className="min-w-full divide-y-2 divide-black/5 rounded-md backdrop-blur-md py-36 my-10 min-h-max w-5/6 overflow-x-auto overflow-y-auto [box-shadow:0_0_10px_rgba(0,0,0,1)] justify-center items-end content-center flex">
                    <h2 className="text-[rgba(171,126,12,1)] sm:text-3xl text-xl text-center px-3">No Record Available</h2>
                </div>
            :
            <div className="h-full w-full divide-y-2 divide-black/5 rounded-md backdrop-blur-md my-10 min-h-max overflow-x-auto overflow-y-auto [box-shadow:0_0_10px_rgba(0,0,0,1)] justify-center items-center content-center flex ">
                <TableSpinner />
            </div>
    );
};

export default ScoreBoard;