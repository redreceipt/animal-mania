# Animal Mania Roadmap

This roadmap tracks the next meaningful additions to Animal Mania. Priorities may move as playtesting reveals what makes matches fair, readable, and fun.

## Shipped

- Local two-player showdown on one screen
- Four animals with distinct Strength, Speed, moves, and play styles
- Initiative, accuracy, guard, focus, evasion, healing, and status feedback
- Desktop and mobile layouts
- Seeded matchup simulations for basic balance regression testing

## Known bugs

### Player selection does not fit shorter browser windows

The full player-selection screen can exceed the visible window height, requiring vertical scrolling to move between the roster and the **Start showdown** button. This is especially noticeable in Firefox and makes it difficult to see both players' choices at once.

Expected behavior:

- The complete selection flow fits within the available viewport height whenever the window is large enough for a practical game layout.
- Animal portraits, spacing, headings, and controls scale down together on short desktop and laptop windows.
- Both player rosters and the **Start showdown** button remain visible without scrolling.
- The layout continues to work at tall, short, narrow, and wide aspect ratios rather than targeting only standard device presets.
- Firefox, Chrome, and Safari receive explicit responsive browser checks at multiple viewport heights.
- When the viewport is genuinely too small to fit everything legibly, the fallback layout scrolls naturally without hiding or overlapping controls.

## Next

### Online multiplayer with shareable room codes

Make it effortless to start a remote two-player match without creating an account.

Proposed flow:

1. Choose **Play online**.
2. Create a room and receive a short, memorable code made from randomly selected hyphenated words, such as `brave-otter-maple`.
3. Copy a join link or send the room code to the other player.
4. The second player enters the code, joins immediately, and both players select their animals.
5. The server becomes the authority for turns, random rolls, and battle state so both players always see the same result.

Initial scope:

- Two players per room
- No accounts, chat, rankings, or matchmaking queue
- Clear waiting, connected, disconnected, reconnecting, and room-not-found states
- Private rooms that expire automatically after inactivity
- A rematch option that keeps both players in the room
- Room codes generated from a curated word list, with enough combinations to avoid guessing active rooms
- Server-side validation that prevents a player from acting out of turn or modifying battle results

Success means two people can go from the home screen to the same playable match using only a link or room code in under a minute.

### Defense as an animal attribute

Add a persistent Defense stat alongside Strength and Speed. Defense should create another meaningful distinction between animals without making durable fighters frustrating or causing matches to drag.

Design questions to resolve through simulation and playtesting:

- Whether Defense reduces flat damage, scales damage, or changes an animal's effective health
- How Defense interacts with temporary guard and guard-piercing moves
- Whether high-Defense animals need lower Speed, weaker recovery, or another tradeoff
- How prominently the damage calculation should be explained in the interface

Acceptance criteria:

- Every animal has a visible Defense rating
- Defense has a noticeable but easy-to-understand effect
- No animal becomes the universally safest choice
- Typical match length remains close to the current game
- Balance tests cover all ordered matchups and common move strategies

## Future exploration

### A larger, grounded animal roster

Expand well beyond the initial four animals—starting with possibilities such as a bunny—while keeping small animals competitively credible without giving them magical powers or pretending body size does not matter.

The likely direction is to balance real-world advantages rather than raw size alone:

- Small animals can lean on speed, evasiveness, awareness, stamina, and frequent low-damage opportunities.
- Large animals can have strength and durability, offset by slower initiative, lower accuracy, or more predictable attacks.
- Move effects should come from recognizable behavior: a bunny can feint, dodge, kick, burrow for cover, or exhaust a slower opponent.
- Competitive stats can be normalized for the game while animations, descriptions, and tactics remain grounded in each animal's real traits.
- Matchup simulations should flag hard counters, but some soft advantages are desirable because they make roster choice meaningful.

Before scaling the roster, define a reusable point-budget or power-budget model for Strength, Speed, Defense, accuracy, utility, and initiative. New animals should begin from an archetype and spend the same approximate budget, then be tuned through automated simulations and human playtests.

Open questions:

- Should animals compete in one normalized roster, optional weight classes, or both?
- How many archetypes stay strategically distinct without becoming difficult to learn?
- Should players see numerical ratings, descriptive tiers, or both?
- How can new animals be added as data instead of requiring battle-engine changes?

## Ongoing quality bar

Every gameplay release should include:

- Automated mechanics tests
- Seeded balance simulations across every animal pairing
- Keyboard, touch, desktop, and mobile browser checks
- A clean production build with no console errors
- Updated move descriptions and battle rules when mechanics change
