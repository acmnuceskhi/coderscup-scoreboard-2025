import { useEffect, useMemo, useState } from 'react';
import './App.css';
import ScoreBoard from './components/Scoreboard';

type Phase = 'idle' | 'before' | 'during' | 'after';

type Team = {
  teamId: string;
  rank: number;
  teamName: string;
  score: number;
  penalty: number;
  problems: Array<{ status: string; time: string; penalty: string }>;
};

function App() {
  // const BACKENDURL = "http://localhost:4000";
  const BACKENDURL = "https://coderscup-scoreboard-backend.onrender.com";

  const CREDITS = [
    { name: "Abdullah Azhar Khan", link: "https://abdullahazhar.vercel.app" },
    { name: "Abdul Basit", link: "https://portfolio-abdulbasit-cs.netlify.app" },
    { name: "Sarim Ahmed", link: "https://www.linkedin.com/in/sarim-ahmed-89412a19a" },
  ];

  const HOUSES = ["House Shen", "House Dragon Warrior", "House Oogway", "House Tai Lung"];

  const NEWS_TEMPLATES: Array<(house: string, team: string) => string> = [
    (h, t) => `${h} is thinking to bid on Team ${t}`,
    (h, t) => `${h} scouts Team ${t} after a swift solve`,
    (h, t) => `${h} whispers that Team ${t} found inner peace under pressure`,
    (h, t) => `${h} notes Team ${t} mastered the secret ingredient: focus`,
    (h, t) => `${h} says Team ${t} moves like a true Dragon Warrior`,
    (h, t) => `${h} watches Team ${t} strike with perfect timing`,
    (h, t) => `${h} believes Team ${t} unlocked the scroll of AC`,
    (h, t) => `${h} saw Po cheering for Team ${t} after that clutch submission!`,
    (h, t) => `${h} reports that Team ${t} coded faster than Tai Lung's fury!`,
    (h, t) => `${h} says even Oogway would be proud of Team ${t}'s performance`,
    (h, t) => `${h} is amazed — Team ${t} just balanced code and calm perfectly!`,
    (h, t) => `${h} says Team ${t} turned every WA into a lesson of patience`,
    (h, t) => `${h} chants: “There are no accidents!” as Team ${t} rises in rank`,
    (h, t) => `${h} heard Po whisper: “Skadoosh!” after Team ${t}'s AC`,
    (h, t) => `${h} laughs — Team ${t} just sent a lethal combo submission!`,
    (h, t) => `${h} thinks Team ${t} is coding in legendary Wuxi Finger style!`,
    (h, t) => `${h} just witnessed Team ${t} break the silence with a flawless solve!`,
    (h, t) => `${h} believes Team ${t} just attained the level of Inner Peace.`,
  ];


  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isSoundOpen, setIsSoundOpen] = useState<boolean>(false);

  const [isInfoPinned, setIsInfoPinned] = useState(false);
  const [isInfoHover, setIsInfoHover] = useState(false);
  const isInfoVisible = isInfoPinned || isInfoHover;


  const [label, setLabel] = useState<string>('');
  const [display, setDisplay] = useState<string>('--:--:--');
  const [phase, setPhase] = useState<Phase>('idle');

  const [topTeams, setTopTeams] = useState<Team[] | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);

  const [tickerMessage, setTickerMessage] = useState<string>("");

  const formatHMS = (ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const fetchContestTimes = async () => {
    try {
      const res = await fetch(`${BACKENDURL}/api/getContestTime`);
      if (!res.ok) throw new Error('Failed to fetch contest times');
      const data = await res.json();
      if (data.startTime && data.endTime) {
        setStartTime(new Date(data.startTime));
        setEndTime(new Date(data.endTime));
      }
    } catch (err) {
      console.error('Error fetching contest times:', err);
    }
  };

  const fetchTopTeams = async () => {
    try {
      setLoadingTop(true);
      const res = await fetch(`${BACKENDURL}/api/getTopTeams/22k`);
      if (!res.ok) throw new Error('Failed to fetch top teams');
      const data: Team[] = await res.json();
      setTopTeams(data);
    } catch (e) {
      console.error('Error fetching top teams:', e);
      setTopTeams(null);
    } finally {
      setLoadingTop(false);
    }
  };

  useEffect(() => {
    fetchContestTimes();
    const interval = setInterval(fetchContestTimes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = () => {
      if (!startTime || !endTime) {
        setPhase('idle');
        setLabel('');
        setDisplay('--:--:--');
        return;
      }

      const now = Date.now();
      const tStart = startTime.getTime();
      const tEnd = endTime.getTime();

      if (now < tStart) {
        setPhase('before');
        setLabel('Starts in');
        setDisplay(formatHMS(tStart - now));
      } else if (now >= tStart && now <= tEnd) {
        setPhase('during');
        setLabel('Ends in');
        setDisplay(formatHMS(tEnd - now));
      } else {
        setPhase('after');
        setLabel('');
        setDisplay('Contest Ended');
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime, endTime]);

  useEffect(() => {
    if (phase !== 'during' && phase !== 'after') return;
    fetchTopTeams();
    const id = setInterval(fetchTopTeams, 30000);
    return () => clearInterval(id);
  }, [phase]);

  const podium = useMemo(() => {
    if (!topTeams || topTeams.length < 1) return [];
    const byRank: Record<number, Team | undefined> = {};
    topTeams.forEach(t => (byRank[t.rank] = t));
    return [byRank[1], byRank[2], byRank[3]].filter(Boolean) as Team[];
  }, [topTeams]);

  const pickTickerMessage = () => {
    if (!podium.length) return "";
    const house = HOUSES[Math.floor(Math.random() * HOUSES.length)];
    const team = podium[Math.floor(Math.random() * podium.length)];
    const teamLabel = team?.teamName ?? "a top team";
    const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
    return template(house, teamLabel);
  };


  useEffect(() => {
    if (phase !== 'during' || podium.length === 0) return;
    setTickerMessage(pickTickerMessage());
    const id = setInterval(() => setTickerMessage(pickTickerMessage()), 60_000);
    return () => clearInterval(id);
  }, [phase, podium.length]);

  const TopThreeSection = () => (
    <div className="absolute inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <div className="flex flex-col gap-6 font-hoshiko text-2xl md:text-6xl tracking-wide">
            <span className='text-3xl'>Top Teams</span>
            <span className='underline decoration-4 decoration-primaryYellow'>BATCH '22</span>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          <div className='bg-linear-to-b from-yellow-300 to-amber-200 w-full rounded-lg flex items-center justify-center flex-col gap-4 p-4 ring-4 ring-yellow-300 shadow-2xl'>
            <h2 className='text-[#3c0d0d] text-2xl font-hoshiko font-bold'>
              {podium[0]?.teamName}
            </h2>
            <div>
              <span className='text-[#6b2a2a] font-hoshiko text-xl'>
                Score {podium[0]?.score} &#8226; Penalty {podium[0]?.penalty}
              </span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='bg-linear-to-b from-zinc-200 to-zinc-100 w-full rounded-lg flex items-center justify-center flex-col gap-4 p-4 ring-4 ring-zinc-300 shadow-xl'>
              <h2 className='text-[#3c0d0d] text-2xl font-hoshiko font-bold'>
                {podium[1]?.teamName}
              </h2>
              <div>
                <span className='text-[#6b2a2a] font-hoshiko text-xl'>
                  Score {podium[1]?.score} &#8226; Penalty {podium[1]?.penalty}
                </span>
              </div>
            </div>

            <div className='bg-linear-to-b from-amber-300 to-orange-200 w-full rounded-lg flex items-center justify-center flex-col gap-4 p-4 ring-4 ring-amber-400 shadow-xl'>
              <h2 className='text-[#3c0d0d] text-2xl font-hoshiko font-bold'>
                {podium[2]?.teamName}
              </h2>
              <div>
                <span className='text-[#6b2a2a] font-hoshiko text-xl'>
                  Score {podium[2]?.score} &#8226; Penalty {podium[2]?.penalty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="h-screen w-full bg-[url('/cc-bg-2.png')] bg-cover bg-center bg-no-repeat p-10 flex items-center justify-center flex-col relative">

      {/* Top-right Info button with hover credits */}
      <div
        className="fixed top-5 right-5 z-50"
        onMouseEnter={() => setIsInfoHover(true)}
        onMouseLeave={() => setIsInfoHover(false)}
      >
        <button
          aria-label="Info"
          aria-expanded={isInfoVisible}
          onClick={() => setIsInfoPinned(v => !v)}
          className="h-9 w-9 rounded-full grid place-items-center bg-[#ffe8b0] border-2 border-[#3c0d0d]/70 text-[#3c0d0d] font-bold shadow-md"
          title="About"
        >
          i
        </button>

        <div
          className={`absolute right-0 mt-2 w-60 transition-all duration-200 ${isInfoVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-1 pointer-events-none"
            }`}
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

      <button
        type="button"
        onClick={() => setIsSoundOpen((v) => !v)}
        aria-pressed={isSoundOpen}
        aria-label={isSoundOpen ? 'Turn sound off' : 'Turn sound on'}
        title={isSoundOpen ? 'Sound: ON' : 'Sound: OFF'}
        className={`${phase === 'during' ? '' : 'hidden'} cursor-pointer fixed bottom-18 left-4 z-50 h-8 w-8 rounded-full bg-[#3c0d0d]/80 hover:bg-[#3c0d0d]/90 text-primaryYellow grid place-items-center select-none`}
      >
        <span className="text-xl leading-none">
          {isSoundOpen ? '🔊' : '🔇'}
        </span>
      </button>

      <div className="">
        <img src="/scoreboard-title.png" alt="Scoreboard" className='h-16 sm:h-28 mx-auto' />

        <div className='max-h-[60vh] mx-auto mt-6 relative'>
          <div className={`absolute z-40 -top-16 -right-12 rotate-8 ${phase === 'before' || phase === 'after' ? 'hidden' : 'hidden sm:block'}`}>
            <img src="/wooden-plank.png" alt="Batch" className="h-24 pointer-events-none select-none" />
            <p className="absolute inset-0 flex items-center justify-center font-bold text-xl font-hoshiko text-[#3c0d0d]/85">Batch '22</p>
          </div>

          <ScoreBoard room="22k" isSoundOpen={isSoundOpen} />
        </div>
      </div>

      <div className="fixed -top-30 md:-top-12 left-0">
        <div className="relative w-60">
          <img src="/timeboard.png" alt="Coders' Cup '25" className="w-full rotate-180 select-none pointer-events-none" />
          <div className="absolute inset-0 translate-y-11 flex flex-col items-center justify-center">
            <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-base tracking-wide">{label}</span>
            <span className="text-[#3c0d0d]/80 font-hoshiko font-bold text-2xl tracking-wide tabular-nums">{display}</span>
          </div>
        </div>
      </div>

      {phase === 'before' && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="mx-4 rounded-2xl bg-[#ffe8b0] shadow-2xl border-4 border-[#3c0d0d]/70 px-8 py-10 text-center">
            <div className="text-4xl md:text-5xl font-hoshiko text-[#3c0d0d] mb-2">
              Po just woke up… <br />
              <span className='text-3xl'>contest starting soon!</span>
            </div>
            <div className="text-xl md:text-2xl font-hoshiko text-[#6b2a2a]">
              <span className="tabular-nums font-bold">{display}</span>
            </div>
          </div>
        </div>
      )}

      {phase === 'after' && (
        loadingTop ? (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="mx-4 rounded-2xl bg-[#ffe8b0] shadow-2xl border-4 border-[#3c0d0d]/70 px-8 py-10 text-center">
              <div className="text-3xl font-hoshiko text-[#3c0d0d]">Finalizing results…</div>
            </div>
          </div>
        ) : (
          <TopThreeSection />
        )
      )}

      {phase === 'during' && tickerMessage && (
        <div className="fixed bottom-4 left-0 right-0 z-40">
          <div className="relative w-full overflow-hidden bg-[#ffe8b0] border-y-2 border-[#3c0d0d]/90">
            <div className="marquee whitespace-nowrap py-2">
              <span className="px-4 font-hoshiko text-[#3c0d0d] text-lg">{tickerMessage}</span>
              <span className="px-8 font-hoshiko text-[#3c0d0d] text-lg">•</span>
              <span className="px-4 font-hoshiko text-[#3c0d0d] text-lg">{tickerMessage}</span>
              <span className="px-8 font-hoshiko text-[#3c0d0d] text-lg">•</span>
              <span className="px-4 font-hoshiko text-[#3c0d0d] text-lg">{tickerMessage}</span>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .marquee {
            display: inline-block;
            animation: marquee 50s linear infinite;
            will-change: transform;
          }
        `}
      </style>
    </main>
  );
}

export default App;
