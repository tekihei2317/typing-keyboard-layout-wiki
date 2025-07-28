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

    // 26文字単打 + 「、」「。」固定の場合の理論最適効率を計算
    const punctuationChars = kanaFrequency.filter(item => ['、', '。'].includes(item.char));
    const otherChars = kanaFrequency.filter(item => !['、', '。'].includes(item.char));
    
    const singleStrokeChars = otherChars.slice(0, 26);
    const doubleStrokeChars = otherChars.slice(26);

    const punctuationCount = punctuationChars.reduce((sum, item) => sum + item.frequency, 0);
    const singleStrokeCount = singleStrokeChars.reduce((sum, item) => sum + item.frequency, 0);
    const doubleStrokeCount = doubleStrokeChars.reduce((sum, item) => sum + item.frequency, 0);

    const totalStrokes = punctuationCount * 1 + singleStrokeCount * 1 + doubleStrokeCount * 2;
    const theoreticalEfficiency = totalStrokes / totalKanaChars;

    console.log("\n=== 26文字単打 + 句読点固定の理論最適効率 ===");
    console.log(`句読点文字数: ${punctuationCount} (固定配置: 「、」「。」)`);
    console.log(`上位26文字の出現回数: ${singleStrokeCount}`);
    console.log(`残り${doubleStrokeChars.length}文字の出現回数: ${doubleStrokeCount}`);
    
    const totalSingleStroke = punctuationCount + singleStrokeCount;
    console.log(`実質単打率: ${((totalSingleStroke / totalKanaChars) * 100).toFixed(1)}%`);
    console.log(`2打鍵率: ${((doubleStrokeCount / totalKanaChars) * 100).toFixed(1)}%`);
    console.log(`理論最適効率: ${theoreticalEfficiency.toFixed(3)} ストローク/かな`);

    console.log("\n=== 上位26文字（句読点除く） ===");
    singleStrokeChars.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.char}: ${item.frequency}回 (${item.percentage.toFixed(2)}%)`
      );
    });

    console.log("\n=== 2打鍵になる文字（上位5文字） ===");
    doubleStrokeChars.slice(0, 5).forEach((item, index) => {
      console.log(
        `${index + 27}. ${item.char}: ${item.frequency}回 (${item.percentage.toFixed(2)}%)`
      );
    });

    console.log("\n=== 句読点の頻度 ===");
    punctuationChars.forEach((item) => {
      console.log(`${item.char}: ${item.frequency}回 (${item.percentage.toFixed(2)}%)`);
    });

  } catch (error) {
    console.error("エラー:", error);
    process.exit(1);
  }
}

main();