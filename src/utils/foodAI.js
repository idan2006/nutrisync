/**
 * Simulated AI food-image validation and macro analysis.
 * Returns either { isFood: false } or a full nutrition breakdown
 * with the list of detected items and a confidence score.
 */

const MEAL_DETECTIONS = [
  { items: ['Grilled Chicken Breast', 'Brown Rice', 'Steamed Broccoli'],      calories: 520, protein: 48, carbs: 52, fat: 8,  confidence: 97 },
  { items: ['Baked Salmon', 'Quinoa', 'Green Asparagus'],                     calories: 490, protein: 43, carbs: 36, fat: 16, confidence: 95 },
  { items: ['Scrambled Eggs', 'Whole Wheat Toast', 'Avocado'],                calories: 460, protein: 24, carbs: 32, fat: 26, confidence: 96 },
  { items: ['Greek Yogurt', 'Granola', 'Mixed Berries'],                      calories: 340, protein: 18, carbs: 52, fat: 8,  confidence: 98 },
  { items: ['Caesar Salad', 'Grilled Chicken Strips'],                        calories: 430, protein: 34, carbs: 14, fat: 26, confidence: 94 },
  { items: ['Oatmeal', 'Banana', 'Peanut Butter'],                            calories: 430, protein: 14, carbs: 62, fat: 14, confidence: 97 },
  { items: ['Beef Steak', 'Roasted Sweet Potato', 'Side Salad'],              calories: 680, protein: 52, carbs: 44, fat: 28, confidence: 92 },
  { items: ['Chicken Stir-Fry', 'White Rice', 'Mixed Vegetables'],            calories: 540, protein: 38, carbs: 58, fat: 12, confidence: 94 },
  { items: ['Tuna Salad Wrap', 'Whole Wheat Tortilla'],                       calories: 390, protein: 32, carbs: 36, fat: 10, confidence: 93 },
  { items: ['Pasta Bolognese', 'Parmesan Cheese'],                            calories: 620, protein: 28, carbs: 74, fat: 18, confidence: 91 },
  { items: ['Protein Shake', 'Banana'],                                       calories: 320, protein: 36, carbs: 34, fat: 5,  confidence: 99 },
  { items: ['Chicken Burrito Bowl', 'Black Beans', 'Guacamole'],              calories: 640, protein: 38, carbs: 64, fat: 22, confidence: 90 },
  { items: ['Smoothie Bowl', 'Granola', 'Chia Seeds', 'Fresh Fruit'],        calories: 380, protein: 12, carbs: 68, fat: 8,  confidence: 96 },
  { items: ['Turkey & Avocado Sandwich'],                                     calories: 420, protein: 28, carbs: 38, fat: 16, confidence: 91 },
  { items: ['Grilled Salmon', 'Sweet Potato Mash', 'Green Beans'],           calories: 560, protein: 44, carbs: 46, fat: 18, confidence: 95 },
  { items: ['Cottage Cheese', 'Pineapple', 'Walnuts'],                       calories: 310, protein: 24, carbs: 26, fat: 12, confidence: 94 },
  { items: ['Veggie Omelette', 'Whole Wheat Toast'],                         calories: 380, protein: 22, carbs: 28, fat: 18, confidence: 96 },
  { items: ['Chicken & Vegetable Soup', 'Sourdough Bread'],                  calories: 360, protein: 26, carbs: 42, fat: 8,  confidence: 93 },
  { items: ['Pad Thai', 'Tofu', 'Bean Sprouts'],                             calories: 580, protein: 24, carbs: 72, fat: 16, confidence: 88 },
  { items: ['Açaí Bowl', 'Blueberries', 'Hemp Seeds', 'Honey'],              calories: 400, protein: 10, carbs: 72, fat: 10, confidence: 97 },
  { items: ['Grilled Shrimp', 'Brown Rice', 'Mango Salsa'],                  calories: 450, protein: 36, carbs: 52, fat: 8,  confidence: 93 },
  { items: ['French Toast', 'Maple Syrup', 'Fresh Strawberries'],            calories: 480, protein: 14, carbs: 76, fat: 14, confidence: 95 },
  { items: ['Black Bean Tacos', 'Corn Tortillas', 'Pico de Gallo'],          calories: 440, protein: 18, carbs: 64, fat: 12, confidence: 90 },
  { items: ['Sushi Roll (8 pcs)', 'Miso Soup', 'Edamame'],                   calories: 520, protein: 22, carbs: 72, fat: 10, confidence: 89 },
  { items: ['Pancakes', 'Greek Yogurt', 'Blueberries'],                      calories: 520, protein: 16, carbs: 86, fat: 12, confidence: 96 },
];

/**
 * Simulates scanning a food photo.
 * Resolves with analysis result after a short delay.
 * ~15 % of calls are treated as non-food.
 */
export function validateFoodImage() {
  return new Promise(resolve => {
    const isFood = Math.random() > 0.15;
    // Resolve after 2.5 s (progress bar fills in parallel on the UI side)
    setTimeout(() => {
      if (!isFood) {
        resolve({ isFood: false });
      } else {
        const pick = MEAL_DETECTIONS[Math.floor(Math.random() * MEAL_DETECTIONS.length)];
        resolve({ isFood: true, ...pick });
      }
    }, 2500);
  });
}
