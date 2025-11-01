import BackgroundImage from '../assets/background.jpg';
import React, { useEffect, useState } from "react";
import TopBar from '../components/TopBar';
import { io } from "socket.io-client";
import CardSpinner from '../components/CardSpinner';
import logo1 from "../assets/arsenal-logo.png"
import logo2 from "../assets/barca-logo.png"
import logo3 from "../assets/real-logo.png"
import logo4 from "../assets/united-logo.png"

const houses = [
    "Gunners",
    "Culers",
    "Galacticos",
    "Red Devils",
];

const batches = ["22k", "23k", "24k", "25k"];

function HouseBatchScore({ house, batch, data }) {

    const getHouseColor = (house) => {
        switch (house) {
            case 'Galacticos': return 'text-white/80 font-bold';
            case 'Red Devils': return 'text-red-500/90 font-bold';
            case 'Gunners': return 'text-[#e1bd70] font-bold';
            case 'Culers': return 'text-[#e1bd70]/90 font-bold';
            default: return 'text-[#f7b72e]';
        }
    };

    return (
        <div className="flex justify-between items-center py-3 px-5 bg-white/5 backdrop-blur-md rounded-xl 
                        transition-all duration-300 hover:bg-white/15 hover:scale-[1.03] cursor-pointer
                        border border-white/10 hover:border-[#f7b72e]/30 hover:shadow-lg hover:shadow-[#f7b72e]/10
                        group">
            <span className={`${getHouseColor(house)} text-sm font-semibold group-hover:scale-105 transition-transform duration-300`}>
                Batch {batch.substring(0, 2)}
            </span>
            {
                data && Object.keys(data).length > 0 ?
                    <span className="text-xl font-bold">
                        <p className={`${getHouseColor(house)} drop-shadow-lg`}>{data[house][batch] || 0}</p>
                    </span>
                    :
                    <CardSpinner house={house} />
            }
        </div>
    );
}

function HouseCard({ house, data }) {
    const calculateHouseTotal = () => {
        let total = 0;
        batches.forEach((batch) => { total += data[house][batch] })
        return total;
    };

    const getHouseColor = (house) => {
        switch (house) {
            case 'Galacticos': return 'text-[#ffffff]/80 from-[#087fd8]/10 to-transparent';
            case 'Red Devils': return 'text-[#d81408] from-[#000000]/30 to-transparent';
            case 'Gunners': return 'text-[#e1bd70] from-[#df1408]/30 to-[#450603]/10';
            case 'Culers': return 'text-[#e1bd70] from-[#f7b72e]/10 to-transparent';
            default: return 'text-[#f7b72e]';
        }
    };

    const getLogo = (house) => {
        switch (house) {
            case 'Galacticos': return logo3;
            case 'Red Devils': return logo4;
            case 'Gunners': return logo1;
            case 'Culers': return logo2;
            default: ;
        }
    };


    return (
        <div className={`text-xl bg-black/40 w-full backdrop-blur-2xl rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl [box-shadow:0_8px_32px_rgba(0,0,0,0.5)] bg-gradient-to-b ${getHouseColor(house)} border border-white/10 hover:border-[#f7b72e]/30 group`}>
            <div className="p-5 border-b border-white/10 bg-gradient-to-r from-black/20 to-transparent">
                <div className="flex justify-between items-center">
                    <div className='flex align-baseline items-center space-x-3'>
                        <div className="relative group/logo">
                            <img src={getLogo(house)} alt={house} className="h-12 w-12 object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <h2 className={"font-bold tracking-wider text-lg sm:text-xl"}>
                            {house}
                        </h2>
                    </div>
                    {
                        data && Object.keys(data).length ? 
                        <div className="flex items-center space-x-2">
                            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#f7b72e] to-[#d4a01a] text-transparent bg-clip-text drop-shadow-lg">
                                {calculateHouseTotal()}
                            </p>
                            <div className="w-2 h-2 rounded-full bg-[#f7b72e] animate-pulse"></div>
                        </div> 
                        : <CardSpinner house={house} />
                    }
                </div>
            </div>
            <div className="p-5 space-y-3 text-base">
                {batches.map(batch => (
                    <HouseBatchScore
                        key={`${house}-${batch}`}
                        house={house}
                        batch={batch}
                        data={data}
                    />
                ))}
            </div>
        </div>
    );
}

export default function HouseStatsPage(props) {
    const [data, setData] = useState({});

    useEffect(() => {
        const socket = io("http://localhost:4000/");
        socket.emit("joinRoom", "Houses");
        socket.on("sendData", (housesData) => {
            setData(housesData);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <>
            <div className="w-full bg-cover min-h-screen grid
                             place-items-center content-start 
                             justify-center overflow-x-hidden 
                             font-bold pb-20 "
                style={{ 
                    "backgroundImage": `url(${BackgroundImage})`,
                    "backgroundAttachment": "fixed",
                    "backgroundPosition": "bottom center",
                    "backgroundRepeat": "no-repeat",
                    "backgroundSize": "cover"
                }}>

                <TopBar />

                <div className='mt-8 mb-6' />

                <div className="grid sm:grid-cols-4 msm:grid-cols-2 vsm:grid-cols-1 gap-6 sm:gap-8
                               w-[95%] sm:w-5/6 max-w-7xl px-4 mx-auto content-center
                               transition-all duration-300 vsm:h-half">
                    {
                        houses.map(house => (
                            <HouseCard key={house} house={house} data={data} />
                        ))
                    }
                </div>

            </div >
        </>
    );
} 