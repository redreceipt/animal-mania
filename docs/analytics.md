# Product analytics

Animal Mania uses Vercel Web Analytics for pageviews and custom product events.
The event taxonomy follows the player journey from mode selection through match
completion, with online-room events covering the invite and rematch funnels.

| Event | When it is sent | Useful properties |
| --- | --- | --- |
| `game_mode_selected` | A player chooses single, local, or online play | `mode` |
| `fighter_selection_exited` | A player backs out of local fighter selection | `mode` |
| `fighter_selected` | A player chooses or randomizes a fighter | `mode`, `fighter`, `player`, `selection` |
| `match_started` | Both fighters are ready and a match begins | `mode`, `home_fighter`, `away_fighter`, `round` |
| `move_used` | A legal move is submitted | `mode`, `fighter`, `move`, `move_type`, `actor`, `input`, `round` |
| `match_completed` | A match gets a winner | `mode`, `winner_fighter`, `loser_fighter`, `winner_side`, `result`, `turns`, `round` |
| `fighters_changed` | A player returns to fighter selection from a match | `mode` |
| `rematch_started` | A local or single-player rematch begins | `mode` |
| `online_room_created` | A private room is successfully created | none |
| `online_room_joined` | A player successfully joins from a code or link | `source` |
| `online_room_error` | The online server rejects an action | `error_code`, `stage` |
| `online_room_left` | A player leaves the online flow | `stage` |
| `online_room_link_copied` | A host copies the private invite link | none |
| `online_rematch_requested` | A player sends an online rematch request | none |
| `online_rematch_responded` | A rival accepts or declines a rematch | `response` |

## Privacy contract

Events use only gameplay categories and public fighter or move names. Never add
room codes, join URLs, session tokens, free-form player input, or other unique
identifiers to event properties. The Analytics `beforeSend` hook also removes
the `room` query parameter from every reported URL.

Custom events are sent only when the Vercel Analytics script is active. Local
development remains quiet unless a test installs a `window.va` event collector.
Online match events are emitted once per browser participant; the optional
`result` property records that participant's win or loss.
