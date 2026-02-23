#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, v] = a.split("=");
  return [k.replace(/^--/, ""), v];
}));

const name = args.name;
if (!name) {
  console.error("Usage: node scripts/scaffold-ts.mjs --name=my-policy");
  process.exit(1);
}

const kebab = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const pascal = kebab.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join("");
const camel = pascal[0].toLowerCase() + pascal.slice(1);

function apply(tpl) {
  return tpl
    .replaceAll("{{NAME_KEBAB}}", kebab)
    .replaceAll("{{NAME_PASCAL}}", pascal)
    .replaceAll("{{NAME_CAMEL}}", camel);
}

const root = process.cwd();
const srcDir = path.join(root, "src", "policies");
const testDir = path.join(root, "test");
fs.mkdirSync(srcDir, { recursive: true });
fs.mkdirSync(testDir, { recursive: true });

const srcTpl = fs.readFileSync(path.join(root, "templates", "policy", "policy.ts.tpl"), "utf8");
const testTpl = fs.readFileSync(path.join(root, "templates", "policy", "policy.spec.ts.tpl"), "utf8");

const srcPath = path.join(srcDir, `${kebab}.ts`);
const testPath = path.join(testDir, `${kebab}.spec.ts`);

if (!fs.existsSync(srcPath)) fs.writeFileSync(srcPath, apply(srcTpl));
if (!fs.existsSync(testPath)) fs.writeFileSync(testPath, apply(testTpl));

console.log(`Scaffolded ${srcPath}`);
console.log(`Scaffolded ${testPath}`);
