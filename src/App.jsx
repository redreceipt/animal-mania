import { useEffect, useState } from 'react'
import { ANIMALS, createFighter, getDamageRange, getOpeningActor, MAX_HEALTH, resolveAction } from './game.js'

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

function AttributeLine({ animal }) {
  return (
    <span className="animal-attributes" aria-label={`Strength ${animal.strength}, speed ${animal.speed}`}>
      <span>STR <b>{animal.strength}</b></span><span>SPD <b>{animal.speed}</b></span>
    </span>
  )
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
        <p>{ready ? `${selections[0].name} versus ${selections[1].name}. Ready!` : 'Each player chooses one fighter'}</p>
        <button className="primary-btn" disabled={!ready} onClick={() => onStart(selections)}>Start showdown</button>
      </footer>
    </main>
  )
}

function HealthBar({ health }) {
  const percent = (health / MAX_HEALTH) * 100
  const danger = percent <= 25
  return <div className={`health-track ${danger ? 'danger' : ''}`} aria-label={`${health} of ${MAX_HEALTH} health`}><span style={{ width: `${percent}%` }} /></div>
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

function FighterHud({ player, index, active }) {
  return (
    <aside className={`fighter-hud p${index + 1} ${active ? 'active' : ''}`}>
      <div className="hud-identity">
        <span>Player {index + 1}</span>
        <strong>{player.animal.name}</strong>
        <AttributeLine animal={player.animal} />
      </div>
      <div className="hud-health">
        <div><HealthBar health={player.health} /><b>{player.health}/{MAX_HEALTH} HP</b></div>
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

function BattleScreen({ choices, onReset }) {
  const [opening] = useState(() => makeBattle(choices))
  const [players, setPlayers] = useState(opening.players)
  const [active, setActive] = useState(opening.active)
  const [winner, setWinner] = useState(null)
  const [message, setMessage] = useState(`${choices[opening.active].name}'s speed wins the opening move!`)
  const [log, setLog] = useState([{ id: 0, text: 'The showdown begins.' }])
  const [resolving, setResolving] = useState(false)
  const activeMoves = players[active].animal.moves
  const victor = winner === null ? null : players[winner]
  const turnLabel = victor ? `Player ${winner + 1} wins!` : `Player ${active + 1} — choose a move`

  function resetBattle() {
    const freshBattle = makeBattle(choices)
    setPlayers(freshBattle.players)
    setActive(freshBattle.active)
    setWinner(null)
    setMessage(`${choices[freshBattle.active].name}'s speed wins the opening move!`)
    setLog([{ id: 0, text: 'The showdown begins.' }])
    setResolving(false)
  }

  function chooseMove(index) {
    if (resolving || victor) return
    const move = activeMoves[index]
    if (!move || (move.type === 'defend' && !players[active].defenseReady)) return
    const result = resolveAction(players, active, move)
    if (!result.log) { setMessage(result.message); return }
    setPlayers(result.players)
    const speedBonus = result.winner === null && result.nextActive === active ? ` ${players[active].animal.name}'s speed earns another move!` : ''
    setMessage(`${result.message}${speedBonus}`)
    setLog((current) => [{ id: Date.now(), text: `${result.log}${speedBonus}` }, ...current].slice(0, 4))
    setResolving(true)
    if (result.winner !== null) setWinner(result.winner)
    else setActive(result.nextActive)
    window.setTimeout(() => setResolving(false), 360)
  }

  useEffect(() => {
    function keydown(event) {
      if (event.repeat || winner !== null) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < 4) {
        event.preventDefault()
        chooseMove(index)
      }
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  })

  const commandHint = victor ? `${victor.animal.name} rules the wild!` : `${players[active].animal.name}'s move set`

  return (
    <main className={`arcade-shell battle-screen ${resolving ? 'resolving' : ''}`}>
      <header className="battle-header"><Logo /><button className="text-btn" onClick={onReset}>New match</button></header>
      <section className="hud-row">
        <FighterHud player={players[0]} index={0} active={active === 0 && !victor} />
        <div className="turn-banner" aria-live="polite">{turnLabel}</div>
        <FighterHud player={players[1]} index={1} active={active === 1 && !victor} />
      </section>
      <section className="faceoff-arena" aria-label={`${players[0].animal.name} faces ${players[1].animal.name}`}>
        <div className="fighter-slot left"><PixelAnimal animal={players[0].animal} variant="fighter" /></div>
        <div className="versus-spark" aria-hidden="true">VS</div>
        <div className="fighter-slot right"><PixelAnimal animal={players[1].animal} variant="fighter" flip /></div>
      </section>
      <p className="battle-message" aria-live="polite">{message}</p>
      <section className="command-zone">
        <div className="move-panel">
          <h2>{victor ? commandHint : `Player ${active + 1} · ${commandHint}`}</h2>
          {victor ? (
            <div className="victory-actions"><button className="primary-btn" onClick={resetBattle}>Rematch</button><button className="secondary-btn" onClick={onReset}>Change fighters</button></div>
          ) : (
            <div className="move-grid">
              {activeMoves.map((move, index) => <MoveButton key={move.name} animal={players[active].animal} move={move} index={index} onChoose={() => chooseMove(index)} disabled={resolving || (move.type === 'defend' && !players[active].defenseReady)} />)}
            </div>
          )}
        </div>
        <BattleLog entries={log} />
      </section>
      <footer className="hint">Strength scales damage · Speed controls initiative · Choose with buttons or keys 1–4</footer>
    </main>
  )
}

export default function App() {
  const [choices, setChoices] = useState(null)
  return choices ? <BattleScreen choices={choices} onReset={() => setChoices(null)} /> : <SelectScreen onStart={setChoices} />
}
