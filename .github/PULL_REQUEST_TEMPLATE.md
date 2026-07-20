## Summary

<!-- What changed, and why? -->

## Validation

<!-- List the commands and manual checks you ran. -->

## Gameplay release checklist

Complete this section for changes to mechanics, balance, move copy, battle
rules, controls, animal/arena art, or responsive gameplay UI. For other changes, mark the section
`N/A` and explain why. See the
[gameplay release quality checklist](https://github.com/redreceipt/animal-mania/blob/main/docs/gameplay-release-checklist.md) for
commands, scenarios, and the browser/viewport matrix.

- [ ] Mechanics tests pass, with focused coverage added or updated for changed behavior.
- [ ] Seeded balance simulations pass across every animal pairing; balance movement is summarized above.
- [ ] Keyboard (`1`–`4`) and pointer interactions pass.
- [ ] Touch interactions pass on a real or emulated touch device.
- [ ] Desktop and mobile layouts pass.
- [ ] Multiple viewport heights pass, including a short desktop window (`1280 × 600`).
- [ ] Responsive changes pass in Chrome, Firefox, and Safari (record versions above).
- [ ] Animal, animation, arena, and UI fidelity matches the documented arcade art direction; changed visuals were compared side by side at rendered size.
- [ ] Motion keeps the established stepped arcade timing, and reduced-motion behavior passes.
- [ ] `npm run build` succeeds from a clean install.
- [ ] Checked flows produce no browser console errors or warnings.
- [ ] Move descriptions and `README.md` battle rules match any mechanics changes.
- [ ] All required CI checks are green.

### N/A explanations or follow-ups

<!-- Explain unchecked items. Link a follow-up issue for any accepted gap. -->

## Animal art checklist

Complete this section for portrait, fighter, or arena changes. For other pull
requests, mark it `N/A`. Follow the
[animal art style guide](https://github.com/redreceipt/animal-mania/blob/main/docs/animal-art-style-guide.md).

- [ ] Character assets were passed through `npm run art:normalize`; `npm run art:check` passes.
- [ ] `npm run art:sheet` was reviewed at full-roster scale against the canonical references.
- [ ] Every changed fighter passes all five combat-character questions: action reads from silhouette, body is tense rather than neutral wildlife, major shapes have attack/guard roles, species features are exaggerated, and the result belongs beside Tiger/Gorilla/Grizzly Bear/Polar Bear.
- [ ] Upright, winged, and aquatic/limbless fighters follow the documented body grammar; any exception is explained with rendered-size evidence below.
- [ ] Portrait and fighter share identity, palette, markings, outline weight, and apparent detail.
- [ ] Fighter framing, clean transparency, and arena contrast pass in the production build as both home and away combatants.
- [ ] No photorealism, smooth rendering, microtexture, cinematic lighting, or one-off detail drift was introduced.

### Animal art evidence or N/A explanation

<!-- List references, five combat-character answers per changed fighter, review-sheet paths/screenshots, matchups, arenas, and viewports checked. -->
