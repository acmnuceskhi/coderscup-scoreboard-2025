import logo from "../assets/logo (With Sponsors).png"
import logo1 from "../assets/arsenal-logo.png"
import logo2 from "../assets/barca-logo.png"
import logo3 from "../assets/real-logo.png"
import logo4 from "../assets/united-logo.png"

const TopBar = () => {
    return (
        <div className="relative w-screen justify-center content-center flex py-4 px-4 overflow-hidden">
            {/* Gradient Background - Lower opacity for background visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/12 via-black/15 to-black/12"></div>
            
            {/* Subtle Gold Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f7b72e]/2 to-transparent"></div>
            
            {/* Top Border Glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f7b72e]/40 to-transparent"></div>
            
            {/* Shadow Overlay for depth */}
            <div className="absolute inset-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"></div>
            
            {/* Content */}
            <div className="relative z-10 w-fit text-center flex sm:gap-9 vsm:gap-4 gap-0 justify-center items-center content-center">
                <div className="w-fit text-center flex sm:gap-9 vsm:gap-4 gap-0 justify-center items-center content-center transition-all duration-300 ease-out hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(225,189,112,0.6)] cursor-pointer">
                    <img src={logo1} alt="Gunners" className="sm:h-16 vsm:h-14 h-10 filter drop-shadow-lg" />
                </div>

                <div className="w-fit text-center flex sm:gap-9 vsm:gap-4 gap-0 justify-center items-center content-center transition-all duration-300 ease-out hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(225,189,112,0.6)] cursor-pointer">
                    <img src={logo2} alt="Culers" className="sm:h-16 vsm:h-14 h-10 filter drop-shadow-lg" />
                </div>
                <div className="w-fit text-center flex sm:gap-9 vsm:gap-4 gap-0 p-3 justify-center items-center content-center transition-all duration-300 ease-out hover:scale-110 hover:drop-shadow-[0_0_20px_rgba(247,183,46,0.8)] cursor-pointer">
                    <img src={logo} alt="Coders Cup Logo" className="sm:h-32 h-24 filter drop-shadow-2xl" />
                </div>
                <div className="w-fit text-center flex sm:gap-9 vsm:gap-4 gap-0 justify-center items-center content-center transition-all duration-300 ease-out hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(8,127,216,0.6)] cursor-pointer">
                    <img src={logo3} alt="Galacticos" className="sm:h-16 vsm:h-14 h-10 filter drop-shadow-lg" />
                </div>
                <div className="w-fit text-center flex sm:gap-9 vsm:gap-4 gap-0 justify-center items-center content-center transition-all duration-300 ease-out hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(216,20,8,0.6)] cursor-pointer">
                    <img src={logo4} alt="Red Devils" className="sm:h-16 vsm:h-14 h-10 filter drop-shadow-lg" />
                </div>
            </div>
        </div>
    );
}

export default TopBar;