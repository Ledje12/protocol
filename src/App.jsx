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

{
  id: 'lock_full_lead',
  category: 'control',
  group: 'lock',
  target: 'partner',
  intensity: 5,
  requires: {
    control: 2,
    surrender: 2,
    sensory: 2,
    provocation: 2,
  },
  title: 'Contrôle total',
  instructions: {
    holder:
      'Pendant le verrou, prenez l’initiative sur le rythme, la proximité et la manière dont l’interaction évolue dans votre zone commune. Cherchez à faire exprimer clairement à votre partenaire ce qu’il souhaite que vous poursuiviez.',
    partner:
      'Pendant le verrou, laissez votre partenaire prendre l’initiative sur le rythme et la proximité dans votre zone commune. Dites clairement ce que vous souhaitez qu’il poursuive, modifie ou arrête.',
  },
},

{
  id: 'lock_permission',
  category: 'control',
  group: 'lock',
  target: 'partner',
  intensity: 5,
  requires: {
    control: 2,
    surrender: 2,
    provocation: 2,
  },
  title: 'Sous permission',
  instructions: {
    holder:
      'Jusqu’à l’ouverture du verrou, votre partenaire doit obtenir votre accord avant chaque changement important dans l’interaction. Répondez simplement oui, autrement ou non.',
    partner:
      'Jusqu’à l’ouverture du verrou, demandez l’accord de votre partenaire avant chaque changement important dans l’interaction. Une réponse différente de oui doit être respectée immédiatement.',
  },
},

{
  id: 'lock_blind_guidance',
  category: 'sensory',
  group: 'lock',
  target: 'partner',
  intensity: 5,
  requires: {
    sensory: 2,
    surprise: 2,
    surrender: 2,
    control: 1,
  },
  title: 'Guidage',
  instructions: {
    holder:
      'Pendant une courte séquence, guidez votre partenaire alors qu’il garde les yeux fermés. Restez uniquement dans les interactions déjà acceptées et interrompez immédiatement s’il le souhaite.',
    partner:
      'Pendant une courte séquence, gardez les yeux fermés et laissez votre partenaire vous guider dans les limites déjà établies. Vous pouvez ouvrir les yeux, modifier ou arrêter la règle à tout moment.',
  },
},

{
  id: 'v1_sensory_trace',
  category: 'sensory',
  group: 'initiative',
  target: 'holder',
  intensity: 2,
  requires: {
    sensory: 1,
  },
  title: 'Suivez la ligne',
  text:
    'Pendant 90 secondes, choisissez une seule zone du corps de votre partenaire et explorez-la lentement avec les doigts. Ne changez de zone que s’il vous le demande.',
},

{
  id: 'v1_sensory_kiss_choice',
  category: 'sensory',
  group: 'initiative',
  target: 'holder',
  intensity: 2,
  requires: {
    sensory: 1,
  },
  title: 'Un seul endroit',
  text:
    'Choisissez un endroit précis sur le corps de votre partenaire et embrassez-le lentement pendant au moins trente secondes. Votre partenaire peut vous guider ou vous demander de changer.',
},

{
  id: 'v1_provocation_finish_sentence',
  category: 'provocation',
  group: 'initiative',
  target: 'holder',
  intensity: 2,
  requires: {
    provocation: 1,
  },
  title: 'Complétez la phrase',
  text:
    'Regardez votre partenaire et complétez : « Ce que j’aimerais que tu fasses plus souvent quand on joue comme ça, c’est… » Ne justifiez pas votre réponse.',
},

{
  id: 'v1_provocation_direct_request',
  category: 'provocation',
  group: 'initiative',
  target: 'holder',
  intensity: 3,
  requires: {
    provocation: 1,
  },
  title: 'Demandez-le',
  text:
    'Formulez une demande concrète que votre partenaire peut réaliser maintenant. Il répond uniquement : « oui », « autrement » ou « pas ce soir ».',
},

{
  id: 'v1_control_three_choices',
  category: 'control',
  group: 'constraint',
  target: 'partner',
  intensity: 3,
  requires: {
    control: 1,
  },
  title: 'Trois décisions',
  instructions: {
    holder:
      'Vous contrôlez les trois prochaines décisions : où votre partenaire se place, la proximité entre vous et qui initie le prochain contact.',
    partner:
      'Pour les trois prochaines décisions, laissez votre partenaire choisir votre position, votre proximité et qui initie le prochain contact. Vous pouvez modifier ou refuser chaque choix.',
  },
},

{
  id: 'v1_control_yes_otherwise',
  category: 'control',
  group: 'constraint',
  target: 'partner',
  intensity: 3,
  requires: {
    control: 1,
    provocation: 1,
  },
  title: 'Oui ou autrement',
  instructions: {
    holder:
      'Pendant deux minutes, formulez jusqu’à trois demandes précises. Votre partenaire répond uniquement : « oui », « autrement » ou « non ».',
    partner:
      'Pendant deux minutes, votre partenaire peut formuler jusqu’à trois demandes précises. Répondez uniquement : « oui », « autrement » ou « non ». Chaque réponse reste entièrement libre.',
  },
},

{
  id: 'v1_exploration_feet_service',
  category: 'exploration',
  group: 'constraint',
  target: 'partner',
  intensity: 4,
  requires: {
    exploration: 2,
    control: 1,
  },
  title: 'À ses pieds',
  instructions: {
    holder:
      'Installez-vous confortablement et choisissez un pied. Pendant deux minutes, guidez votre partenaire sur ce qui vous plaît : massage, baisers ou jeu plus suggestif.',
    partner:
      'Placez-vous devant votre partenaire. Pendant deux minutes, consacrez votre attention au pied qu’il choisit : massage, baisers, langue ou bouche selon ce qui vous convient tous les deux.',
  },
},

{
  id: 'v1_restraint_service_position',
  category: 'restraint',
  group: 'constraint',
  target: 'partner',
  intensity: 4,
  requires: {
    restraint: 2,
    control: 1,
  },
  title: 'Position de service',
  instructions: {
    holder:
      'Demandez à votre partenaire de se placer à quatre pattes pendant 90 secondes. Vous pouvez choisir une posture précise et utiliser son dos comme appui léger pour vos mains ou vos pieds, sans poids dangereux.',
    partner:
      'Placez-vous à quatre pattes pendant 90 secondes et laissez votre partenaire choisir votre posture. Il peut utiliser votre dos comme appui léger. Changez ou interrompez la position dès qu’elle devient inconfortable.',
  },
},

{
  id: 'v1_sensory_oil',
  category: 'sensory',
  group: 'initiative',
  target: 'holder',
  intensity: 3,
  requires: {
    sensory: 1,
    exploration: 1,
  },
  title: 'Huile',
  text:
    'Si vous avez de l’huile de massage, consacrez cinq minutes à un massage lent. Votre partenaire choisit progressivement les zones qu’il souhaite voir massées. Sans huile, utilisez simplement vos mains.',
},

{
  id: 'v1_sensory_isolation',
  category: 'sensory',
  group: 'constraint',
  target: 'partner',
  intensity: 4,
  requires: {
    sensory: 2,
    exploration: 1,
  },
  title: 'Isolation',
  instructions: {
    holder:
      'Pendant trois minutes, votre partenaire ferme les yeux ou utilise un bandeau. Si vous avez des écouteurs, ajoutez de la musique. Faites varier doucement les sensations par le toucher et éventuellement par une odeur ou un goût familier.',
    partner:
      'Pendant trois minutes, renoncez volontairement à la vue avec les yeux fermés ou un bandeau. Si possible, utilisez aussi de la musique dans des écouteurs. Laissez votre partenaire créer les sensations. Vous pouvez interrompre immédiatement la scène.',
  },
},

{
  id: 'v1_control_no_initiative',
  category: 'control',
  group: 'constraint',
  target: 'partner',
  intensity: 5,
  requires: {
    control: 2,
    sensory: 2,
    provocation: 2,
  },
  title: 'Aucune initiative',
  instructions: {
    holder:
      'Pendant trois minutes, vous prenez toutes les initiatives dans la zone commune : proximité, position, rythme et prochain contact. Cherchez à obtenir une réaction claire plutôt qu’à aller vite.',
    partner:
      'Pendant trois minutes, ne prenez aucune nouvelle initiative. Laissez votre partenaire décider de la proximité, de la position et du rythme. Vous conservez à tout moment « oui », « autrement » et « stop ».',
  },
},

{
  id: 'v1_exploration_choose_focus',
  category: 'exploration',
  group: 'initiative',
  target: 'holder',
  intensity: 5,
  requires: {
    exploration: 2,
    sensory: 2,
    provocation: 2,
  },
  title: 'Choisissez votre obsession',
  text:
    'Choisissez une partie du corps de votre partenaire que vous voulez explorer pendant trois minutes. Dites-lui laquelle avant de commencer. Pendant ces trois minutes, restez concentré uniquement sur cette zone et adaptez-vous à ses réactions.',
},

]

const QUESTION_LIBRARY = {
  desire_more_often: {
    level: 2,
    title: 'Ce qui manque.',
    text:
      'Quelle chose aimeriez-vous que votre partenaire prenne plus souvent l’initiative de faire avec vous ?',
    placeholder:
      'Écrivez une réponse courte et précise...',
  },

  attention_body: {
    level: 2,
    title: 'Votre regard.',
    text:
      'Quelle partie du corps de votre partenaire attire votre attention plus souvent qu’il ne le pense ?',
    placeholder:
      'Une partie du corps...',
  },

  initiative_missing: {
    level: 2,
    title: 'Sans demander.',
    text:
      'Quelle chose aimeriez-vous que votre partenaire fasse parfois spontanément, sans attendre que vous la demandiez ?',
    placeholder:
      'Ce que vous aimeriez qu’il initie...',
  },

  want_more: {
    level: 3,
    title: 'Plus souvent.',
    text:
      'Parmi ce qui se passe déjà entre vous, qu’aimeriez-vous vivre plus souvent ou plus longtemps ?',
    placeholder:
      'Une chose que vous voudriez amplifier...',
  },

  surprise_me: {
    level: 3,
    title: 'Surprenez-moi.',
    text:
      'Dans quelle situation aimeriez-vous parfois que votre partenaire décide à votre place de la suite, tout en restant dans vos limites ?',
    placeholder:
      'Décrivez une situation...',
  },

  unspoken_request: {
    level: 4,
    title: 'La demande retenue.',
    text:
      'Quelle demande intime avez-vous déjà eu envie de formuler à votre partenaire sans vraiment aller jusqu’au bout ?',
    placeholder:
      'Une demande que vous avez retenue...',
  },

  control_fantasy: {
    level: 4,
    title: 'Le contrôle.',
    text:
      'Si vous deviez choisir pour ce soir, qu’est-ce qui vous attirerait le plus : diriger davantage, lâcher davantage prise, ou alterner les deux ? Pourquoi ?',
    placeholder:
      'Diriger, lâcher prise, alterner...',
  },

  comfort_edge: {
    level: 4,
    title: 'Juste au bord.',
    text:
      'Quelle expérience pourrait vous faire légèrement sortir de votre zone de confort tout en restant excitante plutôt qu’inconfortable ?',
    placeholder:
      'Quelque chose d’un peu audacieux...',
  },
}

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
  usedActionIds = [],
  rejectedActionIds = []
) {
  return ACTION_LIBRARY.filter(
    (action) =>
      action.group === group &&
      !usedActionIds.includes(action.id) &&
      !rejectedActionIds.includes(action.id) &&
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
  usedActionIds = [],
  stage = 1,
  rejectedActionIds = []
) {
  const compatible =
  getCompatibleActions(
    profile,
    'lock',
    usedActionIds,
    rejectedActionIds
  )

  if (compatible.length === 0) {
    return []
  }

  const targetIntensity =
    stage === 1
      ? 3
      : stage === 2
        ? 4
        : 5

  const allowedTarget =
    Math.min(
      targetIntensity,
      profile?.intensity ?? 1
    )

  let candidates =
    compatible.filter(
      (action) =>
        action.intensity === allowedTarget
    )

  if (candidates.length > 0) {
    return candidates
  }

  const lower =
    compatible.filter(
      (action) =>
        action.intensity < allowedTarget
    )

  if (lower.length === 0) {
    return compatible
  }

  const bestFallback =
    Math.max(
      ...lower.map(
        (action) => action.intensity
      )
    )

  return lower.filter(
    (action) =>
      action.intensity === bestFallback
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
    control: 1,
    sensory: 1,
    restraint: 1,
    provocation: 1,
    exploration: 1,
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const dimensions = [
    {
      key: 'control',
      label: 'Contrôle',
      description:
        'Diriger, lâcher prise, donner ou recevoir des consignes, jouer avec la permission ou l’obéissance.',
    },
    {
      key: 'sensory',
      label: 'Sensoriel',
      description:
        'Toucher, goût, anticipation, yeux fermés, massage et jeux sur les sensations.',
    },
    {
      key: 'restraint',
      label: 'Contraintes',
      description:
        'Positions imposées, immobilité, restrictions temporaires et accessoires de contrainte.',
    },
    {
      key: 'provocation',
      label: 'Provocation',
      description:
        'Défis, demandes directes, confidences, exposition, jeu de rôle et situations volontairement déstabilisantes.',
    },
    {
      key: 'exploration',
      label: 'Exploration',
      description:
        'Sortir davantage de vos habitudes : accessoires, jeux inhabituels, fétiches et expériences plus audacieuses.',
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
        'Impossible d’enregistrer votre calibration.'
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
      .channel(
        `calibration-${gameCode}-${playerNo}`
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
            'calibration_ready'
          ) {
            onReady(
              payload.new.shared_profile
            )
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
    onReady,
  ])

  if (submitted) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            PROTOCOL / CALIBRATION
          </p>

          <h2>Profil verrouillé.</h2>

          <p className="intro">
            Vos réponses restent privées.
            PROTOCOL ne conservera que votre
            terrain de jeu commun.
          </p>

          <div className="status">
            <span className="status-dot"></span>
            En attente du joueur{' '}
            {playerNo === 1 ? '2' : '1'}
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

        <h2>Définissez le terrain.</h2>

        <p className="intro">
          Ne répondez pas pour ce que vous
          accepteriez « en théorie ».
          Définissez simplement ce qui correspond
          à la partie de ce soir.
        </p>

        <div className="protocol-box">
          <p className="protocol-number">
            RÈGLE 00
          </p>

          <p>
            Vos choix individuels ne seront jamais
            montrés à votre partenaire.
            PROTOCOL utilisera uniquement ce que
            vous avez accepté tous les deux.
          </p>
        </div>

        <div className="calibration-section">
          <p className="calibration-label">
            INTENSITÉ
          </p>

          <p className="calibration-description">
            Jusqu’où voulez-vous laisser la partie
            vous pousser ce soir ?
          </p>

          <div className="intensity-grid">
            {[1, 2, 3, 4, 5].map(
              (value) => (
                <button
                  key={value}
                  className={
                    intensity === value
                      ? 'choice-button selected'
                      : 'choice-button'
                  }
                  onClick={() =>
                    setIntensity(value)
                  }
                >
                  {value}
                </button>
              )
            )}
          </div>

          <p className="warning-text">
            1 = confortable · 3 = audacieux ·
            5 = très direct
          </p>
        </div>

        {dimensions.map(
          (dimension) => (
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
                    answers[
                      dimension.key
                    ] === 0
                      ? 'choice-button selected'
                      : 'choice-button'
                  }
                  onClick={() =>
                    updateAnswer(
                      dimension.key,
                      0
                    )
                  }
                >
                  Non
                </button>

                <button
                  className={
                    answers[
                      dimension.key
                    ] === 1
                      ? 'choice-button selected'
                      : 'choice-button'
                  }
                  onClick={() =>
                    updateAnswer(
                      dimension.key,
                      1
                    )
                  }
                >
                  Peut-être
                </button>

                <button
                  className={
                    answers[
                      dimension.key
                    ] === 2
                      ? 'choice-button selected'
                      : 'choice-button'
                  }
                  onClick={() =>
                    updateAnswer(
                      dimension.key,
                      2
                    )
                  }
                >
                  Oui
                </button>
              </div>
            </div>
          )
        )}

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
            ? 'Analyse...'
            : 'Verrouiller mon profil'}
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
  const [role, setRole] = useState('')
  const [objective, setObjective] = useState('')
  const [missionVisible, setMissionVisible] = useState(false)
  const [partnerResolved, setPartnerResolved] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const resultLabels = {
    success: 'MISSION ACCOMPLIE',
    exposed: 'VOUS AVEZ ÉTÉ DÉMASQUÉ',
    abandoned: 'MISSION PASSÉE',
  }

  useEffect(() => {
    async function loadGame() {
      const { data, error } = await supabase
        .from('games')
        .select(`
          player1_role,
          player2_role,
          player1_objective,
          player2_objective,
          player1_act1_result,
          player2_act1_result,
          status
        `)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setErrorMessage(
          'Impossible de charger l’Acte I.'
        )
        setLoading(false)
        return
      }

      if (data.status === 'act1_reveal') {
        onReveal()
        return
      }

      const ownResult =
        playerNo === 1
          ? data.player1_act1_result
          : data.player2_act1_result

      const otherResult =
        playerNo === 1
          ? data.player2_act1_result
          : data.player1_act1_result

      const ownRole =
        playerNo === 1
          ? data.player1_role
          : data.player2_role

      const ownObjective =
        playerNo === 1
          ? data.player1_objective
          : data.player2_objective

      setResult(ownResult ?? 'pending')
      setRole(ownRole ?? '')
      setObjective(ownObjective ?? '')

      setPartnerResolved(
        otherResult &&
        otherResult !== 'pending'
      )

      setLoading(false)
    }

    loadGame()
  }, [
    gameCode,
    playerNo,
    onReveal,
  ])

  useEffect(() => {
    const channel = supabase
      .channel(
        `act1-${gameCode}-${playerNo}`
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
          const game = payload.new

          const ownResult =
            playerNo === 1
              ? game.player1_act1_result
              : game.player2_act1_result

          const otherResult =
            playerNo === 1
              ? game.player2_act1_result
              : game.player1_act1_result

          setResult(
            ownResult ?? 'pending'
          )

          setPartnerResolved(
            otherResult &&
            otherResult !== 'pending'
          )

          if (
            game.status === 'act1_reveal'
          ) {
            onReveal()
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
    onReveal,
  ])

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

  if (loading) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE I
          </p>

          <h2>Activation...</h2>
        </section>
      </main>
    )
  }

  if (result !== 'pending') {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / ACTE I
          </p>

          <h2>
            Votre décision est verrouillée.
          </h2>

          <div className="result-box">
            <span>Résultat déclaré</span>

            <strong>
              {resultLabels[result] ??
                'ENREGISTRÉ'}
            </strong>
          </div>

          <p className="intro">
            Votre partenaire ne connaît pas encore
            votre mission ni le résultat que vous
            avez déclaré.
          </p>

          {partnerResolved ? (
            <div className="status">
              <span className="status-dot"></span>
              Les deux décisions sont enregistrées
            </div>
          ) : (
            <div className="status">
              <span className="status-dot"></span>
              Votre partenaire joue encore
            </div>
          )}

          <p className="warning-text">
            Ne révélez rien avant que PROTOCOL
            ouvre la phase de révélation.
          </p>
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
          Votre partenaire poursuit sa propre
          mission. Vous ignorez ce qu’il tente
          d’obtenir de vous.
        </p>

        <div className="result-box">
          <span>Votre rôle</span>
          <strong>{role}</strong>
        </div>

        <div className="protocol-box">
          <p className="protocol-number">
            PROTOCOLE 01
          </p>

          <p>
            Faites évoluer naturellement la
            situation jusqu’à obtenir ce que votre
            mission exige.
          </p>

          <p>
            Ne rendez pas votre intention trop
            évidente. Votre partenaire pourrait
            comprendre ce que vous cherchez.
          </p>
        </div>

        {!missionVisible ? (
          <button
            className="secondary"
            onClick={() =>
              setMissionVisible(true)
            }
          >
            Revoir ma mission
          </button>
        ) : (
          <>
            <div className="secret-box">
              {objective}
            </div>

            <button
              className="secondary"
              onClick={() =>
                setMissionVisible(false)
              }
            >
              Masquer ma mission
            </button>
          </>
        )}

        {partnerResolved && (
          <div className="status">
            <span className="status-dot"></span>
            Votre partenaire a verrouillé sa décision
          </div>
        )}

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
          Votre décision reste secrète jusqu’à
          la révélation.
        </p>
      </section>
    </main>
  )
}

function ActOneReveal({
  gameCode,
  playerNo,
  onInterrogation,
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

      if (
        data.status === 'interrogation' ||
        data.status === 'interrogation_reveal' ||
        data.status === 'interrogation_complete'
      ) {
        onInterrogation()
        return
      }

      setGame(data)
      setLoading(false)
    }

    loadResult()
  }, [
    gameCode,
    onInterrogation,
  ])

  useEffect(() => {
    const channel = supabase
      .channel(
        `act1-reveal-${gameCode}-${playerNo}`
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
          const status =
            payload.new.status

          if (
            status === 'interrogation' ||
            status === 'interrogation_reveal' ||
            status === 'interrogation_complete'
          ) {
            onInterrogation()
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
    onInterrogation,
  ])

  async function startInterrogation() {
    setStarting(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'start_interrogation',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)

      setErrorMessage(
        'Impossible de lancer l’interrogatoire.'
      )

      setStarting(false)
      return
    }

    onInterrogation()
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

          <h2>
            Résultat indisponible.
          </h2>

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

        <h2>
          Voici ce qui se jouait.
        </h2>

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
          <span>Ascendant détecté</span>

          <strong>
            {game.act1_advantage
              ? `Joueur ${game.act1_advantage}`
              : 'Aucun'}
          </strong>
        </div>

        <div className="protocol-box">
          <p className="protocol-number">
            ANALYSE 01
          </p>

          <p>
            PROTOCOL sait maintenant
            ce que vous avez tenté d’obtenir
            l’un de l’autre.
          </p>

          <p>
            Il lui manque encore ce que
            vous n’avez pas essayé de montrer.
          </p>
        </div>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        {playerNo === 1 ? (
          <button
            className="primary"
            onClick={startInterrogation}
            disabled={starting}
          >
            {starting
              ? 'Initialisation...'
              : 'Continuer'}
          </button>
        ) : (
          <div className="status">
            <span className="status-dot"></span>
            En attente de la prochaine phase
          </div>
        )}
      </section>
    </main>
  )
}

function Interrogation({
  gameCode,
  playerNo,
  onActTwo,
}) {
  const [state, setState] = useState(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadState() {
    const { data, error } = await supabase.rpc(
      'get_interrogation_state',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
      }
    )

    if (error) {
      console.error(error)

      setErrorMessage(
        'Impossible de charger l’interrogatoire.'
      )

      setLoading(false)
      return
    }

    setState(data)

    if (data?.own_answer) {
      setAnswer(data.own_answer)
    } else {
      setAnswer('')
    }

    setLoading(false)
  }

  useEffect(() => {
    loadState()

    const channel = supabase
  .channel(
    `interrogation-${gameCode}-${playerNo}`
  )
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'games',
      filter: `code=eq.${gameCode}`,
    },
    async (payload) => {
      if (
        payload.new.status === 'interrogation' ||
        payload.new.status === 'interrogation_reveal'
      ) {
        await loadState()
      }

      if (
        payload.new.status ===
        'interrogation_complete'
      ) {
        await loadState()
      }

      if (
        payload.new.status === 'act2_choice'
      ) {
        onActTwo()
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
    onActTwo,
  ])

  async function submitAnswer() {
    if (!answer.trim()) {
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'submit_interrogation_answer',
      {
        p_game_code: gameCode,
        p_player_no: playerNo,
        p_answer: answer.trim(),
      }
    )

    if (error) {
      console.error(error)

      setErrorMessage(
        'Impossible d’enregistrer votre réponse.'
      )

      setSubmitting(false)
      return
    }

    setSubmitting(false)

    await loadState()
  }

  async function advance() {
    setAdvancing(true)
    setErrorMessage('')

    const { data, error } = await supabase.rpc(
      'advance_interrogation',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)

      setErrorMessage(
        'Impossible de poursuivre l’interrogatoire.'
      )

      setAdvancing(false)
      return
    }

    if (data?.complete) {
      setState((current) => ({
        ...current,
        status: 'interrogation_complete',
      }))

      setAdvancing(false)
      return
    }

    setAnswer('')
    setAdvancing(false)

    await loadState()
  }

  async function startActTwo() {
    setAdvancing(true)
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
        'Impossible d’ouvrir l’Acte II.'
      )

      setAdvancing(false)
      return
    }

    onActTwo()
  }

  if (loading || !state) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / INTERROGATOIRE
          </p>

          <h2>Analyse en cours...</h2>
        </section>
      </main>
    )
  }

  if (
    state.status ===
    'interrogation_complete'
  ) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / INTERROGATOIRE
          </p>

          <h2>
            Données suffisantes.
          </h2>

          <div className="protocol-box">
            <p className="protocol-number">
              PROFIL DE SESSION
            </p>

            <p>
              Vous venez de fournir à PROTOCOL
              des informations que votre
              calibration ne pouvait pas mesurer.
            </p>

            <p>
              Vos intentions ne sont plus
              seulement théoriques.
              Elles font désormais partie
              de cette session.
            </p>
          </div>

          <p className="intro">
            Une influence a été détectée pendant
            le Signal. PROTOCOL va maintenant
            lui donner du poids.
          </p>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          {playerNo === 1 ? (
            <button
              className="primary"
              onClick={startActTwo}
              disabled={advancing}
            >
              {advancing
                ? 'Activation...'
                : 'Ouvrir L’ASCENDANT'}
            </button>
          ) : (
            <div className="status">
              <span className="status-dot"></span>
              En attente de l’activation
            </div>
          )}
        </section>
      </main>
    )
  }

  const question =
    QUESTION_LIBRARY[
      state.question_id
    ]

  if (!question) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / INTERROGATOIRE
          </p>

          <h2>
            Question introuvable.
          </h2>
        </section>
      </main>
    )
  }

  /*
   * RÉVÉLATION
   */
  if (
    state.status ===
    'interrogation_reveal'
  ) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / INTERROGATOIRE
          </p>

          <p className="protocol-number">
            RÉVÉLATION {state.round} / 2
          </p>

          <h2>{question.title}</h2>

          <p className="intro">
            {question.text}
          </p>

          <div className="reveal-player">
            <p className="protocol-number">
              JOUEUR 1
            </p>

            <p>
              {state.player1_answer}
            </p>
          </div>

          <div className="reveal-player">
            <p className="protocol-number">
              JOUEUR 2
            </p>

            <p>
              {state.player2_answer}
            </p>
          </div>

          <div className="protocol-box">
            <p className="protocol-number">
              OBSERVATION
            </p>

            <p>
              PROTOCOL ne cherche pas une bonne
              réponse. Il cherche ce qui se
              produit lorsque vos réponses
              cessent d’être privées.
            </p>
          </div>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          {playerNo === 1 ? (
            <button
              className="primary"
              onClick={advance}
              disabled={advancing}
            >
              {advancing
                ? 'Analyse...'
                : state.round === 1
                  ? 'Interrogatoire suivant'
                  : 'Terminer l’analyse'}
            </button>
          ) : (
            <div className="status">
              <span className="status-dot"></span>
              PROTOCOL attend la suite
            </div>
          )}
        </section>
      </main>
    )
  }

  /*
   * JOUEUR AYANT DÉJÀ RÉPONDU
   */
  if (state.submitted) {
    return (
      <main className="app">
        <section className="card">
          <p className="eyebrow">
            THE PACT / INTERROGATOIRE
          </p>

          <p className="protocol-number">
            QUESTION {state.round} / 2
          </p>

          <h2>Réponse verrouillée.</h2>

          <div className="secret-box">
            {answer}
          </div>

          <p className="intro">
            Votre partenaire n’a pas encore
            accès à cette réponse.
          </p>

          <div className="status">
            <span className="status-dot"></span>
            En attente de sa réponse
          </div>
        </section>
      </main>
    )
  }

  /*
   * QUESTION
   */
  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / INTERROGATOIRE
        </p>

        <p className="protocol-number">
          QUESTION {state.round} / 2
        </p>

        <h2>{question.title}</h2>

        <p className="intro">
          Répondez sans consulter votre partenaire.
          Vos réponses seront révélées uniquement
          lorsque vous aurez répondu tous les deux.
        </p>

        <div className="protocol-box">
          <p>
            {question.text}
          </p>
        </div>

        <textarea
          className="answer-input"
          rows="5"
          maxLength="500"
          value={answer}
          placeholder={
            question.placeholder
          }
          onChange={(event) =>
            setAnswer(
              event.target.value
            )
          }
        />

        <p className="warning-text">
          Cette réponse concerne uniquement
          la partie de ce soir.
        </p>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        <button
          className="primary"
          onClick={submitAnswer}
          disabled={
            !answer.trim() ||
            submitting
          }
        >
          {submitting
            ? 'Verrouillage...'
            : 'Verrouiller ma réponse'}
        </button>
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
  const [stage, setStage] = useState(1)

  useEffect(() => {
    async function loadClue() {
      const field =
        playerNo === 1
          ? 'act3_player1_clue'
          : 'act3_player2_clue'

      const { data, error } = await supabase
        .from('games')
        .select(`
  ${field},
  act3_stage
`)
        .eq('code', gameCode)
        .single()

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      setClue(data[field])
setStage(data.act3_stage ?? 1)
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

  const stageTitles = {
  1: 'La Transmission',
  2: 'L’Interdit',
  3: 'L’Aveu',
}

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE III
        </p>

        <h2>
  {stageTitles[stage] ?? 'Le Verrou'}
</h2>

<div className="result-box">
  <span>Verrou</span>
  <strong>{stage} / 3</strong>
</div>

        <p className="intro">
  {stage === 1 &&
    'Vous détenez chacun une partie de la transmission. Aucun écran ne contient la solution complète.'}

  {stage === 2 &&
    'L’un de vous possède les valeurs. L’autre possède la règle. Vous devrez obtenir ce qu’il vous manque.'}

  {stage === 3 &&
    'Le dernier verrou ne s’ouvrira pas uniquement avec de la logique. Une information devra être donnée à voix haute.'}
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
  onNextLock,
}) {
  const [code, setCode] = useState('')
  const [action, setAction] = useState(null)
  const [stage, setStage] = useState(1)
  const [activePlayer, setActivePlayer] = useState(1)
  const [skipped, setSkipped] = useState(false)
  const [rejectedActionIds, setRejectedActionIds] = useState([])
const [rerolling, setRerolling] = useState(false)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function prepareLock() {
      const { data, error } = await supabase
        .from('games')
        .select(`
            shared_profile,
  used_action_ids,
  rejected_action_ids,
  act3_action_id,
  act3_action_skipped,
  act3_stage,
  act1_advantage,
  status
        `)
        .eq('code', gameCode)
        .single()

      if (error || !data) {
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

      const currentStage =
        data.act3_stage ?? 1

      setStage(currentStage)

      /*
       * Si quelqu’un a gagné l’Avantage à l’Acte I,
       * il devient le joueur actif.
       *
       * Sinon PROTOCOL choisit de façon
       * déterministe à partir du code de partie.
       */
      const controller =
        data.act1_advantage ??
        ((hashString(gameCode) % 2) + 1)

      setActivePlayer(controller)

      setSkipped(
        data.act3_action_skipped ?? false
      )

      setRejectedActionIds(
  data.rejected_action_ids ?? []
)

      /*
       * Une action existe déjà :
       * on la recharge simplement.
       */
      if (data.act3_action_id) {
        const existingAction =
          ACTION_LIBRARY.find(
            (item) =>
              item.id ===
              data.act3_action_id
          )

        setAction(
          existingAction ?? null
        )

        setLoading(false)
        return
      }

      /*
       * Nouvelle action pour ce verrou.
       */
      const candidates =
  getEscalatedActions(
    data.shared_profile,
    data.used_action_ids ?? [],
    currentStage,
    data.rejected_action_ids ?? []
  )

      const selected =
        pickCompatibleAction(
          candidates,
          gameCode,
          `lock-${currentStage}`
        )

      if (!selected) {
        setLoading(false)
        return
      }

      const {
        data: registerData,
        error: registerError,
      } = await supabase.rpc(
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
            registerData?.action_id
        )

      setAction(
        registeredAction ?? selected
      )

      setLoading(false)
    }

    prepareLock()
  }, [
    gameCode,
    onSolved,
  ])

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
          const game = payload.new

          if (
            game.status === 'act3_solved'
          ) {
            onSolved()
            return
          }

          if (
            game.status === 'act3_between'
          ) {
            onNextLock(
              game.act3_stage ??
                stage + 1
            )
            return
          }

          setSkipped(
            game.act3_action_skipped ??
              false
          )

          if (
            game.act3_action_id
          ) {
            const selected =
              ACTION_LIBRARY.find(
                (item) =>
                  item.id ===
                  game.act3_action_id
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
    onNextLock,
    stage,
  ])

  async function rerollAction() {
  if (!action) {
    return
  }

  setRerolling(true)
  setErrorMessage('')

  const { error } = await supabase.rpc(
    'reject_action',
    {
      p_game_code: gameCode,
      p_action_id: action.id,
    }
  )

  if (error) {
    console.error(error)

    setErrorMessage(
      'Impossible de chercher une autre proposition.'
    )

    setRerolling(false)
    return
  }

  const nextRejected = [
    ...new Set([
      ...rejectedActionIds,
      action.id,
    ]),
  ]

  setRejectedActionIds(nextRejected)

  const { data: game, error: gameError } =
    await supabase
      .from('games')
      .select(`
        shared_profile,
        used_action_ids,
        act3_stage
      `)
      .eq('code', gameCode)
      .single()

  if (gameError || !game) {
    console.error(gameError)

    setErrorMessage(
      'Impossible de préparer une nouvelle proposition.'
    )

    setRerolling(false)
    return
  }

  const candidates =
    getEscalatedActions(
      game.shared_profile,
      game.used_action_ids ?? [],
      game.act3_stage ?? stage,
      nextRejected
    )

  const selected =
    pickCompatibleAction(
      candidates,
      `${gameCode}-${nextRejected.length}`,
      `lock-${game.act3_stage ?? stage}`
    )

  if (!selected) {
    setAction(null)
    setRerolling(false)
    return
  }

  const {
    data: registerData,
    error: registerError,
  } = await supabase.rpc(
    'register_act3_action',
    {
      p_game_code: gameCode,
      p_action_id: selected.id,
    }
  )

  if (registerError) {
    console.error(registerError)

    setErrorMessage(
      'Impossible d’activer la nouvelle proposition.'
    )

    setRerolling(false)
    return
  }

  const registered =
    ACTION_LIBRARY.find(
      (item) =>
        item.id === registerData?.action_id
    )

  setAction(
    registered ?? selected
  )

  setRerolling(false)
}

  async function skipAction() {
    setSkipping(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'skip_act3_action',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)

      setErrorMessage(
        'Impossible de passer cette contrainte.'
      )

      setSkipping(false)
      return
    }

    setSkipped(true)
    setSkipping(false)
  }

  async function submitCode() {
    setSubmitting(true)
    setErrorMessage('')

    const { data, error } =
      await supabase.rpc(
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

    if (data?.complete) {
      onSolved()
      return
    }

    onNextLock(data.stage)
  }

  /*
   * Instruction privée affichée
   * uniquement à ce téléphone.
   */
  let instruction = action?.text ?? ''

  if (action?.instructions) {
    instruction =
      playerNo === activePlayer
        ? action.instructions.holder
        : action.instructions.partner
  }

  const playerRole =
    playerNo === activePlayer
      ? 'INITIATIVE'
      : 'RÉPONSE'

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

        <h2>
          Verrou {stage}.
        </h2>

        {action && !skipped ? (
          <>
            <div className="result-box">
              <span>
                CONTRAINTE ACTIVE
              </span>

              <strong>
                Niveau {action.intensity}
              </strong>
            </div>

            {action.instructions && (
              <div className="result-box">
                <span>
                  Votre position
                </span>

                <strong>
                  {playerRole}
                </strong>
              </div>
            )}

            <div className="protocol-box">
              <p className="protocol-number">
                {action.title.toUpperCase()}
              </p>

              <p>
                {instruction}
              </p>
            </div>

            <p className="warning-text">
              Cette instruction est privée.
              Votre partenaire peut avoir reçu
              une règle différente.
            </p>

            <button
  className="secondary"
  onClick={rerollAction}
  disabled={rerolling || skipping}
>
  {rerolling
    ? 'Recherche...'
    : 'Autre proposition'}
</button>
            
            <button
              className="tertiary-button"
              onClick={skipAction}
              disabled={skipping}
            >
              {skipping
                ? 'Passage...'
                : 'Passer cette contrainte'}
            </button>
          </>
        ) : skipped ? (
          <div className="protocol-box">
            <p className="protocol-number">
              CONTRAINTE PASSÉE
            </p>

            <p>
              La contrainte physique ou
              relationnelle est désactivée.
              L’énigme reste active.
            </p>
          </div>
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

function ActThreeBetween({
  gameCode,
  stage,
  playerNo,
  onContinue,
}) {
  const [starting, setStarting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const channel = supabase
      .channel(
        `act3-between-${gameCode}-${playerNo}`
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
            'act3_intro'
          ) {
            onContinue()
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
    onContinue,
  ])

  async function continueActThree() {
    setStarting(true)
    setErrorMessage('')

    const { error } = await supabase.rpc(
      'continue_act3',
      {
        p_game_code: gameCode,
      }
    )

    if (error) {
      console.error(error)
      setErrorMessage(
        'Impossible d’ouvrir le verrou suivant.'
      )
      setStarting(false)
      return
    }

    onContinue()
  }

  return (
    <main className="app">
      <section className="card">
        <p className="eyebrow">
          THE PACT / ACTE III
        </p>

        <h2>Verrou ouvert.</h2>

        <div className="protocol-box">
          <p className="protocol-number">
            NIVEAU {stage} AUTORISÉ
          </p>

          <p>
            PROTOCOL augmente la pression.
            Le verrou suivant sera moins indulgent.
          </p>
        </div>

        {errorMessage && (
          <p className="error-message">
            {errorMessage}
          </p>
        )}

        {playerNo === 1 ? (
          <button
            className="primary"
            onClick={continueActThree}
            disabled={starting}
          >
            {starting
              ? 'Ouverture...'
              : 'Continuer'}
          </button>
        ) : (
          <div className="status">
            <span className="status-dot"></span>
            En attente du prochain verrou
          </div>
        )}
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

        <h2>Les trois verrous sont ouverts.</h2>

        <div className="protocol-box">
          <p className="protocol-number">
            ACCÈS AUTORISÉ
          </p>

          <p>
            Les trois verrous ont été résolus.
            PROTOCOL a validé votre progression
            et ouvre maintenant la phase suivante.
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
  const [act3Stage, setAct3Stage] = useState(1)

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
  onInterrogation={() =>
    setScreen('interrogation')
  }
/>
  )
}

if (screen === 'interrogation') {
  return (
    <Interrogation
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
      onNextLock={(stage) => {
        setAct3Stage(stage)
        setScreen('act3-between')
      }}
      onSolved={() =>
        setScreen('act3-solved')
      }
    />
  )
}

if (screen === 'act3-between') {
  return (
    <ActThreeBetween
      gameCode={gameCode}
      stage={act3Stage}
      playerNo={playerNo}
      onContinue={() =>
        setScreen('act3-intro')
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