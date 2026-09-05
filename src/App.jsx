import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabase'
import { useEffect, useRef, useState } from 'react'

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

    create or replace function public.confirm_secret_objective(
  p_game_code text,
  p_player_no integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$

declare
  v_game public.games%rowtype;

begin

  if p_player_no not in (1, 2) then
    raise exception 'Invalid player number';
  end if;

  if p_player_no = 1 then

    update public.games
    set player1_ready = true
    where code = upper(p_game_code);

  else

    update public.games
    set player2_ready = true
    where code = upper(p_game_code);

  end if;


  select *
  into v_game
  from public.games
  where code = upper(p_game_code)
  limit 1;


  if v_game.id is null then
    raise exception 'Game not found';
  end if;


  if v_game.player1_ready and v_game.player2_ready then

    update public.games
    set
      status = 'act1_live',
      act_started_at = now(),
      player1_act1_done = false,
      player2_act1_done = false,
      act1_finished = false,
      act1_advantage = null
    where id = v_game.id;

    return jsonb_build_object(
      'ready', true,
      'both_ready', true
    );

  end if;


  return jsonb_build_object(
    'ready', true,
    'both_ready', false
  );

end;

$$;

function ActOneLive({
  gameCode,
  playerNo,
  onReveal,
}) {
  const DURATION = 30

  const [remaining, setRemaining] = useState(DURATION)
  const [objectiveDone, setObjectiveDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const timeoutSent = useRef(false)

  useEffect(() => {
    async function loadGame() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          act_started_at,
          player1_act1_done,
          player2_act1_done,
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error || !data) {
        console.error(error)
        setLoading(false)
        return
      }

      if (data.status === 'act1_reveal') {
        onReveal()
        return
      }

      const done =
        playerNo === 1
          ? data.player1_act1_done
          : data.player2_act1_done

      setObjectiveDone(done)

      if (data.act_started_at) {
        const started =
          new Date(data.act_started_at).getTime()

        const elapsed =
          Math.floor(
            (Date.now() - started) / 1000
          )

        setRemaining(
          Math.max(0, DURATION - elapsed)
        )
      }

      setLoading(false)
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

          const done =
            playerNo === 1
              ? game.player1_act1_done
              : game.player2_act1_done

          setObjectiveDone(done)

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

  useEffect(() => {
    if (loading) {
      return
    }

    const timer = setInterval(() => {
      setRemaining((current) =>
        Math.max(0, current - 1)
      )
    }, 1000)

    return () => clearInterval(timer)
  }, [loading])

  useEffect(() => {
    if (
      remaining !== 0 ||
      timeoutSent.current
    ) {
      return
    }

    timeoutSent.current = true

    async function finishByTimeout() {
      const { error } = await supabase.rpc(
        'timeout_act1',
        {
          p_game_code: gameCode,
        }
      )

      if (error) {
        console.error(error)
        timeoutSent.current = false
      }
    }

    finishByTimeout()
  }, [remaining, gameCode])

  async function completeObjective() {
    setSubmitting(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'complete_act1_objective',
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
      setSubmitting(false)
      return
    }

    setObjectiveDone(true)
    setSubmitting(false)

    if (data?.finished) {
      onReveal()
    }
  }

  const minutes =
    Math.floor(remaining / 60)

  const seconds =
    String(remaining % 60).padStart(2, '0')

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE I
          </p>

          <h2>Synchronisation...</h2>
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

        <div className="timer">
          {minutes}:{seconds}
        </div>

        <p className="intro">
          Votre objectif secret est actif.
          Votre partenaire poursuit le sien.
        </p>

        <div className="protocol-box">
          <p className="protocol-number">
            PROTOCOLE 01
          </p>

          <p>
            Continuez à interagir normalement.
          </p>

          <p>
            Essayez d’accomplir votre objectif
            sans révéler ce que vous cherchez
            à obtenir.
          </p>

          <p>
            Dès que vous estimez avoir réussi,
            validez-le sur votre écran.
          </p>
        </div>

        {objectiveDone ? (
          <div className="objective-confirmed">
            Objectif déclaré atteint.
            <br />
            Continuez à jouer normalement.
          </div>
        ) : (
          <button
            className="primary"
            onClick={completeObjective}
            disabled={submitting}
          >
            {submitting
              ? 'Validation...'
              : 'Objectif atteint'}
          </button>
        )}

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <p className="warning-text">
          Votre validation reste privée jusqu’à
          la fin de l’acte.
        </p>
      </section>
    </main>
  )
}

function ActOneReveal({
  gameCode,
}) {
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadResult() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          player1_objective,
          player2_objective,
          player1_act1_done,
          player2_act1_done,
          act1_advantage
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setGame(data)
      setLoading(false)
    }

    loadResult()
  }, [gameCode])

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
            {game.player1_act1_done
              ? 'RÉUSSI'
              : 'NON VALIDÉ'}
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
            {game.player2_act1_done
              ? 'RÉUSSI'
              : 'NON VALIDÉ'}
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