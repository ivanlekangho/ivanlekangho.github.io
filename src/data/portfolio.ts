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
  /** Where one number does not carry the job. The Cancer Society internship
   *  is three pieces of work with a figure each, and picking one of them to
   *  stand on the tile undersold the other two — a reader does not have to
   *  know what 60,000 counts before deciding the tile is worth opening. */
  metrics?: { value: string; label: string }[]
  /** Leads its group, at twice the width. One per group. */
  featured?: boolean
  stack?: string[]
  /** Declared-but-undelivered files, shown while developing only. */
  attachments?: Attachment[]
  /** The documents behind the work, shown in the sheet as buttons with a
   *  page-by-page preview behind each. These used to be `attachments`, a
   *  row of 10px chips on the card, which put the only piece of evidence
   *  at the smallest size on it. */
  docs?: Attachment[]
  /** Says so, in the sheet, where there is more to come. Better than a
   *  bullet pretending to be content, and better than silence: a reader who
   *  opens a tile with one line behind it should be told it is early rather
   *  than left to conclude there is nothing. */
  soon?: boolean
  /** A photograph that belongs with the work, shown inside the sheet. */
  photo?: { src: string; caption: string; width: number; height: number }
  /** The sheet's body. An item with none of these does not open. */
  bullets?: string[]
  href?: string
  cta?: string
  /** The sheets that carry an exhibit rather than only prose. */
  exhibit?: 'authorship'
  /** A film of the thing itself, served from `public/films`. Small enough
   *  to host here — the two recital films are on YouTube because they are
   *  tens of megabytes; this one is 1.7. */
  film?: { src: string; caption?: string }
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
  { id: 'health', title: 'Health', gloss: 'Innovation for Health' },
  { id: 'education', title: 'Education', gloss: 'Inspiring Innovation' },
  { id: 'society', title: 'Society', gloss: 'Researching Societal Issues' },
]

export const ITEMS: Item[] = [
  /* -------------------------------------------------------- health */
  {
    id: 'charity',
    org: 'Cancer Society of New Zealand',
    group: 'health',
    featured: true,
    title: '**Software and Data Engineer Intern** for New Zealand’s largest cancer non-profit',
    /* One internship, not three tiles.
    
       The database rebuild, the donor governance and the two APIs were
       three separate cards carrying the same org, the same year and three
       different metrics, which read as three jobs at one charity rather
       than as one job with three pieces of work in it. Worse, the strongest
       number was on the featured card and the other two competed with it
       from the row underneath. As one item the internship is the unit a
       reader is actually assessing, and the three pieces are what is behind
       it. */
    kind: 'Internship',
    when: 'Jun – Sep 2026',
    metrics: [
      { value: '95%', label: 'faster extraction' },
      { value: '60,000+', label: 'donor records governed' },
      { value: '80%', label: 'less overpayment' },
    ],
    line: 'Rebuilt an undocumented patient database, decided what the charity was allowed to keep, and replaced two paper forms with two APIs.',
    stack: ['Python', 'MySQL', 'Google Maps API', 'Outlook API'],
    photo: {
      src: '/photos/daffodil-day.jpg',
      caption: 'Daffodil Day 2026, New Zealand’s largest fundraising campaign',
      width: 900,
      height: 1200,
    },
    /* `**` marks the phrase a reader should catch while skimming: the
       figures, and the job itself. Not decoration — a sheet of eight
       bullets is read by scanning first and reading second, and the scan
       should land on the numbers that made the tile worth opening. */
    bullets: [
      '**Software and Data Engineer Intern** across three systems: the patient database, the donor record and the volunteer driver fleet.',
      'Reverse-engineered an undocumented legacy case-management schema with no declared foreign keys and rebuilt it as relational tables, cutting patient data extraction time by **95%** on median and 95th-percentile benchmarks.',
      'Led data governance on a **60,000+ record** donor database, applying the government privacy policy and RFM segmentation to decide which records had to go and which lapsed donors were worth re-engaging.',
      'Replaced self-reported driver hours with Google Maps API distance calculations, cutting an estimated **80% of reimbursement overpayment** across **500+ volunteer drivers**.',
      'Automated shift scheduling for **40 staff** through the Outlook API, replacing a fragile desktop-automation dependency.',
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
    line: 'Section leader for Stanford’s intro sequence: Python, then C++ and data structures.',
    stack: ['Python', 'C++'],
    bullets: [
      'Section leader for Stanford’s introductory computer science sequence: CS106A in Python, CS106B in C++ and data structures.',
      '15–20 students a quarter.',
    ],
  },
  {
    id: 'code4myanmar',
    org: 'Code For Myanmar',
    group: 'education',
    title: 'Volunteer Python instructor',
    kind: 'Teaching',
    when: 'Jul – Aug 2026',
    metric: { value: '40', label: 'students' },
    line: 'A six-week Python syllabus for forty students in Chin State, taught through cultural analogies.',
    stack: ['Python'],
    bullets: [
      'Designed the syllabus and taught a six-week Python programme to 40 students at Chinbridge College in Chin State, Myanmar.',
      'Taught for low computer and English literacy: the concepts were carried by cultural analogies rather than by the vocabulary and the keyboard fluency a first programming course usually takes for granted.',
    ],
    film: {
      src: '/films/code4myanmar.mp4',
      caption: 'Chinbridge College, Chin State',
    },
    href: 'https://www.codedotx.org/code-for-myanmar',
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
    line: 'Held across 18 of 19 fields, every citation quartile, and eighteen years.',
    stack: ['Python', 'pandas', 'OpenAlex API', 'World Bank API'],
    exhibit: 'authorship',
    /* No paper. There isn't one — the output is the analysis and the
       figures, so the card offers the code instead of promising a write-up
       that does not exist. */
    docs: [{
      kind: 'repo',
      label: 'Code and data',
      href: 'https://github.com/ivanlekangho/authorship-inequality',
    }],
    bullets: [
      'Uncovered a statistically significant **8.9% last-authorship deficit** for Global South researchers across **19 fields and 18 years**, a structural pattern of inequality in global scientific publishing. Global South researchers hold first authorship, the execution, above their expected rate while holding last authorship, the credit, below it.',
      'The deficit held in 18 of the 19 fields, in every citation quartile, and in every year, with no measurable improvement over time. A pattern that stable is structural, not incidental. Earth and Planetary Sciences is the single exception.',
      'Built a **111,602-row dataset across 180 countries** from **14,250 papers**, merging bibliometric and economic data from the OpenAlex and World Bank APIs.',
      'Validated it with McNemar’s tests and longitudinal trend analysis, and presented it in choropleth maps, forest plots and time series (pandas, matplotlib, seaborn).',
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
    docs: [{ kind: 'report', label: 'Paper', href: '/papers/uyghur-oppression.pdf' }],
    bullets: [
      'How Chinese state media, platform design and language policy combine to push Uyghur linguistic expression out of digital space: three mechanisms usually studied separately, read as one machine.',
    ],
  },
  {
    id: 'gene-drives',
    group: 'society',
    title: 'Gene drives in New Zealand',
    kind: 'Paper',
    line: 'Liability once a drive crosses a border, and whether Māori get a decision.',
    stack: ['Biotechnology policy', 'Law'],
    docs: [{ kind: 'report', label: 'Paper' }],
    bullets: [
      'Gene drives are on the table for predator control in New Zealand, and a drive does not stop at a property line, a trial boundary or a border.',
      'Two legal gaps follow from that: who is liable once it has crossed one, and whether Māori get a decision rather than a consultation. Neither appears to be reached by the Gene Technology Bill.',
    ],
  },
  {
    id: 'spog',
    org: 'Speech and Cognitive Development Lab',
    group: 'society',
    title: 'Research Assistant',
    kind: 'Lab',
    when: 'Jan 2026 – present',
    metric: { value: '20%', label: 'faster processing' },
    line: 'Preprocessing and annotation pipelines for validating speech recognition against real recordings.',
    stack: ['Python', 'ASR'],
    bullets: [
      'Built **IRB-compliant** Python preprocessing and annotation pipelines to accelerate ASR model validation against naturalistic speech recordings, increasing data processing efficiency by **20%**.',
    ],
  },
  {
    id: 'uzbeksafety',
    org: 'Responsible AI for Uzbek Language',
    group: 'society',
    title: 'Project Assistant and UI/UX',
    kind: 'AI safety',
    /* The project plan Ivan sent is a colleague's document, with her name on
       it, a stakeholder analysis and a budget in it. None of that is his to
       publish, so what is here is his own contribution plus the problem as
       briefly as it can be stated. The lead researcher is deliberately not
       named, like the other third parties on this site. */
    line: 'Safety infrastructure for Uzbek, a language 34 million people speak and almost no safety benchmark covers.',
    stack: ['UI/UX', 'AI safety'],
    bullets: [
      'Project assistant on an effort to build the AI safety infrastructure Uzbek does not have: a taxonomy of harms, a benchmark, and a detection tool that can sit in front of a model as a safety layer.',
      'Large language models are measurably less safe in low-resource languages, and the usual workaround of machine-translating an English benchmark loses the cultural and contextual nuance that decides whether something is harmful in the first place.',
      '**Designed the UI and UX** for the project’s data-collection site, where Uzbek speakers report the scams, abuse and culturally wrong model output they actually receive.',
    ],
    soon: true,
  },

  /* --------------------------------------------- society, continued */
  {
    id: 'flutterer',
    group: 'society',
    title: 'Flutterer',
    kind: 'Full stack',
    when: 'Sep – Dec 2025',
    metric: { value: '10+', label: 'REST endpoints' },
    line: 'A social platform from nothing: auth, timelines, likes, comments.',
    stack: ['Python', 'JavaScript', 'AWS EC2', 'S3', 'RDS'],
    /* No repo and no demo, at Ivan's instruction. The attachment row used
       to declare a "Source" link that did not exist, which is the promise
       this site is not allowed to make. */
    bullets: [
      'Engineered a full-stack social media platform in Python, JavaScript and AWS (EC2, S3, RDS), with authentication, feeds, likes and comments.',
      'Designed and deployed **10+ REST API endpoints** on EC2, with stateful server-side routing and real-time updates across concurrent user sessions.',
      'Architected the relational schemas on RDS, structuring user data, the social graph and post histories into modular components.',
      'Integrated S3 for media storage, for high-throughput upload and delivery of user-generated media.',
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
   * Nothing uses this now and it is kept because the reason is worth
   * keeping: self-hosting a long film here meant splitting it, since the
   * only encoder available is quality-targeted with no bitrate control and
   * its usable settings gave either 284MB at 480p or a 32MB file whose
   * audio was 16kHz. The picture came from the small one with its sound
   * discarded and the sound from a proper 44.1kHz extract, kept in step by
   * a loop. Both films are hosted now, which is the answer that did not
   * need a trick.
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
  /* `scoring` and `scoringNote` are gone. They printed "TTBB choir and
     piano" and "Clarinet and string quartet, after Mozart's K.581" under
     each title, and every one of those facts is now in the paragraph
     underneath in Ivan's own words — the line under the heading was saying
     the same thing twice, a beat earlier and worse. */
  kind: 'Composition' | 'Performance'
  when: string
  /** Who performed it, or what it was submitted to. */
  where?: string
  /** The one line of recognition worth the space. */
  honour?: { award: string; where: string }
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
    /** Empty where the picture speaks for itself. The clarinet quintet
     *  carried a stock-image disclosure until Ivan licensed the photograph,
     *  at which point the thing it was admitting stopped being true. */
    caption: string
    /** The file's own pixels, so the box is reserved before the bytes
     *  land. Without these the element is 2px tall and the layout has
     *  nowhere to put the picture. */
    width: number
    height: number
  }
  docs?: Attachment[]
}

/* Introduction and Rondo first, which is Ivan's order and the stronger
   one: it is the larger piece, it has a research report behind it, and a
   reader meeting the compositions should meet that one first. */
export const WORKS: Work[] = [
  {
    id: 'intro-rondo',
    title: 'Introduction and Rondo',
    kind: 'Composition',
    when: '2024',
    note: 'A Romantic-style piece written for clarinet and string quartet, influenced by Mozart, Mendelssohn, Saint-Saëns, Binge and Haydn. The research report has the rest.',
    media: {
      src: '/audio/introduction-and-rondo.mp3',
      kind: 'audio',
      label: 'Introduction and Rondo',
    },
    docs: [
      { kind: 'score', label: 'Score', href: '/scores/introduction-and-rondo.pdf' },
      { kind: 'report', label: 'Research report', href: '/papers/introduction-and-rondo.pdf' },
    ],
    photo: {
      src: '/photos/clarinet-quintet.jpg',
      caption: '',
      width: 640,
      height: 400,
    },
  },
  {
    id: 'abendlied',
    title: 'Abendlied',
    kind: 'Composition',
    when: '2023',
    honour: {
      award: 'Highly Commended',
      where: 'NZCF–SOUNZ Choral Composition Competition 2024',
    },
    note: 'A Romantic-style setting of Heine’s “Wenn ich auf dem Lager liege”, written for TTBB choir and piano. This piece was taken into my school’s repertoire for the Regional Big Sing Cadenza, where we took the top award.',
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
    },
    docs: [
      { kind: 'score', label: 'Score', href: '/scores/abendlied.pdf' },
    ],
  },
  {
    id: 'latin-america',
    title: 'A Journey Through Latin America',
    kind: 'Performance',
    when: '2024',
    note: 'An alto saxophone recital laid out as a single route rather than a set of pieces: Brazil by way of France, an Argentine tango étude, then Havana and the Caribbean. The research report has the rest.',
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
    /* The upload starts 47 seconds into the camera's tape, where the music
       starts; everything before it is the walk-on. Every figure in the
       programme above has had those 47 seconds taken off it, which is why
       the first movement begins at zero and why these times are read
       against the upload rather than against the tape. */
    media: {
      kind: 'video',
      youtube: 'cFW4_g_HcfQ',
      label: 'The recital',
    },
    docs: [
      { kind: 'score', label: 'Scores', href: '/scores/journey-through-latin-america.pdf' },
      { kind: 'report', label: 'Research report', href: '/papers/journey-through-latin-america.pdf' },
    ],
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
    metric: { value: 'MD', label: 'Stanford’s oldest all-gender, all-genre a cappella group' },
    line: 'Running the rehearsals, the arrangements and the room.',
    /* The tile opens rather than leaving the site. It used to be a link
       straight out to mixedco.com, which sent a reader away before Ivan had
       said anything about what he does there — and there is a season of it
       still to write. The link is inside now, at the foot of the sheet. */
    bullets: [
      'Musical Director of Stanford’s oldest all-gender, all-genre a cappella group: running the rehearsals, writing the arrangements, and holding the room.',
    ],
    soon: true,
    href: 'https://www.mixedco.com/',
  },
  {
    id: 'nzssc',
    org: 'NZ Secondary Students’ Choir',
    featured: true,
    title: 'Soloist',
    kind: 'Choir',
    when: '2023 – 2024',
    metric: { value: '1 of 56', label: 'nationally' },
    line: 'Represented New Zealand at the China International Chorus Festival.',
    bullets: [
      'One of 56 singers selected nationally for New Zealand’s secondary schools choir.',
      'Soloist, and represented New Zealand at the China International Chorus Festival.',
    ],
  },
]

/**
 * School music, by instrument rather than by ensemble.
 *
 * Five years of it was four tiles sorted by group — a choir, a band, an
 * orchestra, each with a grade certificate for an eyebrow — which made a
 * reader assemble the person out of the groups. Sorted by what he plays, it
 * is three tiles and reads in one pass: here is the voice and what it led,
 * here is the saxophone and what it sat in, here is the violin.
 *
 * The practical grades are gone with that arrangement. "Grade 8,
 * distinction" is a fact about an exam, not about playing in a band, and it
 * was standing where the eyebrow should have said which kind of ensemble
 * this was.
 */
export const KINGS_MUSIC: Item[] = [
  {
    id: 'kings-voice',
    title: 'Voice',
    kind: 'Choirs',
    when: '2020 – 2024',
    line: 'Leader of All the King’s Men and of Kappella; a bass in the Chapel Choir.',
    bullets: [
      'Leader of All the King’s Men and of Kappella.',
      'A bass in the Chapel Choir.',
      'Gold, Silver and Bronze at the National Big Sing.',
    ],
  },
  {
    id: 'kings-sax',
    title: 'Saxophone',
    kind: 'Bands',
    when: '2020 – 2024',
    line: 'Principal alto, across four bands.',
    bullets: [
      'Premier Concert Band, Concert Band, Little Big Band and Glee Band.',
      'Principal alto, and Gold at the National Youth Jazz Competition.',
    ],
  },
  {
    id: 'kings-violin',
    title: 'Violin',
    kind: 'Orchestras',
    when: '2020 – 2024',
    line: 'Section leader of the second violins, and a trio with a clarinet in it.',
    bullets: [
      'Section leader of the second violins in the Symphony Orchestra, and in the Chamber Orchestra.',
      'Milhaud’s Trio, a chamber group for violin, clarinet and piano.',
    ],
  },
]

