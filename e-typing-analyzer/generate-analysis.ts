import {
  loadAndAnalyzeWords,
  getKeyboardVisualizationData,
} from "./src/word-analyzer";

async function generateAnalysis() {
  try {
    const analysis = await loadAndAnalyzeWords(
      "../words/e-typing/夏のおやつ.xml"
    );
    const keyboardData = getKeyboardVisualizationData(analysis);

    const result = {
      ...analysis,
      keyboardData,
    };

    await Bun.write(
      "data/analysis-results.json",
      JSON.stringify(result, null, 2)
    );

    console.log("✅ Analysis generated: data/analysis-results.json");
    console.log(
      `📊 ${
        analysis.wordCount
      } words, avg ${analysis.averageRomanLength.toFixed(1)} chars`
    );
  } catch (error) {
    console.error("❌ Generation failed:", error);
  }
}

generateAnalysis();
