import { useEffect, useMemo, useState } from 'react';
import './App.css';
import BottomTicker from './components/BottomTicker';
import TopThreeTeamsSection from './components/TopThreeTeamsSection';
import Credits from './components/Credits';
import SoundButton from './components/SoundButton';
import Timeboard from './components/Timeboard';
import { HOUSES, NEWS_TEMPLATES } from './utils/DataObjects';
import { formatHMS, fetchContestTimes, fetchTopTeams } from './utils/Functions';
import ScoreboardPage from './pages/ScoreboardPage';
import HouseStatsPage from './pages/HouseStatsPage';
import HouseRankPage from './pages/HouseRankPage';

type Phase = 'idle' | 'before' | 'during' | 'after';
type Page = 'scoreboard' | 'house' | 'houserank';

type Team = {
  teamId: string;
  rank: number;
  teamName: string;
  score: number;
  penalty: number;
  problems: Array<{ status: string; time: string; penalty: string; firstSolve: boolean }>;
};

const getPageTransform = (current: Page, target: Page) => {
  const order: Page[] = ['scoreboard', 'house', 'houserank'];
  const currentIndex = order.indexOf(current);
  const targetIndex = order.indexOf(target);

  if (targetIndex === currentIndex) return 'translate-x-0';
  if (targetIndex < currentIndex) return '-translate-x-full';
  return 'translate-x-full';
};

function App() {
  const BACKENDURL = "http://localhost:4000";
  // const BACKENDURL = "https://coderscup-scoreboard-backend.onrender.com";

  const [page, setPage] = useState<Page>('house');

  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isSoundOpen, setIsSoundOpen] = useState<boolean>(false);

  const [label, setLabel] = useState<string>('');
  const [display, setDisplay] = useState<string>('--:--:--');
  const [phase, setPhase] = useState<Phase>('idle');

  const [topTeams, setTopTeams] = useState<Team[] | null>(null);
  const [loadingTop, setLoadingTop] = useState(false);

  const [tickerMessage, setTickerMessage] = useState<string>("");

  useEffect(() => {
    fetchContestTimes(BACKENDURL, setStartTime, setEndTime);
    const interval = setInterval(
      () => fetchContestTimes(BACKENDURL, setStartTime, setEndTime),
      30000
    );
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
    let id: ReturnType<typeof setInterval> | null = null;

    if (phase === "during" || phase === "after") {
      fetchTopTeams(BACKENDURL, setLoadingTop, setTopTeams);
      if (phase === "during") {
        id = setInterval(
          () => fetchTopTeams(BACKENDURL, setLoadingTop, setTopTeams),
          30000
        );
      }
    }

    return () => {
      if (id) clearInterval(id);
    };
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
    const id = setInterval(() => setTickerMessage(pickTickerMessage()), 50_000);
    return () => clearInterval(id);
  }, [phase, podium.length]);

  const goRight = () => {
    setPage(prev => {
      if (prev === 'scoreboard') return 'house';
      if (prev === 'house') return 'houserank';
      return prev; // no right arrow on houserank
    });
  };

  const goLeft = () => {
    setPage(prev => {
      if (prev === 'houserank') return 'house';
      if (prev === 'house') return 'scoreboard';
      return prev; // no left arrow on scoreboard
    });
  };

  return (
    <main className="h-screen w-full bg-[url('/cc-bg-2.png')] bg-cover bg-center bg-no-repeat p-10 flex items-center justify-center flex-col relative overflow-hidden">

      {/* Sliding page container */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden mt-10">
        {/* SCOREBOARD PAGE */}
        <div
          className={`
          absolute inset-0
          transform transition-transform duration-1000 ease-out
          ${getPageTransform(page, 'scoreboard')}
        `}
        >
          <ScoreboardPage isSoundOpen={isSoundOpen} page={page} />
        </div>

        {/* HOUSE STATS PAGE */}
        <div
          className={`
          absolute inset-0
          transform transition-transform duration-1000 ease-out
          ${getPageTransform(page, 'house')}
          overflow-y-auto overflow-x-hidden
          [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        `}
        >
          <HouseStatsPage page={page} />
        </div>

        {/* HOUSE RANKS PAGE */}
        <div
          className={`
          absolute inset-0
          transform transition-transform duration-1000 ease-out
          ${getPageTransform(page, 'houserank')}
        `}
        >
          <HouseRankPage page={page} />
        </div>
      </div>

      {/* Top-right Info button with hover credits */}
      <Credits />

      {/* Bottom-left sound toggle */}
      <SoundButton isSoundOpen={isSoundOpen} setIsSoundOpen={setIsSoundOpen} phase={phase} />

      {/* Top-left Timer */}
      <Timeboard label={label} display={display} />

      {/* Page Switcher chevron right */}
      {(page === 'scoreboard' || page === 'house') && (
        <img
          className={`absolute w-16 right-4 cursor-pointer`}
          onClick={goRight}
          src="/wooden-chevron.png"
          alt="switch page right"
        />
      )}

      {/* Page Switcher chevron left */}
      {(page === 'house' || page === 'houserank') && (
        <img
          className={`absolute w-16 left-4 rotate-180 cursor-pointer`}
          onClick={goLeft}
          src="/wooden-chevron.png"
          alt="switch page left"
        />
      )}

      {/* Timer prior to the contest */}
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

      {/* bottom ticker message */}
      {phase === 'during' && tickerMessage && (
        <BottomTicker tickerMessage={tickerMessage} />
      )}

      {/* top three team podium component */}
      {/* {phase === 'after' && (
        loadingTop ? (
          <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="mx-4 rounded-2xl bg-[#ffe8b0] shadow-2xl border-4 border-[#3c0d0d]/70 px-8 py-10 text-center">
              <div className="text-3xl font-hoshiko text-[#3c0d0d]">Finalizing results…</div>
            </div>
          </div>
        ) : (
          <TopThreeTeamsSection podium={podium} />
        )
      )} */}
    </main>
  );
}

export default App;
