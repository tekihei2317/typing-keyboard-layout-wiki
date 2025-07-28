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

async function createKanaToKeyMap(): Promise<Map<string, string>> {
  const content = await readFile("layouts/romantable-v1.txt", "utf-8");
  const lines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");

  const kanaToKeyMap = new Map<string, string>();

  for (const line of lines) {
    const [key, kana] = line.split("\t");
    if (key && kana) {
      kanaToKeyMap.set(kana.trim(), key.trim());
    }
  }

  return kanaToKeyMap;
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

function calculateKeystrokes(
  word: string,
  kanaToKeyMap: Map<string, string>
): number {
  let totalStrokes = 0;
  let unmappedChars: string[] = [];

  for (const char of word) {
    const key = kanaToKeyMap.get(char);
    if (key) {
      totalStrokes += key.length; // キーの文字数 = ストローク数
    } else {
      unmappedChars.push(char);
    }
  }

  if (unmappedChars.length > 0) {
    console.warn(`未対応文字: ${unmappedChars.join(", ")} (ワード: ${word})`);
  }

  return totalStrokes;
}

function extractKanaChars(text: string): string[] {
  return text.match(/[あ-んア-ン、。ー]/g) || [];
}

async function main() {
  try {
    console.log("キーマップを読み込み中...");
    const kanaToKeyMap = await createKanaToKeyMap();
    console.log(`キーマップ: ${kanaToKeyMap.size}文字`);

    console.log("ワードデータを読み込み中...");
    const words = await loadWords();
    console.log(`総ワード数: ${words.length}`);

    let totalStrokes = 0;
    let totalKanaChars = 0;
    let processedWords = 0;
    let singleStrokeCount = 0;
    let doubleStrokeCount = 0;

    console.log("打鍵効率を計算中...");

    for (const word of words) {
      const kanaChars = extractKanaChars(word);
      const strokes = calculateKeystrokes(word, kanaToKeyMap);

      totalStrokes += strokes;
      totalKanaChars += kanaChars.length;

      // 単打・2打鍵の統計
      for (const char of kanaChars) {
        const key = kanaToKeyMap.get(char);
        if (key) {
          if (key.length === 1) {
            singleStrokeCount++;
          } else if (key.length === 2) {
            doubleStrokeCount++;
          }
        }
      }

      processedWords++;

      if (processedWords % 500 === 0) {
        console.log(`処理中... ${processedWords}/${words.length} ワード`);
      }
    }

    // 結果出力
    console.log("\n=== 打鍵効率計算結果 ===");
    console.log(`総ワード数: ${words.length}`);
    console.log(`総かな文字数: ${totalKanaChars}`);
    console.log(`総ストローク数: ${totalStrokes}`);
    console.log(
      `平均打鍵効率: ${(totalStrokes / totalKanaChars).toFixed(
        3
      )} ストローク/かな`
    );

    console.log("\n=== 詳細統計 ===");
    console.log(
      `単打文字数: ${singleStrokeCount} (${(
        (singleStrokeCount / totalKanaChars) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `2打鍵文字数: ${doubleStrokeCount} (${(
        (doubleStrokeCount / totalKanaChars) *
        100
      ).toFixed(1)}%)`
    );

    const mappedChars = singleStrokeCount + doubleStrokeCount;
    const unmappedChars = totalKanaChars - mappedChars;
    if (unmappedChars > 0) {
      console.log(
        `未対応文字数: ${unmappedChars} (${(
          (unmappedChars / totalKanaChars) *
          100
        ).toFixed(1)}%)`
      );
    }
  } catch (error) {
    console.error("エラー:", error);
    process.exit(1);
  }
}

main();
