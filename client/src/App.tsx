import { useEffect, useState } from 'react';
import './App.css'
import ScoreBoard from './components/Scoreboard'
// import RotatingTitle from './components/RotatingTitle'

function parseHMS(str: string) {
  const parts = str.split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  } else if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  return 0;
}


function formatHMS(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function App() {
  const [isContestRunning, setIsContestRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const stored = localStorage.getItem("remainingTime-22k");
    return stored ? parseHMS(stored) : 0;
  });


  // update every second
  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // whenever localStorage changes (e.g., next scrape)
  useEffect(() => {
    const handler = () => {
      const stored = localStorage.getItem("remainingTime-22k");
      if (stored) setTimeLeft(parseHMS(stored));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);


  return (
    <main className="h-screen w-full bg-[url('/cc-bg-2.png')] bg-cover bg-center bg-no-repeat p-10 flex items-center justify-center flex-col">
      <div className='fixed bottom-5 right-0'>
        <img src="/cc-logo-cropped.png" alt="Coders' Cup '25" className='h-20 shadow-2xl' />
      </div>
      <div className="">
        <img src="/scoreboard-title.png" alt="Scoreboard" className='h-28 mx-auto' />
        {/* <RotatingTitle className='text-primaryYellow text-6xl font-hoshiko text-center font-bold m-2 tracking-[0.35em] uppercase drop-shadow-[0_5px_12px_rgba(0,0,0,0.75)] h-30 mx-auto mt-4'/> */}

        {/* <h1 className='text-primaryYellow text-8xl font-hoshiko text-center font-bold m-2'>Scoreboard</h1> */}
        <div className='max-h-[60vh] mx-auto mt-6 relative'>
          <div className="absolute z-50 -top-10 -right-20 rotate-20">
            <img
              src="/wooden-plank.png"
              alt="Batch"
              className="h-24 pointer-events-none select-none"
            />
            <p className="absolute inset-0 flex items-center justify-center font-bold text-xl font-hoshiko text-[#3c0d0d]/85">
              Batch '24
            </p>
          </div>
          <ScoreBoard room="22k" setIsContestRunning={setIsContestRunning} />
        </div>
      </div>
      <div className="fixed -top-12 left-0">
        <div className="relative w-60">
          <img
            src="/timeboard.png"
            alt="Coders' Cup '25"
            className="w-full rotate-180 select-none pointer-events-none"
          />
          <div className="absolute inset-0 translate-y-11 flex items-center justify-center">
            <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-2xl tracking-wide">
              { }
              {isContestRunning ? (
                timeLeft > 0 ? formatHMS(timeLeft) : "Ended"
              ) : "Ended"}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default App
