/**
 * The things themselves, separate from the pages that show them.
 *
 * Three registers per item, deliberately different lengths. `metric` is the
 * one number worth seeing from across the room. `line` is one short
 * sentence — a dozen words, never a paragraph, because the card is for
 * deciding and the sheet is for reading. `bullets` is what opens behind it.
 *
 * Everything is one list with a `group` rather than three lists, so the
 * throughline is a property of the set and not of where a thing happens to
 * be filed. Work, research and a side project are three answers to the same
 * question — who is this built to understand — and the question has to
 * survive being sorted.
 *
 * The Cancer Society material stays deliberately redacted, as agreed with
 * Ivan: no product or vendor name, no schema column names, no named
 * supervisor. The organisation holds patient case data, and publishing
 * "this charity runs this product, here is its undocumented schema, here is
 * who administers it" is a disclosure surface for no benefit.
 */

export type Group = 'work' | 'research' | 'projects'

/**
 * Something a reader can actually open. The signal is the point: a card
 * carrying one of these has evidence behind it, and the page should look
 * different there than at a card without.
 *
 * An attachment with no `href` is declared but not delivered. Those render
 * as a pending slot while developing and are absent from the built site —
 * the promise of a PDF is worth less than no PDF at all.
 */
export type Attachment = {
  kind: 'pdf' | 'audio' | 'score' | 'repo' | 'excerpt' | 'link'
  label: string
  href?: string
}

export type Item = {
  id: string
  /** The card's title. Short. */
  title: string
  /** The real, full title, where the card shows an abbreviation of it. */
  fullTitle?: string
  group: Group
  /** The eyebrow — what kind of thing this is. */
  kind: string
  when?: string
  /** One short sentence. Absent where the fact is not mine to invent. */
  line?: string
  /** The one number worth seeing from across the room. */
  metric?: { value: string; label: string }
  /** Leads its group, at twice the width. One per group. */
  featured?: boolean
  stack?: string[]
  attachments?: Attachment[]
  /** The sheet's body. An item with none of these does not open. */
  bullets?: string[]
  href?: string
  cta?: string
  /** The sheets that carry an exhibit rather than only prose. */
  exhibit?: 'authorship' | 'uyghur'
}

export const GROUPS: { id: Group; title: string; gloss: string }[] = [
  { id: 'work', title: 'Work', gloss: 'Built for an organisation, paid or not.' },
  { id: 'research', title: 'Research', gloss: 'Who the record leaves out, and how.' },
  { id: 'projects', title: 'Projects', gloss: 'Built to find out whether I could.' },
]

export const ITEMS: Item[] = [
  /* ---------------------------------------------------------- work */
  {
    id: 'charity-db',
    group: 'work',
    featured: true,
    title: 'Rebuilding an undocumented patient database',
    kind: 'Cancer Society',
    when: 'Jun – Sep 2026',
    metric: { value: '95%', label: 'faster extraction' },
    line: 'No documentation, no declared foreign keys. The schema came back out of the data.',
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
    group: 'work',
    title: 'Deciding what a charity may keep',
    kind: 'Cancer Society',
    when: '2026',
    metric: { value: '60k', label: 'donor records' },
    line: 'Which records the privacy policy required deleting, and which lapsed donors were worth keeping.',
    stack: ['Python', 'Data governance'],
    bullets: [
      'Led governance on a 60,000+ record donor database: read the government privacy policy and worked out which records had to go and which lapsed donors were worth re-engaging.',
      'Applied RFM segmentation to separate the two, weighing revenue potential against retention cost and legal obligation. Deleting donor records is not a cleanup task — it is a decision with a rule behind it.',
    ],
  },
  {
    id: 'charity-apis',
    group: 'work',
    title: 'Two APIs replacing two forms',
    kind: 'Cancer Society',
    when: '2026',
    metric: { value: '80%', label: 'less overpayment' },
    line: 'Driver reimbursement from map distance rather than self-reported hours.',
    stack: ['Python', 'Google Maps API', 'Outlook API'],
    bullets: [
      'Replaced self-reported driver hours with a distance calculation from the Google Maps API, cutting an estimated 80% of reimbursement overpayment across 500+ volunteer drivers.',
      'Automated shift scheduling for 40 staff through the Outlook API, replacing a fragile desktop-automation dependency.',
    ],
  },
  {
    id: 'teaching',
    group: 'work',
    title: 'CS106A and CS106B',
    kind: 'Teaching',
    when: 'Mar 2026 – present',
    metric: { value: '15–20', label: 'students a quarter' },
    line: 'Section leader for Stanford’s intro sequence — Python, then C++ and data structures.',
    stack: ['Python', 'C++'],
    bullets: [
      'Section leader for Stanford’s introductory computer science sequence: CS106A in Python, CS106B in C++ and data structures.',
      '15–20 students a quarter, in section and in office hours.',
    ],
  },
  {
    id: 'code4myanmar',
    group: 'work',
    title: 'Code4Myanmar',
    kind: 'Teaching',
    line: 'Six weeks of Python, taught remotely into Chin State.',
    stack: ['Python'],
  },
  {
    id: 'pharmacy',
    group: 'work',
    title: 'Grafton Pharmacy',
    kind: 'Service',
    when: '2020 – 2024',
    metric: { value: '300+', label: 'hours' },
    line: 'Blister packs for cancer and dialysis patients, medicine runs, the counter.',
    bullets: [
      '300+ hours — packing blister packs for cancer and dialysis patients, delivering medicine, serving the public.',
      'Where HIV treatment and the stigma around it stopped being abstract: the pharmacists explained the first, and a patient willing to talk explained the second.',
    ],
  },

  /* ------------------------------------------------------ research */
  {
    id: 'authorship',
    group: 'research',
    featured: true,
    title: 'Authorship inequality in international collaboration',
    fullTitle: 'Authorship Inequality in International Scientific Collaboration',
    kind: 'Paper',
    when: 'Feb – Mar 2026',
    metric: { value: '8.9%', label: 'last-author deficit' },
    line: 'Held across all 19 fields, every citation quartile, and eighteen years.',
    stack: ['Python', 'pandas', 'OpenAlex API', 'World Bank API'],
    exhibit: 'authorship',
    attachments: [{ kind: 'pdf', label: 'Paper' }],
    bullets: [
      'An 8.9% last-authorship deficit for Global South researchers on internationally co-authored papers — and it held across all 19 fields, every citation quartile, and eighteen years, with no measurable improvement over time. A pattern that stable is structural, not incidental.',
      'Built the dataset to test it: 111,602 author rows across 180 countries, from 14,250 papers, merging bibliometric and economic development data.',
      'Checked it could survive being wrong — McNemar’s test, confidence intervals, citation-quartile stratification, field-by-field robustness, longitudinal trend — then put it in choropleths, forest plots and time series.',
    ],
  },
  {
    id: 'uyghur',
    group: 'research',
    title: 'The digital machinery of Uyghur oppression',
    fullTitle: 'Mandarin, Monitors, and Marginalization: The Digital Machinery of Uyghur Oppression',
    kind: 'Paper',
    line: 'State media, platform design and language policy, read as one machine.',
    stack: ['Discourse analysis', 'Language policy'],
    exhibit: 'uyghur',
    attachments: [{ kind: 'excerpt', label: 'Excerpt' }],
    bullets: [
      'How Chinese state media, platform design and language policy combine to push Uyghur linguistic expression out of digital space — three mechanisms usually studied separately, read as one machine.',
    ],
  },
  {
    id: 'gene-drives',
    group: 'research',
    title: 'Gene drives in New Zealand',
    kind: 'Paper',
    line: 'Liability once a drive crosses a border, and whether Māori get a decision.',
    stack: ['Biotechnology policy', 'Law'],
    attachments: [{ kind: 'pdf', label: 'Paper' }],
    bullets: [
      'Gene drives are on the table for predator control in New Zealand, and a drive does not stop at a property line, a trial boundary or a border.',
      'Two legal gaps follow from that: who is liable once it has crossed one, and whether Māori get a decision rather than a consultation. Neither appears to be reached by the Gene Technology Bill.',
    ],
  },
  { id: 'spog', group: 'research', title: 'SPOG lab', kind: 'Lab' },
  { id: 'soyalab', group: 'research', title: 'SoyaLab', kind: 'Lab' },

  /* ------------------------------------------------------ projects */
  {
    id: 'flutterer',
    group: 'projects',
    featured: true,
    title: 'Flutterer',
    kind: 'Full stack',
    when: 'Sep – Dec 2025',
    metric: { value: '10+', label: 'REST endpoints' },
    line: 'A social platform from nothing: auth, timelines, likes, comments.',
    stack: ['Django', 'JavaScript', 'AWS EC2', 'S3', 'RDS'],
    attachments: [{ kind: 'repo', label: 'Source' }],
    bullets: [
      'A full-stack social platform built from scratch: authentication, posting, timelines, likes, comments.',
      '10+ REST endpoints with stateful server-side routing, relational models on RDS and media storage on S3.',
    ],
  },
]

export const byGroup = (g: Group) => ITEMS.filter((i) => i.group === g)

/* ------------------------------------------------------------------ */

/**
 * Music. The three Ivan wants weight on — the directorship, the
 * composition, the research — are the three marked `featured`, so the
 * emphasis is in the layout rather than in an adjective.
 */
export const MUSIC: Item[] = [
  {
    id: 'mixedco',
    group: 'work',
    featured: true,
    title: 'Mixed Company',
    kind: 'Musical Director',
    when: '2026 – present',
    metric: { value: 'MD', label: 'Stanford’s oldest all-gender a cappella group' },
    line: 'Running the rehearsals, the arrangements and the room.',
    href: 'https://www.mixedco.com/',
    cta: 'mixedco.com',
  },
  {
    id: 'abendlied',
    group: 'work',
    featured: true,
    title: 'Abendlied',
    kind: 'Composition',
    when: '2023 – 2024',
    metric: { value: 'Gold', label: 'at Cadenza' },
    line: 'A setting for lower-voice choir on a German text.',
    stack: ['Choral', 'SATB lower voices'],
    attachments: [
      { kind: 'score', label: 'Score' },
      { kind: 'audio', label: 'Recording' },
    ],
    bullets: [
      'Highly commended in the NZCF–SOUNZ composition competition, and awarded Gold on its performance at the Upper North Island Cadenza festival.',
    ],
  },
  {
    id: 'ipq',
    group: 'research',
    featured: true,
    title: 'The shape of a saxophone mouthpiece',
    fullTitle: 'How does the shape of an alto saxophone mouthpiece affect its sound?',
    kind: 'Extended research',
    when: '2024',
    line: 'Chamber geometry against timbre — the terminal’s question, with a reed.',
    stack: ['Acoustics', 'Cambridge IPQ'],
    attachments: [{ kind: 'pdf', label: 'Paper' }],
    bullets: [
      'An extended research project on the acoustics of my own instrument — chamber geometry against timbre.',
      'It is the same question the terminal at the top of this page is asking about a chord, with a reed in place of a string.',
    ],
  },
  {
    id: 'nzssc',
    group: 'work',
    title: 'NZ Secondary Students’ Choir',
    kind: 'Soloist',
    when: '2023 – 2024',
    metric: { value: '1 of 56', label: 'nationally' },
    line: 'Represented New Zealand at the China International Chorus Festival.',
  },
  {
    id: 'kings-choirs',
    group: 'work',
    title: 'King’s College choirs',
    kind: 'Choir leader',
    when: '2020 – 2024',
    line: 'Kappella and All the King’s Men — Gold, Silver and Bronze at the National Big Sing.',
  },
  {
    id: 'sax',
    group: 'work',
    title: 'Alto saxophone',
    kind: 'Grade 8, distinction',
    when: '2022',
    line: 'Principal alto, Little Big Band — Gold at the National Youth Jazz Competition.',
  },
  {
    id: 'violin',
    group: 'work',
    title: 'Violin',
    kind: 'Grade 6, distinction',
    when: '2020',
    line: 'Deputy leader of the Symphony Orchestra, principal second violin.',
  },
]
