import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Cell,
} from "recharts";
import {
  Camera, Plus, Trash2, X, Flame, Settings, ChevronRight, ChevronLeft,
  TrendingUp, Check, Loader2, Sparkles, Utensils, Target, CalendarDays, Pencil,
} from "lucide-react";

/* ---------- theme ---------- */
const C = {
  bg: "#F5F3ED",
  surface: "#FFFFFF",
  ink: "#17160F",
  muted: "#928F84",
  line: "#ECE9E0",
  track: "#EDEAE1",
  cal: "#17A34A",
  pro: "#FF5D5D",
  carb: "#FF9F1C",
  fat: "#5B7CFA",
};
const HEAD = { fontFamily: "'Rubik', system-ui, sans-serif" };
const STORE_KEY = "calscan-data-v1";
const DEFAULT_DATA = {
  goals: { calories: 2000, protein: 150, carbs: 220, fat: 65 },
  profile: null,
  days: {},
};

/* ---------- helpers ---------- */
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const HEB_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const HEB_MONTHS = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יוני", "יולי", "אוג", "ספט", "אוק", "נוב", "דצמ"];
const n = (v) => Math.max(0, Math.round(Number(v) || 0));
const r1 = (v) => Math.round((Number(v) || 0) * 10) / 10;
const fmt = (v) => String(r1(v));
const sameDay = (a, b) => ymd(a) === ymd(b);

/* ---------- food database (values per 100g, approximate) ---------- */
const FOOD_DB = [
  { name: "קוטג' 5%", per100: { cal: 95, p: 11, c: 4, f: 5 }, portions: [{ label: "גביע שלם", g: 250 }, { label: "100 גרם", g: 100 }] },
  { name: "קוטג' 3%", per100: { cal: 84, p: 11, c: 4, f: 3 }, portions: [{ label: "גביע שלם", g: 250 }, { label: "100 גרם", g: 100 }] },
  { name: "גבינה לבנה 5%", per100: { cal: 105, p: 11, c: 4, f: 5 }, portions: [{ label: "מנה", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "גבינה צהובה 28%", per100: { cal: 350, p: 25, c: 1, f: 27 }, portions: [{ label: "פרוסה", g: 25 }, { label: "100 גרם", g: 100 }] },
  { name: "יוגורט טבעי 3%", per100: { cal: 61, p: 3.5, c: 4.7, f: 3 }, portions: [{ label: "גביע", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "יוגורט יווני 0%", per100: { cal: 59, p: 10, c: 3.6, f: 0 }, portions: [{ label: "גביע", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "חלב 3%", per100: { cal: 60, p: 3.3, c: 4.7, f: 3 }, portions: [{ label: "כוס", g: 200 }, { label: "100 מ״ל", g: 100 }] },
  { name: "חלב 1%", per100: { cal: 42, p: 3.4, c: 5, f: 1 }, portions: [{ label: "כוס", g: 200 }, { label: "100 מ״ל", g: 100 }] },
  { name: "ביצה", per100: { cal: 143, p: 12.6, c: 0.7, f: 9.5 }, portions: [{ label: "S", g: 45 }, { label: "M", g: 55 }, { label: "L", g: 65 }] },
  { name: "ביצה חלבון", per100: { cal: 52, p: 11, c: 0.7, f: 0.2 }, portions: [{ label: "חלבון אחד", g: 33 }] },
  { name: "ביצה חלמון", per100: { cal: 322, p: 16, c: 3.6, f: 27 }, portions: [{ label: "חלמון אחד", g: 17 }] },
  { name: "לחם לבן", per100: { cal: 265, p: 9, c: 49, f: 3.2 }, portions: [{ label: "פרוסה", g: 28 }, { label: "100 גרם", g: 100 }] },
  { name: "לחם מלא", per100: { cal: 247, p: 13, c: 41, f: 3.4 }, portions: [{ label: "פרוסה", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "פיתה", per100: { cal: 275, p: 9, c: 55, f: 1.2 }, portions: [{ label: "פיתה", g: 60 }, { label: "100 גרם", g: 100 }] },
  { name: "אורז לבן מבושל", per100: { cal: 130, p: 2.7, c: 28, f: 0.3 }, portions: [{ label: "מנה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "אורז מלא מבושל", per100: { cal: 112, p: 2.6, c: 24, f: 0.9 }, portions: [{ label: "מנה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "פסטה מבושלת", per100: { cal: 131, p: 5, c: 25, f: 1.1 }, portions: [{ label: "צלחת", g: 200 }, { label: "100 גרם", g: 100 }] },
  { name: "קינואה מבושלת", per100: { cal: 120, p: 4.4, c: 21, f: 1.9 }, portions: [{ label: "מנה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "תפוח אדמה מבושל", per100: { cal: 87, p: 1.9, c: 20, f: 0.1 }, portions: [{ label: "בינוני", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "בטטה אפויה", per100: { cal: 90, p: 2, c: 21, f: 0.1 }, portions: [{ label: "בינונית", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "שיבולת שועל (יבש)", per100: { cal: 389, p: 17, c: 66, f: 7 }, portions: [{ label: "מנה", g: 40 }, { label: "100 גרם", g: 100 }] },
  { name: "קורנפלקס", per100: { cal: 357, p: 7, c: 84, f: 0.4 }, portions: [{ label: "מנה", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "חזה עוף צלוי", per100: { cal: 165, p: 31, c: 0, f: 3.6 }, portions: [{ label: "מנה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "שניצל עוף מטוגן", per100: { cal: 290, p: 20, c: 15, f: 17 }, portions: [{ label: "שניצל", g: 120 }, { label: "100 גרם", g: 100 }] },
  { name: "חזה הודו", per100: { cal: 135, p: 29, c: 0, f: 1 }, portions: [{ label: "פרוסה", g: 25 }, { label: "100 גרם", g: 100 }] },
  { name: "בשר בקר טחון מבושל", per100: { cal: 250, p: 26, c: 0, f: 17 }, portions: [{ label: "מנה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "סטייק (אנטריקוט)", per100: { cal: 271, p: 25, c: 0, f: 19 }, portions: [{ label: "סטייק", g: 250 }, { label: "100 גרם", g: 100 }] },
  { name: "סלמון", per100: { cal: 208, p: 20, c: 0, f: 13 }, portions: [{ label: "פילה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "טונה (במים מסונן)", per100: { cal: 116, p: 26, c: 0, f: 1 }, portions: [{ label: "קופסה", g: 140 }, { label: "100 גרם", g: 100 }] },
  { name: "טופו", per100: { cal: 76, p: 8, c: 1.9, f: 4.8 }, portions: [{ label: "מנה", g: 100 }, { label: "100 גרם", g: 100 }] },
  { name: "עדשים מבושלות", per100: { cal: 116, p: 9, c: 20, f: 0.4 }, portions: [{ label: "כוס", g: 200 }, { label: "100 גרם", g: 100 }] },
  { name: "חומוס גרגרים מבושל", per100: { cal: 164, p: 9, c: 27, f: 2.6 }, portions: [{ label: "כוס", g: 160 }, { label: "100 גרם", g: 100 }] },
  { name: "חומוס ממרח", per100: { cal: 177, p: 8, c: 20, f: 8 }, portions: [{ label: "כף", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "טחינה גולמית", per100: { cal: 595, p: 17, c: 10, f: 54 }, portions: [{ label: "כף", g: 15 }, { label: "100 גרם", g: 100 }] },
  { name: "שמן זית", per100: { cal: 884, p: 0, c: 0, f: 100 }, portions: [{ label: "כף", g: 14 }, { label: "כפית", g: 5 }] },
  { name: "חמאת בוטנים", per100: { cal: 588, p: 25, c: 20, f: 50 }, portions: [{ label: "כף", g: 16 }, { label: "100 גרם", g: 100 }] },
  { name: "אבוקדו", per100: { cal: 160, p: 2, c: 9, f: 15 }, portions: [{ label: "חצי אבוקדו", g: 100 }, { label: "אבוקדו שלם", g: 200 }] },
  { name: "שקדים", per100: { cal: 579, p: 21, c: 22, f: 50 }, portions: [{ label: "חופן", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "אגוזי מלך", per100: { cal: 654, p: 15, c: 14, f: 65 }, portions: [{ label: "חופן", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "בננה", per100: { cal: 89, p: 1.1, c: 23, f: 0.3 }, portions: [{ label: "קטנה", g: 100 }, { label: "בינונית", g: 120 }] },
  { name: "תפוח", per100: { cal: 52, p: 0.3, c: 14, f: 0.2 }, portions: [{ label: "קטן", g: 130 }, { label: "בינוני", g: 180 }] },
  { name: "תמר", per100: { cal: 282, p: 2.5, c: 75, f: 0.4 }, portions: [{ label: "תמר", g: 8 }, { label: "100 גרם", g: 100 }] },
  { name: "עגבנייה", per100: { cal: 18, p: 0.9, c: 3.9, f: 0.2 }, portions: [{ label: "בינונית", g: 120 }, { label: "100 גרם", g: 100 }] },
  { name: "מלפפון", per100: { cal: 15, p: 0.7, c: 3.6, f: 0.1 }, portions: [{ label: "בינוני", g: 120 }, { label: "100 גרם", g: 100 }] },
  { name: "תירס מבושל", per100: { cal: 96, p: 3.4, c: 21, f: 1.5 }, portions: [{ label: "קלח", g: 100 }, { label: "100 גרם", g: 100 }] },
  { name: "במבה", per100: { cal: 526, p: 13, c: 52, f: 30 }, portions: [{ label: "שקית קטנה", g: 25 }, { label: "100 גרם", g: 100 }] },
  { name: "ביסלי", per100: { cal: 471, p: 9, c: 62, f: 20 }, portions: [{ label: "שקית קטנה", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "שוקולד חלב", per100: { cal: 535, p: 7.7, c: 59, f: 30 }, portions: [{ label: "שורה", g: 25 }, { label: "100 גרם", g: 100 }] },
  { name: "שוקולד קינדר", per100: { cal: 566, p: 8.7, c: 53, f: 35 }, portions: [{ label: "חטיף", g: 21 }, { label: "100 גרם", g: 100 }] },
  { name: "חטיף חלבון (כללי)", per100: { cal: 360, p: 32, c: 34, f: 9 }, portions: [{ label: "חטיף", g: 60 }, { label: "100 גרם", g: 100 }] },
  { name: "חלבה", per100: { cal: 540, p: 13, c: 45, f: 35 }, portions: [{ label: "חתיכה", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "קרואסון", per100: { cal: 406, p: 8, c: 46, f: 21 }, portions: [{ label: "קרואסון", g: 60 }, { label: "100 גרם", g: 100 }] },
  { name: "לחמנייה", per100: { cal: 280, p: 9, c: 50, f: 4 }, portions: [{ label: "לחמנייה", g: 70 }, { label: "100 גרם", g: 100 }] },
  { name: "פרוסת פיצה", per100: { cal: 266, p: 11, c: 33, f: 10 }, portions: [{ label: "משולש", g: 120 }, { label: "100 גרם", g: 100 }] },
  { name: "פלאפל", per100: { cal: 333, p: 13, c: 32, f: 18 }, portions: [{ label: "כדור", g: 20 }, { label: "100 גרם", g: 100 }] },
  { name: "נקניקייה", per100: { cal: 290, p: 11, c: 3, f: 26 }, portions: [{ label: "נקניקייה", g: 50 }, { label: "100 גרם", g: 100 }] },
  { name: "חמאה", per100: { cal: 717, p: 0.9, c: 0.1, f: 81 }, portions: [{ label: "כף", g: 14 }, { label: "כפית", g: 5 }] },
  { name: "גבינת שמנת", per100: { cal: 255, p: 5.5, c: 4, f: 24 }, portions: [{ label: "כף", g: 15 }, { label: "100 גרם", g: 100 }] },
  { name: "גבינה בולגרית 5%", per100: { cal: 100, p: 13, c: 4, f: 5 }, portions: [{ label: "מנה", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "דבש", per100: { cal: 304, p: 0.3, c: 82, f: 0 }, portions: [{ label: "כף", g: 21 }, { label: "כפית", g: 7 }] },
  { name: "ריבה", per100: { cal: 250, p: 0.4, c: 62, f: 0.1 }, portions: [{ label: "כף", g: 20 }, { label: "100 גרם", g: 100 }] },
  { name: "פיסטוק", per100: { cal: 560, p: 20, c: 28, f: 45 }, portions: [{ label: "חופן", g: 30 }, { label: "100 גרם", g: 100 }] },
  { name: "גזר", per100: { cal: 41, p: 0.9, c: 10, f: 0.2 }, portions: [{ label: "גזר בינוני", g: 60 }, { label: "100 גרם", g: 100 }] },
  { name: "שעועית מבושלת", per100: { cal: 127, p: 8.7, c: 23, f: 0.5 }, portions: [{ label: "כוס", g: 170 }, { label: "100 גרם", g: 100 }] },
  { name: "קוסקוס מבושל", per100: { cal: 112, p: 3.8, c: 23, f: 0.2 }, portions: [{ label: "מנה", g: 150 }, { label: "100 גרם", g: 100 }] },
  { name: "שוקו (משקה)", per100: { cal: 78, p: 3.4, c: 12, f: 1.8 }, portions: [{ label: "קרטון 250", g: 250 }, { label: "100 מ״ל", g: 100 }] },
  { name: "מיץ תפוזים", per100: { cal: 45, p: 0.7, c: 10, f: 0.2 }, portions: [{ label: "כוס", g: 200 }, { label: "100 מ״ל", g: 100 }] },
  { name: "קולה", per100: { cal: 42, p: 0, c: 10.6, f: 0 }, portions: [{ label: "פחית 330", g: 330 }, { label: "100 מ״ל", g: 100 }] },
  { name: "שוקולד מריר", per100: { cal: 546, p: 5, c: 61, f: 31 }, portions: [{ label: "קוביה", g: 10 }, { label: "100 גרם", g: 100 }] },
];

const macroFor = (food, grams) => {
  const f = (Number(grams) || 0) / 100;
  return {
    calories: r1(food.per100.cal * f),
    protein: r1(food.per100.p * f),
    carbs: r1(food.per100.c * f),
    fat: r1(food.per100.f * f),
  };
};

function totals(meals = []) {
  const t = meals.reduce(
    (a, m) => ({
      calories: a.calories + (Number(m.calories) || 0),
      protein: a.protein + (Number(m.protein) || 0),
      carbs: a.carbs + (Number(m.carbs) || 0),
      fat: a.fat + (Number(m.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return { calories: r1(t.calories), protein: r1(t.protein), carbs: r1(t.carbs), fat: r1(t.fat) };
}

/* ---------- storage shim (works inside Claude artifact runtime + standalone) ---------- */
const store = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        const r = await window.storage.get(key);
        return r && r.value ? r.value : null;
      }
    } catch (e) {}
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  async set(key, value) {
    try {
      if (typeof window !== "undefined" && window.storage) {
        await window.storage.set(key, value);
        return;
      }
    } catch (e) {}
    try { localStorage.setItem(key, value); } catch (e) {}
  },
};

/* read any file to a data URL (reliable on all phones) */
function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
}

const OK_MIME = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/* get base64 + try to downscale; gracefully fall back to the raw image */
async function processFile(file) {
  const rawDataUrl = await readAsDataURL(file);
  const rawMime = (rawDataUrl.match(/^data:([^;]+);/) || [])[1] || file.type || "image/jpeg";
  try {
    const dataUrl = await new Promise((resolve, reject) => {
      const img = new window.Image();
      const timer = setTimeout(() => reject(new Error("timeout")), 8000);
      img.onload = () => {
        clearTimeout(timer);
        try {
          let { width, height } = img;
          if (!width || !height) return reject(new Error("dims"));
          const max = 1100;
          if (width > height && width > max) {
            height = Math.round((height * max) / width);
            width = max;
          } else if (height >= width && height > max) {
            width = Math.round((width * max) / height);
            height = max;
          }
          const c = document.createElement("canvas");
          c.width = width;
          c.height = height;
          c.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(c.toDataURL("image/jpeg", 0.82));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error("decode"));
      };
      img.src = rawDataUrl;
    });
    return { preview: dataUrl, base64: dataUrl.split(",")[1], mediaType: "image/jpeg" };
  } catch (e) {
    const mediaType = OK_MIME.includes(rawMime) ? rawMime : "image/jpeg";
    return { preview: rawDataUrl, base64: rawDataUrl.split(",")[1], mediaType };
  }
}

/* ---------- Claude API (works inside Claude.ai/app runtime) ---------- */
const MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
  "claude-sonnet-4-5-20250929",
];

async function tryModel(model, content) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: "user", content }] }),
  });
  const raw = await res.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch (e) {}
  if (!res.ok) return { err: `${model}: HTTP ${res.status} ${raw.slice(0, 60)}` };
  if (!data) return { err: `${model}: לא JSON` };
  if (data.error) return { err: `${model}: ${(data.error.message || JSON.stringify(data.error)).slice(0, 80)}` };
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
  if (!text) return { err: `${model}: ריק` };
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s < 0 || e < 0) return { err: `${model}: אין JSON` };
  try {
    return { value: JSON.parse(clean.slice(s, e + 1)) };
  } catch (er) {
    return { err: `${model}: JSON פגום` };
  }
}

async function callClaudeJSON(content) {
  const errs = [];
  for (const model of MODELS) {
    try {
      const r = await tryModel(model, content);
      if (r.value !== undefined) return r.value;
      errs.push(r.err);
    } catch (err) {
      errs.push(`${model}: ${((err && err.message) || "שגיאה").slice(0, 70)}`);
    }
  }
  throw new Error(errs.join(" | ").slice(0, 320) || "כל המודלים נכשלו");
}

async function analyzeImage(img) {
  const prompt =
    "You are a meticulous nutrition expert. Look at the food in this image and identify EVERY distinct food item separately. " +
    "For EACH item, estimate its weight in grams and calculate its individual calories, protein, carbs and fat. " +
    "Then sum all items into a meal total. " +
    "If a nutrition label or brand is visible, read it and use those exact values. " +
    "Respond with ONLY a valid JSON object — no markdown, no backticks, no extra text — in EXACTLY this shape: " +
    '{"meal_name":"<short dish name in Hebrew>",' +
    '"items":[{"name":"<item name in Hebrew>","grams":<grams>,"calories":<kcal>,"protein":<grams>,"carbs":<grams>,"fat":<grams>}],' +
    '"total":{"calories":<kcal>,"protein":<grams>,"carbs":<grams>,"fat":<grams>},' +
    '"confidence":"high|medium|low","notes":"<short note in Hebrew>"}. ' +
    "If there is no food, set items to [] and all totals to 0 and explain in notes. " +
    "Grams for protein/carbs/fat. The total MUST equal the sum of all items.";
  return await callClaudeJSON([
    { type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } },
    { type: "text", text: prompt },
  ]);
}

async function aiLookupFood(query) {
  const prompt =
    `Provide nutrition data for the food/product: "${query}". ` +
    "If it is a known brand/product, use that product's label values. " +
    "Respond with ONLY valid JSON — no markdown — in this shape: " +
    '{"name":"<short Hebrew name>","per100":{"cal":<kcal per 100g>,"p":<g>,"c":<g>,"f":<g>},' +
    '"portions":[{"label":"<Hebrew unit suited to THIS product>","g":<grams>}]}. ' +
    "Give 2-4 realistic portions with units that fit the product.";
  return await callClaudeJSON([{ type: "text", text: prompt }]);
}

/* OpenFoodFacts — works without the AI; great for branded products */
async function lookupOpenFoodFacts(q) {
  const url =
    "https://world.openfoodfacts.org/cgi/search.pl?search_terms=" +
    encodeURIComponent(q) +
    "&search_simple=1&action=process&json=1&page_size=12&fields=product_name,product_name_he,brands,serving_size,nutriments";
  const res = await fetch(url);
  if (!res.ok) throw new Error("OFF HTTP " + res.status);
  const data = await res.json();
  const out = [];
  for (const p of data.products || []) {
    const nu = p.nutriments || {};
    let cal = Number(nu["energy-kcal_100g"]);
    if (!(cal > 0) && Number(nu["energy_100g"]) > 0) cal = Number(nu["energy_100g"]) / 4.184;
    if (!(cal > 0)) continue;
    const name = (p.product_name_he || p.product_name || "").trim();
    if (!name) continue;
    const brand = (p.brands || "").split(",")[0].trim();
    const portions = [];
    const ss = p.serving_size || "";
    const m = ss.match(/([\d.]+)\s*g/i);
    if (m && parseFloat(m[1]) > 0) portions.push({ label: "מנה (" + ss.trim() + ")", g: Math.round(parseFloat(m[1])) });
    portions.push({ label: "100 גרם", g: 100 });
    out.push({
      name: brand && !name.includes(brand) ? `${name} · ${brand}` : name,
      per100: { cal: r1(cal), p: r1(nu.proteins_100g || 0), c: r1(nu.carbohydrates_100g || 0), f: r1(nu.fat_100g || 0) },
      portions,
      online: true,
    });
    if (out.length >= 6) break;
  }
  return out;
}

/* ---------- tiny UI atoms ---------- */
function Ring({ size, stroke, value, color, track = C.track }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value || 0));
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.2,.8,.2,1)" }}
      />
    </svg>
  );
}

function MacroRing({ label, eaten, goal, color }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-3 rounded-2xl"
      style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}
    >
      <div className="relative" style={{ width: 56, height: 56 }}>
        <Ring size={56} stroke={6} value={goal ? eaten / goal : 0} color={color} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ ...HEAD, color: C.ink }} className="text-base font-bold">
            {fmt(eaten)}
          </span>
        </div>
      </div>
      <div className="mt-1.5 text-xs font-bold" style={{ color: C.ink }}>
        {label}
      </div>
      <div className="text-[11px]" style={{ color: C.muted }}>
        מתוך {goal} ג׳
      </div>
    </div>
  );
}

function Field({ label, val, onChange, color, suffix }) {
  return (
    <div>
      <div className="text-xs font-bold mb-1" style={{ color: color || C.muted }}>
        {label}
      </div>
      <div className="relative">
        <input
          inputMode="numeric"
          value={val}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full rounded-xl px-3 py-2.5 text-base font-bold outline-none"
          style={{ ...HEAD, background: C.bg, color: C.ink, border: `1px solid ${C.line}` }}
        />
        {suffix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: C.muted }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Legend({ c, t }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block rounded-full" style={{ width: 9, height: 9, background: c }} />
      {t}
    </span>
  );
}

/* ============================================================ */
export default function CalorieScanner() {
  const [data, setData] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("today");
  const [selDate, setSelDate] = useState(new Date());

  // scan flow
  const [scanOpen, setScanOpen] = useState(false);
  const [step, setStep] = useState("pick"); // pick | loading | result | error | manual | manual-free
  const [img, setImg] = useState(null);
  const [result, setResult] = useState(null);
  const [scanErr, setScanErr] = useState("");
  const fileRef = useRef(null);

  // manual add (food database)
  const [mQuery, setMQuery] = useState("");
  const [mFood, setMFood] = useState(null);
  const [mGrams, setMGrams] = useState("");
  const [mBusy, setMBusy] = useState(false);
  const [mErr, setMErr] = useState("");
  const [mOnline, setMOnline] = useState([]);

  // goals form
  const [gf, setGf] = useState(DEFAULT_DATA.goals);
  const [calc, setCalc] = useState({ sex: "male", age: "", weight: "", height: "", activity: "1.375", goal: "maintain" });
  const [savedFlash, setSavedFlash] = useState(false);

  /* load */
  useEffect(() => {
    (async () => {
      let loaded = null;
      try {
        const raw = await store.get(STORE_KEY);
        if (raw) loaded = JSON.parse(raw);
      } catch (e) {
        loaded = null;
      }
      const d = loaded || DEFAULT_DATA;
      setData(d);
      setGf(d.goals);
      if (d.profile) setCalc((c) => ({ ...c, ...d.profile }));
      setReady(true);
    })();
  }, []);

  const persist = async (next) => {
    setData(next);
    await store.set(STORE_KEY, JSON.stringify(next));
  };

  if (!ready || !data) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "100vh", background: C.bg }}>
        <Loader2 className="animate-spin" style={{ color: C.cal }} size={34} />
      </div>
    );
  }

  /* derived */
  const key = ymd(selDate);
  const meals = (data.days[key] && data.days[key].meals) || [];
  const t = totals(meals);
  const goals = data.goals;
  const remaining = goals.calories - t.calories;
  const isToday = sameDay(selDate, new Date());

  /* actions */
  const addMeal = (meal) => {
    const next = { ...data, days: { ...data.days } };
    const day = next.days[key] ? { ...next.days[key], meals: [...next.days[key].meals] } : { meals: [] };
    const now = new Date();
    day.meals.push({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 6),
      name: meal.name || "ארוחה",
      calories: r1(meal.calories),
      protein: r1(meal.protein),
      carbs: r1(meal.carbs),
      fat: r1(meal.fat),
      items: Array.isArray(meal.items) ? meal.items : undefined,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    });
    next.days[key] = day;
    persist(next);
  };

  const deleteMeal = (id) => {
    const next = { ...data, days: { ...data.days } };
    next.days[key] = { ...next.days[key], meals: next.days[key].meals.filter((m) => m.id !== id) };
    persist(next);
  };

  const openManual = () => {
    setMQuery("");
    setMFood(null);
    setMGrams("");
    setMBusy(false);
    setMErr("");
    setMOnline([]);
    setScanErr("");
    setStep("manual");
    setScanOpen(true);
  };

  const pickOnline = (food) => {
    setMFood(food);
    setMGrams(String(food.portions && food.portions[0] ? food.portions[0].g : 100));
  };

  const lookupOnline = async () => {
    const q = mQuery.trim();
    if (!q) return;
    setMErr("");
    setMOnline([]);
    setMBusy(true);
    try {
      let results = [];
      try {
        results = await lookupOpenFoodFacts(q);
      } catch (e) {
        results = [];
      }
      if (results.length) {
        setMOnline(results);
      } else {
        const r = await aiLookupFood(q);
        const food = {
          name: r.name || q,
          per100: {
            cal: Number(r.per100 && r.per100.cal) || 0,
            p: Number(r.per100 && r.per100.p) || 0,
            c: Number(r.per100 && r.per100.c) || 0,
            f: Number(r.per100 && r.per100.f) || 0,
          },
          portions:
            Array.isArray(r.portions) && r.portions.length
              ? r.portions.map((p) => ({ label: String(p.label || "מנה"), g: n(p.g) })).filter((p) => p.g > 0)
              : [{ label: "100 גרם", g: 100 }],
          online: true,
        };
        if (!food.portions.length) food.portions = [{ label: "100 גרם", g: 100 }];
        setMOnline([food]);
      }
    } catch (err) {
      setMErr((err && err.message) || "החיפוש נכשל");
    } finally {
      setMBusy(false);
    }
  };

  const onPick = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (e.target) e.target.value = "";
    if (!f) return;
    setScanErr("");
    setStep("loading");
    let processed;
    try {
      processed = await processFile(f);
    } catch (err) {
      setScanErr("לא הצלחנו לקרוא את התמונה מהמכשיר. נסה לצלם שוב.");
      setStep("error");
      return;
    }
    setImg(processed);
    try {
      const r = await analyzeImage(processed);
      const tot = r.total || {};
      const items = Array.isArray(r.items)
        ? r.items.map((it) => ({
            name: String(it.name || ""),
            grams: n(it.grams),
            calories: n(it.calories),
            protein: n(it.protein),
            carbs: n(it.carbs),
            fat: n(it.fat),
          }))
        : [];
      setResult({
        name: r.meal_name || "ארוחה",
        calories: String(n(tot.calories)),
        protein: String(n(tot.protein)),
        carbs: String(n(tot.carbs)),
        fat: String(n(tot.fat)),
        confidence: r.confidence || "medium",
        notes: r.notes || "",
        items,
      });
      setStep("result");
    } catch (err) {
      setScanErr((err && err.message) || "הניתוח נכשל");
      setStep("error");
    }
  };

  const startFreeManual = () => {
    setResult({ name: mQuery || "", calories: "", protein: "", carbs: "", fat: "", confidence: null, notes: "", items: [] });
    setStep("manual-free");
  };

  const saveResult = () => {
    addMeal(result);
    setScanOpen(false);
  };

  const saveFromDb = () => {
    if (!mFood) return;
    const m = macroFor(mFood, mGrams);
    addMeal({ name: `${mFood.name} · ${n(mGrams)}ג'`, ...m });
    setScanOpen(false);
  };

  const saveGoals = () => {
    persist({ ...data, goals: { calories: n(gf.calories), protein: n(gf.protein), carbs: n(gf.carbs), fat: n(gf.fat) } });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const applyCalc = () => {
    const w = Number(calc.weight) || 0;
    const h = Number(calc.height) || 0;
    const a = Number(calc.age) || 0;
    if (!w || !h || !a) return;
    const bmr = 10 * w + 6.25 * h - 5 * a + (calc.sex === "male" ? 5 : -161);
    let cals = bmr * Number(calc.activity);
    if (calc.goal === "lose") cals -= 500;
    if (calc.goal === "gain") cals += 350;
    cals = Math.round(cals);
    const protein = Math.round(w * (calc.goal === "lose" ? 2.2 : 1.8));
    const fat = Math.round((cals * 0.27) / 9);
    const carbs = Math.max(0, Math.round((cals - protein * 4 - fat * 9) / 4));
    const ng = { calories: cals, protein, carbs, fat };
    setGf(ng);
    persist({ ...data, goals: ng, profile: calc });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  /* week data — last 7 days ending on selDate */
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(selDate);
    d.setDate(selDate.getDate() - i);
    const k = ymd(d);
    const eaten = totals((data.days[k] && data.days[k].meals) || []).calories;
    weekDays.push({ k, d, eaten, label: `${HEB_DAYS[d.getDay()]} ${d.getDate()}` });
  }
  const loggedDays = weekDays.filter((x) => x.eaten > 0);
  const weekAvg = loggedDays.length ? Math.round(loggedDays.reduce((s, x) => s + x.eaten, 0) / loggedDays.length) : 0;
  const weekTotal = weekDays.reduce((s, x) => s + x.eaten, 0);
  const onTarget = weekDays.filter((x) => x.eaten > 0 && Math.abs(x.eaten - goals.calories) <= goals.calories * 0.1).length;
  const barColor = (e) =>
    e === 0 ? C.track : e > goals.calories * 1.05 ? C.pro : e < goals.calories * 0.5 ? C.carb : C.cal;

  /* ---------- screens ---------- */
  const Today = (
    <div className="space-y-4">
      {/* date pill */}
      <div className="flex items-center justify-between rounded-2xl px-2 py-1.5" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
        <button onClick={() => setSelDate(new Date(selDate.getTime() - 86400000))} className="p-2 rounded-xl" style={{ color: C.ink }}>
          <ChevronRight size={20} />
        </button>
        <div className="flex items-center gap-2" style={{ color: C.ink }}>
          <CalendarDays size={16} style={{ color: C.muted }} />
          <span className="font-bold text-sm">
            {isToday ? "היום" : `${selDate.getDate()} ב${HEB_MONTHS[selDate.getMonth()]}`}
          </span>
        </div>
        <button
          disabled={isToday}
          onClick={() => setSelDate(new Date(selDate.getTime() + 86400000))}
          className="p-2 rounded-xl"
          style={{ color: isToday ? C.line : C.ink }}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {/* calorie hero */}
      <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: C.surface, boxShadow: "0 8px 28px rgba(0,0,0,.05)" }}>
        <div className="absolute -top-16 -left-16 rounded-full" style={{ width: 180, height: 180, background: "radial-gradient(circle, rgba(23,163,74,.08), transparent 70%)" }} />
        <div className="flex items-center gap-5 relative">
          <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
            <Ring size={150} stroke={14} value={goals.calories ? t.calories / goals.calories : 0} color={remaining < 0 ? C.pro : C.cal} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ ...HEAD, color: remaining < 0 ? C.pro : C.ink }} className="text-3xl font-extrabold">
                {Math.round(Math.abs(remaining))}
              </span>
              <span className="text-[11px] mt-1 font-medium" style={{ color: C.muted }}>
                {remaining < 0 ? "קל׳ חריגה" : "קל׳ שנותרו"}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Flame size={18} style={{ color: C.cal }} />
              <div>
                <div className="text-[11px]" style={{ color: C.muted }}>נאכלו</div>
                <div style={{ ...HEAD, color: C.ink }} className="text-xl font-bold leading-none">{fmt(t.calories)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target size={18} style={{ color: C.muted }} />
              <div>
                <div className="text-[11px]" style={{ color: C.muted }}>יעד יומי</div>
                <div style={{ ...HEAD, color: C.ink }} className="text-xl font-bold leading-none">{goals.calories}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* macros */}
      <div className="grid grid-cols-3 gap-3">
        <MacroRing label="חלבון" eaten={t.protein} goal={goals.protein} color={C.pro} />
        <MacroRing label="פחמימות" eaten={t.carbs} goal={goals.carbs} color={C.carb} />
        <MacroRing label="שומן" eaten={t.fat} goal={goals.fat} color={C.fat} />
      </div>

      {/* meals */}
      <div className="flex items-center justify-between pt-1">
        <h2 style={{ ...HEAD, color: C.ink }} className="text-lg font-bold">הארוחות שלי</h2>
        <button
          onClick={openManual}
          className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full"
          style={{ color: C.ink, background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}
        >
          <Plus size={15} /> ידני
        </button>
      </div>

      {meals.length === 0 ? (
        <div className="rounded-3xl p-8 text-center" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
          <div className="mx-auto mb-3 flex items-center justify-center rounded-full" style={{ width: 56, height: 56, background: C.bg }}>
            <Utensils size={24} style={{ color: C.muted }} />
          </div>
          <div className="font-bold" style={{ color: C.ink }}>עוד לא הוספת ארוחות</div>
          <div className="text-sm mt-1" style={{ color: C.muted }}>צלם מאכל — או חיפוש מהיר והקלדה</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {meals.map((m) => (
            <div key={m.id} className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
              <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 44, height: 44, background: C.bg }}>
                <Utensils size={20} style={{ color: C.cal }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate" style={{ color: C.ink }}>{m.name}</div>
                <div className="flex items-center gap-2 mt-1 text-[11px] flex-wrap" style={{ color: C.muted }}>
                  <span>{m.time}</span>
                  <span style={{ color: C.pro }}>ח׳ {fmt(m.protein)}</span>
                  <span style={{ color: C.carb }}>פ׳ {fmt(m.carbs)}</span>
                  <span style={{ color: C.fat }}>ש׳ {fmt(m.fat)}</span>
                </div>
              </div>
              <div className="text-left shrink-0">
                <div style={{ ...HEAD, color: C.ink }} className="font-bold">{fmt(m.calories)}</div>
                <div className="text-[10px]" style={{ color: C.muted }}>קל׳</div>
              </div>
              <button onClick={() => deleteMeal(m.id)} className="p-2 rounded-lg" style={{ color: C.muted }}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const Week = (
    <div className="space-y-4">
      <h2 style={{ ...HEAD, color: C.ink }} className="text-xl font-bold flex items-center gap-2">
        <TrendingUp size={20} style={{ color: C.cal }} /> סיכום שבועי
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: weekAvg, l: "ממוצע יומי", c: C.cal },
          { v: weekTotal, l: "סה״כ השבוע", c: C.ink },
          { v: onTarget, l: "ימים ביעד", c: C.fat },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl py-4 text-center" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
            <div style={{ ...HEAD, color: s.c }} className="text-2xl font-extrabold">{s.v}</div>
            <div className="text-[11px] mt-0.5" style={{ color: C.muted }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl p-4 pt-5" style={{ background: C.surface, boxShadow: "0 8px 28px rgba(0,0,0,.05)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-sm" style={{ color: C.ink }}>קלוריות ביום</div>
          <div className="flex items-center gap-1 text-[11px]" style={{ color: C.muted }}>
            <span className="inline-block rounded-full" style={{ width: 18, height: 2, background: C.muted }} />
            יעד {goals.calories}
          </div>
        </div>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={weekDays} margin={{ top: 10, right: 4, left: -18, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const p = payload[0].payload;
                  return (
                    <div dir="rtl" className="rounded-xl px-3 py-2 text-xs" style={{ background: C.surface, boxShadow: "0 4px 16px rgba(0,0,0,.12)", color: C.ink }}>
                      <div className="font-bold mb-0.5">{HEB_DAYS[p.d.getDay()]} · {p.d.getDate()}</div>
                      <div>נאכלו: {fmt(p.eaten)} קל׳</div>
                      <div style={{ opacity: 0.7 }}>יעד: {goals.calories} קל׳</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={goals.calories} stroke={C.muted} strokeDasharray="5 5" />
              <Bar dataKey="eaten" radius={[8, 8, 0, 0]} maxBarSize={34}>
                {weekDays.map((d, i) => (
                  <Cell key={i} fill={barColor(d.eaten)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-[11px]" style={{ color: C.muted }}>
          <Legend c={C.cal} t="ביעד" />
          <Legend c={C.carb} t="מעט מדי" />
          <Legend c={C.pro} t="חריגה" />
        </div>
      </div>

      {/* avg macros */}
      <div className="rounded-3xl p-4" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
        <div className="font-bold text-sm mb-3" style={{ color: C.ink }}>ממוצע מאקרו יומי</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { l: "חלבון", c: C.pro, g: goals.protein, key: "protein" },
            { l: "פחמימות", c: C.carb, g: goals.carbs, key: "carbs" },
            { l: "שומן", c: C.fat, g: goals.fat, key: "fat" },
          ].map((mr) => {
            const avg = loggedDays.length
              ? Math.round(loggedDays.reduce((s, x) => s + totals(data.days[x.k].meals)[mr.key], 0) / loggedDays.length)
              : 0;
            return (
              <div key={mr.key} className="text-center">
                <div style={{ ...HEAD, color: mr.c }} className="text-xl font-bold">{avg}</div>
                <div className="text-[11px]" style={{ color: C.muted }}>{mr.l} · יעד {mr.g}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Goals = (
    <div className="space-y-4">
      <h2 style={{ ...HEAD, color: C.ink }} className="text-xl font-bold flex items-center gap-2">
        <Target size={20} style={{ color: C.cal }} /> היעדים שלי
      </h2>

      <div className="rounded-3xl p-4 space-y-4" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
        <div className="font-bold text-sm" style={{ color: C.ink }}>יעד יומי</div>
        <Field label="קלוריות (קל׳)" val={gf.calories} onChange={(v) => setGf({ ...gf, calories: v })} />
        <div className="grid grid-cols-3 gap-3">
          <Field label="חלבון" val={gf.protein} onChange={(v) => setGf({ ...gf, protein: v })} color={C.pro} suffix="ג׳" />
          <Field label="פחמימות" val={gf.carbs} onChange={(v) => setGf({ ...gf, carbs: v })} color={C.carb} suffix="ג׳" />
          <Field label="שומן" val={gf.fat} onChange={(v) => setGf({ ...gf, fat: v })} color={C.fat} suffix="ג׳" />
        </div>
        <button
          onClick={saveGoals}
          className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2"
          style={{ background: savedFlash ? C.cal : C.ink, color: "#fff", transition: "background .2s" }}
        >
          {savedFlash ? <><Check size={18} /> נשמר</> : "שמירת יעד"}
        </button>
      </div>

      <div className="rounded-3xl p-4 space-y-4" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} style={{ color: C.cal }} />
          <div className="font-bold text-sm" style={{ color: C.ink }}>חישוב אוטומטי לפי הגוף שלי</div>
        </div>

        <div className="flex gap-2">
          {[["male", "גבר"], ["female", "אישה"]].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setCalc({ ...calc, sex: v })}
              className="flex-1 rounded-xl py-2 text-sm font-bold"
              style={{
                background: calc.sex === v ? C.ink : C.bg,
                color: calc.sex === v ? "#fff" : C.muted,
                border: `1px solid ${C.line}`,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="גיל" val={calc.age} onChange={(v) => setCalc({ ...calc, age: v })} />
          <Field label="משקל" val={calc.weight} onChange={(v) => setCalc({ ...calc, weight: v })} suffix="ק״ג" />
          <Field label="גובה" val={calc.height} onChange={(v) => setCalc({ ...calc, height: v })} suffix="ס״מ" />
        </div>

        <div>
          <div className="text-xs font-bold mb-1" style={{ color: C.muted }}>רמת פעילות</div>
          <select
            value={calc.activity}
            onChange={(e) => setCalc({ ...calc, activity: e.target.value })}
            className="w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none"
            style={{ background: C.bg, color: C.ink, border: `1px solid ${C.line}` }}
          >
            <option value="1.2">יושבני (מעט תנועה)</option>
            <option value="1.375">פעילות קלה (1-3 אימונים)</option>
            <option value="1.55">פעילות בינונית (3-5 אימונים)</option>
            <option value="1.725">פעילות גבוהה (6-7 אימונים)</option>
          </select>
        </div>

        <div>
          <div className="text-xs font-bold mb-1" style={{ color: C.muted }}>מטרה</div>
          <div className="flex gap-2">
            {[["lose", "ירידה"], ["maintain", "שמירה"], ["gain", "עלייה"]].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setCalc({ ...calc, goal: v })}
                className="flex-1 rounded-xl py-2 text-sm font-bold"
                style={{
                  background: calc.goal === v ? C.cal : C.bg,
                  color: calc.goal === v ? "#fff" : C.muted,
                  border: `1px solid ${C.line}`,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <button onClick={applyCalc} className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2" style={{ background: C.cal, color: "#fff" }}>
          <Sparkles size={17} /> חשב את היעד שלי
        </button>

        <p className="text-[11px] leading-relaxed" style={{ color: C.muted }}>
          החישוב מבוסס על נוסחת Mifflin-St Jeor. מומלץ להיוועץ בדיאטן/ית להתאמה אישית מדויקת.
        </p>
      </div>
    </div>
  );

  const confLabel = { high: "דיוק גבוה", medium: "דיוק בינוני", low: "הערכה גסה" };
  const confColor = { high: C.cal, medium: C.carb, low: C.pro };
  const mFiltered = mQuery.trim() ? FOOD_DB.filter((fd) => fd.name.includes(mQuery.trim())) : [];
  const mMacro = mFood ? macroFor(mFood, mGrams) : null;

  /* ---------- shell ---------- */
  return (
    <div dir="rtl" style={{ background: C.bg, minHeight: "100vh", fontFamily: "'Heebo', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&family=Rubik:wght@500;700;800;900&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        input, select, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 448, minHeight: "100vh", position: "relative" }}>
        {/* header */}
        <header className="sticky top-0 z-20 px-4 pt-4 pb-3 flex items-center justify-between" style={{ background: C.bg }}>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-2xl" style={{ width: 36, height: 36, background: C.cal }}>
              <Flame size={20} color="#fff" />
            </div>
            <div>
              <div style={{ ...HEAD, color: C.ink }} className="font-extrabold text-base leading-none">קלוריות</div>
              <div className="text-[11px]" style={{ color: C.muted }}>סורק הקלוריות שלך</div>
            </div>
          </div>
          <button onClick={() => setTab("goals")} className="p-2 rounded-xl" style={{ color: C.ink }}>
            <Settings size={20} />
          </button>
        </header>

        <main className="px-4 pt-1 pb-36">
          {tab === "today" && Today}
          {tab === "week" && Week}
          {tab === "goals" && Goals}
        </main>

        {/* bottom nav + FAB */}
        <div className="fixed bottom-0 inset-x-0 z-30">
          <div className="mx-auto relative" style={{ maxWidth: 448 }}>
            <button
              onClick={() => { setImg(null); setResult(null); setScanErr(""); setStep("pick"); setScanOpen(true); }}
              className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full"
              style={{ top: -26, width: 62, height: 62, background: C.cal, boxShadow: "0 10px 24px rgba(23,163,74,.4)", border: "4px solid " + C.bg }}
            >
              <Plus size={28} color="#fff" />
            </button>
            <nav className="flex items-center justify-between px-8 pt-3 pb-5" style={{ background: C.surface, borderTop: `1px solid ${C.line}` }}>
              <div className="flex gap-7">
                <NavBtn id="today" label="היום" Icon={Flame} tab={tab} setTab={setTab} />
                <NavBtn id="week" label="שבוע" Icon={TrendingUp} tab={tab} setTab={setTab} />
              </div>
              <NavBtn id="goals" label="יעדים" Icon={Target} tab={tab} setTab={setTab} />
            </nav>
          </div>
        </div>
      </div>

      {/* scan sheet */}
      {scanOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }} onClick={() => setScanOpen(false)}>
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="w-full rounded-t-3xl p-5"
            style={{ maxWidth: 448, background: C.bg, maxHeight: "92vh", overflowY: "auto" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ ...HEAD, color: C.ink }} className="text-lg font-bold">
                {step === "manual" || step === "manual-free" ? "הוספת ארוחה" : "סריקת ארוחה"}
              </h3>
              <button onClick={() => setScanOpen(false)} className="p-1.5 rounded-lg" style={{ color: C.muted }}>
                <X size={18} />
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onPick} className="hidden" />

            {step === "pick" && (
              <div className="space-y-3">
                <button
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="w-full rounded-3xl flex flex-col items-center justify-center py-10"
                  style={{ background: C.surface, border: `2px dashed ${C.line}` }}
                >
                  <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 64, height: 64, background: C.bg }}>
                    <Camera size={30} style={{ color: C.cal }} />
                  </div>
                  <div className="font-bold" style={{ color: C.ink }}>צלם או בחר תמונה</div>
                  <div className="text-sm mt-1" style={{ color: C.muted }}>ניתוח מיד אחרי הצילום</div>
                </button>
                <button onClick={openManual} className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2" style={{ background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}>
                  <Pencil size={16} /> הזנה ידנית / חיפוש במאגר
                </button>
              </div>
            )}

            {step === "loading" && (
              <div className="flex flex-col items-center justify-center py-16">
                {img && <img src={img.preview} alt="" className="w-24 h-24 rounded-2xl object-cover mb-4" />}
                <Loader2 className="animate-spin mb-3" size={30} style={{ color: C.cal }} />
                <div className="font-bold" style={{ color: C.ink }}>מנתח את התמונה...</div>
                <div className="text-sm mt-1" style={{ color: C.muted }}>מזהה מרכיבים ומחשב ערכים תזונתיים</div>
              </div>
            )}

            {step === "error" && (
              <div className="space-y-3 text-center py-6">
                {img && <img src={img.preview} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto" />}
                <div className="font-bold" style={{ color: C.ink }}>זיהוי מתמונה לא זמין כאן</div>
                <div className="text-sm px-4" style={{ color: C.muted }}>
                  הדרך המהירה והאמינה: הקלדת שם המוצר וחיפוש (מאגר מקומי + אונליין).
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={openManual} className="flex-1 rounded-xl py-3 font-bold flex items-center justify-center gap-2" style={{ background: C.cal, color: "#fff" }}>
                    <Pencil size={16} /> חיפוש לפי שם
                  </button>
                  <button onClick={() => fileRef.current && fileRef.current.click()} className="flex-1 rounded-xl py-3 font-bold flex items-center justify-center gap-2" style={{ background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}>
                    <Camera size={16} /> נסה שוב
                  </button>
                </div>
                {scanErr && (
                  <details className="mx-2 text-right">
                    <summary className="text-[11px] cursor-pointer" style={{ color: C.muted }}>פרטים טכניים</summary>
                    <div className="text-[11px] mt-1 rounded-xl px-3 py-2" style={{ color: C.muted, background: C.surface, border: `1px solid ${C.line}` }}>
                      {scanErr}
                    </div>
                  </details>
                )}
              </div>
            )}

            {step === "manual" && (
              <div className="space-y-3">
                {!mFood ? (
                  <>
                    <div className="relative">
                      <input
                        autoFocus
                        value={mQuery}
                        onChange={(e) => setMQuery(e.target.value)}
                        placeholder="חפש מאכל... (לדוגמה: קוטג', חזה עוף, בננה)"
                        className="w-full rounded-xl px-4 py-3 text-base font-bold outline-none"
                        style={{ background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}
                      />
                    </div>
                    <button
                      onClick={() => { setImg(null); setResult(null); setScanErr(""); setStep("pick"); }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold"
                      style={{ color: C.muted }}
                    >
                      <Camera size={14} /> נסה זיהוי מתמונה (ניסיוני)
                    </button>

                    <div className="space-y-2" style={{ maxHeight: "40vh", overflowY: "auto" }}>
                      {mFiltered.map((fd) => (
                        <button
                          key={fd.name}
                          onClick={() => { setMFood(fd); setMGrams(String(fd.portions[0] ? fd.portions[0].g : 100)); }}
                          className="w-full flex items-center justify-between rounded-2xl px-4 py-3"
                          style={{ background: C.surface, border: `1px solid ${C.line}` }}
                        >
                          <div className="text-right">
                            <div className="font-bold" style={{ color: C.ink }}>{fd.name}</div>
                            <div className="text-[11px]" style={{ color: C.muted }}>{fmt(fd.per100.cal)} קל׳ ל-100ג</div>
                          </div>
                          <ChevronLeft size={18} style={{ color: C.muted }} />
                        </button>
                      ))}
                      {mQuery.trim() && mFiltered.length === 0 && (
                        <div className="text-center text-sm py-3" style={{ color: C.muted }}>
                          לא נמצא במאגר המקומי — נסה חיפוש מקוון
                        </div>
                      )}
                    </div>

                    {mQuery.trim() && (
                      <button
                        onClick={lookupOnline}
                        disabled={mBusy}
                        className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2"
                        style={{ background: C.cal, color: "#fff", opacity: mBusy ? 0.7 : 1 }}
                      >
                        {mBusy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {mBusy ? "מחפש..." : `חיפוש מקוון: "${mQuery.trim()}"`}
                      </button>
                    )}

                    {mOnline.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold" style={{ color: C.muted }}>תוצאות מקוונות</div>
                        {mOnline.map((fd, i) => (
                          <button
                            key={i}
                            onClick={() => pickOnline(fd)}
                            className="w-full flex items-center justify-between rounded-2xl px-4 py-3"
                            style={{ background: C.surface, border: `1px solid ${C.line}` }}
                          >
                            <div className="min-w-0 text-right">
                              <div className="font-bold truncate" style={{ color: C.ink }}>{fd.name}</div>
                              <div className="text-[11px]" style={{ color: C.muted }}>
                                {fmt(fd.per100.cal)} קל׳ · ח׳ {fmt(fd.per100.p)} · פ׳ {fmt(fd.per100.c)} · ש׳ {fmt(fd.per100.f)}
                              </div>
                            </div>
                            <ChevronLeft size={18} style={{ color: C.muted }} className="shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {mErr && (
                      <div className="text-[11px] rounded-xl px-3 py-2 text-right" style={{ color: C.pro, background: C.surface, border: `1px solid ${C.line}` }}>
                        {mErr}
                      </div>
                    )}

                    <button onClick={startFreeManual} className="w-full rounded-xl py-3 font-bold flex items-center justify-center gap-2" style={{ background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}>
                      <Pencil size={15} /> הזנה חופשית (הקלדת ערכים)
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setMFood(null)} className="flex items-center gap-1 text-sm font-bold" style={{ color: C.muted }}>
                      <ChevronRight size={16} /> חזרה לחיפוש
                    </button>
                    <div className="rounded-2xl px-4 py-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                      <div className="flex items-center gap-2">
                        <div style={{ ...HEAD, color: C.ink }} className="text-lg font-bold">{mFood.name}</div>
                        {mFood.online && (
                          <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: C.bg, color: C.cal }}>מקוון</span>
                        )}
                      </div>
                      <div className="text-[11px]" style={{ color: C.muted }}>
                        ל-100 ג': {fmt(mFood.per100.cal)} קל׳ · ח׳ {fmt(mFood.per100.p)} · פ׳ {fmt(mFood.per100.c)} · ש׳ {fmt(mFood.per100.f)}
                      </div>
                    </div>

                    <div className="text-xs font-bold" style={{ color: C.muted }}>בחירה מהירה</div>
                    <div className="flex flex-wrap gap-2">
                      {mFood.portions.map((p) => {
                        const active = String(p.g) === String(mGrams);
                        return (
                          <button
                            key={p.label}
                            onClick={() => setMGrams(String(p.g))}
                            className="rounded-full px-3.5 py-2 text-sm font-bold"
                            style={{ background: active ? C.cal : C.surface, color: active ? "#fff" : C.ink, border: `1px solid ${active ? C.cal : C.line}` }}
                          >
                            {p.label} · {p.g} ג'
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <div className="text-xs font-bold mb-1" style={{ color: C.muted }}>כמות מדויקת</div>
                      <div className="relative">
                        <input
                          inputMode="numeric"
                          value={mGrams}
                          onChange={(e) => setMGrams(e.target.value.replace(/[^\d]/g, ""))}
                          className="w-full rounded-xl px-4 py-3 text-base font-bold outline-none"
                          style={{ ...HEAD, background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: C.muted }}>גרם</span>
                      </div>
                    </div>

                    {mMacro && (
                      <div className="rounded-2xl p-4" style={{ background: "rgba(23,163,74,.06)", border: `1px solid ${C.line}` }}>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[11px]" style={{ color: C.muted }}>סך הכל</div>
                            <div style={{ ...HEAD, color: C.ink }} className="text-3xl font-extrabold">{fmt(mMacro.calories)}</div>
                            <div className="text-[11px]" style={{ color: C.muted }}>קלוריות</div>
                          </div>
                          <div className="flex gap-4 text-center">
                            <div><div style={{ ...HEAD, color: C.pro }} className="font-bold">{fmt(mMacro.protein)}</div><div className="text-[10px]" style={{ color: C.muted }}>חלבון</div></div>
                            <div><div style={{ ...HEAD, color: C.carb }} className="font-bold">{fmt(mMacro.carbs)}</div><div className="text-[10px]" style={{ color: C.muted }}>פחמ׳</div></div>
                            <div><div style={{ ...HEAD, color: C.fat }} className="font-bold">{fmt(mMacro.fat)}</div><div className="text-[10px]" style={{ color: C.muted }}>שומן</div></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={saveFromDb}
                      disabled={!Number(mGrams)}
                      className="w-full rounded-xl py-3.5 font-bold flex items-center justify-center gap-2"
                      style={{ background: Number(mGrams) ? C.ink : C.line, color: "#fff" }}
                    >
                      <Check size={18} /> הוספה ל{isToday ? "היום" : "יום הנבחר"}
                    </button>
                  </>
                )}
              </div>
            )}

            {(step === "result" || step === "manual-free") && result && (
              <div className="space-y-4">
                {step === "result" && result.confidence && (
                  <div className="flex items-center gap-2 text-xs font-bold rounded-full px-3 py-1.5 w-fit" style={{ background: C.surface, color: confColor[result.confidence] || C.muted, border: `1px solid ${C.line}` }}>
                    <Sparkles size={13} /> {confLabel[result.confidence] || "הערכה"}
                  </div>
                )}

                {/* Per-item breakdown */}
                {step === "result" && result.items && result.items.length > 0 && (
                  <div className="rounded-2xl p-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                    <div className="flex items-center justify-between px-1 mb-2">
                      <div className="text-xs font-bold" style={{ color: C.ink }}>פירוק הארוחה</div>
                      <div className="flex gap-2 text-[9px] font-bold" style={{ color: C.muted }}>
                        <div className="w-9 text-center">קל׳</div>
                        <div className="w-6 text-center">ח׳</div>
                        <div className="w-6 text-center">פ׳</div>
                        <div className="w-6 text-center">ש׳</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {result.items.map((it, i) => (
                        <div key={i} className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: C.bg }}>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold truncate" style={{ color: C.ink }}>{it.name}</div>
                            <div className="text-[11px]" style={{ color: C.muted }}>~{it.grams} ג'</div>
                          </div>
                          <div className="flex gap-2 text-xs text-center shrink-0">
                            <div className="w-9 font-bold" style={{ color: C.cal }}>{it.calories}</div>
                            <div className="w-6 font-bold" style={{ color: C.pro }}>{it.protein}</div>
                            <div className="w-6 font-bold" style={{ color: C.carb }}>{it.carbs}</div>
                            <div className="w-6 font-bold" style={{ color: C.fat }}>{it.fat}</div>
                          </div>
                        </div>
                      ))}
                      {result.items.length > 1 && (
                        <div className="rounded-xl px-3 py-2 flex items-center gap-2" style={{ background: "rgba(23,163,74,.1)", border: `1px solid ${C.line}` }}>
                          <div className="flex-1 text-xs font-extrabold" style={{ color: C.ink }}>סך הכל</div>
                          <div className="flex gap-2 text-xs text-center shrink-0 font-extrabold">
                            <div className="w-9" style={{ color: C.cal }}>{result.calories}</div>
                            <div className="w-6" style={{ color: C.pro }}>{result.protein}</div>
                            <div className="w-6" style={{ color: C.carb }}>{result.carbs}</div>
                            <div className="w-6" style={{ color: C.fat }}>{result.fat}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-bold mb-1" style={{ color: C.muted }}>שם הארוחה</div>
                  <input
                    value={result.name}
                    onChange={(e) => setResult({ ...result, name: e.target.value })}
                    placeholder="לדוגמה: סלט עוף"
                    className="w-full rounded-xl px-3 py-2.5 text-base font-bold outline-none"
                    style={{ background: C.surface, color: C.ink, border: `1px solid ${C.line}` }}
                  />
                </div>

                <Field label="קלוריות (קל׳)" val={result.calories} onChange={(v) => setResult({ ...result, calories: v })} />
                <div className="grid grid-cols-3 gap-3">
                  <Field label="חלבון" val={result.protein} onChange={(v) => setResult({ ...result, protein: v })} color={C.pro} suffix="ג׳" />
                  <Field label="פחמימות" val={result.carbs} onChange={(v) => setResult({ ...result, carbs: v })} color={C.carb} suffix="ג׳" />
                  <Field label="שומן" val={result.fat} onChange={(v) => setResult({ ...result, fat: v })} color={C.fat} suffix="ג׳" />
                </div>

                {step === "result" && result.notes && (
                  <p className="text-[11px] leading-relaxed rounded-xl p-2.5" style={{ color: C.muted, background: C.surface, border: `1px solid ${C.line}` }}>
                    {result.notes}
                  </p>
                )}

                <button onClick={saveResult} className="w-full rounded-xl py-3.5 font-bold flex items-center justify-center gap-2" style={{ background: C.ink, color: "#fff" }}>
                  <Check size={18} /> הוספה ל{isToday ? "היום" : "יום הנבחר"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ id, label, Icon, tab, setTab }) {
  const active = tab === id;
  return (
    <button onClick={() => setTab(id)} className="flex flex-col items-center gap-1" style={{ color: active ? C.cal : C.muted }}>
      <Icon size={22} strokeWidth={active ? 2.6 : 2} />
      <span className="text-[11px] font-bold">{label}</span>
    </button>
  );
}
