/* The five plan questions and the failure card that attacks each one. */
var DRY_RUN_QUESTIONS = [
  {
    id: 'keys',
    emoji: '🔑',
    topic: 'Keys and access',
    question: 'Who holds the keys / access?',
    primaryHint: 'e.g. Ali',
    backupHint: 'Who else has a set?',
    card: '{primary} is stuck outside the area and cannot get back.'
  },
  {
    id: 'documents',
    emoji: '📄',
    topic: 'Important documents',
    question: 'Where are the important documents kept?',
    primaryHint: 'e.g. Shop drawer',
    backupHint: 'Where is the copy?',
    card: '{primary} has been destroyed.'
  },
  {
    id: 'contacts',
    emoji: '📇',
    topic: 'Emergency contacts',
    question: 'Where are the emergency contacts stored?',
    primaryHint: "e.g. Ali's phone",
    backupHint: 'Where else are they written?',
    card: '{primary} is lost or dead.'
  },
  {
    id: 'knowledge',
    emoji: '🧠',
    topic: 'Who knows the business',
    question: 'Who knows the suppliers, customers, and money owed?',
    primaryHint: 'e.g. Ali',
    backupHint: 'Who else knows?',
    card: '{primary} cannot be reached for a week.'
  },
  {
    id: 'reach',
    emoji: '📡',
    topic: 'Reaching each other',
    question: 'How does everyone reach each other?',
    primaryHint: 'e.g. WhatsApp group',
    backupHint: 'What if that is down?',
    card: '{primary} is down for everyone.'
  }
];

/* Sample kedai plan for demos. */
var DRY_RUN_EXAMPLE = [
  { primary: 'Ali', backup: '' },
  { primary: 'Shop drawer', backup: 'Shop drawer' },
  { primary: 'Ali', backup: 'Notebook at home' },
  { primary: 'Ali', backup: '' },
  { primary: 'WhatsApp group', backup: 'Meet at the surau' }
];
