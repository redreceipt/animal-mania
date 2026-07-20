# Animal art style guide

Animal Mania should look like a low-fi 1990s arcade fighting game starring
recognizable animals. The art is bold, compressed, and slightly exaggerated;
it is not wildlife illustration reduced to a small canvas. A beautiful image
that is smoother, more realistic, more finely textured, or more cinematically
lit than the roster is a brand mismatch.

This guide is the release contract for every portrait, fighter, and arena. A
one-animal exception is not allowed. Changing the direction requires a
dedicated, full-roster art-direction pull request.

## Canonical references

Use several shipped references together instead of copying one animal. The
legacy set establishes the brand; the grid-enforced set demonstrates the
required production treatment for new work.

| Shape problem | Legacy brand reference | Grid-enforced production reference |
| --- | --- | --- |
| Upright power | [Tiger fighter](../public/animals/tiger-fighter.webp), [Gorilla fighter](../public/animals/gorilla-fighter.webp) | [Panda fighter](../public/animals/panda-fighter.webp), [Honey Badger fighter](../public/animals/honey-badger-fighter.webp) |
| Long or armored body | [Crocodile fighter](../public/animals/crocodile-fighter.webp), [Anaconda fighter](../public/animals/anaconda-fighter.webp) | [Alligator fighter](../public/animals/alligator-fighter.webp), [King Cobra fighter](../public/animals/king-cobra-fighter.webp) |
| Four-legged silhouette | [Wolf fighter](../public/animals/wolf-fighter.webp), [Water Buffalo fighter](../public/animals/water-buffalo-fighter.webp) | [Leopard fighter](../public/animals/leopard-fighter.webp), [Yak fighter](../public/animals/yak-fighter.webp) |
| Aquatic or unusual anatomy | [Orca fighter](../public/animals/orca-fighter.webp), [Ostrich fighter](../public/animals/ostrich-fighter.webp) | [Dolphin fighter](../public/animals/dolphin-fighter.webp), [Hammerhead Shark fighter](../public/animals/hammerhead-shark-fighter.webp) |
| Portrait crop and attitude | [Tiger portrait](../public/animals/tiger-portrait.webp), [Wolf portrait](../public/animals/wolf-portrait.webp) | [Giraffe portrait](../public/animals/giraffe-portrait.webp), [Warthog portrait](../public/animals/warthog-portrait.webp) |

Generate the complete comparison boards before review:

```bash
npm run art:sheet
```

This writes fighter, portrait, and arena sheets to `.art-review/`. On the two
character boards, cream labels mark frozen legacy references and gold labels
mark assets under the exact grid contract. The arena board uses the same colors
to distinguish the original and recent roster cohorts. Review the sheets at
100% and at the size used by the game.

## Character art contract

Every new or redrawn fighter and portrait must satisfy all of these rules:

- **Canvas:** `444 x 444` lossless WebP with transparency.
- **Logical pixels:** compose on a `111 x 111` logical canvas, then enlarge
  exactly 4x with nearest-neighbor sampling. Every visible source pixel is a
  hard `4 x 4` block in the final file.
- **Palette:** no more than 64 RGBA colors; 12–32 is the preferred working
  range. Use broad value groups, not gradients or noise.
- **Alpha:** only fully transparent or fully opaque pixels. Remove matte,
  chroma-key residue, soft halos, ground shadows, and background color.
- **Outline:** a dark, continuous outline one or two logical pixels wide.
  Interior lines should be fewer and lighter than the silhouette outline.
- **Lighting:** one simple upper-left or frontal key. Describe forms with three
  to five value groups per material. No rim light, colored glow, bloom, depth
  of field, or dramatic backlight.
- **Surface detail:** show only identity-carrying markings. Suggest fur,
  feathers, scales, wrinkles, or skin with a few clustered shapes; do not render
  individual hairs, pores, every scale, or photographic mottling.
- **Anatomy:** recognizable first, arcade-readable second, zoologically exact
  third. Slightly enlarge the head, fists, claws, horns, or other signature
  features when that improves the silhouette.

The normalizer makes the grid, palette, alpha, dimensions, and output format
repeatable:

```bash
npm run art:normalize -- source-with-transparency.png public/animals/animal-id-fighter.webp
npm run art:normalize -- source-with-transparency.png public/animals/animal-id-portrait.webp
npm run art:check
```

The source must already have a clean transparent background. The normalizer is
not a background-removal tool.

### Fighter framing

- Show one complete animal in a side or three-quarter fighting pose, generally
  facing right. The app mirrors the away fighter.
- Keep the silhouette readable at card size. Use a stable stance or clear
  airborne/swimming gesture; avoid tangled limbs and ambiguous anatomy.
- Leave at least one logical pixel of transparent margin on every side. Aim for
  roughly 15–55% visible canvas coverage.
- Do not add weapons, clothes, text, scenery, platforms, cast shadows, frames,
  or particles unless the entire game intentionally adopts that system.

### Portrait framing

- Use a close head-and-shoulders crop with a focused, competitive expression.
- Match the fighter's markings, body colors, proportions, and outline weight.
- Leave at least one logical pixel above the subject. Shoulders may meet the
  bottom and side edges. Aim for roughly 35–75% visible canvas coverage.
- Do not use a full-body miniature, scenic background, floating bust, or
  different lighting setup from the fighter.

## Arena contract

Every arena is an opaque `1942 x 809` WebP with a side-view fighting-game
composition. It needs a clear ground plane, a readable horizon, and enough
light/dark separation for any pair of fighters.

Use chunky pixel clusters and simplified materials. Keep the strongest detail
and contrast away from the two fighter zones. Do not use photographic texture,
realistic depth of field, smooth vector scenery, a different camera angle, or
cinematic lighting that makes the animals look pasted into another game.

Arena files are not forced onto the character grid because their canvas is not
an exact multiple of four. They are still reviewed on the complete arena sheet
and in a real match.

## AI-assisted art prompt

When generation or style transfer is used, provide two or more canonical
references and begin with this constraint block. Species, pose, and markings
belong after it.

> Low-fi 1990s arcade fighting-game animal sprite. Chunky hand-authored pixel
> art with visible square clusters, hard stair-stepped edges, a dark continuous
> outline, simplified anatomy, broad shadow shapes, and a restrained palette.
> Preserve a clear silhouette and only identity-carrying surface markings.
> No photorealism, individual hair or scale microtexture, smooth vector curves,
> painterly blending, 3D rendering, rim light, glow, props, text, scenery, or
> cast shadow.

Generate on a flat key color that does not occur in the subject, remove it to
clean transparency, then use the repository normalizer. A prompt is not proof
of compliance; the normalized asset, full-roster sheet, and production render
are the proof.

## Required review workflow

1. Choose at least two canonical references that cover the animal's body type
   and crop. Record them in the pull request.
2. Create the fighter and portrait as a matched pair. Create the arena against
   the arena sheet, not in isolation.
3. Normalize both character assets and run `npm run art:check`.
4. Run `npm run art:sheet`; inspect the whole roster for relative detail,
   palette, outline, crop, and lighting drift.
5. In the production build, render the new fighter as home and away against at
   least two legacy animals and over both a light and a dark arena. Check
   desktop and mobile at actual rendered size.
6. Attach the comparison evidence and exact matchups/viewports to the pull
   request. Any unexplained style drift blocks release.

`scripts/animal-art-spec.mjs` lists 20 frozen legacy character pairs that
predate the exact logical-pixel rule. All other current and future animals are
automatically grid-enforced. When a legacy character is redrawn, normalize the
pair and remove its id from `LEGACY_CHARACTER_IDS`; its frozen checksums in
`scripts/legacy-animal-art-baseline.json` will then be ignored. Never update a
checksum or add a new exemption merely to make a drifting asset pass.
