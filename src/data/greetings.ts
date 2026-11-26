/**
 * Hello, in as many languages as the page can hold.
 *
 * Seven of them lead, at Ivan's asking: Simplified and Traditional
 * Chinese, German, French, Māori, Tongan and Arabic. The rest are a
 * quieter field behind them.
 *
 * One thing worth knowing before editing the Chinese. 你好 is written with
 * the same two characters in both scripts — simplified and traditional are
 * not different languages but different glyph sets, and these two glyphs
 * are not among the ones that differ. Printing 你好 twice would have shown
 * the same word twice and looked like a bug. 哈囉 and 哈喽 are the ordinary
 * transliterations of "hello" itself and DO differ, in the second
 * character, so the pair actually demonstrates the thing it is there to
 * demonstrate. 你好 is kept as well, as Mandarin, because it is the
 * greeting anybody would actually say.
 *
 * The coordinates are hand-set and there is one rule behind them: the
 * title occupies roughly x 30–70% at y 44–56%, and nothing goes in it. A
 * random field always drops one word across the middle of the heading, and
 * the fix for that is not more randomness.
 *
 * `rtl` is not decoration: Arabic, Hebrew and Persian render wrongly
 * without it, and a site about who a system is built to understand should
 * not be the one that gets that wrong.
 */
export type Greeting = {
  word: string
  /** BCP-47, so the browser picks the right face and a screen reader the
   *  right voice. */
  lang: string
  /** What it is, for the key beneath. Lead entries only. */
  name?: string
  rtl?: boolean
  /** Hand-placed, as a percentage of the hero. Not random: the seven lead
   *  words are positioned around the title rather than on top of it. */
  x: number
  y: number
  /** Relative size and ink. Leads are larger and darker. */
  size: number
  ink: number
}

export const LEADS: Greeting[] = [
  { word: '你好',         lang: 'zh-Hans', name: 'Mandarin',    x: 14, y: 16, size: 2.5, ink: 0.42 },
  { word: '哈喽',         lang: 'zh-Hans', name: 'Simplified',  x: 77, y: 70, size: 2.0, ink: 0.34 },
  { word: '哈囉',         lang: 'zh-Hant', name: 'Traditional', x: 72, y: 20, size: 2.1, ink: 0.38 },
  { word: 'Hallo',        lang: 'de',      name: 'German',      x: 20, y: 76, size: 2.3, ink: 0.40 },
  { word: 'Bonjour',      lang: 'fr',      name: 'French',      x: 62, y: 86, size: 1.9, ink: 0.32 },
  { word: 'Kia ora',      lang: 'mi',      name: 'Māori',       x: 15, y: 54, size: 2.4, ink: 0.44 },
  { word: 'Mālō e lelei', lang: 'to',      name: 'Tongan',      x: 83, y: 38, size: 1.8, ink: 0.36 },
  { word: 'مرحبا',        lang: 'ar',      name: 'Arabic', rtl: true, x: 26, y: 33, size: 2.2, ink: 0.38 },
]

export const FIELD: Greeting[] = [
  { word: 'Hola',      lang: 'es', x: 44, y: 9,  size: 1.1, ink: 0.16 },
  { word: 'こんにちは',  lang: 'ja', x: 88, y: 34, size: 1.2, ink: 0.15 },
  { word: '안녕하세요',  lang: 'ko', x: 5,  y: 88, size: 1.1, ink: 0.14 },
  { word: 'नमस्ते',      lang: 'hi', x: 38, y: 92, size: 1.2, ink: 0.17 },
  { word: 'Jambo',     lang: 'sw', x: 90, y: 56, size: 1.0, ink: 0.13 },
  { word: 'Talofa',    lang: 'sm', x: 34, y: 60, size: 1.1, ink: 0.15 },
  { word: 'Привет',    lang: 'ru', x: 84, y: 12, size: 1.0, ink: 0.13 },
  { word: 'Γειά σου',  lang: 'el', x: 10, y: 28, size: 1.0, ink: 0.14 },
  { word: 'שלום',      lang: 'he', rtl: true, x: 54, y: 24, size: 1.1, ink: 0.15 },
  { word: 'Olá',       lang: 'pt', x: 52, y: 72, size: 1.0, ink: 0.13 },
  { word: 'Ciao',      lang: 'it', x: 30, y: 6,  size: 1.0, ink: 0.14 },
  { word: 'Merhaba',   lang: 'tr', x: 60, y: 4,  size: 1.0, ink: 0.12 },
  { word: 'Xin chào',  lang: 'vi', x: 76, y: 94, size: 1.0, ink: 0.14 },
  { word: 'สวัสดี',      lang: 'th', x: 16, y: 64, size: 1.1, ink: 0.15 },
  { word: 'Sawubona',  lang: 'zu', x: 7,  y: 70, size: 1.0, ink: 0.11 },
  { word: 'Halo',      lang: 'id', x: 92, y: 80, size: 1.0, ink: 0.12 },
]
