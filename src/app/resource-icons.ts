import { Resource } from './types'

// Shared resource icon lookup: a cute PNG when art exists, else an emoji.

const RESOURCE_ICON_BASE = 'assets/resource-icons-cute-64/'
const RESOURCE_ICON_FILES: { [key: string]: string } = {
  [Resource.APPLE]:  'apple.png',
  [Resource.BREAD]:  'bread.png',
  [Resource.CABBAGE]: 'lettuce.png',
  [Resource.EGG]:    'chicken.png',
  [Resource.FLOUR]:  'flour.png',
  [Resource.GRAPE]:  'grape.png',
  [Resource.MILK]:   'cow.png',
  [Resource.OLIVE]:  'olive.png',
  [Resource.PORK]:   'pig.png',
  [Resource.WHEAT]:  'wheat.png',
  [Resource.WOOL]:   'sheep.png',
}

const RESOURCE_EMOJI: { [key: string]: string } = {
  [Resource.APPLE]:      '🍎', [Resource.BANANA]:     '🍌', [Resource.BERRY]:      '🍓',
  [Resource.BRANDY]:     '🍾', [Resource.BREAD]:      '🥖', [Resource.BRICK]:      '🧱',
  [Resource.CABBAGE]:    '🥬', [Resource.CANDLE]:     '🕯️', [Resource.CHEESE]:     '🧀',
  [Resource.CIDER]:      '🍺', [Resource.CIGAR]:      '🚬', [Resource.CLAY]:       '🟤',
  [Resource.COAL]:       '⚫', [Resource.COCOA]:      '🍫', [Resource.CONCRETE]:   '🏗️',
  [Resource.CORN]:       '🌽', [Resource.COTTON]:     '🪡', [Resource.EGG]:        '🥚',
  [Resource.FISH]:       '🐟', [Resource.FLOUR]:      '🥣', [Resource.FUR]:        '🦊',
  [Resource.FURNITURE]:  '🪑', [Resource.GEM]:        '💎',
  [Resource.GLASS]:      '🫧', [Resource.GOLD]:       '🪙', [Resource.GOLD_ORE]:   '🏅',
  [Resource.GRAPE]:      '🍇',
  [Resource.IRON]:       '⚙️', [Resource.IRON_ORE]:   '⛏️', [Resource.JAM]:        '🫙',
  [Resource.JEWELRY]:    '💍', [Resource.MELON]:      '🍉', [Resource.MILK]:       '🥛',
  [Resource.OIL]:        '🫗', [Resource.OLIVE]:      '🫒', [Resource.ONION]:      '🧅',
  [Resource.ORANGE]:     '🍊', [Resource.PANT]:       '👖', [Resource.PORK]:       '🥩',
  [Resource.POTATO]:     '🥔', [Resource.POTTERY]:    '🏺', [Resource.PUMPKIN]:    '🎃',
  [Resource.RICE]:       '🍚', [Resource.RUBBER]:     '🌴', [Resource.RUM]:        '🥃',
  [Resource.SALT]:       '🧂', [Resource.SAND]:       '🏜️', [Resource.SAUSAGE]:    '🌭',
  [Resource.SLATE]:      '🪨', [Resource.SOYBEAN]:    '🫘', [Resource.STATUE]:     '🗿',
  [Resource.STEEL]:      '⚒️', [Resource.STONE]:      '🪨', [Resource.SUGAR_CANE]: '🍬',
  [Resource.TIMBER]:     '🪵', [Resource.TOBACCO]:    '🌿', [Resource.TOMATO]:     '🍅',
  [Resource.TOOL]:       '🔧', [Resource.WAX]:        '🍯', [Resource.WHEAT]:      '🌾',
  [Resource.WINDOW]:     '🪟', [Resource.WINE]:       '🍷', [Resource.WOOD]:       '🪵',
  [Resource.WOOL]:       '🐑',
}

// PNG URL for a resource icon, or undefined to use the emoji fallback.
export function GetResourceIconSrc(type: Resource): string | undefined {
  const file = RESOURCE_ICON_FILES[type]
  return file ? `${RESOURCE_ICON_BASE}${file}` : undefined
}

export function GetResourceEmoji(type: Resource): string {
  return RESOURCE_EMOJI[type] ?? '📦'
}
