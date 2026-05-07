import React, { useState } from 'react';
import {
  ChevronRight, ChevronLeft, CheckCircle2,
  User, Ruler, Target, Zap, Sparkles,
} from 'lucide-react';
import { calculateMacros } from '../utils/calculations';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',         label: 'Sedentary',          desc: 'Desk job, little movement' },
  { value: 'lightly_active',    label: 'Lightly Active',     desc: 'Light exercise 1–3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active',  desc: 'Moderate exercise 3–5 days/week' },
  { value: 'very_active',       label: 'Very Active',        desc: 'Hard exercise 6–7 days/week' },
  { value: 'extra_active',      label: 'Extra Active',       desc: 'Physical job + daily training' },
];

const STEPS = [
  { id: 1, title: 'About You',       subtitle: 'Name, age & gender',           Icon: User },
  { id: 2, title: 'Your Body',       subtitle: 'Height & current weight',      Icon: Ruler },
  { id: 3, title: 'Your Goal',       subtitle: 'Target & activity level',      Icon: Target },
  { id: 4, title: 'Your Plan',       subtitle: 'Personalised macros are ready', Icon: Sparkles },
];

function InputField({ label, type = 'number', value, onChange, placeholder, suffix }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min="0"
          className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-gray-800 text-base
                     focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent
                     bg-white placeholder-gray-300 transition"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', age: '', gender: '', height: '',
    currentWeight: '', goalWeight: '', activityLevel: '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const valid = () => {
    if (step === 1) return form.name.trim() && form.age && form.gender;
    if (step === 2) return form.height && form.currentWeight;
    if (step === 3) return form.goalWeight && form.activityLevel;
    return true;
  };

  const macros = step === 4 ? calculateMacros(form) : null;

  const goalLabel =
    form.goalWeight && form.currentWeight
      ? parseFloat(form.goalWeight) < parseFloat(form.currentWeight)
        ? '🎯 Weight Loss'
        : parseFloat(form.goalWeight) > parseFloat(form.currentWeight)
        ? '💪 Weight Gain'
        : '⚖️ Maintenance'
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-500 to-teal-600 flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden relative">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-brand-500 to-teal-600 px-6 pt-8 pb-6 text-white">
          {/* App name */}
          <div className="flex items-center gap-2 mb-5">
            <Zap size={18} className="text-yellow-300" />
            <span className="text-sm font-semibold tracking-wide opacity-90">NutriSync</span>
          </div>

          {/* Step info */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{STEPS[step - 1].title}</h1>
              <p className="text-white/70 text-sm mt-0.5">{STEPS[step - 1].subtitle}</p>
            </div>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition mt-0.5"
              >
                <ChevronLeft size={18} />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5 mt-5">
            {STEPS.map(s => (
              <div
                key={s.id}
                className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                  s.id <= step ? 'bg-white' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-4 page-enter">

          {/* Step 1 */}
          {step === 1 && (
            <>
              <InputField label="First Name" type="text" value={form.name} onChange={v => set('name', v)} placeholder="e.g. Alex" />
              <InputField label="Age" value={form.age} onChange={v => set('age', v)} placeholder="25" suffix="yrs" />
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Biological Gender</label>
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map(g => (
                    <button
                      key={g}
                      onClick={() => set('gender', g)}
                      className={`py-3.5 rounded-2xl border-2 font-semibold capitalize transition text-sm ${
                        form.gender === g
                          ? 'border-brand-500 bg-brand-50 text-brand-600'
                          : 'border-gray-200 text-gray-500 hover:border-brand-300'
                      }`}
                    >
                      {g === 'male' ? '♂ Male' : '♀ Female'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <>
              <InputField label="Height" value={form.height} onChange={v => set('height', v)} placeholder="175" suffix="cm" />
              <InputField label="Current Weight" value={form.currentWeight} onChange={v => set('currentWeight', v)} placeholder="75.0" suffix="kg" />
            </>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              <InputField label="Goal Weight" value={form.goalWeight} onChange={v => set('goalWeight', v)} placeholder="70.0" suffix="kg" />
              {goalLabel && (
                <div className="text-center text-sm font-medium text-brand-600 bg-brand-50 rounded-xl py-2">
                  {goalLabel}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Activity Level</label>
                <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => set('activityLevel', opt.value)}
                      className={`w-full px-4 py-3 rounded-2xl border-2 text-left transition ${
                        form.activityLevel === opt.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-brand-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-800 text-sm">{opt.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 4 — Summary */}
          {step === 4 && macros && (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-500">
                Here's your personalised plan,{' '}
                <span className="font-semibold text-brand-600">{form.name}</span>!
              </p>

              {/* Calorie card */}
              <div className="bg-gradient-to-r from-brand-500 to-teal-500 rounded-2xl p-5 text-white text-center shadow-lg shadow-brand-200">
                <div className="text-5xl font-extrabold tracking-tight">{macros.calories}</div>
                <div className="text-white/80 text-sm mt-1 font-medium">Daily Calories</div>
              </div>

              {/* Macro chips */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Protein', value: macros.protein, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Carbs',   value: macros.carbs,   color: 'bg-amber-50 text-amber-600' },
                  { label: 'Fat',     value: macros.fat,     color: 'bg-rose-50 text-rose-600' },
                ].map(m => (
                  <div key={m.label} className={`${m.color} rounded-2xl p-3 text-center`}>
                    <div className="text-2xl font-bold">{m.value}</div>
                    <div className="text-xs opacity-70 mt-0.5">{m.label} (g)</div>
                  </div>
                ))}
              </div>

              {/* Meta info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
                {[['BMR', macros.bmr], ['TDEE', macros.tdee]].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-semibold text-gray-700">{v} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <button
            disabled={!valid()}
            onClick={() =>
              step < 4
                ? setStep(s => s + 1)
                : onComplete({ ...form, macros: calculateMacros(form) })
            }
            className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition
              ${valid()
                ? 'bg-gradient-to-r from-brand-500 to-teal-500 shadow-lg shadow-brand-200 hover:shadow-xl active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            {step === 4 ? (
              <><CheckCircle2 size={20} /> Start Tracking</>
            ) : (
              <>Continue <ChevronRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
