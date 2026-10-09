import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const pages = JSON.parse(readFileSync(new URL("pages.json", root), "utf8"));
const html = readFileSync(new URL("dist/index.html", root), "utf8");
for (const page of pages) {
  const destination = new URL(`dist/${page.path}`, root);
  mkdirSync(destination, { recursive: true });
  writeFileSync(
    new URL("index.html", destination),
    html.replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`),
  );
}
writeFileSync(
  new URL("dist/404.html", root),
  html.replace(/<title>.*?<\/title>/, "<title>Page not found — Marquee UI</title>"),
);
