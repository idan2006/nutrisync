import React, { useState, useEffect, useRef } from 'react';
import {
  Scale, Camera, TrendingUp, CheckCircle2, Lock,
  Flame, Images,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { canUpdateWeight, getNextWeightUpdateTime, msToCountdown } from '../utils/calculations';
import GalleryModal from './GalleryModal';
import Toast from './Toast';

function CountdownBox({ value, label }) {
  return (
    <div className="flex-1 bg-brand-50 rounded-2xl p-3 text-center">
      <div className="text-3xl font-extrabold text-brand-600 tabular-nums pulse-soft">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-brand-400 font-medium mt-0.5">{label}</div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-xl px-3 py-2 text-sm border border-gray-100">
      <p className="text-gray-500 text-xs">{label}</p>
      <p className="font-bold text-brand-600">{payload[0].value} kg</p>
    </div>
  );
};

export default function Home({
  userData, weightHistory, setWeightHistory,
  lastWeightUpdate, setLastWeightUpdate, meals,
}) {
  const [newWeight, setNewWeight] = useState('');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [progressPhotos, setProgressPhotos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('progressPhotos') || '[]'); }
    catch { return []; }
  });
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [toast, setToast] = useState(null);
  const photoRef = useRef(null);

  const canUpdate = canUpdateWeight(lastWeightUpdate);

  // Countdown ticker
  useEffect(() => {
    if (canUpdate) return;
    const tick = () => {
      const ms = getNextWeightUpdateTime() - Date.now();
      setCountdown(msToCountdown(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [canUpdate]);

  const handleWeightSubmit = () => {
    if (!newWeight || !canUpdate) return;
    const entry = { date: new Date().toISOString(), weight: parseFloat(newWeight) };
    const next = [...weightHistory, entry];
    setWeightHistory(next);
    setLastWeightUpdate(entry.date);
    setNewWeight('');

    const stored = JSON.parse(localStorage.getItem('nutritionApp') || '{}');
    stored.weightHistory = next;
    stored.lastWeightUpdate = entry.date;
    localStorage.setItem('nutritionApp', JSON.stringify(stored));
  };

  const handlePhotoSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPendingPhoto(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const savePhoto = () => {
    if (!pendingPhoto) return;
    const entry = { url: pendingPhoto, date: new Date().toISOString() };
    const next = [entry, ...progressPhotos];
    setProgressPhotos(next);
    localStorage.setItem('progressPhotos', JSON.stringify(next));
    setPendingPhoto(null);
    setToast({ message: 'Photo successfully added to gallery.', type: 'success' });
  };

  // Build chart data
  const chartData = weightHistory.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: e.weight,
  }));

  const latest = weightHistory.length
    ? weightHistory[weightHistory.length - 1].weight
    : parseFloat(userData.currentWeight);
  const start  = parseFloat(userData.currentWeight);
  const goal   = parseFloat(userData.goalWeight);
  const delta  = goal - start;
  const moved  = latest - start;
  const progress = delta !== 0 ? Math.min(Math.abs(moved / delta) * 100, 100) : 100;

  // Today's calorie total
  const todayStr = new Date().toDateString();
  const todayCal = meals
    .filter(m => new Date(m.date).toDateString() === todayStr)
    .reduce((s, m) => s + m.nutrition.calories, 0);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <>
    <div className="pb-28 bg-gray-50 min-h-screen">
      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500 px-5 pt-14 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute bottom-0 left-8 w-24 h-24 bg-white/5 rounded-full" />

        <p className="text-white/70 text-sm">{greeting},</p>
        <h1 className="text-white text-2xl font-bold mt-0.5">{userData.name || 'Dashboard'} 👋</h1>

        <div className="grid grid-cols-2 gap-3 mt-5 relative">
          {[
            { label: 'Current Weight', value: `${latest} kg`,       sub: `Goal: ${goal} kg` },
            { label: "Today's Intake", value: `${todayCal} kcal`,   sub: `of ${userData.macros.calories} kcal` },
          ].map(c => (
            <div key={c.label} className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-white/60 text-xs font-medium">{c.label}</div>
              <div className="text-white text-xl font-bold mt-1">{c.value}</div>
              <div className="text-white/50 text-xs mt-0.5">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ── Weekly Weight Gate ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Scale size={18} className="text-brand-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Weekly Weigh-In</h2>
              <p className="text-gray-400 text-xs">Sundays at 9:00 AM</p>
            </div>
            {canUpdate && (
              <span className="ml-auto text-xs bg-green-100 text-green-600 px-2.5 py-1 rounded-full font-medium">
                Gate Open
              </span>
            )}
          </div>

          {canUpdate ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 rounded-xl px-3 py-2.5">
                <CheckCircle2 size={16} />
                Time for your weekly weigh-in!
              </div>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  placeholder="Enter weight (kg)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                />
                <button
                  onClick={handleWeightSubmit}
                  disabled={!newWeight}
                  className="px-5 py-3 bg-brand-500 text-white rounded-2xl font-semibold text-sm disabled:opacity-40 active:scale-95 transition"
                >
                  Log
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
                <Lock size={15} className="text-gray-400" />
                Next update window opens Sunday 9:00 AM
              </div>
              <div className="flex gap-2">
                <CountdownBox value={countdown.days}    label="Days" />
                <CountdownBox value={countdown.hours}   label="Hours" />
                <CountdownBox value={countdown.minutes} label="Mins" />
                <CountdownBox value={countdown.seconds} label="Secs" />
              </div>
            </div>
          )}
        </div>

        {/* ── Weight Trend Chart ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-brand-500" />
            </div>
            <h2 className="font-semibold text-gray-800 text-sm">Weight Trend</h2>
          </div>

          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#008080" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#008080" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={goal}
                  stroke="#008080"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                  label={{ value: `Goal ${goal}`, fill: '#008080', fontSize: 11, position: 'insideTopRight' }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#008080"
                  strokeWidth={2.5}
                  dot={{ fill: '#008080', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#008080', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-300 gap-2">
              <TrendingUp size={32} strokeWidth={1.5} />
              <p className="text-sm">Log at least 2 weigh-ins to see trends</p>
            </div>
          )}
        </div>

        {/* ── Goal Progress ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800 text-sm">Goal Progress</h2>
            <span className="text-xs text-brand-500 font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Start · {start} kg</span>
            <span>Goal · {goal} kg</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {delta < 0
              ? `${Math.abs((latest - start).toFixed(1))} kg lost · ${Math.abs((goal - latest).toFixed(1))} kg to go`
              : delta > 0
              ? `${Math.abs((latest - start).toFixed(1))} kg gained · ${Math.abs((goal - latest).toFixed(1))} kg to go`
              : 'Maintaining current weight'}
          </p>
        </div>

        {/* ── Progress Photos Gallery ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center">
              <Camera size={18} className="text-brand-500" />
            </div>
            <h2 className="font-semibold text-gray-800 text-sm">Progress Photos</h2>
            <div className="ml-auto flex items-center gap-2">
              {progressPhotos.length > 0 && (
                <button
                  onClick={() => setShowGallery(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl active:scale-95 transition"
                >
                  <Images size={13} /> Gallery
                </button>
              )}
              <button
                onClick={() => photoRef.current?.click()}
                className="text-xs font-semibold text-brand-500 bg-brand-50 px-3 py-1.5 rounded-xl active:scale-95 transition"
              >
                + Add Photo
              </button>
            </div>
          </div>

          {/* ── Pending preview + save/cancel ── */}
          {pendingPhoto && (
            <div className="mb-4">
              <div className="relative rounded-2xl overflow-hidden mb-3">
                <img src={pendingPhoto} alt="Preview" className="w-full h-52 object-cover" />
                <span className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  Preview
                </span>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setPendingPhoto(null)}
                  className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-500 active:scale-95 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={savePhoto}
                  className="flex-1 py-3 bg-brand-500 text-white rounded-2xl text-sm font-bold shadow-sm active:scale-95 transition"
                >
                  Save to Gallery
                </button>
              </div>
            </div>
          )}

          {/* ── Gallery ── */}
          {progressPhotos.length > 0 ? (
            <div>
              <p className="text-xs text-gray-400 mb-3">
                {progressPhotos.length} photo{progressPhotos.length > 1 ? 's' : ''} saved
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {progressPhotos.map((p, i) => (
                  <div key={i} className="flex-shrink-0 w-36 text-center">
                    <img
                      src={p.url}
                      alt={`Progress ${i + 1}`}
                      className="w-36 h-44 object-cover rounded-2xl shadow-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : !pendingPhoto ? (
            <button
              onClick={() => photoRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-brand-200 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-brand-500 hover:bg-brand-50 transition active:scale-95"
            >
              <Camera size={26} strokeWidth={1.5} />
              <span className="text-sm font-medium">Upload a Progress Photo</span>
              <span className="text-xs text-gray-400">Track your visual transformation</span>
            </button>
          ) : null}

          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
        </div>

        {/* ── Calories overview strip ── */}
        <div className="bg-gradient-to-r from-brand-500 to-teal-500 rounded-3xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={18} className="text-yellow-300" />
            <span className="font-semibold text-sm">Today's Calories</span>
          </div>
          <div className="text-4xl font-extrabold">{todayCal}</div>
          <div className="text-white/70 text-sm mt-0.5">of {userData.macros.calories} kcal goal</div>
          <div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${Math.min((todayCal / userData.macros.calories) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* ── Gallery modal ── */}
    {showGallery && (
      <GalleryModal photos={progressPhotos} onClose={() => setShowGallery(false)} />
    )}

    {/* ── Toast ── */}
    {toast && (
      <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
    )}
    </>
  );
}
