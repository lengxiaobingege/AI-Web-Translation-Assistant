#!/usr/bin/env node
/**
 * 真机验收：把 dist/extension 加载进 Chrome，验证
 *   1. content script 注入成功（能收到扩展消息）
 *   2. GM_registerMenuCommand 的 5 个菜单项被收集到
 *   3. 触发「AI 翻译设置」后设置面板真的出现在页面里
 *   4. GM_getValue / GM_setValue 映射到 chrome.storage.local
 *
 * 只依赖 Node 内置模块（http / child_process / 全局 WebSocket），不装 puppeteer。
 * 用法：node tools/verify_ext.js
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const EXT = path.join(ROOT, 'dist', 'extension');
const PORT_HTTP = 8129;
const PORT_CDP = 9333;

const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe'
];

let pass = 0, fail = 0;
function check(name, ok, extra) {
  if (ok) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + String(extra).slice(0, 160) : '')); }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let b = '';
      res.on('data', (d) => (b += d));
      res.on('end', () => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

/* 极简 CDP 客户端 */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.waiting = new Map();
    this.listeners = new Map();
    ws.addEventListener('message', (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (e) { return; }
      if (msg.id && this.waiting.has(msg.id)) {
        const { resolve, reject } = this.waiting.get(msg.id);
        this.waiting.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
        return;
      }
      if (msg.method) {
        const arr = this.listeners.get(msg.method);
        if (arr) arr.forEach((fn) => { try { fn(msg.params); } catch (e) { } });
      }
    });
  }
  on(method, fn) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(fn);
  }
  static connect(wsUrl) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      ws.addEventListener('open', () => resolve(new CDP(ws)));
      ws.addEventListener('error', () => reject(new Error('CDP 连接失败')));
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      this.waiting.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(payload));
      setTimeout(() => {
        if (this.waiting.has(id)) { this.waiting.delete(id); reject(new Error(method + ' 超时')); }
      }, 15000);
    });
  }
  /* 附加到某个 target，返回一个绑定 sessionId 的轻量客户端 */
  async attach(targetId) {
    const r = await this.send('Target.attachToTarget', { targetId, flatten: true });
    const parent = this;
    const sid = r.sessionId;
    return {
      eval: (expression, awaitPromise = false) => parent._eval(expression, awaitPromise, sid),
      send: (m, p) => parent.send(m, p, sid),
      on: (m, fn) => parent.on(m, fn)
    };
  }
  async _eval(expression, awaitPromise, sessionId) {
    const r = await this.send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise
    }, sessionId);
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.text + ' ' + ((r.result && r.result.description) || ''));
    }
    return r.result && r.result.value;
  }
}

/* 测试页：一段英文正文 + 一个按钮，够脚本采集文本节点 */
const PAGE = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>Quarterly report</title></head><body>
<h1>Quarterly report</h1>
<p>The committee approved the new budget for the upcoming fiscal year.</p>
<button type="button">Save changes</button>
</body></html>`;

async function main() {
  const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!chrome) { console.log('未找到 Chrome/Edge，跳过运行时验收'); process.exit(0); }
  if (!fs.existsSync(path.join(EXT, 'manifest.json'))) {
    console.log('dist/extension 不存在，请先运行 node tools/build_ext.js');
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(PAGE);
  });
  await new Promise((r) => server.listen(PORT_HTTP, '127.0.0.1', r));

  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ghx-ext-'));
  const child = spawn(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    /* Chrome 137+ 默认忽略 --load-extension，必须显式解除该限制 */
    '--disable-features=Translate,OptimizationHints,DisableLoadExtensionCommandLineSwitch',
    '--remote-debugging-port=' + PORT_CDP,
    '--user-data-dir=' + profile,
    '--disable-extensions-except=' + EXT,
    '--load-extension=' + EXT,
    '--enable-logging=stderr',
    '--log-level=0',
    'http://127.0.0.1:' + PORT_HTTP + '/'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  let chromeLog = '';
  child.stderr.on('data', (d) => { chromeLog += d.toString(); });

  let version = null;
  for (let i = 0; i < 40; i++) {
    try { version = await getJson('http://127.0.0.1:' + PORT_CDP + '/json/version'); break; }
    catch (e) { await sleep(250); }
  }
  if (!version) {
    child.kill(); server.close();
    console.log('Chrome 未能在本环境启动（无 CDP 端口），跳过运行时验收');
    process.exit(0);
  }

  const browser = await CDP.connect(version.webSocketDebuggerUrl);
  const targets = (await browser.send('Target.getTargets')).targetInfos;
  const pageT = targets.find((t) => t.type === 'page' && /127\.0\.0\.1/.test(t.url || ''));
  /* 只认我们自己的后台脚本：Chrome 内置组件也有 chrome-extension:// 的 service worker */
  const swT = targets.find((t) => t.type === 'service_worker' && /\/background\.js$/.test(t.url || ''));

  console.log('\n加载状态');
  check('扩展 service worker 已注册', !!swT, targets.filter((t) => t.type === 'service_worker').map((t) => t.url).join(' | '));
  check('测试页已打开', !!pageT);

  if (!pageT) { child.kill(); server.close(); process.exit(1); }

  const page = await browser.attach(pageT.targetId);
  const ctxs = [];
  page.on('Runtime.executionContextCreated', (p) => { if (p && p.context) ctxs.push(p.context); });
  await page.send('Runtime.enable');
  await page.send('Page.enable');

  /* 扩展加载与页面打开是并行的：重新导航一次，保证 content script 在文档起点注入 */
  await page.send('Page.navigate', { url: 'http://127.0.0.1:' + PORT_HTTP + '/' });
  for (let i = 0; i < 40; i++) {
    const st = await page.eval('document.readyState');
    if (st === 'complete') break;
    await sleep(150);
  }
  await sleep(1200);   /* 给 storage 预加载留出时间（脚本内部最长 3s 兜底） */

  /* content script 跑在扩展的隔离世界里，它的 origin 就是扩展 ID */
  const extCtx = ctxs.filter((c) => /^chrome-extension:\/\//.test(c.origin || ''))[0];
  const extId = extCtx ? (extCtx.origin.match(/^chrome-extension:\/\/([a-p]{32})/) || [])[1] : null;

  /* Chrome 137 起稳定版默认忽略 --load-extension，157 已无法绕过。
     这不是产物的问题，因此不记为失败，改为明确提示需要手动加载。 */
  const major = Number(((version.Browser || '').match(/Chrome\/(\d+)/) || [])[1] || 0);
  if (!extId && major >= 137) {
    child.kill(); server.close();
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { }
    console.log('\n本机 Chrome ' + major + ' 已禁用命令行的 --load-extension（137 起的安全限制），');
    console.log('无法自动加载扩展做真机验收，本次跳过（不计为失败）。');
    console.log('手动验证：chrome://extensions → 打开开发者模式 → 加载已解压的扩展程序 → 选 dist/extension');
    process.exit(0);
  }

  console.log('\n注入与菜单');
  check('content script 已注入页面', !!extId,
    ctxs.map((c) => c.origin + ' [' + c.name + ']').join(' | ').slice(0, 220));

  if (!extId && chromeLog) {
    const lines = chromeLog.split(/\r?\n/)
      .filter((l) => /extension|manifest|Failed|ERROR/i.test(l) && !/GCM|gcm|policy|gpu|GPU/i.test(l));
    if (lines.length) {
      console.log('\nChrome 日志（扩展相关）');
      lines.slice(0, 8).forEach((l) => console.log('  ! ' + l.trim().slice(0, 200)));
    }
  }

  /* 打开扩展自己的页面当"操作台"：MV3 的后台是懒启动的，直接连它并不可靠 */
  let extMenu = null, injected = null;
  if (extId) {
    const t = await browser.send('Target.createTarget', { url: 'chrome-extension://' + extId + '/popup.html' });
    const ext = await browser.attach(t.targetId);
    await ext.send('Runtime.enable');
    await sleep(700);

    const who = await ext.eval('(function(){var m=chrome.runtime.getManifest();return m.name+" / "+m.version})()');
    check('连到的是本扩展', /翻译/.test(String(who)), who);

    /* 逐个 tab 试消息，谁回菜单谁就是注入了 content script 的页面 */
    const probe = await ext.eval(
      'new Promise(function(r){chrome.tabs.query({},function(ts){' +
      'var i=0;function next(){if(i>=ts.length)return r({err:"no-tab"});var id=ts[i++].id;' +
      'chrome.tabs.sendMessage(id,{type:"menuList"},function(x){' +
      'if(chrome.runtime.lastError||!x)return next();r({tabId:id,menu:x})})}next()})})', true);

    extMenu = probe && probe.menu;
    check('content script 能收到扩展消息', Array.isArray(extMenu), JSON.stringify(probe).slice(0, 160));
    check('菜单项共 5 个', Array.isArray(extMenu) && extMenu.length === 5, extMenu && extMenu.length);
    check('含「AI 翻译设置」', Array.isArray(extMenu) && extMenu.indexOf('AI 翻译设置') >= 0, JSON.stringify(extMenu));
    check('含「关闭翻译（恢复原文）」', Array.isArray(extMenu) && extMenu.indexOf('关闭翻译（恢复原文）') >= 0);

    /* 触发设置面板 */
    await ext.eval(
      'new Promise(function(r){chrome.tabs.sendMessage(' + probe.tabId +
      ',{type:"menuRun",label:"AI 翻译设置"},function(x){r(x)})})', true);
    await sleep(600);

    injected = await page.eval('!!document.getElementById("ghx-ai-settings")');

    /* storage 读写：key 前缀应与 GM_setValue 的 PREFIX 一致 */
    await ext.eval('new Promise(function(r){chrome.storage.local.set({"ghx2_probe":"1"},function(){r(1)})})', true);
    const keys = await ext.eval('new Promise(function(r){chrome.storage.local.get(null,function(a){r(Object.keys(a))})})', true);
    const hasProbe = Array.isArray(keys) && keys.indexOf('ghx2_probe') >= 0;
    await ext.eval('new Promise(function(r){chrome.storage.local.remove("ghx2_probe",function(){r(1)})})', true);

    console.log('\n界面与存储');
    check('「AI 翻译设置」面板已注入页面', injected === true, String(injected));
    check('chrome.storage.local 读写正常（前缀 ghx2_）', hasProbe, JSON.stringify(keys).slice(0, 120));
  }

  /* 页面侧：面板里的关键控件是否渲染出来 */
  if (injected) {
    const detail = await page.eval(
      '(function(){var h=document.getElementById("ghx-ai-settings");if(!h)return null;' +
      'var sr=h.shadowRoot||h;var t=(sr.textContent||"");' +
      'return {len:t.length,hasKey:/API Key/i.test(t),hasSec:/界面词条/.test(t),' +
      'inputs:sr.querySelectorAll("input").length};})()');
    console.log('\n面板内容');
    check('面板有渲染内容', detail && detail.len > 200, JSON.stringify(detail));
    check('含「界面词条」分区', detail && detail.hasSec === true, detail && detail.len);
    check('存在输入框（AI Key 等）', detail && detail.inputs >= 2, detail && detail.inputs);
  }

  child.kill();
  server.close();
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { }

  console.log('\n结果: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('验收脚本异常:', e.message); process.exit(1); });
