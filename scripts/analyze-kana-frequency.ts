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

async function parseXML(xmlContent: string): Promise<WordsData> {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

function extractKanaCharacters(text: string): string[] {
  // ひらがな・カタカナ・記号（句読点、長音）のみを抽出
  return text.match(/[ぁ-んァ-ンー、。]/g) || [];
}

function countKanaFrequency(words: string[]): Map<string, number> {
  const frequency = new Map<string, number>();

  for (const word of words) {
    const kanaChars = extractKanaCharacters(word);
    for (const char of kanaChars) {
      frequency.set(char, (frequency.get(char) || 0) + 1);
    }
  }

  return frequency;
}

async function main() {
  try {
    const xmlContent = await readFile("words/word4jp.xml", "utf-8");
    const data = await parseXML(xmlContent);

    const allWords: string[] = [];

    // XMLからワードを抽出
    for (const part of data.Words.Part) {
      for (const word of part.Word) {
        if (word.Characters && word.Characters[0]) {
          allWords.push(word.Characters[0]);
        }
      }
    }

    console.log(`総ワード数: ${allWords.length}`);

    // かなの頻度を計算
    const frequency = countKanaFrequency(allWords);

    // 頻度順にソート
    const sortedFrequency = Array.from(frequency.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    console.log("\n=== かな文字の出現頻度 ===");
    console.log("文字\t頻度\t割合(%)");

    const totalCount = Array.from(frequency.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    for (const [char, count] of sortedFrequency) {
      const percentage = ((count / totalCount) * 100).toFixed(2);
      console.log(`${char}\t${count}\t${percentage}`);
    }

    console.log(`\n総かな文字数: ${totalCount}`);
  } catch (error) {
    console.error("エラー:", error);
  }
}

main();
