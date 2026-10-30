#!/usr/bin/env node
// Builds llms-full.txt: every public page as plain Markdown, in sitemap order (home excluded).
// Run from the site root: node scripts/build-llms-full.mjs
import { readFileSync, writeFileSync } from "node:fs";

const base = "https://clientlens.co";
const paths = [...readFileSync("sitemap.xml", "utf8").matchAll(/<loc>https:\/\/clientlens\.co(\/[^<]*)<\/loc>/g)]
  .map((m) => m[1]).filter((p) => p !== "/");

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const inline = (h) => decode(h
  .replace(/<(b|strong)>([\s\S]*?)<\/\1>/g, "**$2**")
  .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, t) => `[${t}](${href.startsWith("/") ? base + href : href})`)
  .replace(/<[^>]+>/g, "")
  .replace(/\s+/g, " ").trim());

// Split HTML into its top-level elements (depth tracking; void tags ignored).
function topLevel(html) {
  const out = []; let depth = 0, start = -1;
  const re = /<\/?([a-zA-Z0-9]+)[^>]*?\/?>/g; let m;
  const voids = new Set(["img", "br", "meta", "link", "input", "hr"]);
  while ((m = re.exec(html))) {
    const closing = m[0].startsWith("</"), self = m[0].endsWith("/>") || voids.has(m[1].toLowerCase());
    if (!closing && !self) { if (depth === 0) start = m.index; depth++; }
    else if (closing) { depth--; if (depth === 0) { out.push(html.slice(start, m.index + m[0].length)); start = -1; } }
  }
  return out;
}
const innerOf = (el) => el.replace(/^<[^>]+>/, "").replace(/<\/[^>]+>\s*$/, "");
const tagOf = (el) => el.match(/^<([a-zA-Z0-9]+)/)[1].toLowerCase();
const classOf = (el) => (el.match(/^<[^>]*class="([^"]*)"/) || [])[1] || "";

function list(el, indent = "") {
  const lines = [];
  for (const li of topLevel(innerOf(el))) {
    if (tagOf(li) !== "li") continue;
    const inner = innerOf(li);
    const parts = topLevel(inner).filter((c) => ["ul", "ol"].includes(tagOf(c)));
    let text = inner; for (const p of parts) text = text.replace(p, "");
    lines.push(indent + "- " + inline(text));
    for (const p of parts) lines.push(...list(p, indent + "  "));
  }
  return lines;
}

function block(el, out) {
  const tag = tagOf(el), cls = classOf(el), inner = innerOf(el);
  if (tag === "h1") out.push("# " + inline(inner), "");
  else if (tag === "h2") out.push("## " + inline(inner), "");
  else if (tag === "h3") out.push("### " + inline(inner), "");
  else if (tag === "p") { const s = inline(inner); if (s) out.push(s, ""); }
  else if (tag === "ol" || tag === "ul") out.push(...list(el), "");
  else if (tag === "table") { for (const m of inner.matchAll(/<tr>\s*<t[dh]>([\s\S]*?)<\/t[dh]>\s*<t[dh]>([\s\S]*?)<\/t[dh]>\s*<\/tr>/g)) out.push("- " + inline(m[1]) + ": " + inline(m[2])); out.push(""); }
  else if (tag === "div" && cls.includes("promise")) { const s = inner.match(/<strong>([\s\S]*?)<\/strong>([\s\S]*)/); out.push("**" + inline(s[1]) + "**", inline(s[2]), ""); }
  else if (tag === "div" && cls.includes("faq")) { for (const d of topLevel(inner)) { const m = innerOf(d).match(/<summary>([\s\S]*?)<\/summary>([\s\S]*)/); out.push("**" + inline(m[1]) + "** " + inline(m[2]), ""); } }
  else if (tag === "div" && (cls.includes("features") || cls.includes("price"))) { for (const d of topLevel(inner)) { const m = innerOf(d).match(/<b>([\s\S]*?)<\/b>([\s\S]*)/); out.push("**" + inline(m[1]).replace(/\.$/, "") + ".** " + inline(m[2]), ""); } }
  else if (tag === "div" && cls.includes("stores")) { for (const s of topLevel(inner)) out.push(inline(innerOf(s))); out.push(""); }
  else if (tag === "div") { for (const c of topLevel(inner)) block(c, out); }
}

function toMarkdown(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
  const out = [];
  for (const el of topLevel(main)) block(el, out);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

let doc = `# ClientLens, full text\n\n> Plain-text copy of clientlens.co for AI assistants. ClientLens is an independent app studio. Contact: support@clientlens.co\n\n`;
for (const p of paths) {
  const html = readFileSync("." + p + "index.html", "utf8");
  doc += `\n---\n\nSource: ${base}${p}\n\n${toMarkdown(html)}\n`;
}
writeFileSync("llms-full.txt", doc);
console.log(`llms-full.txt: ${paths.length} pages, ${doc.length} chars`);
