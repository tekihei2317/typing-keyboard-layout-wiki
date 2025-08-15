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

export async function loadWords(filePath: string): Promise<string[]> {
  const xmlContent = await readFile(filePath, "utf-8");
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
