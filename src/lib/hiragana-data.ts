export type HiraganaChar = {
  kana: string;
  romaji: string;
  alternates: string[];
};

export type HiraganaRow = {
  id: string;
  name: string;
  characters: HiraganaChar[];
};

export const HIRAGANA_ROWS: HiraganaRow[] = [
  {
    id: 'vowels',
    name: 'Vowels',
    characters: [
      { kana: 'あ', romaji: 'a', alternates: [] },
      { kana: 'い', romaji: 'i', alternates: [] },
      { kana: 'う', romaji: 'u', alternates: [] },
      { kana: 'え', romaji: 'e', alternates: [] },
      { kana: 'お', romaji: 'o', alternates: [] },
    ],
  },
  {
    id: 'k',
    name: 'K Row',
    characters: [
      { kana: 'か', romaji: 'ka', alternates: [] },
      { kana: 'き', romaji: 'ki', alternates: [] },
      { kana: 'く', romaji: 'ku', alternates: [] },
      { kana: 'け', romaji: 'ke', alternates: [] },
      { kana: 'こ', romaji: 'ko', alternates: [] },
    ],
  },
  {
    id: 's',
    name: 'S Row',
    characters: [
      { kana: 'さ', romaji: 'sa', alternates: [] },
      { kana: 'し', romaji: 'shi', alternates: ['si'] },
      { kana: 'す', romaji: 'su', alternates: [] },
      { kana: 'せ', romaji: 'se', alternates: [] },
      { kana: 'そ', romaji: 'so', alternates: [] },
    ],
  },
  {
    id: 't',
    name: 'T Row',
    characters: [
      { kana: 'た', romaji: 'ta', alternates: [] },
      { kana: 'ち', romaji: 'chi', alternates: ['ti'] },
      { kana: 'つ', romaji: 'tsu', alternates: ['tu'] },
      { kana: 'て', romaji: 'te', alternates: [] },
      { kana: 'と', romaji: 'to', alternates: [] },
    ],
  },
  {
    id: 'n',
    name: 'N Row',
    characters: [
      { kana: 'な', romaji: 'na', alternates: [] },
      { kana: 'に', romaji: 'ni', alternates: [] },
      { kana: 'ぬ', romaji: 'nu', alternates: [] },
      { kana: 'ね', romaji: 'ne', alternates: [] },
      { kana: 'の', romaji: 'no', alternates: [] },
    ],
  },
  {
    id: 'h',
    name: 'H Row',
    characters: [
      { kana: 'は', romaji: 'ha', alternates: [] },
      { kana: 'ひ', romaji: 'hi', alternates: [] },
      { kana: 'ふ', romaji: 'fu', alternates: ['hu'] },
      { kana: 'へ', romaji: 'he', alternates: [] },
      { kana: 'ほ', romaji: 'ho', alternates: [] },
    ],
  },
  {
    id: 'm',
    name: 'M Row',
    characters: [
      { kana: 'ま', romaji: 'ma', alternates: [] },
      { kana: 'み', romaji: 'mi', alternates: [] },
      { kana: 'む', romaji: 'mu', alternates: [] },
      { kana: 'め', romaji: 'me', alternates: [] },
      { kana: 'も', romaji: 'mo', alternates: [] },
    ],
  },
  {
    id: 'y',
    name: 'Y Row',
    characters: [
      { kana: 'や', romaji: 'ya', alternates: [] },
      { kana: 'ゆ', romaji: 'yu', alternates: [] },
      { kana: 'よ', romaji: 'yo', alternates: [] },
    ],
  },
  {
    id: 'r',
    name: 'R Row',
    characters: [
      { kana: 'ら', romaji: 'ra', alternates: [] },
      { kana: 'り', romaji: 'ri', alternates: [] },
      { kana: 'る', romaji: 'ru', alternates: [] },
      { kana: 'れ', romaji: 're', alternates: [] },
      { kana: 'ろ', romaji: 'ro', alternates: [] },
    ],
  },
  {
    id: 'w',
    name: 'W Row',
    characters: [
      { kana: 'わ', romaji: 'wa', alternates: [] },
      { kana: 'を', romaji: 'wo', alternates: [] },
    ],
  },
  {
    id: 'nn',
    name: 'N',
    characters: [{ kana: 'ん', romaji: 'n', alternates: ['nn'] }],
  },
];
