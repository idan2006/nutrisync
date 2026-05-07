/** Mifflin-St Jeor BMR → TDEE → target calories → macros */
export function calculateMacros(userData) {
  const weight = parseFloat(userData.currentWeight);
  const height = parseFloat(userData.height);
  const age    = parseInt(userData.age, 10);
  const goal   = parseFloat(userData.goalWeight);

  // BMR
  const bmr =
    userData.gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMap = {
    sedentary:         1.2,
    lightly_active:    1.375,
    moderately_active: 1.55,
    very_active:       1.725,
    extra_active:      1.9,
  };

  const tdee = bmr * (activityMap[userData.activityLevel] ?? 1.2);

  // Calorie target
  let targetCal;
  if (goal < weight)      targetCal = tdee - 500;   // loss
  else if (goal > weight) targetCal = tdee + 300;   // gain
  else                    targetCal = tdee;          // maintain

  targetCal = Math.max(Math.round(targetCal), 1200);

  // Macros: protein 2 g/kg (capped at 35 %), fat 25 %, rest → carbs
  const maxProteinCal = targetCal * 0.35;
  const proteinG = Math.min(Math.round(weight * 2), Math.round(maxProteinCal / 4));
  const fatG     = Math.round((targetCal * 0.25) / 9);
  const carbsCal = targetCal - proteinG * 4 - fatG * 9;
  const carbsG   = Math.max(Math.round(carbsCal / 4), 0);

  return {
    calories: targetCal,
    protein:  proteinG,
    fat:      fatG,
    carbs:    carbsG,
    bmr:      Math.round(bmr),
    tdee:     Math.round(tdee),
  };
}

/** Returns the Date of the next Sunday 09:00 local time (or today if it's Sunday < 09:00) */
export function getNextWeightUpdateTime() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const next = new Date(now);

  if (day === 0 && now.getHours() < 9) {
    // Today is Sunday, before 9 AM — open window is today at 09:00
    next.setHours(9, 0, 0, 0);
  } else {
    // Advance to next Sunday
    const daysAhead = day === 0 ? 7 : 7 - day;
    next.setDate(next.getDate() + daysAhead);
    next.setHours(9, 0, 0, 0);
  }
  return next;
}

/** True when the weight-update gate is open */
export function canUpdateWeight(lastWeightUpdate) {
  const now = new Date();
  if (now.getDay() !== 0 || now.getHours() < 9) return false;
  if (!lastWeightUpdate) return true;
  // Gate closes once the user has already logged today
  return new Date(lastWeightUpdate).toDateString() !== now.toDateString();
}

/** Format a ms countdown into { days, hours, minutes, seconds } */
export function msToCountdown(ms) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSec = Math.floor(ms / 1000);
  return {
    days:    Math.floor(totalSec / 86400),
    hours:   Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}
