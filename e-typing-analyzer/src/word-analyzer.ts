import { loadWords } from "./word-file";
import { convertKanaToShortestRoman } from "./roman-input";

export interface WordAnalysis {
  wordCount: number;
  averageRomanLength: number;
  expectedTrialLength: number;
  firstCharFrequency: Record<string, number>;
  firstCharPercentage: Record<string, number>;
}

export interface KeyboardLayout {
  [key: string]: {
    row: number;
    col: number;
    finger: string;
  };
}

export const qwertyLayout: KeyboardLayout = {
  q: { row: 1, col: 0, finger: "left-pinky" },
  w: { row: 1, col: 1, finger: "left-ring" },
  e: { row: 1, col: 2, finger: "left-middle" },
  r: { row: 1, col: 3, finger: "left-index" },
  t: { row: 1, col: 4, finger: "left-index" },
  y: { row: 1, col: 5, finger: "right-index" },
  u: { row: 1, col: 6, finger: "right-index" },
  i: { row: 1, col: 7, finger: "right-middle" },
  o: { row: 1, col: 8, finger: "right-ring" },
  p: { row: 1, col: 9, finger: "right-pinky" },
  a: { row: 2, col: 0, finger: "left-pinky" },
  s: { row: 2, col: 1, finger: "left-ring" },
  d: { row: 2, col: 2, finger: "left-middle" },
  f: { row: 2, col: 3, finger: "left-index" },
  g: { row: 2, col: 4, finger: "left-index" },
  h: { row: 2, col: 5, finger: "right-index" },
  j: { row: 2, col: 6, finger: "right-index" },
  k: { row: 2, col: 7, finger: "right-middle" },
  l: { row: 2, col: 8, finger: "right-ring" },
  z: { row: 3, col: 0, finger: "left-pinky" },
  x: { row: 3, col: 1, finger: "left-ring" },
  c: { row: 3, col: 2, finger: "left-middle" },
  v: { row: 3, col: 3, finger: "left-index" },
  b: { row: 3, col: 4, finger: "left-index" },
  n: { row: 3, col: 5, finger: "right-index" },
  m: { row: 3, col: 6, finger: "right-index" },
};

export function analyzeWords(words: string[]): WordAnalysis {
  const romanWords = words.map((word) => convertKanaToShortestRoman(word));
  const wordCount = words.length;

  const totalRomanLength = romanWords.reduce(
    (sum, roman) => sum + roman.length,
    0
  );
  const averageRomanLength = totalRomanLength / wordCount;
  const expectedTrialLength = averageRomanLength * 15;

  const firstCharFrequency: Record<string, number> = {};
  romanWords.forEach((roman) => {
    const firstChar = roman[0]?.toLowerCase();
    if (firstChar) {
      firstCharFrequency[firstChar] = (firstCharFrequency[firstChar] || 0) + 1;
    }
  });

  const firstCharPercentage: Record<string, number> = {};
  Object.entries(firstCharFrequency).forEach(([char, count]) => {
    firstCharPercentage[char] = (count / wordCount) * 100;
  });

  return {
    wordCount,
    averageRomanLength,
    expectedTrialLength,
    firstCharFrequency,
    firstCharPercentage,
  };
}

export async function loadAndAnalyzeWords(
  fileName: string
): Promise<WordAnalysis> {
  const words = await loadWords(fileName);
  return analyzeWords(words);
}

export function getKeyboardVisualizationData(analysis: WordAnalysis) {
  const keyboardData: Array<{
    key: string;
    percentage: number;
    row: number;
    col: number;
    finger: string;
  }> = [];

  Object.entries(analysis.firstCharPercentage).forEach(([char, percentage]) => {
    const keyInfo = qwertyLayout[char];
    if (keyInfo) {
      keyboardData.push({
        key: char,
        percentage,
        ...keyInfo,
      });
    }
  });

  return keyboardData.sort((a, b) => b.percentage - a.percentage);
}
