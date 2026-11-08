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

async function run({ aiMode, texts, settings, host, lang, pageText, manual = true, presses = 1, snapshots = null, dictMode = 'off', waitDict = false, extraDict = null }) {
  const calls = [];
  const payloads = [];
  const dictCalls = [];
  const stored = {};
  const menus = {};
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

  const sandbox = {
    console, setTimeout, clearTimeout, JSON, Promise, WeakSet, Set, Map, Math, Date, Error, String, Object, Array, RegExp,
    NodeFilter: { SHOW_TEXT: 4 },
    location: { hostname: host || 'example.com', href: 'https://' + (host || 'example.com') + '/' },
    document,
    GM_getValue: (k, d) => (k === 'ghx2_ai_settings' ? aiSettings : d),
    GM_setValue: (k, v) => { stored[k] = v; },
    GM_registerMenuCommand: (name, fn) => { menus[name] = fn; },
    GM_xmlhttpRequest: (o) => {
      calls.push(o.url);
      payloads.push(String(o.data || ''));
      timers.push(() => {
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
  sandbox.window = sandbox;

  vm.createContext(sandbox);
  vm.runInContext(SRC, sandbox, { filename: 'script.js' });

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
    calls, payloads, nodes, toasts, body, dictCalls, stored, menus, drain,
    press: () => keyHandler({ key: 'F9', repeat: false, preventDefault() {}, stopPropagation() {} })
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

  console.log('场景 15：词库同步 —— 5 个源全部失败');
  {
    const r = await run({
      aiMode: 'ok', host: 'github.com', waitDict: true, dictMode: 'fail',
      texts: ['Zebra crossing ahead']
    });
    const hosts = dictReq(r).map(u => (u.match(/^https?:\/\/([^/]+)/) || ['', '?'])[1]);
    check('依次试了 5 个源', dictReq(r).length === 5, 'dict=' + dictReq(r).length);
    check('首个是 GitHub 原始地址', /raw\.githubusercontent/.test(hosts[0] || ''), hosts.join(' > '));
    check('末个是镜像反代', /ghfast/.test(hosts[4] || ''), hosts.join(' > '));
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
    check('5 个源都试过', dictReq(r).length === 5, 'dict=' + dictReq(r).length);
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

  console.log('\n结果: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})();
