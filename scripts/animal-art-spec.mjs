import { fileURLToPath } from 'node:url'

export const CHARACTER_SIZE = 444
export const LOGICAL_CHARACTER_SIZE = 111
export const CHARACTER_PIXEL_SCALE = CHARACTER_SIZE / LOGICAL_CHARACTER_SIZE
export const MAX_CHARACTER_COLORS = 64

// These shipped fighters are the fixed brand anchors for combat silhouette,
// exaggeration, and attitude. Changing this set is an art-direction change for
// the whole roster, not a way to approve one outlying sprite.
export const FIGHTER_STYLE_ANCHOR_IDS = [
  'tiger',
  'gorilla',
  'grizzly-bear',
  'polar-bear',
]

export const ARENA_WIDTH = 1942
export const ARENA_HEIGHT = 809

// These shipped character assets predate the exact logical-pixel contract. They
// remain the visual references, but are frozen technical exceptions. When one
// is redrawn, normalize it and remove its id from this list.
export const LEGACY_CHARACTER_IDS = [
  'tiger',
  'gorilla',
  'eagle',
  'crocodile',
  'rhino',
  'hippo',
  'horse',
  'elephant',
  'grizzly-bear',
  'polar-bear',
  'wolf',
  'komodo-dragon',
  'lion',
  'anaconda',
  'water-buffalo',
  'shark',
  'orca',
  'ostrich',
  'falcon',
  'octopus',
]

export const CHARACTER_VARIANTS = ['fighter', 'portrait']

export const characterAssetPath = (id, variant) =>
  fileURLToPath(new URL(`../public/animals/${id}-${variant}.webp`, import.meta.url))

export const arenaAssetPath = (id) =>
  fileURLToPath(new URL(`../public/animals/arena-${id}.webp`, import.meta.url))
