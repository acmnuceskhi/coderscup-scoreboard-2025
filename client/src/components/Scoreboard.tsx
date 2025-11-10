import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import TableSpinner from "./TableSpinner";
import { motion, AnimatePresence } from "framer-motion";

type Row = {
    teamId: string;
    rank: number;
    teamName: string;
    score: number;
    penalty: number;
    problems: Array<{ status: string; time: string; penalty: string }>;
};

type Payload = {
    batch: string;
    version: number;
    ts: number;
    startTime: string | null;
    endTime: string | null;
    rows: Row[];
};

const classNames = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

const getStatusClasses = (status: string) => {
    switch (status) {
        case "Accepted":
            return "bg-linear-to-b from-[#f59e0b]/25 to-transparent border border-[#facc15]/45 text-amber-100";
        case "Failed":
            return "bg-linear-to-b from-[#7f1d1d]/85 to-[#0b0404]/90 border border-[#f87171]/45 text-[#fecaca]";
        case "Pending":
        case "Not Attempted":
            return "bg-linear-to-b from-[#78350f]/45 to-[#170805]/85 border border-[#f97316]/35 text-amber-50/90";
        case "Attempted":
            return "bg-gradient-to-br from-[#1e293b]/65 via-[#0f172a]/75 to-[#020617]/85 border border-[#38bdf8]/35 text-sky-100";
        default:
            return "bg-gradient-to-br from-[#1f2937]/60 via-[#0f172a]/70 to-[#020617]/80 border border-white/15 text-slate-100";
    }
};

const getRankAura = (rank: number) => {
    if (rank === 1) {
        return {
            row: "from-[#ffd700]/25 via-[#b91c1c]/15 to-transparent border-[#facc15]/45",
            badge: "bg-gradient-to-br from-[#facc15] to-[#f97316] text-[#290202]",
        };
    }
    if (rank === 2) {
        return {
            row: "from-[#e5e7eb]/25 via-[#7f1d1d]/15 to-transparent border-[#f8fafc]/30",
            badge: "bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] text-[#1f2937]",
        };
    }
    if (rank === 3) {
        return {
            row: "from-[#fb923c]/25 via-[#7f1d1d]/20 to-transparent border-[#fb923c]/35",
            badge: "bg-gradient-to-br from-[#fb923c] to-[#f97316] text-[#2c0a0a]",
        };
    }
    return {
        row: "from-[#7f1d1d]/15 via-[#0b0b0b]/85 to-transparent border-white/10",
        badge: "bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-slate-100",
    };
};

type ScoreboardProps = {
    room: string;
    onDataUpdate?: (payload: Payload) => void;
    isSoundOpen: boolean;
};

const ScoreBoard = ({ room, onDataUpdate, isSoundOpen }: ScoreboardProps) => {
    const [rows, setRows] = useState<Row[] | ''>('');
    const [version, setVersion] = useState<number>(0);
    const [fields, setFields] = useState<string[]>(["Rank", "Team", "Score"]);


    const prevRowsRef = useRef<Map<string, Row>>(new Map());
    const blinkUntilRef = useRef<Map<string, number>>(new Map());

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio("audio/clock-chime.mp3");
        audioRef.current.preload = "auto";
    }, []);

    const playChime = useCallback(() => {
        if (!isSoundOpen || !audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
    }, [isSoundOpen]);

    useEffect(() => {
        // const backendUrl = "https://coderscup-scoreboard-backend.onrender.com";
        const backendUrl = "http://localhost:4000";
        const socket = io(backendUrl);
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
                    // blinkUntilRef.current.set(r.teamId, now + blinkForMs);
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
                if (payload && payload.rows && payload.rows.length > 0 && payload.rows[0].problems) {
                    const newFields = ["Rank", "Team", "Score", "Penalty"];
                    for (let i = 0; i < payload.rows[0].problems.length; i++) {
                        newFields.push(String.fromCharCode(65 + i));
                    }
                    setFields(newFields);
                }
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
    }, [room, onDataUpdate, playChime, version]);

    const now = Date.now();
    return (
        rows !== '' ?
            rows && rows.length > 0 ?
                <div className="w-full overflow-hidden border-2 border-[#7f1d1d] bg-linear-to-b from-[#150404]/95 to-[#050101]/95 shadow-[0_35px_55px_rgba(0,0,0,0.6)]">
                    <div className="max-h-[54vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-auto max-w-[90vw]">
                        <table className="min-w-max mx-auto max-w-[90vw] overflow-x-auto">
                            <thead className="sticky top-0 z-30">
                                <tr className="">
                                    {fields.map((element, index) => (
                                        <th
                                            key={index}
                                            className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xl tracking-widest text-center sm:px-3 px-1.5 py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]"
                                        >
                                            {element}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody aria-live="polite">
                                <AnimatePresence initial={false}>
                                    {rows.map((row: Row) => {
                                        if (row.teamId === "N/A") return null;
                                        const blink = (blinkUntilRef.current.get(row.teamId) ?? 0) > now;
                                        const aura = getRankAura(row.rank);
                                        return (
                                            <motion.tr
                                                key={row.teamId}
                                                layout
                                                initial={{ opacity: 0.5, y: 16 }}
                                                animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }}
                                                exit={{ opacity: 0, y: -16, transition: { duration: 1, ease: "easeIn" } }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 1500,
                                                    damping: 40,
                                                    mass: 1.4
                                                }}
                                                className={classNames(
                                                    "group overflow-hidden transition-all duration-300 backdrop-blur-sm",
                                                    `bg-linear-to-r ${aura.row}`,
                                                    blink && "animate-blink ring-2 ring-[#f59e0b]/45",
                                                    "ring-2 ring-[#f59e0b]/15"
                                                )}
                                            >
                                                <td className="w-12 sm:w-14 px-2 sm:px-3 py-1.5 font-bold font-hoshiko text-center">
                                                    {row.rank}
                                                </td>
                                                <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 text-amber-50 italic">
                                                    {row.teamName}
                                                </td>
                                                <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 text-amber-50 text-center font-semibold italic">
                                                    {row.score}
                                                </td>
                                                <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 text-amber-50 text-center font-semibold italic">
                                                    {row.penalty}
                                                </td>
                                                {row.problems.map((problem: Row["problems"][number], jdx: number) => (
                                                    <td
                                                        key={jdx}
                                                        className={classNames(
                                                            "min-w-22 whitespace-nowrap px-2 sm:px-2.5 py-3 text-[0.5rem] sm:text-[0.65rem] font-semibold uppercase tracking-widest text-center",
                                                            getStatusClasses(problem.status)
                                                        )}
                                                    >
                                                        <span className="block text-[0.45rem] sm:text-[0.58rem] text-white/75">
                                                            {problem.status}
                                                        </span>
                                                        <span className="block text-white/95 text-[0.7rem] sm:text-[0.85rem]">
                                                            {problem.status === "Accepted" ? problem.time : ""}
                                                        </span>
                                                        <span className="block text-white/70 text-[0.45rem] sm:text-[0.55rem]">
                                                            {problem.penalty || ""}
                                                        </span>
                                                    </td>
                                                ))}
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
                :
                <div className="min-w-full divide-y-2 divide-black/5 rounded-md backdrop-blur-md py-36 my-10 min-h-max overflow-x-auto overflow-y-auto [box-shadow:0_0_10px_rgba(0,0,0,1)] justify-center items-end content-center flex">
                    <h2 className="sm:text-3xl text-xl text-center px-3 font-hoshiko text-[#3c0d0d]">Waiting for the teams to score</h2>
                    {/* <div
                        className="text-[#3c0d0d] inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status">
                    </div> */}
                </div>


            :
            <TableSpinner />
    );
};

export default ScoreBoard;