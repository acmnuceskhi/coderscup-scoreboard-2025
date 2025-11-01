import React from 'react';

export default function PageSwitcher({ currentView, onSwitch }) {
    return (
        <button
            onClick={onSwitch}
            className="bg-gradient-to-r from-[#f7b72e] to-[#d4a01a] hover:from-[#f7b72e]/90 hover:to-[#d4a01a]/90
                       text-black text-xs sm:text-sm font-bold
                       h-10 px-4 sm:px-6
                       rounded-full 
                       flex items-center justify-center space-x-2
                       transition-all duration-300 ease-in-out 
                       shadow-lg hover:shadow-xl hover:shadow-[#f7b72e]/30
                       active:scale-95
                       backdrop-blur-sm border border-[#f7b72e]/30
                       hover:scale-105"
        >
            <span>
                {currentView === 'house-rankings'
                    ? '← Home'
                    : '🏠 Rankings'}
            </span>
        </button>
    );
} 