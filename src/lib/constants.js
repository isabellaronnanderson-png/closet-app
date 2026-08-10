export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']
export const OCCASIONS = ['Work', 'Casual', 'Date night', 'Going out', 'Formal', 'Travel', 'Gym', 'Lounge']
export const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories', 'Bags']

// Cycled across category titles like a stitch-chart color key.
export const ACCENTS = ['#444482', '#77AAFC', '#9B5CB8', '#589448', '#9E0B03']
export function accentFor(index) {
  return ACCENTS[index % ACCENTS.length]
}
