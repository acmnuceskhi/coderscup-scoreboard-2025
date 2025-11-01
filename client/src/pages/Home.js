import BackgroundImage from '../assets/background.jpg';
import React, { useState } from "react";
import TopBar from '../components/TopBar';
import ScoreTable from '../components/ScoreTable';
import BatchSelector from '../components/BatchSelector';

var batches = [
    "22k",
    "23k",
    "24k",
    "25k",
]

export default function HomePage() {
    const [batch, setBatch] = useState(batches[0]);


    return (
        <div className="w-full bg-cover h-screen flex flex-col justify-start items-center  overflow-x-hidden overflow-y-scroll font-bold"
            style={{ 
                "backgroundImage": `url(${BackgroundImage})`,
                "backgroundAttachment": "fixed",
                "backgroundPosition": "bottom center",
                "backgroundRepeat": "no-repeat",
                "backgroundSize": "cover"
            }}>
            <TopBar />

            <div className='mt-6' />

            <BatchSelector batches={batches} setBatch={setBatch} selectedBatch={batch} />

            <div className='w-full max-w-7xl px-4 mt-6 max-h-[65%]'>
                <ScoreTable room={batch} />
            </div>

            <div className='mt-8' />
        </div>
    );
}