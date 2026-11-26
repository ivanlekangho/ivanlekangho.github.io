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

export type Group = 'health' | 'education' | 'society'

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
  kind: 'pdf' | 'audio' | 'video' | 'score' | 'report' | 'repo' | 'excerpt' | 'link'
  label: string
  href?: string
}

export type Item = {
  id: string
  /** The company, school or ensemble. Set in ink above the title, because
   *  it is the first thing most readers scan for and it was previously
   *  buried in the same grey micro-caps as the date. Where a thing was
   *  made for nobody — a paper, a side project — there is none, and the
   *  card starts at its title instead. */
  org?: string
  /** What was done. Short. Optional, because the two labs are an org and
   *  nothing else, and inventing a job title for them would be worse than
   *  leaving the line out. */
  title?: string
  /** The real, full title, where the card shows an abbreviation of it. */
  fullTitle?: string
  /* Optional, because the musical roles are rendered as one list and were
     only ever carrying a group to satisfy this type. */
  group?: Group
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

/**
 * Three fields rather than three kinds of employment.
 *
 * It used to be Work, Research and Projects, which sorts by what a thing
 * was to ME — a job, a paper, a weekend — and tells a reader nothing. These
 * sort by who it was for, which is the only sorting that makes the set mean
 * anything: the same question turns up in a cancer charity's database, in a
 * Stanford section room and in a bibliometric dataset, and filing those
 * three under "work, research, projects" hides exactly that.
 *
 * Health first, because the paid engineering is the strongest thing here
 * and a reader meets it before anything else.
 */
export const GROUPS: { id: Group; title: string; gloss: string }[] = [
  { id: 'health', title: 'Health', gloss: 'Engineering inside the places that treat people.' },
  { id: 'education', title: 'Education', gloss: 'Teaching the thing itself.' },
  { id: 'society', title: 'Society', gloss: 'Who the record leaves out, and who gets a say.' },
]

export const ITEMS: Item[] = [
  /* -------------------------------------------------------- health */
  {
    id: 'charity-db',
    org: 'Cancer Society of New Zealand',
    group: 'health',
    featured: true,
    title: 'Software and Data Engineer Intern for New Zealand’s largest cancer non-profit',
    /* The job, rather than the first task in it. The database rebuild is
       the lead bullet behind the tile; it was the title here and that
       undersold a paid engineering internship as one piece of work. */
    kind: 'Internship',
    when: 'Jun – Sep 2026',
    metric: { value: '95%', label: 'faster extraction' },
    line: 'Rebuilt an undocumented patient database, then decided what the charity was allowed to keep.',
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
    org: 'Cancer Society of New Zealand',
    group: 'health',
    title: 'Deciding what a charity may keep',
    kind: 'Data governance',
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
    org: 'Cancer Society of New Zealand',
    group: 'health',
    title: 'Two APIs replacing two forms',
    kind: 'Engineering',
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
    org: 'Stanford University',
    group: 'education',
    title: 'CS106A and CS106B',
    kind: 'Section leader',
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
    org: 'Code4Myanmar',
    group: 'education',
    title: 'Volunteer Python instructor',
    kind: 'Teaching',
    line: 'Six weeks, remote, for college-aged students in Chin State.',
    stack: ['Python'],
  },
  {
    id: 'pharmacy',
    org: 'Grafton Pharmacy',
    group: 'health',
    title: 'Four years behind the counter',
    kind: 'Service',
    when: '2020 – 2024',
    metric: { value: '300+', label: 'hours' },
    line: 'Blister packs for cancer and dialysis patients, medicine runs, the counter.',
    bullets: [
      '300+ hours — packing blister packs for cancer and dialysis patients, delivering medicine, serving the public.',
      'Where HIV treatment and the stigma around it stopped being abstract: the pharmacists explained the first, and a patient willing to talk explained the second.',
    ],
  },

  /* ------------------------------------------------------- society */
  {
    id: 'authorship',
    group: 'society',
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
    group: 'society',
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
    group: 'society',
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
  { id: 'spog', org: 'SPOG lab', group: 'society', kind: 'Lab' },
  { id: 'soyalab', org: 'SoyaLab', group: 'society', kind: 'Lab' },

  /* --------------------------------------------- society, continued */
  {
    id: 'flutterer',
    group: 'society',
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
 * Creative — and in it, two things carried differently from everything else
 * on this site.
 *
 * A composition and a performance are not claims about work; they ARE the
 * work, and they are the only items in the portfolio a reader can
 * experience directly rather than read a summary of. So they do not go in
 * cards that open sheets. They go on the page at full size with the audio
 * and the video on them, and the scores beside as evidence — the thing
 * first, the paperwork second.
 *
 * Everything else musical is a role in an ensemble, which is a line in a
 * list and was never more than that.
 */

export type Media = {
  /** The master. Whatever drives the transport and makes the sound.
   *  Absent where the film is hosted and brings its own player. */
  src?: string
  kind: 'audio' | 'video'
  label: string
  /**
   * A film hosted on YouTube, by id.
   *
   * Self-hosting could not work: GitHub Pages serves one fixed file at one
   * quality, so a seventeen-minute recital meant either 284MB at 480p or a
   * 32MB file whose audio was 16kHz. Hosted, it streams adaptively and
   * costs the repository nothing. The price is their player instead of this
   * site's own transport, and the one thing that transport did that
   * mattered — jumping to a movement — survives, because the IFrame API can
   * seek.
   */
  youtube?: string
  /**
   * A silent picture to run against `src`.
   *
   * Two files rather than one because no tool on this machine can make one
   * that is both watchable and listenable inside GitHub's 100MB per-file
   * limit: the only encoder available is quality-targeted with no bitrate
   * control, so its usable settings give either 284MB at 480p or a 32MB
   * file whose audio is 16kHz — telephone quality, which throws away
   * everything a saxophone does above 8kHz. So the picture comes from the
   * small one with its sound discarded, and the sound comes from a proper
   * 44.1kHz extract. Both are cut from the same tape at the same offset.
   */
  film?: string
  /** Stop here rather than at the end of the file, where a recording
   *  runs on into the applause. */
  end?: number
  /** A line under the transport — who is playing, where a still photograph
   *  would have had a figcaption. */
  caption?: string
}

export type Work = {
  id: string
  title: string
  /** Scoring, instrument, forces — what it is written for or played on. */
  scoring: string
  /** Where the scoring deserves a longer line than the heading allows. */
  scoringNote?: string
  kind: 'Composition' | 'Performance'
  when: string
  /** Who performed it, or what it was submitted to. */
  where?: string
  /** The one line of recognition worth the space. */
  honour?: string
  /** Two sentences at most. The recording is the argument; this is a note. */
  note?: string
  /**
   * What is actually on the recording. `at` is the movement's start in the
   * FILE, not in the original tape — the recital's first 47 seconds (the
   * walk-on and the tuning) are cut, so every figure Ivan read off the
   * camera file has had 47 subtracted from it. Keep that in one place: if
   * the cut ever changes, these all move together and nothing else does.
   */
  programme?: {
    work: string
    composer: string
    movements?: { title: string; at: number }[]
  }[]
  media?: Media
  photo?: {
    src: string
    caption: string
    /** Not a photograph of this: a picture of the forces, standing in for
     *  one. Said out loud on the image rather than buried in a credit,
     *  because a stock photograph presented as documentation of your own
     *  work is the kind of small dishonesty that costs a reader's trust in
     *  everything around it. */
    stock?: boolean
  }
  docs?: Attachment[]
}

export const WORKS: Work[] = [
  {
    id: 'abendlied',
    title: 'Abendlied',
    scoring: 'TTBB choir and piano',
    kind: 'Composition',
    when: '2023',
    where: 'Written for the King’s College TTBB choir',
    honour: 'Highly Commended, NZCF–SOUNZ Choral Composition Competition 2024',
    note: 'A setting of Heine’s “Wenn ich auf dem Lager liege”, written for my own school’s lower-voice choir and taken into their repertoire for the Big Sing Cadenza, where they took the top award. It leans on Clara Schumann’s “Liebst du um Schönheit” for its rocking ii–V–I and its “ah” bass line, and on Donald Patriquin for the polyphony from bar 29 and the rhythmic augmentation from bar 46.',
    /* The performance itself, filmed on the night — 480x848, because it was
       filmed on a phone held upright, which is why the frame below sizes
       itself from the file rather than assuming a shape. Its own 63kbps
       sound is used rather than the better separate extract: the two were
       recorded from different positions and do not start on the same
       instant, and a picture three seconds out of step with its sound is
       worse than a picture with ordinary sound. */
    media: {
      kind: 'video',
      youtube: '8Z23Cg1CbBc',
      label: 'Abendlied at Cadenza',
      caption: 'King’s College Choir',
    },
    docs: [
      { kind: 'score', label: 'Score', href: '/scores/abendlied.pdf' },
    ],
    photo: {
      src: '/photos/cadenza.jpg',
      caption: 'The King’s College choirs at the Big Sing Cadenza, Auckland Town Hall',
    },
  },
  {
    id: 'latin-america',
    title: 'A Journey Through Latin America',
    scoring: 'Alto saxophone and piano',
    kind: 'Performance',
    when: '2024',
    where: 'Cambridge A Level Music, extended performance',
    note: 'A recital built as one route rather than a set of pieces: French Brazil, an Argentine tango étude, then Havana and the Caribbean.',
    programme: [
      {
        work: 'Scaramouche, Op. 165c',
        composer: 'Darius Milhaud',
        movements: [
          { title: 'II. Modéré', at: 0 },          /* 0:47 on the tape */
          { title: 'III. Brazileira', at: 243 },   /* 4:50 */
        ],
      },
      {
        work: '6 Tango Études',
        composer: 'Astor Piazzolla',
        movements: [
          { title: 'IV. Lento meditativo', at: 461 }, /* 7:41 after the cut */
        ],
      },
      {
        work: 'Latin American Dances',
        composer: 'John Carmichael',
        movements: [
          { title: 'II. Obsession — Habañera', at: 706 }, /* 11:46 after the cut */
          { title: 'III. Bahama Rhumba', at: 867 },       /* 14:27 after the cut */
        ],
      },
    ],
    /* Both files start 47 seconds into the camera's tape, where the music
       starts; everything before it is the walk-on. Every figure in the
       programme above has had those 47 seconds taken off it, which is why
       the first movement begins at zero. */
    media: {
      kind: 'video',
      src: '/audio/journey-through-latin-america.m4a',
      film: '/video/journey-through-latin-america.mp4',
      label: 'The recital',
    },
    docs: [
      { kind: 'score', label: 'Scores', href: '/scores/journey-through-latin-america.pdf' },
      { kind: 'report', label: 'Research report', href: '/papers/journey-through-latin-america.pdf' },
    ],
  },
  {
    id: 'intro-rondo',
    title: 'Introduction and Rondo',
    scoring: 'Clarinet quintet',
    kind: 'Composition',
    when: '2024',
    where: 'Cambridge A Level Music, extended composition',
    scoringNote: 'Clarinet and string quartet, after Mozart’s K.581',
    note: 'Scored for clarinet and string quartet on the instrumentation of Mozart’s Clarinet Quintet, K.581, and built on the form of Saint-Saëns’ Introduction and Rondo Capriccioso: a slow introduction in 2/4 over a pizzicato bass, then a fast rondo in triple time running A–B–A–C–A–coda. The other pieces of influence named in the report are Mendelssohn’s Rondo Capriccioso, Binge’s saxophone concerto and Haydn’s Requiem in C minor.',
    media: {
      src: '/audio/introduction-and-rondo.mp3',
      kind: 'audio',
      label: 'Introduction and Rondo',
      /* Stated, not implied. The report says a live recording could not be
         produced because the players' schedules did not meet, so this is
         the engraving played back — and a synthesised realisation offered
         as though it were a performance is a small lie that a listener
         works out two seconds in. */
      caption: 'A playback of the score — the live recording was never made',
    },
    docs: [
      { kind: 'score', label: 'Score', href: '/scores/introduction-and-rondo.pdf' },
      { kind: 'report', label: 'Research report', href: '/papers/introduction-and-rondo.pdf' },
    ],
    photo: {
      src: '/photos/clarinet-quintet.jpg',
      caption: 'A clarinet quintet — clarinet and string quartet',
      stock: true,
    },
  },
]

/**
 * The rest of it: ensembles, instruments, a directorship. Roles rather than
 * works, so they are a list and not a stage.
 */
export const MUSIC: Item[] = [
  {
    id: 'mixedco',
    org: 'Mixed Company, Stanford',
    featured: true,
    title: 'Musical Director',
    kind: 'A cappella',
    when: '2026 – present',
    metric: { value: 'MD', label: 'Stanford’s oldest all-gender a cappella group' },
    line: 'Running the rehearsals, the arrangements and the room.',
    href: 'https://www.mixedco.com/',
    cta: 'mixedco.com',
  },
  {
    id: 'ipq',
    featured: true,
    title: 'The shape of a saxophone mouthpiece',
    fullTitle: 'How does the shape of an alto saxophone mouthpiece affect its sound?',
    org: 'Cambridge IPQ',
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
    org: 'NZ Secondary Students’ Choir',
    title: 'Soloist',
    kind: 'Choir',
    when: '2023 – 2024',
    metric: { value: '1 of 56', label: 'nationally' },
    line: 'Represented New Zealand at the China International Chorus Festival.',
  },
  {
    id: 'kings-choirs',
    org: 'King’s College',
    title: 'Kappella, and All the King’s Men',
    kind: 'Choir leader',
    when: '2020 – 2024',
    line: 'Gold, Silver and Bronze at the National Big Sing.',
  },
  {
    id: 'sax',
    org: 'Little Big Band',
    title: 'Alto saxophone',
    kind: 'Grade 8, distinction',
    when: '2022',
    line: 'Principal alto — Gold at the National Youth Jazz Competition.',
  },
  {
    id: 'violin',
    org: 'King’s College Symphony Orchestra',
    title: 'Violin',
    kind: 'Grade 6, distinction',
    when: '2020',
    line: 'Deputy leader of the Symphony Orchestra, principal second violin.',
  },
]
