import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabase'

function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }

  return code
}

function Home({ onCreate, onJoin }) {
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">PROTOCOL</p>

        <h1>
          Two players.
          <br />
          Two screens.
          <br />
          One game.
        </h1>

        <p className="intro">
          A private narrative game for two adults.
          Your choices will not always be shared.
        </p>

        <button className="primary" onClick={onCreate}>
          Create a game
        </button>

        <button className="secondary" onClick={onJoin}>
          Join a game
        </button>

        <p className="footer">
          Prototype · Chapter 01: The Pact
        </p>
      </section>
    </main>
  )
}

function Lobby({ gameCode, onBack, onBegin }) {
  const [playerCount, setPlayerCount] = useState(1)
  const [status, setStatus] = useState('waiting')

  useEffect(() => {
    async function loadGame() {
      const { data, error } = await supabase
        .from('games')
        .select('player_count, status')
        .eq('code', gameCode)
        .single()

      if (!error && data) {
        setPlayerCount(data.player_count)
        setStatus(data.status)
      }
    }

    loadGame()

    const channel = supabase
      .channel(`game-${gameCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          const updatedGame = payload.new

          setPlayerCount(updatedGame.player_count)
          setStatus(updatedGame.status)

          if (updatedGame.status === 'calibrating') {
  onBegin()
}
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode])

  async function beginCalibration() {
  const { error } = await supabase
    .from('games')
    .update({
      status: 'calibrating',
    })
    .eq('code', gameCode)

  if (error) {
    console.error(error)
  }
}
  
  const isReady = playerCount >= 2 && status === 'ready'

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">PROTOCOL / LOBBY</p>

        <h2>
          {isReady
            ? 'Your partner is connected.'
            : 'Your game is ready.'}
        </h2>

        <p className="intro">
          {isReady
            ? 'Both players are now connected.'
            : 'Ask your partner to join using this code.'}
        </p>

        <div className="game-code">
          {gameCode}
        </div>

        <p className="status">
          <span className="status-dot"></span>

          {isReady
            ? '2 / 2 players connected'
            : 'Waiting for player two'}
        </p>

        {isReady && (
          <button
  className="primary"
  onClick={beginCalibration}
>
  Begin calibration
</button>
        )}

        <button className="secondary" onClick={onBack}>
          {isReady ? 'Leave game' : 'Cancel game'}
        </button>
      </section>
    </main>
  )
}

function JoinGame({ onBack, onJoined }) {
  const [code, setCode] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (code.length !== 6) {
      return
    }

    setLoading(true)
    setErrorMessage('')

    const { data: game, error } = await supabase
      .from('games')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !game) {
      setErrorMessage('Game not found.')
      setLoading(false)
      return
    }

    if (game.player_count >= 2) {
      setErrorMessage('This game already has two players.')
      setLoading(false)
      return
    }

    const { data: updatedGame, error: updateError } = await supabase
      .from('games')
      .update({
        player_count: 2,
        status: 'ready',
      })
      .eq('id', game.id)
      .select()
      .single()

    if (updateError) {
      console.error(updateError)
      setErrorMessage('Unable to join game.')
      setLoading(false)
      return
    }

    onJoined(updatedGame)
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">PROTOCOL / JOIN</p>

        <h2>Enter game code.</h2>

        <p className="intro">
          Enter the six-character code shown on your partner&apos;s screen.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            className="code-input"
            type="text"
            maxLength="6"
            autoComplete="off"
            spellCheck="false"
            placeholder="ABC123"
            value={code}
            onChange={(event) =>
              setCode(
                event.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, '')
              )
            }
          />

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          <button
            className="primary"
            type="submit"
            disabled={code.length !== 6 || loading}
          >
            {loading ? 'Joining...' : 'Join game'}
          </button>
        </form>

        <button className="secondary" onClick={onBack}>
          Back
        </button>
      </section>
    </main>
  )
}

function Calibration() {
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          PROTOCOL / CALIBRATION
        </p>

        <h2>Set your boundaries.</h2>

        <p className="intro">
          Your answers are private.
          Your partner will never see your individual choices.
        </p>

        <div className="status">
          <span className="status-dot"></span>
          Private calibration active
        </div>
      </section>
    </main>
  )
}

function JoinedGame({
  gameCode,
  onBack,
  onBegin,
}) {
  useEffect(() => {
    const channel = supabase
      .channel(`joined-${gameCode}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          if (
            payload.new.status ===
            'calibrating'
          ) {
            onBegin()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, onBegin])

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          PROTOCOL / CONNECTED
        </p>

        <h2>Player two connected.</h2>

        <p className="intro">
          You joined game {gameCode}.
        </p>

        <div className="status">
          <span className="status-dot"></span>
          Waiting for the host
        </div>

        <button
          className="secondary"
          onClick={onBack}
        >
          Leave game
        </button>
      </section>
    </main>
  )
}

function App() {
  const [screen, setScreen] = useState('home')
  const [gameCode, setGameCode] = useState('')
  const [joinedGame, setJoinedGame] = useState(null)

  async function createGame() {
  const code = generateGameCode()

  const { data, error } = await supabase
    .from('games')
    .insert({
      code,
      status: 'waiting',
      player_count: 1,
    })
    .select()
    .single()

  if (error) {
    console.error(error)
    return
  }

  console.log('Game created:', data)

  setGameCode(code)
  setScreen('lobby')
}

  function goHome() {
    setGameCode('')
    setScreen('home')
  }

  if (screen === 'lobby') {
  return (
    <Lobby
      gameCode={gameCode}
      onBack={goHome}
      onBegin={() =>
        setScreen('calibration')
      }
    />
  )
}

  if (screen === 'join') {
  return (
    <JoinGame
      onBack={goHome}
      onJoined={(game) => {
        setJoinedGame(game)
        setGameCode(game.code)
        setScreen('joined')
      }}
    />
  )
}

if (screen === 'joined') {
  return (
    <JoinedGame
      gameCode={gameCode}
      onBack={goHome}
      onBegin={() =>
        setScreen('calibration')
      }
    />
  )
}

if (screen === 'calibration') {
  return <Calibration />
}

  return (
    <Home
      onCreate={createGame}
      onJoin={() => setScreen('join')}
    />
  )
}

export default App