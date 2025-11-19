import { useState, useEffect } from 'react';
import { io } from "socket.io-client";
import ScoreBoard from '../components/Scoreboard';

type HousesData = Record<string, Record<string, number | undefined>>;

const HouseRankPage = () => {

    const BACKENDURL = "http://localhost:4000/";

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
    }, []);

    return (
        <div className="flex flex-col items-center">
            <img
                src="/houseranks-title.png"
                alt="House Scores"
                className="h-16 sm:h-28 mx-auto"
            />
            <div className='max-h-[60vh] mx-auto mt-6 relative'>
                <ScoreBoard room="Houses" isSoundOpen={true} />
            </div>
        </div>
    );
};

export default HouseRankPage;