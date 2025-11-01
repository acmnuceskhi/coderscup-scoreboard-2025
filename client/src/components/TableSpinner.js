const TableSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-6 py-8 relative">
            {/* Dark backdrop for better visibility */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl -m-4"></div>
            
            {/* Main spinner container */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
                <div className="relative flex items-center justify-center">
                    {/* Outer pulsing ring - more visible */}
                    <div className="absolute w-24 h-24 rounded-full border-[3px] border-[#f7b72e]/40 animate-ping"></div>
                    
                    {/* Outer spinning ring - slower, brighter */}
                    <div className="absolute w-[72px] h-[72px] rounded-full border-4 border-transparent border-t-[#f7b72e] border-r-[#f7b72e] animate-spin shadow-[0_0_15px_rgba(247,183,46,0.8)]" style={{ animationDuration: '2s' }}></div>
                    
                    {/* Middle spinning ring - medium speed, brighter */}
                    <div 
                        className="relative text-[#f7b72e] inline-block h-[72px] w-[72px] animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] shadow-[0_0_30px_rgba(247,183,46,0.9)] brightness-125"
                        style={{ animationDuration: '1.2s' }}
                        role="status">
                    </div>
                    
                    {/* Inner spinning ring - faster, reverse, brighter */}
                    <div 
                        className="absolute w-14 h-14 rounded-full border-[3px] border-transparent border-b-[#f7b72e] border-l-[#f7b72e] animate-spin shadow-[0_0_20px_rgba(247,183,46,0.7)]"
                        style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
                    ></div>
                    
                    {/* Center dot - larger and brighter */}
                    <div className="absolute flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-[#f7b72e] shadow-[0_0_20px_rgba(247,183,46,1)] animate-pulse brightness-150"></div>
                    </div>
                </div>
                
                {/* Loading text with animated dots - more prominent */}
                <div className="flex flex-col items-center space-y-2 relative z-10">
                    <div className="text-[#f7b72e] font-bold text-xl flex items-center space-x-1 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                        <span className="animate-pulse brightness-125">Fetching</span>
                        <span className="inline-flex space-x-1">
                            <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0s' }}>.</span>
                            <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0.2s' }}>.</span>
                            <span className="animate-[bounce_1s_infinite]" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                    </div>
                    <p className="text-white font-medium text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Please wait while we load the data</p>
                </div>
            </div>
        </div>
    );
}

export default TableSpinner;