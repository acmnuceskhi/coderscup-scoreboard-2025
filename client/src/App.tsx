import './App.css'
import ScoreBoard from './components/Scoreboard'

function App() {

  return (
    <main className="h-screen w-full bg-[url('/cc-bg.png')] bg-cover bg-center bg-no-repeat p-10 flex items-center justify-center flex-col">
      <div className='fixed bottom-5 right-0'>
        <img src="/cc-logo-cropped.png" alt="Coders' Cup '25" className='h-20 shadow-2xl' />
        <div className='w-full shadow-2xl shadow-amber-200 z-50 bg-red-500'></div>
      </div>
      <div className='font-hoshiko fixed top-5 left-5'>
        <h1 className='text-primaryYellow text-2xl text-center -rotate-4 font-semibold'>CODERS'</h1>
        <h1 className='text-primaryYellow text-2xl text-right -rotate-6 font-semibold'>斗争 CUP</h1>
      </div>
      <div className="w-5/6">
        <h1 className='text-primaryYellow text-6xl font-hoshiko text-center font-bold m-2'>Scoreboard</h1>
        <div className='max-h-[60vh] mx-auto overflow-y-auto'>
          <ScoreBoard room="22k" />
        </div>
        <h1 className='text-primaryYellow text-3xl font-hoshiko text-right m-2'>Batch '23</h1>
      </div>
    </main>
  )
}

export default App
