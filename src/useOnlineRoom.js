import { useCallback, useEffect, useRef, useState } from 'react'
import { analytics } from './analytics.js'

const SESSION_PREFIX = 'animal-mania-room:'

export function normalizeRoomCode(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
}

function storedToken(code) {
  try {
    return window.sessionStorage.getItem(`${SESSION_PREFIX}${code}`)
  } catch {
    return null
  }
}

function rememberSession(session) {
  try {
    window.sessionStorage.setItem(`${SESSION_PREFIX}${session.code}`, session.token)
  } catch {
    // Private browsing can disable storage; the live connection still works.
  }
}

function roomUrl(code) {
  const url = new URL(window.location.href)
  url.searchParams.set('room', code)
  return url
}

export function useOnlineRoom(initialCode = '') {
  const [target, setTarget] = useState(() => {
    const code = normalizeRoomCode(initialCode)
    return code ? { action: 'join', code, source: 'link' } : null
  })
  const [room, setRoom] = useState(null)
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(target ? 'connecting' : 'idle')
  const [error, setError] = useState(null)
  const socketRef = useRef(null)
  const sessionRef = useRef(null)
  const roomRef = useRef(null)

  useEffect(() => {
    if (!target) return undefined
    let active = true
    let retryTimer
    let socket
    let attempts = 0
    let fatal = false

    function receiveRoom(nextRoom, playerIndex, trackTransitions = false) {
      const previousRoom = roomRef.current

      if (trackTransitions && nextRoom.phase === 'battle'
        && (previousRoom?.phase !== 'battle' || previousRoom.round !== nextRoom.round)) {
        analytics.matchStarted({
          mode: 'online',
          homeFighter: nextRoom.battle.players[0].animalId,
          awayFighter: nextRoom.battle.players[1].animalId,
          round: nextRoom.round,
        })
      }

      if (trackTransitions && nextRoom.phase === 'finished' && previousRoom?.phase !== 'finished') {
        const winnerIndex = nextRoom.battle.winner
        const loserIndex = 1 - winnerIndex
        analytics.matchCompleted({
          mode: 'online',
          winnerFighter: nextRoom.battle.players[winnerIndex].animalId,
          loserFighter: nextRoom.battle.players[loserIndex].animalId,
          winnerSide: winnerIndex === 0 ? 'home' : 'away',
          result: winnerIndex === playerIndex ? 'win' : 'loss',
          turns: nextRoom.battle.revision,
          round: nextRoom.round,
        })
      }

      roomRef.current = nextRoom
      setRoom(nextRoom)
    }

    function connect() {
      if (!active) return
      setStatus(attempts === 0 ? 'connecting' : 'reconnecting')
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${protocol}//${window.location.host}/api/online`)
      socketRef.current = socket

      socket.addEventListener('open', () => {
        if (!active) return
        const currentSession = sessionRef.current
        if (currentSession) {
          socket.send(JSON.stringify({
            type: 'join',
            code: currentSession.code,
            token: currentSession.token,
          }))
          return
        }
        if (target.action === 'create') socket.send(JSON.stringify({ type: 'create' }))
        else socket.send(JSON.stringify({
          type: 'join',
          code: target.code,
          token: storedToken(target.code),
        }))
      })

      socket.addEventListener('message', (event) => {
        if (!active) return
        let message
        try {
          message = JSON.parse(event.data)
        } catch {
          setError('The room sent an unreadable update.')
          return
        }
        if (message.type === 'joined') {
          const firstConnection = !sessionRef.current
          sessionRef.current = message.session
          setSession(message.session)
          receiveRoom(message.room, message.session.playerIndex)
          setStatus('connected')
          setError(null)
          attempts = 0
          rememberSession(message.session)
          window.history.replaceState({}, '', roomUrl(message.session.code))
          if (firstConnection) {
            if (target.action === 'create') analytics.onlineRoomCreated()
            else analytics.onlineRoomJoined(target.source ?? 'code')
          }
        } else if (message.type === 'state') {
          receiveRoom(message.room, message.you, true)
          setSession((current) => current && ({ ...current, playerIndex: message.you }))
          setStatus('connected')
        } else if (message.type === 'error') {
          setError(message.message)
          analytics.onlineRoomError({
            errorCode: message.code,
            stage: roomRef.current?.phase ?? target.action,
          })
          if (['ROOM_NOT_FOUND', 'ROOM_FULL', 'ROOM_EXPIRED', 'NOT_A_PLAYER'].includes(message.code)) {
            fatal = true
            roomRef.current = null
            setRoom(null)
            setStatus('error')
            socket.close()
          }
        }
      })

      socket.addEventListener('close', () => {
        if (!active || fatal) return
        attempts += 1
        setStatus('reconnecting')
        retryTimer = window.setTimeout(connect, Math.min(500 * (2 ** (attempts - 1)), 5000))
      })
    }

    function pagehide() {
      socket?.close(1000, 'Page closed')
    }

    window.addEventListener('pagehide', pagehide)
    connect()
    return () => {
      active = false
      window.removeEventListener('pagehide', pagehide)
      window.clearTimeout(retryTimer)
      socket?.close()
      if (socketRef.current === socket) socketRef.current = null
    }
  }, [target])

  const createRoom = useCallback(() => {
    sessionRef.current = null
    roomRef.current = null
    setSession(null)
    setRoom(null)
    setError(null)
    setTarget({ action: 'create', nonce: Date.now() })
  }, [])

  const joinRoom = useCallback((value) => {
    const code = normalizeRoomCode(value)
    sessionRef.current = null
    roomRef.current = null
    setSession(null)
    setRoom(null)
    setError(null)
    setTarget({ action: 'join', code, source: 'code' })
  }, [])

  const leaveRoom = useCallback(() => {
    analytics.onlineRoomLeft(roomRef.current?.phase ?? 'lobby')
    setTarget(null)
    sessionRef.current = null
    roomRef.current = null
    setSession(null)
    setRoom(null)
    setError(null)
    setStatus('idle')
    const url = new URL(window.location.href)
    url.searchParams.delete('room')
    window.history.replaceState({}, '', url)
  }, [])

  const send = useCallback((payload) => {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setError('Reconnecting to the room. Try again in a moment.')
      return false
    }
    socket.send(JSON.stringify(payload))
    return true
  }, [])

  const selectAnimal = useCallback((animalId) => send({ type: 'select', animalId }), [send])
  const playMove = useCallback((moveIndex, revision) => send({
    type: 'act', moveIndex, revision,
  }), [send])
  const requestRematch = useCallback(() => {
    const sent = send({ type: 'rematch-request' })
    if (sent) analytics.onlineRematchRequested()
    return sent
  }, [send])
  const acceptRematch = useCallback(() => {
    const sent = send({ type: 'rematch-accept' })
    if (sent) analytics.onlineRematchResponded('accepted')
    return sent
  }, [send])
  const declineRematch = useCallback(() => {
    const sent = send({ type: 'rematch-decline' })
    if (sent) analytics.onlineRematchResponded('declined')
    return sent
  }, [send])
  const changeFighters = useCallback(() => {
    const sent = send({ type: 'change-fighters' })
    if (sent) analytics.fightersChanged('online')
    return sent
  }, [send])

  return {
    room,
    session,
    status,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    selectAnimal,
    playMove,
    requestRematch,
    acceptRematch,
    declineRematch,
    changeFighters,
  }
}
