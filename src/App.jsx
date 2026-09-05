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

const ACTION_LIBRARY = [
  {
    id: 'sensory_eyes_closed',
    category: 'sensory',
    group: 'initiative',
    target: 'partner',
    intensity: 2,
    requires: {
      sensory: 1,
      surprise: 1,
    },
    title: 'Sans regarder',
    text:
      'Fermez les yeux pendant deux minutes. Votre partenaire guide l’interaction sans annoncer à l’avance ce qu’il va faire.',
  },

  {
    id: 'sensory_slow_contact',
    category: 'sensory',
    group: 'initiative',
    target: 'holder',
    intensity: 1,
    requires: {
      sensory: 1,
    },
    title: 'Ralentir',
    text:
      'Choisissez une forme de contact simple. Faites-la durer volontairement plus longtemps que d’habitude.',
  },

  {
    id: 'sensory_no_words',
    category: 'sensory',
    group: 'constraint',
    target: 'both',
    intensity: 2,
    requires: {
      sensory: 1,
    },
    title: 'Sans mots',
    text:
      'Pendant deux minutes, aucune instruction verbale. Un stop ou un refus reste évidemment toujours valable.',
  },

  {
    id: 'control_take_lead',
    category: 'control',
    group: 'initiative',
    target: 'holder',
    intensity: 2,
    requires: {
      control: 1,
      surrender: 1,
    },
    title: 'Prenez les commandes',
    text:
      'Pendant trois minutes, vous choisissez le rythme, la proximité et la manière dont l’interaction évolue.',
  },

  {
    id: 'control_permission',
    category: 'control',
    group: 'constraint',
    target: 'partner',
    intensity: 3,
    requires: {
      control: 1,
      surrender: 1,
    },
    title: 'Permission',
    text:
      'Pendant trois minutes, avant de modifier volontairement l’interaction, demandez l’accord de votre partenaire.',
  },

  {
    id: 'control_position',
    category: 'control',
    group: 'initiative',
    target: 'holder',
    intensity: 2,
    requires: {
      control: 1,
      surrender: 1,
    },
    title: 'Placement',
    text:
      'Choisissez où chacun se place pour la prochaine interaction. Votre partenaire peut toujours refuser ou modifier la proposition.',
  },

  {
    id: 'surrender_no_decision',
    category: 'surrender',
    group: 'constraint',
    target: 'partner',
    intensity: 2,
    requires: {
      surrender: 1,
    },
    title: 'Ne choisissez pas',
    text:
      'Pour la prochaine interaction, laissez votre partenaire prendre la première décision.',
  },

  {
    id: 'surrender_follow',
    category: 'surrender',
    group: 'constraint',
    target: 'partner',
    intensity: 3,
    requires: {
      surrender: 1,
      control: 1,
    },
    title: 'Suivez',
    text:
      'Pendant deux minutes, laissez votre partenaire diriger l’enchaînement. Vous gardez à tout moment la possibilité de passer.',
  },

  {
    id: 'restraint_hands_still',
    category: 'restraint',
    group: 'constraint',
    target: 'partner',
    intensity: 2,
    requires: {
      restraint: 1,
      surrender: 1,
    },
    title: 'Mains immobiles',
    text:
      'Pendant deux minutes, gardez les mains immobiles et laissez votre partenaire décider du rythme de l’interaction.',
  },

  {
    id: 'restraint_stay',
    category: 'restraint',
    group: 'constraint',
    target: 'partner',
    intensity: 2,
    requires: {
      restraint: 1,
      surrender: 1,
    },
    title: 'Restez là',
    text:
      'Pendant deux minutes, restez à l’endroit choisi ensemble. Votre partenaire contrôle l’évolution de l’interaction.',
  },

  {
    id: 'restraint_posture',
    category: 'restraint',
    group: 'constraint',
    target: 'partner',
    intensity: 3,
    requires: {
      restraint: 1,
      surrender: 1,
    },
    title: 'Posture imposée',
    text:
      'Votre partenaire choisit une posture simple que vous conservez pendant une minute.',
  },

  {
    id: 'provocation_request',
    category: 'provocation',
    group: 'initiative',
    target: 'holder',
    intensity: 2,
    requires: {
      provocation: 1,
    },
    title: 'Une demande',
    text:
      'Formulez une demande précise à votre partenaire. Il peut l’accepter, la modifier ou passer.',
  },

  {
    id: 'provocation_challenge',
    category: 'provocation',
    group: 'initiative',
    target: 'holder',
    intensity: 2,
    requires: {
      provocation: 1,
      competition: 1,
    },
    title: 'Défi',
    text:
      'Lancez un petit défi à votre partenaire. S’il accepte, c’est lui qui choisira ce que gagne le vainqueur.',
  },

  {
    id: 'provocation_statement',
    category: 'provocation',
    group: 'initiative',
    target: 'holder',
    intensity: 2,
    requires: {
      provocation: 1,
      improvisation: 1,
    },
    title: 'Dites-le',
    text:
      'Dites à votre partenaire quelque chose que vous pensez mais que vous exprimez rarement dans ce contexte. Puis laissez un silence.',
  },

  {
    id: 'surprise_close_eyes',
    category: 'surprise',
    group: 'constraint',
    target: 'partner',
    intensity: 2,
    requires: {
      surprise: 1,
      sensory: 1,
    },
    title: 'Faites confiance',
    text:
      'Fermez les yeux. Votre partenaire choisit la prochaine interaction sans vous en annoncer la nature à l’avance.',
  },

  {
    id: 'surprise_two_options',
    category: 'surprise',
    group: 'initiative',
    target: 'partner',
    intensity: 2,
    requires: {
      surprise: 1,
    },
    title: 'Deux possibilités',
    text:
      'Votre partenaire imagine deux possibilités compatibles avec vos limites. Choisissez A ou B avant de savoir laquelle correspond à quoi.',
  },

  {
    id: 'improv_continue',
    category: 'improvisation',
    group: 'initiative',
    target: 'both',
    intensity: 2,
    requires: {
      improvisation: 1,
    },
    title: 'Ne préparez rien',
    text:
      'Commencez une interaction sans décider comment elle doit finir. Laissez chacun modifier naturellement la suite.',
  },

  {
    id: 'improv_mirror',
    category: 'improvisation',
    group: 'initiative',
    target: 'both',
    intensity: 2,
    requires: {
      improvisation: 1,
      sensory: 1,
    },
    title: 'Miroir',
    text:
      'L’un commence un geste ou une interaction simple. L’autre répond en reprenant ou en transformant ce geste.',
  },

{
  id: 'lock_close_and_still',
  category: 'restraint',
  group: 'lock',
  target: 'partner',
  intensity: 3,
  requires: {
    restraint: 1,
    surrender: 1,
    sensory: 1,
  },
  title: 'Immobile',
  text:
    'Pendant la résolution du verrou, restez proche de votre partenaire et gardez les mains immobiles. La contrainte cesse immédiatement si vous souhaitez passer.',
},

{
  id: 'lock_guided_position',
  category: 'control',
  group: 'lock',
  target: 'partner',
  intensity: 3,
  requires: {
    control: 1,
    surrender: 1,
  },
  title: 'Position choisie',
  text:
    'Votre partenaire choisit votre position pendant la résolution du verrou. Vous pouvez la modifier ou interrompre la règle à tout moment.',
},

{
  id: 'lock_no_questions',
  category: 'control',
  group: 'lock',
  target: 'both',
  intensity: 3,
  requires: {
    control: 1,
    improvisation: 1,
  },
  title: 'Pas de questions',
  text:
    'Jusqu’à l’ouverture du verrou, aucune question directe. Vous devez transmettre vos indices autrement.',
},

{
  id: 'lock_eyes_closed',
  category: 'sensory',
  group: 'lock',
  target: 'partner',
  intensity: 3,
  requires: {
    sensory: 1,
    surprise: 1,
  },
  title: 'Sans voir',
  text:
    'Pendant une partie de la résolution, gardez les yeux fermés pendant que votre partenaire vous communique son indice.',
},

{
  id: 'lock_obey_one',
  category: 'surrender',
  group: 'lock',
  target: 'partner',
  intensity: 4,
  requires: {
    control: 2,
    surrender: 2,
    provocation: 1,
  },
  title: 'Une instruction',
  text:
    'Pendant le verrou, votre partenaire peut vous donner une seule instruction liée à la mise en scène ou à votre position. Vous pouvez toujours la refuser ou la modifier.',
},

{
  id: 'lock_silent_guidance',
  category: 'sensory',
  group: 'lock',
  target: 'both',
  intensity: 4,
  requires: {
    sensory: 2,
    surprise: 1,
    improvisation: 1,
  },
  title: 'Guidage silencieux',
  text:
    'Pendant une minute, communiquez uniquement par gestes et contact. Après cette minute, vous pouvez reprendre la parole pour résoudre le verrou.',
},

{
  id: 'sensual_whisper_desire',
  category: 'provocation',
  group: 'initiative',
  target: 'holder',
  intensity: 3,
  requires: {
    provocation: 1,
    improvisation: 1,
  },
  title: 'À voix basse',
  text:
    'Approchez-vous suffisamment pour parler très bas. Dites à votre partenaire une chose que vous aimeriez qu’il fasse, sans lui demander de la faire immédiatement.',
},

{
  id: 'sensual_choose_contact',
  category: 'sensory',
  group: 'initiative',
  target: 'holder',
  intensity: 3,
  requires: {
    sensory: 1,
    control: 1,
  },
  title: 'Choisissez',
  text:
    'Choisissez une zone de contact clairement autorisée par votre partenaire et imposez un rythme volontairement lent pendant deux minutes.',
},

{
  id: 'sensual_no_hands',
  category: 'restraint',
  group: 'constraint',
  target: 'partner',
  intensity: 3,
  requires: {
    restraint: 1,
    surrender: 1,
    sensory: 1,
  },
  title: 'Sans les mains',
  text:
    'Pendant deux minutes, gardez les mains hors de l’interaction et laissez votre partenaire gérer la proximité et le rythme.',
},

{
  id: 'sensual_one_order',
  category: 'control',
  group: 'constraint',
  target: 'partner',
  intensity: 4,
  requires: {
    control: 2,
    surrender: 2,
  },
  title: 'Une consigne',
  text:
    'Votre partenaire peut vous donner une consigne précise concernant votre position, votre proximité ou la manière de poursuivre. Vous pouvez la modifier ou la refuser.',
},

{
  id: 'sensual_eyes_closed_choice',
  category: 'surprise',
  group: 'constraint',
  target: 'partner',
  intensity: 4,
  requires: {
    surprise: 2,
    sensory: 2,
    surrender: 1,
  },
  title: 'Ne regardez pas',
  text:
    'Fermez les yeux. Votre partenaire choisit une interaction sensorielle dans votre zone commune sans vous annoncer à l’avance laquelle.',
},

{
  id: 'sensual_permission_loop',
  category: 'control',
  group: 'constraint',
  target: 'partner',
  intensity: 4,
  requires: {
    control: 2,
    surrender: 2,
    provocation: 1,
  },
  title: 'Demandez',
  text:
    'Pour les trois prochaines minutes, avant chaque changement volontaire dans l’interaction, demandez simplement : « Je peux ? »',
},

{
  id: 'sensual_full_lead',
  category: 'control',
  group: 'constraint',
  target: 'partner',
  intensity: 5,
  requires: {
    control: 2,
    surrender: 2,
    sensory: 2,
    provocation: 2,
  },
  title: 'Laissez faire',
  text:
    'Pendant trois minutes, laissez votre partenaire diriger entièrement le rythme et l’évolution de l’interaction dans les limites déjà établies. Vous gardez à tout moment le droit de passer ou d’interrompre.',
},

{
  id: 'sensual_confession',
  category: 'provocation',
  group: 'initiative',
  target: 'both',
  intensity: 5,
  requires: {
    provocation: 2,
    improvisation: 2,
  },
  title: 'Dites ce que vous voulez',
  text:
    'À tour de rôle, formulez clairement une envie que vous n’avez pas encore exprimée pendant la partie. L’autre répond uniquement : oui, peut-être, ou pas ce soir.',
},

]

function isActionAllowed(action, profile) {
  if (!profile) {
    return false
  }

  if (
    action.intensity &&
    action.intensity > profile.intensity
  ) {
    return false
  }

  for (const [dimension, minimum] of Object.entries(
    action.requires ?? {}
  )) {
    if ((profile[dimension] ?? 0) < minimum) {
      return false
    }
  }

  return true
}

function getCompatibleActions(
  profile,
  group,
  usedActionIds = []
) {
  return ACTION_LIBRARY.filter(
    (action) =>
      action.group === group &&
      !usedActionIds.includes(action.id) &&
      isActionAllowed(action, profile)
  )
}

function getActionDebugReport(profile, usedActionIds = []) {
  return ACTION_LIBRARY.map((action) => {
    const reasons = []

    if (
      action.intensity &&
      action.intensity > (profile?.intensity ?? 0)
    ) {
      reasons.push(
        `intensité ${action.intensity} > ${profile?.intensity ?? 0}`
      )
    }

    for (const [dimension, minimum] of Object.entries(
      action.requires ?? {}
    )) {
      const current = profile?.[dimension] ?? 0

      if (current < minimum) {
        reasons.push(
          `${dimension} ${current} < ${minimum}`
        )
      }
    }

    if (usedActionIds.includes(action.id)) {
      reasons.push('déjà utilisée')
    }

    return {
      ...action,
      allowed: reasons.length === 0,
      reasons,
    }
  })
}

function getEscalatedActions(
  profile,
  usedActionIds = []
) {
  const compatible =
    getCompatibleActions(
      profile,
      'lock',
      usedActionIds
    )

  if (compatible.length === 0) {
    return []
  }

  const maxAllowedIntensity =
    Math.max(
      ...compatible.map(
        (action) => action.intensity
      )
    )

  return compatible.filter(
    (action) =>
      action.intensity ===
      maxAllowedIntensity
  )
}

function ActionDebug({
  gameCode,
  onBack,
}) {
  const [rows, setRows] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDebug() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          shared_profile,
          used_action_ids
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setProfile(data.shared_profile)

      setRows(
        getActionDebugReport(
          data.shared_profile,
          data.used_action_ids ?? []
        )
      )

      setLoading(false)
    }

    loadDebug()
  }, [gameCode])

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <h2>Chargement debug...</h2>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card calibration-card">
        <p className="eyebrow">
          PROTOCOL / DEBUG
        </p>

        <h2>Actions compatibles.</h2>

        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontSize: '12px',
            opacity: 0.8,
          }}
        >
          {JSON.stringify(profile, null, 2)}
        </pre>

        {rows.map((action) => (
          <div
            key={action.id}
            className="reveal-player"
          >
            <p className="protocol-number">
              {action.allowed
                ? 'AUTORISÉE'
                : 'BLOQUÉE'}
            </p>

            <strong>
              {action.title}
            </strong>

            <p>
              {action.category}
              {' · '}
              intensité {action.intensity}
              {' · '}
              cible {action.target}
            </p>

            {!action.allowed && (
              <p className="warning-text">
                {action.reasons.join(' · ')}
              </p>
            )}
          </div>
        ))}

        <button
          className="secondary"
          onClick={onBack}
        >
          Retour
        </button>
      </section>
    </main>
  )
}

function hashString(value) {
  let hash = 0

  for (let i = 0; i < value.length; i++) {
    hash =
      (hash * 31 + value.charCodeAt(i)) >>> 0
  }

  return hash
}

function pickCompatibleAction(
  actions,
  gameCode,
  group
) {
  if (actions.length === 0) {
    return null
  }

  const seed =
    `${gameCode}-${group}-${actions.length}`

  const index =
    hashString(seed) % actions.length

  return actions[index]
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
  onDebug,
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

        <button
          className="secondary"
          onClick={onDebug}
        >
          DEBUG ACTIONS
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
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadObjective() {
      const objectiveField =
        playerNo === 1
          ? 'player1_objective'
          : 'player2_objective'

      const roleField =
        playerNo === 1
          ? 'player1_role'
          : 'player2_role'

      const { data, error } = await supabase
        .from('games')
        .select(`
          ${objectiveField},
          ${roleField},
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error || !data) {
        console.error(error)
        setErrorMessage(
          'Impossible de charger votre mission.'
        )
        setLoading(false)
        return
      }

      /*
       * Important :
       * si l'Acte I a déjà commencé avant que
       * ce téléphone ait reçu l'événement realtime,
       * on ne doit surtout pas rester bloqué ici.
       */
      if (data.status === 'act1_live') {
        onContinue()
        return
      }

      setObjective(data[objectiveField] ?? '')
      setRole(data[roleField] ?? '')
      setLoading(false)
    }

    loadObjective()
  }, [gameCode, playerNo, onContinue])

  useEffect(() => {
    const channel = supabase
      .channel(
        `objective-ready-${gameCode}-${playerNo}`
      )
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
            payload.new.status === 'act1_live'
          ) {
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
        'Impossible de valider votre mission.'
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

    /*
     * Deuxième garde-fou.
     *
     * On relit immédiatement le statut après la RPC.
     * Si l'autre joueur a validé entre-temps,
     * on avance même si l'événement realtime
     * a été raté.
     */
    const { data: currentGame, error: statusError } =
      await supabase
        .from('games')
        .select('status')
        .eq('code', gameCode)
        .single()

    if (statusError) {
      console.error(statusError)
      return
    }

    if (
      currentGame?.status === 'act1_live'
    ) {
      onContinue()
    }
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

          <h2>Mission verrouillée.</h2>

          <p className="intro">
            Votre mission est active.
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

        <h2>Votre mission.</h2>

        <div className="result-box">
          <span>Votre rôle</span>
          <strong>{role}</strong>
        </div>

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

          <h2>Ne vous faites pas démasquer.</h2>

<p className="intro">
  Votre partenaire poursuit sa propre mission.
  Vous ignorez ce qu’il cherche à provoquer.
</p>

<div className="protocol-box">
  <p className="protocol-number">
    PROTOCOLE 01
  </p>

  <p>
    Faites évoluer naturellement la situation
    jusqu’à obtenir ce que votre mission exige.
  </p>

  <p>
    Plus vous rendez votre intention évidente,
    plus votre partenaire peut vous démasquer.
  </p>
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
  Je l’ai obtenu
</button>

<button
  className="secondary"
  onClick={() =>
    resolveObjective('exposed')
  }
  disabled={submitting}
>
  Mon jeu a été démasqué
</button>

<button
  className="tertiary-button"
  onClick={() =>
    resolveObjective('abandoned')
  }
  disabled={submitting}
>
  Passer cette mission
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

function ActiveEffect({
  gameCode,
  title,
  rule,
  action,
  playerNo,
  onComplete,
}) {
  const [finishing, setFinishing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const channel = supabase
      .channel(`act2-complete-${gameCode}-${playerNo}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `code=eq.${gameCode}`,
        },
        (payload) => {
          if (payload.new.status === 'act2_complete') {
            onComplete()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, playerNo, onComplete])

  async function finishEffect() {
    setFinishing(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'finish_act2_effect',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de terminer cet effet.'
      )
      setFinishing(false)
      return
    }

    onComplete()
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE II
        </p>

        <h2>{title}</h2>

        <div className="protocol-box">
          <p className="protocol-number">
            RÈGLE ACTIVE
          </p>

          <p>{rule}</p>
        </div>

        {action && (
          <>
            <div className="result-box">
              <span>Action</span>
              <strong>{action.title}</strong>
            </div>

            <div className="secret-box">
              {action.text}
            </div>

            <p className="warning-text">
              Cette action reste volontaire et peut être
              interrompue ou passée à tout moment.
            </p>
          </>
        )}

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button
          className="primary"
          onClick={finishEffect}
          disabled={finishing}
        >
          {finishing
            ? 'Validation...'
            : 'Effet terminé'}
        </button>
      </section>
    </main>
  )
}

function ActTwoEffect({
  gameCode,
  power,
  playerNo,
  onBlindReveal,
  onComplete,
}) {
  const [advantage, setAdvantage] = useState(null)
  const [sharedProfile, setSharedProfile] = useState(null)
  const [usedActionIds, setUsedActionIds] = useState([])
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadEffect() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          act1_advantage,
          act2_power,
          act2_action_id,
          act2_blind_choice,
          act2_blind_result,
          shared_profile,
          used_action_ids,
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de charger l’effet.'
        )
        setLoading(false)
        return
      }

      if (data.status === 'act2_complete') {
        onComplete()
        return
      }

      if (data.status === 'act2_blind_reveal') {
        onBlindReveal(
          data.act2_blind_result
        )
        return
      }

      setAdvantage(data.act1_advantage)
      setSharedProfile(data.shared_profile)
      setUsedActionIds(data.used_action_ids ?? [])

      if (data.act2_action_id) {
        const existingAction =
          ACTION_LIBRARY.find(
            (item) =>
              item.id === data.act2_action_id
          )

        setAction(existingAction ?? null)
        setLoading(false)
        return
      }

      if (
        power === 'silence' ||
        power === 'permission'
      ) {
        const group =
          power === 'silence'
            ? 'initiative'
            : 'constraint'

        const compatibleActions =
          getCompatibleActions(
            data.shared_profile,
            group,
            data.used_action_ids ?? []
          )

        const selected =
          pickCompatibleAction(
            compatibleActions,
            gameCode,
            group
          )

        if (selected) {
          const { error: registerError } =
            await supabase.rpc(
              'register_action',
              {
                p_game_code: gameCode,
                p_action_id: selected.id,
              }
            )

          if (registerError) {
            console.error(registerError)
          }

          setAction(selected)
        }
      }

      setLoading(false)
    }

    loadEffect()
  }, [
    gameCode,
    power,
    onBlindReveal,
    onComplete,
  ])

  useEffect(() => {
    const channel = supabase
      .channel(
        `act2-effect-${gameCode}-${playerNo}`
      )
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
            'act2_blind_reveal'
          ) {
            onBlindReveal(
              payload.new.act2_blind_result
            )
          }

          if (
            payload.new.status ===
            'act2_complete'
          ) {
            onComplete()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    gameCode,
    playerNo,
    onBlindReveal,
    onComplete,
  ])

  async function chooseBlind(choice) {
    setSubmitting(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'submit_blind_choice',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
        p_choice: choice,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible d’enregistrer votre choix.'
      )
      setSubmitting(false)
      return
    }

    onBlindReveal(data.result)
  }

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE II
          </p>

          <h2>Activation...</h2>
        </section>
      </main>
    )
  }

  const holder =
    advantage === playerNo

  if (power === 'blind_choice') {
    if (holder) {
      return (
        <main className="app">
          <section className="card">
            <p className="eyebrow">
              THE PACT / ACTE II
            </p>

            <h2>Choix à l’aveugle.</h2>

            <p className="intro">
              Votre partenaire doit choisir
              sans connaître les conséquences.
            </p>

            <div className="secret-box">
              Vous connaissez les règles.
              Votre partenaire ne les connaît pas encore.
            </div>

            <div className="status">
              <span className="status-dot"></span>
              En attente de son choix
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

          <h2>Choisissez.</h2>

          <p className="intro">
            Deux options. Aucune explication.
          </p>

          <button
            className="power-card"
            onClick={() => chooseBlind('a')}
            disabled={submitting}
          >
            <span className="power-title">
              OPTION A
            </span>
          </button>

          <button
            className="power-card"
            onClick={() => chooseBlind('b')}
            disabled={submitting}
          >
            <span className="power-title">
              OPTION B
            </span>
          </button>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}
        </section>
      </main>
    )
  }

  if (power === 'silence') {
    return (
      <ActiveEffect
        gameCode={gameCode}
        playerNo={playerNo}
        title="Silence."
        rule={
          'Pendant cette séquence, évitez les questions directes et les instructions verbales inutiles.'
        }
        action={action}
        onComplete={onComplete}
      />
    )
  }

  if (power === 'permission') {
    return (
      <ActiveEffect
        gameCode={gameCode}
        playerNo={playerNo}
        title="Permission."
        rule={
          holder
            ? 'Pendant cette séquence, votre partenaire vous laisse davantage d’initiative. Toute action reste volontaire et peut être refusée.'
            : 'Pendant cette séquence, laissez davantage d’initiative à votre partenaire. Vous pouvez refuser ou interrompre à tout moment.'
        }
        action={action}
        onComplete={onComplete}
      />
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE II
        </p>

        <h2>Effet inconnu.</h2>
      </section>
    </main>
  )
}

function ActTwoBlindReveal({
  gameCode,
  result,
  onComplete,
}) {
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadAction() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          shared_profile,
          used_action_ids,
          act2_action_id
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de préparer cette action.'
        )
        setLoading(false)
        return
      }

      if (data.act2_action_id) {
        const existingAction =
          ACTION_LIBRARY.find(
            (item) =>
              item.id === data.act2_action_id
          )

        if (existingAction) {
          setAction(existingAction)
          setLoading(false)
          return
        }
      }

      const group =
        result === 'initiative'
          ? 'initiative'
          : 'constraint'

      const compatibleActions =
        getCompatibleActions(
          data.shared_profile,
          group,
          data.used_action_ids ?? []
        )

      const selected =
        pickCompatibleAction(
          compatibleActions,
          gameCode,
          group
        )

      if (!selected) {
        setLoading(false)
        return
      }

      const { error: registerError } =
        await supabase.rpc(
          'register_action',
          {
            p_game_code: gameCode,
            p_action_id: selected.id,
          }
        )

      if (registerError) {
        console.error(registerError)
        setErrorMessage(
          'Impossible d’enregistrer cette action.'
        )
      }

      setAction(selected)
      setLoading(false)
    }

    loadAction()
  }, [gameCode, result])

  useEffect(() => {
    const channel = supabase
      .channel(`blind-complete-${gameCode}`)
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
            'act2_complete'
          ) {
            onComplete()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameCode, onComplete])

  async function finishEffect() {
    setFinishing(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'finish_act2_effect',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de terminer cet effet.'
      )
      setFinishing(false)
      return
    }

    onComplete()
  }

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE II
          </p>

          <h2>
            Conséquence en préparation...
          </h2>
        </section>
      </main>
    )
  }

  if (!action) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE II
          </p>

          <h2>Alternative.</h2>

          <p className="intro">
            Aucune action compatible n’a été
            trouvée pour cette conséquence.
          </p>

          <div className="protocol-box">
            <p className="protocol-number">
              RÈGLE NEUTRE
            </p>

            <p>
              Choisissez ensemble une interaction
              qui reste clairement dans votre zone
              de confort commune.
            </p>
          </div>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          <button
            className="primary"
            onClick={finishEffect}
            disabled={finishing}
          >
            {finishing
              ? 'Validation...'
              : 'Effet terminé'}
          </button>
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

        <h2>Conséquence révélée.</h2>

        <div className="result-box">
          <span>Cible</span>

          <strong>
            {action.target === 'holder'
              ? 'Détenteur de l’Avantage'
              : action.target === 'partner'
                ? 'Partenaire'
                : 'Les deux joueurs'}
          </strong>
        </div>

        <div className="protocol-box">
          <p className="protocol-number">
            {action.title.toUpperCase()}
          </p>

          <p>
            {action.text}
          </p>
        </div>

        <div className="result-box">
          <span>Intensité</span>

          <strong>
            {action.intensity} / 5
          </strong>
        </div>

        <p className="warning-text">
          Cette action a été sélectionnée dans
          votre profil commun. Elle peut toujours
          être interrompue ou passée.
        </p>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button
          className="primary"
          onClick={finishEffect}
          disabled={finishing}
        >
          {finishing
            ? 'Validation...'
            : 'Effet terminé'}
        </button>
      </section>
    </main>
  )
}

function ActTwoComplete({
  gameCode,
  playerNo,
  onActThree,
}) {
  const [starting, setStarting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function checkStatus() {
      const { data, error } = await supabase
        .from('games')
        .select('status')
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        return
      }

      if (
        data.status === 'act3_intro' ||
        data.status === 'act3_lock' ||
        data.status === 'act3_solved'
      ) {
        onActThree()
      }
    }

    checkStatus()

    const channel = supabase
      .channel(
        `act3-start-${gameCode}-${playerNo}`
      )
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
            payload.new.status === 'act3_intro' ||
            payload.new.status === 'act3_lock' ||
            payload.new.status === 'act3_solved'
          ) {
            onActThree()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    gameCode,
    playerNo,
    onActThree,
  ])

  async function startActThree() {
    setStarting(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'start_act3',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de lancer l’Acte III.'
      )
      setStarting(false)
      return
    }

    onActThree()
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE II
        </p>

        <h2>L’effet est terminé.</h2>

        <p className="intro">
          PROTOCOL a enregistré la conséquence.
          La dynamique de la partie a changé.
        </p>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        {playerNo === 1 ? (
          <button
            className="primary"
            onClick={startActThree}
            disabled={starting}
          >
            {starting
              ? 'Initialisation...'
              : 'Ouvrir le Verrou'}
          </button>
        ) : (
          <div className="status">
            <span className="status-dot"></span>
            En attente de l’ouverture du Verrou
          </div>
        )}
      </section>
    </main>
  )
}

function ActThreeIntro({
  gameCode,
  playerNo,
  onContinue,
}) {
  const [clue, setClue] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClue() {
      const field =
        playerNo === 1
          ? 'act3_player1_clue'
          : 'act3_player2_clue'

      const { data, error } = await supabase
        .from('games')
        .select(field)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setClue(data[field])
      setLoading(false)
    }

    loadClue()
  }, [gameCode, playerNo])

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <h2>Préparation...</h2>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE III
        </p>

        <h2>Le Verrou.</h2>

        <p className="intro">
          Vous détenez une partie de la solution.
          Votre partenaire possède l’autre.
        </p>

        <div className="secret-box">
          {clue}
        </div>

        <p className="warning-text">
          Vous pouvez communiquer votre indice,
          mais pas montrer votre écran.
        </p>

        <button
          className="primary"
          onClick={onContinue}
        >
          J’ai mémorisé mon indice
        </button>
      </section>
    </main>
  )
}

function ActThreeLock({
  gameCode,
  playerNo,
  onSolved,
}) {
  const [code, setCode] = useState('')
  const [action, setAction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function prepareLock() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          shared_profile,
          used_action_ids,
          act3_action_id,
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de préparer le verrou.'
        )
        setLoading(false)
        return
      }

      if (data.status === 'act3_solved') {
        onSolved()
        return
      }

      if (data.act3_action_id) {
        const existingAction =
          ACTION_LIBRARY.find(
            (item) =>
              item.id ===
              data.act3_action_id
          )

        setAction(existingAction ?? null)
        setLoading(false)
        return
      }

      const candidates =
        getEscalatedActions(
          data.shared_profile,
          data.used_action_ids ?? []
        )

      const selected =
        pickCompatibleAction(
          candidates,
          gameCode,
          'lock'
        )

      if (!selected) {
        setLoading(false)
        return
      }

      const { data: registerData, error: registerError } =
        await supabase.rpc(
          'register_act3_action',
          {
            p_game_code: gameCode,
            p_action_id: selected.id,
          }
        )

      if (registerError) {
        console.error(registerError)
        setErrorMessage(
          'Impossible d’activer la contrainte.'
        )
        setLoading(false)
        return
      }

      const registeredAction =
        ACTION_LIBRARY.find(
          (item) =>
            item.id ===
            registerData.action_id
        )

      setAction(
        registeredAction ?? selected
      )

      setLoading(false)
    }

    prepareLock()
  }, [gameCode, onSolved])

  useEffect(() => {
    const channel = supabase
      .channel(
        `act3-${gameCode}-${playerNo}`
      )
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
            'act3_solved'
          ) {
            onSolved()
          }

          if (
            payload.new.act3_action_id
          ) {
            const selected =
              ACTION_LIBRARY.find(
                (item) =>
                  item.id ===
                  payload.new.act3_action_id
              )

            if (selected) {
              setAction(selected)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    gameCode,
    playerNo,
    onSolved,
  ])

  async function submitCode() {
    setSubmitting(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'solve_act3',
      {
        p_game_code: gameCode,
        p_code: code,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible de vérifier le code.'
      )
      setSubmitting(false)
      return
    }

    if (!data?.solved) {
      setErrorMessage(
        'Code incorrect. Réessayez.'
      )
      setSubmitting(false)
      return
    }

    onSolved()
  }

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE III
          </p>

          <h2>
            Activation du Verrou...
          </h2>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE III
        </p>

        <h2>Le Verrou.</h2>

        {action ? (
          <>
            <div className="result-box">
              <span>
                CONTRAINTE ACTIVE
              </span>

              <strong>
                Niveau {action.intensity}
              </strong>
            </div>

            <div className="protocol-box">
              <p className="protocol-number">
                {action.title.toUpperCase()}
              </p>

              <p>
                {action.text}
              </p>
            </div>

            <p className="warning-text">
              Cette règle reste active jusqu’à
              l’ouverture du verrou. Elle peut
              toujours être interrompue ou passée.
            </p>
          </>
        ) : (
          <div className="protocol-box">
            <p className="protocol-number">
              RÈGLE NEUTRE
            </p>

            <p>
              Aucune contrainte supplémentaire
              compatible n’a été trouvée.
            </p>
          </div>
        )}

        <p className="intro">
          Combinez vos deux indices et entrez
          le code.
        </p>

        <input
          className="code-input"
          type="text"
          inputMode="numeric"
          maxLength="2"
          value={code}
          onChange={(event) =>
            setCode(
              event.target.value.replace(
                /[^0-9]/g,
                ''
              )
            )
          }
          placeholder="••"
        />

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button
          className="primary"
          onClick={submitCode}
          disabled={
            code.length !== 2 ||
            submitting
          }
        >
          {submitting
            ? 'Vérification...'
            : 'Déverrouiller'}
        </button>
      </section>
    </main>
  )
}

function ActThreeSolved() {
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE III
        </p>

        <h2>Verrou ouvert.</h2>

        <div className="protocol-box">
          <p className="protocol-number">
            ACCÈS AUTORISÉ
          </p>

          <p>
            Vous avez résolu le premier verrou.
            PROTOCOL augmente maintenant
            l’intensité.
          </p>
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
  const [act2BlindResult, setAct2BlindResult] = useState(null)

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
      onDebug={() =>
        setScreen('action-debug')
      }
    />
  )
}

  if (screen === 'action-debug') {
  return (
    <ActionDebug
      gameCode={gameCode}
      onBack={() =>
        setScreen('calibration-ready')
      }
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
      gameCode={gameCode}
      power={act2Power}
      playerNo={playerNo}
      onBlindReveal={(result) => {
        setAct2BlindResult(result)
        setScreen('act2-blind-reveal')
      }}
      onComplete={() =>
        setScreen('act2-complete')
      }
    />
  )
}

if (screen === 'act2-blind-reveal') {
  return (
    <ActTwoBlindReveal
      gameCode={gameCode}
      result={act2BlindResult}
      onComplete={() =>
        setScreen('act2-complete')
      }
    />
  )
}

if (screen === 'act2-complete') {
  return (
    <ActTwoComplete
      gameCode={gameCode}
      playerNo={playerNo}
      onActThree={() =>
        setScreen('act3-intro')
      }
    />
  )
}

if (screen === 'act3-intro') {
  return (
    <ActThreeIntro
      gameCode={gameCode}
      playerNo={playerNo}
      onContinue={() =>
        setScreen('act3-lock')
      }
    />
  )
}

if (screen === 'act3-lock') {
  return (
    <ActThreeLock
  gameCode={gameCode}
  playerNo={playerNo}
  onSolved={() =>
    setScreen('act3-solved')
  }
/>
  )
}

if (screen === 'act3-solved') {
  return (
    <ActThreeSolved />
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