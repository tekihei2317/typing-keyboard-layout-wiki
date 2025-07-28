import { readFile } from "fs/promises";
import { parseString } from "xml2js";

interface Word {
  Display: string[];
  Characters: string[];
}

interface WordsData {
  Words: {
    Part: Array<{
      Word: Word[];
    }>;
  };
}

interface KanaFrequency {
  char: string;
  frequency: number;
  percentage: number;
}

async function parseXML(xmlContent: string): Promise<WordsData> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

async function loadWords(): Promise<string[]> {
  const xmlContent = await readFile("words/word4jp.xml", "utf-8");
  const data = await parseXML(xmlContent);

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

function extractKanaChars(text: string): string[] {
  return text.match(/[あ-んア-ン、。ー]/g) || [];
}

function calculateKanaFrequency(words: string[]): KanaFrequency[] {
  const frequencyMap = new Map<string, number>();

  for (const word of words) {
    const kanaChars = extractKanaChars(word);
    for (const char of kanaChars) {
      frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
    }
  }

  const totalCount = Array.from(frequencyMap.values()).reduce(
    (sum, count) => sum + count,
    0
  );

  return Array.from(frequencyMap.entries())
    .map(([char, frequency]) => ({
      char,
      frequency,
      percentage: (frequency / totalCount) * 100,
    }))
    .sort((a, b) => b.frequency - a.frequency);
}

async function main() {
  try {
    console.log("ワードデータを読み込み中...");
    const words = await loadWords();
    console.log(`総ワード数: ${words.length}`);

    console.log("かな文字の頻度を計算中...");
    const kanaFrequency = calculateKanaFrequency(words);

    const totalKanaChars = kanaFrequency.reduce(
      (sum, item) => sum + item.frequency,
      0
    );

    console.log(`総かな文字数: ${totalKanaChars}`);
    console.log(`ユニークなかな文字数: ${kanaFrequency.length}`);

    // 28文字単打の場合の理論最適効率を計算
    const singleStrokeChars = kanaFrequency.slice(0, 28);
    const doubleStrokeChars = kanaFrequency.slice(28);

    const singleStrokeCount = singleStrokeChars.reduce(
      (sum, item) => sum + item.frequency,
      0
    );
    const doubleStrokeCount = doubleStrokeChars.reduce(
      (sum, item) => sum + item.frequency,
      0
    );

    const totalStrokes = singleStrokeCount * 1 + doubleStrokeCount * 2;
    const theoreticalEfficiency = totalStrokes / totalKanaChars;

    console.log("\n=== 28文字単打の理論最適効率 ===");
    console.log(`上位28文字の出現回数: ${singleStrokeCount}`);
    console.log(`残り${doubleStrokeChars.length}文字の出現回数: ${doubleStrokeCount}`);
    console.log(`単打率: ${((singleStrokeCount / totalKanaChars) * 100).toFixed(1)}%`);
    console.log(`2打鍵率: ${((doubleStrokeCount / totalKanaChars) * 100).toFixed(1)}%`);
    console.log(`理論最適効率: ${theoreticalEfficiency.toFixed(3)} ストローク/かな`);

    console.log("\n=== 上位28文字 ===");
    singleStrokeChars.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.char}: ${item.frequency}回 (${item.percentage.toFixed(2)}%)`
      );
    });

    console.log("\n=== 現在の配列との比較 ===");
    const currentEfficiency = 1.327; // 前回の計算結果
    const improvement = currentEfficiency - theoreticalEfficiency;
    console.log(`現在の効率: ${currentEfficiency.toFixed(3)} ストローク/かな`);
    console.log(`理論最適効率: ${theoreticalEfficiency.toFixed(3)} ストローク/かな`);
    console.log(`改善可能性: ${improvement.toFixed(3)} ストローク/かな`);
    console.log(`改善率: ${((improvement / currentEfficiency) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error("エラー:", error);
    process.exit(1);
  }
}

main();