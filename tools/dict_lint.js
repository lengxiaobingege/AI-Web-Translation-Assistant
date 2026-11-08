#!/usr/bin/env node
/* 词库质量检查：CI 与本地共用
 * 用法：
 *   node tools/dict_lint.js             检查，发现问题退出码 1
 *   node tools/dict_lint.js --json      输出 JSON（供 Actions 生成摘要）
 *   node tools/dict_lint.js --fix       就地修正「可自动修」的问题（键格式、首尾空格）
 *
 * 检查项与我们手工修过的那批问题一一对应，避免同样的错误再长回来。
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const DICT_PATH = path.join(root, 'dict/github.zh-CN.json');
const SCRIPT_PATH = path.join(root, 'AI-Web-Translation-Assistant.user.js');

const argv = process.argv.slice(2);
const JSON_OUT = argv.includes('--json');
const FIX = argv.includes('--fix');

const errors = [];
const warns = [];
const err = (rule, key, detail) => errors.push({ rule, key, detail });
const warn = (rule, key, detail) => warns.push({ rule, key, detail });

/* 与脚本一致的归一规则：不换行空格→空格，连续空白压缩，去首尾，转小写 */
const normKey = (s) => String(s).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

let raw, data;
try {
  raw = fs.readFileSync(DICT_PATH, 'utf8');
  data = JSON.parse(raw);
} catch (e) {
  console.error('词库不是合法 JSON：' + e.message);
  process.exit(1);
}

const dict = data.dict || {};
const keys = Object.keys(dict);

/* ---------- 1. 结构字段 ---------- */
if (data.schema !== 1) err('schema', '', 'schema 应为 1，实际为 ' + JSON.stringify(data.schema));
if (data.target !== 'zh-CN') err('target', '', 'target 应为 zh-CN，实际为 ' + JSON.stringify(data.target));
if (typeof data.version !== 'string' || !data.version) err('version', '', 'version 缺失或不是字符串');
if (!Array.isArray(data.patterns)) err('patterns', '', 'patterns 应为数组');
if (!Array.isArray(data.cssRules)) err('cssRules', '', 'cssRules 应为数组');

/* ---------- 2. count 与实际条目数一致 ---------- */
if (data.count !== keys.length) {
  err('count-mismatch', '', 'count 字段为 ' + data.count + '，实际条目 ' + keys.length);
}

/* ---------- 3. 键格式：小写、空格归一、无首尾空白、无换行 ---------- */
const fixable = [];
for (const k of keys) {
  if (k !== k.trim()) err('key-space', k, '键首尾有空白');
  else if (/\s{2,}/.test(k)) err('key-double-space', k, '键内含连续空白');
  else if (k.includes('\n') || k.includes('\t')) err('key-whitespace', k, '键内含换行或制表符');
  else if (k !== k.toLowerCase()) err('key-case', k, '键含大写字母');
  else if (k !== normKey(k)) err('key-unnormalized', k, '键未归一');
  if (k !== normKey(k) || k !== k.trim()) fixable.push([k, normKey(k)]);
}

/* ---------- 4. 空键 / 注释占位键 ---------- */
for (const k of keys) {
  if (!k.trim()) err('key-empty', k, '空键');
  if (k.startsWith('__')) err('key-internal', k, '内部占位键，会进入词库但不命中任何文本（应移至注释或删除）');
}

/* ---------- 5. 译文合法性 ---------- */
for (const k of keys) {
  const v = dict[k];
  if (typeof v !== 'string') err('value-type', k, '译文不是字符串：' + typeof v);
  else if (!v.trim()) err('value-empty', k, '空译文会把英文整段抹成空白');
  else {
    if (v !== v.trim()) err('value-space', k, '译文首尾有空白：' + JSON.stringify(v));
    if (/[\r\n\t]/.test(v)) err('value-whitespace', k, '译文含换行或制表符');
    if (/^\s*[a-z]/.test(v) && /[a-z]{3,}/i.test(v) && !/[一-龥]/.test(v) && !/^(Dependabot|CodeQL|SARIF|SCIM|Subversion|Copilot|Gist)/i.test(v)) {
      warn('value-untranslated', k, '译文可能未翻译：' + JSON.stringify(v));
    }
  }
}

/* ---------- 6. 归一后重复键（大小写/空白差异造成的隐形覆盖） ---------- */
const seen = new Map();
for (const k of keys) {
  const n = normKey(k);
  if (seen.has(n)) err('key-duplicate', k, '归一后与 ' + JSON.stringify(seen.get(n)) + ' 重复');
  else seen.set(n, k);
}

/* ---------- 7. 术语一致性：workflow 统一为「工作流」 ---------- */
for (const k of keys) {
  const v = dict[k];
  if (typeof v === 'string' && k.includes('workflow') && v.includes('工作流程')) {
    err('term-workflow', k, 'workflow 应统一译作「工作流」，实际含「工作流程」：' + v);
  }
}

/* ---------- 8. patterns 能编译 ---------- */
for (let i = 0; i < (data.patterns || []).length; i++) {
  const p = data.patterns[i];
  if (!p || typeof p.re !== 'string' || typeof p.to !== 'string') {
    err('pattern-shape', '#patterns[' + i + ']', '需同时具备 re 与 to');
    continue;
  }
  try { new RegExp(p.re); } catch (e) {
    err('pattern-invalid', '#patterns[' + i + ']', p.re + ' 无法编译：' + e.message);
  }
  const refs = (p.to.match(/\$(\d)/g) || []).length;
  const groups = (p.re.match(/\((?!\?)/g) || []).length;
  if (refs > groups) warn('pattern-ref', '#patterns[' + i + ']', 'to 引用了 $' + refs + ' 但正则有 ' + groups + ' 个捕获组');
}

/* ---------- 9. cssRules 形状 ---------- */
for (let i = 0; i < (data.cssRules || []).length; i++) {
  const r = data.cssRules[i];
  if (!r || !r.selector) err('css-shape', '#cssRules[' + i + ']', '缺少 selector');
}

/* ---------- 10. 与脚本内置词库的一致性（重叠率过低说明该更新内置词库了） ---------- */
let builtin = [];
try {
  const src = fs.readFileSync(SCRIPT_PATH, 'utf8');
  const s = src.indexOf('var DICT = {');
  const e = src.indexOf('\n};', s);
  if (s >= 0 && e > s) {
    const block = src.slice(s + 'var DICT = '.length, e + 2);
    builtin = Object.keys(eval('(' + block + ')')).filter((k) => !k.startsWith('__'));
  }
} catch (e) {
  warn('builtin-parse', '', '无法解析脚本内置词库：' + e.message);
}
if (builtin.length) {
  const bs = new Set(builtin.map(normKey));
  const overlap = keys.filter((k) => bs.has(normKey(k))).length;
  const rate = overlap / keys.length;
  if (rate < 0.5) {
    warn('builtin-stale', '', '内置词库与远端仅重叠 ' + (rate * 100).toFixed(1) + '%，建议同步内置词库');
  }
}

/* ---------- 输出 ---------- */
const stat = {
  total: keys.length,
  count: data.count,
  version: data.version,
  patterns: (data.patterns || []).length,
  cssRules: (data.cssRules || []).length,
  builtin: builtin.length,
  errors: errors.length,
  warnings: warns.length,
};

if (FIX && fixable.length) {
  let fixed = 0;
  for (const [oldK, newK] of fixable) {
    if (oldK === newK) continue;
    const v = dict[oldK];
    delete dict[oldK];
    if (!(newK in dict)) {
      dict[newK] = v;
      fixed++;
    } else if (dict[newK] === v) {
      fixed++;               /* 重复且译文相同，丢弃 */
    } else {
      dict[newK] = v;        /* 撞车但译文不同，以后者为准，交给 --json 复核 */
      fixed++;
    }
  }
  data.dict = dict;
  data.count = Object.keys(dict).length;
  fs.writeFileSync(DICT_PATH, JSON.stringify(data, null, 1) + '\n', 'utf8');
  if (!JSON_OUT) console.log('已自动修正 ' + fixed + ' 条键格式，count 更新为 ' + data.count);
}

if (JSON_OUT) {
  console.log(JSON.stringify({ stat, errors, warnings: warns }, null, 2));
} else {
  console.log('词库检查：' + stat.total + ' 条，version ' + stat.version +
    '，patterns ' + stat.patterns + '，cssRules ' + stat.cssRules);
  if (builtin.length) console.log('内置词库：' + builtin.length + ' 条');
  if (errors.length) {
    console.log('\n错误 ' + errors.length + ' 项：');
    for (const e of errors.slice(0, 60)) console.log('  ✗ [' + e.rule + '] ' + JSON.stringify(e.key) + ' — ' + e.detail);
    if (errors.length > 60) console.log('  …另有 ' + (errors.length - 60) + ' 项');
  }
  if (warns.length) {
    console.log('\n警告 ' + warns.length + ' 项：');
    for (const w of warns.slice(0, 30)) console.log('  ! [' + w.rule + '] ' + JSON.stringify(w.key) + ' — ' + w.detail);
    if (warns.length > 30) console.log('  …另有 ' + (warns.length - 30) + ' 项');
  }
  if (!errors.length && !warns.length) console.log('\n全部通过 ✓');
}

process.exit(errors.length ? 1 : 0);
