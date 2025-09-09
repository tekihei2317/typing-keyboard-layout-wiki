function assertDefined<T>(
  value: T | undefined,
  message?: string
): asserts value is T {
  if (value === undefined) {
    throw new Error(message || "Value is undefined");
  }
}

const kanaToRoman: Record<string, string> = {
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "si",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "ti",
  つ: "tu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ー: "-",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "zi",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "di",
  づ: "du",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  // 数字
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  // 記号,
  "、": ",",
  "/": "/",
};

const youonMap: Record<string, string> = {
  // 拗音
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sya",
  しゅ: "syu",
  しょ: "syo",
  ちゃ: "tya",
  ちゅ: "tyu",
  ちょ: "tyo",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  // 濁音の拗音
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  ぢゃ: "dya",
  ぢゅ: "dyu",
  ぢょ: "dyo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  // 外来音
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
  てぃ: "thi",
  てぇ: "the",
  とぅ: "twu",
  でぃ: "dhi",
  でぇ: "dhe",
  どぅ: "dwu",
  しぇ: "she",
  じぇ: "je",
  ちぇ: "che",
  つぁ: "tsa",
  つぃ: "tsi",
  つぇ: "tse",
  つぉ: "tso",
  ゔぁ: "va",
  ゔぃ: "vi",
  ゔ: "vu",
  ゔぇ: "ve",
  ゔぉ: "vo",
  うぃ: "wi",
  うぇ: "we",
  うぉ: "wo",
};

export function convertKanaToShortestRoman(kana: string): string {
  let result = "";

  for (let i = 0; i < kana.length; i++) {
    const char = kana[i];

    if (i < kana.length - 1) {
      const nextChar = kana[i + 1];
      assertDefined(nextChar);

      const twoChar = char + nextChar;
      if (youonMap[twoChar]) {
        result += youonMap[twoChar];
        i++;
        continue;
      }
    }

    if (char === "ん") {
      if (i === kana.length - 1) {
        result += "nn";
      } else {
        const nextChar = kana[i + 1];
        assertDefined(nextChar);

        if ("あいうえおなにぬねの".includes(nextChar)) {
          result += "nn";
        } else {
          result += "n";
        }
      }
    } else if (char === "っ") {
      if (i < kana.length - 1) {
        const nextChar = kana[i + 1];
        assertDefined(nextChar);

        const nextRoman = kanaToRoman[nextChar];
        if (nextRoman) {
          result += nextRoman[0];
        }
      }
    } else {
      assertDefined(char, "Current character is undefined");
      const roman = kanaToRoman[char];
      if (roman) {
        result += roman;
      } else {
        throw new Error(`Cannot convert kana character: ${char}`);
      }
    }
  }

  return result;
}
