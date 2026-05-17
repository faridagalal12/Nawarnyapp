const DEFAULT_COLOR = '#1689EA';

const LEVELS = [
  { id: 1, title: 'Basics', difficulty: 'Easy', reward: 120 },
  { id: 2, title: 'Core Concepts', difficulty: 'Easy', reward: 160 },
  { id: 3, title: 'Recognition', difficulty: 'Medium', reward: 210 },
  { id: 4, title: 'Connections', difficulty: 'Medium', reward: 260 },
  { id: 5, title: 'Process Flow', difficulty: 'Medium', reward: 320 },
  { id: 6, title: 'Scenarios', difficulty: 'Hard', reward: 390 },
  { id: 7, title: 'Advanced Lab', difficulty: 'Hard', reward: 470 },
  { id: 8, title: 'Final Checkpoint', difficulty: 'Boss', reward: 600 },
];

const TOPIC_BANK = {
  'UI/UX': {
    subtitle: 'Level up your design thinking',
    concepts: ['hierarchy', 'contrast', 'spacing', 'wireframes', 'color systems', 'prototyping'],
    actions: ['compare layouts', 'spot friction', 'organize content', 'improve readability'],
    finalUnlock: 'Color Systems',
  },
  Business: {
    subtitle: 'Build smarter decisions',
    concepts: ['customers', 'value proposition', 'market fit', 'pricing', 'competition', 'strategy'],
    actions: ['choose priorities', 'read market signals', 'test an idea', 'pitch clearly'],
    finalUnlock: 'Strategy Sprint',
  },
  History: {
    subtitle: 'Connect events and causes',
    concepts: ['timeline', 'cause and effect', 'sources', 'civilizations', 'reform', 'conflict'],
    actions: ['sequence events', 'compare eras', 'read evidence', 'identify motives'],
    finalUnlock: 'Era Mastery',
  },
  Chemistry: {
    subtitle: 'Practice reactions and patterns',
    concepts: ['atoms', 'bonding', 'molecules', 'reactions', 'acids', 'lab safety'],
    actions: ['classify materials', 'balance clues', 'spot reactions', 'choose safe steps'],
    finalUnlock: 'Reaction Lab',
  },
  'Career Skills': {
    subtitle: 'Grow workplace confidence',
    concepts: ['resumes', 'interviews', 'feedback', 'time management', 'teamwork', 'goals'],
    actions: ['choose responses', 'prioritize tasks', 'frame strengths', 'handle feedback'],
    finalUnlock: 'Interview Ready',
  },
  Marketing: {
    subtitle: 'Understand audience and growth',
    concepts: ['audience', 'channels', 'positioning', 'campaigns', 'metrics', 'brand voice'],
    actions: ['pick messages', 'compare channels', 'read metrics', 'target segments'],
    finalUnlock: 'Campaign Lab',
  },
  Coding: {
    subtitle: 'Practice logic step by step',
    concepts: ['variables', 'functions', 'conditions', 'loops', 'components', 'debugging'],
    actions: ['read logic', 'spot bugs', 'order steps', 'choose cleaner code'],
    finalUnlock: 'Mini App Build',
  },
  Finance: {
    subtitle: 'Make confident money choices',
    concepts: ['budgeting', 'saving', 'risk', 'interest', 'investing', 'cash flow'],
    actions: ['compare tradeoffs', 'choose budgets', 'read numbers', 'manage risk'],
    finalUnlock: 'Money Plan',
  },
  'AI Basics': {
    subtitle: 'Understand intelligent tools',
    concepts: ['prompts', 'data', 'models', 'bias', 'automation', 'evaluation'],
    actions: ['judge outputs', 'write prompts', 'spot bias', 'choose safeguards'],
    finalUnlock: 'AI Challenge',
  },
  'Critical Thinking': {
    subtitle: 'Reason with clarity',
    concepts: ['bias', 'evidence', 'logic', 'assumptions', 'tradeoffs', 'decisions'],
    actions: ['spot assumptions', 'compare evidence', 'test claims', 'choose stronger reasoning'],
    finalUnlock: 'Decision Lab',
  },
  Communication: {
    subtitle: 'Make your message land',
    concepts: ['clarity', 'listening', 'tone', 'structure', 'feedback', 'storytelling'],
    actions: ['choose wording', 'listen actively', 'organize ideas', 'respond calmly'],
    finalUnlock: 'Presentation Flow',
  },
  'Problem Solving': {
    subtitle: 'Break problems into wins',
    concepts: ['definition', 'constraints', 'options', 'testing', 'iteration', 'root cause'],
    actions: ['frame problems', 'test options', 'remove blockers', 'choose next steps'],
    finalUnlock: 'Solution Sprint',
  },
};

function pick(list, index) {
  return list[index % list.length];
}

function getTopicDetails(category) {
  const label = category?.label || 'Mission';
  return {
    label,
    color: category?.color || DEFAULT_COLOR,
    icon: category?.icon || 'graduation-cap',
    family: category?.family || 'FontAwesome5',
    ...(TOPIC_BANK[label] || {
      subtitle: `Master ${label} one level at a time`,
      concepts: ['foundations', 'key terms', 'practice', 'patterns', 'strategy', 'review'],
      actions: ['compare ideas', 'choose the best step', 'spot mistakes', 'apply the concept'],
      finalUnlock: `${label} Mastery`,
    }),
  };
}

function optionSet(correct, distractors) {
  return [correct, ...distractors].slice(0, 4);
}

function buildQuestion(topic, level, index) {
  const concept = pick(topic.concepts, index + level.id);
  const action = pick(topic.actions, index);
  const q = index + 1;

  if (level.id === 1) {
    const trueFalse = q % 2 === 0;
    return trueFalse
      ? {
          id: `${level.id}-${q}`,
          type: 'trueFalse',
          prompt: `${topic.label} improves when you practice ${concept} with clear feedback.`,
          correctAnswer: 'True',
          options: ['True', 'False'],
          reward: 12,
        }
      : {
          id: `${level.id}-${q}`,
          type: 'multipleChoice',
          prompt: `Which idea belongs most closely to ${topic.label} basics?`,
          correctAnswer: concept,
          options: optionSet(concept, ['random guessing', 'skipping practice', 'unclear goals']),
          reward: 12,
        };
  }

  if (level.id === 2) {
    return {
      id: `${level.id}-${q}`,
      type: q % 3 === 0 ? 'trueFalse' : 'multipleChoice',
      prompt: `What is the strongest way to ${action}?`,
      correctAnswer: `Use ${concept}`,
      options: optionSet(`Use ${concept}`, ['Ignore the goal', 'Add more clutter', 'Choose without evidence']),
      reward: 16,
    };
  }

  if (level.id === 3) {
    return {
      id: `${level.id}-${q}`,
      type: q % 2 === 0 ? 'imageChoice' : 'fillBlank',
      prompt: q % 2 === 0
        ? `Which example shows better ${concept}?`
        : `A strong ${topic.label} decision should feel _____.`,
      correctAnswer: q % 2 === 0 ? 'Option B' : 'clear',
      options: q % 2 === 0 ? ['Option A', 'Option B'] : ['clear', 'crowded', 'random', 'hidden'],
      reward: 21,
    };
  }

  if (level.id === 4) {
    return {
      id: `${level.id}-${q}`,
      type: 'matching',
      prompt: `Match the best relationship for ${concept}.`,
      correctAnswer: `${concept} -> ${action}`,
      options: optionSet(`${concept} -> ${action}`, [`${concept} -> avoid practice`, 'speed -> no review', 'reward -> no learning']),
      reward: 26,
    };
  }

  if (level.id === 5) {
    return {
      id: `${level.id}-${q}`,
      type: 'sorting',
      prompt: `Choose the best order for a ${topic.label} mini challenge.`,
      correctAnswer: 'Learn -> Practice -> Check -> Improve',
      options: [
        'Learn -> Practice -> Check -> Improve',
        'Check -> Skip -> Guess -> Finish',
        'Improve -> Learn -> Ignore -> Practice',
        'Guess -> Finish -> Learn -> Check',
      ],
      reward: 32,
    };
  }

  if (level.id === 6) {
    return {
      id: `${level.id}-${q}`,
      type: 'scenario',
      prompt: `A learner is stuck while trying to ${action}. What should they do first?`,
      correctAnswer: `Break it down with ${concept}`,
      options: optionSet(`Break it down with ${concept}`, ['Quit the level', 'Pick the fastest answer', 'Ignore the mistake']),
      reward: 39,
    };
  }

  if (level.id === 7) {
    return {
      id: `${level.id}-${q}`,
      type: q % 2 === 0 ? 'scenario' : 'multipleChoice',
      prompt: `Advanced challenge: which choice best proves strong ${concept}?`,
      correctAnswer: `Apply it, test it, then improve it`,
      options: optionSet('Apply it, test it, then improve it', ['Memorize only the title', 'Avoid feedback', 'Rush without checking']),
      reward: 47,
    };
  }

  return {
    id: `${level.id}-${q}`,
    type: q === 10 ? 'checkpoint' : q % 2 === 0 ? 'scenario' : 'multipleChoice',
    prompt: q === 10
      ? `Final checkpoint: what unlocks ${topic.finalUnlock}?`
      : `Boss run: choose the strongest ${topic.label} move for ${concept}.`,
    correctAnswer: q === 10 ? 'Consistent practice and smart feedback' : `Use ${concept} with feedback`,
    options: q === 10
      ? optionSet('Consistent practice and smart feedback', ['One lucky guess', 'Skipping hard parts', 'Choosing at random'])
      : optionSet(`Use ${concept} with feedback`, ['Hide the problem', 'Ignore the goal', 'Avoid testing']),
    reward: 60,
  };
}

export function buildMission(category) {
  const topic = getTopicDetails(category);

  return {
    topic,
    levels: LEVELS.map((level) => ({
      ...level,
      questions: Array.from({ length: 10 }, (_, index) => buildQuestion(topic, level, index)),
    })),
  };
}

export function getMissionLevelTitles(category) {
  const topic = getTopicDetails(category);

  return LEVELS.map((level, index) => {
    if (topic.label === 'UI/UX') {
      return ['Basics', 'Wireframes', 'Colors', 'Prototype', 'UX Process', 'Usability', 'Product Thinking', 'Final Challenge'][index];
    }

    return level.title;
  });
}