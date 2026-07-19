import { useCallback, useEffect, useRef, useState } from 'react'

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
    return code ? { action: 'join', code } : null
  })
  const [room, setRoom] = useState(null)
  const [session, setSession] = useState(null)
  const [status, setStatus] = useState(target ? 'connecting' : 'idle')
  const [error, setError] = useState(null)
  const socketRef = useRef(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    if (!target) return undefined
    let active = true
    let retryTimer
    let socket
    let attempts = 0
    let fatal = false

    function connect() {
      if (!active) return
      setStatus(attempts === 0 ? 'connecting' : 'reconnecting')
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      socket = new WebSocket(`${protocol}//${window.location.host}/online`)
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
          sessionRef.current = message.session
          setSession(message.session)
          setRoom(message.room)
          setStatus('connected')
          setError(null)
          attempts = 0
          rememberSession(message.session)
          window.history.replaceState({}, '', roomUrl(message.session.code))
        } else if (message.type === 'state') {
          setRoom(message.room)
          setSession((current) => current && ({ ...current, playerIndex: message.you }))
          setStatus('connected')
        } else if (message.type === 'error') {
          setError(message.message)
          if (['ROOM_NOT_FOUND', 'ROOM_FULL', 'ROOM_EXPIRED', 'NOT_A_PLAYER'].includes(message.code)) {
            fatal = true
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
    setSession(null)
    setRoom(null)
    setError(null)
    setTarget({ action: 'create', nonce: Date.now() })
  }, [])

  const joinRoom = useCallback((value) => {
    const code = normalizeRoomCode(value)
    sessionRef.current = null
    setSession(null)
    setRoom(null)
    setError(null)
    setTarget({ action: 'join', code })
  }, [])

  const leaveRoom = useCallback(() => {
    setTarget(null)
    sessionRef.current = null
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

  return {
    room,
    session,
    status,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    selectAnimal: useCallback((animalId) => send({ type: 'select', animalId }), [send]),
    playMove: useCallback((moveIndex, revision) => send({ type: 'act', moveIndex, revision }), [send]),
    requestRematch: useCallback(() => send({ type: 'rematch' }), [send]),
  }
}
