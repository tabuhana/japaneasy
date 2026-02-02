const digraphs: Record<string, string> = {
  きゃ: 'kya',
  きゅ: 'kyu',
  きょ: 'kyo',
  しゃ: 'sha',
  しゅ: 'shu',
  しょ: 'sho',
  ちゃ: 'cha',
  ちゅ: 'chu',
  ちょ: 'cho',
  にゃ: 'nya',
  にゅ: 'nyu',
  にょ: 'nyo',
  ひゃ: 'hya',
  ひゅ: 'hyu',
  ひょ: 'hyo',
  みゃ: 'mya',
  みゅ: 'myu',
  みょ: 'myo',
  りゃ: 'rya',
  りゅ: 'ryu',
  りょ: 'ryo',
  ぎゃ: 'gya',
  ぎゅ: 'gyu',
  ぎょ: 'gyo',
  じゃ: 'ja',
  じゅ: 'ju',
  じょ: 'jo',
  ぢゃ: 'dya',
  ぢゅ: 'dyu',
  ぢょ: 'dyo',
  びゃ: 'bya',
  びゅ: 'byu',
  びょ: 'byo',
  ぴゃ: 'pya',
  ぴゅ: 'pyu',
  ぴょ: 'pyo',
};

const single: Record<string, string> = {
  あ: 'a',
  い: 'i',
  う: 'u',
  え: 'e',
  お: 'o',
  か: 'ka',
  き: 'ki',
  く: 'ku',
  け: 'ke',
  こ: 'ko',
  さ: 'sa',
  し: 'shi',
  す: 'su',
  せ: 'se',
  そ: 'so',
  た: 'ta',
  ち: 'chi',
  つ: 'tsu',
  て: 'te',
  と: 'to',
  な: 'na',
  に: 'ni',
  ぬ: 'nu',
  ね: 'ne',
  の: 'no',
  は: 'ha',
  ひ: 'hi',
  ふ: 'fu',
  へ: 'he',
  ほ: 'ho',
  ま: 'ma',
  み: 'mi',
  む: 'mu',
  め: 'me',
  も: 'mo',
  や: 'ya',
  ゆ: 'yu',
  よ: 'yo',
  ら: 'ra',
  り: 'ri',
  る: 'ru',
  れ: 're',
  ろ: 'ro',
  わ: 'wa',
  ゐ: 'wi',
  ゑ: 'we',
  を: 'wo',
  ん: 'n',
  が: 'ga',
  ぎ: 'gi',
  ぐ: 'gu',
  げ: 'ge',
  ご: 'go',
  ざ: 'za',
  じ: 'ji',
  ず: 'zu',
  ぜ: 'ze',
  ぞ: 'zo',
  だ: 'da',
  ぢ: 'di',
  づ: 'zu',
  で: 'de',
  ど: 'do',
  ば: 'ba',
  び: 'bi',
  ぶ: 'bu',
  べ: 'be',
  ぼ: 'bo',
  ぱ: 'pa',
  ぴ: 'pi',
  ぷ: 'pu',
  ぺ: 'pe',
  ぽ: 'po',
  ゔ: 'vu',
  ー: '-',
}

export const kanaToRomaji = (kana: string): string => {
  // Normalize katakana to hiragana so lookup maps work for both
  const normalized = Array.from(kana).map(toHiragana).join('');

  let result = '';
  let i = 0;

  while (i < normalized.length) {
    // Small tsu (っ) — doubles the next consonant
    if (normalized[i] === 'っ') {
      const next = resolve(normalized, i + 1);
      result += next ? next.romaji[0] : 'tsu';
      i++;
      continue;
    }

    // Try digraph (two-char compound like きゃ)
    if (i + 1 < normalized.length) {
      const pair = normalized[i] + normalized[i + 1];
      if (digraphs[pair]) {
        result += digraphs[pair];
        i += 2;
        continue;
      }
    }

    // Single kana
    if (single[normalized[i]]) {
      result += single[normalized[i]];
      i++;
      continue;
    }

    // Non-kana character (spaces, kanji, punctuation, etc.) — pass through
    result += normalized[i];
    i++;
  }

  return result;
};

/** Convert katakana char to hiragana. Non-katakana chars pass through. */
function toHiragana(char: string): string {
  const code = char.charCodeAt(0);
  // Katakana range U+30A1 (ァ) to U+30F6 (ヶ) — offset from hiragana is 0x60
  if (code >= 0x30a1 && code <= 0x30f6) {
    return String.fromCharCode(code - 0x60);
  }
  // Katakana small tsu ッ (U+30C3) is already covered above, but
  // handle the long vowel mark ー (U+30FC) — already in the single map
  return char;
}

function resolve(
  text: string,
  i: number
): { romaji: string; length: number } | null {
  if (i >= text.length) return null;

  if (i + 1 < text.length) {
    const pair = text[i] + text[i + 1];
    if (digraphs[pair]) return { romaji: digraphs[pair], length: 2 };
  }

  if (single[text[i]]) return { romaji: single[text[i]], length: 1 };

  return null;
}
