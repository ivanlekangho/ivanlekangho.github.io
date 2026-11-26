/**
 * "Say hello", in as many languages and as many scripts as the page holds.
 *
 * The phrase, not the greeting. These used to be bare greetings — Hallo,
 * Bonjour, 你好 — which is a different thing: the page is called Say Hello,
 * so each of these is that instruction in another language. `Dites
 * bonjour`, not `Bonjour`. It reads as a page saying one sentence many ways
 * instead of a page listing words.
 *
 * Twenty-seven languages across thirteen writing systems: Latin, Han,
 * Hangul, Japanese, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Thai,
 * Armenian, Georgian, Ethiopic, Tamil and Bengali.
 *
 * NO ENGLISH. The page's own title says "Say Hello" in it already, and a
 * field of translations with the original in it reads as a list that forgot
 * which one it was translating.
 *
 * The density is the point. At fifteen the field was sparse enough that a
 * reader counted the words instead of taking in a crowd; the whole argument
 * of this page is the range, and a range you can count is not one.
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
 * The coordinates are hand-set against two rules. The title occupies
 * roughly x 28–72% at y 42–58% and nothing goes in it; the rail sits at the
 * left edge, about 9% wide, centred vertically, so nothing goes under that
 * either. A random field always drops a word across one of them, and the
 * fix for that is not more randomness.
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
  /* --- the loudest ------------------------------------------------- */
  { say: 'Dis Bonjour',       lang: 'fr',      x: 58, y: 66, size: 2.1, ink: 0.46 },
  { say: 'Sag Hallo',         lang: 'de',      x: 21, y: 29, size: 2.0, ink: 0.45 },
  { say: 'Mihi Mai',          lang: 'mi',      x: 20, y: 40, size: 2.1, ink: 0.46 },
  { say: '打个招呼',           lang: 'zh-Hans', x: 26, y: 6,  size: 2.0, ink: 0.44 },
  { say: '인사해요',           lang: 'ko',      x: 67, y: 6,  size: 1.9, ink: 0.42 },
  { say: 'قل مرحبا',           lang: 'ar', rtl: true, x: 37, y: 18, size: 1.9, ink: 0.42 },

  /* --- the field, dense enough to read as one ----------------------- */
  { say: 'Πες Γεια',          lang: 'el',      x: 8,  y: 8,  size: 1.4, ink: 0.36 },
  { say: 'Zeg Hallo',         lang: 'nl',      x: 46, y: 9,  size: 1.3, ink: 0.33 },
  { say: 'Скажи Привет',      lang: 'ru',      x: 86, y: 11, size: 1.4, ink: 0.36 },
  { say: 'Di Hola',           lang: 'es',      x: 13, y: 18, size: 1.4, ink: 0.35 },
  { say: '挨拶して',           lang: 'ja',      x: 59, y: 21, size: 1.5, ink: 0.38 },
  { say: 'Säg Hej',           lang: 'sv',      x: 81, y: 23, size: 1.3, ink: 0.32 },
  { say: 'תגיד שלום',          lang: 'he', rtl: true, x: 48, y: 31, size: 1.4, ink: 0.35 },
  { say: 'Merhaba De',        lang: 'tr',      x: 71, y: 34, size: 1.3, ink: 0.33 },
  { say: 'নমস্কার বলো',          lang: 'bn',      x: 92, y: 31, size: 1.3, ink: 0.32 },
  { say: 'ทักทายสิ',           lang: 'th',      x: 18, y: 56, size: 1.3, ink: 0.33 },
  { say: 'Բարև Ասա',          lang: 'hy',      x: 88, y: 45, size: 1.3, ink: 0.33 },
  { say: 'Привітайся',        lang: 'uk',      x: 83, y: 57, size: 1.3, ink: 0.32 },
  { say: "Di' Ciao",          lang: 'it',      x: 7,  y: 64, size: 1.4, ink: 0.35 },
  { say: '打個招呼',           lang: 'zh-Hant', x: 90, y: 68, size: 1.5, ink: 0.37 },
  { say: 'नमस्ते कहो',           lang: 'hi',      x: 31, y: 73, size: 1.4, ink: 0.35 },
  { say: 'Powiedz Cześć',     lang: 'pl',      x: 13, y: 78, size: 1.3, ink: 0.32 },
  { say: 'ሰላም በል',            lang: 'am',      x: 73, y: 78, size: 1.3, ink: 0.33 },
  { say: 'Diz Olá',           lang: 'pt',      x: 45, y: 85, size: 1.4, ink: 0.35 },
  { say: 'მიესალმე',          lang: 'ka',      x: 10, y: 90, size: 1.3, ink: 0.33 },
  { say: 'வணக்கம் சொல்',         lang: 'ta',      x: 66, y: 91, size: 1.3, ink: 0.32 },
  { say: 'Nói Xin Chào Nhé',  lang: 'vi',      x: 27, y: 96, size: 1.3, ink: 0.32 },
  { say: 'Sano Hei',          lang: 'fi',      x: 88, y: 95, size: 1.3, ink: 0.31 },
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
