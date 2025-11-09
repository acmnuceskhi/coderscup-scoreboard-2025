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

type Payload = { batch: string; version: number; ts: number; rows: Row[] };

const classNames = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

const getStatusClasses = (status: string) => {
    switch (status) {
        case "Accepted":
            return "bg-gradient-to-br from-[#f59e0b]/25 via-[#dc2626]/25 to-transparent border border-[#facc15]/45 text-amber-100 shadow-[0_0_18px_rgba(220,38,38,0.35)]";
        case "Failed":
            return "bg-gradient-to-br from-[#7f1d1d]/85 via-[#3f0d0d]/85 to-[#0b0404]/90 border border-[#f87171]/45 text-[#fecaca] shadow-[0_0_15px_rgba(248,113,113,0.3)]";
        case "Pending":
        case "Not Attempted":
            return "bg-gradient-to-br from-[#78350f]/45 via-[#3f1d0b]/70 to-[#170805]/85 border border-[#f97316]/35 text-amber-50/90";
        case "Attempted":
            return "bg-gradient-to-br from-[#1e293b]/65 via-[#0f172a]/75 to-[#020617]/85 border border-[#38bdf8]/35 text-sky-100";
        default:
            return "bg-gradient-to-br from-[#1f2937]/60 via-[#0f172a]/70 to-[#020617]/80 border border-white/15 text-slate-100";
    }
};

const getRankAura = (rank: number) => {
    if (rank === 1) {
        return {
            row: "from-[#ffd700]/25 via-[#b91c1c]/15 to-transparent border-[#facc15]/45 shadow-[0_0_30px_rgba(250,204,21,0.35)]",
            badge: "bg-gradient-to-br from-[#facc15] to-[#f97316] text-[#290202] shadow-[0_6px_20px_rgba(250,204,21,0.45)]",
        };
    }
    if (rank === 2) {
        return {
            row: "from-[#e5e7eb]/25 via-[#7f1d1d]/15 to-transparent border-[#f8fafc]/30 shadow-[0_0_30px_rgba(226,232,240,0.3)]",
            badge: "bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] text-[#1f2937] shadow-[0_6px_20px_rgba(148,163,184,0.4)]",
        };
    }
    if (rank === 3) {
        return {
            row: "from-[#fb923c]/25 via-[#7f1d1d]/20 to-transparent border-[#fb923c]/35 shadow-[0_0_30px_rgba(249,115,22,0.35)]",
            badge: "bg-gradient-to-br from-[#fb923c] to-[#f97316] text-[#2c0a0a] shadow-[0_6px_20px_rgba(249,115,22,0.45)]",
        };
    }
    return {
        row: "from-[#7f1d1d]/15 via-[#0b0b0b]/85 to-transparent border-white/10",
        badge: "bg-gradient-to-br from-[#1f2937] to-[#0f172a] text-slate-100 shadow-[0_6px_18px_rgba(15,23,42,0.35)]",
    };
};

type ScoreboardProps = {
    room: string;
    onDataUpdate?: (payload: Payload) => void;
};

const ScoreBoard = ({ room, onDataUpdate }: ScoreboardProps) => {
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

    const playChime = useCallback(() => {
        if (!soundEnabled || !audioRef.current) return;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
    }, [soundEnabled]);

    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
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
                    const newFields = ["Rank", "Team Name", "Score", "Penalty"];
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
                <div className="w-full max-h-[82vh] overflow-hidden rounded-3xl border-4 border-[#7f1d1d] bg-gradient-to-br from-[#150404]/95 via-[#240606]/92 to-[#050101]/95 shadow-[0_35px_55px_rgba(0,0,0,0.75)]">
                    <div className="relative max-h-[75vh] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="min-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <table className="min-w-max border-separate border-spacing-y-2 text-left">
                            <thead>
                                <tr>
                                    {fields.map((element, index) => (
                                        <th
                                            key={index}
                                            className="sticky top-0 z-20 bg-gradient-to-b from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-[0.5rem] sm:text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-center sm:px-3 px-1.5 py-2.5 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]"
                                        >
                                            {index >= 4 ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>{element}</span>
                                                    <span className="text-[0.48rem] sm:text-[0.55rem] tracking-[0.2em] text-amber-100/70">
                                                        Time • Penalty
                                                    </span>
                                                </div>
                                            ) : (
                                                element
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                                <tbody aria-live="polite">
                                    <AnimatePresence initial={false}>
                                        {rows.map((row: Row) => {
                                        const blink = (blinkUntilRef.current.get(row.teamId) ?? 0) > now;
                                        const aura = getRankAura(row.rank);

                                        return (
                                            <motion.tr
                                                key={row.teamId}
                                                layout
                                                initial={{ opacity: 0.6, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -12 }}
                                                transition={{ type: "spring", stiffness: 120, damping: 32, mass: 0.8 }}
                                                className={classNames(
                                                    "group overflow-hidden rounded-3xl border border-white/10 transition-all duration-300 backdrop-blur-[2px]",
                                                    `bg-gradient-to-r ${aura.row}`,
                                                    blink && "animate-blink ring-2 ring-[#f59e0b]/45",
                                                    "hover:-translate-y-1 hover:shadow-[0_22px_38px_rgba(185,28,28,0.35)]"
                                                )}
                                            >
                                                <td className="w-12 sm:w-14 px-2 sm:px-3 py-1.5 align-middle">
                                                    <span
                                                        className={classNames(
                                                            "inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[0.65rem] sm:text-[0.75rem] font-extrabold tracking-[0.2em] border border-white/30 transition-transform duration-300",
                                                            "group-hover:scale-110",
                                                            aura.badge
                                                        )}
                                                    >
                                                        {row.rank}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 text-[0.6rem] sm:text-[0.75rem] font-semibold tracking-wide text-amber-50 drop-shadow-lg">
                                                    {row.teamName}
                                                </td>
                                                <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 text-[0.6rem] sm:text-[0.7rem] font-bold text-[#fbbf24] text-right">
                                                    {row.score}
                                                </td>
                                                <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-1.5 text-[0.55rem] sm:text-[0.65rem] font-semibold text-[#fca5a5] text-right">
                                                    {row.penalty}
                                                </td>
                                                {row.problems.map((problem: Row["problems"][number], jdx: number) => (
                                                    <td
                                                        key={jdx}
                                                        className={classNames(
                                                            "min-w-[5.5rem] whitespace-nowrap px-2 sm:px-2.5 py-1.5 text-[0.5rem] sm:text-[0.65rem] font-semibold uppercase tracking-wide text-center rounded-lg border",
                                                            "transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_10px_22px_rgba(220,38,38,0.35)]",
                                                            getStatusClasses(problem.status)
                                                        )}
                                                    >
                                                        <span className="block text-[0.45rem] sm:text-[0.58rem] tracking-[0.3em] text-white/75">
                                                            {problem.status}
                                                        </span>
                                                        <span className="block text-white/95 text-[0.7rem] sm:text-[0.85rem]">
                                                            {problem.time || "—"}
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