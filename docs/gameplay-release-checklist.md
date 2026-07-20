# Gameplay release quality checklist

Use this checklist for every pull request that changes game mechanics, balance,
move copy, battle rules, controls, animal/arena art, or responsive gameplay UI. Run the automated
checks locally before requesting review, then copy the results into the pull
request checklist. If a check does not apply, mark it `N/A` and explain why.

## Automated checks

Run the same checks as CI from a clean install:

```bash
npm ci
npm test
npm run lint
npm run build
npm run art:check
```

| Quality check | Where it runs | What passing means |
| --- | --- | --- |
| Mechanics tests | `npm test` locally and the **Test** CI job | Core combat rules and animal-specific effects pass. Add or update a focused test in `src/game.test.js` for every mechanics change. |
| Seeded balance simulations | The seeded matchup test in `src/game.test.js`, via `npm test` and the **Test** CI job | Every ordered animal pairing completes 600 seeded matches; overall and head-to-head win rates remain within the documented bounds. Update the bounds only with an intentional, explained balance decision. |
| Clean production build | `npm run build` locally and the **Build** CI job | Vite produces the production bundle without errors. Do not commit `dist/`. |
| Static checks | `npm run lint` locally and the **Lint** CI job | ESLint reports no errors. |
| Animal art contract | `npm run art:check` locally and the **Animal art** CI job | Every roster asset exists at the required dimensions and format. New and redrawn character art also passes the exact logical-pixel, palette, alpha, and framing contract. |

The workflow definitions live in `.github/workflows/ci.yml` and run on every
pull request and every push to `main`.

## Interaction and responsive checks

Start the production build, not the development server:

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Complete the smallest matrix that covers every row below. Responsive changes
must be checked in Chrome, Firefox, and Safari. For non-responsive gameplay
changes, one desktop browser plus one real or emulated touch device is enough,
unless the change is browser-specific.

| Browser / device | Viewport | Input | Required scenario |
| --- | --- | --- | --- |
| Chrome desktop | `1440 × 900` | Mouse and keys `1`–`4` | Select both fighters, play several turns, use each move slot, and start a new match. |
| Firefox desktop | `1280 × 720` | Mouse and keys `1`–`4` | Repeat the changed flow and verify focus, disabled, and active-turn states. |
| Safari desktop | `1280 × 720` | Mouse and keys `1`–`4` | Repeat the changed flow; required for responsive changes. |
| Short desktop window | `1280 × 600` | Mouse and keyboard | Verify selection and battle controls remain reachable without clipped content. Check Chrome plus any browser affected by the change. |
| Mobile portrait | `390 × 844` | Touch | Select fighters, start a match, play several turns, and use rematch/change-fighter controls. |
| Mobile landscape | `844 × 390` | Touch | Verify controls remain reachable and no content overlaps or overflows horizontally. |

Use browser responsive mode for viewport coverage and a real touch device when
the change depends on native touch behavior. Safari coverage may use macOS
Safari or iOS Safari. Record the browser versions and any deviations from this
matrix in the pull request.

During every browser run:

- Keep the browser console open from page load through the checked flow.
- Treat uncaught errors, React warnings, failed resource loads, and repeated
  console warnings as failures. Existing unrelated warnings must be documented.
- Confirm mouse/touch controls and keyboard shortcuts produce the same legal
  move and never act during a disabled or resolving state.
- Confirm the full page remains usable at each viewport height; scrolling is
  acceptable, clipped or unreachable controls are not.

## Arcade visual fidelity

Animal Mania's visual baseline is a cohesive, low-fi 1990s pixel-art arcade
presentation: crisp hard-edged sprites, chunky readable silhouettes, simplified
surface detail, side-view arenas, a limited high-contrast interface palette,
pixel typography, and brief stepped motion. The exact character, arena, prompt,
and review contract lives in the [animal art style guide](animal-art-style-guide.md).

Consistency does not mean freezing the current quality forever. The baseline
may improve through an intentional, reviewed art-direction update that is
applied consistently across the affected roster, arenas, animations, and UI.
Update this description when that new direction is adopted. A one-off element
that is noticeably more detailed, smoother, flatter, or less polished than the
rest is fidelity drift even when it looks good by itself.

Review changed visuals in the production build at their rendered size, not only
as source files. Compare them side by side with the current shipped set and
check that:

- Portraits, fighter sprites, and arenas keep a crisp low-fi pixel-art
  treatment, deliberate hard edges, chunky silhouettes, broad value groups,
  and a consistent apparent level of shading and texture. Do not mix in
  photorealistic, vector-smooth, microtextured, painterly, or 3D artwork.
- Fighter intent must read from the silhouette at rendered size. Compare every
  changed fighter directly with Tiger, Gorilla, Grizzly Bear, and Polar Bear;
  reject neutral walking, standing, perching, grazing, or swimming anatomy even
  when the palette and pixel grid pass. Apply the body-specific combat grammar
  and five-question gate in the animal art style guide.
- Each animal's portrait and fighter sprite use the same recognizable colors,
  markings, proportions, and outline weight. Transparent edges must stay clean
  when the fighter is flipped or placed over every arena value range.
- Arena settings retain the side-view arcade composition, readable ground
  plane, compatible pixel density, and enough subject/background contrast for
  both fighters. Lighting, perspective, and environmental detail must not make
  one arena feel like a different game.
- UI additions reuse the established navy, gold, cream, orange, red, green, and
  mint system; pixel typography; square borders; hard shadows; and scanline
  treatment unless an intentional style change is approved for the whole game.
- Motion remains brief and stepped like the existing turn cue, health bar, card
  hover, and attack lunge. Avoid smooth cinematic tweening or effects whose
  detail overwhelms the sprites, and confirm `prefers-reduced-motion` still
  removes nonessential animation.

For an animal or arena addition, run `npm run art:check` and
`npm run art:sheet`, then inspect the full roster to catch relative drift.
Render the new fighter as both the home and away combatant against at least two
representative legacy animals over light and dark arenas. For an animation or UI change,
exercise every affected state at desktop and mobile sizes. Record the animals,
arenas, states, and viewports checked in the pull request, along with
side-by-side screenshots when visuals changed. Any unexplained fidelity drift
in either direction blocks release.

## Mechanics and copy review

Whenever mechanics change:

1. Add or update a deterministic test in `src/game.test.js`.
2. Run the seeded balance simulation and summarize any intentional win-rate
   movement in the pull request.
3. Update the affected move `description` in `src/game.js` so displayed copy
   matches the implemented effect.
4. Update **Battle rules** and, when relevant, fighter summaries in `README.md`.
5. Check the rendered damage, accuracy, guard, focus, evasion, and recharge copy
   against the implemented values.

## Release sign-off

A gameplay pull request is ready to merge when all automated checks are green,
the applicable manual matrix is recorded in the pull request, the browser
console is clean, the animal art contract passes, arcade visual fidelity matches the documented art direction,
and mechanics documentation matches the shipped behavior.
