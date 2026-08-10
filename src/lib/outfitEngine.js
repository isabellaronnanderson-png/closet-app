// Scoring: items you've rated highly get weighted up, items you haven't
// worn in a while get a recency boost (capped so it doesn't dominate),
// and never-worn items get a small novelty nudge.

function itemStats(itemId, diaryEntries) {
  const entries = diaryEntries.filter((d) => d.itemIds.includes(itemId))
  const avgRating = entries.length
    ? entries.reduce((s, d) => s + d.rating, 0) / entries.length
    : 3.2 // neutral-ish default for untried items
  const lastWorn = entries.length ? Math.max(...entries.map((d) => new Date(d.date).getTime())) : 0
  const daysSince = lastWorn ? (Date.now() - lastWorn) / 86400000 : 999
  return { avgRating, daysSince, timesWorn: entries.length }
}

export function weightForItem(itemId, diaryEntries) {
  const { avgRating, daysSince, timesWorn } = itemStats(itemId, diaryEntries)
  let w = Math.pow(avgRating, 2.2) // liked pieces climb fast
  const recencyFactor = Math.min(1.6, 0.5 + daysSince / 25) // not worn in a while -> boosted, capped
  w *= recencyFactor
  if (timesWorn === 0) w *= 1.15
  return Math.max(0.05, w)
}

function weightedPick(items, diaryEntries) {
  if (items.length === 0) return null
  const weights = items.map((it) => weightForItem(it.id, diaryEntries))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    r -= weights[i]
    if (r <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function generateOutfit(closetItems, diaryEntries) {
  const byCat = (cat) => closetItems.filter((i) => i.category === cat)
  const tops = byCat('Tops')
  const bottoms = byCat('Bottoms')
  const dresses = byCat('Dresses')
  const shoes = byCat('Shoes')
  const outerwear = byCat('Outerwear')
  const accessories = byCat('Accessories')

  const useDress = dresses.length && (Math.random() < 0.4 || !tops.length || !bottoms.length)
  const picks = []

  if (useDress) {
    const d = weightedPick(dresses, diaryEntries)
    if (d) picks.push([d, 'Dress'])
  } else {
    const t = weightedPick(tops, diaryEntries)
    if (t) picks.push([t, 'Top'])
    const b = weightedPick(bottoms, diaryEntries)
    if (b) picks.push([b, 'Bottom'])
  }

  const sh = weightedPick(shoes, diaryEntries)
  if (sh) picks.push([sh, 'Shoes'])

  if (outerwear.length && Math.random() < 0.55) {
    const o = weightedPick(outerwear, diaryEntries)
    if (o) picks.push([o, 'Outerwear'])
  }
  if (accessories.length && Math.random() < 0.6) {
    const a = weightedPick(accessories, diaryEntries)
    if (a) picks.push([a, 'Accessory'])
  }

  return picks
}

// Suggest what to pair with a given item: first from real co-occurrence in
// the diary (weighted by how much you liked those outfits), falling back to
// high-weight items from complementary categories with overlapping tags.
export function suggestPairings(baseItem, closetItems, diaryEntries, limit = 4) {
  const coCounts = {}
  diaryEntries
    .filter((d) => d.itemIds.includes(baseItem.id))
    .forEach((d) => {
      d.itemIds.forEach((oid) => {
        if (oid === baseItem.id) return
        coCounts[oid] = (coCounts[oid] || 0) + d.rating
      })
    })

  let suggestions = Object.entries(coCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([oid]) => closetItems.find((i) => i.id === oid))
    .filter(Boolean)

  if (suggestions.length < 3) {
    const complementCats =
      baseItem.category === 'Bottoms'
        ? ['Tops', 'Shoes', 'Outerwear', 'Accessories']
        : baseItem.category === 'Tops'
        ? ['Bottoms', 'Shoes', 'Outerwear', 'Accessories']
        : ['Shoes', 'Accessories', 'Outerwear']

    const pool = closetItems.filter(
      (i) => i.id !== baseItem.id && complementCats.includes(i.category) && !suggestions.includes(i)
    )
    const matching = pool.filter(
      (i) =>
        i.seasons.some((s) => baseItem.seasons.includes(s)) ||
        i.occasions.some((o) => baseItem.occasions.includes(o))
    )
    const ranked = (matching.length ? matching : pool).sort(
      (a, b) => weightForItem(b.id, diaryEntries) - weightForItem(a.id, diaryEntries)
    )
    while (suggestions.length < 3 && ranked.length) suggestions.push(ranked.shift())
  }

  return suggestions
}
