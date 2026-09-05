import { useEffect, useRef, useState } from 'react'
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

function Calibration({
  gameCode,
  playerNo,
  onReady,
}) {
  const [intensity, setIntensity] = useState(3)

  const [answers, setAnswers] = useState({
    surprise: 1,
    control: 1,
    surrender: 1,
    sensory: 1,
    restraint: 1,
    competition: 1,
    provocation: 1,
    improvisation: 1,
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const dimensions = [
  {
    key: 'surprise',
    label: 'Surprise',
    description: 'Instructions ou conséquences inattendues.',
  },
  {
    key: 'control',
    label: 'Contrôle',
    description: 'Prendre temporairement le contrôle de certaines décisions ou règles.',
  },
  {
    key: 'surrender',
    label: 'Lâcher-prise',
    description: 'Laisser temporairement votre partenaire prendre les commandes.',
  },
  {
    key: 'sensory',
    label: 'Sensoriel',
    description: 'Défis basés sur le toucher, les sons ou l’anticipation.',
  },
  {
    key: 'restraint',
    label: 'Contraintes',
    description: 'Restrictions ou limitations temporaires convenues.',
  },
  {
    key: 'competition',
    label: 'Compétition',
    description: 'Gagner, perdre ou obtenir des avantages.',
  },
  {
    key: 'provocation',
    label: 'Provocation',
    description: 'Taquiner, défier ou pousser le jeu plus loin.',
  },
  {
    key: 'improvisation',
    label: 'Improvisation',
    description: 'Interactions moins scriptées et choix plus spontanés.',
  },
]

  function updateAnswer(key, value) {
    setAnswers((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function submitCalibration() {
    setLoading(true)
    setErrorMessage('')

    const payload = {
      intensity,
      ...answers,
    }

    const { data, error } = await supabase.rpc(
      'submit_calibration',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
        p_answers: payload,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Calibration could not be submitted.'
      )
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)

    if (data?.ready) {
      onReady(data.shared_profile)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel(`calibration-${gameCode}-${playerNo}`)
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
            'calibration_ready'
          ) {
            onReady(payload.new.shared_profile)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, playerNo, onReady])

  if (submitted) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            PROTOCOL / CALIBRATION
          </p>

          <h2>Calibration validée.</h2>

<p className="intro">
  Vos réponses ont été enregistrées de manière privée.
  En attente de votre partenaire.
</p>

          <div className="status">
            <span className="status-dot"></span>
            En attente du joueur {playerNo === 1 ? '2' : '1'}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card calibration-card">
        <p className="eyebrow">
          PROTOCOL / CALIBRATION
        </p>

        <h2>Définissez vos limites.</h2>

<p className="intro">
  Vos réponses sont privées.
  Votre partenaire ne verra jamais vos choix individuels.
</p>

        <div className="calibration-section">
          <p className="calibration-label">
  INTENSITÉ
</p>

<p className="calibration-description">
  Jusqu’où PROTOCOL peut-il aller dans la partie de ce soir ?
</p>

          <div className="intensity-grid">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                className={
                  intensity === value
                    ? 'choice-button selected'
                    : 'choice-button'
                }
                onClick={() => setIntensity(value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {dimensions.map((dimension) => (
          <div
            className="calibration-section"
            key={dimension.key}
          >
            <p className="calibration-label">
              {dimension.label}
            </p>

            <p className="calibration-description">
              {dimension.description}
            </p>

            <div className="answer-grid">
              <button
                className={
                  answers[dimension.key] === 0
                    ? 'choice-button selected'
                    : 'choice-button'
                }
                onClick={() =>
                  updateAnswer(dimension.key, 0)
                }
              >
                Non
              </button>

              <button
                className={
                  answers[dimension.key] === 1
                    ? 'choice-button selected'
                    : 'choice-button'
                }
                onClick={() =>
                  updateAnswer(dimension.key, 1)
                }
              >
                Peut-être
              </button>

              <button
                className={
                  answers[dimension.key] === 2
                    ? 'choice-button selected'
                    : 'choice-button'
                }
                onClick={() =>
                  updateAnswer(dimension.key, 2)
                }
              >
                Oui
              </button>
            </div>
          </div>
        ))}

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button
          className="primary"
          onClick={submitCalibration}
          disabled={loading}
        >
          {loading
  ? 'Validation...'
  : 'Valider mes choix'}
        </button>
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

function CalibrationReady({
  sharedProfile,
  onStart,
}) {
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          PROTOCOL / PRÊT
        </p>

        <h2>Compatibilité établie.</h2>

        <p className="intro">
          PROTOCOL a défini votre zone de jeu commune.
          Vos réponses individuelles restent privées.
        </p>

        <div className="result-box">
          <span>
            Intensité commune
          </span>

          <strong>
            {sharedProfile?.intensity ?? '—'} / 5
          </strong>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Calibration terminée
        </div>

        <button
  className="primary"
  onClick={onStart}
>
  Commencer THE PACT
</button>
      </section>
    </main>
  )
}

function ThePactIntro({
  gameCode,
  playerNo,
  onContinue,
}) {
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE I
        </p>

        <h2>Le Pacte commence.</h2>

        <p className="intro">
          Pendant cette partie, vous ne recevrez pas toujours
          les mêmes informations.
        </p>

        <p className="intro">
          Certaines règles, intentions et objectifs resteront
          volontairement secrets.
        </p>

        <div className="result-box">
          <span>Votre rôle</span>
          <strong>
            Joueur {playerNo}
          </strong>
        </div>

        <button
          className="primary"
          onClick={onContinue}
        >
          Recevoir mon instruction
        </button>
      </section>
    </main>
  )
}

function SecretObjective({
  gameCode,
  playerNo,
  onContinue,
}) {
  const [objective, setObjective] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadObjective() {
      const field =
        playerNo === 1
          ? 'player1_objective'
          : 'player2_objective'

      const { data, error } = await supabase
        .from('games')
        .select(field)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de charger votre objectif.'
        )
        setLoading(false)
        return
      }

      setObjective(data[field])
      setLoading(false)
    }

    loadObjective()
  }, [gameCode, playerNo])

  useEffect(() => {
    const channel = supabase
      .channel(`objective-ready-${gameCode}-${playerNo}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          if (payload.new.status === 'act1_live') {
            onContinue()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, playerNo, onContinue])

  async function confirmObjective() {
    setConfirming(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'confirm_secret_objective',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de valider votre objectif.'
      )
      setConfirming(false)
      return
    }

    if (data?.both_ready) {
      onContinue()
      return
    }

    setWaiting(true)
    setConfirming(false)
  }

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT
          </p>

          <h2>Préparation...</h2>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </section>
      </main>
    )
  }

  if (waiting) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / SECRET
          </p>

          <h2>Objectif verrouillé.</h2>

          <p className="intro">
            Votre instruction est active.
            Attendez que votre partenaire soit prêt.
          </p>

          <div className="status">
            <span className="status-dot"></span>
            Synchronisation en cours
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / SECRET
        </p>

        <h2>Votre objectif.</h2>

        <div className="secret-box">
          {objective}
        </div>

        <p className="intro">
          Ne montrez pas cet écran à votre partenaire.
        </p>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button
          className="primary"
          onClick={confirmObjective}
          disabled={confirming}
        >
          {confirming
            ? 'Validation...'
            : 'J’ai compris'}
        </button>
      </section>
    </main>
  )
}

function ActOneLive({
  gameCode,
  playerNo,
  onReveal,
}) {
  const [result, setResult] = useState('pending')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadGame() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          player1_act1_result,
          player2_act1_result,
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        return
      }

      if (data.status === 'act1_reveal') {
        onReveal()
        return
      }

      const currentResult =
        playerNo === 1
          ? data.player1_act1_result
          : data.player2_act1_result

      setResult(currentResult)
    }

    loadGame()
  }, [gameCode, playerNo, onReveal])

  useEffect(() => {
    const channel = supabase
      .channel(`act1-${gameCode}-${playerNo}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          const game = payload.new

          const currentResult =
            playerNo === 1
              ? game.player1_act1_result
              : game.player2_act1_result

          setResult(currentResult)

          if (game.status === 'act1_reveal') {
            onReveal()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, playerNo, onReveal])

  async function resolveObjective(newResult) {
    setSubmitting(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'resolve_act1_objective',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
        p_result: newResult,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible d’enregistrer le résultat.'
      )
      setSubmitting(false)
      return
    }

    setResult(newResult)
    setSubmitting(false)

    if (data?.finished) {
      onReveal()
    }
  }

  if (result !== 'pending') {
    const labels = {
      success: 'Objectif déclaré atteint.',
      exposed: 'Objectif déclaré démasqué.',
      abandoned: 'Objectif abandonné.',
    }

    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE I
          </p>

          <h2>Résultat verrouillé.</h2>

          <div className="objective-confirmed">
            {labels[result]}
            <br />
            Continuez normalement jusqu’à la résolution
            de l’objectif adverse.
          </div>

          <div className="status">
            <span className="status-dot"></span>
            En attente de votre partenaire
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE I
        </p>

        <h2>Le Signal.</h2>

        <p className="intro">
          Votre objectif secret est actif.
          Votre partenaire poursuit le sien.
        </p>

        <div className="protocol-box">
          <p className="protocol-number">
            PROTOCOLE 01
          </p>

          <p>
            Essayez d’accomplir votre objectif
            sans révéler ce que vous cherchez à obtenir.
          </p>

          <p>
            Décidez vous-même quand votre objectif
            est résolu.
          </p>
        </div>

        <div className="action-stack">
          <button
            className="primary"
            onClick={() =>
              resolveObjective('success')
            }
            disabled={submitting}
          >
            Objectif atteint
          </button>

          <button
            className="secondary"
            onClick={() =>
              resolveObjective('exposed')
            }
            disabled={submitting}
          >
            Objectif démasqué
          </button>

          <button
            className="tertiary-button"
            onClick={() =>
              resolveObjective('abandoned')
            }
            disabled={submitting}
          >
            J’abandonne cet objectif
          </button>
        </div>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <p className="warning-text">
          Votre choix reste privé jusqu’à la révélation.
        </p>
      </section>
    </main>
  )
}

function ActOneReveal({
  gameCode,
  playerNo,
  onActTwo,
}) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const resultLabels = {
    success: 'RÉUSSI',
    exposed: 'DÉMASQUÉ',
    abandoned: 'ABANDONNÉ',
    pending: 'NON RÉSOLU',
  }

  useEffect(() => {
    async function loadResult() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          player1_objective,
          player2_objective,
          player1_act1_result,
          player2_act1_result,
          act1_advantage,
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de charger le résultat.'
        )
        setLoading(false)
        return
      }

      if (data.status === 'act2_choice') {
        onActTwo()
        return
      }

      setGame(data)
      setLoading(false)
    }

    loadResult()
  }, [gameCode, onActTwo])

  useEffect(() => {
    const channel = supabase
      .channel(`act1-reveal-${gameCode}-${playerNo}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          if (payload.new.status === 'act2_choice') {
            onActTwo()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, playerNo, onActTwo])

  async function startActTwo() {
    setStarting(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'start_act2',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de lancer l’Acte II.'
      )
      setStarting(false)
      return
    }

    onActTwo()
  }

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT
          </p>

          <h2>Analyse...</h2>
        </section>
      </main>
    )
  }

  if (!game) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ERREUR
          </p>

          <h2>Résultat indisponible.</h2>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / RÉVÉLATION
        </p>

        <h2>Voici ce qui se jouait.</h2>

        <div className="reveal-player">
          <p className="protocol-number">
            JOUEUR 1
          </p>

          <p>
            {game.player1_objective}
          </p>

          <strong>
            {resultLabels[
              game.player1_act1_result
            ] ?? 'INCONNU'}
          </strong>
        </div>

        <div className="reveal-player">
          <p className="protocol-number">
            JOUEUR 2
          </p>

          <p>
            {game.player2_objective}
          </p>

          <strong>
            {resultLabels[
              game.player2_act1_result
            ] ?? 'INCONNU'}
          </strong>
        </div>

        <div className="result-box">
          <span>Avantage</span>

          <strong>
            {game.act1_advantage
              ? `Joueur ${game.act1_advantage}`
              : 'Aucun'}
          </strong>
        </div>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        {playerNo === 1 ? (
          <button
            className="primary"
            onClick={startActTwo}
            disabled={starting}
          >
            {starting
              ? 'Initialisation...'
              : 'Continuer vers l’Acte II'}
          </button>
        ) : (
          <div className="status">
            <span className="status-dot"></span>
            En attente du lancement de l’Acte II
          </div>
        )}
      </section>
    </main>
  )
}

function ActTwoIntro({
  gameCode,
  playerNo,
  onEffect,
}) {
  const [advantage, setAdvantage] = useState(null)
  const [sharedProfile, setSharedProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [choosing, setChoosing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadActTwo() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          act1_advantage,
          act2_power,
          status,
          shared_profile
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de charger l’Acte II.'
        )
        setLoading(false)
        return
      }

      if (data.status === 'act2_effect') {
        onEffect(data.act2_power)
        return
      }

      setAdvantage(data.act1_advantage)
      setSharedProfile(data.shared_profile)
      setLoading(false)
    }

    loadActTwo()
  }, [gameCode, onEffect])

  useEffect(() => {
    const channel = supabase
      .channel(`act2-choice-${gameCode}-${playerNo}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          if (payload.new.status === 'act2_effect') {
            onEffect(payload.new.act2_power)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, playerNo, onEffect])

  async function choosePower(power) {
    setChoosing(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'choose_act2_power',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
        p_power: power,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de sélectionner ce pouvoir.'
      )
      setChoosing(false)
      return
    }

    onEffect(data.power)
  }

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE II
          </p>

          <h2>Préparation...</h2>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </section>
      </main>
    )
  }

  const hasAdvantage =
    advantage === playerNo

  const availablePowers = [
    {
      key: 'silence',
      title: 'Silence',
      description:
        'Pendant une courte période, certaines communications deviennent interdites.',
      allowed: true,
    },
    {
      key: 'permission',
      title: 'Permission',
      description:
        'Certaines actions nécessiteront temporairement votre validation.',
      allowed:
        sharedProfile?.control >= 1 &&
        sharedProfile?.surrender >= 1,
    },
    {
      key: 'blind_choice',
      title: 'Choix à l’aveugle',
      description:
        'Votre partenaire devra choisir entre deux options sans connaître leurs conséquences.',
      allowed:
        sharedProfile?.surprise >= 1,
    },
  ].filter((power) => power.allowed)

  if (advantage === null) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE II
          </p>

          <h2>L’Avantage.</h2>

          <p className="intro">
            Aucun joueur n’a obtenu d’avantage.
            PROTOCOL va modifier les règles.
          </p>

          <div className="status">
            <span className="status-dot"></span>
            Égalité détectée
          </div>
        </section>
      </main>
    )
  }

  if (!hasAdvantage) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE II
          </p>

          <h2>L’Avantage.</h2>

          <p className="intro">
            Votre partenaire détient l’Avantage.
          </p>

          <div className="secret-box">
            Une décision est en cours.
            Vous n’en connaîtrez la nature
            qu’au moment où elle prendra effet.
          </div>

          <div className="status">
            <span className="status-dot"></span>
            Décision secrète en cours
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE II
        </p>

        <h2>Choisissez votre Avantage.</h2>

        <p className="intro">
          Votre choix restera secret jusqu’à son activation.
        </p>

        {availablePowers.map((power) => (
          <button
            key={power.key}
            className="power-card"
            onClick={() =>
              choosePower(power.key)
            }
            disabled={choosing}
          >
            <span className="power-title">
              {power.title}
            </span>

            <span className="power-description">
              {power.description}
            </span>
          </button>
        ))}

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  )
}

function ActTwoEffect({
  power,
  playerNo,
}) {
  const content = {
    silence: {
      title: 'Silence',
      text:
        'Pendant les trois prochaines minutes, ' +
        'vous ne pouvez pas poser de question directe.',
    },

    permission: {
      title: 'Permission',
      text:
        'Pendant les trois prochaines minutes, ' +
        'certaines décisions devront recevoir une validation explicite.',
    },

    blind_choice: {
      title: 'Choix à l’aveugle',
      text:
        'Un choix vous sera bientôt proposé sans que toutes ses conséquences soient révélées.',
    },
  }

  const selected =
    content[power] ?? {
      title: 'Règle inconnue',
      text: 'PROTOCOL n’a pas pu identifier la règle.',
    }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE II
        </p>

        <h2>{selected.title}.</h2>

        <div className="protocol-box">
          <p className="protocol-number">
            RÈGLE ACTIVE
          </p>

          <p>
            {selected.text}
          </p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Règle active · Joueur {playerNo}
        </div>
      </section>
    </main>
  )
}

function App() {
  const [screen, setScreen] = useState('home')
  const [gameCode, setGameCode] = useState('')
  const [joinedGame, setJoinedGame] = useState(null)
  const [playerNo, setPlayerNo] = useState(null)
  const [sharedProfile, setSharedProfile] = useState(null)
  const [act2Power, setAct2Power] = useState(null)

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

    setPlayerNo(1)
    setGameCode(code)
    setScreen('lobby')
  }

  async function startThePact() {
    const { error } = await supabase.rpc(
      'start_the_pact',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)
      return
    }

    setScreen('the-pact-intro')
  }

  function goHome() {
    setGameCode('')
    setPlayerNo(null)
    setSharedProfile(null)
    setJoinedGame(null)
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
          setPlayerNo(2)
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
    return (
      <Calibration
        gameCode={gameCode}
        playerNo={playerNo}
        onReady={(profile) => {
          setSharedProfile(profile)
          setScreen('calibration-ready')
        }}
      />
    )
  }

  if (screen === 'calibration-ready') {
    return (
      <CalibrationReady
        sharedProfile={sharedProfile}
        onStart={startThePact}
      />
    )
  }

  if (screen === 'the-pact-intro') {
    return (
      <ThePactIntro
        gameCode={gameCode}
        playerNo={playerNo}
        onContinue={() =>
          setScreen('secret-objective')
        }
      />
    )
  }

  if (screen === 'secret-objective') {
    return (
      <SecretObjective
        gameCode={gameCode}
        playerNo={playerNo}
        onContinue={() =>
          setScreen('act1-live')
        }
      />
    )
  }

  if (screen === 'act1-live') {
  return (
    <ActOneLive
      gameCode={gameCode}
      playerNo={playerNo}
      onReveal={() =>
        setScreen('act1-reveal')
      }
    />
  )
}

if (screen === 'act1-reveal') {
  return (
    <ActOneReveal
      gameCode={gameCode}
      playerNo={playerNo}
      onActTwo={() =>
        setScreen('act2-intro')
      }
    />
  )
}

if (screen === 'act2-intro') {
  return (
    <ActTwoIntro
      gameCode={gameCode}
      playerNo={playerNo}
      onEffect={(power) => {
        setAct2Power(power)
        setScreen('act2-effect')
      }}
    />
  )
}

if (screen === 'act2-effect') {
  return (
    <ActTwoEffect
      power={act2Power}
      playerNo={playerNo}
    />
  )
}

return (
  <Home
    onCreate={createGame}
    onJoin={() => setScreen('join')}
  />
)
}

export default App