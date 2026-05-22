// Re-export of Grund design tokens for use in Co-Goods website code.
//
// Source of truth: ~/repositories/depalmaworkshop/grund/src/tokens.ts (mounted
// at website/grund/src/tokens.ts via git submodule).
//
// Usage:
//   import { color, typography, spacing } from '@/lib/tokens';
//
// Note: Grund is currently early-stage. Many semantic / component tokens are
// still placeholders (TODO values). Treat token consumption as
// forward-compatible — code against the structure now; values stabilize as
// Grund evolves.

export {
  color,
  typography,
  spacing,
  sizing,
  breakpoints,
  radius,
  prominence,
  motion,
  zIndex,
  fluid,
  iconography,
  toast,
  modal,
  button,
  input,
  select,
  tokens,
} from '../../grund/src/tokens';
