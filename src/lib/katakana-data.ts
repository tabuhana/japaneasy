export type KatakanaChar = {
  kana: string;
  romaji: string;
  alternates: string[];
};

export type KatakanaRow = {
  id: string;
  name: string;
  characters: KatakanaChar[];
};

export const KATAKANA_ROWS: KatakanaRow[] = [
  {
    id: 'vowels',
    name: 'Vowels',
    characters: [
      { kana: 'ア', romaji: 'a', alternates: [] },
      { kana: 'イ', romaji: 'i', alternates: [] },
      { kana: 'ウ', romaji: 'u', alternates: [] },
      { kana: 'エ', romaji: 'e', alternates: [] },
      { kana: 'オ', romaji: 'o', alternates: [] },
    ],
  },
  {
    id: 'k',
    name: 'K Row',
    characters: [
      { kana: 'カ', romaji: 'ka', alternates: [] },
      { kana: 'キ', romaji: 'ki', alternates: [] },
      { kana: 'ク', romaji: 'ku', alternates: [] },
      { kana: 'ケ', romaji: 'ke', alternates: [] },
      { kana: 'コ', romaji: 'ko', alternates: [] },
    ],
  },
  {
    id: 's',
    name: 'S Row',
    characters: [
      { kana: 'サ', romaji: 'sa', alternates: [] },
      { kana: 'シ', romaji: 'shi', alternates: ['si'] },
      { kana: 'ス', romaji: 'su', alternates: [] },
      { kana: 'セ', romaji: 'se', alternates: [] },
      { kana: 'ソ', romaji: 'so', alternates: [] },
    ],
  },
  {
    id: 't',
    name: 'T Row',
    characters: [
      { kana: 'タ', romaji: 'ta', alternates: [] },
      { kana: 'チ', romaji: 'chi', alternates: ['ti'] },
      { kana: 'ツ', romaji: 'tsu', alternates: ['tu'] },
      { kana: 'テ', romaji: 'te', alternates: [] },
      { kana: 'ト', romaji: 'to', alternates: [] },
    ],
  },
  {
    id: 'n',
    name: 'N Row',
    characters: [
      { kana: 'ナ', romaji: 'na', alternates: [] },
      { kana: 'ニ', romaji: 'ni', alternates: [] },
      { kana: 'ヌ', romaji: 'nu', alternates: [] },
      { kana: 'ネ', romaji: 'ne', alternates: [] },
      { kana: 'ノ', romaji: 'no', alternates: [] },
    ],
  },
  {
    id: 'h',
    name: 'H Row',
    characters: [
      { kana: 'ハ', romaji: 'ha', alternates: [] },
      { kana: 'ヒ', romaji: 'hi', alternates: [] },
      { kana: 'フ', romaji: 'fu', alternates: ['hu'] },
      { kana: 'ヘ', romaji: 'he', alternates: [] },
      { kana: 'ホ', romaji: 'ho', alternates: [] },
    ],
  },
  {
    id: 'm',
    name: 'M Row',
    characters: [
      { kana: 'マ', romaji: 'ma', alternates: [] },
      { kana: 'ミ', romaji: 'mi', alternates: [] },
      { kana: 'ム', romaji: 'mu', alternates: [] },
      { kana: 'メ', romaji: 'me', alternates: [] },
      { kana: 'モ', romaji: 'mo', alternates: [] },
    ],
  },
  {
    id: 'y',
    name: 'Y Row',
    characters: [
      { kana: 'ヤ', romaji: 'ya', alternates: [] },
      { kana: 'ユ', romaji: 'yu', alternates: [] },
      { kana: 'ヨ', romaji: 'yo', alternates: [] },
    ],
  },
  {
    id: 'r',
    name: 'R Row',
    characters: [
      { kana: 'ラ', romaji: 'ra', alternates: [] },
      { kana: 'リ', romaji: 'ri', alternates: [] },
      { kana: 'ル', romaji: 'ru', alternates: [] },
      { kana: 'レ', romaji: 're', alternates: [] },
      { kana: 'ロ', romaji: 'ro', alternates: [] },
    ],
  },
  {
    id: 'w',
    name: 'W Row',
    characters: [
      { kana: 'ワ', romaji: 'wa', alternates: [] },
      { kana: 'ヲ', romaji: 'wo', alternates: [] },
    ],
  },
  {
    id: 'nn',
    name: 'N',
    characters: [{ kana: 'ン', romaji: 'n', alternates: ['nn'] }],
  },
];
