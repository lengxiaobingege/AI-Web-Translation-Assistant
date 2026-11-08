/* 维护者用：把 dict/contribs/*.json（用户脚本回传的采集词条）合并进正式词库
 *
 * 规则：
 *   1. 默认「只加不改」——正式词库里已有的键一律保留，贡献里同名条目跳过（避免把错译盖上去）
 *   2. --force 时用贡献值覆盖正式词库（改错译时手动用）
 *   3. --dry 只打印统计，不写文件
 *   4. 合并后按日期重排 + 更新 count 字段；version 保持不变（要改版本号请用 build_dict.js 的流程）
 *
 * 用法：
 *   node tools/merge_contrib.js            # 合并 dict/contribs/*.json
 *   node tools/merge_contrib.js --dry      # 只看统计
 *   node tools/merge_contrib.js --force    # 覆盖同名条目
 *
 * 合并成功后：自动删除已读取的 contribs/*.json（内容已进正式词库，避免重复合并），
 * 并把 version 的 -rN 后缀 +1（如 2026.11.08-r1 → 2026.11.08-r2），方便面板上看出变化。
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dictPath = path.join(root, 'dict/zh-CN.json');
const contribDir = path.join(root, 'dict/contribs');
const dry = process.argv.includes('--dry');
const force = process.argv.includes('--force');

const norm = k => String(k).replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

if (!fs.existsSync(contribDir)) {
  console.log('没有 dict/contribs 目录，暂无用户贡献。');
  process.exit(0);
}

const files = fs.readdirSync(contribDir).filter(f => f.endsWith('.json'));
if (!files.length) {
  console.log('dict/contribs 下没有 JSON 文件，暂无用户贡献。');
  process.exit(0);
}

const dictFile = JSON.parse(fs.readFileSync(dictPath, 'utf8'));
const dict = dictFile.dict || {};

let added = 0, skipped = 0, overwritten = 0, invalid = 0;
const report = [];

for (const f of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(path.join(contribDir, f), 'utf8')); }
  catch (e) { console.log('跳过（JSON 解析失败）:', f); continue; }
  const hits = (data && data.hits) || {};
  let a = 0, s = 0, o = 0;
  for (const [rawKey, rawVal] of Object.entries(hits)) {
    const key = norm(rawKey);
    const val = String(rawVal == null ? '' : rawVal).trim();
    if (!key || !val || key === val || /[\n\r]/.test(val)) { invalid++; continue; }
    if (Object.prototype.hasOwnProperty.call(dict, key)) {
      if (force && dict[key] !== val) { dict[key] = val; o++; }
      else s++;
      continue;
    }
    dict[key] = val;
    a++;
  }
  added += a; skipped += s; overwritten += o;
  report.push('  ' + f + '：新增 ' + a + '，跳过 ' + s + (o ? '，覆盖 ' + o : ''));
}

console.log(report.join('\n'));
console.log('\n合计：新增 ' + added + '，跳过 ' + skipped + (force ? '，覆盖 ' + overwritten : '') + (invalid ? '，无效 ' + invalid : ''));

if (dry) { console.log('（--dry 模式，未写入文件）'); process.exit(0); }
if (!added && !overwritten) { console.log('没有需要写入的变更。'); process.exit(0); }

dictFile.dict = dict;
dictFile.count = Object.keys(dict).length;
if (typeof dictFile.version === 'string') {
  if (/-r\d+$/.test(dictFile.version)) dictFile.version = dictFile.version.replace(/-r(\d+)$/, (_, n) => '-r' + (Number(n) + 1));
  else dictFile.version += '-r1';
}
fs.writeFileSync(dictPath, JSON.stringify(dictFile, null, 2) + '\n', 'utf8');

/* 清理已合并的贡献文件，防止下次重复统计 */
let cleaned = 0;
for (const f of files) {
  try { fs.unlinkSync(path.join(contribDir, f)); cleaned++; } catch (e) { /* 忽略单个文件失败 */ }
}

console.log('已写入 ' + path.relative(root, dictPath) + '，当前共 ' + dictFile.count + ' 条，version ' + dictFile.version);
console.log('已清理贡献文件 ' + cleaned + ' 个。下一步：提交词库改动（脚本每天 0 点后首次访问自动同步）。');
