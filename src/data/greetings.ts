/**
 * "Say hello", in as many languages and as many scripts as the page holds.
 *
 * The phrase, not the greeting. These used to be bare greetings — Hallo,
 * Bonjour, 你好 — which is a different thing: the page is called Say Hello,
 * so each of these is that instruction in another language. `Dites
 * bonjour`, not `Bonjour`. It reads as a page saying one sentence many ways
 * instead of a page listing words.
 *
 * Fifteen languages across three alphabets: Latin, Cyrillic and Greek, plus
 * the Armenian. This is Ivan's own list — it was wider, taking in Han,
 * Hangul, Arabic, Hebrew, Devanagari and more, and he cut it to these. The
 * field is quieter for it and every phrase on it is one he will stand
 * behind, which on a page about being understood is the better trade.
 *
 * All of them are set in title case, which he asked for: "Say Hello" is the
 * page's own title, so every translation of it is a title too.
 *
 * `rtl` stays on the type though nothing uses it now. Arabic and Hebrew
 * render wrongly without it, and if either comes back the field has to be
 * there waiting rather than remembered.
 *
 * CHECKED WITH NATIVE SPEAKERS. Ivan has confirmed every wording here,
 * which is why there is no longer a per-line flag marking which ones were
 * guesses — on a page whose whole argument is about being understood, a
 * mistranslation on the front would have cost more than the page is worth.
 *
 * The coordinates are hand-set against one rule: the title occupies roughly
 * x 28–72% at y 42–58% and nothing goes in it. A random field always drops
 * a word across the middle of the heading, and the fix for that is not more
 * randomness.
 */
export type Greeting = {
  /** "Say hello", in that language. */
  say: string
  /** BCP-47, so the browser picks the right face and a screen reader the
   *  right voice. */
  lang: string
  rtl?: boolean
  /** Percentage of the hero. */
  x: number
  y: number
  /** Relative size and ink. */
  size: number
  ink: number
}

export const GREETINGS: Greeting[] = [
  /* --- the loudest, and the ones Ivan asked to lead ----------------- */
  { say: 'Say Hello',         lang: 'en', x: 15, y: 15, size: 2.3, ink: 0.46 },
  { say: 'Dis Bonjour',       lang: 'fr', x: 62, y: 85, size: 1.9, ink: 0.40 },
  { say: 'Sag Hallo',         lang: 'de', x: 19, y: 77, size: 2.1, ink: 0.42 },
  { say: 'Mihi Mai',          lang: 'mi', x: 14, y: 54, size: 2.2, ink: 0.44 },

  /* --- the field, at a weight you can actually read ----------------- */
  { say: 'Скажи Привет',      lang: 'ru', x: 85, y: 36, size: 1.3, ink: 0.30 },
  { say: 'Πες Γεια',          lang: 'el', x: 9,  y: 30, size: 1.3, ink: 0.30 },
  { say: 'Բարև Ասա',          lang: 'hy', x: 90, y: 80, size: 1.2, ink: 0.27 },
  { say: 'Di Hola',           lang: 'es', x: 31, y: 5,  size: 1.2, ink: 0.28 },
  { say: "Di' Ciao",          lang: 'it', x: 6,  y: 42, size: 1.2, ink: 0.27 },
  { say: 'Diz Olá',           lang: 'pt', x: 52, y: 72, size: 1.2, ink: 0.27 },
  { say: 'Zeg Hallo',         lang: 'nl', x: 76, y: 7,  size: 1.1, ink: 0.25 },
  { say: 'Säg Hej',           lang: 'sv', x: 94, y: 92, size: 1.1, ink: 0.24 },
  { say: 'Powiedz Cześć',     lang: 'pl', x: 44, y: 96, size: 1.1, ink: 0.24 },
  { say: 'Merhaba De',        lang: 'tr', x: 66, y: 38, size: 1.2, ink: 0.26 },
  { say: 'Nói Xin Chào Nhé',  lang: 'vi', x: 23, y: 22, size: 1.1, ink: 0.25 },
]

/**
 * What Ivan actually speaks, and how well — his words for the levels.
 *
 * The first column is each language's own name for itself, which is also
 * where the script difference shows: 普通话 is written in simplified
 * characters and 客家話 in traditional. The labels that said so have gone —
 * the characters are the evidence, and a reader who can read them does not
 * need to be told, while one who cannot is not helped by the word.
 */
export type Tongue = { own: string; lang: string; name: string; level: string }

export const TONGUES: Tongue[] = [
  { own: 'English',  lang: 'en',      name: 'English',          level: 'Native' },
  { own: '普通话',    lang: 'zh-Hans', name: 'Mandarin Chinese', level: 'Fluent' },
  { own: '客家話',    lang: 'zh-Hant', name: 'Hakka Chinese',    level: 'Fluent' },
  { own: 'Français', lang: 'fr',      name: 'French',           level: 'B2-Level' },
  { own: 'Māori',    lang: 'mi',      name: 'Māori',            level: 'Learning' },
  { own: 'Deutsch',  lang: 'de',      name: 'German',           level: 'Learning' },
]
