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
required production treatment for new work. Tiger, Gorilla, Grizzly Bear, and
Polar Bear are the fixed combat-style anchors. Their frozen files define the
required stance readability, exaggeration, and attitude even though they
predate the exact logical-pixel rule.

| Shape problem | Fixed or legacy brand reference | Grid-enforced production reference |
| --- | --- | --- |
| Primary combat grammar | [Tiger fighter](../public/animals/tiger-fighter.webp), [Gorilla fighter](../public/animals/gorilla-fighter.webp), [Grizzly Bear fighter](../public/animals/grizzly-bear-fighter.webp), [Polar Bear fighter](../public/animals/polar-bear-fighter.webp) | [Panther fighter](../public/animals/panther-fighter.webp), [Bull fighter](../public/animals/bull-fighter.webp) |
| Compact or tailed scrapper | [Tiger fighter](../public/animals/tiger-fighter.webp), [Wolf fighter](../public/animals/wolf-fighter.webp) | [Dog fighter](../public/animals/dog-fighter.webp), [Skunk fighter](../public/animals/skunk-fighter.webp) |
| Winged body | [Eagle fighter](../public/animals/eagle-fighter.webp), [Ostrich fighter](../public/animals/ostrich-fighter.webp) | [Hawk fighter](../public/animals/hawk-fighter.webp) |
| Long or armored body | [Crocodile fighter](../public/animals/crocodile-fighter.webp), [Anaconda fighter](../public/animals/anaconda-fighter.webp) | [Alligator fighter](../public/animals/alligator-fighter.webp), [King Cobra fighter](../public/animals/king-cobra-fighter.webp) |
| Aquatic or limbless body | [Shark fighter](../public/animals/shark-fighter.webp), [Orca fighter](../public/animals/orca-fighter.webp), [Anaconda fighter](../public/animals/anaconda-fighter.webp) | [Dolphin fighter](../public/animals/dolphin-fighter.webp), [Hammerhead Shark fighter](../public/animals/hammerhead-shark-fighter.webp), [King Cobra fighter](../public/animals/king-cobra-fighter.webp) |
| Portrait crop and attitude | [Tiger portrait](../public/animals/tiger-portrait.webp), [Wolf portrait](../public/animals/wolf-portrait.webp) | [Giraffe portrait](../public/animals/giraffe-portrait.webp), [Warthog portrait](../public/animals/warthog-portrait.webp) |

Generate the complete comparison boards before review:

```bash
npm run art:sheet
```

This writes fighter, portrait, and arena sheets to `.art-review/`. On the two
character boards, cream labels mark frozen legacy references and gold labels
mark assets under the exact grid contract. The fighter board also frames the
four fixed combat-style anchors in cyan. The arena board uses cream and gold to
distinguish the original and recent roster cohorts. Review the sheets at 100%
and at the size used by the game.

## Character art contract

Every new or redrawn fighter and portrait must satisfy all of these rules:

- **Canvas:** `444 x 444` lossless WebP with transparency.
- **Logical pixels:** compose on a `222 x 222` logical canvas, then enlarge
  exactly 2x with nearest-neighbor sampling. Every visible source pixel is a
  hard `2 x 2` block in the final file. The retired 4x grid is too coarse at
  battle size and makes fighters look out of focus beside the legacy anchors;
  an asset that still conforms entirely to that grid fails validation.
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

### Fighter combat-character gate

Passing the file checks is necessary but not sufficient. A fighter fails if it
still looks like a realistic animal that was merely made smaller, pixelated,
or given an angry face. At actual card size, a reviewer must be able to answer
**yes** to every question below within five seconds:

1. Does the silhouette communicate guard, strike, lunge, coil, or another
   immediate combat action without relying on facial detail?
2. Is there a clear line of action and visible body tension rather than a
   neutral walk, stand, perch, graze, or swim?
3. Do at least two major shapes have combat jobs, such as an attacking paw and
   guarding paw, a striking wing and guarding wing, or a threatening head and
   countercurved tail?
4. Are the head, shoulders, paws, claws, hooves, horns, wings, or other
   signature features exaggerated enough to read beside Tiger, Gorilla, and
   the Bears?
5. Does the result feel like a character from the same fighting game rather
   than a wildlife illustration in the same pixel format?

Use the body grammar that fits the species:

| Body type | Required combat grammar | Automatic rejection |
| --- | --- | --- |
| Mammal or reptile that can rear | Lift the torso; plant or bend the hind legs; assign the forelimbs clear offense/guard roles; broaden the shoulders and striking shapes. | Ordinary quadruped walk, stalk, or charge with no guard; realistic body with only an angry face. |
| Bird | Plant or clearly direct the talons; use asymmetrical wing shapes as strike and guard; keep the beak and gaze on the attack line. | Perched bird, neutral standing bird, decorative symmetrical wings, or ordinary flight. |
| Aquatic, serpentine, or genuinely limbless | Keep the authentic body plan; use a tense C- or S-shaped attack arc, threatening head, and counterdirected fins, coil, or tail. | Straight documentary swim, scenic leap, loose resting coil, or invented humanoid legs. |

Symmetry, relaxed joints, evenly distributed weight, and a level spine usually
signal neutral wildlife. Prefer asymmetry, compression, forward pressure, and
one dominant attack direction. Species recognition is mandatory, but realism
never overrides the combat read.

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
> outline, simplified exaggerated anatomy, broad shadow shapes, and a
> restrained palette. It must read as a playable combat character at thumbnail
> size, not as wildlife art. Preserve a clear silhouette and only
> identity-carrying surface markings.
> No photorealism, individual hair or scale microtexture, smooth vector curves,
> painterly blending, 3D rendering, rim light, glow, props, text, scenery, or
> cast shadow.

After that block, specify the line of action, planted or airborne base, which
major shape attacks, which major shape guards, the exaggerated species feature,
and the neutral wildlife pose to reject. “Fighting pose” by itself is not a
sufficient direction.

Generate on a flat key color that does not occur in the subject, remove it to
clean transparency, then use the repository normalizer. A prompt is not proof
of compliance; the normalized asset, five-second combat-character gate,
full-roster sheet, and production render are the proof.

## Required review workflow

1. Choose at least two canonical references that cover the animal's body type
   and crop. Record them in the pull request.
2. Create the fighter and portrait as a matched pair. Create the arena against
   the arena sheet, not in isolation.
3. Normalize both character assets and run `npm run art:check`.
4. Run `npm run art:sheet`; place the candidate beside the cyan-framed combat
   anchors and inspect the whole roster for combat silhouette, exaggeration,
   relative detail, palette, outline, crop, and lighting drift. Record the
   five combat-character answers for every changed fighter.
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
