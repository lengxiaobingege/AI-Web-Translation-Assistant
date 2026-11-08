/* 把用户通过 Issue 提交的词条清单转成 dict/contribs/contrib-issue-<编号>.json
 *
 * 用途：GitHub Actions「词库 Issue 接收」工作流调用，也可本地手动跑。
 * 输入（环境变量）：
 *   ISSUE_BODY     Issue 正文（必填）
 *   ISSUE_NUMBER   Issue 编号（必填，用于文件名）
 * 输出：
 *   dict/contribs/contrib-issue-<编号>.json  （有可用词条时）
 *   $GITHUB_OUTPUT 写入 count=<条数>
 *   $GITHUB_STEP_SUMMARY 写入解析摘要
 *
 * 安全边界（正文完全来自外部用户，不可信）：
 *   - 只认「- 原文 → 译文」这种单行列表，其它内容一律忽略
 *   - 长度上限：键 200 字符、译文 200 字符；含换行/代码块/HTML 标签的跳过
 *   - 单词条最多 300 条，防止刷量
 *   - 只写 contribs 目录，不碰正式词库；是否合并仍由维护者手动触发
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const body = process.env.ISSUE_BODY || '';
const number = String(process.env.ISSUE_NUMBER || '').trim();

const MAX_ITEMS = 300;
const MAX_KEY = 200;
const MAX_VAL = 200;

/* 与 merge_contrib / 脚本运行时一致的归一化：去 NBSP、压缩空白、小写 */
const norm = k => String(k).replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

/* 逐行匹配「- key → val」「* key -> val」，也兼容全角箭头 ⇒ 与没有列表符号的裸行 */
function parse(bodyText) {
  const hits = {};
  let skipped = 0;
  let inCode = false;
  const hasCJK = s => /[\u4e00-\u9fff]/.test(s);

  for (const raw of String(bodyText).split(/\r?\n/)) {
    const line = raw.trim();
    if (/^```/.test(line)) { inCode = !inCode; continue; }   /* 代码块整段跳过，避免把示例当词条 */
    if (inCode) continue;
    if (!line || line.startsWith('#') || line.startsWith('>')) continue;
    const m = line.match(/^(?:[-*+]\s+)?(.+?)\s*(?:→|->|⇒)\s*(.+)$/);
    if (!m) continue;

    const key = norm(m[1].replace(/^`|`$/g, ''));
    const val = m[2].replace(/^`|`$/g, '').trim();

    if (!key || !val) { skipped++; continue; }
    if (key.length > MAX_KEY || val.length > MAX_VAL) { skipped++; continue; }
    if (key === val) { skipped++; continue; }
    if (/[<>]/.test(key) || /[<>]/.test(val)) { skipped++; continue; }   /* 不收 HTML，避免注入 */
    if (/^(https?:|javascript:|data:)/i.test(key + val)) { skipped++; continue; }
    if (/^\s*\|/.test(key) || /^\s*\|/.test(val)) { skipped++; continue; }  /* 表格行不当词条 */
    /* 词库是「外文 → 中文」，中文→外文的反向条目说明用户填反了，跳过 */
    if (hasCJK(key) && !hasCJK(val)) { skipped++; continue; }
    if (Object.prototype.hasOwnProperty.call(hits, key)) continue;

    hits[key] = val;
    if (Object.keys(hits).length >= MAX_ITEMS) break;
  }
  return { hits, skipped };
}

if (!number) {
  console.error('缺少 ISSUE_NUMBER');
  process.exit(1);
}

const { hits, skipped } = parse(body);
const count = Object.keys(hits).length;

/* 摘要（写进 Job Summary，方便维护者核对） */
const lines = [];
lines.push('### Issue #' + number + ' 词条解析');
lines.push('');
lines.push('| 指标 | 数值 |');
lines.push('| --- | --- |');
lines.push('| 可用词条 | ' + count + ' |');
lines.push('| 跳过（格式/超长/非法） | ' + skipped + ' |');
lines.push('| 上限 | ' + MAX_ITEMS + ' 条/Issue |');
if (count) {
  lines.push('');
  lines.push('前 10 条预览：');
  lines.push('');
  for (const [k, v] of Object.entries(hits).slice(0, 10)) {
    lines.push('- `' + k.slice(0, 60) + '` → ' + v);
  }
}
const summary = lines.join('\n') + '\n';
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
console.log(summary);

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, 'count=' + count + '\nskipped=' + skipped + '\n');
}

if (count) {
  const dir = path.join(root, 'dict/contribs');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'contrib-issue-' + number + '.json');
  fs.writeFileSync(out, JSON.stringify({
    schema: 1,
    from: 'issue',
    issue: Number(number),
    hits,
  }, null, 2) + '\n', 'utf8');
  console.log('已写入 ' + path.relative(root, out));
} else {
  console.log('没有解析到可用词条，未生成文件。');
}
