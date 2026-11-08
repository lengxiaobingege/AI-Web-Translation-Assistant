#!/usr/bin/env node
/* AI 自动续写词库
 *
 * 流程：
 *   1. 从「候选英文」中挑出词库里还没有的条目
 *   2. 分批交给 OpenAI 兼容接口翻译（严格 JSON 输出，逐条校验）
 *   3. 合并进 dict/github.zh-CN.json，同步 count / version
 *
 * 没配 Key 时直接退出 0，不会让流水线变红。
 *
 * 环境变量：
 *   AI_BASE_URL   默认 https://api.openai.com/v1/chat/completions
 *   AI_API_KEY    必填才真正运行
 *   AI_MODEL      默认 gpt-4o-mini
 *   AI_BATCH      每批条数，默认 20
 *   AI_LIMIT      本次最多新增多少条，默认 100
 *   CANDIDATES    候选词文件路径，默认 tools/candidates.txt
 *   DRY_RUN=1     只打印将要做什么，不写文件
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const DICT_PATH = path.join(root, 'dict/github.zh-CN.json');

const BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
const API_KEY = process.env.AI_API_KEY || '';
const MODEL = process.env.AI_MODEL || 'gpt-4o-mini';
const BATCH = Number(process.env.AI_BATCH || 20);
const LIMIT = Number(process.env.AI_LIMIT || 100);
const DRY = process.env.DRY_RUN === '1';
const CAND_PATH = path.resolve(root, process.env.CANDIDATES || 'tools/candidates.txt');

const normKey = (s) => String(s).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

if (!API_KEY) {
  console.log('未配置 AI_API_KEY，跳过自动续写（这不视为失败）。');
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(DICT_PATH, 'utf8'));
const dict = data.dict;

if (!fs.existsSync(CAND_PATH)) {
  console.log('未找到候选词文件：' + CAND_PATH + '，跳过。');
  process.exit(0);
}

/* ---------- 候选清洗 ---------- */
const cands = fs.readFileSync(CAND_PATH, 'utf8')
  .split('\n')
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith('#'))
  .map(normKey);

/* 只保留：词库没有、长度合理、是英文短语 */
const todo = [];
const seen = new Set();
for (const c of cands) {
  if (!c || seen.has(c)) continue;
  seen.add(c);
  if (Object.prototype.hasOwnProperty.call(dict, c)) continue;
  if (c.length < 2 || c.length > 120) continue;
  if (!/[a-z]/.test(c)) continue;
  if (!/^[a-z0-9][a-z0-9 .,'’&()\/:+\-–—%!?]*$/.test(c)) continue;
  if (c.split(/\s+/).length > 12) continue;
  todo.push(c);
}

const queued = todo.slice(0, LIMIT);
console.log('候选 ' + cands.length + ' 条 → 词库缺失 ' + todo.length + ' 条 → 本次处理 ' + queued.length + ' 条');

if (!queued.length) {
  console.log('没有需要新增的条目，结束。');
  process.exit(0);
}
if (DRY) {
  console.log('DRY_RUN，待译示例：', queued.slice(0, 10));
  process.exit(0);
}

/* ---------- 提示词 ---------- */
const SYSTEM = [
  '你是 GitHub 官方中文界面的本地化译者。',
  '把给出的英文界面词条译成简体中文，要求：',
  '1. 术语与 GitHub 官方中文一致：issue=议题，pull request=拉取请求，fork=复刻，star=星标，',
  '   repository=仓库，branch=分支，commit=提交，workflow=工作流，runner=运行器，',
  '   artifact=构件，release=发行版，package=软件包，secret=机密，label=标签，milestone=里程碑，',
  '   codespace=代码空间，discussion=讨论，project=项目。',
  '2. 界面短词保持简短，不要加句号，不要加解释。',
  '3. 站内专有名词保留英文：GitHub、Git、GitHub Actions、Copilot、Dependabot、CodeQL、Gist、',
  '   Codespaces、SSH、GPG、OAuth、SAML、SCIM、API、URL、README、Markdown。',
  '4. 纯技术标识符、分支名、文件名、正则、代码片段不要翻译，原样返回。',
  '5. 只输出 JSON 对象，键名必须与输入完全一致，值放译文。不要输出任何其它文字。',
].join('\n');

async function callAI(items) {
  const body = {
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: JSON.stringify(Object.fromEntries(items.map((k) => [k, ''])), null, 0) },
    ],
  };
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + API_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error('HTTP ' + res.status + ' ' + t.slice(0, 300));
  }
  const j = await res.json();
  const txt = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('返回内容里没有 JSON：' + txt.slice(0, 200));
  return JSON.parse(m[0]);
}

/* ---------- 分批翻译 ---------- */
const added = [];
const rejected = [];

for (let i = 0; i < queued.length; i += BATCH) {
  const items = queued.slice(i, i + BATCH);
  let got;
  try {
    got = await callAI(items);
  } catch (e) {
    console.log('第 ' + (i / BATCH + 1) + ' 批失败：' + e.message);
    continue;
  }
  for (const key of items) {
    const v = got[key];
    if (typeof v !== 'string') { rejected.push([key, 'AI 未返回该键']); continue; }
    const tv = v.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!tv) { rejected.push([key, '空译文']); continue; }
    if (tv.length > key.length * 6 + 30) { rejected.push([key, '译文异常长']); continue; }
    if (tv === key) {
      /* 原样返回：视为不翻译的专有名词，不写入 */
      rejected.push([key, 'AI 判定不译']);
      continue;
    }
    added.push([key, tv]);
  }
  console.log('第 ' + (i / BATCH + 1) + ' 批：累计通过 ' + added.length + ' 条');
}

if (!added.length) {
  console.log('没有任何条目通过校验，未改动词库。');
  if (rejected.length) console.log('被拒示例：', rejected.slice(0, 10));
  process.exit(0);
}

/* ---------- 写回 ---------- */
for (const [k, v] of added) dict[k] = v;
data.count = Object.keys(dict).length;

/* version 带日期，末尾用 rev 区分同日多次运行 */
const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
const prev = String(data.version || '');
const sameDay = prev.startsWith(today);
const rev = sameDay && /-r(\d+)$/.test(prev) ? Number(prev.match(/-r(\d+)$/)[1]) + 1 : 1;
data.version = sameDay ? today + '-r' + rev : today;
data.updatedAt = new Date().toISOString();
data.note = 'GitHub 界面汉化词库。键为小写、空格归一的英文原文；值为简体中文。' +
  '本版由 GitHub Actions 自动补充 ' + added.length + ' 条（' + new Date().toISOString().slice(0, 10) + '）。';

fs.writeFileSync(DICT_PATH, JSON.stringify(data, null, 1) + '\n', 'utf8');

console.log('已写入 ' + added.length + ' 条，词库合计 ' + data.count + ' 条，version ' + data.version);
if (rejected.length) {
  console.log('被拒 ' + rejected.length + ' 条：');
  for (const [k, r] of rejected.slice(0, 15)) console.log('  - ' + JSON.stringify(k) + '：' + r);
}
