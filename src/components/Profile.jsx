import React, { useState } from 'react';
import {
  User, Flame, Beef, Wheat, Droplets,
  Activity, Scale, Ruler, Target,
  RotateCcw, ChevronRight, AlertTriangle,
} from 'lucide-react';

const ACTIVITY_LABEL = {
  sedentary:         'Sedentary',
  lightly_active:    'Lightly Active',
  moderately_active: 'Moderately Active',
  very_active:       'Very Active',
  extra_active:      'Extra Active',
};

function StatCard({ icon: Icon, label, value, bg, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-bold text-gray-800 text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MacroRow({ icon: Icon, label, value, unit, bg, color }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
        <Icon size={16} className={color} />
      </div>
      <span className="flex-1 text-gray-700 text-sm">{label}</span>
      <span className="font-bold text-gray-800 text-sm">{value} <span className="font-normal text-gray-400">{unit}</span></span>
    </div>
  );
}

export default function Profile({ userData, onReset }) {
  const { name, age, gender, height, currentWeight, goalWeight, activityLevel, macros } = userData;
  const [confirmReset, setConfirmReset] = useState(false);

  const goalType =
    parseFloat(goalWeight) < parseFloat(currentWeight) ? 'Weight Loss' :
    parseFloat(goalWeight) > parseFloat(currentWeight) ? 'Weight Gain' : 'Maintenance';

  const goalColors = {
    'Weight Loss':  { bg: 'bg-rose-100',  text: 'text-rose-600'  },
    'Weight Gain':  { bg: 'bg-green-100', text: 'text-green-600' },
    'Maintenance':  { bg: 'bg-blue-100',  text: 'text-blue-600'  },
  };

  const bmi = (parseFloat(currentWeight) / ((parseFloat(height) / 100) ** 2)).toFixed(1);
  const bmiLabel =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25   ? 'Normal'      :
    bmi < 30   ? 'Overweight'  : 'Obese';

  return (
    <div className="pb-28 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-teal-500 px-5 pt-14 pb-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <User size={30} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{name || 'My Profile'}</h1>
            <p className="text-white/70 text-sm mt-0.5 capitalize">{gender === 'male' ? '♂' : '♀'} {gender} · {age} yrs</p>
            <span className={`mt-1.5 inline-block text-xs px-2.5 py-0.5 rounded-full font-medium ${goalColors[goalType].bg} ${goalColors[goalType].text}`}>
              {goalType}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* ── Physical Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Ruler}  label="Height"        value={`${height} cm`}         bg="bg-purple-50" color="text-purple-500" />
          <StatCard icon={Scale}  label="Current Weight" value={`${currentWeight} kg`} bg="bg-brand-50"  color="text-brand-500" />
          <StatCard icon={Target} label="Goal Weight"   value={`${goalWeight} kg`}     bg="bg-green-50"  color="text-green-500" />
          <StatCard icon={Activity} label="Activity"    value={ACTIVITY_LABEL[activityLevel]} bg="bg-orange-50" color="text-orange-500" />
        </div>

        {/* ── BMI Card ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Body Mass Index</p>
              <p className="text-3xl font-extrabold text-gray-800 mt-1">{bmi}</p>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-sm font-semibold ${
              bmiLabel === 'Normal' ? 'bg-green-50 text-green-600' :
              bmiLabel === 'Underweight' ? 'bg-blue-50 text-blue-600' :
              'bg-amber-50 text-amber-600'
            }`}>
              {bmiLabel}
            </div>
          </div>
          {/* BMI scale */}
          <div className="mt-4">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div className="flex-1 bg-blue-200" />
              <div className="flex-1 bg-green-300" />
              <div className="flex-1 bg-yellow-300" />
              <div className="flex-1 bg-red-300" />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-0.5">
              <span>&lt;18.5</span><span>18.5–25</span><span>25–30</span><span>&gt;30</span>
            </div>
          </div>
        </div>

        {/* ── Daily Nutrition Goals ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm mb-1">Daily Nutrition Goals</h2>
          <p className="text-xs text-gray-400 mb-4">Based on Mifflin-St Jeor equation</p>
          <MacroRow icon={Flame}    label="Calories"      value={macros.calories} unit="kcal" bg="bg-orange-50"  color="text-orange-500" />
          <MacroRow icon={Beef}     label="Protein"       value={macros.protein}  unit="g"    bg="bg-blue-50"    color="text-blue-500" />
          <MacroRow icon={Wheat}    label="Carbohydrates" value={macros.carbs}    unit="g"    bg="bg-amber-50"   color="text-amber-500" />
          <MacroRow icon={Droplets} label="Fat"           value={macros.fat}      unit="g"    bg="bg-rose-50"    color="text-rose-500" />
        </div>

        {/* ── Metabolic Info ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-800 text-sm mb-3">Metabolic Profile</h2>
          {[
            ['Basal Metabolic Rate (BMR)',  `${macros.bmr} kcal`],
            ['Total Daily Energy (TDEE)',   `${macros.tdee} kcal`],
            ['Calorie Adjustment',          macros.calories < macros.tdee
              ? `−${macros.tdee - macros.calories} kcal (deficit)`
              : macros.calories > macros.tdee
              ? `+${macros.calories - macros.tdee} kcal (surplus)`
              : 'Maintenance'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="font-semibold text-gray-800 text-sm">{value}</span>
            </div>
          ))}
        </div>

        {/* ── Reset ── */}
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="w-full py-4 border-2 border-red-200 text-red-400 rounded-3xl font-semibold flex items-center justify-center gap-2 text-sm hover:bg-red-50 transition active:scale-95"
          >
            <RotateCcw size={16} />
            Reset All Data & Restart
          </button>
        ) : (
          <div className="bg-red-50 rounded-3xl p-5 border-2 border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              <span className="font-semibold text-sm">This will delete all your data</span>
            </div>
            <p className="text-xs text-red-400">Your weight history, meals, and profile will be permanently removed. This cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-3 border border-gray-200 rounded-2xl text-sm font-medium text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={onReset}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-sm font-bold"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-300 pb-2">NutriSync v1.0</div>
      </div>
    </div>
  );
}
