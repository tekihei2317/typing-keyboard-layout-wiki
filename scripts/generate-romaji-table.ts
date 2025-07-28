import { readFile } from "fs/promises";

interface KanaFrequency {
  char: string;
  frequency: number;
  percentage: number;
}

const KANA_CHARS = [
  // 清音 (46文字)
  "あ",
  "い",
  "う",
  "え",
  "お",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "は",
  "ひ",
  "ふ",
  "へ",
  "ほ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "や",
  "ゆ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "わ",
  "を",
  "ん",

  // 濁音 (26文字)
  "が",
  "ぎ",
  "ぐ",
  "げ",
  "ご",
  "ざ",
  "じ",
  "ず",
  "ぜ",
  "ぞ",
  "だ",
  "ぢ",
  "づ",
  "で",
  "ど",
  "ば",
  "び",
  "ぶ",
  "べ",
  "ぼ",
  "ぱ",
  "ぴ",
  "ぷ",
  "ぺ",
  "ぽ",
  "ゔ",

  // 小書き (9文字)
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
  "ゃ",
  "ゅ",
  "ょ",
  "っ",

  // 記号 (3文字)
  "、",
  "。",
  "ー",
];

async function readKeyLayout(): Promise<string[]> {
  const content = await readFile("layouts/romantable-sketch.txt", "utf-8");
  return content
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
}

async function buildFrequencyMap(): Promise<Map<string, number>> {
  const content = await readFile("data/kana-frequency-wt-word4.tsv", "utf-8");
  const lines = content.trim().split("\n").slice(1);
  const frequencyMap = new Map<string, number>();

  lines
    .filter((line) => line.trim() !== "")
    .forEach((line) => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const char = parts[0]?.trim();
        const frequencyStr = parts[1]?.trim();
        if (!char || !frequencyStr) return;

        const frequency = parseInt(frequencyStr);
        if (!isNaN(frequency)) {
          frequencyMap.set(char, frequency);
        }
      }
    });

  return frequencyMap;
}

function createKanaFrequencyList(
  frequencyMap: Map<string, number>
): Omit<KanaFrequency, "percentage">[] {
  return KANA_CHARS.map((char) => ({
    char,
    frequency: frequencyMap.get(char) || 0,
  })).sort((a, b) => b.frequency - a.frequency);
}

async function main() {
  try {
    const keys = await readKeyLayout();
    const frequencyMap = await buildFrequencyMap();
    const kanaData = createKanaFrequencyList(frequencyMap);

    // 固定配置
    const fixedMapping = new Map<string, string>([
      ["e", "、"],
      ["i", "。"],
    ]);

    // 残りの文字（固定配置以外）
    const remainingKana = kanaData.filter(
      (item) => !["、", "。"].includes(item.char)
    );
    const remainingKeys = keys.filter((key) => !fixedMapping.has(key));

    // 固定配置を出力
    for (const [key, char] of fixedMapping) {
      console.log(`${key}\t${char}`);
    }

    // 残りを頻度順に配置
    for (
      let i = 0;
      i < Math.min(remainingKeys.length, remainingKana.length);
      i++
    ) {
      const key = remainingKeys[i];
      const kana = remainingKana[i];
      if (key && kana) {
        console.log(`${key}\t${kana.char}`);
      }
    }
  } catch (error) {
    console.error("エラー:", error);
    process.exit(1);
  }
}

main();
