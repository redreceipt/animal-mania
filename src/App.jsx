import { useCallback, useEffect, useState } from 'react'
import {
  ANIMALS, chooseCpuMove, createFighter, getDamageRange,
  getOpeningActor, resolveAction,
} from './game.js'

const initialSelection = [null, null]
const imagePromises = new Map()

function animalImage(animal, variant) {
  return `/animals/${animal.id}-${variant}.webp`
}

function preloadImage(src) {
  if (imagePromises.has(src)) return imagePromises.get(src)
  const promise = new Promise((resolve) => {
    const image = new Image()
    const finish = () => image.decode?.().catch(() => {}).finally(resolve) ?? resolve()
    image.onload = finish
    image.onerror = resolve
    image.src = src
  })
  imagePromises.set(src, promise)
  return promise
}

function battleImages(homeId, awayId) {
  return [
    `/animals/${homeId}-fighter.webp`,
    `/animals/${awayId}-fighter.webp`,
    `/animals/arena-${homeId}.webp`,
  ]
}

function PixelAnimal({ animal, variant = 'portrait', flip = false }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <span className={`pixel-animal-frame ${variant} ${loaded ? 'loaded' : ''}`} style={{ '--animal-color': animal.color }}>
      <img
        className={`pixel-animal ${loaded ? 'loaded' : ''} ${flip ? 'flip' : ''}`}
        src={animalImage(animal, variant)}
        alt={animal.name}
        width="444"
        height="444"
        decoding="async"
        onLoad={() => setLoaded(true)}
        draggable="false"
      />
    </span>
  )
}

function Logo() {
  return <h1 className="logo"><span>Animal</span> <span>Mania</span></h1>
}

function AttributeLine({ animal }) {
  return (
    <span className="animal-attributes" aria-label={`${animal.health} health, strength ${animal.strength}, defense ${animal.defense}, speed ${animal.speed}`}>
      <span>HP <b>{animal.health}</b></span><span>STR <b>{animal.strength}</b></span><span>DEF <b>{animal.defense}</b></span><span>SPD <b>{animal.speed}</b></span>
    </span>
  )
}

function ModeScreen({ onChoose }) {
  return (
    <main className="arcade-shell mode-screen">
      <header className="game-header"><Logo /><p>Choose your showdown</p></header>
      <section className="mode-options" aria-label="Game mode">
        <button className="mode-card" onClick={() => onChoose('single')}>
          <span className="mode-icon" aria-hidden="true">1P</span>
          <strong>Single player</strong>
          <small>Battle a tactical CPU opponent</small>
        </button>
        <button className="mode-card" onClick={() => onChoose('local')}>
          <span className="mode-icon" aria-hidden="true">2P</span>
          <strong>Local multiplayer</strong>
          <small>Share the screen and settle the score</small>
        </button>
      </section>
    </main>
  )
}

function SelectScreen({ mode, onBack, onStart }) {
  const [selections, setSelections] = useState(initialSelection)
  const [randomOpponent, setRandomOpponent] = useState(false)
  const [preparedAssetKey, setPreparedAssetKey] = useState(null)
  const singlePlayer = mode === 'single'
  const homeId = selections[0]?.id
  const awayId = selections[1]?.id
  const battleAssetKey = homeId && awayId ? `${homeId}:${awayId}` : null
  const ready = Boolean(battleAssetKey)
  const battleAssetsReady = battleAssetKey === preparedAssetKey

  function randomRival(home) {
    const opponents = ANIMALS.filter((animal) => animal.id !== home?.id)
    return opponents[Math.floor(Math.random() * opponents.length)]
  }

  function select(player, animal) {
    setSelections((current) => current.map((value, index) => {
      if (index === player) return animal
      if (player === 0 && index === 1 && randomOpponent) return randomRival(animal)
      return value
    }))
    if (player === 1) setRandomOpponent(false)
  }

  function startMatch() {
    if (!ready || !battleAssetsReady) return
    onStart(selections)
  }

  useEffect(() => {
    if (!homeId || !awayId) return undefined
    let current = true
    Promise.all(battleImages(homeId, awayId).map(preloadImage)).then(() => {
      if (current) setPreparedAssetKey(`${homeId}:${awayId}`)
    })
    return () => { current = false }
  }, [awayId, homeId])

  return (
    <main className="arcade-shell select-screen">
      <header className="game-header"><Logo /><p>{singlePlayer ? 'Pick your fighter and CPU rival' : 'Pick your wild contenders'}</p></header>
      <section className="select-layout">
        {[0, 1].map((player) => (
          <div className={`player-select p${player + 1}`} key={player}>
            <div className="player-heading">
              <span>{singlePlayer && player === 1 ? 'CPU opponent' : `Player ${player + 1}`}</span>
              <b>{player === 1 && randomOpponent ? 'Random!' : selections[player]?.name ?? 'Choose!'}</b>
            </div>
            {singlePlayer && player === 1 ? <button className={`random-btn ${randomOpponent ? 'selected' : ''}`} onClick={() => { setSelections((current) => [current[0], randomRival(current[0])]); setRandomOpponent(true) }} aria-pressed={randomOpponent}>Surprise me · Random rival</button> : null}
            <div className="roster" aria-label={`${singlePlayer && player === 1 ? 'CPU' : `Player ${player + 1}`} animal selection`}>
              {ANIMALS.map((animal) => {
                const selected = selections[player]?.id === animal.id
                return (
                  <button className={`animal-card ${selected ? 'selected' : ''}`} key={animal.id} onClick={() => select(player, animal)} aria-pressed={selected}>
                    <PixelAnimal animal={animal} />
                    <strong>{animal.name}</strong>
                    <AttributeLine animal={animal} />
                    <small>{animal.detail}</small>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>
      <div className="versus-mark" aria-hidden="true">VS</div>
      <footer className="select-footer">
        <p aria-live="polite">{ready ? `${selections[0].name} hosts at ${selections[0].home}. ${battleAssetsReady ? 'Ready!' : 'Preparing arena…'}` : singlePlayer ? 'Choose your home fighter and a CPU rival' : 'Player 1 chooses the home fighter'}</p>
        <div className="select-actions"><button className="secondary-btn" onClick={onBack}>Back</button><button className="primary-btn" disabled={!ready || !battleAssetsReady} onClick={startMatch} aria-busy={ready && !battleAssetsReady}>{ready && !battleAssetsReady ? 'Preparing arena…' : 'Start showdown'}</button></div>
      </footer>
    </main>
  )
}

function HealthBar({ health, maxHealth }) {
  const percent = (health / maxHealth) * 100
  const danger = percent <= 25
  return <div className={`health-track ${danger ? 'danger' : ''}`} aria-label={`${health} of ${maxHealth} health`}><span style={{ width: `${percent}%` }} /></div>
}

function StatusRow({ player }) {
  if (!player.guard && !player.focus && !player.evasion) return <div className="status-row empty">Ready</div>
  return (
    <div className="status-row">
      {player.guard ? <span className="guard-status">◆ Guard {Math.round(player.guard * 100)}%</span> : null}
      {player.focus ? <span className="focus-status">✦ Focused +{Math.round(player.focus * 100)}%</span> : null}
      {player.evasion ? <span className="evasion-status">▲ Evade +{Math.round(player.evasion * 100)}%</span> : null}
    </div>
  )
}

function FighterHud({ player, index, active, label }) {
  return (
    <aside className={`fighter-hud p${index + 1} ${active ? 'active' : ''}`} aria-current={active ? 'step' : undefined}>
      {active ? <span className="turn-indicator" aria-hidden="true">Active turn</span> : null}
      <div className="hud-identity">
        <span>{label ?? `Player ${index + 1}`}</span>
        <strong>{player.animal.name}</strong>
        <AttributeLine animal={player.animal} />
      </div>
      <div className="hud-health">
        <div><HealthBar health={player.health} maxHealth={player.animal.health} /><b>{player.health}/{player.animal.health} HP</b></div>
        <StatusRow player={player} />
      </div>
    </aside>
  )
}

function MoveButton({ animal, move, index, onChoose, disabled }) {
  const defensive = move.type === 'defend'
  const range = getDamageRange(animal, move)
  const attackStats = range ? `${range.min}–${range.max} dmg${range.hits > 1 ? ` ×${range.hits}` : ''} · ${Math.round(move.accuracy * 100)}% hit` : ''
  const defenseStats = [`Guard ${Math.round((move.guard ?? 0) * 100)}%`, move.focus ? `Focus +${Math.round(move.focus * 100)}%` : null, move.evasionGain ? `Evade +${Math.round(move.evasionGain * 100)}%` : null].filter(Boolean).join(' · ')
  return (
    <button className={`move-card ${defensive ? 'defensive' : `attack-${index + 1}`}`} onClick={onChoose} disabled={disabled}>
      <span className="move-key">{index + 1}</span>
      <span className="move-copy">
        <strong>{move.name}</strong>
        <small>{defensive ? defenseStats : attackStats}</small>
        <em>{disabled && defensive ? 'Recharge: attack once' : move.description}</em>
      </span>
    </button>
  )
}

function makeBattle(choices) {
  return { players: choices.map(createFighter), active: getOpeningActor(choices) }
}

function BattleLog({ entries }) {
  return (
    <aside className="battle-log" aria-label="Recent battle log">
      <h3>Battle log</h3>
      <ol>{entries.map((entry, index) => <li key={entry.id}><span>{index + 1}</span>{entry.text}</li>)}</ol>
    </aside>
  )
}

function BattleScreen({ choices, singlePlayer, onReset }) {
  const [opening] = useState(() => makeBattle(choices))
  const [players, setPlayers] = useState(opening.players)
  const [active, setActive] = useState(opening.active)
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState(`${choices[opening.active].name}'s speed wins the opening move!`)
  const [log, setLog] = useState([{ id: 0, text: 'The showdown begins.' }])
  const [resolving, setResolving] = useState(false)
  const [bonusTurn, setBonusTurn] = useState(false)
  const [turnRevision, setTurnRevision] = useState(0)
  const activeMoves = players[active].animal.moves
  const victor = winner === null ? null : players[winner]
  const actorLabel = singlePlayer && active === 1 ? 'CPU' : `Player ${active + 1}`
  const winnerLabel = singlePlayer && winner === 1 ? 'CPU' : `Player ${winner + 1}`
  const turnLabel = victor
    ? `${winnerLabel} wins!`
    : bonusTurn
      ? `${actorLabel} — bonus turn!`
      : singlePlayer && active === 1 ? 'CPU is choosing…' : `${actorLabel} — choose a move`
  const homeArena = choices[0]

  function resetBattle() {
    const freshBattle = makeBattle(choices)
    setPlayers(freshBattle.players)
    setActive(freshBattle.active)
    setWinner(null)
    setMessage(`${choices[freshBattle.active].name}'s speed wins the opening move!`)
    setLog([{ id: 0, text: 'The showdown begins.' }])
    setResolving(false)
    setBonusTurn(false)
    setTurnRevision((current) => current + 1)
  }

  const chooseMove = useCallback((index, isCpuAction = false) => {
    if (resolving || victor) return
    if (singlePlayer && active === 1 && !isCpuAction) return
    const move = activeMoves[index]
    if (!move || (move.type === 'defend' && !players[active].defenseReady)) return
    const result = resolveAction(players, active, move)
    if (!result.log) { setMessage(result.message); return }
    setPlayers(result.players)
    const earnedBonusTurn = result.winner === null && result.nextActive === active
    const speedBonus = earnedBonusTurn ? ` ${players[active].animal.name}'s speed earns another move!` : ''
    setMessage(`${result.message}${speedBonus}`)
    setLog((current) => [{ id: Date.now(), text: `${result.log}${speedBonus}` }, ...current].slice(0, 4))
    setResolving(true)
    setBonusTurn(earnedBonusTurn)
    setTurnRevision((current) => current + 1)
    if (result.winner !== null) setWinner(result.winner)
    else setActive(result.nextActive)
    window.setTimeout(() => setResolving(false), 360)
  }, [active, activeMoves, players, resolving, singlePlayer, victor])

  useEffect(() => {
    if (!singlePlayer || active !== 1 || resolving || winner !== null) return undefined
    const timer = window.setTimeout(() => {
      const move = chooseCpuMove(players, 1)
      chooseMove(activeMoves.indexOf(move), true)
    }, 650)
    return () => window.clearTimeout(timer)
  }, [active, activeMoves, chooseMove, players, resolving, singlePlayer, winner])

  useEffect(() => {
    function keydown(event) {
      if (event.repeat || winner !== null || (singlePlayer && active === 1)) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < 4) {
        event.preventDefault()
        chooseMove(index)
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [active, chooseMove, singlePlayer, winner])

  const commandHint = victor ? `${victor.animal.name} rules the wild!` : `${players[active].animal.name}'s move set`

  return (
    <main className={`arcade-shell battle-screen ${resolving ? 'resolving' : ''}`}>
      <header className="battle-header"><Logo /><button className="text-btn" onClick={onReset}>Change fighters</button></header>
      <section className="hud-row">
        <FighterHud player={players[0]} index={0} active={active === 0 && !victor} label="Home · Player 1" />
        <div key={turnRevision} className={`turn-banner ${bonusTurn ? 'bonus' : ''}`} aria-live="polite">{turnLabel}</div>
        <FighterHud player={players[1]} index={1} active={active === 1 && !victor} label={singlePlayer ? 'Away · CPU' : 'Away · Player 2'} />
      </section>
      <section className="faceoff-arena" style={{ '--arena-image': `url('/animals/arena-${homeArena.id}.webp')` }} aria-label={`${players[0].animal.name} faces ${players[1].animal.name} at ${homeArena.home}`}>
        <div className="arena-plaque"><span>Home arena</span><strong>{homeArena.home}</strong></div>
        <div className="fighter-slot left"><PixelAnimal animal={players[0].animal} variant="fighter" /></div>
        <div className="versus-spark" aria-hidden="true">VS</div>
        <div className="fighter-slot right"><PixelAnimal animal={players[1].animal} variant="fighter" flip /></div>
      </section>
      <p className="battle-message" aria-live="polite">{message}</p>
      <section className="command-zone">
        <div className="move-panel">
          <h2>{victor ? commandHint : `${actorLabel} · ${commandHint}`}</h2>
          {victor ? (
            <div className="victory-actions"><button className="primary-btn" onClick={resetBattle}>Rematch</button><button className="secondary-btn" onClick={onReset}>Change fighters</button></div>
          ) : (
            <div className="move-grid">
              {activeMoves.map((move, index) => <MoveButton key={move.name} animal={players[active].animal} move={move} index={index} onChoose={() => chooseMove(index)} disabled={resolving || (singlePlayer && active === 1) || (move.type === 'defend' && !players[active].defenseReady)} />)}
            </div>
          )}
        </div>
        <BattleLog entries={log} />
      </section>
      <footer className="hint">Strength scales damage · Defense changes damage taken · Speed controls initiative · Choose with buttons or keys 1–4</footer>
    </main>
  )
}

export default function App() {
  const [mode, setMode] = useState(null)
  const [choices, setChoices] = useState(null)

  useEffect(() => {
    ANIMALS.forEach((animal) => preloadImage(animalImage(animal, 'portrait')))
  }, [])

  if (!mode) return <ModeScreen onChoose={setMode} />
  if (!choices) return <SelectScreen mode={mode} onBack={() => setMode(null)} onStart={setChoices} />
  return <BattleScreen choices={choices} singlePlayer={mode === 'single'} onReset={() => setChoices(null)} />
}
