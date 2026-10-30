/**
 * The things themselves, separate from the pages that show them.
 *
 * Each item carries two registers: `line` is the one sentence that goes on
 * the card, and `bullets` is what opens behind it. The card has to be enough
 * to decide on and the sheet has to be enough to believe, and those are not
 * the same length.
 *
 * The Cancer Society material stays deliberately redacted, as agreed with
 * Ivan: no product or vendor name, no schema column names, no named
 * supervisor. The organisation holds patient case data, and publishing "this
 * charity runs this product, here is its undocumented schema, here is who
 * administers it" is a disclosure surface for no benefit. The engineering
 * story survives intact.
 */

export type Item = {
  id: string
  title: string
  /** The eyebrow — what kind of thing this is. */
  kind: string
  when?: string
  /** The card's one line. Absent where the fact is not his to invent —
   *  the loud note under the grid is carrying it instead. */
  line?: string
  stack?: string[]
  /** The sheet's body. An item with none of these does not open. */
  bullets?: string[]
  href?: string
  /** What the affordance says, where "read more" is the wrong verb. */
  cta?: string
  /** The two sheets that carry an exhibit rather than only prose. */
  exhibit?: 'authorship' | 'uyghur'
}

/* ------------------------------------------------------------------ */

export const PROJECTS: Item[] = [
  {
    id: 'authorship',
    title: 'Authorship Inequality in International Scientific Collaboration',
    kind: 'Research',
    when: 'Feb – Mar 2026',
    line: 'An 8.9% last-authorship deficit for Global South researchers that holds across all 19 fields, every citation quartile and eighteen years — a pattern too stable to be incidental.',
    stack: ['Python', 'pandas', 'OpenAlex API', 'World Bank API', 'matplotlib', 'seaborn'],
    exhibit: 'authorship',
    bullets: [
      'An 8.9% last-authorship deficit for Global South researchers on internationally co-authored papers — and it held across all 19 fields, every citation quartile, and eighteen years, with no measurable improvement over time. A pattern that stable is structural, not incidental.',
      'Built the dataset to test it: 111,602 author rows across 180 countries, from 14,250 papers, merging bibliometric and economic development data.',
      'Checked it could survive being wrong — McNemar’s test, confidence intervals, citation-quartile stratification, field-by-field robustness, longitudinal trend — then put it in choropleths, forest plots and time series.',
    ],
  },
  {
    id: 'flutterer',
    title: 'Flutterer',
    kind: 'Full stack',
    when: 'Sep – Dec 2025',
    line: 'A social platform built from nothing: auth, posting, timelines, likes and comments, on ten-plus REST endpoints and three AWS services.',
    stack: ['Python', 'JavaScript', 'Django', 'REST', 'AWS EC2', 'S3', 'RDS'],
    bullets: [
      'A full-stack social platform built from scratch: authentication, posting, timelines, likes, comments.',
      '10+ REST endpoints with stateful server-side routing, relational models on RDS and media storage on S3.',
    ],
  },
]

/* ------------------------------------------------------------------ */

/** The three pieces of engineering inside the Cancer Society internship. */
export const CHARITY: Item[] = [
  {
    id: 'charity-db',
    title: 'Rebuilding a patient database nobody had documented',
    kind: 'Cancer Society',
    line: 'Reverse-engineered a legacy case-management schema with no documentation and no declared foreign keys, then rebuilt it around what the data actually was. Extraction time down 95%.',
    stack: ['Python', 'MySQL'],
    bullets: [
      'Reverse-engineered the table relationships of a legacy case-management system from scratch — no documentation, no declared foreign keys — and redesigned the architecture around what the data actually was.',
      'Migrated unstructured records into relational tables, which is what made patient data requests answerable in an afternoon rather than a week.',
      'Benchmarked it honestly: median and 95th-percentile extraction time over a fixed set of real tasks, same hardware before and after. 95% reduction. A single best-case timing would have been easier and would have meant nothing.',
      'Described here at the level of the technical problem only — no product name, no schema detail, nothing about what the records contain.',
    ],
  },
  {
    id: 'charity-governance',
    title: 'Deciding what a charity is allowed to keep',
    kind: 'Cancer Society',
    line: 'Governance on a 60,000-record donor database: which records the privacy policy required deleting, and which lapsed donors were worth keeping. Deleting records is a decision, not a cleanup task.',
    stack: ['Python', 'Data governance'],
    bullets: [
      'Led governance on a 60,000+ record donor database: read the government privacy policy and worked out which records had to go and which lapsed donors were worth re-engaging.',
      'Applied RFM segmentation to separate the two, weighing revenue potential against retention cost and legal obligation. Deleting donor records is not a cleanup task — it is a decision with a rule behind it.',
    ],
  },
  {
    id: 'charity-apis',
    title: 'Two APIs replacing two pieces of paperwork',
    kind: 'Cancer Society',
    line: 'Distance from the Maps API instead of self-reported driver hours, cutting an estimated 80% of reimbursement overpayment across 500+ volunteer drivers; and shift scheduling for 40 staff through Outlook.',
    stack: ['Python', 'Google Maps API', 'Microsoft Outlook API'],
    bullets: [
      'Replaced self-reported driver hours with a distance calculation from the Google Maps API, cutting an estimated 80% of reimbursement overpayment across 500+ volunteer drivers.',
      'Automated shift scheduling for 40 staff through the Outlook API, replacing a fragile desktop-automation dependency.',
    ],
  },
]

/** Everything else under social impact. */
export const IMPACT: Item[] = [
  {
    id: 'teaching',
    title: 'CS106A and CS106B',
    kind: 'Section leader',
    when: 'Mar 2026 – present',
    line: 'Stanford’s introductory computer science sequence — Python, then C++ and data structures — for 15–20 students a quarter.',
    stack: ['Python', 'C++', 'JavaScript'],
    bullets: [
      'Section leader for Stanford’s introductory computer science sequence: CS106A in Python, CS106B in C++ and data structures.',
      '15–20 students a quarter, in section and in office hours.',
    ],
  },
  {
    id: 'spog',
    title: 'SPOG lab',
    kind: 'Research',
  },
  {
    id: 'uyghur',
    title: 'Mandarin, Monitors, and Marginalization: The Digital Machinery of Uyghur Oppression',
    kind: 'Research',
    line: 'State media, platform design and language policy read as one machine for pushing Uyghur linguistic expression out of digital space — three mechanisms usually studied apart.',
    stack: ['Research paper', 'Discourse analysis', 'Language policy'],
    exhibit: 'uyghur',
    bullets: [
      'How Chinese state media, platform design and language policy combine to push Uyghur linguistic expression out of digital space — three mechanisms usually studied separately, read as one machine.',
    ],
  },
  {
    id: 'code4myanmar',
    title: 'Code4Myanmar',
    kind: 'Teaching',
    when: 'TODO — dates',
    line: 'Volunteer Python instructor — a six-week remote course for college-aged students in Chin State.',
    stack: ['Python', 'Remote teaching'],
  },
  {
    id: 'pharmacy',
    title: 'Grafton Pharmacy',
    kind: 'Service',
    when: '2020 – 2024',
    line: '300+ hours packing blister packs for cancer and dialysis patients, delivering medicine, serving the public.',
    bullets: [
      '300+ hours — packing blister packs for cancer and dialysis patients, delivering medicine, serving the public.',
      'Where HIV treatment and the stigma around it stopped being abstract: the pharmacists explained the first, and a patient willing to talk explained the second.',
    ],
  },
]

/* ------------------------------------------------------------------ */

export const MUSIC: Item[] = [
  {
    id: 'mixedco',
    title: 'Mixed Company, Stanford',
    kind: 'Musical Director',
    when: '2026 – present',
    line: 'Stanford’s oldest all-gender a cappella group.',
    href: 'https://www.mixedco.com/',
    cta: 'mixedco.com',
  },
  {
    id: 'nzssc',
    title: 'New Zealand Secondary Students’ Choir',
    kind: 'Soloist',
    when: '2023 – 2024',
    line: 'One of 56 singers nationally. Represented New Zealand at the China International Chorus Festival and won the Soong Ching Ling Foundation international competition.',
  },
  {
    id: 'kappella',
    title: 'Kappella, King’s College',
    kind: 'Choir leader',
    when: '2024',
    line: 'Silver at the National Big Sing, and four special awards at the regional competition.',
  },
  {
    id: 'aktm',
    title: 'All the King’s Men',
    kind: 'Choir leader, soloist',
    when: '2020 – 2024',
    line: 'Gold at the National Big Sing in 2022, Bronze in 2024.',
  },
  {
    id: 'sax',
    title: 'Alto saxophone',
    kind: 'Grade 8, distinction',
    when: '2022',
    line: 'Principal alto in the Little Big Band — Gold at the National Youth Jazz Competition, Platinum at the Auckland Jazz Competition — and in the Premier Concert Band.',
  },
  {
    id: 'violin',
    title: 'Violin',
    kind: 'Grade 6, distinction',
    when: '2020',
    line: 'Deputy leader of the Symphony Orchestra and principal second violin.',
  },
  {
    id: 'soloist',
    title: 'King’s College Soloist Competition',
    kind: 'Winner',
    when: '2021 – 2023',
    line: 'Won the woodwind section twice, and twice awarded Best Musical Interpretation.',
  },
  {
    id: 'abendlied',
    title: 'Abendlied',
    kind: 'Composition',
    when: '2023 – 2024',
    line: 'A setting for lower-voice choir on a German text. Highly commended in the NZCF–SOUNZ composition competition, and Gold on its performance at Cadenza.',
    stack: ['Choral', 'SATB lower voices', 'German text'],
    bullets: [
      'Highly commended in the NZCF–SOUNZ composition competition, and awarded Gold on its performance at the Upper North Island Cadenza festival.',
    ],
  },
  {
    id: 'ipq',
    title: 'How does the shape of an alto saxophone mouthpiece affect its sound?',
    kind: 'Extended research',
    when: '2024',
    line: 'Chamber geometry against timbre, on my own instrument — the same question the terminal at the top of this page asks about a chord, with a reed in place of a string.',
    stack: ['Acoustics', 'Physics', 'Saxophone', 'Cambridge IPQ'],
    bullets: [
      'An extended research project on the acoustics of my own instrument — chamber geometry against timbre.',
      'It is the same question the terminal at the top of this page is asking about a chord, with a reed in place of a string.',
    ],
  },
]
