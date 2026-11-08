#!/usr/bin/env node
/**
 * 从 AI-Web-Translation-Assistant.user.js 生成 Chrome/Edge 扩展（MV3）
 *
 * 为什么是「生成」而不是「另写一份」：
 *   脚本只有 4 个 GM_* 调用（getValue/setValue/xmlhttpRequest/registerMenuCommand），
 *   全部集中，因此可以用一层 shim 把它们映射到扩展 API：
 *     GM_getValue/GM_setValue        -> chrome.storage.local（启动时一次性读进内存，保持同步语义）
 *     GM_xmlhttpRequest              -> background service worker 的 fetch（绕开页面 CORS 与 CSP）
 *     GM_registerMenuCommand         -> 收集成列表，由 popup 调起
 *   源码仍然只有 AI-Web-Translation-Assistant.user.js 一份，改逻辑不用改两处。
 *
 * 用法：
 *   node tools/build_ext.js            # 生成 dist/extension/
 *   node tools/build_ext.js --zip      # 额外打包 dist/ai-web-translation-<ver>.zip
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'AI-Web-Translation-Assistant.user.js');
const OUT = path.join(ROOT, 'dist', 'extension');

const src = fs.readFileSync(SRC, 'utf8');

/* ---------- 1. 解析 UserScript 头 ---------- */
const metaEnd = src.indexOf('// ==/UserScript==');
if (metaEnd < 0) throw new Error('未找到 // ==/UserScript== 结束标记');
const head = src.slice(0, metaEnd);
const body = src.slice(metaEnd + '// ==/UserScript=='.length).replace(/^\s*\n/, '');

function meta(key) {
  const re = new RegExp('^//\\s*@' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s+(.+)$', 'm');
  const m = head.match(re);
  return m ? m[1].trim() : '';
}

const version = meta('version');
const nameZh = meta('name:zh-CN') || meta('name');
const descZh = meta('description:zh-CN') || meta('description');
if (!version) throw new Error('未解析到 @version');

/* 版本号必须是 1-4 段纯数字，否则商店会拒 */
if (!/^\d{1,4}(\.\d{1,4}){0,3}$/.test(version)) {
  throw new Error('@version "' + version + '" 不是扩展允许的格式（只允许数字与点）');
}

/* ---------- 2. content.js：shim + 原脚本主体 ---------- */
const SHIM = `/* 由 tools/build_ext.js 从 AI-Web-Translation-Assistant.user.js 生成，请勿直接修改本文件。 */
/* 改逻辑请改 .user.js 后重新构建；构建命令：node tools/build_ext.js --zip */

(async function () {
  'use strict';

  /* 注意：原脚本调用时传的就是完整键（自己拼了 PREFIX），这里必须原样透传，不能再加工 */
  var MEM = Object.create(null);
  var MENU = [];

  /* 配置一次性读进内存：脚本里 Store.get 是同步调用，异步 API 无法直接替换 */
  var guardTimer = null;
  try {
    var snapshot = await Promise.race([
      chrome.storage.local.get(null),
      new Promise(function (r) { guardTimer = setTimeout(function () { r(null); }, 3000); })
    ]);
    if (guardTimer) clearTimeout(guardTimer);
    if (snapshot) {
      Object.keys(snapshot).forEach(function (k) { MEM[k] = snapshot[k]; });
    }
  } catch (e) { /* 读不到就当首次运行，脚本会用内置默认值 */ }

  function GM_getValue(key, def) {
    var v = MEM[key];
    return (v === undefined || v === null || v === '') ? def : v;
  }

  function GM_setValue(key, val) {
    MEM[key] = val;
    var patch = {};
    patch[key] = val;
    try {
      chrome.storage.local.set(patch).catch(function (e) {
        console.warn('[AI 翻译助手] 配置保存失败（可能是存储配额已满）', e);
      });
    } catch (e) { }
  }

  /* 多个标签页共用同一份配置：别的页面改了设置，这边也要跟上 */
  try {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'local') return;
      Object.keys(changes).forEach(function (k) { MEM[k] = changes[k].newValue; });
    });
  } catch (e) { }

  function GM_registerMenuCommand(label, fn) {
    MENU.push({ label: label, fn: fn });
  }

  /* 页面里直接 fetch 会受页面 CORS / CSP 限制，统一交给后台 */
  function GM_xmlhttpRequest(o) {
    var opts = {
      method: String(o.method || 'GET').toUpperCase(),
      url: o.url,
      headers: o.headers || {},
      data: (o.data === undefined || o.data === null) ? null : String(o.data),
      timeout: o.timeout || 12000
    };
    chrome.runtime.sendMessage({ type: 'xhr', opts: opts }, function (res) {
      if (chrome.runtime.lastError) {
        if (o.onerror) o.onerror(new Error(chrome.runtime.lastError.message || '扩展后台未响应'));
        return;
      }
      if (!res) { if (o.onerror) o.onerror(new Error('扩展后台未响应')); return; }
      if (res.error) { if (o.onerror) o.onerror(new Error(res.error)); return; }
      if (o.onload) {
        o.onload({ status: res.status, statusText: res.statusText || '', responseText: res.text || '' });
      }
    });
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, respond) {
    if (!msg) return;
    if (msg.type === 'menuList') {
      respond(MENU.map(function (m) { return m.label; }));
      return;
    }
    if (msg.type === 'menuRun') {
      var hit = null;
      for (var i = 0; i < MENU.length; i++) if (MENU[i].label === msg.label) hit = MENU[i];
      respond({ ok: !!hit });
      if (hit) { try { hit.fn(); } catch (e) { console.error('[翻译助手] 菜单执行失败', e); } }
    }
  });

  /* ==================== 以下为原脚本主体，未经改动 ==================== */

`;

const contentJs = SHIM + body +
  '\n})().catch(function (e) {\n' +
  '  /* 初始化失败必须留痕：否则扩展装上后只是"没反应"，用户和排查的人都无从下手 */\n' +
  '  console.error("[AI 翻译助手] 初始化失败", e);\n' +
  '});\n';

/* ---------- 3. background.js ---------- */
const backgroundJs = `/* 后台：代 content script 发跨域请求。只有这一件事，保持最小攻击面。 */
chrome.runtime.onMessage.addListener(function (msg, sender, respond) {
  if (!msg || msg.type !== 'xhr') return;

  var o = msg.opts || {};
  var ctrl = new AbortController();
  var timer = setTimeout(function () { ctrl.abort(); }, Math.max(3000, o.timeout || 12000));

  var init = {
    method: o.method || 'GET',
    headers: o.headers || {},
    signal: ctrl.signal,
    credentials: 'omit',
    redirect: 'follow',
    cache: 'no-store'
  };
  if (init.method !== 'GET' && init.method !== 'HEAD' && o.data !== null) init.body = o.data;

  fetch(o.url, init).then(function (r) {
    return r.text().then(function (t) {
      respond({ status: r.status, statusText: r.statusText, text: t });
    });
  }).catch(function (e) {
    respond({
      error: (e && e.name === 'AbortError')
        ? '请求超时（' + (o.url || '').slice(0, 60) + '）'
        : String((e && e.message) || e)
    });
  }).finally(function () { clearTimeout(timer); });

  return true;   /* 异步 respond */
});
`;

/* ---------- 4. popup ---------- */
const popupHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0; width: 268px; padding: 12px;
    font: 13px/1.55 -apple-system, "Segoe UI", "Microsoft YaHei", sans-serif;
    background: #fff; color: #1f2328;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1f24; color: #e6edf3; }
    .cmd { background: #262a30; border-color: #333a42; }
    .cmd:hover { background: #2f353d; }
    .sub { color: #8b949e; }
  }
  .top { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .top img { width: 20px; height: 20px; border-radius: 5px; }
  .title { font-weight: 600; font-size: 13px; }
  .ver { margin-left: auto; font-size: 11px; color: #6e7781; font-variant-numeric: tabular-nums; }
  .cmd {
    display: block; width: 100%; text-align: left; cursor: pointer;
    padding: 7px 9px; margin-bottom: 5px; border-radius: 7px;
    border: 1px solid #d8dee4; background: #f6f8fa; color: inherit;
    font: inherit;
  }
  .cmd:hover { background: #eef1f4; }
  .cmd:last-of-type { margin-bottom: 0; }
  .cmd b { font-weight: 500; }
  .sub { margin-top: 9px; font-size: 11px; line-height: 1.6; color: #6e7781; }
  .empty { padding: 10px 2px; font-size: 12px; color: #6e7781; line-height: 1.7; }
  kbd {
    padding: 1px 4px; border-radius: 4px; border: 1px solid #d0d7de;
    background: #f6f8fa; font: 11px ui-monospace, Consolas, monospace; color: #57606a;
  }
</style>
</head>
<body>
  <div class="top">
    <img src="icons/icon48.png" alt="">
    <span class="title">AI 网页翻译助手</span>
    <span class="ver" id="ver"></span>
  </div>
  <div id="list"><div class="empty">正在读取当前页面…</div></div>
  <div class="sub">页面任意位置按 <kbd>F9</kbd> 立即翻译 / 重译。</div>
  <script src="popup.js"></script>
</body>
</html>
`;

const popupJs = `/* 菜单入口：扩展没有 Tampermonkey 那种图标菜单，改用弹窗调起页面里的命令 */
const VERSION = '__VERSION__';

function el(tag, cls) {
  const d = document.createElement(tag);
  if (cls) d.className = cls;
  return d;
}

function showEmpty(html) {
  const box = document.getElementById('list');
  box.innerHTML = '';
  const d = el('div', 'empty');
  d.innerHTML = html;
  box.appendChild(d);
}

function render(labels, tabId) {
  const box = document.getElementById('list');
  box.innerHTML = '';
  labels.forEach((label) => {
    const b = el('button', 'cmd');
    b.type = 'button';
    b.innerHTML = '<b></b>';
    b.querySelector('b').textContent = label;
    b.addEventListener('click', () => {
      chrome.tabs.sendMessage(tabId, { type: 'menuRun', label }, () => {
        void chrome.runtime.lastError;
        window.close();
      });
    });
    box.appendChild(b);
  });
}

async function init() {
  document.getElementById('ver').textContent = 'v' + VERSION;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return showEmpty('无法读取当前标签页。');

  chrome.tabs.sendMessage(tab.id, { type: 'menuList' }, (labels) => {
    if (chrome.runtime.lastError || !labels || !labels.length) {
      showEmpty('当前页面不可用。<br>浏览器内置页（chrome://、扩展商店等）不允许注入脚本，换一个普通网页再试。');
      return;
    }
    render(labels, tab.id);
  });
}

init();
`;

/* ---------- 5. manifest ---------- */
const manifest = {
  manifest_version: 3,
  name: nameZh,
  version,
  description: descZh.length > 132 ? descZh.slice(0, 129) + '…' : descZh,
  icons: {
    '16': 'icons/icon16.png',
    '32': 'icons/icon32.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  },
  permissions: ['storage', 'activeTab'],
  host_permissions: ['<all_urls>'],
  background: { service_worker: 'background.js' },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['content.js'],
      run_at: 'document_idle',
      all_frames: false
    }
  ],
  action: {
    default_popup: 'popup.html',
    default_title: nameZh,
    default_icon: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png'
    }
  }
};

/* ---------- 6. 安装说明（随包发出，不发给用户看网页） ---------- */
const readmeTxt = `AI 网页翻译助手 —— 浏览器扩展版 ${version}

【安装（Chrome / Edge，30 秒）】
1. 把压缩包解压到任意固定目录（不要放桌面临时文件夹，删了就失效）。
2. 打开扩展管理页：
   - Chrome 地址栏输入 chrome://extensions
   - Edge 地址栏输入 edge://extensions
3. 打开右上角「开发者模式」。
4. 点「加载已解压的扩展程序」，选中解压出来的文件夹（包含 manifest.json 那一层）。
5. 固定到工具栏，点图标即可看到菜单。

【使用】
- 打开任意网页按 F9：立即翻译 / 重译。
- 点工具栏图标：AI 翻译设置、立即更新词库、提交词库 Issue、关闭翻译。
- 首次使用请在「AI 翻译设置」里填模型与 API Key；不填也能用，会自动走免费引擎链。

【和油猴版的关系】
两个版本共用同一份源码与同一套词库，功能一致。
区别：扩展版配置存在浏览器的扩展存储里，不能直接读取油猴版的配置——需要在新版里重新填一次 API Key。

【卸载】
扩展管理页点「移除」即可，配置文件随扩展一起删除。
`;

/* ---------- 7. 落盘 ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });

const write = (p, s) => fs.writeFileSync(path.join(OUT, p), s, 'utf8');
write('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
write('content.js', contentJs);
write('background.js', backgroundJs);
write('popup.html', popupHtml);
write('popup.js', popupJs.replace('__VERSION__', version));
write('README.txt', readmeTxt);

/* 图标：从仓库根 icon.png 生成四个尺寸，保持透明通道 */
const py = process.platform === 'win32' ? 'python' : 'python3';
execFileSync(py, ['-c', `
from PIL import Image
src = Image.open(r"${path.join(ROOT, 'icon.png').replace(/\\/g, '/')}").convert("RGBA")
for s in (16, 32, 48, 128):
    src.resize((s, s), Image.LANCZOS).save(r"${path.join(OUT, 'icons').replace(/\\/g, '/')}/icon%d.png" % s)
`], { stdio: 'inherit' });

/* 自检：manifest 引用的文件必须都存在，缺一个商店就退回审核 */
const refs = [
  ...Object.values(manifest.icons),
  ...Object.values(manifest.action.default_icon),
  manifest.background.service_worker,
  ...manifest.content_scripts[0].js,
  manifest.action.default_popup
];
const missing = refs.filter((r) => !fs.existsSync(path.join(OUT, r)));
if (missing.length) throw new Error('manifest 引用了不存在的文件：' + missing.join(', '));

/* content.js 必须能通过语法检查，否则加载时整个扩展静默失效 */
try {
  execFileSync(process.execPath, ['--check', path.join(OUT, 'content.js')], { stdio: 'pipe' });
  execFileSync(process.execPath, ['--check', path.join(OUT, 'background.js')], { stdio: 'pipe' });
  execFileSync(process.execPath, ['--check', path.join(OUT, 'popup.js')], { stdio: 'pipe' });
} catch (e) {
  throw new Error('生成的脚本语法检查未通过：' + (e.stderr ? e.stderr.toString().slice(0, 400) : e.message));
}

const size = (p) => (fs.statSync(p).size / 1024).toFixed(1) + ' KB';
console.log('已生成 dist/extension/  版本 ' + version);
['manifest.json', 'content.js', 'background.js', 'popup.html', 'popup.js', 'README.txt']
  .forEach((f) => console.log('  ' + f.padEnd(16) + size(path.join(OUT, f))));

/* ---------- 8. 可选打包 ---------- */
if (process.argv.includes('--zip')) {
  const zipPath = path.join(ROOT, 'dist', 'ai-web-translation-ext-' + version + '.zip');
  fs.rmSync(zipPath, { force: true });
  execFileSync(py, ['-c', `
import os, zipfile
root = r"${OUT.replace(/\\/g, '/')}"
out = r"${zipPath.replace(/\\/g, '/')}"
order = ["manifest.json", "background.js", "content.js", "popup.html", "popup.js", "README.txt"]
for s in (16, 32, 48, 128):
    order.append("icons/icon%d.png" % s)
with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in order:
        z.write(os.path.join(root, name), name)
print("%.1f KB" % (os.path.getsize(out) / 1024.0))
`], { stdio: 'inherit' });
  console.log('已打包 ' + path.relative(ROOT, zipPath));
}
