import { useEffect, useMemo, useState } from 'react'
import { ANIMALS, ATTACK_DAMAGE, isAdjacent, MAX_HEALTH, movePlayer, START_POSITIONS } from './game.js'

const initialSelection = [null, null]

function PixelAnimal({ animal, variant = 'portrait', flip = false }) {
  return (
    <span
      className={`pixel-animal ${variant} ${flip ? 'flip' : ''}`}
      style={{ '--sprite-column': animal.col }}
      role="img"
      aria-label={animal.name}
    />
  )
}

function Logo() {
  return <h1 className="logo"><span>Animal</span> <span>Mania</span></h1>
}

function SelectScreen({ onStart }) {
  const [selections, setSelections] = useState(initialSelection)
  const ready = selections.every(Boolean)

  function select(player, animal) {
    setSelections((current) => current.map((value, index) => index === player ? animal : value))
  }

  return (
    <main className="arcade-shell select-screen">
      <header className="game-header"><Logo /><p>Pick your wild contender</p></header>
      <section className="select-layout">
        {[0, 1].map((player) => (
          <div className={`player-select p${player + 1}`} key={player}>
            <div className="player-heading"><span>Player {player + 1}</span><b>{selections[player]?.name ?? 'Choose!'}</b></div>
            <div className="roster" aria-label={`Player ${player + 1} animal selection`}>
              {ANIMALS.map((animal) => {
                const selected = selections[player]?.id === animal.id
                return (
                  <button className={`animal-card ${selected ? 'selected' : ''}`} key={animal.id} onClick={() => select(player, animal)} aria-pressed={selected}>
                    <PixelAnimal animal={animal} />
                    <strong>{animal.name}</strong>
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
        <p>{ready ? `${selections[0].name} versus ${selections[1].name}. Ready!` : 'Each player chooses one fighter'}</p>
        <button className="primary-btn" disabled={!ready} onClick={() => onStart(selections)}>Start showdown</button>
      </footer>
    </main>
  )
}

function HealthBar({ health }) {
  const percent = (health / MAX_HEALTH) * 100
  return <div className="health-track" aria-label={`${health} of ${MAX_HEALTH} health`}><span style={{ width: `${percent}%` }} /></div>
}

function PlayerPanel({ player, index, active }) {
  return (
    <aside className={`player-panel p${index + 1} ${active ? 'active' : ''}`}>
      <p>Player {index + 1}</p>
      <PixelAnimal animal={player.animal} flip={index === 1} />
      <h2>{player.animal.name}</h2>
      <HealthBar health={player.health} />
      <strong>{player.health}/{MAX_HEALTH} HP</strong>
    </aside>
  )
}

function BattleScreen({ choices, onReset }) {
  const [players, setPlayers] = useState(() => choices.map((animal, index) => ({ animal, health: MAX_HEALTH, ...START_POSITIONS[index] })))
  const [active, setActive] = useState(0)
  const [moved, setMoved] = useState(false)
  const [attacked, setAttacked] = useState(false)
  const [message, setMessage] = useState(`Player 1: close the distance!`)
  const winner = useMemo(() => players.findIndex((player) => player.health <= 0), [players])
  const victor = winner >= 0 ? 1 - winner : null
  const canAttack = !attacked && !victor && isAdjacent(players[active], players[1 - active])

  function endTurn() {
    if (victor !== null) return
    const next = 1 - active
    setActive(next); setMoved(false); setAttacked(false)
    setMessage(`Player ${next + 1}: make your move!`)
  }

  function move(dx, dy) {
    if (moved || victor !== null) return
    const updated = movePlayer(players, active, dx, dy)
    if (updated === players) { setMessage('That path is blocked.'); return }
    setPlayers(updated); setMoved(true); setMessage('Move complete. Attack or end turn.')
  }

  function attack() {
    if (!canAttack) { setMessage(attacked ? 'You already attacked.' : 'Get next to your opponent first!'); return }
    const target = 1 - active
    const nextHealth = Math.max(0, players[target].health - ATTACK_DAMAGE)
    setPlayers((current) => current.map((player, index) => index === target ? { ...player, health: nextHealth } : player))
    setAttacked(true)
    setMessage(nextHealth === 0 ? `Player ${active + 1} wins the showdown!` : `Direct hit! ${ATTACK_DAMAGE} damage.`)
  }

  useEffect(() => {
    function keydown(event) {
      const directions = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }
      if (directions[event.key]) { event.preventDefault(); move(...directions[event.key]) }
      if (event.key.toLowerCase() === 'a') attack()
      if (event.key === 'Enter') endTurn()
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })

  return (
    <main className="arcade-shell battle-screen">
      <header className="battle-header"><Logo /><button className="text-btn" onClick={onReset}>New match</button></header>
      <section className="battle-layout">
        <PlayerPanel player={players[0]} index={0} active={active === 0 && victor === null} />
        <div className="arena-wrap">
          <div className="turn-banner">{victor !== null ? `Player ${victor + 1} wins!` : `Player ${active + 1} turn`}</div>
          <div className="arena" role="grid" aria-label="5 by 3 battle grid">
            {Array.from({ length: 15 }, (_, i) => {
              const x = i % 5; const y = Math.floor(i / 5)
              const occupant = players.findIndex((player) => player.x === x && player.y === y)
              return <div className="tile" role="gridcell" key={i}>{occupant >= 0 && <PixelAnimal animal={players[occupant].animal} variant="fighter" flip={occupant === 1} />}</div>
            })}
          </div>
          <p className="battle-message" aria-live="polite">{message}</p>
        </div>
        <PlayerPanel player={players[1]} index={1} active={active === 1 && victor === null} />
      </section>
      <section className="controls" aria-label="Battle actions">
        <div className="move-pad">
          <button onClick={() => move(0, -1)} disabled={moved || victor !== null} aria-label="Move up">▲</button>
          <button onClick={() => move(-1, 0)} disabled={moved || victor !== null} aria-label="Move left">◀</button>
          <button onClick={() => move(1, 0)} disabled={moved || victor !== null} aria-label="Move right">▶</button>
          <button onClick={() => move(0, 1)} disabled={moved || victor !== null} aria-label="Move down">▼</button>
        </div>
        <button className="action-btn attack-btn" onClick={attack} disabled={!canAttack}>Attack <small>A key</small></button>
        <button className="action-btn end-btn" onClick={endTurn} disabled={victor !== null}>End turn <small>Enter</small></button>
        {victor !== null && <button className="action-btn replay-btn" onClick={onReset}>Play again</button>}
      </section>
      <footer className="hint">Move once + attack once each turn · Arrow keys / A / Enter</footer>
    </main>
  )
}

export default function App() {
  const [choices, setChoices] = useState(null)
  return choices ? <BattleScreen choices={choices} onReset={() => setChoices(null)} /> : <SelectScreen onStart={setChoices} />
}
