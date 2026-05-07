import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Plus, X, Utensils, ChefHat,
  Loader2, CheckCircle2, Coffee, Sun, Moon,
  Bell, BellOff, BellRing,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import CircularProgress from './CircularProgress';

// ── Mock AI analysis ──────────────────────────────────────────────────────────
const MOCK_MEALS = [
  { name: 'Grilled Chicken & Rice', calories: 540, protein: 48, carbs: 55, fat: 12 },
  { name: 'Salmon with Vegetables', calories: 420, protein: 40, carbs: 18, fat: 22 },
  { name: 'Oatmeal with Berries',   calories: 340, protein: 10, carbs: 60, fat: 7  },
  { name: 'Caesar Salad',           calories: 380, protein: 22, carbs: 20, fat: 26 },
  { name: 'Pasta Bolognese',        calories: 620, protein: 28, carbs: 82, fat: 18 },
  { name: 'Protein Shake',          calories: 260, protein: 36, carbs: 18, fat: 5  },
  { name: 'Avocado Toast',          calories: 360, protein: 10, carbs: 38, fat: 20 },
  { name: 'Greek Yogurt & Granola', calories: 310, protein: 18, carbs: 42, fat: 8  },
  { name: 'Steak & Potato',         calories: 680, protein: 52, carbs: 48, fat: 26 },
  { name: 'Veggie Stir-Fry',        calories: 290, protein: 12, carbs: 44, fat: 9  },
];

const fakeAnalyze = () => MOCK_MEALS[Math.floor(Math.random() * MOCK_MEALS.length)];

// ── Shared config ─────────────────────────────────────────────────────────────
const CATEGORY_CFG = {
  breakfast: { label: 'Breakfast', Icon: Coffee, color: 'text-amber-500',  bg: 'bg-amber-50'  },
  lunch:     { label: 'Lunch',     Icon: Sun,    color: 'text-orange-500', bg: 'bg-orange-50' },
  dinner:    { label: 'Dinner',    Icon: Moon,   color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const DEFAULT_PREFS = {
  breakfast: { enabled: false, time: '08:00' },
  lunch:     { enabled: false, time: '12:30' },
  dinner:    { enabled: false, time: '19:00' },
};

// ── Small reusable pieces ──────────────────────────────────────────────────────
const MacroRing = ({ label, current, goal, color }) => (
  <div className="flex flex-col items-center gap-1.5">
    <CircularProgress percentage={goal > 0 ? (current / goal) * 100 : 0} color={color} size={72} strokeWidth={7}>
      <span className="text-xs font-bold text-gray-700">{Math.max(goal - current, 0)}</span>
    </CircularProgress>
    <span className="text-xs text-gray-500 font-medium">{label}</span>
    <span className="text-[10px] text-gray-400">{current}/{goal}</span>
  </div>
);

const BarTooltip = ({ active, payload, label }) =>
  active && payload?.length ? (
    <div className="bg-white shadow-lg rounded-xl px-3 py-2 text-xs border border-gray-100">
      <p className="text-gray-400">{label}</p>
      <p className="font-bold text-brand-600">{payload[0].value} kcal</p>
    </div>
  ) : null;

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-brand-500' : 'bg-gray-200'
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MealLog({ userData, meals, setMeals }) {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory]  = useState('breakfast');
  const [photo, setPhoto]        = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed]  = useState(null);
  const photoRef = useRef(null);

  // ── Notification state ──
  const [notifPermission, setNotifPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('notifPrefs') || 'null') ?? DEFAULT_PREFS;
    } catch { return DEFAULT_PREFS; }
  });
  // Track which meal was fired today without triggering re-renders
  const lastFiredRef = useRef({});

  const savePrefs = prefs => {
    setNotifPrefs(prefs);
    localStorage.setItem('notifPrefs', JSON.stringify(prefs));
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setNotifPermission(result);
  };

  const toggleNotif = key =>
    savePrefs({ ...notifPrefs, [key]: { ...notifPrefs[key], enabled: !notifPrefs[key].enabled } });

  const updateTime = (key, time) =>
    savePrefs({ ...notifPrefs, [key]: { ...notifPrefs[key], time } });

  // ── Notification polling (every 30 s) ──
  useEffect(() => {
    if (notifPermission !== 'granted') return;
    const check = () => {
      const now   = new Date();
      const hhmm  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const today = now.toDateString();
      Object.entries(notifPrefs).forEach(([key, pref]) => {
        if (!pref.enabled)                         return;
        if (pref.time !== hhmm)                    return;
        if (lastFiredRef.current[key] === today)   return;
        lastFiredRef.current[key] = today;
        const { label } = CATEGORY_CFG[key];
        new Notification(`NutriSync — ${label} time! 📸`, {
          body: `Time to photograph and log your ${label.toLowerCase()}. Keep your streak going!`,
          tag:  `nutrisync-${key}`,
        });
      });
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [notifPermission, notifPrefs]);

  // ── Meal data ──
  const { macros } = userData;
  const todayStr   = new Date().toDateString();
  const todayMeals = meals.filter(m => new Date(m.date).toDateString() === todayStr);

  const totals = todayMeals.reduce(
    (a, m) => ({
      calories: a.calories + m.nutrition.calories,
      protein:  a.protein  + m.nutrition.protein,
      carbs:    a.carbs    + m.nutrition.carbs,
      fat:      a.fat      + m.nutrition.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dStr = d.toDateString();
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: meals.filter(m => new Date(m.date).toDateString() === dStr).reduce((s, m) => s + m.nutrition.calories, 0),
      isToday: dStr === todayStr,
    };
  });

  // ── Handlers ──
  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPhoto(ev.target.result);
      setAnalyzing(true);
      setTimeout(() => { setAnalyzed(fakeAnalyze()); setAnalyzing(false); }, 2200);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!analyzed) return;
    const meal = {
      id: Date.now(), date: new Date().toISOString(), category, photo, name: analyzed.name,
      nutrition: { calories: analyzed.calories, protein: analyzed.protein, carbs: analyzed.carbs, fat: analyzed.fat },
    };
    const next = [...meals, meal];
    setMeals(next);
    const stored = JSON.parse(localStorage.getItem('nutritionApp') || '{}');
    stored.meals = next;
    localStorage.setItem('nutritionApp', JSON.stringify(stored));
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false); setPhoto(null); setAnalyzed(null); setAnalyzing(false); setCategory('breakfast');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pb-28 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500 px-5 pt-14 pb-7 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <h1 className="text-white text-2xl font-bold">Meal Log</h1>
        <p className="text-white/70 text-sm mt-0.5">Track your daily nutrition</p>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ── Daily Macros ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Today's Macros</h2>
            <span className="text-xs text-gray-400">Remaining</span>
          </div>
          <div className="flex justify-around">
            <MacroRing label="Calories" current={totals.calories} goal={macros.calories} color="#008080" />
            <MacroRing label="Protein"  current={totals.protein}  goal={macros.protein}  color="#3b82f6" />
            <MacroRing label="Carbs"    current={totals.carbs}    goal={macros.carbs}    color="#f59e0b" />
            <MacroRing label="Fat"      current={totals.fat}      goal={macros.fat}      color="#ef4444" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Cal',  val: totals.calories, goal: macros.calories },
              { label: 'Pro',  val: totals.protein,  goal: macros.protein },
              { label: 'Carb', val: totals.carbs,    goal: macros.carbs },
              { label: 'Fat',  val: totals.fat,      goal: macros.fat },
            ].map(m => (
              <div key={m.label}>
                <div className="text-xs text-gray-400">{m.label}</div>
                <div className="text-sm font-bold text-gray-700">{m.val}<span className="text-gray-300">/{m.goal}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Weekly Calories Bar Chart ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm mb-4">Weekly Calories</h2>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={weeklyData} barSize={28} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<BarTooltip />} cursor={{ fill: '#f1f5f9', radius: 6 }} />
              <ReferenceLine y={macros.calories} stroke="#008080" strokeDasharray="4 4" strokeOpacity={0.6}
                label={{ value: 'Goal', fill: '#008080', fontSize: 10, position: 'insideTopRight' }} />
              <Bar dataKey="calories" radius={[7, 7, 0, 0]}>
                {weeklyData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.isToday ? '#008080' : '#e2f5f5'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Meal Reminders ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-brand-500" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-800 text-sm">Meal Reminders</h2>
              <p className="text-xs text-gray-400 mt-0.5">Don't forget to photograph your food</p>
            </div>
            {notifPermission === 'granted' && (
              <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span>
            )}
          </div>

          {/* ── Permission denied ── */}
          {notifPermission === 'denied' && (
            <div className="mt-3 bg-red-50 rounded-2xl p-3.5 flex items-start gap-2.5">
              <BellOff size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-600">Notifications blocked</p>
                <p className="text-[11px] text-red-400 mt-0.5 leading-relaxed">
                  Reminders are blocked in your browser. Open browser settings → Site permissions → Notifications to re-enable.
                </p>
              </div>
            </div>
          )}

          {/* ── Permission not yet asked ── */}
          {notifPermission === 'default' && (
            <button
              onClick={requestPermission}
              className="mt-3 w-full py-3 bg-brand-50 text-brand-600 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition hover:bg-brand-100"
            >
              <BellRing size={16} />
              Enable Meal Reminders
            </button>
          )}

          {/* ── Reminders configured ── */}
          {notifPermission === 'granted' && (
            <div className="mt-4 space-y-3">
              {Object.entries(CATEGORY_CFG).map(([key, cfg]) => {
                const { Icon, label, color, bg } = cfg;
                const pref = notifPrefs[key];
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-2xl transition ${pref.enabled ? 'bg-gray-50' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      {pref.enabled && (
                        <p className="text-[11px] text-gray-400 mt-0.5">Daily at {pref.time}</p>
                      )}
                    </div>
                    {pref.enabled && (
                      <input
                        type="time"
                        value={pref.time}
                        onChange={e => updateTime(key, e.target.value)}
                        className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700
                                   focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white w-[90px]"
                      />
                    )}
                    <Toggle checked={pref.enabled} onChange={() => toggleNotif(key)} />
                  </div>
                );
              })}
              <p className="text-[10px] text-gray-300 text-center pt-1">
                Reminders only fire while this app is open in your browser
              </p>
            </div>
          )}
        </div>

        {/* ── Today's Meals List ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Today's Meals</h2>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold active:scale-95 transition"
            >
              <Plus size={14} /> Log Meal
            </button>
          </div>

          {Object.entries(CATEGORY_CFG).map(([key, cfg]) => {
            const { Icon, label, color, bg } = cfg;
            const catMeals = todayMeals.filter(m => m.category === key);
            return (
              <div key={key} className="mb-4 last:mb-0">
                <div className={`flex items-center gap-2 mb-2 ${color}`}>
                  <Icon size={14} />
                  <span className="text-xs font-semibold">{label}</span>
                  {catMeals.length > 0 && (
                    <span className="ml-auto text-xs text-gray-400">
                      {catMeals.reduce((s, m) => s + m.nutrition.calories, 0)} kcal
                    </span>
                  )}
                </div>
                {catMeals.length === 0 ? (
                  <div className="border border-dashed border-gray-100 rounded-2xl py-3 text-center text-xs text-gray-300">
                    Nothing logged yet
                  </div>
                ) : (
                  catMeals.map(meal => (
                    <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-2 last:mb-0">
                      {meal.photo ? (
                        <img src={meal.photo} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
                          <Utensils size={18} className={color} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{meal.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {meal.nutrition.calories} kcal · {meal.nutrition.protein}g protein · {meal.nutrition.carbs}g carbs
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Add Meal Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white w-full rounded-t-3xl max-h-[88vh] overflow-y-auto no-scrollbar shadow-2xl">
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-50 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-800">Log a Meal</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Category picker */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_CFG).map(([key, cfg]) => {
                    const { Icon, label } = cfg;
                    return (
                      <button key={key} onClick={() => setCategory(key)}
                        className={`py-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition text-xs font-semibold ${
                          category === key ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:border-brand-300'
                        }`}
                      >
                        <Icon size={18} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo area */}
              {!photo ? (
                <button onClick={() => photoRef.current?.click()}
                  className="w-full h-44 border-2 border-dashed border-brand-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-brand-500 hover:bg-brand-50 transition"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center">
                    <Camera size={26} className="text-brand-500" />
                  </div>
                  <div className="text-sm font-semibold">Take or Upload a Photo</div>
                  <div className="text-xs text-gray-400">Our AI will analyse your meal</div>
                </button>
              ) : (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={photo} alt="Meal" className="w-full h-44 object-cover" />
                  {!analyzing && !analyzed && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 size={32} className="text-white animate-spin" />
                    </div>
                  )}
                </div>
              )}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />

              {analyzing && (
                <div className="bg-brand-50 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <ChefHat size={20} className="text-brand-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-brand-700">Analysing your meal…</div>
                    <div className="text-xs text-brand-400 mt-0.5">AI is estimating nutritional content</div>
                  </div>
                  <Loader2 size={18} className="text-brand-400 animate-spin flex-shrink-0" />
                </div>
              )}

              {analyzed && !analyzing && (
                <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span className="font-semibold text-gray-800 text-sm">{analyzed.name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Cal',  value: analyzed.calories, color: 'bg-teal-50 text-teal-700' },
                      { label: 'Pro',  value: analyzed.protein,  color: 'bg-blue-50 text-blue-700' },
                      { label: 'Carb', value: analyzed.carbs,    color: 'bg-amber-50 text-amber-700' },
                      { label: 'Fat',  value: analyzed.fat,      color: 'bg-rose-50 text-rose-700' },
                    ].map(m => (
                      <div key={m.label} className={`${m.color} rounded-xl p-2 text-center`}>
                        <div className="text-base font-bold">{m.value}</div>
                        <div className="text-[10px] opacity-70">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleAdd}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-teal-500 text-white rounded-2xl font-bold text-sm active:scale-95 transition shadow-md shadow-brand-200"
                  >
                    Add to Log
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
