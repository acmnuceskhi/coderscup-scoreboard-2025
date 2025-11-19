import { useState } from 'react';
import ScoreBoard from '../components/Scoreboard'

const batches = ['22k', '23k', '24k', '25k'];

const ScoreboardPage = ({ isSoundOpen, page }: { isSoundOpen: boolean; page: string }) => {

    const [selectedBatch, setSelectedBatch] = useState('25k');

    return (
        <div className="flex flex-col items-center w-full px-1 sm:px-3 md:px-4 py-2 sm:py-4 md:py-6">
            <img src="/scoreboard-title.png" alt="Scoreboard" className='h-10 sm:h-16 md:h-24 lg:h-28 mx-auto mb-2 sm:mb-4 md:mb-6' />

            <div className='w-full max-w-full mx-auto mt-2 sm:mt-4 md:mt-6 lg:mt-10 relative'>
                {/* Desktop Batch Selector */}
                <div className={`absolute z-40 -top-10 sm:-top-12 -right-6 sm:-right-8 md:-right-12 rotate-8 hidden sm:block`}>
                    <img src="/wooden-plank.png" alt="Batch" className="h-16 sm:h-20 md:h-24 pointer-events-none select-none" />
                    <select
                        name="batch"
                        id="batch"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        className='absolute inset-0 flex items-center justify-center font-bold text-base sm:text-lg md:text-xl font-hoshiko text-[#3c0d0d]/85 w-fit -translate-x-1/2 left-1/2 focus:ring-0 bg-transparent cursor-pointer ring-0 focus:border-0 outline-none'
                    >
                        {batches.map((batch) => (
                            <option key={batch} value={batch} className='bg-[#e19f65] text-center'>
                                Batch '{batch.slice(0, 2)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mobile Batch Selector */}
                <div className='sm:hidden mb-2 sm:mb-4 flex justify-center'>
                    <div className='relative'>
                        <img src="/wooden-plank.png" alt="Batch" className="h-14 sm:h-16 pointer-events-none select-none" />
                        <select
                            name="batch-mobile"
                            id="batch-mobile"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className='absolute inset-0 flex items-center justify-center font-bold text-sm sm:text-base font-hoshiko text-[#3c0d0d]/85 w-full -translate-x-1/2 left-1/2 focus:ring-0 bg-transparent cursor-pointer ring-0 focus:border-0 outline-none'
                        >
                            {batches.map((batch) => (
                                <option key={batch} value={batch} className='bg-[#e19f65] text-center'>
                                    Batch '{batch.slice(0, 2)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='w-full overflow-hidden'>
                    <ScoreBoard room={selectedBatch} isSoundOpen={isSoundOpen} page={page} />
                </div>
            </div>
        </div>
    )
}

export default ScoreboardPage