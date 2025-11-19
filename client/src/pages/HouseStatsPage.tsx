import { useState, useEffect } from 'react';
import { io } from "socket.io-client";

const houses: { name: string, img: string }[] = [
    { name: "DragonWarrior", img: "/dragonwarrior-bg.png" },
    { name: "TaiLung", img: "/tailung-bg.png" },
    { name: "Shen", img: "/shen-bg.png" },
    { name: "Oogway", img: "/oogway-bg.png" },
];

const batches: string[] = ["22k", "23k", "24k", "25k"];
type HousesData = Record<string, Record<string, number | undefined>>;

const HouseStatsPage = ({ page }: { page: string }) => {

    const BACKENDURL = "http://localhost:4000/";
    // const BACKENDURL = "https://coderscup-scoreboard-backend.onrender.com";

    const [data, setData] = useState<HousesData>({});

    useEffect(() => {
        const socket = io(BACKENDURL);
        socket.emit("joinRoom", "Houses");
        socket.on("sendData", (housesData) => {
            setData(housesData);
            console.log(housesData);
        });
        return () => {
            socket.disconnect();
        };
    }, [page]);

    return (
        <div className="flex flex-col items-center w-full px-1 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6 min-h-full">
            <img
                src="/housescores-title.png"
                alt="House Scores"
                className="h-10 sm:h-16 md:h-24 lg:h-28 mx-auto mb-2 sm:mb-4 md:mb-6 flex-shrink-0"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full max-w-6xl px-2 sm:px-4 relative mt-2 sm:mt-4 md:mt-6 pb-8 sm:pb-10 md:pb-12">
                <div className='h-1 sm:h-1.5 md:h-2 w-full bg-yellow-800 absolute z-10 -top-1 sm:-top-1.5 md:-top-2 bg-cover'
                    style={{ backgroundImage: `url(/wooden-texture.png)` }}
                >
                    <div className="absolute inset-0 bg-yellow-900/70"></div>
                </div>
                {houses.map((house: { name: string, img: string }) => (
                    <div
                        key={house.name}
                        className="relative bg-cover bg-center flex flex-col gap-4 sm:gap-6 md:gap-8 items-center w-full sm:w-56 md:w-64 h-64 sm:h-72 md:h-80 [clip-path:polygon(0%_0%,100%_0,100%_80%,50%_100%,0_80%)] p-3 sm:p-4 overflow-hidden border-x-4 sm:border-x-6 md:border-x-8 border-yellow-800"
                        style={{ backgroundImage: `url(${house.img})` }}
                    >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className='mt-2 sm:mt-3 md:mt-4'>
                            <div className="relative z-10 text-white/80 text-center font-hoshiko text-xs sm:text-sm tracking-wider sm:tracking-widest">HOUSE</div>
                            <div className="relative z-10 text-white/80 text-center uppercase font-hoshiko text-sm sm:text-base md:text-lg lg:text-xl tracking-wider sm:tracking-widest font-semibold underline decoration-2 sm:decoration-3 md:decoration-4 decoration-primaryYellow underline-offset-4 sm:underline-offset-6 md:underline-offset-8">{house.name}</div>
                        </div>
                        <div className="relative z-10 w-full">
                            {batches.map((batch) => {
                                const score = data[house.name]?.[batch];
                                return (
                                    <div key={batch} className="flex justify-between text-white/80 font-medium font-hoshiko text-xs sm:text-sm md:text-base lg:text-lg mb-0.5 sm:mb-1 w-3/4 mx-auto">
                                        <span>{batch.toUpperCase()}</span>
                                        <span>{score !== undefined ? score : "N/A"}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};

export default HouseStatsPage;