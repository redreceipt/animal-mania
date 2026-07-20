import assert from 'node:assert/strict'
import test from 'node:test'
import { createAnalytics } from './analytics.js'

test('analytics emits stable, flat product events without private room data', () => {
  const events = []
  const analytics = createAnalytics((name, properties) => events.push({ name, properties }))

  analytics.modeSelected('single')
  analytics.fighterSelected({
    mode: 'single',
    fighter: 'tiger',
    player: 'home',
    selection: 'manual',
  })
  analytics.matchStarted({ mode: 'single', homeFighter: 'tiger', awayFighter: 'gorilla' })
  analytics.moveUsed({
    mode: 'single',
    fighter: 'tiger',
    move: 'Claw Swipe',
    moveType: 'attack',
    actor: 'home',
    input: 'keyboard',
  })
  analytics.matchCompleted({
    mode: 'single',
    winnerFighter: 'tiger',
    loserFighter: 'gorilla',
    winnerSide: 'home',
    turns: 8,
  })
  analytics.onlineRoomJoined('link')

  assert.deepEqual(events, [
    { name: 'game_mode_selected', properties: { mode: 'single' } },
    {
      name: 'fighter_selected',
      properties: { mode: 'single', fighter: 'tiger', player: 'home', selection: 'manual' },
    },
    {
      name: 'match_started',
      properties: { mode: 'single', home_fighter: 'tiger', away_fighter: 'gorilla', round: 1 },
    },
    {
      name: 'move_used',
      properties: {
        mode: 'single', fighter: 'tiger', move: 'Claw Swipe', move_type: 'attack',
        actor: 'home', input: 'keyboard', round: 1,
      },
    },
    {
      name: 'match_completed',
      properties: {
        mode: 'single', winner_fighter: 'tiger', loser_fighter: 'gorilla',
        winner_side: 'home', turns: 8, round: 1,
      },
    },
    { name: 'online_room_joined', properties: { source: 'link' } },
  ])
  assert.doesNotMatch(JSON.stringify(events), /room.code|room_code|session|token|url/i)
})
