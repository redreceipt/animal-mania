# Animal Mania

A local two-player, turn-based animal fighting game inspired by classic creature battlers and 8-bit tactics games.

## Play

```bash
npm install
npm run dev
```

Both players share one screen. Pick a fighter, then use its four-move kit to outplay the opponent. Every animal has a distinct mix of damage, accuracy, defense, and utility.

### Controls

- Click or tap a move card
- Press `1`–`4` to choose the matching move

## Battle rules

- Four differently styled, evenly matched animals
- 40 HP each
- Strength modifies attack damage
- Speed decides the opening move and controls initiative; fast fighters occasionally act twice in succession
- Every attack has its own damage range, hit probability, and tactical effects
- Guard, focus, and evasion create defensive and setup options
- Defense must be recharged by attacking once, preventing endless stalling
- First fighter to reach 0 HP loses

### Fighters

- **Tiger — STR 7 / SPD 7:** balanced hunter that builds focus and punishes wounded opponents
- **Gorilla — STR 10 / SPD 4:** slow bruiser with the hardest hits, strongest guard, and guard-piercing attacks
- **Eagle — STR 5 / SPD 10:** swift trickster with multi-hit attacks, evasion, and extra initiative
- **Crocodile — STR 8 / SPD 5:** armored survivor with healing and anti-guard pressure

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
