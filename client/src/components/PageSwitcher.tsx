
const PageSwitcher = ({ page, setPage }: { page: 'scoreboard' | 'house'; setPage: React.Dispatch<React.SetStateAction<'scoreboard' | 'house'>> }) => {
    return (
        <div className="fixed -bottom-30 right-4 z-50 cursor-pointer"
            onClick={() => {
                page === 'scoreboard' ? setPage('house') : setPage('scoreboard')
            }}
        >
            <div className="relative w-60 ">
                <img src="/timeboard.png" alt="Coders' Cup '25" className="w-full rotate-0 cursor-pointer select-none" />
                <div className="absolute inset-0 -translate-y-13 flex flex-col items-center justify-center">
                    <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-xl tracking-wide leading-1">SEE</span>
                    <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-3xl tracking-wide">
                        {page === 'scoreboard' ? 'House Stats' : 'Scoreboard'}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default PageSwitcher