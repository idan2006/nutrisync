import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Home       from './components/Home';
import MealLog    from './components/MealLog';
import Profile    from './components/Profile';
import Navigation from './components/Navigation';

function Splash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 to-teal-600 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg font-semibold">NutriSync</p>
      </div>
    </div>
  );
}

export default function App() {
  const [userData,          setUserData]          = useState(null);
  const [meals,             setMeals]             = useState([]);
  const [weightHistory,     setWeightHistory]     = useState([]);
  const [lastWeightUpdate,  setLastWeightUpdate]  = useState(null);
  const [page,              setPage]              = useState('home');
  const [loading,           setLoading]           = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nutritionApp');
      if (raw) {
        const d = JSON.parse(raw);
        if (d?.userData) {
          setUserData(d.userData);
          setMeals(d.meals ?? []);
          setWeightHistory(d.weightHistory ?? []);
          setLastWeightUpdate(d.lastWeightUpdate ?? null);
        }
      }
    } catch {
      localStorage.removeItem('nutritionApp');
    }
    setLoading(false);
  }, []);

  const handleOnboarded = data => {
    const initialHistory = [{ date: new Date().toISOString(), weight: parseFloat(data.currentWeight) }];
    setUserData(data);
    setWeightHistory(initialHistory);
    setMeals([]);
    setLastWeightUpdate(null);
    localStorage.setItem('nutritionApp', JSON.stringify({
      userData:         data,
      meals:            [],
      weightHistory:    initialHistory,
      lastWeightUpdate: null,
    }));
  };

  const handleReset = () => {
    localStorage.removeItem('nutritionApp');
    localStorage.removeItem('progressPhoto');
    setUserData(null);
    setMeals([]);
    setWeightHistory([]);
    setLastWeightUpdate(null);
    setPage('home');
  };

  if (loading)    return <Splash />;
  if (!userData)  return <Onboarding onComplete={handleOnboarded} />;

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
      <div className="page-enter">
        {page === 'home' && (
          <Home
            userData={userData}
            weightHistory={weightHistory}
            setWeightHistory={setWeightHistory}
            lastWeightUpdate={lastWeightUpdate}
            setLastWeightUpdate={setLastWeightUpdate}
            meals={meals}
          />
        )}
        {page === 'meals' && (
          <MealLog
            userData={userData}
            meals={meals}
            setMeals={setMeals}
          />
        )}
        {page === 'profile' && (
          <Profile
            userData={userData}
            onReset={handleReset}
          />
        )}
      </div>
      <Navigation currentPage={page} setCurrentPage={setPage} />
    </div>
  );
}
