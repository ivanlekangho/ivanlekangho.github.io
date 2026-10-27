import Todo from '../components/Todo'

/**
 * Work — roles, the Cancer Society engineering in full, projects, service.
 *
 * The Cancer Society material stays deliberately redacted, as agreed with
 * Ivan: no product or vendor name, no schema column names, no named
 * supervisor. The organisation holds patient case data, and publishing
 * "this charity runs this product, here is its undocumented schema, here is
 * who administers it" is a disclosure surface for no benefit. He named the
 * product in his own notes for me; that is not the same as deciding to
 * publish it, so it is still out. The engineering story survives intact.
 */

const ROLES = [
  {
    org: 'Cancer Society of New Zealand',
    role: 'Software & Data Engineer Intern · Wellington',
    when: 'Jun – Sep 2026',
  },
  {
    org: 'Stanford School of Engineering',
    role: 'Section leader, introductory computer science — Python, JavaScript and C++ for 15–20 students a quarter',
    when: 'Mar 2026 – present',
  },
  {
    org: 'Stanford Speech and Cognitive Development Lab',
    role: 'Research assistant — Python preprocessing and annotation pipelines for speech data, validating ASR models against naturalistic recordings under IRB protocol',
    when: 'Jan 2026 – present',
  },
  {
    org: 'JPMorgan Chase',
    role: 'Software engineering virtual experience · Auckland — real-time trading dashboards in Python, JavaScript and Perspective',
    when: 'Apr – Jun 2024',
  },
]

const CHARITY = [
  {
    title: 'Rebuilding a patient database nobody had documented',
    stack: 'Python · MySQL',
    built: [
      'Reverse-engineered the table relationships of a legacy case-management system from scratch — no documentation, no declared foreign keys — and redesigned the architecture around what the data actually was.',
      'Migrated unstructured records into relational tables, which is what made patient data requests answerable in an afternoon rather than a week.',
      'Benchmarked it honestly: median and 95th-percentile extraction time over a fixed set of real tasks, same hardware before and after. 95% reduction. A single best-case timing would have been easier and would have meant nothing.',
      'Described here at the level of the technical problem only — no product name, no schema detail, nothing about what the records contain.',
    ],
  },
  {
    title: 'Deciding what a charity is allowed to keep',
    stack: 'Python · data governance',
    built: [
      'Led governance on a 60,000+ record donor database: read the government privacy policy and worked out which records had to go and which lapsed donors were worth re-engaging.',
      'Applied RFM segmentation to separate the two, weighing revenue potential against retention cost and legal obligation. Deleting donor records is not a cleanup task — it is a decision with a rule behind it.',
    ],
  },
  {
    title: 'Two APIs replacing two pieces of paperwork',
    stack: 'Python · Google Maps API · Microsoft Outlook API',
    built: [
      'Replaced self-reported driver hours with a distance calculation from the Google Maps API, cutting an estimated 80% of reimbursement overpayment across 500+ volunteer drivers.',
      'Automated shift scheduling for 40 staff through the Outlook API, replacing a fragile desktop-automation dependency.',
    ],
  },
]

const PROJECTS = [
  {
    title: 'Authorship Inequality in International Scientific Collaboration',
    when: 'Feb – Mar 2026',
    stack: 'Python · pandas · OpenAlex and World Bank APIs',
    built: [
      'An 8.9% last-authorship deficit for Global South researchers on internationally co-authored papers — and it held across all 19 fields, every citation quartile, and eighteen years, with no measurable improvement over time. A pattern that stable is structural, not incidental.',
      'Built the dataset to test it: 111,602 author rows across 180 countries, from 14,250 papers, merging bibliometric and economic development data.',
      'Checked it could survive being wrong — McNemar’s test, confidence intervals, citation-quartile stratification, field-by-field robustness, longitudinal trend — then put it in choropleths, forest plots and time series.',
    ],
  },
  {
    title: 'Mandarin, Monitors, and Marginalization: The Digital Machinery of Uyghur Oppression',
    when: '',
    stack: 'Research paper',
    built: [
      'How Chinese state media, platform design and language policy combine to push Uyghur linguistic expression out of digital space — three mechanisms usually studied separately, read as one machine.',
    ],
  },
  {
    title: 'Flutterer',
    when: 'Sep – Dec 2025',
    stack: 'Python · JavaScript · Django · AWS EC2, S3, RDS',
    built: [
      'A full-stack social platform built from scratch: authentication, posting, timelines, likes, comments.',
      '10+ REST endpoints with stateful server-side routing, relational models on RDS and media storage on S3.',
    ],
  },
]

const SERVICE = [
  {
    org: 'Phi Kappa Psi, Stanford chapter',
    role: 'Deputy Chair, Risk Management and Violence Intervention & Prevention',
    when: 'Sep 2026 – present',
  },
  {
    org: 'Code4Myanmar',
    role: 'Volunteer Python instructor — a six-week remote course for college-aged students in Chin State',
    when: 'TODO — dates',
  },
  {
    org: 'Community pharmacy',
    role: 'Volunteer — learned how HIV treatment and the stigma around it actually work from the pharmacists and from a patient willing to talk about it',
    when: 'TODO — where and when',
  },
  {
    org: 'Secondary school, New Zealand',
    role: 'STI awareness — free condoms and safe-sex posters, against a certain amount of institutional reluctance',
    when: 'TODO — years',
  },
]

export default function Work() {
  return (
    <section id="work" className="band">
      <div className="shell">
        <p className="eyebrow">Work</p>
        <h2 className="h-hero">Built for someone<br />who needed it</h2>

        <p className="lede">
          Most of the engineering here is internal tooling for a cancer support
          charity, and most of the research is about who gets counted. Both have a
          named person on the other end of them.
        </p>

        <h3 className="h-rule">Roles</h3>
        <ul className="index">
          {ROLES.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main">{r.org}</span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>

        <h3 className="h-rule">Cancer Society, in detail</h3>
        {CHARITY.map((p) => (
          <article key={p.title} className="entry">
            <div className="entry-head">
              <h4>{p.title}</h4>
              <p className="entry-meta">{p.stack}</p>
            </div>
            <div className="entry-body">
              <ul className="bullets">
                {p.built.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </article>
        ))}
        <p className="aside">
          Halfway through, I went out to the Society’s patient housing lodges —
          where people stay when treatment is in a city they don’t live in. It is
          difficult to think of a database as an abstraction after that.
        </p>
        <Todo>
          That paragraph is my reading of one line in your brief. Write it
          yourself — it is the most important sentence in this section and it
          should sound like you. Also useful here: how slow the old process
          actually was in human terms, and how many staff depend on each tool.
        </Todo>

        <h3 className="h-rule">Projects</h3>
        {PROJECTS.map((p) => (
          <article key={p.title} className="entry">
            <div className="entry-head">
              <h4>{p.title}</h4>
              <p className="entry-meta">{p.stack}{p.when && ` · ${p.when}`}</p>
            </div>
            <div className="entry-body">
              <ul className="bullets">
                {p.built.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </article>
        ))}
        <Todo>
          Links. The authorship paper and the Uyghur paper should both be readable
          — a PDF in public/, a repo, a preprint, whatever exists. Flutterer needs
          a repo link and a live link if it ships. Right now a reader has to take
          all three on trust.
        </Todo>

        <h3 className="h-rule">Service</h3>
        <ul className="index">
          {SERVICE.map((r) => (
            <li key={r.org} className="index-row">
              <span className="index-main">{r.org}</span>
              <span className="index-sub">{r.role}</span>
              <span className="index-meta">{r.when}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
