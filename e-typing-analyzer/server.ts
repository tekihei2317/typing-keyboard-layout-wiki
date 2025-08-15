import indexHtml from "./index.html";

Bun.serve({
  routes: {
    "/": indexHtml,
    "/data/analysis-results.json": async () => {
      return new Response(await Bun.file("data/analysis-results.json").text(), {
        headers: { "Content-Type": "application/json" }
      });
    }
  },
  development: {
    hmr: true,
    console: true,
  },
  port: 3000,
});

console.log("🚀 Server running at http://localhost:3000");
console.log("📊 E-typing Word Analysis Tool");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");