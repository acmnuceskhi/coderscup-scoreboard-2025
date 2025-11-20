import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import { BACKENDURL } from '../../constants';

const houses: { name: string, img: string }[] = [
    { name: "DragonWarrior", img: "/dragonwarrior-bg.png" },
    { name: "TaiLung", img: "/tailung-bg.png" },
    { name: "Shen", img: "/shen-bg.png" },
    { name: "Oogway", img: "/oogway-bg.png" },
];

const batches: string[] = ["22k", "23k", "24k", "25k"];
type HousesData = Record<string, Record<string, number | undefined>>;

const HouseStatsPage = ({ page }: { page: string }) => {

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
        <div className="flex flex-col items-center">
            <img
                src="/housescores-title.png"
                alt="House Scores"
                className="h-16 sm:h-34 mx-auto"
            />
            <div className="w-full max-w-6xl px-4 relative mt-2">
                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 
               w-full justify-center 
               h-screen md:h-auto 
               overflow-y-auto pb-60 
               [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                    {houses.map((house: { name: string; img: string }) => (
                        <div className="relative flex justify-center" key={house.name}>

                            {/* WOODEN HEADER – wider than card */}
                            <div
                                className="
        absolute top-0
        w-[90%] sm:w-[110%] md:w-[120%]
        h-4
        bg-yellow-800 bg-cover
        rounded-lg
        shadow-xl
        z-10
      "
                                style={{ backgroundImage: `url(/wooden-texture.png)` }}
                            >
                                <div className="absolute inset-0 bg-yellow-900/70 rounded-lg"></div>
                            </div>

                            {/* HOUSE CARD */}
                            <div
                                className="
        relative bg-cover bg-center flex flex-col gap-6 items-center mx-auto 
        w-64 h-80 
        [clip-path:polygon(0%_0%,100%_0,100%_80%,50%_100%,0_80%)] 
        pt-8 pb-4 px-4
        overflow-hidden border-x-8 border-yellow-800
        shadow-xl
      "
                                style={{ backgroundImage: `url(${house.img})` }}
                            >
                                <div className="absolute inset-0 bg-black/20"></div>

                                <div className="relative z-20 mt-2 text-center">
                                    <div className="text-white/80 font-hoshiko text-sm tracking-widest">
                                        HOUSE
                                    </div>
                                    <div
                                        className="text-white/80 uppercase font-hoshiko 
                     text-xl tracking-widest font-semibold underline 
                     decoration-4 decoration-primaryYellow underline-offset-8"
                                    >
                                        {house.name}
                                    </div>
                                </div>

                                <div className="relative z-20 w-full">
                                    {batches.map((batch) => {
                                        const score = data[house.name]?.[batch];
                                        return (
                                            <div
                                                key={batch}
                                                className="flex justify-between text-white/80 font-medium font-hoshiko 
                         text-lg mb-1 w-3/4 mx-auto"
                                            >
                                                <span>{batch.toUpperCase()}</span>
                                                <span>{score !== undefined ? score : "N/A"}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HouseStatsPage;