export const CATEGORIES = ['Food', 'Transport', 'Bills', 'Fun', 'Health', 'Shopping'] as const;

export type Category = (typeof CATEGORIES)[number];

export interface CategoryStyle {
  icon: string;
  colorClass: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Food: { icon: 'fast-food-outline', colorClass: 'cat-food' },
  Transport: { icon: 'car-outline', colorClass: 'cat-transport' },
  Bills: { icon: 'flash-outline', colorClass: 'cat-bills' },
  Fun: { icon: 'play-circle-outline', colorClass: 'cat-fun' },
  Health: { icon: 'medical-outline', colorClass: 'cat-health' },
  Shopping: { icon: 'cart-outline', colorClass: 'cat-shopping' },
  Income: { icon: 'cash-outline', colorClass: 'cat-income' },
};

/** Neutral fallback for categories added outside the six envelope presets. */
const FALLBACK_STYLE: CategoryStyle = {
  icon: 'receipt-outline',
  colorClass: 'cat-other',
};

export function categoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category] ?? FALLBACK_STYLE;
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}
