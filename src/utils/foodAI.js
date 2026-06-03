const MODELS = [
  "claude-sonnet-4-6",
  "claude-haiku-4-5-20251001",
];

async function tryModel(model, content) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: "user", content }] }),
  });
  const raw = await res.text();
  let data;
  try { data = JSON.parse(raw); } catch { return { err: `${model}: invalid response` }; }
  if (!res.ok) return { err: `${model}: HTTP ${res.status} — ${data?.error?.message || raw.slice(0, 80)}` };
  if (data.error) return { err: `${model}: ${data.error.message}` };
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  if (!text) return { err: `${model}: empty response` };
  const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const s = clean.indexOf("{");
  const e = clean.lastIndexOf("}");
  if (s < 0 || e < 0) return { err: `${model}: no JSON in response` };
  try {
    return { value: JSON.parse(clean.slice(s, e + 1)) };
  } catch {
    return { err: `${model}: malformed JSON` };
  }
}

async function callClaudeJSON(content) {
  const errors = [];
  for (const model of MODELS) {
    try {
      const r = await tryModel(model, content);
      if (r.value !== undefined) return r.value;
      errors.push(r.err);
    } catch (e) {
      errors.push(`${model}: ${e?.message || "unknown error"}`);
    }
  }
  throw new Error(errors.join(" | ") || "All models failed");
}

function downscaleDataURL(dataUrl) {
  return new Promise(resolve => {
    const img = new window.Image();
    const timer = setTimeout(() => resolve(dataUrl), 8000);
    img.onload = () => {
      clearTimeout(timer);
      try {
        let { width, height } = img;
        const MAX = 1100;
        if (width > MAX && width >= height) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height > MAX && height > width) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => { clearTimeout(timer); resolve(dataUrl); };
    img.src = dataUrl;
  });
}

const ANALYZE_PROMPT =
  "You are a nutrition expert. Analyze every distinct food item visible in this image. " +
  "For each item, estimate its weight in grams and calculate its individual nutritional values. " +
  "Then sum everything into a meal total. " +
  "Respond with ONLY a valid JSON object — no markdown, no extra text — in exactly this shape: " +
  '{"isFood":true,"meal_name":"<short descriptive name>","items":[' +
  '{"name":"<food item name>","grams":<integer>,"calories":<integer>,"protein":<integer>,"carbs":<integer>,"fat":<integer>}' +
  '],"total":{"calories":<integer>,"protein":<integer>,"carbs":<integer>,"fat":<integer>},' +
  '"confidence":"high|medium|low","notes":""}. ' +
  "If no food is visible respond with: " +
  '{"isFood":false,"meal_name":"","items":[],"total":{"calories":0,"protein":0,"carbs":0,"fat":0},"confidence":"low","notes":"No food detected"}. ' +
  "All numbers must be integers. protein/carbs/fat are in grams. " +
  "The total must equal the sum of all items.";

export async function validateFoodImage(imageDataUrl) {
  const downscaled = await downscaleDataURL(imageDataUrl);
  const base64 = downscaled.split(",")[1];

  const raw = await callClaudeJSON([
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
    { type: "text", text: ANALYZE_PROMPT },
  ]);

  return {
    isFood: !!raw.isFood,
    meal_name: raw.meal_name || "",
    items: Array.isArray(raw.items) ? raw.items.map(item => ({
      name:     String(item.name     || ""),
      grams:    Math.round(Number(item.grams)    || 0),
      calories: Math.round(Number(item.calories) || 0),
      protein:  Math.round(Number(item.protein)  || 0),
      carbs:    Math.round(Number(item.carbs)    || 0),
      fat:      Math.round(Number(item.fat)      || 0),
    })) : [],
    total: {
      calories: Math.round(Number(raw.total?.calories) || 0),
      protein:  Math.round(Number(raw.total?.protein)  || 0),
      carbs:    Math.round(Number(raw.total?.carbs)    || 0),
      fat:      Math.round(Number(raw.total?.fat)      || 0),
    },
    confidence: raw.confidence || "medium",
    notes:      raw.notes || "",
  };
}
