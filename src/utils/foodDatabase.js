/**
 * Per-100g nutritional values.
 * keys: search terms that should match this food.
 * dflt: default serving size in grams shown to the user.
 */
const FOODS = [
  // ── Poultry ──────────────────────────────────────────────────────────────
  { name: 'Chicken Breast (grilled)',  keys: ['chicken breast','grilled chicken','chicken fillet','chicken'],          cal: 165, pro: 31,  carb: 0,   fat: 3.6,  dflt: 150 },
  { name: 'Chicken Thigh (grilled)',   keys: ['chicken thigh','dark chicken meat'],                                     cal: 209, pro: 26,  carb: 0,   fat: 11,   dflt: 150 },
  { name: 'Turkey Breast',             keys: ['turkey','turkey breast','turkey slice'],                                 cal: 135, pro: 30,  carb: 0,   fat: 1,    dflt: 150 },

  // ── Red Meat ─────────────────────────────────────────────────────────────
  { name: 'Beef Steak (sirloin)',       keys: ['steak','beef steak','sirloin','ribeye','beef'],                         cal: 207, pro: 26,  carb: 0,   fat: 11,   dflt: 200 },
  { name: 'Ground Beef (lean)',         keys: ['ground beef','minced beef','beef mince','hamburger meat','meatball'],   cal: 215, pro: 26,  carb: 0,   fat: 12,   dflt: 150 },
  { name: 'Lamb Chop',                  keys: ['lamb','lamb chop','lamb cutlet'],                                        cal: 294, pro: 25,  carb: 0,   fat: 21,   dflt: 150 },

  // ── Fish & Seafood ────────────────────────────────────────────────────────
  { name: 'Salmon (baked)',             keys: ['salmon','baked salmon','salmon fillet','grilled salmon'],               cal: 208, pro: 20,  carb: 0,   fat: 13,   dflt: 150 },
  { name: 'Tuna (canned in water)',     keys: ['tuna','canned tuna','tuna can'],                                        cal: 116, pro: 26,  carb: 0,   fat: 1,    dflt: 100 },
  { name: 'Tilapia / White Fish',       keys: ['tilapia','white fish','cod','haddock','fish fillet','sea bass'],        cal: 96,  pro: 20,  carb: 0,   fat: 2,    dflt: 150 },
  { name: 'Shrimp / Prawns',            keys: ['shrimp','prawn','prawns','shrimps'],                                    cal: 99,  pro: 24,  carb: 0,   fat: 0.3,  dflt: 150 },

  // ── Eggs & Dairy ──────────────────────────────────────────────────────────
  { name: 'Eggs (whole, cooked)',       keys: ['eggs','egg','fried egg','scrambled eggs','boiled egg','omelette','omelet'], cal: 155, pro: 13, carb: 1.1, fat: 11, dflt: 100 },
  { name: 'Greek Yogurt (0% fat)',      keys: ['greek yogurt','greek yoghurt','yogurt','yoghurt'],                      cal: 59,  pro: 10,  carb: 3.6, fat: 0.4,  dflt: 200 },
  { name: 'Cottage Cheese',             keys: ['cottage cheese'],                                                       cal: 98,  pro: 11,  carb: 3.4, fat: 4.3,  dflt: 150 },
  { name: 'Cheddar Cheese',             keys: ['cheese','cheddar','cheddar cheese'],                                    cal: 403, pro: 25,  carb: 1.3, fat: 33,   dflt: 30  },
  { name: 'Milk (whole)',               keys: ['milk','whole milk'],                                                    cal: 61,  pro: 3.2, carb: 4.8, fat: 3.3,  dflt: 250 },
  { name: 'Whey Protein Shake',         keys: ['protein shake','whey','whey protein','protein powder','shake'],         cal: 120, pro: 25,  carb: 3,   fat: 2,    dflt: 300 },

  // ── Grains & Carbs ────────────────────────────────────────────────────────
  { name: 'White Rice (cooked)',        keys: ['rice','white rice','steamed rice','basmati rice','jasmine rice'],       cal: 130, pro: 2.7, carb: 28,  fat: 0.3,  dflt: 200 },
  { name: 'Brown Rice (cooked)',        keys: ['brown rice','wholegrain rice'],                                         cal: 112, pro: 2.6, carb: 24,  fat: 0.9,  dflt: 200 },
  { name: 'Pasta (cooked)',             keys: ['pasta','spaghetti','penne','linguine','macaroni','fettuccine','noodles'], cal: 158, pro: 5.8, carb: 31, fat: 0.9, dflt: 200 },
  { name: 'Oatmeal (cooked)',           keys: ['oatmeal','oats','porridge','overnight oats'],                           cal: 68,  pro: 2.4, carb: 12,  fat: 1.4,  dflt: 300 },
  { name: 'White Bread (slice)',        keys: ['white bread','bread','toast','bread slice'],                            cal: 265, pro: 9,   carb: 49,  fat: 3.2,  dflt: 60  },
  { name: 'Whole Wheat Bread',          keys: ['whole wheat bread','wholegrain bread','brown bread','wholemeal'],       cal: 247, pro: 13,  carb: 41,  fat: 3.4,  dflt: 60  },
  { name: 'Sweet Potato (baked)',       keys: ['sweet potato','sweet potatoes','yam'],                                  cal: 86,  pro: 1.6, carb: 20,  fat: 0.1,  dflt: 200 },
  { name: 'Potato (baked)',             keys: ['potato','baked potato','jacket potato','potatoes','boiled potato'],     cal: 93,  pro: 2.5, carb: 21,  fat: 0.1,  dflt: 200 },
  { name: 'Quinoa (cooked)',            keys: ['quinoa'],                                                               cal: 120, pro: 4.4, carb: 21,  fat: 1.9,  dflt: 185 },
  { name: 'Tortilla Wrap (flour)',      keys: ['tortilla','wrap','flour tortilla'],                                     cal: 312, pro: 8,   carb: 52,  fat: 7.5,  dflt: 60  },

  // ── Vegetables ───────────────────────────────────────────────────────────
  { name: 'Broccoli',                   keys: ['broccoli'],                                                             cal: 34,  pro: 2.8, carb: 7,   fat: 0.4,  dflt: 150 },
  { name: 'Spinach',                    keys: ['spinach'],                                                              cal: 23,  pro: 2.9, carb: 3.6, fat: 0.4,  dflt: 100 },
  { name: 'Mixed Green Salad',          keys: ['salad','green salad','mixed salad','lettuce','side salad'],             cal: 20,  pro: 1.3, carb: 3.6, fat: 0.2,  dflt: 150 },
  { name: 'Tomato',                     keys: ['tomato','tomatoes'],                                                    cal: 18,  pro: 0.9, carb: 3.9, fat: 0.2,  dflt: 150 },
  { name: 'Cucumber',                   keys: ['cucumber'],                                                             cal: 16,  pro: 0.7, carb: 3.6, fat: 0.1,  dflt: 150 },
  { name: 'Bell Pepper',                keys: ['bell pepper','pepper','capsicum'],                                      cal: 31,  pro: 1,   carb: 6,   fat: 0.3,  dflt: 120 },

  // ── Fruits ───────────────────────────────────────────────────────────────
  { name: 'Banana',                     keys: ['banana','bananas'],                                                     cal: 89,  pro: 1.1, carb: 23,  fat: 0.3,  dflt: 120 },
  { name: 'Apple',                      keys: ['apple','apples'],                                                       cal: 52,  pro: 0.3, carb: 14,  fat: 0.2,  dflt: 182 },
  { name: 'Orange',                     keys: ['orange','oranges'],                                                     cal: 47,  pro: 0.9, carb: 12,  fat: 0.1,  dflt: 180 },
  { name: 'Blueberries',                keys: ['blueberries','blueberry','berries','mixed berries'],                    cal: 57,  pro: 0.7, carb: 14,  fat: 0.3,  dflt: 150 },
  { name: 'Strawberries',               keys: ['strawberries','strawberry'],                                            cal: 32,  pro: 0.7, carb: 7.7, fat: 0.3,  dflt: 150 },
  { name: 'Mango',                      keys: ['mango'],                                                                cal: 60,  pro: 0.8, carb: 15,  fat: 0.4,  dflt: 165 },
  { name: 'Grapes',                     keys: ['grapes','grape'],                                                       cal: 69,  pro: 0.7, carb: 18,  fat: 0.2,  dflt: 150 },

  // ── Fats & Nuts ───────────────────────────────────────────────────────────
  { name: 'Avocado',                    keys: ['avocado','avocados'],                                                   cal: 160, pro: 2,   carb: 9,   fat: 15,   dflt: 150 },
  { name: 'Almonds',                    keys: ['almonds','almond'],                                                     cal: 579, pro: 21,  carb: 22,  fat: 50,   dflt: 30  },
  { name: 'Walnuts',                    keys: ['walnuts','walnut'],                                                     cal: 654, pro: 15,  carb: 14,  fat: 65,   dflt: 30  },
  { name: 'Peanut Butter',              keys: ['peanut butter','pb','peanut'],                                          cal: 588, pro: 25,  carb: 20,  fat: 50,   dflt: 32  },
  { name: 'Olive Oil',                  keys: ['olive oil'],                                                            cal: 884, pro: 0,   carb: 0,   fat: 100,  dflt: 15  },

  // ── Prepared Dishes ───────────────────────────────────────────────────────
  { name: 'Caesar Salad',               keys: ['caesar salad','caesar'],                                                cal: 190, pro: 14,  carb: 11,  fat: 11,   dflt: 300 },
  { name: 'Avocado Toast',              keys: ['avocado toast','avo toast'],                                            cal: 215, pro: 7,   carb: 25,  fat: 12,   dflt: 180 },
  { name: 'Pasta Bolognese',            keys: ['bolognese','spaghetti bolognese','pasta bolognese','meat sauce'],       cal: 180, pro: 14,  carb: 22,  fat: 5,    dflt: 350 },
  { name: 'Pasta with Tomato Sauce',    keys: ['pasta tomato','marinara','arrabbiata','tomato pasta'],                  cal: 140, pro: 5,   carb: 27,  fat: 2,    dflt: 350 },
  { name: 'Pizza (cheese & tomato)',    keys: ['pizza','cheese pizza','margherita'],                                    cal: 266, pro: 11,  carb: 33,  fat: 10,   dflt: 200 },
  { name: 'Burger (beef)',              keys: ['burger','hamburger','cheeseburger','beef burger'],                      cal: 295, pro: 17,  carb: 24,  fat: 14,   dflt: 200 },
  { name: 'Chicken Sandwich',           keys: ['chicken sandwich','chicken sub','chicken burger'],                      cal: 225, pro: 20,  carb: 22,  fat: 7,    dflt: 220 },
  { name: 'Sushi Roll',                 keys: ['sushi','sushi roll','maki','nigiri','hand roll'],                       cal: 140, pro: 6,   carb: 28,  fat: 1.5,  dflt: 200 },
  { name: 'Tacos (chicken)',            keys: ['taco','tacos','chicken taco','street taco'],                            cal: 180, pro: 14,  carb: 19,  fat: 5,    dflt: 200 },
  { name: 'Fried Rice',                 keys: ['fried rice','egg fried rice'],                                          cal: 163, pro: 3.7, carb: 28,  fat: 4.3,  dflt: 250 },
  { name: 'Chicken Stir-Fry',           keys: ['stir fry','stir-fry','chicken stir fry','stir fried'],                 cal: 130, pro: 14,  carb: 10,  fat: 4,    dflt: 300 },
  { name: 'Vegetable Soup',             keys: ['soup','vegetable soup','veggie soup'],                                  cal: 40,  pro: 2,   carb: 7,   fat: 0.8,  dflt: 400 },
  { name: 'Chicken Soup',               keys: ['chicken soup','chicken noodle soup','chicken broth'],                   cal: 55,  pro: 5,   carb: 5,   fat: 1.5,  dflt: 400 },
  { name: 'Sandwich (ham & cheese)',    keys: ['sandwich','sub','ham sandwich'],                                        cal: 250, pro: 13,  carb: 30,  fat: 8,    dflt: 200 },
  { name: 'Chicken & Rice Bowl',        keys: ['chicken rice','chicken and rice','rice bowl','chicken rice bowl'],      cal: 160, pro: 16,  carb: 18,  fat: 2.5,  dflt: 350 },
  { name: 'Burrito (chicken)',          keys: ['burrito','chicken burrito'],                                            cal: 210, pro: 13,  carb: 25,  fat: 6,    dflt: 300 },
  { name: 'Pad Thai',                   keys: ['pad thai','thai noodles'],                                              cal: 220, pro: 10,  carb: 30,  fat: 7,    dflt: 300 },

  // ── Breakfast ─────────────────────────────────────────────────────────────
  { name: 'Pancakes',                   keys: ['pancakes','pancake'],                                                   cal: 227, pro: 6,   carb: 40,  fat: 5,    dflt: 200 },
  { name: 'Waffles',                    keys: ['waffles','waffle'],                                                     cal: 291, pro: 8,   carb: 37,  fat: 13,   dflt: 200 },
  { name: 'French Toast',               keys: ['french toast','eggy bread'],                                            cal: 230, pro: 8,   carb: 28,  fat: 9,    dflt: 180 },
  { name: 'Granola',                    keys: ['granola','muesli'],                                                     cal: 471, pro: 10,  carb: 64,  fat: 20,   dflt: 60  },
  { name: 'Cereal with Milk',           keys: ['cereal','cornflakes','cereal milk'],                                    cal: 150, pro: 5,   carb: 28,  fat: 2,    dflt: 250 },
  { name: 'Açaí Bowl',                  keys: ['acai','acai bowl','açaí'],                                              cal: 145, pro: 2.5, carb: 22,  fat: 6,    dflt: 250 },
  { name: 'Smoothie Bowl',              keys: ['smoothie bowl','smoothie'],                                             cal: 120, pro: 3,   carb: 24,  fat: 2,    dflt: 300 },

  // ── Snacks ────────────────────────────────────────────────────────────────
  { name: 'Protein Bar',                keys: ['protein bar','energy bar','quest bar'],                                 cal: 200, pro: 20,  carb: 22,  fat: 7,    dflt: 60  },
  { name: 'Dark Chocolate',             keys: ['dark chocolate','chocolate'],                                           cal: 546, pro: 5,   carb: 60,  fat: 31,   dflt: 40  },
  { name: 'Chips / Crisps',             keys: ['chips','crisps','potato chips','tortilla chips'],                       cal: 536, pro: 7,   carb: 53,  fat: 35,   dflt: 50  },
  { name: 'Hummus',                     keys: ['hummus','houmous'],                                                     cal: 166, pro: 8,   carb: 14,  fat: 10,   dflt: 80  },
  { name: 'Rice Cakes',                 keys: ['rice cakes','rice cake'],                                               cal: 387, pro: 8,   carb: 81,  fat: 3,    dflt: 30  },
];

/** Return up to 6 best matches for a free-text query. */
export function searchFood(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length > 1);
  const scored = [];

  for (const food of FOODS) {
    const lname = food.name.toLowerCase();
    let score = 0;

    if (lname === q)            score = 100;
    else if (lname.startsWith(q)) score = 85;
    else if (lname.includes(q))   score = 70;

    if (score === 0) {
      for (const key of food.keys) {
        if (key === q)            { score = Math.max(score, 95); break; }
        if (key.startsWith(q))    { score = Math.max(score, 80); }
        if (key.includes(q))      { score = Math.max(score, 65); }
        for (const w of words) {
          if (key.includes(w) || lname.includes(w)) score = Math.max(score, 40);
        }
      }
    }

    if (score > 0) scored.push({ ...food, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 6);
}

/** Calculate nutrition for a given food and serving size in grams. */
export function calcNutrition(food, grams) {
  const f = (grams || 0) / 100;
  return {
    calories: Math.round(food.cal * f),
    protein:  Math.round(food.pro * f),
    carbs:    Math.round(food.carb * f),
    fat:      Math.round(food.fat * f),
  };
}
