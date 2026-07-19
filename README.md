# Animal Mania

A turn-based animal fighting game with tactical single-player and local two-player modes, inspired by classic creature battlers and 8-bit tactics games.

## Play

```bash
npm install
npm run dev
```

Choose single player to face a tactical CPU, or share one screen in local multiplayer. Pick a fighter, then use its four-move kit to outplay the opponent. Every animal has a distinct mix of damage, accuracy, defense, and utility.

### Controls

- Click or tap a move card
- Press `1`–`4` to choose the matching move

## Battle rules

- Eight differently styled, evenly matched animals
- Animal HP ranges from 30 to 60 based on size and toughness
- Small targets take lighter hits while large targets take heavier hits, keeping the wide HP range balanced without erasing its durability advantage
- Strength modifies attack damage
- Speed decides the opening move and controls initiative; fast fighters occasionally act twice in succession
- Every attack has its own damage range, hit probability, and tactical effects
- Guard, focus, and evasion create defensive and setup options
- Defense must be recharged by attacking once, preventing endless stalling
- First fighter to reach 0 HP loses

### Fighters

- **Tiger — 40 HP / STR 7 / SPD 7:** balanced hunter that builds focus and punishes wounded opponents
- **Gorilla — 48 HP / STR 10 / SPD 4:** slow bruiser with the hardest hits, strongest guard, and guard-piercing attacks
- **Eagle — 30 HP / STR 5 / SPD 10:** swift trickster with multi-hit attacks, evasion, and extra initiative
- **Crocodile — 44 HP / STR 8 / SPD 5:** armored survivor with healing and anti-guard pressure
- **Rhino — 52 HP / STR 10 / SPD 3:** relentless charger with heavy guard-piercing attacks
- **Hippo — 56 HP / STR 11 / SPD 3:** river powerhouse with punishing bites, strong guard, and recovery
- **Horse — 36 HP / STR 5 / SPD 9:** fleet combo fighter with focus, evasion, and extra initiative
- **Elephant — 60 HP / STR 9 / SPD 5:** steady tactician with strong guard and anti-guard attacks

The kits are intentionally asymmetric. Seeded matchup simulations keep overall random-strategy win rates close while allowing meaningful strengths and counters.

## Quality checks

```bash
npm ci
npm test
npm run lint
npm run build
```

Gameplay pull requests must also complete the browser, viewport, input, console,
and documentation checks in the
[gameplay release quality checklist](docs/gameplay-release-checklist.md). The
pull request template records the results so the same release bar is applied to
future gameplay changes.
