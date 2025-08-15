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
    displayError(
      `読み込みエラー: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
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
  if (avgLengthEl)
    avgLengthEl.textContent = analysis.averageRomanLength.toFixed(1);
  if (trialLengthEl)
    trialLengthEl.textContent = analysis.expectedTrialLength.toFixed(1);

  const keyboardDiv = document.getElementById("keyboard");
  if (!keyboardDiv) return;

  // Clear existing keys but keep row structure
  const rows = keyboardDiv.querySelectorAll(".keyboard-row");
  rows.forEach((row) => (row.innerHTML = ""));

  const keyDataMap = new Map(
    analysis.keyboardData.map((item) => [item.key, item])
  );

  qwertyKeys.forEach((row, rowIndex) => {
    const rowElement = keyboardDiv.querySelector(
      `[data-row="${rowIndex}"]`
    ) as HTMLElement;
    if (!rowElement) {
      console.error(`Row element not found for row ${rowIndex}`);
      return;
    }

    row.forEach((key) => {
      const keyElement = document.createElement("div");
      keyElement.className = "key";
      keyElement.textContent = key.toUpperCase();

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
        const intensity = keyData.percentage / maxPercentage;

        // Use HSL color with much wider contrast range
        // Blue hue (220°), dramatic variation in saturation and lightness
        const saturation = 40 + intensity * 60; // 40% to 100% (wider range)
        const lightness = 85 - intensity * 60; // 85% to 25% (much wider range)

        keyElement.style.backgroundColor = `hsl(220, ${saturation}%, ${lightness}%)`;
        keyElement.style.color = intensity > 0.4 ? "white" : "#333";
      }

      rowElement.appendChild(keyElement);
    });
  });

  const resultsDiv = document.getElementById("results");
  if (resultsDiv) resultsDiv.style.display = "block";
}

document.addEventListener("DOMContentLoaded", loadAnalysis);
