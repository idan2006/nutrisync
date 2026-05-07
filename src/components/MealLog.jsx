import React, { useState, useRef, useEffect } from 'react';
import {
  Camera, Plus, X, Utensils, ChefHat, Search,
  Loader2, CheckCircle2, Coffee, Sun, Moon,
  Bell, BellOff, BellRing, Edit3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import CircularProgress from './CircularProgress';
import { searchFood, calcNutrition } from '../utils/foodDatabase';

// ── Shared config ─────────────────────────────────────────────────────────────
const CATEGORY_CFG = {
  breakfast: { label: 'Breakfast', Icon: Coffee, color: 'text-amber-500',  bg: 'bg-amber-50'  },
  lunch:     { label: 'Lunch',     Icon: Sun,    color: 'text-orange-500', bg: 'bg-orange-50' },
  dinner:    { label: 'Dinner',    Icon: Moon,   color: 'text-indigo-500', bg: 'bg-indigo-50' },
};

const DEFAULT_NOTIF_PREFS = {
  breakfast: { enabled: false, time: '08:00' },
  lunch:     { enabled: false, time: '12:30' },
  dinner:    { enabled: false, time: '19:00' },
};

const GRAM_PRESETS = [50, 100, 150, 200, 300];

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
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-brand-500' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function NutritionField({ label, value, onChange, color }) {
  return (
    <div className={`${color} rounded-2xl p-3 text-center`}>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-transparent text-center text-lg font-bold focus:outline-none"
        min="0"
      />
      <div className="text-[10px] opacity-70 mt-0.5">{label}</div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MealLog({ userData, meals, setMeals, onModalToggle }) {
  // ── Modal state ──
  const [showModal, setShowModal]     = useState(false);
  const [category, setCategory]       = useState('breakfast');
  const [photo, setPhoto]             = useState(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);

  // ── Food search state ──
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [grams, setGrams]             = useState('');
  const [nutrition, setNutrition]     = useState({ calories: '', protein: '', carbs: '', fat: '' });

  const photoRef = useRef(null);
  const searchRef = useRef(null);

  // ── Notification state ──
  const [notifPermission, setNotifPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [notifPrefs, setNotifPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notifPrefs') || 'null') ?? DEFAULT_NOTIF_PREFS; }
    catch { return DEFAULT_NOTIF_PREFS; }
  });
  const lastFiredRef = useRef({});

  const savePrefs = prefs => { setNotifPrefs(prefs); localStorage.setItem('notifPrefs', JSON.stringify(prefs)); };
  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    setNotifPermission(await Notification.requestPermission());
  };
  const toggleNotif = key => savePrefs({ ...notifPrefs, [key]: { ...notifPrefs[key], enabled: !notifPrefs[key].enabled } });
  const updateTime  = (key, time) => savePrefs({ ...notifPrefs, [key]: { ...notifPrefs[key], time } });

  useEffect(() => {
    if (notifPermission !== 'granted') return;
    const check = () => {
      const now   = new Date();
      const hhmm  = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const today = now.toDateString();
      Object.entries(notifPrefs).forEach(([key, pref]) => {
        if (!pref.enabled || pref.time !== hhmm || lastFiredRef.current[key] === today) return;
        lastFiredRef.current[key] = today;
        new Notification(`NutriSync — ${CATEGORY_CFG[key].label} time! 📸`, {
          body: `Time to photograph and log your ${CATEGORY_CFG[key].label.toLowerCase()}. Keep your streak going!`,
          tag:  `nutrisync-${key}`,
        });
      });
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [notifPermission, notifPrefs]);

  // ── Modal open/close (also controls nav visibility) ──
  const openModal = () => {
    setShowModal(true);
    onModalToggle?.(true);
  };
  const closeModal = () => {
    setShowModal(false);
    onModalToggle?.(false);
    // reset all modal state
    setCategory('breakfast');
    setPhoto(null);
    setPhotoAnalyzing(false);
    setQuery('');
    setSuggestions([]);
    setSelectedFood(null);
    setGrams('');
    setNutrition({ calories: '', protein: '', carbs: '', fat: '' });
  };

  // ── Food search ──
  const handleQueryChange = val => {
    setQuery(val);
    setSuggestions(val.trim().length >= 2 ? searchFood(val) : []);
    // clear selection if user edits
    if (selectedFood) { setSelectedFood(null); setNutrition({ calories: '', protein: '', carbs: '', fat: '' }); }
  };

  const selectFood = food => {
    setSelectedFood(food);
    setQuery(food.name);
    setSuggestions([]);
    const g = food.dflt;
    setGrams(String(g));
    const n = calcNutrition(food, g);
    setNutrition({ calories: String(n.calories), protein: String(n.protein), carbs: String(n.carbs), fat: String(n.fat) });
    setTimeout(() => searchRef.current?.blur(), 50);
  };

  const handleGramsChange = val => {
    setGrams(val);
    if (selectedFood && val) {
      const n = calcNutrition(selectedFood, parseFloat(val));
      setNutrition({ calories: String(n.calories), protein: String(n.protein), carbs: String(n.carbs), fat: String(n.fat) });
    }
  };

  // ── Photo upload (photo is visual only; user still identifies the food via search) ──
  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setPhoto(ev.target.result);
      setPhotoAnalyzing(true);
      // Simulate a brief scan, then prompt user to confirm the food name
      setTimeout(() => setPhotoAnalyzing(false), 1800);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const canAdd = nutrition.calories !== '' && nutrition.protein !== '' &&
                 nutrition.carbs !== ''    && nutrition.fat !== '' &&
                 (query.trim().length > 0);

  const handleAdd = () => {
    if (!canAdd) return;
    const meal = {
      id:       Date.now(),
      date:     new Date().toISOString(),
      category,
      photo,
      name:     query.trim(),
      nutrition: {
        calories: parseInt(nutrition.calories) || 0,
        protein:  parseInt(nutrition.protein)  || 0,
        carbs:    parseInt(nutrition.carbs)    || 0,
        fat:      parseInt(nutrition.fat)      || 0,
      },
    };
    const next = [...meals, meal];
    setMeals(next);
    const stored = JSON.parse(localStorage.getItem('nutritionApp') || '{}');
    stored.meals = next;
    localStorage.setItem('nutritionApp', JSON.stringify(stored));
    closeModal();
  };

  // ── Derived data ──
  const { macros } = userData;
  const todayStr   = new Date().toDateString();
  const todayMeals = meals.filter(m => new Date(m.date).toDateString() === todayStr);
  const totals     = todayMeals.reduce(
    (a, m) => ({ calories: a.calories + m.nutrition.calories, protein: a.protein + m.nutrition.protein,
                 carbs: a.carbs + m.nutrition.carbs, fat: a.fat + m.nutrition.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dStr = d.toDateString();
    return {
      day:     d.toLocaleDateString('en-US', { weekday: 'short' }),
      calories: meals.filter(m => new Date(m.date).toDateString() === dStr).reduce((s, m) => s + m.nutrition.calories, 0),
      isToday: dStr === todayStr,
    };
  });

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

        {/* ── Weekly Calories ── */}
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
              <p className="text-xs text-gray-400 mt-0.5">Don't forget to log your meals</p>
            </div>
            {notifPermission === 'granted' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">Active</span>}
          </div>

          {notifPermission === 'denied' && (
            <div className="mt-3 bg-red-50 rounded-2xl p-3.5 flex items-start gap-2.5">
              <BellOff size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-500 leading-relaxed">Notifications are blocked. Enable them in your browser settings → Site permissions → Notifications.</p>
            </div>
          )}
          {notifPermission === 'default' && (
            <button onClick={requestPermission}
              className="mt-3 w-full py-3 bg-brand-50 text-brand-600 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition">
              <BellRing size={16} /> Enable Meal Reminders
            </button>
          )}
          {notifPermission === 'granted' && (
            <div className="mt-4 space-y-3">
              {Object.entries(CATEGORY_CFG).map(([key, cfg]) => {
                const { Icon, label, color, bg } = cfg;
                const pref = notifPrefs[key];
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-2xl transition ${pref.enabled ? 'bg-gray-50' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}><Icon size={16} className={color} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      {pref.enabled && <p className="text-[11px] text-gray-400 mt-0.5">Daily at {pref.time}</p>}
                    </div>
                    {pref.enabled && (
                      <input type="time" value={pref.time} onChange={e => updateTime(key, e.target.value)}
                        className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white w-[90px]" />
                    )}
                    <Toggle checked={pref.enabled} onChange={() => toggleNotif(key)} />
                  </div>
                );
              })}
              <p className="text-[10px] text-gray-300 text-center pt-1">Reminders only fire while this app is open</p>
            </div>
          )}
        </div>

        {/* ── Today's Meals List ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 text-sm">Today's Meals</h2>
            <button onClick={openModal}
              className="flex items-center gap-1.5 bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold active:scale-95 transition">
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
                    <span className="ml-auto text-xs text-gray-400">{catMeals.reduce((s, m) => s + m.nutrition.calories, 0)} kcal</span>
                  )}
                </div>
                {catMeals.length === 0 ? (
                  <div className="border border-dashed border-gray-100 rounded-2xl py-3 text-center text-xs text-gray-300">Nothing logged yet</div>
                ) : (
                  catMeals.map(meal => (
                    <div key={meal.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-2 last:mb-0">
                      {meal.photo
                        ? <img src={meal.photo} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        : <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}><Utensils size={18} className={color} /></div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{meal.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {meal.nutrition.calories} kcal · {meal.nutrition.protein}g P · {meal.nutrition.carbs}g C · {meal.nutrition.fat}g F
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

      {/* ── Log Meal Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end"
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white w-full rounded-t-3xl max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">

            {/* Modal header */}
            <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-50 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-gray-800">Log a Meal</h2>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-5 pb-8">
              {/* ── Category ── */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Meal</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(CATEGORY_CFG).map(([key, { label, Icon }]) => (
                    <button key={key} onClick={() => setCategory(key)}
                      className={`py-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition text-xs font-semibold ${
                        category === key ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-400 hover:border-brand-300'
                      }`}>
                      <Icon size={18} />{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Food search ── */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                  What did you eat?
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={query}
                    onChange={e => handleQueryChange(e.target.value)}
                    placeholder="e.g. chicken breast, pasta, banana…"
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-2xl text-sm text-gray-800
                               focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
                  />
                </div>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <div className="mt-1 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
                    {suggestions.map((food, idx) => (
                      <button key={idx} onMouseDown={() => selectFood(food)}
                        className="w-full px-4 py-3 text-left hover:bg-brand-50 transition flex items-center justify-between border-b border-gray-50 last:border-0">
                        <span className="text-sm font-medium text-gray-700">{food.name}</span>
                        <span className="text-xs text-gray-400">{food.cal} kcal/100g</span>
                      </button>
                    ))}
                  </div>
                )}

                {query.trim().length >= 2 && suggestions.length === 0 && !selectedFood && (
                  <p className="text-xs text-gray-400 mt-2 px-1">No matches — type the food name and enter values manually below.</p>
                )}
              </div>

              {/* ── Serving size (shows after food selected or after typing) ── */}
              {(selectedFood || query.trim().length > 0) && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">Serving Size</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={grams}
                      onChange={e => handleGramsChange(e.target.value)}
                      placeholder="grams"
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <span className="text-sm text-gray-400 font-medium">g</span>
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {GRAM_PRESETS.map(g => (
                      <button key={g} onClick={() => handleGramsChange(String(g))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          grams === String(g) ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}>
                        {g}g
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Nutrition fields (auto-filled + editable) ── */}
              {(selectedFood || query.trim().length > 0) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Nutrition</label>
                    <Edit3 size={12} className="text-gray-300" />
                    <span className="text-[10px] text-gray-300">tap values to edit</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <NutritionField label="Calories"  value={nutrition.calories} onChange={v => setNutrition(n => ({ ...n, calories: v }))} color="bg-teal-50 text-teal-700" />
                    <NutritionField label="Protein g" value={nutrition.protein}  onChange={v => setNutrition(n => ({ ...n, protein:  v }))} color="bg-blue-50 text-blue-700" />
                    <NutritionField label="Carbs g"   value={nutrition.carbs}    onChange={v => setNutrition(n => ({ ...n, carbs:   v }))} color="bg-amber-50 text-amber-700" />
                    <NutritionField label="Fat g"     value={nutrition.fat}      onChange={v => setNutrition(n => ({ ...n, fat:     v }))} color="bg-rose-50 text-rose-700" />
                  </div>
                </div>
              )}

              {/* ── Optional photo ── */}
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 block">
                  Photo <span className="normal-case font-normal text-gray-300">(optional)</span>
                </label>
                {!photo ? (
                  <button onClick={() => photoRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-50 transition">
                    <Camera size={22} strokeWidth={1.5} />
                    <span className="text-xs">Add a food photo</span>
                  </button>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden">
                    <img src={photo} alt="Meal" className="w-full h-32 object-cover" />
                    {photoAnalyzing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                        <Loader2 size={20} className="text-white animate-spin" />
                        <span className="text-white text-xs font-medium">Processing…</span>
                      </div>
                    )}
                    <button onClick={() => setPhoto(null)}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                )}
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </div>

              {/* ── Add to Log ── */}
              <button
                onClick={handleAdd}
                disabled={!canAdd}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition ${
                  canAdd
                    ? 'bg-gradient-to-r from-brand-500 to-teal-500 text-white shadow-md shadow-brand-200 active:scale-95'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {canAdd ? <span className="flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Add to Log</span> : 'Search for a food above to continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
