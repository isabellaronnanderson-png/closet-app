export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']
export const OCCASIONS = ['Work', 'Casual', 'Date night', 'Going out', 'Formal', 'Travel', 'Gym', 'Lounge']
export const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']

// Full palette (used for backgrounds - header pins, panels, badges).
// Keys are role names, not literal color names. Only 4 distinct hues were
// given this time (dark brown, red, light blue, butter yellow), so "olive"
// reuses the same value as "blue" rather than introducing an off-palette color.
export const PALETTE = {
  red: '#FF2E2E',
  brown: '#372020',
  blue: '#9FBFFF',
  olive: '#9FBFFF',
  yellow: '#FFEDA1',
}

// Text-color cycling only uses the truly distinct hues (avoids repeating
// blue twice just because "olive" is a duplicate role right now, and skips
// pale yellow since it isn't legible as text on white).
const TEXT_ACCENTS = [PALETTE.red, PALETTE.brown, PALETTE.blue]
export function accentFor(index) {
  return TEXT_ACCENTS[index % TEXT_ACCENTS.length]
}
