#!/usr/bin/env node
/* 运行时行为测试：
 *   1) AI 优先，AI 不可用才走引擎链
 *   2) 纯英文页面自动翻译；中文页面不自动；可在设置里关闭
 * 用最小 DOM 桩在 vm 里加载 userscript，模拟 F9 / 页面就绪，检查请求与结果。
 * 用法: node tools/test_ai_first.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'AI-Web-Translation-Assistant.user.js'), 'utf8');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* GHX_TARGET=ext 时改跑扩展产物：内容脚本 + chrome.* 仿真，
   用来确认「同一份逻辑在扩展环境里行为不变」，而不只是油猴里能跑。 */
const EXT = process.env.GHX_TARGET === 'ext' || process.argv.includes('--ext');
const EXT_SRC = EXT
  ? fs.readFileSync(path.join(__dirname, '..', 'dist', 'extension', 'content.js'), 'utf8')
  : null;
const EXT_MENUS = ['AI 翻译设置', '立即更新词库', '上传词库增量到 GitHub', '提交词库 Issue', '关闭翻译（恢复原文）'];

function mockEl(tag) {
  const el = {
    tagName: tag || 'DIV',
    id: '',
    style: {},
    textContent: '',
    innerText: '',
    children: [],
    parentNode: null,
    classList: { contains: () => false, add() {}, remove() {} },
    getAttribute: () => null,
    setAttribute() {},
    hasAttribute: () => false,
    closest: () => null,
    appendChild(c) { c.parentNode = el; el.children.push(c); return c; },
    removeChild(c) { const i = el.children.indexOf(c); if (i >= 0) el.children.splice(i, 1); c.parentNode = null; return c; },
    querySelectorAll: () => [],
    attachShadow: () => ({ innerHTML: '', getElementById: () => null, querySelector: () => null, addEventListener() {} }),
    addEventListener() {}
  };
  return el;
}

async function run({ aiMode, texts, settings, host, lang, pageText, manual = true, presses = 1, snapshots = null, dictMode = 'off', waitDict = false, extraDict = null, contrib = null, contribHits = null, pushPerm = true, ghDirectFail = false, ghStatus = 0, storeMode = 'sync', transport = 'gm', noMenu = false, preWait = 0 }) {
  const calls = [];
  const payloads = [];
  const headers = [];
  const dictCalls = [];
  const ghCalls = [];
  const stored = {};
  const menus = {};
  const opened = [];
  if (contribHits) stored['ghx2_contrib_hits'] = JSON.stringify(contribHits);
  const dictPayload = () => {
    const d = {};
    for (let i = 0; i < 150; i++) d['filler key ' + i] = '填充' + i;
    Object.assign(d, extraDict || {});
    return JSON.stringify({ schema: 1, version: '2099.01.01', dict: d, patterns: [], cssRules: [] });
  };
  const timers = [];
  const domReady = [];
  let keyHandler = null;

  const body = mockEl('BODY');
  const htmlEl = mockEl('HTML');
  htmlEl.getAttribute = (k) => (k === 'lang' ? (lang || '') : null);

  const nodes = texts.map(t => {
    const p = mockEl('DIV');
    p.parentNode = body;
    return { nodeValue: t, parentNode: p, parentElement: p, nodeType: 3 };
  });
  let wi = 0;
  const walker = { nextNode: () => (wi < nodes.length ? nodes[wi++] : null) };

  const document = {
    body: null,                 // 加载期为 null：不挂设置按钮，只注册监听
    readyState: 'loading',      // 强制走 DOMContentLoaded 分支，测试里手动触发
    activeElement: null,
    documentElement: htmlEl,
    createTreeWalker: () => { wi = 0; return walker; },   // 每次新建遍历（真实浏览器行为），重置游标
    createElement: mockEl,
    getElementById: () => null,
    querySelectorAll: () => [],
    addEventListener: (type, fn) => {
      if (type === 'keydown') keyHandler = fn;
      else if (type === 'DOMContentLoaded') domReady.push(fn);
    },
    removeEventListener() {}
  };

  const aiSettings = JSON.stringify(Object.assign({
    enabled: true,
    autoTranslate: true,
    provider: 'nvidia',
    baseUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: 'test-key',
    model: 'test-model',
    batchSize: 20,
    maxChars: 200,
    timeout: 5000,
    thinkingOff: false,
    cache: false
  }, settings || {}));

  /* 扩展环境仿真：chrome.storage.local + runtime.sendMessage + onMessage */
  const extStore = {};
  const extListeners = [];
  if (EXT) {
    extStore['ghx2_ai_settings'] = aiSettings;
    if (contrib) extStore['ghx2_contrib_settings'] = JSON.stringify(contrib);
    Object.keys(stored).forEach((k) => { extStore[k] = stored[k]; });
  }

  const sandbox = {
    console, setTimeout, clearTimeout, JSON, Promise, WeakSet, Set, Map, Math, Date, Error, String, Object, Array, RegExp,
    NodeFilter: { SHOW_TEXT: 4 },
    btoa: s => Buffer.from(s, 'binary').toString('base64'),
    atob: s => Buffer.from(s, 'base64').toString('binary'),
    escape: escape, unescape: unescape,
    location: { hostname: host || 'example.com', href: 'https://' + (host || 'example.com') + '/' },
    document,
    GM_getValue: (k, d) => {
      if (k in stored) return stored[k];          // 先回读 GM_setValue 写入的值
      if (k === 'ghx2_ai_settings') return aiSettings;
      if (k === 'ghx2_contrib_settings' && contrib) return JSON.stringify(contrib);
      return d;
    },
    GM_setValue: (k, v) => { stored[k] = v; },
    GM_registerMenuCommand: (name, fn) => { menus[name] = fn; },
    GM_xmlhttpRequest: (o) => {
      calls.push(o.url);
      payloads.push(String(o.data || ''));
      headers.push(o.headers || {});
      timers.push(() => {
        if (/api\.github\.com/.test(o.url)) {
          const isMirror = /gh-proxy\.com/.test(o.url);
          ghCalls.push({ url: o.url, method: String(o.method || 'GET').toUpperCase(), data: String(o.data || ''), headers: o.headers || {} });
          if (ghDirectFail && !isMirror) { o.onerror(); return; }   // 模拟 api.github.com 被墙
          if (ghStatus && !isMirror) {                              // 模拟 GitHub 真的回了错误码
            o.onload({ status: ghStatus, responseText: '{"message":"Bad credentials"}' });
            return;
          }
          if (/\/issues$/.test(o.url)) {
            // 建单：返回编号与链接，带 labels 时回显，便于断言
            let sent = {};
            try { sent = JSON.parse(String(o.data || '{}')); } catch (e) { }
            o.onload({
              status: 201, responseText: JSON.stringify({
                number: 77, html_url: 'https://github.com/o/r/issues/77',
                labels: (sent.labels || []).map(n => ({ name: n }))
              })
            });
            return;
          }
          if (/api\.github\.com\/repos\/[^/]+\/[^/]+$/.test(o.url)) {
            // 仓库信息：permissions.push 决定能不能打标签
            o.onload({ status: 200, responseText: JSON.stringify({ permissions: { push: !!pushPerm, admin: !!pushPerm } }) });
            return;
          }
          o.onload({ status: 201, responseText: JSON.stringify({ content: { path: 'dict/contribs/x.json' } }) });
          return;
        }
        const isDict = /dict\/github\.zh-CN\.json/.test(o.url);
        if (isDict) {
          dictCalls.push(o.url);
          const nth = dictCalls.length;
          const okAt = dictMode === 'okFirst' ? 1 : dictMode === 'okThird' ? 3 : 0;
          if (okAt && nth === okAt) o.onload({ status: 200, responseText: dictPayload() });
          else if (dictMode === 'html') o.onload({ status: 200, responseText: '<html>mirror error</html>' });
          else o.onerror();
          return;
        }
        const isAI = /chat\/completions/.test(o.url);
        if (!isAI) { o.onerror(); return; }
        if (aiMode === 'fail') { o.onload({ status: 500, responseText: 'boom' }); return; }
        const payload = JSON.parse(o.data);
        const userMsg = payload.messages[1].content;
        const arr = JSON.parse(userMsg.slice(userMsg.indexOf('[')));
        const out = arr.map(t => '译:' + t);
        o.onload({ status: 200, responseText: JSON.stringify({ choices: [{ message: { content: JSON.stringify(out) } }] }) });
      });
    }
  };
  sandbox.open = (u) => { opened.push(u); return null; };
  sandbox.window = sandbox;

  /* ---- 各脚本管理器差异仿真 ----
   * storeMode：sync（篡改猴/暴力猴/脚本猫）| async（Greasemonkey 4 / Safari）| local（无接口）
   * transport：gm（GM_xmlhttpRequest）| gm4（GM.xmlHttpRequest）| fetch
   * noMenu：模拟没有菜单接口的管理器 */
  const gmReq = sandbox.GM_xmlhttpRequest;

  if (storeMode === 'async') {
    delete sandbox.GM_getValue;
    delete sandbox.GM_setValue;
    sandbox.GM = {
      getValue: (k) => {
        if (k in stored) return Promise.resolve(stored[k]);
        if (k === 'ghx2_ai_settings') return Promise.resolve(aiSettings);
        if (k === 'ghx2_contrib_settings' && contrib) return Promise.resolve(JSON.stringify(contrib));
        return Promise.resolve(undefined);
      },
      setValue: (k, v) => { stored[k] = v; return Promise.resolve(); },
      listValues: () => Promise.resolve(Object.keys(stored).concat(['ghx2_ai_settings']))
    };
  } else if (storeMode === 'local') {
    delete sandbox.GM_getValue;
    delete sandbox.GM_setValue;
    sandbox.localStorage = {
      _d: {},
      getItem(k) { return (k in this._d) ? this._d[k] : null; },
      setItem(k, v) { this._d[k] = String(v); }
    };
  }

  if (transport === 'gm4') {
    delete sandbox.GM_xmlhttpRequest;
    sandbox.GM = sandbox.GM || {};
    sandbox.GM.xmlHttpRequest = (o) => new Promise((resolve, reject) => {
      gmReq(Object.assign({}, o, {
        onload: resolve,
        onerror: () => reject(new Error('网络错误')),
        ontimeout: () => reject(new Error('请求超时')),
        onabort: () => reject(new Error('请求被中断'))
      }));
    });
  } else if (transport === 'fetch') {
    delete sandbox.GM_xmlhttpRequest;
    sandbox.fetch = (url, init) => new Promise((resolve, reject) => {
      gmReq({
        method: (init && init.method) || 'GET',
        url: url,
        headers: (init && init.headers) || {},
        data: init && init.body,
        onload: (rr) => resolve({ status: rr.status, text: () => Promise.resolve(rr.responseText || '') }),
        onerror: () => reject(new TypeError('Failed to fetch'))
      });
    });
  }

  if (noMenu) delete sandbox.GM_registerMenuCommand;

  if (EXT) {
    sandbox.chrome = {
      storage: {
        local: {
          get(keys, cb) {
            const r = Object.assign({}, extStore);
            if (typeof cb === 'function') { cb(r); return undefined; }
            return Promise.resolve(r);
          },
          set(obj, cb) {
            Object.assign(extStore, obj);
            Object.assign(stored, obj);           /* 断言仍读 stored */
            if (typeof cb === 'function') { cb(); return undefined; }
            return Promise.resolve();
          },
          remove(k, cb) {
            delete extStore[k];
            if (typeof cb === 'function') { cb(); return undefined; }
            return Promise.resolve();
          }
        }
      },
      runtime: {
        lastError: null,
        sendMessage(msg, cb) {
          if (msg && msg.type === 'xhr') {
            /* 内容脚本的 GM_xmlhttpRequest 最终落到这里，复用同一套请求桩 */
            sandbox.GM_xmlhttpRequest(Object.assign({}, msg.opts, {
              onload: (r) => cb({ status: r.status, statusText: r.statusText || '', text: r.responseText || '' }),
              onerror: (e) => cb({ error: (e && e.message) || '网络错误' })
            }));
            return;
          }
          if (cb) cb(undefined);
        },
        onMessage: { addListener: (fn) => { extListeners.push(fn); } }
      }
    };
  }

  vm.createContext(sandbox);
  vm.runInContext(EXT ? EXT_SRC : SRC, sandbox, { filename: 'script.js' });

  if (EXT) {
    /* 内容脚本要等 storage 快照回来才注册消息监听，这里补上菜单到测试桩 */
    await sleep(60);
    EXT_MENUS.forEach((n) => {
      menus[n] = () => extListeners.forEach((fn) => fn({ type: 'menuRun', label: n }, null, () => { }));
    });
  }

  document.body = body;
  body.textContent = pageText || '';
  body.innerText = pageText || '';

  const drain = async () => {
    for (let i = 0; i < 40; i++) {
      const batch = timers.splice(0, timers.length);
      if (batch.length) batch.forEach(f => f());
      await sleep(30);
      if (!timers.length && i > 6) break;
    }
  };
  const probe = () => ({
    calls: calls.map((u, i) => {
      if (/chat\/completions/.test(u)) {
        try {
          const p = JSON.parse(payloads[i]);
          const c = p.messages[1].content;
          return 'AI[' + c.slice(c.indexOf('[')) + ']';
        } catch (e) { return 'AI?'; }
      }
      if (/dict\/github\.zh-CN\.json/.test(u)) {
        const mh = u.match(/^https?:\/\/([^/]+)/);
        return '词库:' + (mh ? mh[1] : '?');
      }
      const m = u.match(/bing|mymemory|google/);
      return '引擎:' + (m ? m[0] : u.slice(0, 30));
    }),
    value: nodes.map(n => n.nodeValue).join(' | ')
  });

  if (waitDict) { await sleep(1400); await drain(); }
  if (preWait) { await sleep(preWait); }   /* 给异步存储的预读留出时间 */

  if (manual) {
    const snaps = [];
    for (let p = 0; p < (presses || 1); p++) {
      keyHandler({ key: 'F9', repeat: false, preventDefault() {}, stopPropagation() {} });
      await drain();                 // 每次按键后等本轮翻译完成，才能再次触发
      snaps.push(probe());
    }
    if (snapshots) snapshots.push(...snaps);
  } else {
    domReady.forEach(fn => fn());    // 触发 DOMContentLoaded → 800ms 后探测
    await sleep(950);
    await drain();
  }
  const toasts = () => (body.children || []).map(c => c.textContent).join(' ／ ');
  return {
    calls, payloads, headers, ghCalls, nodes, toasts, body, dictCalls, stored, menus, drain, opened,
    press: () => keyHandler({ key: 'F9', repeat: false, preventDefault() {}, stopPropagation() {} }),
    key: (k, mods) => {
      const ev = Object.assign({ key: k, repeat: false, preventDefault() { ev.defaultPrevented = true; }, stopPropagation() {} }, mods || {});
      keyHandler(ev);
      return ev;
    }
  };
}

const EN_PAGE = ('This is a long English article about distributed systems, rendering pipelines and browser engines. ' +
  'It contains enough words to be recognised as a non-Chinese page by the detector. ').repeat(6);

const ZH_PAGE = ('这是一个中文页面的正文内容，用来验证自动翻译的判定逻辑不会误触发。' +
  '页面里包含了足够多的汉字，因此不应该被识别成需要翻译的页面。').repeat(10);

const JA_PAGE = ('このページは日本語で書かれています。自動翻訳の判定ロジックを検証するための文章です。' +
  'ひらがなとカタカナと漢字が混在しているため、日本語として認識される必要があります。').repeat(6);

const DE_PAGE = ('Diese Seite ist auf Deutsch geschrieben und enthaelt genuegend Woerter, ' +
  'damit die Spracherkennung sie als nicht-chinesische Seite einstuft. ').repeat(6);

const TW_PAGE = ('這個頁面使用繁體中文撰寫，用來驗證自動翻譯的語種判斷邏輯是否正確。' +
  '裡面包含了足夠的漢字與繁體特徵字，因此應該被識別為需要轉換成簡體中文。').repeat(8);

(async () => {
  let pass = 0, fail = 0;
  const check = (name, cond, extra) => {
    if (cond) { pass++; console.log('  ✓ ' + name); }
    else { fail++; console.log('  ✗ ' + name + (extra ? ' → ' + extra : '')); }
  };
  const ai = r => r.calls.filter(u => /chat\/completions/.test(u));
  const engine = r => r.calls.filter(u => !/chat\/completions/.test(u) && !/dict\/github\.zh-CN\.json/.test(u));
  const dictReq = r => r.calls.filter(u => /dict\/github\.zh-CN\.json/.test(u));

  console.log('场景 1：F9 + AI 可用 → 全走 AI，不请求引擎');
  {
    const r = await run({ aiMode: 'ok', texts: ['Zebra crossing ahead', 'Quantum flux capacitor', 'Nimbus cloud layer'] });
    check('发出 AI 请求', ai(r).length === 1, 'ai=' + ai(r).length);
    check('无引擎请求', engine(r).length === 0, engine(r).join(','));
    check('节点已改写', r.nodes.every(n => /^译:/.test(n.nodeValue)), r.nodes.map(n => n.nodeValue).join(' | '));
  }

  console.log('场景 2：F9 + AI 返回 500 → 回退引擎链');
  {
    const r = await run({ aiMode: 'fail', texts: ['Zebra crossing ahead', 'Quantum flux capacitor'] });
    check('先试了 AI', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('失败后回退引擎', engine(r).length >= 1, 'engine=' + engine(r).length);
  }

  console.log('场景 3：未填 Key → 不发 AI，直接引擎');
  {
    const r = await run({ aiMode: 'ok', texts: ['Zebra crossing ahead', 'Quantum flux capacitor'], settings: { apiKey: '' } });
    check('没有 AI 请求', ai(r).length === 0, 'ai=' + ai(r).length);
    check('走了引擎', engine(r).length >= 1, 'engine=' + engine(r).length);
  }

  console.log('场景 4：超长段落（>150 词）→ 不交 AI');
  {
    const long = Array.from({ length: 160 }, (_, i) => 'word' + String.fromCharCode(97 + (i % 26))).join(' ');
    const r = await run({ aiMode: 'ok', texts: [long] });
    check('长文本未走 AI', ai(r).length === 0, 'ai=' + ai(r).length);
    check('长文本走了引擎', engine(r).length >= 1, 'engine=' + engine(r).length + ' calls=' + JSON.stringify(r.calls));
  }

  console.log('场景 5：GitHub + AI 可用 → 词库 + AI，不跑引擎');
  {
    const r = await run({ aiMode: 'ok', texts: ['Zebra crossing ahead', 'Quantum flux capacitor'], host: 'github.com' });
    check('走了 AI', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('无引擎请求', engine(r).length === 0, 'engine=' + engine(r).length);
  }

  console.log('场景 6：GitHub + AI 失败 → 引擎兜底');
  {
    const r = await run({ aiMode: 'fail', texts: ['Zebra crossing ahead', 'Quantum flux capacitor'], host: 'github.com' });
    check('失败后引擎兜底', engine(r).length >= 1, 'engine=' + engine(r).length);
  }

  console.log('场景 7：英文页面 → 不按 F9 自动翻译');
  {
    const r = await run({
      aiMode: 'ok', manual: false, lang: 'en', pageText: EN_PAGE,
      texts: ['Zebra crossing ahead', 'Quantum flux capacitor']
    });
    check('自动触发并走 AI', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('节点已被翻译', r.nodes.every(n => /^译:/.test(n.nodeValue)), r.nodes.map(n => n.nodeValue).join(' | '));
  }

  console.log('场景 8：简体中文页面（lang=zh-CN）→ 不自动翻译');
  {
    const r = await run({ aiMode: 'ok', manual: false, lang: 'zh-CN', pageText: ZH_PAGE, texts: ['一些中文文本内容'] });
    check('没有发起任何翻译请求', ai(r).length === 0 && engine(r).length === 0, r.calls.join(','));
  }

  console.log('场景 9：设置里关闭自动翻译 → 英文页面也不动');
  {
    const r = await run({
      aiMode: 'ok', manual: false, lang: 'en', pageText: EN_PAGE,
      settings: { autoTranslate: false }, texts: ['Zebra crossing ahead']
    });
    check('没有发起任何翻译请求', ai(r).length === 0 && engine(r).length === 0, r.calls.join(','));
    check('节点保持原文', r.nodes[0].nodeValue === 'Zebra crossing ahead', r.nodes[0].nodeValue);
  }

  console.log('场景 10：简体中文页面但 lang 缺失 → 靠字符统计，不翻');
  {
    const r = await run({ aiMode: 'ok', manual: false, lang: '', pageText: ZH_PAGE, texts: ['一些中文文本内容'] });
    check('没有发起任何翻译请求', ai(r).length === 0 && engine(r).length === 0, r.calls.join(','));
  }

  console.log('场景 11：日文页面 → 自动翻译');
  {
    const r = await run({ aiMode: 'ok', manual: false, lang: 'ja', pageText: JA_PAGE, texts: ['設定を変更する'] });
    check('自动触发', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('日文节点被翻译', /^译:/.test(r.nodes[0].nodeValue), r.nodes[0].nodeValue);
  }

  console.log('场景 12：繁体中文页面（lang 缺失，靠繁体特征字）→ 自动转简体');
  {
    const r = await run({ aiMode: 'ok', manual: false, lang: '', pageText: TW_PAGE, texts: ['這個設定需要修改'] });
    check('自动触发', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('繁体节点被翻译', /^译:/.test(r.nodes[0].nodeValue), r.nodes[0].nodeValue);
  }

  console.log('场景 13：德文页面 → 自动翻译');
  {
    const r = await run({ aiMode: 'ok', manual: false, lang: 'de', pageText: DE_PAGE, texts: ['Datei bearbeiten'] });
    check('自动触发', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('德文节点被翻译', /^译:/.test(r.nodes[0].nodeValue), r.nodes[0].nodeValue);
  }

  console.log('场景 14：再次按 F9 → 恢复原文并重新翻译（缓存旁路）');
  {
    const snaps = [];
    const r = await run({
      aiMode: 'ok', manual: true, presses: 2, snapshots: snaps,
      texts: ['Zebra crossing ahead'], settings: { cache: true }
    });
    snaps.forEach((s, i) => console.log(`   第${i + 1}次F9后: calls=${s.calls} 节点=${JSON.stringify(s.value)}`));
    check('两次都走了 AI（第二次绕过缓存）', ai(r).length >= 2, 'ai=' + ai(r).length);
    check('节点最终为译文', /^译:/.test(r.nodes[0].nodeValue), r.nodes[0].nodeValue);
  }

  console.log('场景 15：词库同步 —— 4 个源全部失败');
  {
    const r = await run({
      aiMode: 'ok', host: 'github.com', waitDict: true, dictMode: 'fail',
      texts: ['Zebra crossing ahead']
    });
    const hosts = dictReq(r).map(u => (u.match(/^https?:\/\/([^/]+)/) || ['', '?'])[1]);
    check('4 个源都试过', dictReq(r).length === 4, 'dict=' + dictReq(r).length);
    check('首个是 GitHub 原始地址', /raw\.githubusercontent/.test(hosts[0] || ''), hosts.join(' > '));
    check('第二个是 gh-proxy 反代', /gh-proxy/.test(hosts[1] || ''), hosts.join(' > '));
    check('未写入词库缓存', !r.stored['ghx2_dict_meta'] && !r.stored['ghx2_dict_remote'], JSON.stringify(Object.keys(r.stored)));
    check('翻译不受影响', ai(r).length >= 1, 'ai=' + ai(r).length);
  }

  console.log('场景 16：第 3 个源成功 → 停止尝试、缓存并合并词条');
  {
    const r = await run({
      aiMode: 'ok', host: 'github.com', waitDict: true, dictMode: 'okThird',
      extraDict: { 'zebra crossing ahead': '斑马线在前方' },
      texts: ['Zebra crossing ahead']
    });
    check('只试了 3 个源就停', dictReq(r).length === 3, 'dict=' + dictReq(r).length);
    const meta = JSON.parse(r.stored['ghx2_dict_meta'] || '{}');
    check('记录版本与来源', meta.version === '2099.01.01' && /jsDelivr/.test(meta.source || ''), JSON.stringify(meta));
    check('词库写入本机缓存', !!r.stored['ghx2_dict_remote'], String(r.stored['ghx2_dict_remote'] || '').length + ' 字节');
    check('远端词条即刻生效、不再请求 AI',
      r.nodes[0].nodeValue === '斑马线在前方' && ai(r).length === 0,
      r.nodes[0].nodeValue + ' | ai=' + ai(r).length);
  }

  console.log('场景 17：镜像返回 HTML 错误页 → 判为失败并继续换源');
  {
    const r = await run({ aiMode: 'ok', host: 'github.com', waitDict: true, dictMode: 'html', texts: ['Zebra crossing ahead'] });
    check('4 个源都试过', dictReq(r).length === 4, 'dict=' + dictReq(r).length);
    check('未写入无效词库', !r.stored['ghx2_dict_meta'], JSON.stringify(Object.keys(r.stored)));
  }

  console.log('场景 18：菜单「关闭翻译」→ 恢复原文，再按 F9 可重新翻译');
  {
    const r = await run({ aiMode: 'ok', texts: ['Zebra crossing ahead', 'Quantum flux capacitor'], presses: 1 });
    check('F9 后已翻译', r.nodes.every(n => /^译:/.test(n.nodeValue)), r.nodes.map(n => n.nodeValue).join(' | '));
    const closeFn = r.menus['关闭翻译（恢复原文）'];
    check('菜单项已注册', typeof closeFn === 'function', typeof closeFn);
    closeFn();
    check('节点恢复原文', r.nodes.every(n => !/^译:/.test(n.nodeValue)), r.nodes.map(n => n.nodeValue).join(' | '));
    check('提示恢复数量', /恢复原文 2 处/.test(r.toasts()), r.toasts());
    r.press();
    let done = false;
    for (let i = 0; i < 30 && !done; i++) {           // 执行响应回调并轮询等待第二轮 AI 完成
      await r.drain();
      done = r.nodes.every(n => /^译:/.test(n.nodeValue));
    }
    check('再次 F9 重新翻译', ai(r).length >= 2 && done,
      'ai=' + ai(r).length + ' 节点=' + r.nodes.map(n => n.nodeValue).join(' | '));
  }

  console.log('场景 19：词条回传 —— 采集未命中词条并推送到 GitHub');
  {
    const r = await run({
      aiMode: 'ok', texts: ['Zebra crossing ahead'],
      contrib: { enabled: true, token: 'test-token-abc123', repo: 'lengxiaobingege/AI-Web-Translation-Assistant' }
    });
    const hits = JSON.parse(r.stored['ghx2_contrib_hits'] || '{}');
    check('采集到 AI 译文', hits['Zebra crossing ahead'] === '译:Zebra crossing ahead', JSON.stringify(hits));
    const upload = r.menus['上传词库增量到 GitHub'];
    check('上传菜单已注册', typeof upload === 'function', typeof upload);
    upload();
    await r.drain();
    check('发出 Contents API 请求', r.ghCalls.length === 1, JSON.stringify(r.ghCalls.map(c => c.url)));
    if (r.ghCalls.length) {
      const c = r.ghCalls[0];
      check('推送到 dict/contribs/ 目录', /\/contents\/dict\/contribs\/contrib-\d{8}-\d{6}\.json$/.test(c.url), c.url);
      check('带 Authorization 头', /^Bearer test-token/.test(c.headers.Authorization || ''), c.headers.Authorization);
      const body = JSON.parse(c.data);
      check('content 为 base64 且可解码', typeof body.content === 'string' &&
        JSON.parse(Buffer.from(body.content, 'base64').toString('utf8')).hits['Zebra crossing ahead'] === '译:Zebra crossing ahead');
    }
    check('上传成功后本地清单清空', r.stored['ghx2_contrib_hits'] === '{}', r.stored['ghx2_contrib_hits']);
  }

  console.log('场景 20：未填 Token 时上传 → 提示先配置；快捷键不干扰 F9');
  {
    const r = await run({ aiMode: 'ok', texts: ['Zebra crossing ahead'], contrib: { enabled: true, token: '' } });
    r.menus['上传词库增量到 GitHub']();
    await r.drain();
    check('提示先填 Token', r.ghCalls.length === 0 && /Token/.test(r.toasts()), r.toasts());
    const ev = r.key('n', { altKey: true });
    check('Alt+N 被快捷键处理（preventDefault）', ev.defaultPrevented === true);
    r.press();
    await r.drain();
    check('F9 仍正常翻译', r.nodes[0].nodeValue === '译:Zebra crossing ahead', r.nodes[0].nodeValue);
  }

  console.log('场景 21：提交 Issue —— 分批续提、URL 长度受控');
  {
    const hits = {};
    for (let i = 0; i < 400; i++) hits['filler phrase ' + i + ' for issue test'] = '填充短语' + i;
    const r = await run({
      aiMode: 'ok', texts: ['Zebra crossing ahead'],
      contrib: { enabled: true, token: '' }, contribHits: hits
    });
    const issue = r.menus['提交词库 Issue'];
    check('菜单项已注册', typeof issue === 'function', typeof issue);
    issue();
    const url1 = r.opened[0] || '';
    check('打开预填 Issue', r.opened.length === 1 && /\/issues\/new\?title=/.test(url1), url1.slice(0, 60));
    check('URL 长度在 8000 以内', url1.length <= 8000, url1.length + ' 字符');
    const body1 = decodeURIComponent((url1.match(/body=([\s\S]*)$/) || [])[1] || '');
    const lines1 = body1.split('\n').filter(l => /^- /.test(l));
    check('正文带 ghx-contrib 标记', body1.startsWith('<!-- ghx-contrib -->'), body1.slice(0, 24));
    check('本次条数不超过 300', lines1.length > 0 && lines1.length <= 300, lines1.length + ' 条');
    check('提示剩余条数', /还剩 \d+ 条/.test(r.toasts()), r.toasts());
    const first1 = lines1[0];

    issue();
    const url2 = r.opened[1] || '';
    const body2 = decodeURIComponent((url2.match(/body=([\s\S]*)$/) || [])[1] || '');
    const lines2 = body2.split('\n').filter(l => /^- /.test(l));
    check('第二次接着提剩下的', !!lines2[0] && lines2[0] !== first1,
      (lines2[0] || '').slice(0, 44) + ' <> ' + first1.slice(0, 44));
    check('已提交标记累加记录',
      (JSON.parse(r.stored['ghx2_contrib_sent'] || '[]')).length === lines1.length + lines2.length,
      String((JSON.parse(r.stored['ghx2_contrib_sent'] || '[]')).length));
  }

  console.log('场景 22：有 Token 时直接建 Issue —— 维护者带「词库贡献」标签、只读 Token 不带、60 秒冷却');
  {
    const hits = {};
    for (let i = 0; i < 320; i++) hits['token filler phrase ' + i + ' here'] = '令牌填充' + i;

    // 22a：维护者（有 push 权限）→ 先查仓库权限，再建单并带标签
    {
      const r = await run({
        aiMode: 'ok', texts: ['Zebra crossing ahead'],
        contrib: { enabled: true, token: 'dummy-owner-token' }, contribHits: hits
      });
      r.menus['提交词库 Issue']();
      await r.drain();
      const gh = r.ghCalls.filter(c => /api\.github\.com/.test(c.url));
      check('先查仓库权限', /^GET$/.test(gh[0] && gh[0].method) && /\/repos\/[^/]+\/[^/]+$/.test(gh[0].url), (gh[0] || {}).url);
      const postCall = gh.find(c => /\/issues$/.test(c.url));
      check('再用 API 建单', !!postCall && postCall.method === 'POST', (postCall || {}).url);
      let sent = {};
      try { sent = JSON.parse((postCall || {}).data || '{}'); } catch (e) { }
      check('带「词库贡献」标签', Array.isArray(sent.labels) && sent.labels[0] === '词库贡献', JSON.stringify(sent.labels));
      const lines = String(sent.body || '').split('\n').filter(l => /^- /.test(l));
      check('正文条数取满 300 上限', lines.length === 300, lines.length + ' 条');
      check('正文带 ghx-contrib 标记', String(sent.body || '').startsWith('<!-- ghx-contrib -->'), String(sent.body || '').slice(0, 24));
      check('Authorization 用 Bearer', /^Bearer /.test((postCall || {}).headers.Authorization || ''), (postCall || {}).headers.Authorization);
      check('提示含 Issue 编号', /#77/.test(r.toasts()), r.toasts().slice(-80));
      // 采集队列里还会有一条页面 AI 译文，剩余量按实际队列算，不写死
      const totalKeys = Object.keys(JSON.parse(r.stored['ghx2_contrib_hits'] || '{}')).length;
      check('提示剩余条数正确', new RegExp('还剩 ' + (totalKeys - lines.length) + ' 条').test(r.toasts()),
        '总数 ' + totalKeys + ' / 未提 ' + (totalKeys - lines.length) + '：' + r.toasts().slice(-60));
      check('未走浏览器窗口', r.opened.length === 0, String(r.opened.length));

      // 22b：冷却期内再点 → 不发请求，提示等待
      const before = r.ghCalls.length;
      r.menus['提交词库 Issue']();
      await r.drain();
      check('冷却期内不再建单', r.ghCalls.length === before, r.ghCalls.length + ' vs ' + before);
      check('提示稍后再提', /秒后可再提/.test(r.toasts()), r.toasts().slice(-60));
    }

    // 22c：只读 Token（无 push 权限）→ 建单但不带标签，避免被 GitHub 退回
    {
      const r = await run({
        aiMode: 'ok', texts: ['Zebra crossing ahead'], pushPerm: false,
        contrib: { enabled: true, token: 'dummy-readonly-token' }, contribHits: hits
      });
      r.menus['提交词库 Issue']();
      await r.drain();
      const postCall = r.ghCalls.find(c => /\/issues$/.test(c.url));
      let sent = {};
      try { sent = JSON.parse((postCall || {}).data || '{}'); } catch (e) { }
      check('只读 Token 仍能建单', !!postCall, (postCall || {}).url);
      check('不带标签', sent.labels === undefined, JSON.stringify(sent.labels));
      check('正文仍完整提交', String(sent.body || '').indexOf('<!-- ghx-contrib -->') === 0, String(sent.body || '').slice(0, 24));
    }
  }

  console.log('场景 23：api.github.com 直连不通 → 自动换 gh-proxy 镜像完成写入');
  {
    const r = await run({
      aiMode: 'ok', texts: ['Zebra crossing ahead'],
      contrib: { enabled: true, token: 'dummy-owner-token' },
      contribHits: { 'mirror probe phrase here': '镜像探针' }, ghDirectFail: true
    });
    r.menus['上传词库增量到 GitHub']();
    await r.drain();
    const urls = r.ghCalls.map(c => c.url);
    check('先尝试直连', /^https:\/\/api\.github\.com\//.test(urls[0] || ''), (urls[0] || '').slice(0, 50));
    check('直连失败后换镜像', /gh-proxy\.com\/https:\/\/api\.github\.com\//.test(urls[1] || ''), (urls[1] || '').slice(0, 70));
    check('镜像写入成功', /已上传/.test(r.toasts()), r.toasts().slice(-70));
    const left = Object.keys(JSON.parse(r.stored['ghx2_contrib_hits'] || '{}')).length;
    check('本地清单已清空', left === 0, String(left));

    // 23b：GitHub 真的回了 401（Token 错）→ 报错，不换镜像重复提交
    const r2 = await run({
      aiMode: 'ok', texts: ['Zebra crossing ahead'],
      contrib: { enabled: true, token: 'dummy-bad-token' },
      contribHits: { 'bad token probe here': '坏令牌' }, ghStatus: 401
    });
    r2.menus['上传词库增量到 GitHub']();
    await r2.drain();
    check('401 不重试镜像', r2.ghCalls.length === 1, r2.ghCalls.length + ' 次请求');
    check('提示 HTTP 401', /401/.test(r2.toasts()), r2.toasts().slice(-70));
  }

  /* 场景 24–28 只针对用户脚本环境：扩展版的存储与跨域由 chrome.* 承担，无法也用不着伪造 */
  if (!EXT) {

  console.log('场景 24：只有异步存储接口（Greasemonkey 4 / Safari Userscripts）→ 先预读再翻译');
  {
    const r = await run({
      aiMode: 'ok', host: 'example.com', texts: ['Zebra crossing ahead'],
      storeMode: 'async', preWait: 240
    });
    check('配置被预读出来，AI 已调用', ai(r).length >= 1, 'ai=' + ai(r).length);
    check('译文落到页面', /^译:/.test(r.nodes[0].nodeValue), r.nodes[0].nodeValue);
  }

  console.log('场景 25：对照组 —— 完全没有存储接口 → 读不到 Key，回退引擎链');
  {
    const r = await run({
      aiMode: 'ok', host: 'example.com', texts: ['Zebra crossing ahead'],
      storeMode: 'local', preWait: 240
    });
    check('没有 AI 请求', ai(r).length === 0, 'ai=' + ai(r).length);
    check('改用引擎链', engine(r).length >= 1, 'engine=' + engine(r).length);
  }

  console.log('场景 26：没有 GM_xmlhttpRequest，走 GM.xmlHttpRequest（GM4 风格）→ 词库同步成功');
  {
    const r = await run({
      aiMode: 'ok', host: 'github.com', waitDict: true, dictMode: 'okFirst',
      transport: 'gm4', extraDict: { 'zebra crossing ahead': '斑马线在前方' },
      texts: ['Zebra crossing ahead']
    });
    const meta = JSON.parse(r.stored['ghx2_dict_meta'] || '{}');
    check('词库写入本机缓存', !!r.stored['ghx2_dict_remote'], Object.keys(r.stored).join(','));
    check('记录了版本', meta.version === '2099.01.01', JSON.stringify(meta).slice(0, 90));
    check('远端词条生效、不请求 AI', r.nodes[0].nodeValue === '斑马线在前方' && ai(r).length === 0,
      r.nodes[0].nodeValue + ' | ai=' + ai(r).length);
  }

  console.log('场景 27：两个跨域接口都没有，退回 fetch → 词库仍能同步');
  {
    const r = await run({
      aiMode: 'ok', host: 'github.com', waitDict: true, dictMode: 'okFirst',
      transport: 'fetch', extraDict: { 'zebra crossing ahead': '斑马线在前方' },
      texts: ['Zebra crossing ahead']
    });
    check('fetch 路径取到词库', !!r.stored['ghx2_dict_remote'], Object.keys(r.stored).join(','));
    check('远端词条生效', r.nodes[0].nodeValue === '斑马线在前方', r.nodes[0].nodeValue);
  }

  console.log('场景 28：管理器没有菜单接口 → 启动后提示怎么打开设置');
  {
    const r = await run({
      aiMode: 'ok', host: 'example.com', texts: ['Zebra crossing ahead'],
      noMenu: true, manual: true, presses: 0, preWait: 1750
    });
    check('未注册任何菜单', Object.keys(r.menus).length === 0, JSON.stringify(Object.keys(r.menus)));
    check('提示了快捷键', /Alt\+N/.test(r.toasts()), r.toasts().slice(-100));
  }

  }

  console.log('\n结果: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
