import { track } from '@vercel/analytics/react'

function compact(properties) {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  )
}

export function createAnalytics(sendEvent = track) {
  function emit(name, properties = {}) {
    sendEvent(name, compact(properties))
  }

  return {
    modeSelected: (mode) => emit('game_mode_selected', { mode }),
    selectionExited: (mode) => emit('fighter_selection_exited', { mode }),
    fighterSelected: ({ mode, fighter, player, selection }) => emit('fighter_selected', {
      mode,
      fighter,
      player,
      selection,
    }),
    matchStarted: ({ mode, homeFighter, awayFighter, round = 1 }) => emit('match_started', {
      mode,
      home_fighter: homeFighter,
      away_fighter: awayFighter,
      round,
    }),
    moveUsed: ({ mode, fighter, move, moveType, actor, input, round = 1 }) => emit('move_used', {
      mode,
      fighter,
      move,
      move_type: moveType,
      actor,
      input,
      round,
    }),
    matchCompleted: ({
      mode,
      winnerFighter,
      loserFighter,
      winnerSide,
      result,
      turns,
      round = 1,
    }) => emit('match_completed', {
      mode,
      winner_fighter: winnerFighter,
      loser_fighter: loserFighter,
      winner_side: winnerSide,
      result,
      turns,
      round,
    }),
    fightersChanged: (mode) => emit('fighters_changed', { mode }),
    rematchStarted: (mode) => emit('rematch_started', { mode }),
    onlineRoomCreated: () => emit('online_room_created'),
    onlineRoomJoined: (source) => emit('online_room_joined', { source }),
    onlineRoomError: ({ errorCode, stage }) => emit('online_room_error', {
      error_code: errorCode,
      stage,
    }),
    onlineRoomLeft: (stage) => emit('online_room_left', { stage }),
    onlineRoomLinkCopied: () => emit('online_room_link_copied'),
    onlineRematchRequested: () => emit('online_rematch_requested'),
    onlineRematchResponded: (response) => emit('online_rematch_responded', { response }),
  }
}

export const analytics = createAnalytics()
