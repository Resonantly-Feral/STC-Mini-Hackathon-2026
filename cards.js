/* Flood rehearsal prompts; educational synthesis, not an official checklist. */
var DRY_RUN_QUESTIONS = [
  {
    "id": "warnings",
    "emoji": "📢",
    "topic": "Warnings",
    "question": "How will you receive official flood warnings and evacuation instructions?",
    "primaryHint": "e.g. METMalaysia updates on my phone",
    "backupHint": "Another way to receive official instructions",
    "card": "Your usual warning channel is unavailable.",
    "prompt": "If your phone or internet fails, how will you still receive official instructions?",
    "check": "Choose another way to receive official updates. Follow evacuation instructions from local authorities."
  },
  {
    "id": "evacuation",
    "emoji": "🚐",
    "topic": "Evacuation",
    "question": "Where will you go, and how will you get there?",
    "primaryHint": "Destination, route and transport",
    "backupHint": "An alternative route or transport arrangement",
    "card": "Your planned route or transport is unavailable.",
    "prompt": "Is the alternative currently safe and accessible, and how will you confirm that?",
    "check": "Check official instructions and current PPS information. Never walk or drive through floodwater; a named destination is not proof it is safe or open."
  },
  {
    "id": "people",
    "emoji": "🤝",
    "topic": "People",
    "question": "Who needs help leaving, and who will assist?",
    "primaryHint": "Support needs and the person helping",
    "backupHint": "Who can help if that person is unavailable?",
    "card": "The designated helper is unavailable.",
    "prompt": "Has the backup helper agreed, and can they meet the person’s mobility, care or communication needs?",
    "check": "Consider children, older people, disabled people and anyone needing care. If no one needs assistance, say so and describe how everyone will be accounted for."
  },
  {
    "id": "communication",
    "emoji": "📡",
    "topic": "Communication",
    "question": "How will you contact or reunite with everyone?",
    "primaryHint": "Contact method and agreed meeting arrangement",
    "backupHint": "An agreed arrangement without working phones",
    "card": "Phones or mobile networks are unavailable.",
    "prompt": "Does your fallback still work without a phone, power or internet?",
    "check": "Two messaging apps may depend on the same network. Agree an offline contact or reunion plan in advance, subject to official safety instructions."
  },
  {
    "id": "essentials",
    "emoji": "🎒",
    "topic": "Essentials",
    "question": "Where are your emergency supplies, essential medication and protected documents?",
    "primaryHint": "Where they are stored and who can access them",
    "backupHint": "A separate accessible supply or copy",
    "card": "Your usual storage location is inaccessible.",
    "prompt": "Can you reach the alternative without entering danger, and does it cover your household’s needs?",
    "check": "Review water, food, essential medication and care needs, lights, power and protected documents. Two cupboards in the same flooded building are not independent backups."
  }
];

var DRY_RUN_EXAMPLE = [
  {
    "primary": "Official weather updates on my phone",
    "backup": "Battery radio for official broadcasts"
  },
  {
    "primary": "Family car via our usual road; confirm destination with official instructions",
    "backup": ""
  },
  {
    "primary": "My sister helps our grandfather leave",
    "backup": "Neighbour has agreed to help; transport still needs checking"
  },
  {
    "primary": "Family WhatsApp group",
    "backup": "Telegram group"
  },
  {
    "primary": "Go-bag and document copies by the front door",
    "backup": "Separate copies and supplies at a relative’s home; access needs checking"
  }
];

var DRY_RUN_SOURCES = [
  {
    name: 'Public InfoBanjir',
    by: 'Department of Irrigation and Drainage (JPS)',
    what: 'River levels, rainfall and flood warnings.',
    url: 'https://publicinfobanjir.water.gov.my/'
  },
  {
    name: 'METMalaysia',
    by: 'Malaysian Meteorological Department',
    what: 'Weather forecasts and weather warnings.',
    url: 'https://www.met.gov.my/'
  },
  {
    name: 'Portal Bencana',
    by: 'National Disaster Management Agency (NADMA)',
    what: 'The current disaster situation across Malaysia.',
    url: 'https://portalbencana.nadma.gov.my/'
  },
  {
    name: 'InfoBencana JKM',
    by: 'Department of Social Welfare (JKM)',
    what: 'Which temporary evacuation centres (PPS) are activated.',
    url: 'https://infobencanajkmv2.jkm.gov.my/landing/'
  }
];

DRY_RUN_SOURCES = DRY_RUN_SOURCES.concat([
  {
    "name": "Flood preparation checklist",
    "by": "MKN",
    "what": "Official guidance on warnings, evacuation, transport and supplies.",
    "url": "https://www.mkn.gov.my/web/ms/2026/11/04/persediaan-kecemasan-banjir/"
  },
  {
    "name": "Preparing for additional support needs",
    "by": "MKN / KKM",
    "what": "Planning for medication, care, mobility and communication needs.",
    "url": "https://www.mkn.gov.my/web/ms/2025/11/30/persiapan-sebelum-banjir-bagi-golongan-berisiko-tinggi/"
  }
]);

/* Example judgments only: never prefill a personal assessment. */
var DRY_RUN_REFLECTIONS = [
  { assessment: 'yes', reason: 'The battery radio does not use our phone connection. We still need to check batteries, reception and official broadcasts.' },
  { assessment: 'no', reason: 'We have no alternative transport arrangement recorded. We need to arrange and confirm one.' },
  { assessment: 'unsure', reason: 'The neighbour has agreed to help, but we have not confirmed accessible transport.' },
  { assessment: 'no', reason: 'Both WhatsApp and Telegram need a working network. We need an agreed offline fallback.' },
  { assessment: 'unsure', reason: 'The supplies are stored separately, but access and suitability still need checking.' }
];
