#!/usr/bin/env node
/* 词库统计报告：生成 Markdown 摘要，供 GitHub Actions 写入 Job Summary，也可本地查看
 * 用法：
 *   node tools/dict_report.js                 输出到 stdout
 *   node tools/dict_report.js --out report.md  写入文件
 *   node tools/dict_report.js --json           输出 JSON
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const outIdx = argv.indexOf('--out');
const OUT = outIdx >= 0 ? argv[outIdx + 1] : null;
const AS_JSON = argv.includes('--json');

const normKey = (s) => String(s).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

const remote = JSON.parse(fs.readFileSync(path.join(root, 'dict/github.zh-CN.json'), 'utf8'));
const rk = Object.keys(remote.dict || {});

/* 内置词库 */
let builtin = [];
let builtinRaw = 0;
try {
  const src = fs.readFileSync(path.join(root, 'AI-Web-Translation-Assistant.user.js'), 'utf8');
  const s = src.indexOf('var DICT = {');
  const e = src.indexOf('\n};', s);
  const block = src.slice(s + 'var DICT = '.length, e + 2);
  const all = Object.keys(eval('(' + block + ')'));
  builtinRaw = all.length;
  builtin = all.filter((k) => !k.startsWith('__'));
} catch (e) {
  /* 忽略：脚本结构变了，报告里标注为空 */
}

const bs = new Set(builtin.map(normKey));
const overlap = rk.filter((k) => bs.has(normKey(k)));
const remoteOnly = rk.filter((k) => !bs.has(normKey(k)));
const builtinOnly = builtin.filter((k) => !rk.some((r) => normKey(r) === normKey(k)));

/* 译文长度与中文字符占比 */
const cjk = (s) => (String(s).match(/[\u4e00-\u9fa5]/g) || []).length;
let withCjk = 0;
let pureAscii = 0;
const pureAsciiKeys = [];
for (const k of rk) {
  const v = String(remote.dict[k] || '');
  if (cjk(v) > 0) withCjk++;
  else if (/^[\x20-\x7e]+$/.test(v)) { pureAscii++; pureAsciiKeys.push(k); }
}

/* 长度分布 */
const buckets = { '1–2 词': 0, '3–4 词': 0, '5–6 词': 0, '7 词以上': 0 };
for (const k of rk) {
  const n = k.split(/\s+/).length;
  if (n <= 2) buckets['1–2 词']++;
  else if (n <= 4) buckets['3–4 词']++;
  else if (n <= 6) buckets['5–6 词']++;
  else buckets['7 词以上']++;
}

const report = {
  version: remote.version,
  count: remote.count,
  actual: rk.length,
  builtin: builtin.length,
  builtinRaw,
  builtinPlaceholders: builtinRaw - builtin.length,
  overlap: overlap.length,
  remoteOnly: remoteOnly.length,
  builtinOnly: builtinOnly.length,
  totalEffective: builtin.length + remoteOnly.length,
  patterns: (remote.patterns || []).length,
  cssRules: (remote.cssRules || []).length,
  translated: withCjk,
  pureAscii,
  pureAsciiKeys: pureAsciiKeys.slice(0, 20),
  buckets,
  updatedAt: remote.updatedAt,
};

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

const pct = (a, b) => b ? (a / b * 100).toFixed(1) + '%' : '0%';
const md = `## 词库统计

| 指标 | 数值 |
| --- | --- |
| 词库版本 | \`${report.version}\` |
| 远端词条 | **${report.actual}** 条 |
| \`count\` 字段 | ${report.count} ${report.count === report.actual ? '✓' : '✗ 与实际不一致'} |
| 内置词条（有效） | ${report.builtin} 条${report.builtinPlaceholders ? '（另有 ' + report.builtinPlaceholders + ' 个占位键不计）' : ''} |
| 两端同名重叠 | ${report.overlap} 条（远端覆盖内置，不新增） |
| 远端独有 | ${report.remoteOnly} 条（真正新增） |
| 内置独有 | ${report.builtinOnly} 条 |
| **实际可用合计** | **${report.totalEffective}** 条 |
| 模式规则 | ${report.patterns} 条 |
| CSS 规则 | ${report.cssRules} 条 |
| 含中文译文 | ${report.translated} 条（${pct(report.translated, report.actual)}） |
| 纯英文译文 | ${report.pureAscii} 条${report.pureAscii ? '（专有名词或待译：' + report.pureAsciiKeys.join('、') + '）' : ''} |

### 键长分布

| 单词数 | 条数 | 占比 |
| --- | --- | --- |
${Object.entries(report.buckets).map(([k, v]) => `| ${k} | ${v} | ${pct(v, report.actual)} |`).join('\n')}

<sub>生成时间 ${new Date().toISOString()} · 词库 updatedAt ${report.updatedAt || '未记录'}</sub>
`;

if (OUT) {
  fs.writeFileSync(OUT, md, 'utf8');
  console.log('已写入 ' + OUT);
  console.log('远端 ' + report.actual + ' 条，实际可用 ' + report.totalEffective + ' 条');
} else {
  console.log(md);
}
