interface KeyboardData {
  key: string;
  percentage: number;
  row: number;
  col: number;
  finger: string;
}

interface AnalysisResult {
  wordCount: number;
  averageRomanLength: number;
  expectedTrialLength: number;
  firstCharFrequency: Record<string, number>;
  firstCharPercentage: Record<string, number>;
  keyboardData: KeyboardData[];
}

const qwertyKeys = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

async function loadAnalysis(): Promise<void> {
  try {
    const response = await fetch("data/analysis-results.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const analysis: AnalysisResult = await response.json();
    displayResults(analysis);
  } catch (error) {
    displayError(`読み込みエラー: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function displayError(message: string): void {
  const errorDiv = document.getElementById("error");
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
  }
}

function displayResults(analysis: AnalysisResult): void {
  const wordCountEl = document.getElementById("word-count");
  const avgLengthEl = document.getElementById("avg-length");
  const trialLengthEl = document.getElementById("trial-length");
  
  if (wordCountEl) wordCountEl.textContent = analysis.wordCount.toString();
  if (avgLengthEl) avgLengthEl.textContent = analysis.averageRomanLength.toFixed(1);
  if (trialLengthEl) trialLengthEl.textContent = analysis.expectedTrialLength.toFixed(1);

  const keyboardDiv = document.getElementById("keyboard");
  if (!keyboardDiv) return;
  
  keyboardDiv.innerHTML = "";

  const keyDataMap = new Map(
    analysis.keyboardData.map((item) => [item.key, item])
  );

  qwertyKeys.forEach((row, rowIndex) => {
    row.forEach((key, colIndex) => {
      const keyElement = document.createElement("div");
      keyElement.className = `key row-${rowIndex + 1}`;
      keyElement.textContent = key.toUpperCase();
      keyElement.style.gridColumn = `${colIndex + 1}`;
      keyElement.style.gridRow = `${rowIndex + 1}`;

      const keyData = keyDataMap.get(key);
      if (keyData && keyData.percentage > 0) {
        keyElement.classList.add("active");

        const percentageSpan = document.createElement("span");
        percentageSpan.className = "key-percentage";
        percentageSpan.textContent = `${keyData.percentage.toFixed(1)}%`;
        keyElement.appendChild(percentageSpan);

        const maxPercentage = Math.max(
          ...analysis.keyboardData.map((d) => d.percentage)
        );
        const opacity = 0.3 + (keyData.percentage / maxPercentage) * 0.7;
        keyElement.style.opacity = opacity.toString();
      }

      keyboardDiv.appendChild(keyElement);
    });
  });

  const resultsDiv = document.getElementById("results");
  if (resultsDiv) resultsDiv.style.display = "block";
}

document.addEventListener("DOMContentLoaded", loadAnalysis);