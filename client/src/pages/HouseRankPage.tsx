import { useState, useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import TableSpinner from "../components/TableSpinner";
import { AnimatePresence, motion } from "framer-motion";

type BatchScores = Record<string, number>;
type HousesData = Record<string, BatchScores>;

const HouseRankPage = ({ page }: { page: string }) => {
    const BACKENDURL = "http://localhost:4000";
    // const BACKENDURL = "https://coderscup-scoreboard-backend.onrender.com";

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

    return (
        <div className="flex flex-col items-center w-full px-1 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6">
            <img
                src="/houseranks-title.png"
                alt="House Scores"
                className="h-10 sm:h-16 md:h-24 lg:h-28 mx-auto mb-2 sm:mb-4 md:mb-6"
            />

            <div className="w-full max-w-full mx-auto mt-2 sm:mt-4 md:mt-6 lg:mt-10 relative">
                {!data && <TableSpinner />}

                {data && !hasData && (
                    <div className="w-full divide-y-2 divide-black/5 rounded-md backdrop-blur-md py-16 sm:py-24 md:py-36 my-4 sm:my-6 md:my-10 min-h-max overflow-x-auto overflow-y-auto [box-shadow:0_0_10px_rgba(0,0,0,1)] justify-center items-end content-center flex">
                        <h2 className="text-base sm:text-xl md:text-2xl lg:text-3xl text-center px-2 sm:px-3 font-hoshiko text-[#3c0d0d]">
                            Waiting for the houses to score
                        </h2>
                    </div>
                )}

                {hasData && (
                    <div className="w-full overflow-hidden border-2 border-[#7f1d1d] bg-linear-to-b from-[#150404]/95 to-[#050101]/95 shadow-[0_35px_55px_rgba(0,0,0,0.6)]">
                        <div className="max-h-[70vh] sm:max-h-[50vh] md:max-h-[43vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden overflow-x-auto">
                            <table className="min-w-max mx-auto w-full overflow-x-auto">
                                <thead className="sticky top-0 z-30">
                                    <tr>
                                        <th className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl tracking-wider sm:tracking-widest text-center px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 lg:py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]">
                                            House
                                        </th>

                                        {batchKeys.map((batch) => (
                                            <th
                                                key={batch}
                                                className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl tracking-wider sm:tracking-widest text-center px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 lg:py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]"
                                            >
                                                {batch.toUpperCase()}
                                            </th>
                                        ))}

                                        <th className="sticky top-0 z-20 bg-linear-to-b font-hoshiko from-[#2c0a0a]/95 via-[#3c0d0d]/92 to-[#170404]/95 text-amber-200 border-b border-[#f59e0b]/40 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl tracking-wider sm:tracking-widest text-center px-1 sm:px-2 md:px-3 py-2 sm:py-2.5 md:py-3 lg:py-4 shadow-[inset_0_-1px_0_rgba(245,158,11,0.45)]">
                                            Total
                                        </th>
                                    </tr>
                                </thead>

                                <tbody aria-live="polite">
                                    <AnimatePresence initial={false}>
                                        {rows.map((row) => (
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
                                                className="group overflow-hidden transition-all duration-300 backdrop-blur-sm bg-linear-to-r from-[#1f2937]/60 via-[#0f172a]/70 to-[#020617]/80 ring-2 ring-[#f59e0b]/15"
                                            >
                                                <td className="whitespace-nowrap px-1.5 sm:px-2 md:px-2.5 lg:px-3.5 py-1 sm:py-1.5 md:py-2 text-amber-50 italic text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                                                    {row.house}
                                                </td>

                                                {batchKeys.map((batch) => (
                                                    <td
                                                        key={batch}
                                                        className="whitespace-nowrap px-1.5 sm:px-2 md:px-2.5 lg:px-3.5 py-1 sm:py-1.5 md:py-2 text-amber-50 text-center font-semibold italic text-[0.65rem] sm:text-xs md:text-sm lg:text-base xl:text-lg"
                                                    >
                                                        {row.batches[batch] ?? 0}
                                                    </td>
                                                ))}

                                                <td className="whitespace-nowrap px-1.5 sm:px-2 md:px-2.5 lg:px-3.5 py-1 sm:py-1.5 md:py-2 text-amber-50 text-center font-semibold italic text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                                                    {row.totalScore}
                                                </td>
                                            </motion.tr>
                                        ))}
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
