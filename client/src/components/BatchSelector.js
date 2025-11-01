import React from 'react';

export default function BatchSelector(props) {

    return (
        <div className="w-full flex justify-center px-4">
            <ul className='inline-flex h-14 w-full max-w-2xl border-2 border-[#f7b72e]/30 bg-black/50 shadow-lg backdrop-blur-xl rounded-full justify-between content-between overflow-hidden [box-shadow:0_8px_32px_rgba(0,0,0,0.4)]'>
                {
                    props.batches.map((currBatch, index) => (
                        <li 
                            key={currBatch} 
                            onClick={() => props.setBatch(currBatch)} 
                            className={`
                                relative flex-1 flex items-center justify-center cursor-pointer select-none 
                                transition-all duration-300 ease-in-out h-full
                                ${currBatch === props.selectedBatch 
                                    ? 'bg-gradient-to-r from-[#f7b72e] to-[#d4a01a] text-black font-bold shadow-inner' 
                                    : 'text-white/80 hover:text-white hover:bg-white/10'
                                }
                                first:rounded-l-full last:rounded-r-full
                            `}
                        >
                            <span className={`text-sm sm:text-base font-semibold transition-all duration-300 ${currBatch === props.selectedBatch ? 'scale-110' : ''}`}>
                                <span className='vsm:hidden'>{currBatch}</span>
                                <span className='hidden vsm:inline'>Batch {currBatch}</span>
                            </span>
                            {currBatch === props.selectedBatch && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse opacity-50"></div>
                            )}
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}