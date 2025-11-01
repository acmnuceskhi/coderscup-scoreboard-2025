import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import TableSpinner from "./TableSpinner";


const ScoreTable = ({ room, onDataUpdate }) => {
    const [data, setData] = useState('empty');
    const [fields, setFields] = useState(["Team Name", "Score"]);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Accepted':
                return { backgroundColor: 'rgba(0, 128, 0, 0.3)' };
            case 'Failed':
                return { backgroundColor: 'rgba(255, 0, 0, 0.3)' };
            default:
                return {};
        }
    }


    useEffect(() => {
        const socket = io("http://localhost:4000/");
        socket.emit("joinRoom", room);
        socket.on("sendData", (rankingData) => {
            try {
                setData(rankingData);
                if (onDataUpdate) {
                    onDataUpdate(rankingData);
                }
                if (rankingData && rankingData.length > 0 && rankingData[0].problems) {
                    const newFields = ["", "Team Name", "Score"];
                    for (let i = 0; i < rankingData[0].problems.length; i++) {
                        newFields.push(String.fromCharCode(65 + i));
                    }
                    setFields(newFields);
                }
            } catch (error) {
                console.error("Error parsing data:", error);
            }
        });


        return () => {
            socket.off("sendData");
            socket.disconnect();
        };
    }, [room, onDataUpdate]);

    const getRankBadgeStyle = (rank) => {
        if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold';
        if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black font-bold';
        if (rank === 3) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold';
        return 'bg-black/40 text-gray-300';
    };

    return (
        data !== 'empty' ?
            data && data.length > 0 ?
                <div className="w-full max-h-full overflow-x-auto overflow-y-auto rounded-xl my-6 [box-shadow:0_8px_32px_rgba(0,0,0,0.6)] border border-[#f7b72e]/20">
                    <table className="min-w-full divide-y divide-white/10 rounded-xl backdrop-blur-xl bg-black/30">
                        <thead className="sticky top-0 bg-gradient-to-r from-black/95 via-black/90 to-black/95 text-[#f7b72e] sm:text-xl vsm:text-base text-sm z-10 font-bold border-b-2 border-[#f7b72e]/30">
                            <tr>
                                {fields && fields.map((element, index) => (
                                    <th key={index} className="whitespace-nowrap sm:px-6 px-3 py-4 h-14 text-left first:text-center">
                                        {element}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10 bg-black/20">
                            {data && data.map((object, index) => (
                                <tr 
                                    key={index}
                                    className="transition-all duration-200 hover:bg-white/10 hover:scale-[1.01] cursor-default border-l-4 border-transparent hover:border-[#f7b72e]/50"
                                >
                                    <td className="whitespace-nowrap vsm:text-base text-xs px-4 py-4 h-14 text-center">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getRankBadgeStyle(object["rank"])} shadow-lg`}>
                                            {object["rank"]}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap vsm:text-base text-xs sm:px-6 px-3 py-4 font-semibold text-white">
                                        {object["teamName"]}
                                    </td>
                                    <td className="whitespace-nowrap vsm:text-base text-xs sm:px-6 px-3 py-4 font-bold text-[#f7b72e] text-center bg-black/20">
                                        {object["score"]}
                                    </td>
                                    {object["problems"].map((problem, problemIndex) => (
                                        <td
                                            key={problemIndex}
                                            style={getStatusStyle(problem['status'])}
                                            className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-4 text-center border-l border-white/5"
                                        >
                                            <div className="flex flex-col justify-center items-center min-h-[3.5rem] space-y-1">
                                                <div className="font-semibold text-white/90">{problem["time"] || '-'}</div>
                                                <div className="text-xs opacity-80">{problem["penalty"] || '-'}</div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> :
                <div className="min-w-full rounded-xl backdrop-blur-xl bg-black/30 py-36 my-10 min-h-max w-full overflow-x-auto overflow-y-auto [box-shadow:0_8px_32px_rgba(0,0,0,0.6)] border border-[#f7b72e]/20 justify-center items-center content-center flex">
                    <div className="text-center">
                        <h2 className="text-[#f7b72e] sm:text-3xl text-xl font-bold mb-2">No Records Available</h2>
                        <p className="text-gray-400 text-sm">Check back later for updates</p>
                    </div>
                </div>
            :
            <div className="h-full w-full rounded-xl backdrop-blur-xl bg-black/30 my-10 min-h-[400px] overflow-x-auto overflow-y-auto [box-shadow:0_8px_32px_rgba(0,0,0,0.6)] border border-[#f7b72e]/20 justify-center items-center content-center flex">
                <TableSpinner />
            </div>
    );
};

export default ScoreTable;