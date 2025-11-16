import { useState } from 'react';
import ScoreBoard from '../components/Scoreboard'

const batches = ['22k', '23k', '24k', '25k'];

const ScoreboardPage = ({ isSoundOpen }: { isSoundOpen: boolean }) => {

    const [selectedBatch, setSelectedBatch] = useState('23k');

    return (
        <div className="flex flex-col items-center">
            <img src="/scoreboard-title.png" alt="Scoreboard" className='h-16 sm:h-28 mx-auto' />
            
            <div className='max-h-[60vh] mx-auto mt-6 relative'>
                <div className={`absolute z-40 -top-16 -right-12 rotate-8 sm:block hidden`}>
                    <img src="/wooden-plank.png" alt="Batch" className="h-24 pointer-events-none select-none" />
                    <select
                        name="batch"
                        id="batch"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className='absolute inset-0 flex items-center justify-center font-bold text-xl font-hoshiko text-[#3c0d0d]/85 w-fit -translate-x-1/2 left-1/2 focus:ring-0 bg-transparent cursor-pointer ring-0 focus:border-0 outline-none'
                    >
                        {batches.map((batch) => (
                            <option key={batch} value={batch} className='bg-[#e19f65] text-center'>
                                Batch '{batch.slice(0, 2)}
                            </option>
                        ))}
                    </select>
                </div>

                <ScoreBoard room={selectedBatch} isSoundOpen={isSoundOpen} />
            </div>
        </div>
    )
}

export default ScoreboardPage