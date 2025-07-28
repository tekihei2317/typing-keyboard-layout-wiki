import { readFile } from "fs/promises";
import { parseString } from "xml2js";

// 単打で打てる文字
const singleStrokeChars = new Set([
  "ゅ",
  "こ",
  "と",
  "さ",
  "ゃ",
  "た",
  "か",
  "、",
  "て",
  "は",
  "ょ",
  "に",
  "な",
  "る",
  "も",
  "わ",
  "き",
  "し",
  "く",
  "ち",
  "の",
  "い",
  "。",
  "う",
  "ん",
  "つ",
  "す",
  "お",
  "あ",
  "っ",
]);

// 小書き文字
const smallKanaChars = new Set([
  "ゃ",
  "ゅ",
  "ょ",
  "ぁ",
  "ぃ",
  "ぅ",
  "ぇ",
  "ぉ",
]);

async function loadWords(): Promise<string[]> {
  const xmlContent = await readFile("words/word4jp.xml", "utf-8");
  const data = await new Promise<any>((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

  const words: string[] = [];
  for (const part of data.Words.Part) {
    for (const word of part.Word) {
      if (word.Characters && word.Characters[0]) {
        words.push(word.Characters[0]);
      }
    }
  }
  return words;
}

function calculateStrokes(word: string): {
  strokes: number;
  kanaCount: number;
} {
  const chars = Array.from(word);
  let strokes = 0;
  let kanaCount = 0;
  let i = 0;

  while (i < chars.length) {
    const char = chars[i];
    const nextChar = chars[i + 1];

    // かな文字でない場合はスキップ（アルファベット・数字・記号など）
    if (!/[あ-んア-ン、。ー]/.test(char)) {
      i++;
      continue;
    }

    // 次の文字が小書きかなの場合は2文字で2打鍵、2かな
    if (nextChar && smallKanaChars.has(nextChar)) {
      strokes += 2;
      kanaCount += 2; // 「ふぁ」= 2かな
      i += 2;
    } else {
      // 単独の文字
      if (singleStrokeChars.has(char)) {
        strokes += 1; // 単打
      } else {
        strokes += 2; // 2打鍵
      }
      kanaCount += 1;
      i += 1;
    }
  }

  return { strokes, kanaCount };
}

async function main() {
  console.log("ワードデータを読み込み中...");
  const words = await loadWords();

  let totalStrokes = 0;
  let totalKanaCount = 0;
  let singleStrokeCount = 0;
  let doubleStrokeCount = 0;
  let comboCount = 0;

  console.log("打鍵効率を計算中...");

  for (const word of words) {
    const { strokes, kanaCount } = calculateStrokes(word);
    totalStrokes += strokes;
    totalKanaCount += kanaCount;

    // 詳細統計
    const chars = Array.from(word);
    let i = 0;
    while (i < chars.length) {
      const char = chars[i];
      const nextChar = chars[i + 1];

      if (!/[あ-んア-ン、。ー]/.test(char)) {
        i++;
        continue;
      }

      if (nextChar && smallKanaChars.has(nextChar)) {
        comboCount += 2; // 2かなとしてカウント
        i += 2;
      } else {
        if (singleStrokeChars.has(char)) {
          singleStrokeCount++;
        } else {
          doubleStrokeCount++;
        }
        i++;
      }
    }
  }

  console.log("\n=== ブリ中トロ配列 打鍵効率 ===");
  console.log(`総ワード数: ${words.length}`);
  console.log(`総かな文字数: ${totalKanaCount}`);
  console.log(`総ストローク数: ${totalStrokes}`);
  console.log(
    `平均打鍵効率: ${(totalStrokes / totalKanaCount).toFixed(
      3
    )} ストローク/かな`
  );

  console.log("\n=== 詳細統計 ===");
  console.log(
    `単打: ${singleStrokeCount} (${(
      (singleStrokeCount / totalKanaCount) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `2打鍵: ${doubleStrokeCount} (${(
      (doubleStrokeCount / totalKanaCount) *
      100
    ).toFixed(1)}%)`
  );
  console.log(
    `小書き組み合わせ: ${comboCount} (${(
      (comboCount / totalKanaCount) *
      100
    ).toFixed(1)}%)`
  );

  console.log("\n=== 他配列との比較 ===");
  const v1Efficiency = 1.325;
  const improvement = v1Efficiency - totalStrokes / totalKanaCount;
  console.log(
    `romantable-v1との差: ${improvement.toFixed(3)} ストローク/かな改善`
  );
  console.log(`改善率: ${((improvement / v1Efficiency) * 100).toFixed(1)}%`);
}

main();
