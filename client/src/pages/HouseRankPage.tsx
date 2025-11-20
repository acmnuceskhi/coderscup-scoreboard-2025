import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import TableSpinner from "../components/TableSpinner";
import { AnimatePresence, motion } from "framer-motion";
import { BACKENDURL } from "../../constants"

type BatchScores = Record<string, number>;
type HousesData = Record<string, BatchScores>;

const HouseRankPage = ({ page }: { page: string }) => {

    const [data, setData] = useState<HousesData | null>(null);

    useEffect(() => {
        const socket = io(BACKENDURL);

        socket.emit("joinRoom", "Houses");

        socket.on("sendData", (housesData: HousesData) => {
            setData(housesData);
            console.log("Houses data:", housesData);
        });

        return () => {
            socket.off("sendData");
            socket.disconnect();
        };
    }, [page]);

    const batchKeys = useMemo(() => {
        if (!data) return [] as string[];

        const set = new Set<string>();
        Object.values(data).forEach((houseBatches) => {
            Object.keys(houseBatches).forEach((batch) => set.add(batch));
        });

        return Array.from(set).sort((a, b) => {
            const na = parseInt(a);
            const nb = parseInt(b);
            if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b);
            return na - nb;
        });
    }, [data]);

    const rows = useMemo(() => {
        if (!data) return [] as { house: string; batches: BatchScores; totalScore: number }[];

        return Object.entries(data)
            .map(([house, batches]) => {
                const totalScore = Object.values(batches).reduce(
                    (sum, score) => sum + (score ?? 0),
                    0
                );
                return { house, batches, totalScore };
            })
            .sort((a, b) => b.totalScore - a.totalScore);
    }, [data]);

    const hasData = data && rows.length > 0;

    // Subtle per-house color accents
    const normalizeHouseKey = (h: string) =>
        h.replace(/^house\s+/i, "")
            .replace(/\s+/g, "")
            .toLowerCase();

    const HOUSE_ACCENTS: Record<string, { ring: string; bg: string; leftShadow: string; text: string }> = {
        // Oogway: green
        oogway: {
            ring: "ring-green-400/0",
            bg: "bg-green-900/70",
            leftShadow: "shadow-[inset_4px_0_0_rgba(16,185,129,0.55)]",
            text: "text-emerald-100 font-medium",
        },
        // Shen: red
        shen: {
            ring: "ring-red-400/0",
            bg: "bg-red-900/70",
            leftShadow: "shadow-[inset_4px_0_0_rgba(244,63,94,0.35)]",
            text: "text-red-100 font-medium",
        },
        // DragonWarrior: yellow
        dragonwarrior: {
            ring: "ring-amber-400/0",
            bg: "bg-amber-900/70",
            leftShadow: "shadow-[inset_4px_0_0_rgba(245,158,11,0.6)]",
            text: "text-amber-100 font-medium",
        },
        // TaiLung: dark blue
        tailung: {
            ring: "ring-indigo-400/0",
            bg: "bg-indigo-900/70",
            leftShadow: "shadow-[inset_4px_0_0_rgba(79,70,229,0.55)]",
            text: "text-indigo-100 font-medium",
        },
    };

    return (
        <div className="flex flex-col items-center">
            <img
                src="/houseranks-title.png"
                alt="House Scores"
                className="h-16 sm:h-34 mx-auto"
            />

            <div className="max-h-[60vh] mx-auto mt-6 relative">
                {!data && <TableSpinner />}

                {data && !hasData && (
                    <div className="min-w-full divide-y-2 divide-black/5 rounded-md backdrop-blur-md py-36 my-10 min-h-max overflow-x-auto overflow-y-auto [box-shadow:0_0_10px_rgba(0,0,0,1)] justify-center items-end content-center flex">
                        <h2 className="sm:text-3xl text-xl text-center px-3 font-hoshiko text-[#3c0d0d]">
                            Waiting for the houses to score
                        </h2>
                    </div>
                )}

                {hasData && (
                    <div className="w-full overflow-hidden border-2 border-[#7f1d1d] bg-linear-to-b from-[#150404]/40 to-[#050101]/40 shadow-[0_35px_55px_rgba(0,0,0,0.4)] relative">
                        {/* Black sheet backdrop to prevent row transparency */}
                        <div className="absolute inset-0 bg-amber-950 pointer-events-none"></div>
                        <div className="max-h-[43vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-auto max-w-[90vw] relative">
                            <table className="min-w-max mx-auto max-w-[90vw] overflow-x-auto">
                                <thead className="sticky top-0 z-30">
                                    <tr>
                                        <th className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xl tracking-widest text-center px-1.5 sm:px-3 py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]">
                                            Rank
                                        </th>
                                        <th className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xl tracking-widest text-center sm:px-3 px-1.5 py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]">
                                            House
                                        </th>

                                        {batchKeys.map((batch) => (
                                            <th
                                                key={batch}
                                                className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xl tracking-widest text-center sm:px-3 px-1.5 py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]"
                                            >
                                                {batch.toUpperCase()}
                                            </th>
                                        ))}

                                        <th className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xl tracking-widest text-center sm:px-3 px-1.5 py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]">
                                            Total Score
                                        </th>
                                    </tr>
                                </thead>

                                <tbody aria-live="polite">
                                    <AnimatePresence initial={false}>
                                        {rows.map((row, idx) => {
                                            const key = normalizeHouseKey(row.house);
                                            const accent = HOUSE_ACCENTS[key];
                                            const rowClass = `group overflow-hidden transition-all duration-300 backdrop-blur-sm ring-2 ${accent ? accent.ring : 'ring-[#f59e0b]/15'} ${accent ? accent.bg : ''}`;
                                            const houseTextClass = `whitespace-nowrap px-6 sm:px-10 py-3 italic text-center text-lg sm:text-xl ${accent ? accent.text : 'text-amber-50'}`;
                                            return (
                                                <motion.tr
                                                    key={row.house}
                                                    layout
                                                    initial={{ opacity: 0.5, y: 16 }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                        transition: { duration: 1, ease: "easeOut" },
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                        y: -16,
                                                        transition: { duration: 1, ease: "easeIn" },
                                                    }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 1500,
                                                        damping: 40,
                                                        mass: 1.4,
                                                    }}
                                                    className={rowClass}
                                                >
                                                    <td className="whitespace-nowrap px-3 sm:px-4 py-3 text-center font-semibold font-hoshiko text-amber-200 tabular-nums">
                                                        {idx + 1}
                                                    </td>
                                                    <td className={houseTextClass}>
                                                        {row.house}
                                                    </td>

                                                    {batchKeys.map((batch) => (
                                                        <td
                                                            key={batch}
                                                            className="whitespace-nowrap px-2.5 sm:px-3.5 py-3 text-amber-50 text-center font-semibold italic text-base sm:text-lg"
                                                        >
                                                            {row.batches[batch] ?? 0}
                                                        </td>
                                                    ))}

                                                    <td className="whitespace-nowrap px-2.5 sm:px-3.5 py-3 text-amber-50 text-center font-semibold italic text-lg sm:text-xl">
                                                        {row.totalScore}
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HouseRankPage;
