
const TableSpinner = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div
                    className="text-[#f7b72e] inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status">
                </div>
                <div className="absolute inset-0 text-[#f7b72e]/30 inline-block h-12 w-12 rounded-full border-4 border-solid border-transparent border-l-current animate-spin align-[-0.125em]" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
            </div>
            <div className="text-[#f7b72e] font-semibold text-lg animate-pulse">
                Fetching data...
            </div>
        </div>
    );
}

export default TableSpinner;