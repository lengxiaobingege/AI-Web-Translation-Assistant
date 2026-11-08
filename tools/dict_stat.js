/* 统计词库构成：内置 DICT / 远端 dict/github.zh-CN.json / 二者重叠，解释面板里「合计」的差额
 * 用法：node tools/dict_stat.js
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'AI-Web-Translation-Assistant.user.js'), 'utf8');

const s = src.indexOf('var DICT = {');
const e = src.indexOf('\n};', s);
const DICT = eval('(' + src.slice(s + 'var DICT = '.length, e + 2) + ')');
const keys = Object.keys(DICT);
const isJunk = k => k.indexOf('__') === 0;   /* 生成器留下的注释占位，不命中任何文本 */
const placeholder = keys.filter(isJunk);

const remote = JSON.parse(fs.readFileSync(path.join(root, 'dict/github.zh-CN.json'), 'utf8'));
const rk = Object.keys(remote.dict || {});

const norm = k => k.trim().toLowerCase().replace(/\s+/g, ' ');
const builtinSet = new Set(keys.map(norm));
const overlap = rk.filter(k => builtinSet.has(norm(k)));
const remoteNew = rk.filter(k => !builtinSet.has(norm(k)));

console.log('内置词条（有效）     :', keys.length - placeholder.length, '（另有注释占位键', placeholder.length, '条，不计）');
console.log('远端词条              :', rk.length, '（version', remote.version + '）');
console.log('两端同名重叠          :', overlap.length, '（远端覆盖内置，不新增）');
console.log('远端独有（真正新增）  :', remoteNew.length);
console.log('词库合计              :', (keys.length - placeholder.length) + remoteNew.length);
console.log('');
console.log('内置独有示例:', keys.filter(k => !isJunk(k) && !rk.some(r => norm(r) === norm(k))).slice(0, 10));
console.log('远端独有示例:', remoteNew.slice(0, 10));
