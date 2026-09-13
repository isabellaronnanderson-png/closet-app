export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']
export const OCCASIONS = ['Work', 'Casual', 'Date night', 'Going out', 'Formal', 'Travel', 'Gym', 'Lounge']

// Shared base, then each tab adds the one category that's actually relevant
// to it - Hairstyles belongs in your closet/diary (it affects a look and you
// can log wearing it), not in a shopping list; Home belongs in shopping
// (you buy homeware), not in your closet.
const BASE_CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']
export const CLOSET_CATEGORIES = [...BASE_CATEGORIES, 'Hairstyles']
export const SHOP_CATEGORIES = [...BASE_CATEGORIES, 'Home']

// Full palette (used for backgrounds - header pins, panels, badges).
// Keys are role names, not literal color names.
export const PALETTE = {
  red: '#DC583A',
  brown: '#3D2620',
  blue: '#AFC8F5',
  olive: '#AFC8F5',
  yellow: '#FCF5BB',
}

// Text-color cycling only uses the truly distinct hues (avoids repeating
// blue twice just because "olive" is a duplicate role right now, and skips
// pale yellow since it isn't legible as text on white).
const TEXT_ACCENTS = [PALETTE.red, PALETTE.brown, PALETTE.blue]
export function accentFor(index) {
  return TEXT_ACCENTS[index % TEXT_ACCENTS.length]
}
