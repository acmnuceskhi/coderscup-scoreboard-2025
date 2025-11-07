import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import TableSpinner from "./TableSpinner";


const ScoreBoard = ({ room, onDataUpdate }: any) => {
    const [data, setData] = useState<any[] | 'empty'>('empty');
    const [fields, setFields] = useState<string[]>(["Team Name", "Score"]);

    const getStatusStyle = (status: string) => {
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
                console.log(rankingData)
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

    return (
        data !== 'empty' ?
            data && data.length > 0 ?
                <div className="w-full max-h-[60vh] overflow-y-auto overflow-x-auto rounded-md [box-shadow:0_0_10px_rgba(0,0,0,1)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-700/50 [&::-webkit-scrollbar-thumb]:rounded-sm [&::-webkit-scrollbar-track]:bg-gray-700/10">
                    <table className="min-w-full table-fixed border-collapse">
                        <thead>
                            <tr>
                                {fields.map((element, index) => (
                                    <th
                                        key={index}
                                        className="sticky top-0 z-20 bg-black/90 text-[rgba(171,126,12,1)] sm:text-xl vsm:text-base text-sm font-bold whitespace-nowrap sm:px-4 px-2 py-2 h-12"
                                    >
                                        {element}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y-2 divide-black/20 bg-gray-700/10">
                            {data.map((object: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="whitespace-nowrap vsm:text-base text-xs px-4 py-2 h-12 font-normal bg-black/25 text-gray-200 text-center">
                                        {object.rank}
                                    </td>
                                    <td className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-2 font-normal text-gray-200 text-center">
                                        {object.teamName}
                                    </td>
                                    <td className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-2 font-normal bg-black/15 text-gray-200 text-center">
                                        {object.score}
                                    </td>
                                    {object.problems.map((p: any, j: number) => (
                                        <td
                                            key={j}
                                            style={getStatusStyle(p.status)}
                                            className="whitespace-nowrap vsm:text-base text-xs sm:px-4 px-2 py-2 font-normal text-gray-200 text-center"
                                        >
                                            <div className="flex flex-col justify-center items-center h-12">
                                                <div>{p.time}</div>
                                                <div>{p.penalty}</div>
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
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