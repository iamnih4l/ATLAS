import { WishlistItem, Adventure } from '@/types';

/**
 * Determines whether a Planned Adventure carries the "Dreaming" status/tag
 * and should therefore automatically appear in the Dream List (and not in Planned Adventures).
 */
export function isDreamingAdventure(adventure: Adventure): boolean {
  if (!adventure) return false;
  if (adventure.status === 'completed' || adventure.status === 'archived') {
    return false;
  }
  return adventure.status === 'dreaming' || Boolean(adventure.is_bucket_list);
}

/**
 * Determines whether a wishlist item belongs in the Dream List view.
 * Per product specification:
 * - Visited / completed items must NEVER appear in the Dream List.
 * - Items with status 'dreaming' or tags containing 'dream' are explicitly classified as Dreaming.
 * - Active uncompleted items without a conflicting status ('planned') default to Dreaming.
 */
export function isDreamingItem(item: WishlistItem): boolean {
  if (!item) return false;

  // 1. Visited or completed items are strictly excluded
  if (item.is_completed || item.status === 'visited') {
    return false;
  }

  // 2. Explicit 'dreaming' status
  if (item.status === 'dreaming') {
    return true;
  }

  // 3. Tags containing 'dream' or 'dreaming'
  if (
    Array.isArray(item.tags) &&
    item.tags.some((tag) => tag.toLowerCase().includes('dream'))
  ) {
    return true;
  }

  // 4. Source notes containing 'dream'
  if (item.source && item.source.toLowerCase().includes('dream')) {
    return true;
  }

  // 5. Default: active wishlist items not explicitly set to 'planned'
  if (!item.status) {
    return true;
  }

  return false;
}

/**
 * Normalizes and synchronizes `status` and `is_completed` fields for consistent state.
 */
export function normalizeWishlistItem(item: Partial<WishlistItem>): Partial<WishlistItem> {
  const normalized = { ...item };

  if (normalized.status === 'visited') {
    normalized.is_completed = true;
  } else if (normalized.is_completed) {
    normalized.status = 'visited';
  } else if (!normalized.status) {
    normalized.status = 'dreaming';
    normalized.is_completed = false;
  }

  if (!Array.isArray(normalized.tags)) {
    normalized.tags = normalized.tags ? [normalized.tags] : [];
  }

  return normalized;
}
