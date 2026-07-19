import { randomUUID } from 'node:crypto'
import {
  ANIMALS, createFighter, getOpeningActor, resolveAction,
} from '../src/game.js'

export const ROOM_TTL_MS = 30 * 60 * 1000

const ADJECTIVES = [
  'amber', 'ancient', 'bold', 'brave', 'bright', 'calm', 'clever', 'cosmic',
  'crimson', 'daring', 'dusky', 'eager', 'fierce', 'frosty', 'gentle', 'golden',
  'grand', 'happy', 'hidden', 'jolly', 'lively', 'lucky', 'mighty', 'misty',
  'noble', 'quiet', 'rapid', 'royal', 'rugged', 'shady', 'silver', 'solar',
  'steady', 'stormy', 'sunny', 'swift', 'tiny', 'valiant', 'velvet', 'vivid',
  'warm', 'wild', 'wise', 'witty', 'zesty', 'agile', 'coral', 'dapper',
]

const CREATURES = [
  'badger', 'beaver', 'bison', 'bobcat', 'condor', 'cougar', 'coyote', 'crane',
  'dolphin', 'eagle', 'falcon', 'fox', 'gecko', 'heron', 'ibis', 'jaguar',
  'koala', 'lemur', 'leopard', 'lynx', 'marmot', 'moose', 'otter', 'owl',
  'panda', 'panther', 'parrot', 'puma', 'rabbit', 'raven', 'seal', 'shark',
  'sloth', 'sparrow', 'stoat', 'swan', 'tiger', 'toucan', 'turtle', 'walrus',
  'weasel', 'whale', 'wolf', 'wombat', 'yak', 'zebra', 'orca', 'rhino',
]

const PLACES = [
  'acorn', 'bay', 'bluff', 'brook', 'canyon', 'cedar', 'cliff', 'cloud',
  'coral', 'cove', 'creek', 'dawn', 'delta', 'dune', 'ember', 'fern',
  'field', 'fjord', 'forest', 'glade', 'grove', 'harbor', 'haven', 'hill',
  'island', 'lagoon', 'lake', 'maple', 'marsh', 'meadow', 'mesa', 'moon',
  'oasis', 'ocean', 'orchard', 'peak', 'pine', 'pond', 'rain', 'reef',
  'ridge', 'river', 'shore', 'spruce', 'star', 'stone', 'summit', 'willow',
]

const ANIMALS_BY_ID = new Map(ANIMALS.map((animal) => [animal.id, animal]))
const ROOM_CODE_PATTERN = /^[a-z]+-[a-z]+-[a-z]+$/

export class RoomError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'RoomError'
    this.code = code
  }
}

export function normalizeRoomCode(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}

function serializeFighter({ animal, ...fighter }) {
  return { ...fighter, animalId: animal.id }
}

function createPlayer(token) {
  return { token, connected: true, animalId: null }
}

export class RoomStore {
  constructor({
    now = Date.now,
    random = Math.random,
    tokenFactory = randomUUID,
    ttlMs = ROOM_TTL_MS,
  } = {}) {
    this.now = now
    this.random = random
    this.tokenFactory = tokenFactory
    this.ttlMs = ttlMs
    this.rooms = new Map()
  }

  createRoom() {
    this.cleanupExpired()
    const code = this.#uniqueCode()
    const token = this.tokenFactory()
    const timestamp = this.now()
    const room = {
      code,
      createdAt: timestamp,
      updatedAt: timestamp,
      players: [createPlayer(token), null],
      battle: null,
      rematch: null,
      round: 0,
    }
    this.rooms.set(code, room)
    return { code, token, playerIndex: 0, room: this.snapshot(room) }
  }

  joinRoom(rawCode, requestedToken = null) {
    this.cleanupExpired()
    const code = normalizeRoomCode(rawCode)
    if (!ROOM_CODE_PATTERN.test(code)) {
      throw new RoomError('ROOM_NOT_FOUND', 'That room code is not valid.')
    }
    const room = this.rooms.get(code)
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 'That room was not found or has expired.')

    let playerIndex = room.players.findIndex((player) => player?.token === requestedToken)
    let token = requestedToken
    if (playerIndex === -1) {
      playerIndex = room.players.findIndex((player) => player === null)
      if (playerIndex === -1) throw new RoomError('ROOM_FULL', 'That room already has two players.')
      token = this.tokenFactory()
      room.players[playerIndex] = createPlayer(token)
    }

    room.players[playerIndex].connected = true
    this.#touch(room)
    return { code, token, playerIndex, room: this.snapshot(room) }
  }

  disconnect(rawCode, token) {
    const room = this.rooms.get(normalizeRoomCode(rawCode))
    const playerIndex = room?.players.findIndex((player) => player?.token === token) ?? -1
    if (playerIndex === -1) return null
    room.players[playerIndex].connected = false
    this.#touch(room)
    return this.snapshot(room)
  }

  selectAnimal(rawCode, token, animalId) {
    const { room, playerIndex } = this.#member(rawCode, token)
    if (room.battle) throw new RoomError('MATCH_STARTED', 'Fighter selection is closed for this round.')
    if (!ANIMALS_BY_ID.has(animalId)) throw new RoomError('INVALID_ANIMAL', 'Choose a fighter from the roster.')
    room.players[playerIndex].animalId = animalId
    this.#touch(room)
    if (room.players.every((player) => player?.animalId)) this.#startBattle(room)
    return this.snapshot(room)
  }

  playMove(rawCode, token, moveIndex, expectedRevision) {
    const { room, playerIndex } = this.#member(rawCode, token)
    if (!room.battle || room.battle.winner !== null) {
      throw new RoomError('MATCH_NOT_ACTIVE', 'There is no active match in this room.')
    }
    if (room.players.some((player) => !player.connected)) {
      throw new RoomError('PLAYER_DISCONNECTED', 'The match is paused until both players reconnect.')
    }
    if (expectedRevision !== room.battle.revision) {
      throw new RoomError('STALE_ACTION', 'The battle changed before that move arrived.')
    }
    if (room.battle.active !== playerIndex) throw new RoomError('OUT_OF_TURN', 'Wait for your turn.')
    if (!Number.isInteger(moveIndex)) throw new RoomError('INVALID_MOVE', 'Choose a valid move slot.')

    const activePlayer = room.battle.players[playerIndex]
    const move = activePlayer.animal.moves[moveIndex]
    if (!move || (move.type === 'defend' && !activePlayer.defenseReady)) {
      throw new RoomError('INVALID_MOVE', 'That move is not available right now.')
    }

    const acting = room.battle.active
    const result = resolveAction(room.battle.players, acting, move, this.random)
    if (!result.log) throw new RoomError('INVALID_MOVE', result.message)
    const earnedBonusTurn = result.winner === null && result.nextActive === acting
    const speedBonus = earnedBonusTurn
      ? ` ${room.battle.players[acting].animal.name}'s speed earns another move!`
      : ''
    room.battle.players = result.players
    room.battle.active = result.nextActive
    room.battle.winner = result.winner
    room.battle.message = `${result.message}${speedBonus}`
    room.battle.bonusTurn = earnedBonusTurn
    room.battle.revision += 1
    room.battle.log = [
      { id: room.battle.revision, text: `${result.log}${speedBonus}` },
      ...room.battle.log,
    ].slice(0, 4)
    this.#touch(room)
    return this.snapshot(room)
  }

  requestRematch(rawCode, token) {
    const { room, playerIndex } = this.#finishedMatchMember(rawCode, token)
    if (room.rematch?.status === 'pending') {
      if (room.rematch.requester === playerIndex) return this.snapshot(room)
      throw new RoomError('REMATCH_ALREADY_PENDING', 'Respond to the rival\'s rematch request instead.')
    }
    room.rematch = { requester: playerIndex, status: 'pending' }
    this.#touch(room)
    return this.snapshot(room)
  }

  acceptRematch(rawCode, token) {
    const { room, playerIndex } = this.#finishedMatchMember(rawCode, token)
    this.#requireRematchResponse(room, playerIndex)
    this.#startBattle(room)
    this.#touch(room)
    return this.snapshot(room)
  }

  declineRematch(rawCode, token) {
    const { room, playerIndex } = this.#finishedMatchMember(rawCode, token)
    this.#requireRematchResponse(room, playerIndex)
    room.rematch = { ...room.rematch, status: 'declined' }
    this.#touch(room)
    return this.snapshot(room)
  }

  snapshot(roomOrCode) {
    const room = typeof roomOrCode === 'string' ? this.rooms.get(roomOrCode) : roomOrCode
    if (!room) return null
    return {
      code: room.code,
      phase: room.battle ? (room.battle.winner === null ? 'battle' : 'finished')
        : room.players[1] ? 'selecting' : 'waiting',
      round: room.round,
      players: room.players.map((player) => player && ({
        connected: player.connected,
        animalId: player.animalId,
      })),
      rematch: room.rematch && { ...room.rematch },
      battle: room.battle && {
        players: room.battle.players.map(serializeFighter),
        active: room.battle.active,
        winner: room.battle.winner,
        message: room.battle.message,
        bonusTurn: room.battle.bonusTurn,
        revision: room.battle.revision,
        log: room.battle.log,
      },
    }
  }

  cleanupExpired() {
    const cutoff = this.now() - this.ttlMs
    const expired = []
    for (const [code, room] of this.rooms) {
      if (room.updatedAt <= cutoff) {
        this.rooms.delete(code)
        expired.push(code)
      }
    }
    return expired
  }

  #member(rawCode, token) {
    this.cleanupExpired()
    const code = normalizeRoomCode(rawCode)
    const room = this.rooms.get(code)
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 'That room was not found or has expired.')
    const playerIndex = room.players.findIndex((player) => player?.token === token)
    if (playerIndex === -1) throw new RoomError('NOT_A_PLAYER', 'Reconnect with the browser that joined this room.')
    return { room, playerIndex }
  }

  #finishedMatchMember(rawCode, token) {
    const member = this.#member(rawCode, token)
    if (!member.room.battle || member.room.battle.winner === null) {
      throw new RoomError('MATCH_NOT_FINISHED', 'Finish the current match before requesting a rematch.')
    }
    return member
  }

  #requireRematchResponse(room, playerIndex) {
    if (room.rematch?.status !== 'pending') {
      throw new RoomError('REMATCH_NOT_PENDING', 'There is no rematch request to answer.')
    }
    if (room.rematch.requester === playerIndex) {
      throw new RoomError('REMATCH_REQUESTER', 'Only the receiving player can answer this rematch request.')
    }
  }

  #startBattle(room) {
    const animals = room.players.map((player) => ANIMALS_BY_ID.get(player.animalId))
    const active = getOpeningActor(animals, this.random)
    room.round += 1
    room.rematch = null
    room.battle = {
      players: animals.map(createFighter),
      active,
      winner: null,
      message: `${animals[active].name}'s speed wins the opening move!`,
      bonusTurn: false,
      revision: 0,
      log: [{ id: 0, text: `Round ${room.round} begins.` }],
    }
  }

  #touch(room) {
    room.updatedAt = this.now()
  }

  #uniqueCode() {
    const combinations = ADJECTIVES.length * CREATURES.length * PLACES.length
    if (this.rooms.size >= combinations) throw new RoomError('ROOM_LIMIT', 'No room codes are available right now.')
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const code = [ADJECTIVES, CREATURES, PLACES]
        .map((words) => words[Math.floor(this.random() * words.length)])
        .join('-')
      if (!this.rooms.has(code)) return code
    }
    for (const adjective of ADJECTIVES) {
      for (const creature of CREATURES) {
        for (const place of PLACES) {
          const code = `${adjective}-${creature}-${place}`
          if (!this.rooms.has(code)) return code
        }
      }
    }
    throw new RoomError('ROOM_LIMIT', 'No room codes are available right now.')
  }
}
