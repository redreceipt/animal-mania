# Roster balance guide

Animal Mania uses one normalized roster. Size still appears in health, descriptions,
animations, and move behavior, while the damage-scaling rule prevents size alone from
deciding a match. Weight classes can be added later as an optional mode, but they are
not required to make a small animal credible.

## The 30-point budget

Every fighter spends 30 points (with a one-point tuning tolerance) across six axes:

| Axis | What it pays for |
| --- | --- |
| Strength | Base damage, burst damage, and finishing power |
| Speed | Evasion, repositioning, and repeated low-damage opportunities |
| Defense | Persistent damage reduction, guard, health, and recovery |
| Accuracy | Reliable attacks, multi-hit consistency, and focus generation |
| Utility | Healing, guard piercing, conditional damage, focus, evasion, and status setup |
| Initiative | Opening priority and the chance to act twice before a slower rival |

The budget is a design ledger, not a second damage formula. A point must be visible in
the fighter's stats or move kit. When tuning changes a mechanic materially, move its
budget points too so reviews can see the trade.

`src/balance.js` provides the canonical axes, archetype templates, budget helper,
roster validator, seeded simulations, and hard-counter thresholds. Run the complete
audit with:

```bash
npm run balance
```

The command fails when a fighter is outside the budget, has malformed data, exceeds a
54% overall seeded win rate (or falls below 46%), or creates a matchup outside the
41–59% soft-counter window.

## Archetypes

Five templates keep the roster learnable while leaving room for grounded variations:

- **All-rounder:** flexible fundamentals with no extreme matchup dependency.
- **Bruiser:** strength and durability paid for with mobility and turn frequency.
- **Skirmisher:** speed, precision, and evasion paid for with power and armor.
- **Survivor:** defense and recovery paid for with initiative and burst damage.
- **Tactician:** setup and matchup tools paid for with direct power.

Use `createBudget(archetype, adjustments)` to begin at a template and transfer points
between axes. Adjustments should net to zero, and the validator limits how far a
fighter can drift from its declared archetype. The UI continues to show numerical HP,
Strength, Defense, and Speed alongside a descriptive role; accuracy and utility remain
legible on move cards instead of adding six more selection-screen numbers.

## Grounded rabbit blueprint

A rabbit belongs in the skirmisher archetype. It does not need implausible strength or
magic: alertness wins initiative, lateral movement creates misses, repeated hind-leg
kicks create low-damage pressure, and cover buys a setup turn.

```js
const rabbit = {
  id: 'rabbit',
  name: 'Rabbit',
  detail: 'Alert evasive skirmisher',
  archetype: 'skirmisher',
  health: 26,
  strength: 3,
  defense: 3,
  speed: 10,
  home: 'Bramble Meadow',
  budget: createBudget('skirmisher', {
    strength: -1,
    speed: 1,
    accuracy: 1,
    utility: 1,
    initiative: -2,
  }),
  moves: [
    { type: 'attack', name: 'Feinting Hop', minDamage: 3, maxDamage: 5,
      accuracy: 0.99, evasionGain: 0.18, description: 'Sidestep and probe.' },
    { type: 'attack', name: 'Double Kick', minDamage: 3, maxDamage: 4,
      accuracy: 0.86, hits: 2, description: 'Two grounded hind-leg kicks.' },
    { type: 'attack', name: 'Breakaway Kick', minDamage: 8, maxDamage: 11,
      accuracy: 0.7, evasionGain: 0.2, description: 'Kick, then open distance.' },
    { type: 'defend', name: 'Bramble Cover', guard: 0.25, focus: 0.25,
      evasionGain: 0.2, description: 'Use cover and watch for an opening.' },
  ],
}
```

This object already matches the battle engine's data contract. Before promotion to
the live `ANIMALS` list it still needs a unique column, three visual assets, roster
validation, seeded simulation tuning, and human playtesting.

## Adding a fighter

1. Choose the closest archetype and copy its budget with `createBudget`.
2. Describe recognizable behavior, then express it with existing move effects.
3. Transfer points rather than only adding strengths; keep the total near 30.
4. Add the animal object and portrait, fighter, and arena WebP assets.
5. Run `npm test`, `npm run balance`, `npm run lint`, and `npm run build`.
6. Review flagged matchups, then playtest the most extreme pairings before tuning.

Adding an animal remains a data-and-assets change. The battle engine only needs a new
mechanic when recognizable behavior cannot be expressed by the existing move effects.

## Status setup effects

Status moves trade immediate power for a later advantage and should remain readable
from both the move card and fighter HUD:

- **Venom** deals its listed damage after each of the poisoned fighter's next moves.
  Reapplying venom keeps the stronger damage and longer remaining duration rather than
  stacking both.
- **Exposure** adds its listed damage to the next landed hit, then clears. Misses and
  defensive moves do not consume it.
- **Daze** lowers the accuracy of the fighter's next attack, then clears whether that
  attack lands or misses. Defending delays but does not remove it.

Price these effects on the Utility axis and retune immediate damage, accuracy, or
another benefit instead of adding them to an already complete move. Every fighter
still needs exactly three attacks and one rechargeable defensive move.
