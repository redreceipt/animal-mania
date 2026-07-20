# Animal Mania

A turn-based animal fighting game with tactical single-player, local two-player,
and private online modes, inspired by classic creature battlers and 8-bit
tactics games.

## Play

```bash
npm install
npm run dev
```

The development command runs Vite and the online WebSocket server together at
`http://localhost:5173`. To run the production build locally:

```bash
npm run build
npm start
```

Choose single player to face a tactical CPU, share one screen in local
multiplayer, or create a private online room with a three-word code and join
link. Pick a fighter, then use its four-move kit to outplay the opponent. Every
animal has a distinct mix of damage, accuracy, defense, and utility.

Online matches support two anonymous players. The Node server is authoritative
for fighter selection, turns, random rolls, battle state, and rematches. A
disconnected player can rejoin from the same browser session, and inactive
rooms expire after 30 minutes. The same endpoint runs locally on the combined
Node server and deploys as a Vercel WebSocket Function. Rooms are currently held
in process memory; reliable multi-instance deployments require shared room
persistence and event delivery (such as Redis), because two connections may
land on different instances.

### Controls

- Click or tap a move card
- Press `1`–`4` to choose the matching move

## Battle rules

- Thirty-nine data-driven, evenly matched animals using a shared 30-point balance budget
- Animal HP ranges from 24 to 60 based on size and toughness
- Small targets take lighter hits while large targets take heavier hits, keeping the wide HP range balanced without erasing its durability advantage
- Strength modifies attack damage
- Defense persistently changes incoming damage by 1% per point from the neutral rating of 6; it applies separately from guard, so guard-piercing moves do not bypass Defense
- Speed decides the opening move and controls initiative; fast fighters occasionally act twice in succession
- Every attack has its own damage range, hit probability, and tactical effects
- Venom deals damage after a poisoned fighter acts; exposure empowers the next hit; daze lowers the next attack's accuracy
- Guard, focus, and evasion create defensive and setup options
- Defense must be recharged by attacking once, preventing endless stalling
- First fighter to reach 0 HP loses

### Fighters

- **Tiger — 40 HP / STR 7 / DEF 6 / SPD 7:** balanced hunter that builds focus and punishes wounded opponents
- **Gorilla — 48 HP / STR 10 / DEF 7 / SPD 4:** slow bruiser with the hardest hits, strongest guard, and guard-piercing attacks
- **Eagle — 30 HP / STR 5 / DEF 4 / SPD 10:** swift trickster with exposure setups, multi-hit attacks, and extra initiative
- **Crocodile — 44 HP / STR 8 / DEF 10 / SPD 5:** armored survivor with healing and anti-guard pressure
- **Rhino — 52 HP / STR 10 / DEF 9 / SPD 3:** relentless charger with heavy guard-piercing attacks
- **Hippo — 56 HP / STR 11 / DEF 8 / SPD 3:** river powerhouse with punishing bites, strong guard, and recovery
- **Horse — 36 HP / STR 5 / DEF 4 / SPD 9:** fleet combo fighter with dazing feints, evasion, and extra initiative
- **Elephant — 60 HP / STR 9 / DEF 8 / SPD 5:** steady tactician with strong guard and anti-guard attacks
- **Grizzly Bear — 50 HP / STR 9 / DEF 7 / SPD 4:** savage grappler with multi-hit pressure, evasive guard, and anti-guard attacks
- **Polar Bear — 46 HP / STR 8 / DEF 6 / SPD 6:** cold opportunist with evasion, wounded-target pressure, and guard piercing
- **Wolf — 38 HP / STR 7 / DEF 6 / SPD 7:** pack tactician with focus and wounded-target pressure
- **Komodo Dragon — 45 HP / STR 8 / DEF 10 / SPD 5:** patient predator with lingering venom, recovery, and strong defense
- **Lion — 49 HP / STR 10 / DEF 7 / SPD 4:** regal finisher with the strongest guard and guard-piercing attacks
- **Anaconda — 42 HP / STR 7 / DEF 6 / SPD 7:** coiling controller that builds focus and punishes wounded opponents
- **Water Buffalo — 58 HP / STR 11 / DEF 8 / SPD 3:** marsh juggernaut with heavy guard, recovery, and powerful charges
- **Shark — 47 HP / STR 8 / DEF 6 / SPD 6:** relentless striker with evasion, wounded-target pressure, and guard piercing
- **Orca — 54 HP / STR 9 / DEF 8 / SPD 6:** ocean powerhouse with strong guard and anti-guard attacks
- **Ostrich — 34 HP / STR 5 / DEF 4 / SPD 10:** fleet kicker with multi-hit attacks, evasion, and extra initiative
- **Falcon — 28 HP / STR 5 / DEF 4 / SPD 10:** aerial daredevil with accuracy disruption, multi-hit attacks, and extra initiative
- **Octopus — 41 HP / STR 8 / DEF 9 / SPD 5:** elusive grappler with strong defense, recovery, and anti-guard pressure
- **Panda — 48 HP / STR 8 / DEF 8 / SPD 5:** bamboo counterpuncher with focus, recovery, and anti-guard pressure
- **Hawk — 29 HP / STR 5 / DEF 4 / SPD 10:** precision harrier with exposure, multi-hit pressure, evasion, and guard piercing
- **Honey Badger — 35 HP / STR 7 / DEF 9 / SPD 7:** fearless scrapper with wounded-target pressure, guard piercing, and recovery
- **Leopard — 39 HP / STR 5 / DEF 4 / SPD 9:** explosive ambusher with evasion, wounded-target pressure, and guard piercing
- **Panther — 40 HP / STR 6 / DEF 6 / SPD 8:** shadow tactician with exposure, evasion, and anti-guard pressure
- **Moose — 55 HP / STR 10 / DEF 8 / SPD 4:** antlered juggernaut with punishing charges and a towering guard
- **Yak — 53 HP / STR 9 / DEF 9 / SPD 3:** highland survivor with strong guard, recovery, and heavy shoves
- **Bull — 52 HP / STR 10 / DEF 8 / SPD 4:** headlong bruiser with focus, guard piercing, and wounded-target finishing power
- **Snow Leopard — 37 HP / STR 5 / DEF 5 / SPD 9:** alpine ambusher with multi-hit kicks, focus, and evasion
- **King Cobra — 31 HP / STR 5 / DEF 4 / SPD 9:** venomous zoner with daze, lingering venom, and evasion
- **Hammerhead Shark — 46 HP / STR 7 / DEF 7 / SPD 7:** wide-sense hunter with exposure and anti-guard attacks
- **Alligator — 45 HP / STR 8 / DEF 10 / SPD 5:** swamp counterfighter with anti-guard pressure and strong recovery
- **Warthog — 43 HP / STR 8 / DEF 7 / SPD 5:** scrappy charger with guard piercing, recovery, and wounded-target pressure
- **Giraffe — 51 HP / STR 7 / DEF 5 / SPD 8:** long-range kicker with focus, multi-hit attacks, and evasive footwork
- **Skunk — 27 HP / STR 4 / DEF 4 / SPD 7:** scent-screen trickster with daze, exposure, and evasive defense
- **Bunny — 24 HP / STR 4 / DEF 3 / SPD 9:** alert evasive kicker with repeated hind-leg attacks and cover
- **Goat — 33 HP / STR 6 / DEF 6 / SPD 8:** sure-footed duelist with focus, guard piercing, and evasive attacks
- **Dolphin — 44 HP / STR 6 / DEF 6 / SPD 9:** echolocating tactician with exposure, multi-hit attacks, and evasive movement
- **Dog — 34 HP / STR 6 / DEF 5 / SPD 8:** tenacious team fighter with daze, wounded-target pressure, and recovery

The kits are intentionally asymmetric. Seeded matchup simulations keep overall random-strategy win rates close while allowing meaningful strengths and counters.
See the [roster balance guide](docs/roster-balance.md) for the six-axis budget,
archetypes, automated hard-counter audit, and a grounded small-animal blueprint.

## Analytics

Vercel Web Analytics records privacy-safe pageviews and core gameplay events.
See the [product analytics guide](docs/analytics.md) for the event taxonomy and
the data that must never be included in event properties.

## Quality checks

```bash
npm ci
npm test
npm run balance
npm run lint
npm run build
```

Gameplay pull requests must also complete the browser, viewport, input, console,
arcade visual-fidelity, and documentation checks in the
[gameplay release quality checklist](docs/gameplay-release-checklist.md). The
pull request template records the results so the same release bar is applied to
future gameplay changes.
