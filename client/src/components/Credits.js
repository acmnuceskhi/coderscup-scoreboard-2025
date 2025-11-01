import React from "react";

export default function Credits() {
    return (
        <div className="group relative m-1 flex justify-center">
            <div className="rounded-full text-sm border-[#f7b72e] border-2 font-bold bg-black/40 backdrop-blur-xl py-2 px-3 text-[#f7b72e] shadow-lg hover:shadow-xl hover:shadow-[#f7b72e]/30 transition-all duration-300 hover:scale-110 hover:bg-black/50 cursor-pointer">
                ?
            </div>
            <span className="vsm:w-64 w-56 absolute bottom-12 left-0 scale-0 rounded-xl border-2 border-[#f7b72e]/30 bg-black/80 p-5 vsm:text-sm text-xs text-gray-200 group-hover:scale-100 backdrop-blur-2xl shadow-2xl transition-all duration-300 origin-bottom-left [box-shadow:0_8px_32px_rgba(0,0,0,0.6)]">
                <p className="font-bold vsm:text-xl text-lg text-[#f7b72e] mb-3 border-b border-[#f7b72e]/20 pb-2">
                    Developed By
                </p>
                <div className="space-y-2">
                    <p className="ml-2 hover:text-[#f7b72e] transition-colors duration-200">
                        • Abdul Basit
                    </p>
                    <p className="ml-2 hover:text-[#f7b72e] transition-colors duration-200">
                        • Abdullah 
                    </p>
                   
                </div>
            </span>
        </div>
    );
}