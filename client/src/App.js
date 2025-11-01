import './App.css';
import React, { useState } from "react";
import HouseStatsPage from './pages/HouseStatsPage';
import PageSwitcher from './components/PageSwitcher';
import Credits from './components/Credits';
import HomePage from './pages/Home';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const toggleView = () => {
    setCurrentView(currentView === 'house-rankings' ? 'home' : 'house-rankings');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'house-rankings':
        return <HouseStatsPage currentView={currentView} onSwitch={toggleView} />;
      case 'home':
        return <HomePage currentView={currentView} onSwitch={toggleView} />;
      default:
        return <HomePage currentView={currentView} onSwitch={toggleView} />;
    }
  };

  return (
    <>

      {renderCurrentView()}
      <div className="relative">


        <div className="fixed bottom-4 left-4">
          <Credits />
        </div>

        <div className="fixed bottom-4 right-4">
          <PageSwitcher
            currentView={currentView}
            onSwitch={toggleView}
          />
        </div>
      </div>
    </>
  );
}

export default App;
