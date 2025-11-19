
const Timeboard = ({ label, display }: { label: string; display: string }) => {
    return (
        <div className="fixed -top-10 sm:-top-16 md:-top-20 left-2 sm:left-4 md:left-6 z-10">
            <div className="relative w-32 sm:w-40 md:w-48 lg:w-52">
                <img src="/timeboard.png" alt="Coders' Cup '25" className="w-full rotate-180 select-none pointer-events-none" />
                <div className="absolute inset-0 translate-y-8 sm:translate-y-10 md:translate-y-12 flex flex-col items-center justify-center">
                    <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-xs sm:text-sm md:text-base tracking-wide">{label}</span>
                    <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-sm sm:text-lg md:text-xl lg:text-2xl tracking-wide tabular-nums">{display}</span>
                </div>
            </div>
        </div>
    )
}

export default Timeboard