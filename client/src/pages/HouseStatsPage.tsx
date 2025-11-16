import { useState, useEffect } from 'react';
import { io } from "socket.io-client";

const houses: { name: string, img: string }[] = [
    { name: "DragonWarrior", img: "/dragonwarrior-bg.png" },
    { name: "TaiLung", img: "/tailung-bg.png" },
    { name: "Oogway", img: "/oogway-bg.png" },
    { name: "Shen", img: "/shen-bg.png" },
];

const batches: string[] = ["22k", "23k", "24k", "25k"];
type HousesData = Record<string, Record<string, number | undefined>>;

const HouseStatsPage = () => {
    const [data, setData] = useState<HousesData>({});

    useEffect(() => {
        const socket = io("http://localhost:4000/");
        socket.emit("joinRoom", "Houses");
        socket.on("sendData", (housesData) => {
            setData(housesData);
            console.log(housesData);
        });
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col items-center">
            <img
                src="/housescores-title.png"
                alt="House Scores"
                className="h-16 sm:h-28 mx-auto"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4 relative mt-6">
                <div className='h-8 w-full bg-yellow-800 absolute z-10 -top-5 brightness-75 bg-cover'
                    style={{ backgroundImage: `url(/wooden-texture.png)` }}
                ></div>
                {houses.map((house: { name: string, img: string }) => (
                    <div
                        key={house.name}
                        className="relative bg-cover bg-center flex flex-col gap-8 items-center w-64 h-80 [clip-path:polygon(0%_0%,100%_0,100%_90%,50%_100%,0_90%)] p-4 overflow-hidden"
                        style={{ backgroundImage: `url(${house.img})` }}
                    >
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className='mt-4'>
                            <div className="relative z-10 text-white/80 text-center font-hoshiko text-sm tracking-widest">HOUSE</div>
                            <div className="relative z-10 text-white/80 text-center uppercase font-hoshiko text-xl tracking-widest font-semibold underline decoration-4 decoration-primaryYellow underline-offset-8">{house.name}</div>
                        </div>
                        <div className="relative z-10 w-full">
                            {batches.map((batch) => {
                                const score = data[house.name]?.[batch];
                                return (
                                    <div key={batch} className="flex justify-between text-white/80 font-medium font-hoshiko text-lg mb-1 w-3/4 mx-auto">
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