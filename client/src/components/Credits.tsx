import { useState } from 'react'

const Credits = () => {
    const CREDITS = [
        { name: "Abdullah Azhar Khan", link: "https://abdullahazhar.vercel.app" },
        { name: "Abdul Basit", link: "https://portfolio-abdulbasit-cs.netlify.app" },
        { name: "Sarim Ahmed", link: "https://www.linkedin.com/in/sarim-ahmed-89412a19a" },
    ];

    const [isInfoPinned, setIsInfoPinned] = useState(false);

    return (
        <div
            className="fixed top-5 right-5 z-50"
        >
            <button
                aria-label="Info"
                aria-expanded={isInfoPinned}
                onClick={() => setIsInfoPinned(v => !v)}
                className="h-9 w-9 rounded-full grid place-items-center bg-[#ffe8b0] border-2 border-[#3c0d0d]/70 text-[#3c0d0d] font-bold shadow-md"
                title="About"
            >
                i
            </button>

            <div
                className={`absolute right-0 mt-2 w-60 transition-all duration-200 ${isInfoPinned ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-1 pointer-events-none"}`}
            >
                <div className="rounded-xl bg-[#ffe8b0] border-4 border-[#3c0d0d]/70 shadow-2xl p-4">
                    <div className="font-hoshiko text-lg text-[#3c0d0d] mb-2 flex items-center justify-between">
                        <span>Credits</span>
                        <button
                            aria-label="Close"
                            onClick={() => setIsInfoPinned(false)}
                            className="text-[#3c0d0d]/70 hover:text-[#3c0d0d] text-sm px-2 py-1 rounded"
                            title="Close"
                        >
                            ✕
                        </button>
                    </div>
                    <ul className="space-y-0.5">
                        {CREDITS.map((c) => (
                            <li key={c.name} className="text-[#6b2a2a] text-sm">
                                <a href={c.link} className="font-semibold hover:underline" target="_blank" rel="noreferrer">
                                    {c.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Credits;