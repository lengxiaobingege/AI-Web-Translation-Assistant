// ==UserScript==
// 二创说明：本脚本为二次创作，由 lengxiaobingege（https://github.com/lengxiaobingege）编写。
//           基于以下两个独立项目的脚本合并改编：
//             - https://github.com/k1995/github-i18n-plugin（GitHub 汉化部分）
//             - https://github.com/syhyz1990/translate（超级翻译助手部分）
//           来源脚本及词库等相关权利归原作者所有，本脚本仅包含合并与二创新增内容。
// @name        AI-Web-Translation-Assistant.
// @name:zh-CN  AI网页翻译助手
// @namespace   https://github.com/lengxiaobingege/AI-Web-Translation-Assistant.
// @version     2.0.0
// @description 合并版：翻译仅由 F9 触发；另提供「AI 翻译设置」入口（篡改猴菜单或左下浮动按钮）用于配置大模型，不触发翻译。
// @icon       data:image/png;base64,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
// @match       *://*/*
// @run-at      document-idle
// @noframes
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @connect     cn.bing.com
// @connect     www.bing.com
// @connect     translate.googleapis.com
// @connect     api.mymemory.translated.net
// @connect     integrate.api.nvidia.com
// @connect     api.deepseek.com
// @connect     api.openai.com
// @connect     dashscope.aliyuncs.com
// @connect     open.bigmodel.cn
// @connect     api.moonshot.cn
// @connect     api.siliconflow.cn
// @connect     gitcn.org
// @license     MIT
// ==/UserScript==

/*
 * ============================ 保留的功能 ============================
 * A. 超级翻译助手（修复版 1.2.0）
 *    Bing -> MyMemory -> Google 引擎链（含 Bing 鉴权失败强制刷新重试、
 *    上次成功引擎优先）、guessLang 源语言粗判、splitText 长文本分段、
 *    各引擎长度上限。源语言默认 auto，目标语言默认简体中文 zh-CN（CFG 可改）。
 *    适用 GitHub/gist 以外的整页翻译；在 GitHub 上仅作为 AI 补译失败时的兜底。
 * B. GitHub 汉化插件（加固版 v1.2.0）
 *    内联 1689 条词库 + CSS 规则、原生 DOM 精确/拆分翻译、input placeholder /
 *    value / aria-label、相对时间中文化、代码/文件名/路径等排除规则。
 *    仅 github.com / gist.github.com 生效，目标语言固定简体中文。
 *    GitHub 官方 Octocat 图标保留。
 *
 * ============================ F9 触发行为 ============================
 *   唯一翻译触发：document 捕获阶段仅 1 个 keydown 监听，ev.key === 'F9'。
 *   除 F9 之外脚本不自动翻译、无划词、无 MutationObserver、
 *   不自动扫描页面、无自动轮询或定时触发；页面加载后不改动任何页面内容。
 *   （唯一的 DOMContentLoaded 监听只用于挂载左下角「AI 设置」按钮，不读页面文本）
 *   一次 TreeWalker 收集文本节点（共享给两个模块，避免重复遍历），按站点分流：
 *     GitHub/gist -> 词库汉化 + 属性 + 相对时间 + CSS 规则 -> AI 批量补译剩余
 *                    英文 -> 有批次失败时引擎链兜底。
 *     其它站点   -> 引擎链整页翻译（去重 + 并发 + 译文缓存 + 节点上限）。
 *   执行中 running 锁，连按/长按不重复；焦点在输入框或可编辑区时跳过，不劫持打字。
 *
 * ==================== AI 翻译设置（大模型） ====================
 *   入口（仅配置，不触发翻译）：
 *     - 篡改猴菜单命令「AI 翻译设置」
 *     - 页面左下浮动「AI 设置」按钮
 *   面板（Shadow DOM，隔离 GitHub 样式）可填：provider / baseUrl / API Key /
 *   model / batchSize / maxChars / timeout / thinkingOff / cache。
 *   保存到本机篡改猴存储（键名 ghx2_ai_settings），F9 执行时读取；
 *   「测试连接」用面板当前值发一次真实请求验证可用性。
 *   公开版本内置 NVIDIA API Key 已置空，请填入自己的 Key；
 *   或 provider 填 builtin 使用浏览器内置 AI（免 Key）。
 *
 * ==================== 需人工确认的限制 ====================
 *  1) @icon 只保留 GitHub 官方 Octocat；若想用翻译助手图标，替换头部 @icon 行。
 *  2) GitHub 上 AI 补译成功即不跑引擎链，避免同一节点被翻两次；
 *     想强制机翻：CFG.githubFallback = 'always'。
 *  3) 整页机翻对去重后每个文本节点发一次请求，默认上限 80 个、并发 3；
 *     Bing / MyMemory 为免费公共接口，量大可能限流，可在 CFG 调整。
 *  4) F9 可能被浏览器或网页占用；已用捕获阶段 + preventDefault 抢占，
 *     个别站点仍可能冲突。
 *  5) 首次调用新 AI 域名时篡改猴可能弹跨域授权；@connect 已预置常用域名，
 *     新域名需在脚本头部 @connect 补充。
 */

(function () {
'use strict';

/* 双脚本合并后只允许存在一个实例，避免 F9 双触发 */
if (window.__GHX_F9_MERGED__) return;
window.__GHX_F9_MERGED__ = true;

/* ==================== 统一配置（唯一配置入口，无 UI） ==================== */
var CFG = {
  /* A 超级翻译助手 */
  from: 'auto',                 /* 源语言：auto / en / ja / ko / ru ... */
  to: 'zh-CN',                  /* 目标语言：默认简体中文 */
  engine: 'auto',               /* auto / bing / mymemory / google */
  pageNodeLimit: 80,            /* 整页机翻最多处理的文本节点数 */
  concurrency: 3,               /* 整页机翻并发数 */
  scanNodeLimit: 2500,          /* 单次 TreeWalker 收集上限 */
  /* B GitHub 汉化 */
  githubLang: 'zh-CN',          /* 设为 'off' 可关闭 GitHub 汉化 */
  descTranslate: false,         /* 仓库描述翻译按钮已移除（接口 400） */
  githubFallback: 'onFailure',  /* onFailure | always | never：AI 失败时是否用引擎链兜底 */
  ai: {
    enabled: true,
    provider: 'nvidia',
    baseUrl: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: '',
    model: 'nvidia/nemotron-3.5-super-vl-120b-a12b',
    thinkingOff: true,          /* Nemotron 推理模型关闭思考：4.2s / 105 token */
    timeout: 60000,
    batchSize: 20,
    maxChars: 120,
    cache: true
  }
};

/* ==================== 共享基础设施（全脚本仅一份） ==================== */
var PREFIX = 'ghx2_';          /* 统一配置/缓存键前缀，避免与两个原脚本冲突 */
var Store = {
  get: function (k, d) {
    try {
      if (typeof GM_getValue === 'function') {
        var v = GM_getValue(PREFIX + k, d);
        return (v === undefined || v === null || v === '') ? d : v;
      }
    } catch (e) { }
    try { var s = localStorage.getItem(PREFIX + k); return s === null ? d : s; } catch (e) { return d; }
  },
  set: function (k, v) {
    try { if (typeof GM_setValue === 'function') { GM_setValue(PREFIX + k, v); return; } } catch (e) { }
    try { localStorage.setItem(PREFIX + k, String(v)); } catch (e) { }
  }
};

/* 唯一的跨域请求封装（Promise 版，两个模块共用） */
function xhr(opts) {
  return new Promise(function (resolve, reject) {
    if (typeof GM_xmlhttpRequest !== 'function') {
      reject(new Error('脚本管理器未授权跨域请求（GM_xmlhttpRequest）')); return;
    }
    var done = false;
    function finish(fn, arg) { if (!done) { done = true; fn(arg); } }
    GM_xmlhttpRequest({
      method: opts.method || 'GET',
      url: opts.url,
      headers: opts.headers || {},
      data: opts.data,
      timeout: opts.timeout || 12000,
      responseType: opts.responseType || 'text',
      onload: function (r) {
        if (r.status >= 200 && r.status < 300) finish(resolve, r.responseText || '');
        else finish(reject, new Error('HTTP ' + r.status + ' ' + String(r.responseText || '').slice(0, 100)));
      },
      onerror: function () { finish(reject, new Error('网络错误')); },
      ontimeout: function () { finish(reject, new Error('请求超时')); },
      onabort: function () { finish(reject, new Error('请求被中断')); }
    });
  });
}

/* 唯一的提示条 */
function toast(msg) {
  var d = document.createElement('div');
  d.textContent = '[F9 汉化/翻译] ' + msg;
  d.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;background:#24292f;color:#fff;padding:10px 14px;border-radius:8px;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:380px;';
  document.body.appendChild(d);
  setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 4200);
}

/* 共享的排除规则 / 已处理标记（两个模块与统一遍历共用） */
var DONE = new WeakSet();
var MARC = 'data-ghx-t';
function isMarked(el) { return el.hasAttribute && el.hasAttribute(MARC); }
var EXCLUDE_IDS = ["readme", "file-name-editor-breadcrumb", "StickyHeader", "sticky-file-name-id", "sticky-breadcrumb"];
var EXCLUDE_CLASSES = ["markdown-body", "blob-code", "cm-editor", "CodeMirror", "js-navigation-container", "react-code-lines", "react-code-lines-highlighted", "diff-table", "file-header", "js-path-segment", "final-path", "search-input-container", "topic-tag", "repo", "react-tree-show-tree-items", "search-results-container", "pagination", "toc-overlay-content", "table-list", "diffstat", "float-right", "Label"];
var EXCLUDE_ANCESTORS = ["code", "pre", "kbd", "samp", ".markdown-body", ".blob-code", ".code", ".diff-view", ".CodeMirror", ".cm-editor", ".js-navigation-container", ".react-code-lines", ".search-results-container", ".table-list", "[role=\"tree\"]", ".toc-overlay-content", ".pagination"];

function shouldSkipElement(el) {
  var T = el.tagName;
  if (T === 'SCRIPT' || T === 'STYLE' || T === 'NOSCRIPT' || T === 'TEMPLATE' ||
      T === 'SVG' || T === 'MATH' || T === 'IFRAME' || T === 'OBJECT' ||
      T === 'CODE' || T === 'PRE' || T === 'KBD' || T === 'SAMP' ||
      T === 'DATA' || T === 'TT' || T === 'VAR') return true;
  if (el.id && EXCLUDE_IDS.indexOf(el.id) !== -1) return true;
  var ip = el.getAttribute && el.getAttribute('itemprop');
  if (ip && /\bname\b/.test(ip)) return true;
  if (el.classList) {
    for (var i = 0; i < EXCLUDE_CLASSES.length; i++) {
      if (el.classList.contains(EXCLUDE_CLASSES[i])) return true;
    }
  }
  if (el.closest) {
    for (var j = 0; j < EXCLUDE_ANCESTORS.length; j++) {
      if (el.closest(EXCLUDE_ANCESTORS[j])) return true;
    }
  }
  return false;
}

/* 唯一的文本节点遍历：F9 时跑一次，结果共享给汉化 / AI 补译 / 整页机翻 */
function collectTextNodes(root) {
  var out = [];
  try {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while (out.length < CFG.scanNodeLimit) {
      node = walker.nextNode();
      if (!node) break;
      if (DONE.has(node)) continue;
      var raw = node.nodeValue;
      if (!raw || !raw.trim()) continue;
      var p = node.parentElement;
      if (!p || shouldSkipElement(p)) continue;
      var text = raw.replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length < 2 || text.length > 300) continue;
      out.push(node);
    }
  } catch (e) { console.error('[ghx] collect error', e); }
  return out;
}

function isGitHubPage() {
  var h = location.hostname.toLowerCase();
  return h === 'github.com' || h === 'gist.github.com' || /\.(github|gist\.github)\.com$/.test(h);
}
function focusInEditable() {
  var a = document.activeElement;
  return !!(a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName || '')));
}
function remainingEnglish(nodes) {
  var out = [];
  for (var i = 0; i < nodes.length && out.length < CFG.pageNodeLimit; i++) {
    var n = nodes[i];
    if (!n || !n.parentNode || DONE.has(n)) continue;
    var raw = n.nodeValue || '';
    var t = raw.replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim();
    if (t.length < 3 || t.length > 300) continue;
    if (!/[A-Za-z]/.test(t) || /[\u4e00-\u9fff]/.test(t)) continue;
    out.push(n);
  }
  return out;
}


/* ==================================================================
 * 模块 A：超级翻译助手（修复版 1.2.0）—— 仅翻译引擎链 + 整页调度
 * 独立作用域，避免与模块 B 的 DICT / aiCfg / gmGet 等命名冲突。
 * ================================================================== */
var Trans = (function () {
const request = xhr;   /* 复用共享 XHR，不重复封装 */

    // 各引擎的语言代码差异
    const BING_LANG = { auto: 'auto-detect', 'zh-CN': 'zh-Hans', 'zh-TW': 'zh-Hant' };
    const GOOGLE_LANG = { auto: 'auto' };
    const MYMEM_LANG = { auto: 'en' };

    // MyMemory 不支持源语言 auto，旧版一律按英文处理，中文原文会翻错。
    // 这里按字符区间粗判，仅在 from=auto 时生效。
    function guessLang(text, from) {
        if (from !== 'auto') return from;
        if (/[\u3040-\u30ff]/.test(text)) return 'ja';
        if (/[\uac00-\ud7af]/.test(text)) return 'ko';
        if (/[\u4e00-\u9fff]/.test(text)) return 'zh-CN';
        if (/[\u0e00-\u0e7f]/.test(text)) return 'th';
        if (/[\u0600-\u06ff]/.test(text)) return 'ar';
        if (/[\u0400-\u04ff]/.test(text)) return 'ru';
        return 'en';
    }
    const ENGINE_ORDER = {
        auto: ['bing', 'mymemory', 'google'],
        bing: ['bing'],
        google: ['google'],
        mymemory: ['mymemory'],
    };
    function splitText(text, limit) {
        const segs = text.match(/[^。！？；!?;\n]+[。！？；!?;\n]?|[。！？；!?;\n]+/g) || [text];
        const out = [];
        let buf = '';
        for (let s of segs) {
            if (!s) continue;
            while (s.length > limit) {
                if (buf) { out.push(buf); buf = ''; }
                out.push(s.slice(0, limit));
                s = s.slice(limit);
            }
            if (buf.length + s.length > limit) { out.push(buf); buf = s; }
            else buf += s;
        }
        if (buf) out.push(buf);
        return out.length ? out : [text];
    }
    // ---- Bing（微软，国内可直连，质量好） ----
    const bing = {
        auth: null,
        authTs: 0,
        async getAuth(force) {
            const now = Date.now();
            if (!force && this.auth && now - this.authTs < 25 * 60 * 1000) return this.auth;
            let lastErr = null;
            for (const sub of ['cn.bing.com', 'www.bing.com']) {
                try {
                    const html = await request({ url: 'https://' + sub + '/translator', timeout: 10000 });
                    const ig = (html.match(/IG\s*:\s*"([A-Fa-f0-9]+)"/) || [])[1];
                    const iid = (html.match(/data-iid\s*=\s*"([^"]+)"/) || [])[1];
                    const ab = html.match(/params_AbusePreventionHelper\s*=\s*\[\s*(\d+)\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*\]/);
                    if (!ig || !iid || !ab) {
                        lastErr = new Error('页面鉴权参数解析失败（可能被重定向到验证页）');
                        continue;
                    }
                    this.auth = { sub, ig, iid, key: ab[1], token: ab[2] };
                    this.authTs = now;
                    return this.auth;
                } catch (e) {
                    lastErr = e;
                }
            }
            throw lastErr || new Error('Bing 初始化失败');
        },
        async translate(text, from, to) {
            let lastErr = null;
            // 第一次用缓存鉴权；失败后作废旧鉴权并强制重新拉取再试一次。
            // 旧版在这里不刷新 token，一旦拿到失效鉴权会连续失败整整 25 分钟。
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    const a = await this.getAuth(attempt > 0);
                    const body = new URLSearchParams({
                        fromLang: BING_LANG[from] || from,
                        to: BING_LANG[to] || to,
                        text: text,
                        token: a.token,
                        key: a.key,
                        tryFetchingGenderDebiasedTranslations: 'true',
                    }).toString();

                    // 不设置 Origin / Referer：实测 Bing 接口并不需要这两个头，
                    // 而 Origin 属于浏览器禁止自设的请求头，在扩展环境里会让
                    // GM_xmlhttpRequest 整条请求失败——这正是「弹框但翻译失败」的高发原因。
                    const raw = await request({
                        method: 'POST',
                        url: 'https://' + a.sub + '/ttranslatev3?isVertical=1&&IG=' + a.ig +
                             '&IID=' + encodeURIComponent(a.iid),
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        data: body,
                        timeout: 12000,
                    });

                    let json;
                    try { json = JSON.parse(raw); }
                    catch (e) { throw new Error('返回非 JSON：' + String(raw).slice(0, 80)); }

                    if (json && json.ShowCaptcha) throw new Error('触发人机验证');
                    if (json && json.statusCode && json.statusCode !== 200) {
                        throw new Error(json.message || ('状态码 ' + json.statusCode));
                    }

                    const arr = Array.isArray(json) ? json : [json];
                    const out = arr.map(x =>
                        (x && x.translations && x.translations[0] && x.translations[0].text) || '').join('');
                    if (!out) throw new Error('未返回译文（token 可能失效）');
                    return out;
                } catch (e) {
                    lastErr = e;
                    this.auth = null;
                }
            }
            throw lastErr || new Error('Bing 翻译失败');
        },
    };

    // ---- Google（需能访问 googleapis） ----
    const google = {
        async translate(text, from, to) {
            const q = new URLSearchParams({
                client: 'gtx',
                sl: GOOGLE_LANG[from] || from,
                tl: GOOGLE_LANG[to] || to,
                dt: 't',
                q: text,
            }).toString();
            const raw = await request({ url: 'https://translate.googleapis.com/translate_a/single?' + q, timeout: 6000 });
            let json;
            try { json = JSON.parse(raw); } catch (e) { throw new Error('返回非 JSON'); }
            const out = (json[0] || []).map(s => (s && s[0]) || '').join('');
            if (!out) throw new Error('未返回译文');
            return out;
        },
    };

    // ---- MyMemory（免注册兜底，有额度限制） ----
    const mymemory = {
        async translate(text, from, to) {
            const src = guessLang(text, from);
            const q = new URLSearchParams({ q: text, langpair: src + '|' + (MYMEM_LANG[to] || to) }).toString();
            const raw = await request({ url: 'https://api.mymemory.translated.net/get?' + q, timeout: 10000 });
            let json;
            try { json = JSON.parse(raw); } catch (e) { throw new Error('返回非 JSON'); }
            const t = json && json.responseData && json.responseData.translatedText;
            if (!t) throw new Error('未返回译文');
            if (/MYMEMORY WARNING|QUOTA/i.test(t)) throw new Error('免费额度已用尽');
            return t;
        },
    };

    const ENGINES = { bing, google, mymemory };
    const ENGINE_LIMIT = { bing: 900, google: 1500, mymemory: 450 };

    /**
     * 统一翻译入口：按顺序尝试引擎，全部失败时抛出汇总错误
     * @returns {Promise<{text:string, engine:string}>}
     */
    let lastGoodEngine = '';

    async function translateText(text, from, to) {
        if (!text || !text.trim()) return { text: '', engine: '' };

        const pref = CFG.engine || 'auto';
        const order = (ENGINE_ORDER[pref] || ENGINE_ORDER.auto).slice();
        if (pref === 'auto' && lastGoodEngine && order.indexOf(lastGoodEngine) > 0) {
            order.splice(order.indexOf(lastGoodEngine), 1);
            order.unshift(lastGoodEngine);
        }
        const errors = [];

        for (const name of order) {
            try {
                const segs = splitText(text, ENGINE_LIMIT[name]);
                const parts = [];
                for (const seg of segs) {
                    if (!seg.trim()) { parts.push(seg); continue; }
                    parts.push(await ENGINES[name].translate(seg, from, to));
                }
                const joined = parts.join('');
                if (!joined.trim()) throw new Error('译文为空');
                lastGoodEngine = name;
                return { text: joined, engine: name };
            } catch (e) {
                errors.push(name + ': ' + (e && e.message ? e.message : e));
            }
        }
        throw new Error(errors.join(' ｜ '));
    }


/* 整页翻译：复用引擎链，去重 + 缓存 + 并发 + 节点上限；只在 F9 时调用 */
var trCache = {};
try { trCache = JSON.parse(Store.get('tr_cache', '{}')) || {}; } catch (e) { trCache = {}; }

function pageNodes(nodes) {
  var groups = {}, order = [];
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (!n || !n.parentNode || DONE.has(n)) continue;
    var raw = n.nodeValue || '';
    var text = raw.replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 3 || text.length > 300) continue;
    if (!/[A-Za-z]/.test(text) || /[\u4e00-\u9fff]/.test(text)) continue;
    var key = text.toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(groups, key)) {
      groups[key] = [];
      order.push({ key: key, text: text });
    }
    groups[key].push({ node: n, raw: raw, text: text });
    if (order.length >= CFG.pageNodeLimit) break;
  }
  return { groups: groups, order: order };
}

async function runPage(nodes) {
  var pack = pageNodes(nodes);
  if (!pack.order.length) return { translated: 0, failed: 0, skipped: true };
  var queue = pack.order.slice();
  var ok = 0, fail = 0;
  var cacheDirty = false;

  function apply(item, translated) {
    if (!translated || translated === item.text) return;
    var arr = pack.groups[item.key] || [];
    for (var i = 0; i < arr.length; i++) {
      var rec = arr[i];
      if (!rec.node.parentNode || rec.node.nodeValue !== rec.raw) continue;
      var lead = (rec.raw.match(/^\s*/) || [''])[0];
      var trail = (rec.raw.match(/\s*$/) || [''])[0];
      rec.node.nodeValue = lead + translated + trail;
      DONE.add(rec.node);
    }
    trCache[item.key] = translated;
    cacheDirty = true;
    ok++;
  }

  function worker() {
    if (!queue.length) return Promise.resolve();
    var item = queue.shift();
    if (trCache[item.key]) { apply(item, trCache[item.key]); return worker(); }
    return translateText(item.text, CFG.from, CFG.to)
      .then(function (res) { apply(item, res.text); })
      .catch(function () { fail++; })
      .then(worker);
  }

  var n = Math.max(1, Math.min(CFG.concurrency, queue.length));
  var jobs = [];
  for (var i = 0; i < n; i++) jobs.push(worker());
  await Promise.all(jobs);
  if (cacheDirty) {
    try {
      var keys = Object.keys(trCache);
      if (keys.length > 3000) {
        var keep = keys.slice(-2000), fresh = {};
        for (var k = 0; k < keep.length; k++) fresh[keep[k]] = trCache[keep[k]];
        trCache = fresh;
      }
      Store.set('tr_cache', JSON.stringify(trCache));
    } catch (e) { }
  }
  return { translated: ok, failed: fail, skipped: false };
}

return { translateText: translateText, runPage: runPage };
})();


/* ==================================================================
 * 模块 B：GitHub 汉化插件（加固版 v1.2.0）—— 词库 + CSS + AI 补译
 * 独立作用域；去掉了自动启动、MutationObserver、设置面板与全部菜单命令。
 * ================================================================== */
var I18n = (function () {
var aiCfg = CFG.ai;                 /* 别名：保留原有 aiCandidate / aiRequest 逻辑 */
var AI_CACHE_KEY = 'ai_cache';
function gmGet(k, d) { return Store.get(k, d); }
function gmSet(k, v) { return Store.set(k, v); }
var aiCache = {};
try { aiCache = JSON.parse(gmGet('ai_cache', '{}')) || {}; } catch (e) { aiCache = {}; }
/* gmGet/gmSet 内部统一加 ghx2_ 前缀；AI_CACHE_KEY 用短键避免双前缀 */

var DICT = {
 "__comments-1": "date",
 "jan": "1月",
 "january": "1月",
 "feb": "2月",
 "february": "2月",
 "mar": "3月",
 "march": "3月",
 "apr": "4月",
 "april": "4月",
 "may": "5月",
 "jun": "6月",
 "june": "6月",
 "jul": "7月",
 "july": "7月",
 "aug": "8月",
 "august": "8月",
 "sep": "9月",
 "september": "9月",
 "oct": "10月",
 "october": "10月",
 "nov": "11月",
 "november": "11月",
 "dec": "12月",
 "december": "12月",
 "hours ago": "小时前",
 "minutes ago": "分钟前",
 "sunday": "星期天",
 "monday": "星期一",
 "tuesday": "星期二",
 "wednesday": "星期三",
 "thursday": "星期四",
 "friday": "星期五",
 "saturday": "星期六",
 "__comments-2": "HomePage",
 "sign in": "登录",
 "sign up": "注册",
 "team": "团队",
 "enterprise": "企业",
 "pricing": "价格",
 "search github": "搜索 GitHub",
 "why github?": "为何选择 GitHub？",
 "built for developers": "专为开发者打造",
 "email address": "电子邮箱地址",
 "sign up for github": "注册 GitHub",
 "refresh": "刷新",
 "developers": "开发者",
 "fortune 50": "财富 50 强",
 "spoken language:": "自然语言",
 "any": "所有",
 "date range:": "时间范围",
 "today": "今天",
 "this week": "本周",
 "this month": "本月",
 "released": "发布",
 "recommended for you": "为您推荐",
 "__comments-3": "explore",
 "collections": "集合",
 "trending": "趋势",
 "events": "事件",
 "github sponsors": "GitHub 赞助",
 "__comments-4": "Bottom",
 "terms": "服务条款",
 "contact github": "联系 GitHub",
 "privacy": "隐私",
 "blog": "博客",
 "help": "帮助",
 "shop": "商店",
 "status": "状态",
 "training": "培训",
 "docs": "文档",
 "__comments-5": "Signup & Login",
 "already have an account? ": "已经有帐户吗？",
 "sign in →": "登录 →",
 "welcome to github!": "欢迎来到 GitHub!",
 "let’s begin the adventure": "让我们开始探险吧",
 "enter your email": "输入您的邮箱地址",
 "continue": "继续",
 "email is invalid or already taken": "电子邮件无效或已被占用",
 "create a password": "创建密码",
 "password is too short": "密码太短",
 "password needs a number and lowercase letter": "密码需要有数字和小写字母",
 "password is strong": "密码很强壮",
 "make sure it's": "请确保",
 "at least 15 characters": "至少需要15个字符",
 "or": " 或者",
 "at least 8 characters": "至少需要8个字符",
 "including a number": "包括数字",
 "and a lowercase letter": "和小写字母",
 "password may be compromised": "密码可能被泄露",
 "password is in a list of passwords commonly used on other websites": "密码在其他网站常用的密码列表中",
 "enter a username": "输入您的用户名",
 "username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen.": "用户名只能包含字母数字字符或单个连字符，并且不能以连字符开头或结尾。",
 "would you like to receive product updates and announcements via email?": "您是否愿意通过电子邮件接收产品更新和公告？",
 "type \"y\" for yes or \"n\" for no": "输入 \"y\" 表示愿意，输入 \"n\" 表示不愿意。",
 "verify your account": "验证您的帐户",
 "create account": "创建帐户",
 "by creating an account, you agree to the": "创建帐户即表示您同意",
 "terms of service": "服务条款",
 ". for more information about github's privacy practices, see the": "。有关 GitHub 隐私惯例的更多信息，请参阅",
 "github privacy statement": "GitHub 隐私声明",
 ". we'll occasionally send you account-related emails.": "。我们偶尔会向您发送与帐户相关的电子邮件。",
 "sign in to github": "登录 GitHub",
 "username or email address": "用户名或电子邮箱",
 "password": "密码",
 "forgot password?": "忘记密码？",
 "incorrect username or password.": "用户名或密码不正确。",
 "new to github?": "初次接触 GitHub？",
 "create an account": "新建帐户",
 "learn more": "了解更多",
 "learn more.": "了解更多。",
 "confirm password to continue": "确认密码以继续",
 "confirm password": "确认密码",
 "tip:": "提示:",
 "signing in…": "登录中…",
 "authentication code": "验证码",
 "what’s this?": "这是什么？",
 "6-digit code": "6位验证码",
 "verify": "验证",
 "verifying": "验证中",
 "verifying…": "验证中…",
 "open the two-factor authentication app on your device to view your authentication code and verify your identity.": "打开设备上的两因素身份验证程序以查看身份验证码并验证您的身份。",
 "having problems?": "有问题吗？",
 "enter a two-factor recovery code": "输入恢复码",
 "can’t access your two-factor device or valid recovery codes?": "无法访问您的双因素验证设备或有效的恢复码？",
 "recovering your account": "恢复您的帐户",
 "if you can’t access a verified device or recovery codes you can request a reset of your authentication settings. for security reasons": "如果您无法访问已验证的设备或恢复码，您可以请求重置您的验证设置。出于安全考虑",
 "this can take 3-5 business days": "这可能需要 3-5 个工作日",
 "step 1": "第一步",
 "verify an email associated with this account.": "验证与该帐户相关的电子邮箱。",
 "step 2": "第二步",
 "verify a device, ssh key or personal access token.": "验证一个设备、SSH 密钥或个人访问令牌。",
 "step 3": "第三步",
 "github support will review your request": "GitHub Support 将审查您的请求",
 "within 3-5 business days": "在 3-5 个工作日内",
 "i understand, get started": "我知道了，开始吧",
 "two-factor authentication failed.": "双因素身份验证失败。",
 "two-factor recovery": "双因素验证恢复",
 "recovery code": "恢复码",
 "you can enter one of your recovery codes in case you lost access to your mobile device.": "如果您无法访问移动设备，则可以输入恢复码。",
 "still having problems?": "还是有问题？",
 "recovery code authentication failed.": "恢复码身份验证失败。",
 "account recovery": "帐户恢复",
 "first we need to verify an email address": "首先，我们需要验证一个电子邮箱地址",
 "by sending a one-time password to all addresses associated with this account.": "用于通过向该帐户关联的所有地址发送一次性密码。",
 "send one-time password": "发送一次性密码",
 "skip this with recovery codes": "使用恢复码跳过此步骤",
 "if you can locate your two-factor recovery codes you can skip this recovery process.": "如果您能找到您的双因素恢复码，您可以跳过这个恢复过程。",
 "the file containing your recovery codes may exist on your computer - check  for a file named": "包含恢复码的文件可能存在于您的计算机上——请检查一个名为",
 "enter recovery code": "输入恢复码",
 "sign in to": "登录",
 "to continue to": "继续登录",
 "confirm your account recovery settings": "确认您的帐户恢复设置",
 "are your account recovery settings up to date? if not, you risk getting locked out of your account.": "您的帐户恢复设置是否最新？如果没有，您就有被锁定帐户的风险。",
 "update": "更新",
 "confirm": "确认",
 "remind me later": "稍后提醒我",
 "configured": "已配置",
 "no security keys": "未配置安全密钥",
 "not configured": "未配置",
 "no fallback sms number": "未设置备用手机号码",
 "no recovery tokens": "未设置恢复令牌",
 "__comments-6": "User home",
 "filter": "过滤",
 "send feedback": "发送反馈",
 "latest changes": "最近更新",
 "signed in as": "登录身份为",
 "set status": "状态设置",
 "new repository": "新建仓库",
 "import repository": "导入仓库",
 "new gist": "新建代码片段",
 "new organization": "新建组织",
 "new project": "新建项目",
 "your profile": "我的个人资料",
 "your repositories": "我的仓库",
 "your organizations": "我的组织",
 "your codespaces": "我的代码空间",
 "your projects": "我的项目",
 "your discussions": "我的讨论",
 "your stars": "我的标星页面",
 "your gists": "我的代码片段",
 "upgrade": "升级",
 "feature preview": "功能预览",
 "sign out": "退出",
 "dashboard": "仪表盘",
 "pull requests": "拉取请求",
 "issues": "议题",
 "marketplace": "应用商城",
 "explore": "探索",
 "codespaces": "代码空间",
 "sponsors": "赞助",
 "overview": "概况",
 "repositories": "仓库",
 "projects": "项目",
 "jump right in": "加入",
 "no open projects": "没有任何打开的项目",
 "no projects have been opened yet.": "目前没有被打开的项目。",
 "customize your pins": "自定义您的置顶项目",
 "contribution settings": "贡献设置",
 "learn how we count contributions": "了解我们如何计算贡献",
 "recent activity": "最近动态",
 "all activity": "所有活动",
 "loading activity...": "加载动态中...",
 "less": "更少",
 "more": "更多",
 "create an organization": "创建一个组织",
 "explore more →": "探索更多",
 "show more": "展示更多",
 "working with a team?": "与团队合作？",
 "github is built for collaboration. set up an organization to improve the way your team works together, and get access to more features.": "GitHub 是为协作而创建的。 建立组织以改善团队合作的方式，并获得更多功能。",
 "__comments-7": "Search",
 "language:": "编程语言:",
 "language": "编程语言",
 "type:": "类型:",
 "type": "类型",
 "all": "所有",
 "select type": "选择类型",
 "sources": "源码",
 "archived": "存档",
 "mirrors": "镜像",
 "select language": "选择语言",
 "select order": "选择排序",
 "last updated": "最近更新",
 "clear filter": "清除过滤器",
 "sort by": "排序方式",
 "find a repository…": "搜索仓库…",
 "search or jump to…": "搜索或跳转到…",
 "best match": "最佳匹配",
 "most stars": "最多星标",
 "fewest stars": "最少星标",
 "most forks": "最多复刻",
 "fewest forks": "最少复刻",
 "__comments-8": "User & Organization",
 "pinned": "已置顶",
 "follower": "关注者",
 "followers": "关注者",
 "following": "关注",
 "edit profile": "编辑个人资料",
 "follow": "关注",
 "unfollow": "取消关注",
 "highlights": "高光时刻",
 "popular repositories": "热门仓库",
 "contribution activity": "贡献动态",
 "show more activity": "加载更多动态",
 "people": "成员",
 "members": "成员",
 "top languages": "主要编程语言",
 "most used topics": "最常用的话题",
 "verified": "已验证",
 "partially verified": "部分验证",
 "unverified": "未验证",
 "this commit was signed with the committer’s": "此提交已签署使用提交者的",
 "verified signature": "已验证签名",
 "copy the full sha": "复制完整的 SHA",
 "view commit details": "查看提交详情",
 "browse the repository at this point in the history": "在历史记录中的浏览仓库",
 "report abuse": "举报滥用",
 "organizations": "组织",
 "achievements": "成就",
 "__comments-9": "Repository",
 "lists": "列表",
 "create list": "创建一个列表",
 "starred repositories": "标星的仓库",
 "starred topics": "标星的话题",
 "see all starred topics": "查看全部标星话题",
 "star": "星标",
 "unstar": "已加星标",
 "watch": "关注",
 "unwatch": "取消关注",
 "participating and @mentions": "参与和 @提及",
 "only receive notifications from this repository when participating or @mentioned.": "仅在参与或 @提及时接收来自此仓库的通知。",
 "notified of all notifications on this repository.": "接收来自此仓库所有通知。",
 "ignore": "忽略",
 "never be notified.": "永不接收通知。",
 "custom": "自定义",
 "select events you want to be notified of in addition to participating and @mentions.": "选择除参与和 @提及之外还要接收通知的事件。",
 "discussions are not enabled for this repo": "此仓库未启用讨论功能",
 "security alerts": "安全警报",
 "apply": "应用",
 "fork": "复刻",
 "unfork": "取消复刻",
 "new": "新建",
 "languages": "语言",
 "about": "关于",
 "code": "代码",
 "dependencies": "依赖",
 "explore repositories": "探索仓库",
 "create repository": "新建仓库",
 "owner": "拥有者",
 "repository name": "仓库名称",
 "description": "描述",
 "(optional)": "(可选)",
 "public": "公共",
 "private": "私有",
 "public archive": "公共存档",
 "private archive": "私有存档",
 "packages": "包",
 "environments": "环境",
 "active": "已激活",
 "secrets": "密钥",
 "security": "安全",
 "notifications": "通知",
 "discussions": "讨论",
 "sponsor": "赞助",
 "sponsor this project": "赞助该项目",
 "learn more about": "了解更多关于",
 "insights": "统计",
 "actions": "操作",
 "release": "发行版",
 "releases": "发行版",
 "latest": "最新",
 "add file": "添加文件",
 "create new file": "新建文件",
 "upload files": "上传文件",
 "delete directory": "删除文件夹",
 "readme": "自述文件",
 "commits": "提交",
 "merge pull request": "合并拉取请求",
 "switch branches/tags": "切换分支/标签",
 "filter branches/tags": "过滤分支/标签",
 "default": "默认",
 "go to file": "文件查找",
 "used by": "使用者",
 "contributor": "贡献者",
 "contributors": "贡献者",
 "view license": "查看 License",
 "no releases published": "无发行版",
 "create a new release": "创建发行版",
 "no packages published": "未发布包",
 "publish your first package": "发布您的第一个包",
 "get started with github packages": "开始使用 GitHub 包",
 "safely publish packages, store your packages alongside your code, and share your packages privately with your team.": "安全地发布包，将包与代码一起存储，并与您的团队共享私有包。",
 "choose a registry": "选择一个包托管服务",
 "edit repository details": "编辑仓库详情",
 "website": "网站",
 "topics": "话题",
 "(separate with spaces)": "（空格分隔）",
 "include in the home page": "包含在主页中",
 "clone": "克隆",
 "clone with https": "通过 HTTPS 方式克隆",
 "clone with ssh": "通过 SSH 方式克隆",
 "use git or checkout with svn using the web url.": "使用 Git 或 SVN 通过该网址检出。",
 "you don't have any public ssh keys in your github account. you can": "您的 GitHub 帐户中没有任何公共 SSH 密钥。您可以",
 "add a new public key": "添加新的公共密钥",
 ", or try cloning this repository via https.": "，或尝试通过 HTTPS 克隆此仓库。",
 "use a password-protected ssh key.": "使用受密码保护的 SSH 密钥。",
 "use ssh": "使用 SSH",
 "use https": "使用 HTTPS",
 "work fast with our official cli.": "使用我们的官方 CLI 快速工作。",
 "open with github desktop": "用 GitHub 桌面客户端打开",
 "open with visual studio": "用 Visual Studio 打开",
 "download zip": "下载 Zip 压缩包",
 "this repository": "该仓库",
 "forked from": "复刻自",
 "owns this repository": "拥有这个仓库",
 "suggested:": "建议：",
 "save changes": "保存更改",
 "your repository details have been saved.": "您的仓库详细信息已保存。",
 "committed to this repository in the past day": "过去一天致力于此仓库",
 "committed to this repository in the past week": "过去一周致力于此仓库",
 "contribute": "贡献",
 "open a pull request to contribute your changes upstream.": "打开拉取请求以向上游贡献您的更改。",
 "open pull request": "打开拉取请求",
 "fetch upstream": "获取上游",
 "open a pull request to fetch upstream and review changes or resolve conflicts.": "打开拉取请求去获取上游并查看更改或解决冲突。",
 "choose a head ref": "选择一个头引用",
 "find a branch": "查找分支",
 "there isn’t anything to compare.": "没有什么可比较的。",
 "and": "和",
 "are entirely different commit histories.": "是完全不同的提交历史。",
 "no commit comments for this range": "在此范围内没有提交评论",
 "no new commits yet. enjoy your day!": "尚无新提交。祝您愉快！",
 "no new commits to fetch. enjoy your day!": "尚无新提交。祝您愉快！",
 "fetch and merge": "获取并合并",
 "__comments-pull-request": "仓库拉取请求",
 "pull request": "拉取请求",
 "compare": "对比",
 "comparing changes": "比对差异",
 "choose two branches to see what’s changed or to start a new pull request. if you need to, you can also": "选择两个分支以比较差异或启动新的拉取请求。如果需要，您也可以",
 "compare across forks": "跨复刻比较",
 "base repository:": "基础仓库:",
 "choose a base repository": "选择基础仓库",
 "filter repos": "过滤仓库",
 "head repository:": "头部仓库:",
 "choose a head repository": "选择头部仓库",
 "base:": "基础:",
 "choose a base branch": "选择一个基础分支",
 "choose a base ref": "选择一个基础引用",
 "compare:": "对比:",
 "compare changes": "比对差异",
 "compare changes across branches, commits, tags, and more below. if you need to, you can also": "比对不同分支、提交、标签等的差异。如果需要，您也可以",
 "choose different branches or forks above to discuss and review changes.": "在上方选择其他分支或复刻以讨论和查看更改。",
 "learn about pull requests": "了解拉取请求",
 "create pull request": "创建拉取请求",
 "compare and review just about anything": "比较和审查几乎任何东西",
 "branches, tags, commit ranges, and time ranges. in the same repository and across forks.": "分支、标签、提交范围和时间范围。 在同一个仓库中并跨分支。",
 "opened this pull request": "打开了这个拉取请求",
 "opened this pull request (their first ever)": "打开这个拉取请求（他们的第一个）",
 "recently edited these files": "最近编辑了这些文件",
 "comments": "评论",
 "files changed": "文件变更",
 "commit comments": "评论",
 "allow edits by maintainers": "允许维护者进行编辑",
 "open a pull request": "打开一个拉取请求",
 "create a new pull request by comparing changes across two branches. if you need to, you can also": "通过比较两个分支之间的更改来创建新的拉取请求。如果需要，您也可以",
 "checking mergeability…": "检查可合并性…",
 "able to merge.": "可以合并。",
 "these branches can be automatically merged.": "这些分支可以自动合并。",
 "can’t automatically merge.": "无法自动合并。",
 "don’t worry, you can still create the pull request.": "别担心，您仍然可以创建拉取请求。",
 "discuss and review the changes in this comparison with others.": "与他人讨论并回顾此次对比中的变化。",
 "open a pull request that is ready for review": "打开一个拉取请求，以供审查",
 "create draft pull request": "创建拉取请求草案",
 "cannot be merged until marked ready for review": "在标记为可供审查之前，不能合并",
 "draft pull request": "拉取请求草案",
 "view pull request": "查看拉取请求",
 "reviewers": "审查人",
 "still in progress?": "仍在进行中吗？",
 "convert to draft": "设置为草案",
 "convert this pull request to draft?": "将此拉取请求转换为草案？",
 "people who are already subscribed will not be unsubscribed.": "已经订阅的人将不会被取消订阅。",
 "linked issues": "关联议题",
 "participant": "参与者",
 "participants": "参与者",
 "close pull request": "关闭拉取请求",
 "reopen pull request": "重新打开拉取请求",
 "conversation": "对话",
 "checks": "检查",
 "new changes since you last viewed": "自您上次查看以来的新变化",
 "view changes": "查看更改",
 "outdated": "已过时",
 "resolve conversation": "解决对话",
 "unresolve conversation": "未解决对话",
 "changes requested": "已请求更改",
 "change requested": "更改请求",
 "show resolved": "显示已解决",
 "hide resolved": "隐藏已解决",
 "show all reviewers": "显示所有审查人",
 "hide all reviewers": "隐藏所有审查人",
 "show all checks": "显示所有检查",
 "hide all checks": "隐藏所有检查",
 "details": "细节",
 "view details": "查看细节",
 "hide details": "隐藏细节",
 "reference in new issue": "引用到新议题",
 "report": "报告",
 "title": "标题",
 "body": "内容",
 "create issue": "创建议题",
 "see review": "查看审查",
 "re-request review": "重新请求审查",
 "review changes": "审查更改",
 "review": "审查",
 "changes": "更改",
 "finish your review": "完成审查",
 "submit general feedback without explicit approval.": "未批准，并提出一般性反馈意见。",
 "approve": "批准",
 "submit feedback approving these changes.": "批准，并提出反馈意见。",
 "pull request authors can’t approve their own pull request": "拉取请求作者无法批准自己的拉取请求",
 "request changes": "请求更改",
 "submit feedback suggesting changes.": "请求更改，并提出更改意见。",
 "pull request authors can’t request changes on their own pull request": "拉取请求作者不能在自己的拉取请求上请求更改",
 "add single comment": "添加评论",
 "start a review": "开始审查",
 "pending": "待定中",
 "add review comment": "评论",
 "cancel review": "取消审查",
 "submit review": "提交审查",
 "changes approved": "变更已获批准",
 "some checks haven’t completed yet": "有些检查还没有完成",
 "some checks were not successful": "有些检查不成功",
 "all checks have passed": "所有检查均已通过",
 "merging is blocked": "合并被阻止",
 "the base branch restricts merging to authorized users.": "基础分支合并仅限于授权用户。",
 "learn more about protected branches.": "了解有关受保护分支的更多信息。",
 "you’re not": "您无",
 "authorized": "权限",
 "to merge this pull request.": "合并此拉取请求。",
 "merged": "已合并",
 "revert": "还原",
 "closed with unmerged commits": "已关闭未合并的提交",
 "delete branch": "删除分支",
 "restore branch": "恢复分支",
 "pull request closed": "拉取请求已关闭",
 "this pull request is closed, but the": "此拉取请求已关闭，但是",
 "branch has unmerged commits.": "分支具有未合并的提交。",
 "branch has unmerged commits. you can delete this branch if you wish.": "分支具有未合并的提交。您可以根据需要删除此分支。",
 "if you wish, you can also delete this fork of": "如果需要，还可以删除此复刻",
 "if you wish, you can delete this fork of": "如果需要，可以删除此复刻",
 "in the": "在",
 "only those with": "只有对此仓库具有",
 "write access": "写入访问权限",
 "to this repository can merge pull requests.": "的才可合并拉取请求。",
 "you’re all set—the": "一切就绪 —",
 "branch can be safely deleted.": "分支可以被安全删除。",
 "this branch has conflicts that must be resolved": "该分支存在冲突，必须解决",
 "resolve conflicts": "解决冲突",
 "conflicting files": "冲突的文件:",
 "member": "成员",
 "draft": "草案",
 "ready for review": "准备审查",
 "marked pull request as ready for review.": "已将此拉取请求标记为准备审查。",
 "checking for ability to merge automatically…": "检测自动合并的能力…",
 "hang in there while we check the branch’s status.": "请等待，我们正在检查该分支的状态",
 "this branch has no conflicts with the base branch": "该分支与基础分支没有冲突",
 "merging can be performed automatically.": "可以自动进行合并。",
 "confirm merge": "确认合并",
 "merging…": "合并中…",
 "pull request successfully merged and closed": "拉取请求已成功合并并关闭",
 "this branch cannot be rebased due to conflicts": "由于冲突，该分支不能变基",
 "rebasing the commits of this branch on top of the base branch cannot be performed automatically due to conflicts encountered while reapplying the individual commits from the head branch.": "",
 "create a merge commit": "创建合并提交",
 "all commits from this branch will be added to the base branch via a merge commit.": "该分支的所有提交都将通过合并提交加入到基础分支中。",
 "squash and merge": "压缩与合并",
 "rebase and merge": "变基与合并",
 "review requested": "已请求审查",
 "review has been requested on this pull request. it is not required to merge.": "已请求对此拉取请求进行审查。不需要合并。",
 "learn more about pull requests": "了解有关拉取请求的更多信息",
 "dismiss for this repository only": "仅在此仓库关闭",
 "dismiss for all repositories": "在所有仓库关闭",
 "there aren’t any open pull requests.": "没有任何打开的拉取请求。",
 "no results matched your search.": "没有与您的搜索相符的结果。",
 "this pull request is still a work in progress": "此拉取请求仍在进行中",
 "draft pull requests cannot be merged.": "拉取请求草案不能被合并。",
 "compare & pull request": "对比 & 拉取请求",
 "reviewed": "已审查",
 "removed": "移除",
 "approved these changes": "批准修改",
 "merged commit": "已合并提交",
 "into": "到",
 "deleted the": "删除",
 "changed the title": "更改了标题",
 "added a commit that referenced this issue": "添加了引用此议题的提交",
 "mentioned this pull request": "提到了此拉取请求",
 "add more commits by pushing to the": "添加更多的提交，推送到",
 "branch on": "分支在",
 "marked this pull request as draft": "标记为草案",
 "marked this pull request as ready for review": "标记为可供审查",
 "remember, contributions to this repository should follow our": "请记住，对该仓库的贡献应遵循我们的",
 "github community guidelines": "GitHub 社区准则",
 "remember, contributions to this repository should follow its": "请记住，对该仓库的贡献应遵循",
 "contributing guidelines": "贡献指南",
 "code of conduct": "行为准则",
 "mark as resolved": "标记为已解决",
 "resolved": "已解决",
 "commit merge": "提交合并",
 "heads up, this will commit to master.": "注意：将提交到 master",
 "yep, commit updates to the": "是的，提交更新到",
 "for this commit. your pull request will be updated automatically.": "对于这次提交。您的拉取请求将被自动更新。",
 "i understand, continue updating master": "我明白了，继续更新 master",
 "self-assigned this": "自行分配了此",
 "closed this": "关闭了这个",
 "reopened this": "重新打开了这个",
 "opened this issue on": "打开了这个",
 "opened this issue": "打开了这个",
 "added the": "添加了",
 "self-requested a review": "自己要求的审查",
 "was merged": "已合并",
 "was closed": "已关闭",
 "approved": "已批准",
 "__comments-issue": "仓库议题",
 "new issue": "创建议题",
 "open all": "打开全部",
 "author": "作者",
 "collaborator": "合作者",
 "filter by author": "按作者过滤",
 "filter users": "过滤用户",
 "labels": "标签",
 "label": "标签",
 "filter by label": "按标签过滤",
 "filter labels": "过滤标签",
 "unlabeled": "未标记",
 "filter by project": "按项目过滤",
 "filter projects": "过滤项目",
 "no projects found. sorry about that.": "很抱歉，未找到任何项目。",
 "milestones": "里程碑",
 "milestone": "里程碑",
 "filter by milestone": "按里程碑过滤",
 "filter milestones": "过滤里程碑",
 "issues with no milestone": "没有里程碑的议题",
 "assignee": "受理人",
 "assigned to nobody": "未分配给任何人",
 "filter by who’s assigned": "过滤受理人",
 "sort": "排序方式",
 "newest": "最新",
 "oldest": "最早",
 "most commented": "最多评论",
 "least commented": "最少评论",
 "recently updated": "近期更新内容",
 "least recently updated": "最近最少更新",
 "most reactions": "回复最多",
 "reviews": "审查",
 "filter by reviews": "按审查过滤",
 "no reviews": "未经审查",
 "review required": "需要审查",
 "approved review": "已批准的审查",
 "reviewed by you": "由您审查",
 "not reviewed by you": "您未审查",
 "awaiting review from you": "等待您审查",
 "awaiting review from you or your team": "等待您或您的团队的审查",
 "awaiting review from you specifically": "特别等待您审查",
 "assignees": "受理人",
 "no one assigned": "未分配",
 "confirmed": "已确认",
 "we couldn’t find anything!": "这里空空如也！",
 "linked pull requests": "关联拉取请求",
 "successfully merging a pull request may close this issue.": "成功合并一个拉取请求可能会关闭此议题。",
 "submit new issue": "提交新议题",
 "new pull request": "创建拉取请求",
 "close issue": "关闭议题",
 "close with comment": "评论并关闭议题",
 "reopen issue": "重新打开议题",
 "lock conversation": "锁定对话",
 "pin issue": "固定议题",
 "transfer issue": "转移议题",
 "welcome to issues!": "欢迎关注议题！",
 "clear current search query, filters, and sorts": "清除当前的搜索查询、过滤器和排序方式",
 "delete issue": "删除议题",
 "are you sure you want to delete this issue?": "您确定要删除此议题吗？",
 "this cannot be undone": "这不能被撤消",
 "only administrators can delete issues": "只有管理员可以删除议题",
 "deletion will remove the issue from search and previous references will point to a placeholder": "删除将从搜索中删除该议题，以前的引用将指向一个占位符",
 "delete this issue": "删除议题",
 "deleting issue…": "议题删除中…",
 "the issue was successfully deleted.": "该议题已成功删除。",
 "filter issues": "过滤议题",
 "open issues and pull requests": "打开的议题和拉取请求",
 "your issues": "您的议题",
 "your pull requests": "您的拉取请求",
 "everything assigned to you": "所有分配给您的",
 "everything mentioning you": "所有提到您的",
 "view advanced search syntax": "查看高级搜索语法",
 "label issues and pull requests for new contributors": "为新贡献者标记议题和拉取请求",
 "issues are used to track todos, bugs, feature requests, and more. as issues are created, they’ll appear here in a searchable and filterable list. to get started, you should": "议题用于跟踪待办事项、错误、功能请求等。创建议题后，它们将显示在可搜索和可过滤的列表中。如果要开始，您应该",
 "create an issue": "创建一个议题",
 "something isn't working": "某些不能正常工作的问题",
 "improvements or additions to documentation": "文档的改进或补充",
 "this issue or pull request already exists": "此议题或拉取请求已存在",
 "new feature or request": "新功能或请求",
 "good for newcomers": "适合新人",
 "extra attention is needed": "需要额外注意",
 "this doesn't seem right": "这似乎不对",
 "further information is requested": "要求提供更多信息",
 "this will not be worked on": "这将不会被处理",
 "alphabetically": "按字母顺序",
 "reverse alphabetically": "按字母顺序倒序",
 "most issues": "议题最多",
 "fewest issues": "议题最少",
 "search all labels": "搜索所有标签",
 "__comments-10": "Repository settings",
 "most repository settings are hidden for archived repositories. this repository must be unarchived to change them.": "对于存档的仓库，大多数仓库设置都是隐藏的。 必须解除仓库存档才能更改它们。",
 "template repository": "模板库",
 "template repositories let users generate new repositories with the same directory structure and files.": "模板仓库允许用户生成具有相同目录结构和文件的新仓库。",
 "social preview": "社交预览",
 "upload an image to customize your repository’s social media preview.": "上传图像以自定义仓库的社交媒体预览。",
 "images should be at least 640×320px (1280×640px for best display).": "图片至少应为 640×320 像素（1280×640 像素以获得最佳显示效果）。",
 "download template": "下载模板",
 "features": "功能",
 "restrict editing to collaborators only": "仅限协作者进行编辑",
 "public wikis will still be readable by everyone.": "公共 wikis 仍然可供所有人阅读。",
 "issues integrate lightweight task tracking into your repository. keep projects on track with issue labels and milestones, and reference them in commit messages.": "议题将轻量级任务跟踪集成到您的仓库中。使用议题标签和里程碑保持项目正常运行，并在提交消息中引用它们。",
 "get organized with issue templates": "使用议题模板进行组织",
 "give contributors issue templates that help you cut through the noise and help them push your project forward.": "为贡献者提供议题模板，帮助您消除干扰并帮助他们推进您的项目。",
 "set up templates": "设置模板",
 "sponsorships": "赞助",
 "sponsorships help your community know how to financially support this repository.": "赞助可帮助您的社区了解如何在资金上支持此仓库。",
 "display a \"sponsor\" button": "显示 “赞助” 按钮",
 "add links to github sponsors or third-party methods your repository accepts for financial contributions to your project.": "添加指向 GitHub 赞助者或您的仓库接受的第三方收款链接，以便为您的项目提供资金捐助。",
 "set up sponsor button": "设置赞助按钮",
 "project boards on github help you organize and prioritize your work. you can create project boards for specific feature work, comprehensive roadmaps, or even release checklists.": "GitHub 上的项目板可以帮助您组织和安排工作的优先次序。 您可以为特定功能工作、全面的路线图、甚至发布检查列表来创建项目板。",
 "preserve this repository": "保留这个仓库",
 "include this code in the": "将此代码包含在",
 "github archive program": "GitHub 存档计划中",
 "table of contents": "目录",
 "autogenerate table of contents for markdown files in this repository. the table of contents will be displayed near the top of the file.": "自动生成此仓库中 Markdown 文件的目录。目录将显示在文件顶部附近。",
 "discussions is the space for your community to have conversations, ask questions and post answers without opening issues.": "讨论是您的社区进行对话、提问和发布答案的地方，而无需打开议题。",
 "get started with discussions": "开始讨论",
 "engage your community by having discussions right in your repository, where your community already lives": "通过在您的社区已经存在的仓库中进行讨论来吸引您的社区",
 "set up discussions": "建立讨论",
 "merge button": "合并按钮",
 "when merging pull requests, you can allow any combination of merge commits, squashing, or rebasing. at least one option must be enabled. if you have linear history requirement enabled on any protected branch, you must enable squashing or rebasing.": "合并拉取请求时，您可以允许合并提交、压缩或变基的任意组合。必须至少启用一个选项。如果您在任何受保护分支上启用了线性历史要求，则必须启用压缩或变基。",
 "allow merge commits": "允许提交合并",
 "add all commits from the head branch to the base branch with a merge commit.": "使用合并提交将所有从头部分支的提交添加到基础分支。",
 "allow squash merging": "允许压缩合并",
 "combine all commits from the head branch into a single commit in the base branch.": "将来自头部分支的所有提交合并到基础分支中的单个提交中。",
 "allow rebase merging": "允许变基合并",
 "add all commits from the head branch onto the base branch individually.": "将来自头部分支的所有提交单独添加到基础分支。",
 "you can allow setting pull requests to merge automatically once all required reviews and status checks have passed.": "一旦所有必需的审查和状态检查都通过，您可以允许设置拉取请求自动合并。",
 "allow auto-merge": "允许自动合并",
 "waits for merge requirements to be met and then merges automatically.": "等待满足合并要求，然后自动合并。",
 "after pull requests are merged, you can have head branches deleted automatically.": "合并拉取请求后，您可以自动删除头部分支。",
 "automatically delete head branches": "自动删除头部分支",
 "deleted branches will still be able to be restored.": "删除的分支仍然可以恢复。",
 "archives": "档案",
 "when creating source code archives, you can choose to include files stored using git lfs in the archive.": "创建源代码存档时，您可以选择在存档中包含使用 Git LFS 存储的文件。",
 "include git lfs objects in archives": "在档案中包含 Git LFS 对象",
 "git lfs usage in archives is billed at the same rate as usage with the client.": "归档中的 Git LFS 使用率与客户端的使用率相同。",
 "pages settings now has its own dedicated tab!": "Pages 设置现在有其专用选项卡！",
 "check it out here!": "看看这里！",
 "danger zone": "危险区",
 "change repository visibility": "更改仓库可见性",
 "you cannot change the visibility of a fork. please": "您无法更改复刻仓库的可见性。请",
 "duplicate the repository": "复制仓库",
 "for security reasons, you cannot change the visibility of a fork.": "出于安全原因，您无法更改复刻仓库的可见性。",
 "change visibility": "更改可见性",
 "warning: this is a potentially destructive action.": "警告：这是一个潜在的破坏性操作。",
 "this repository is currently public.": "该仓库当前是公开的。",
 "this repository is currently private.": "该仓库当前是私有的。",
 "make this repository visible to anyone.": "让任何人都能看到这个仓库。",
 "make private": "转为私有",
 "hide this repository from the public.": "向公众隐藏这个仓库。",
 "i understand, change repository visibility.": "我明白了，依然更改该仓库的可见性。",
 "transfer ownership": "转让所有权",
 "transfer": "转让",
 "transfer this repository to another user or to an organization where you have the ability to create repositories.": "将此仓库转让给另一位用户或您可以创建仓库的组织。",
 "transfer repository": "转让仓库",
 "to understand admin access, teams, issue assignments, and redirects after a repository is transferred, see": "要了解仓库转让后的管理员访问、团队、议题分配和重定向，请参阅",
 "transferring a repository": "转让仓库",
 "in github help.": "在 GitHub 帮助中所示。",
 "transferring may be delayed until the new owner approves the transfer.": "在新所有者批准接受转让之前，转让可能会延迟。",
 "new owner’s github username or organization name": "新所有者的 GitHub 用户名或组织名称",
 "username or organization name": "用户名或组织名称",
 "to confirm.": "进行确定。",
 "i understand, transfer this repository.": "我明白了，依然转让该仓库。",
 "archive this repository": "归档仓库",
 "mark this repository as archived and read-only.": "将此仓库标记为已存档和只读。",
 "archive repository": "归档仓库",
 "this repository will become read-only.": "该仓库将设置为只读。",
 "you will still be able to fork the repository and unarchive it at any time.": "您仍然可以随时访问复刻仓库并取消存档。",
 "unexpected bad things will happen if you don’t read this!": "如果您不阅读此说明，将会发生意想不到的事情！",
 "all scheduled workflows will stop running.": "所有预定的工作流程将停止运行。",
 "security features will be unavailable:": "安全功能将无法使用：",
 "code scanning": "代码扫描",
 "before you archive, please consider:": "在您归档之前，请考虑：",
 "updating any repository settings": "更新仓库设置",
 "closing all open issues and pull requests": "关闭所有打开的议题和拉取请求",
 "making a note in your readme": "在您的 README 中做个说明",
 "please type": "请键入",
 "i understand the consequences, archive this repository": "我明白后果，依然存档该仓库",
 "this repository has been archived by the owner. it is now read-only.": "此仓库已由所有者存档。它现在是只读的。",
 "unarchive this repository": "解除仓库存档",
 "mark this repository as unarchived and read-write.": "将此仓库标记为未归档和可读写。",
 "unarchive repository": "解除仓库存档",
 "this will make": "这将使",
 "read-write.": "可读写。",
 "once unarchived, the following can be modified and commented on:": "一旦解除存档，就可以对以下内容进行修改和评论：",
 "security features will become available:": "安全功能将不可用：",
 "i understand the consequences, unarchive this repository": "我明白后果，依然解除该仓库存档",
 "delete this repository": "删除仓库",
 "once you delete a repository, there is no going back. please be certain.": "您一旦删除仓库，将再也无法恢复。请确认。",
 "are you absolutely sure?": "您完全确定吗？",
 "this action": "该操作",
 "cannot": "不能",
 "be undone. this will permanently delete the": "被撤消。这将永久删除",
 "repository, wiki, issues, comments, packages, secrets, workflow runs, and remove all collaborator associations.": "仓库、Wiki、议题、评论、包、机密、工作流程，并删除所有协作者关联。",
 "this will not change your billing plan. if you want to downgrade, you can do so in your billing settings.": "这并不会更改您的结算方案。 如果您想降级，可以在结算设置中进行降级。",
 "i understand the consequences, delete this repository": "我明白后果，依然删除该仓库",
 "manage access": "访问管理",
 "who has access": "谁有权访问",
 "public repository": "公共仓库",
 "this repository is public and visible to anyone.": "该仓库是公开的，对任何人都可见。",
 "private repository": "私有仓库",
 "only those with access to this repository can view it.": "只有拥有该仓库访问权的用户才能查看。",
 "manage": "管理",
 "direct access": "直接访问",
 "collaborators have access to this repository. only you can contribute to this repository.": "个协作者有权访问此仓库。 只有您可以对此仓库做出贡献。",
 "you haven't invited any collaborators yet": "您尚未邀请任何协作者",
 "invite a collaborator": "邀请协作者",
 "default branch": "默认分支",
 "the default branch is considered the “base” branch in your repository, against which all pull requests and code commits are automatically made, unless you specify a different branch.": "默认分支被认为是仓库中的 “基础” 分支，所有的拉取请求和代码提交都是针对该分支进行的，除非您指定一个不同的分支。",
 "rename branch": "重命名分支",
 "switch to another branch": "切换到另一分支",
 "branch protection rules": "分支保护规则",
 "add rule": "添加规则",
 "define branch protection rules to disable force pushing, prevent branches from being deleted, and optionally require status checks before merging. new to branch protection rules?": "定义分支保护规则，以禁止强制推送，防止分支被删除，并可选择要求在合并前进行状态检查。对分支保护规则感到陌生？",
 "no branch protection rules defined yet.": "尚未定义分支保护规则。",
 "integrations": "集成",
 "installed github apps": "安装 GitHub 应用",
 "is designed to host your personal, organization, or project pages from a github repository.": "旨在从 GitHub 仓库托管您的个人、组织或项目页面。",
 "your site is published at": "您的站点发布在",
 "source": "来源",
 "github pages is currently disabled. select a source below to enable github pages for this repository.": "GitHub Pages 目前已被禁用。在下面选择一个源，为该仓库启用 GitHub Pages。",
 "your github pages site is currently being built from the": "您的 GitHub Pages 站点，目前正建立于",
 "none": "无",
 "select branch": "选择分支",
 "branch:": "分支:",
 "select folder": "选择文件夹",
 "theme chooser": "设置主题",
 "select a theme to publish your site with a jekyll theme using the": "选择一个主题，用 jekyll 主题发布您的站点，使用",
 "select a theme to publish your site with a jekyll theme.": "选择一个主题，用 Jekyll 主题发布您的站点。",
 "choose a theme": "选择一个主题",
 "hide thumbnails": "隐藏缩略图",
 "show thumbnails": "显示缩略图",
 "select theme": "选择主题",
 "custom domain": "自定义域",
 "custom domains allow you to serve your site from a domain other than": "自定义域允许您从其他域为您的站点提供服务，而不是",
 "remove": "移除",
 "enforce https": "强制执行 HTTPS",
 "https provides a layer of encryption that prevents others from snooping on or tampering with traffic to your site.": "HTTPS 提供了一个加密层，防止他人窥探或篡改您站点的流量。",
 "when https is enforced, your site will only be served over https.": "当 HTTPS 被强制执行时，您的站点将只通过 HTTPS 提供服务。",
 "__comments-11": "Github settings",
 "settings": "设置",
 "your personal account": "我的个人帐户",
 "go to your personal profile": "去我的个人资料",
 "account settings": "帐户设置",
 "profile": "个人资料",
 "account": "帐户",
 "appearance": "外观",
 "account security": "帐户安全",
 "billing & plans": "计费 & 计划",
 "security log": "安全日志",
 "security & analysis": "安全 & 分析",
 "sponsorship log": "赞助日志",
 "emails": "电子邮箱",
 "billing": "帐单",
 "scheduled reminders": "定时提醒",
 "ssh and gpg keys": "SSH 与 GPG 公钥",
 "saved replies": "快捷回复",
 "applications": "应用",
 "developer settings": "开发者设置",
 "moderation settings": "审查设置",
 "blocked users": "黑名单",
 "interaction limits": "互动限制",
 "rename": "重命名",
 "options": "选项",
 "branch": "分支",
 "branches": "分支",
 "tags": "标签",
 "public profile": "公开个人资料",
 "name": "名字",
 "public email": "公开邮箱",
 "bio": "个人简介",
 "twitter username": "Twitter 用户名",
 "company": "公司",
 "location": "位置",
 "profile picture": "个人头像",
 "update profile": "更新个人资料",
 "profile settings": "个人资料设置",
 "display pro badge": "显示 Pro 徽章",
 "contributions": "贡献",
 "include private contributions on my profile": "在我的个人资料中显示私人共享",
 "github developer program": "GitHub 开发人员计划",
 "trending settings": "趋势设置",
 "preferred spoken language": "首选语言",
 "change username": "更改用户名",
 "changing your username can have": "更改用户名可能会有",
 "unintended side effects": "意外的副作用",
 "really change your username?": "确定要更改您的用户名？",
 "we": "我们",
 "will not": "不会",
 "will": "会",
 "set up redirects for your old profile page.": "为您的旧资料页设置重定向",
 "set up redirects for pages sites.": "为 Pages 站点设置重定向。",
 "create redirects for your repositories (web and git access).": "为您的仓库设置重定向（ web 和 git 访问）。",
 "renaming may take a few minutes to complete.": "重命名可能需要几分钟的时间来完成。",
 "i understand, let’s change my username": "我明白了，依然更改我的用户名",
 "enter a new username": "输入一个新用户名",
 "choose a new username": "选择一个新用户名",
 "change my username": "更改我的用户名",
 "looking to manage account security settings? you can find them in the": "想管理帐户安全设置？您可以找到它们在",
 "tab.": "选项页。",
 "export account data": "导出帐户数据",
 "export all repositories and profile metadata for": "导出所有仓库和配置元数据，自",
 ". exports will be available for 7 days.": "。导出结果将有 7 天有效期。",
 "start export": "开始导出",
 "recent exports": "近期导出",
 "new export": "新建导出",
 "new exports cannot be requested while an export is currently in progress": "当前正在导出中，无法请求新的导出",
 "resend email with link": "重新发送带有链接的邮件",
 "download deleted": "导出内容已删除",
 "job queued to delete file.": "正在排队删除文件的作业。",
 "we're preparing your export! we'll send you an email when it's finished.": "我们正在为您准备导出！我们完成后会发一封电子邮件。",
 "successor settings": "设置继任者",
 "designated below": "下面指定的",
 ", in the event of my death. i understand that this appointment of a successor does not override legally binding next-of-kin rules or estate laws of any relevant jurisdiction, and does not create a binding will.": "，在我死亡的情况下。我明白，这种指定继任者的做法并不凌驾于具有法律约束力的近亲规则或任何相关司法管辖区的遗产法，也不产生具有约束力的遗嘱。",
 "learn more about account successors.": "了解更多关于帐户继任者的信息。",
 "add successor": "添加继任者",
 "search by username, full name, or email address": "搜索用户名、全名、或电子邮箱",
 "you have not designated a successor.": "您还没有指定继任者。",
 "delete account": "删除帐户",
 "once you delete your account, there is no going back. please be certain.": "您一旦删除了您的帐户，将再也无法恢复。请确认！",
 "delete your account": "删除帐户",
 "are you sure you don’t want to just": "您确定不希望仅仅是",
 "downgrade your account": "降级您的帐户",
 "to a": "为",
 "free": "免费",
 "account? we won’t charge your payment information anymore.": "帐户吗？我们不会再收取您的付款信息。",
 "are you sure you want to do this?": "您确定要这么做吗？",
 "this is extremely important.": "这是极其重要的。",
 "we will": "我们将",
 ", along with all of your forks, wikis, issues, pull requests, and github pages sites.": "以及您所有的复刻、维基、议题、拉取请求和 GitHub Pages 站点。",
 "you will no longer be billed, and your username will be available to anyone on github.": "您将不再被收取费用，并且您的用户名将被 GitHub 上的任何人使用。",
 "for more help, read our article \"": "如需更多帮助，请阅读我们的文章\"",
 "deleting your user account": "删除您的帐户",
 "your username or email:": "您的用户名或电子邮箱:",
 "to verify, type": "为了验证，请输入",
 "below:": "在下面:",
 "cancel plan and delete this account": "取消计划并删除此帐户",
 "theme preferences": "主题偏好",
 "choose how github looks to you. select a single theme, or sync with your system and automatically switch between day and night themes.": "选择 GitHub 在您眼中的样子。选择单一主题，或与您的系统同步并自动在白天和夜晚的主题之间切换。",
 "theme mode": "主题模式",
 "single theme": "单一主题",
 "github will use your selected theme": "GitHub 将使用您选择的主题",
 "sync with system": "与系统同步",
 "github theme will match your system active settings": "GitHub 主题将匹配您的系统设置",
 "default light": "默认 - 亮",
 "default dark": "默认 - 暗",
 "dark dimmed": "昏暗",
 "dark high contrast": "高对比暗",
 "day theme": "日间主题",
 "night theme": "夜间主题",
 "this theme will be active when your system is set to “light mode”": "当您的系统设置为“灯光模式”时，该主题将被激活。",
 "this theme will be active when your system is set to “dark mode”": "当您的系统设置为“暗夜模式”时，该主题将被激活。",
 "emoji skin tone preference": "表情符号肤色偏好",
 "preferred default emoji skin tone": "默认的表情符号肤色",
 "__comments-Account Security": "帐户安全",
 "change password": "更改密码",
 "old password": "旧密码",
 "new password": "新密码",
 "confirm new password": "确认新密码",
 "update password": "更新密码",
 "i forgot my password": "我忘记了我的密码",
 "two-factor authentication": "双因素身份验证",
 "enable": "启用",
 "enabled": "启用",
 "disable": "停用",
 "add": "添加",
 "added": "添加",
 "two-factor methods": "双因素验证方式",
 "two-factor authentication adds an additional layer of security to your account by requiring more than just a password to sign in.": "双因素身份验证不仅仅要求密码登录，还为您的帐户增加了一层额外的安全性。",
 "authenticator app": "身份验证器应用",
 "security keys": "安全密钥",
 "security keys are hardware devices that can be used as your second factor of authentication.": "安全密钥是硬件设备，可以作为您的第二认证因素。",
 "sms number": "手机号码",
 "recovery options": "恢复选项",
 "recovery codes": "恢复码",
 "recovery codes can be used to access your account in the event you lose access to your device and cannot receive two-factor authentication codes.": "恢复码可用于在您无法访问设备且无法接收双因素身份验证码的情况下访问您的帐户。",
 "show": "显示",
 "fallback sms number": "备用手机号码",
 "providing a fallback sms number will allow github to send your two-factor authentication codes to an alternate device if you lose your primary device.": "如果您丢失主要设备，提供备用手机号码将允许 GitHub 将您的双因素身份验证码发送到备用设备。",
 "recovery tokens": "恢复令牌",
 "account recovery with facebook is a simple way to recover your account.": "使用 Facebook 恢复帐户是一种恢复帐户的简单方法。",
 "sessions": "会话",
 "this is a list of devices that have logged into your account. revoke any sessions that you do not recognize.": "这是已登录您帐户的设备列表。 撤销任何您不认识的会话。",
 "see more": "查看更多",
 "your current session": "您当前的会话",
 "last accessed on": "最后访问日期：",
 "session details": "会话详情",
 "revoke session": "撤销会话",
 "device:": "设备：",
 "last location:": "最后的位置：",
 "signed in:": "登录：",
 "view all sessions": "查看所有会话",
 "__comments-Emails": "电子邮箱",
 "email settings": "电子邮箱设置",
 "primary": "主帐户",
 "this email will be used for account-related notifications and can also be used for password resets.": "该电子邮箱将用于与帐户有关的通知，也可用于密码重置。",
 "not visible in emails": "在电子邮件中不可见",
 "receives notifications": "接收通知",
 "this email address is the default used for github notifications, i.e., replies to issues, pull requests, etc.": "该电子邮箱默认用于 GitHub 的通知，即对议题和拉取请求的回复，等等。",
 "at least one email is required.": "至少需要一个电子邮箱。",
 "add email address": "添加电子邮箱",
 "resend verification email": "重新发送验证邮件",
 "your email was verified.": "您的电子邮箱已被验证。",
 "primary email address": "主电子邮箱",
 "because you have email privacy enabled,": "因为您已经启用了电子邮箱隐私，",
 "will be used for account-related notifications as well as password resets.": "将用于与帐户相关的通知以及密码重置。",
 "will be used for web-based git operations, e.g., edits and merges.": "将用于基于 Web 的 Git 操作，例如编辑和合并。",
 "your primary email was changed to": "您的主电子邮箱已更改为",
 ". your default notification email address is still set to": "。您的默认通知电子邮箱仍然设置为",
 ". would you like to update that as well?": "。您也想更新它吗？",
 "yes， update my notification email": "是的，更新我的通知电子邮箱",
 "backup email address": "备用电子邮箱",
 "your backup github email address will be used as an additional destination for security-relevant account notifications and can also be used for password resets.": "您的备用 GitHub 电子邮箱将额外的用作安全相关帐户通知，也可以用于密码重置。",
 "allow all verified emails": "允许所有已验证的电子邮箱",
 "only allow primary email": "仅允许主电子邮箱",
 "please add a verified email, in addition to your primary email, in order to choose a backup email address.": "请在您的主电子邮箱之外，添加一个经验证的电子邮箱，以便选择一个备用电子邮箱。",
 "all verified emails can now be used for password resets.": "所有已验证的电子邮箱现在均可用于密码重置。",
 "keep my email addresses private": "保持我的电子邮箱地址的私密性",
 "we’ll remove your public profile email and use": "我们将删除您的公开个人资料中的电子邮箱，并使用",
 "when performing web-based git operations (e.g. edits and merges) and sending email on your behalf. if you want command line git operations to use your private email you must": "执行基于 Web 的 Git 操作（例如编辑和合并）并以您的名义发送电子邮件。如果您想在命令行 Git 操作中使用您的私人电子邮箱，您必须",
 "set your email in git": "在 Git 中设置您的电子邮箱",
 "commits pushed to github using this email will still be associated with your account.": "使用此电子邮箱推送到 GitHub 的提交仍将与您的帐户相关联。",
 "your primary email address is now public. to select which email to display on your profile, visit": "您的主电子邮箱现在是公开的。要选择在您的个人资料上显示的电子邮箱，请访问",
 "profile settings.": "个人资料设置。",
 "your primary email address is now private. if you previously made your email public, we’ve removed it from your profile.": "您的主电子邮箱现在是私密的。如果您以前公开了您的电子邮箱，我们已经从您的个人资料中删除了它。",
 "block command line pushes that expose my email": "阻止在命令行推送中暴露我的电子邮箱",
 "when you push to github, we’ll check the most recent commit. if the author email on that commit is a private email on your github account, we will block the push and warn you about exposing your private email.": "当您推送到 GitHub 时，我们会检查最近的提交。如果该提交的作者电子邮箱是您 GitHub 帐户上的私人电子邮箱，我们会阻止推送并警告您不要暴露您的私人电子邮箱。",
 "commits pushed with a private email will no longer be blocked.": "使用私人电子邮箱推送的提交将不再被阻止。",
 "commits pushed with a private email will now be blocked and you will see a warning.": "使用私人电子邮箱推送的提交将被阻止，您会看到一个警告。",
 "email preferences": "邮件首选项",
 "receive all emails, except those i unsubscribe from.": "接收所有的邮件，除了那些我取消订阅的邮件。",
 "we’ll occasionally contact you with the latest news and happenings from the github universe.": "我们会不定期地联系您，告诉您来自 GitHub 宇宙的最新消息和发生的事情。",
 "only receive account related emails, and those i subscribe to.": "仅接收帐户相关的邮件，以及我订阅的邮件。",
 "we’ll only send you legal or administrative emails, and any emails you’re specifically subscribed to.": "我们仅向您发送法律或行政邮件，以及您特别订阅的任何邮件。",
 "save email preferences": "保存邮件首选项",
 "successfully updated your email preferences.": "成功更新了您的邮件首选项。",
 "looking for activity notification controls? check the": "正在寻找活动通知控制？请检查",
 "notification center": "通知中心",
 "__comments-SSH and GPG keys": "SSH 与 GPG 公钥",
 "ssh keys": "SSH 密钥",
 "new ssh key": "新建 SSH 密钥",
 "there are no ssh keys associated with your account.": "没有与您的帐户关联的 SSH 密钥。",
 "this is a list of ssh keys associated with your account. remove any keys that you do not recognize.": "这是与您的帐户相关的 SSH 密钥的列表。删除任何您无法识别的密钥。",
 "check out our guide to": "请看我们的指南",
 "generating ssh keys": "生成 SSH 密钥",
 "or troubleshoot": "或解决",
 "common ssh problems": "常见的 SSH 问题",
 "gpg keys": "GPG 密钥",
 "new gpg key": "新建 GPG 密钥",
 "there are no gpg keys associated with your account.": "没有与您的帐户关联的 GPG 密钥。",
 "this is a list of gpg keys associated with your account. remove any keys that you do not recognize.": "这是与您的帐户相关的 GPG 密钥的列表。删除任何您无法识别的密钥。",
 "learn how to": "了解如何",
 "generate a gpg key and add it to your account": "生成 GPG 密钥并将其添加到您的帐户",
 "vigilant mode": "警戒模式",
 "flag unsigned commits as unverified": "将未签名的提交标记为未验证",
 "this will include any commit attributed to your account but not signed with your gpg or s/mime key.": "这将包括任何归属于您的帐户但没有用您的 GPG 或 S/MIME 密钥签名的提交。",
 "note that this will include your existing unsigned commits.": "请注意，这将包括您现有的未签名的提交。",
 "learn about vigilant mode": "了解警戒模式",
 "/ add new": "/ 新添",
 "key": "密钥",
 "add ssh key": "添加 SSH 密钥",
 "key is invalid. you must supply a key in openssh public key format": "密钥无效。您必须提供 OpenSSH 公钥格式的密钥",
 "we got an error doing that.": "我们在这样做时出错了。",
 "add gpg key": "添加 GPG 密钥",
 "are you sure you want to delete this ssh key?": "您确定要删除此 SSH 密钥吗？",
 "be undone. this will permanently delete the ssh key and if you’d like to use it in the future, you will need to upload it again.": "被撤销。这将永久地删除 SSH 密钥，如果您想在未来使用它，您将需要再次上传它。",
 "i understand, please delete this ssh key": "我明白了，依然删除该 SSH 密钥",
 "are you sure you want to delete this gpg key?": "您确定要删除此 GPG 密钥吗？",
 "be undone. this will permanently delete the gpg key, and if you’d like to use it in the future, you will need to upload it again.": "被撤销。这将永久地删除 GPG 密钥，如果您想在未来使用它，您将需要再次上传它。",
 "any commits you signed with this key will become unverified after removing it.": "删除后，您使用此密钥签名的任何提交都将变成未验证。",
 "i understand, delete this gpg key": "我明白了，依然删除该 GPG 密钥",
 "okay, you have successfully deleted that key.": "好的，您已成功删除该密钥。",
 "__comments-Repository": "仓库",
 "repository default branch": "仓库默认分支",
 "choose the default branch for your new personal repositories. you might want to change the default name due to different workflows, or because your integrations still require “master” as the default branch name. you can always change the default branch name on individual repositories.": "为您新的个人仓库选择默认的分支。由于工作流程的不同，或者由于您的集成仍然需要 “master ”作为默认分支名，您可能想改变默认名称。您可以随时改变个人仓库的默认分支名称。",
 "learn more about default branches.": "了解有关默认分支的更多信息。",
 "deleted repositories": "删除的仓库",
 "it may take up to an hour for repositories to be displayed here. you can only restore repositories that have no forks or have not been forked.": "仓库可能需要一个小时的时间才能显示在这里。您只能恢复没有复刻或没有被复刻的仓库。",
 "__comments-Saved replies": "快捷回复",
 "saved replies are re-usable text snippets that you can use throughout github comment fields. saved replies can save you time if you’re often typing similar responses.": "快捷回复是可重复使用的文本片段，您可以在整个 GitHub 评论区使用。如果您经常输入类似的回复，快捷回复可以节省您的时间。",
 "no saved replies yet.": "暂时没有快捷回复。",
 "add a saved reply": "添加快捷回复",
 "saved reply title": "快捷回复的标题",
 "add a short title to your reply": "为您的快捷回复添加简短的标题",
 "add your saved reply": "添加您的快捷回复",
 "add saved reply": "添加快捷回复",
 "your saved reply was created successfully.": "您的快捷回复已成功创建。",
 "edit saved reply": "编辑快捷回复",
 "update saved reply": "更新快捷回复",
 "your saved reply was updated successfully.": "您的快捷回复已成功更新。",
 "__comments-Personal access tokens": "开发者设置/个人访问令牌",
 "personal access tokens": "个人访问令牌",
 "generate new token": "生成新令牌",
 "revoke all": "全部撤销",
 "tokens you have generated that can be used to access the": "生成令牌用于访问",
 "this token has no expiration date": "此令牌未设置有效期",
 "regenerate": "重新生成",
 "this token to take advantage of the": "此令牌使用",
 "new token formats": "新的令牌格式",
 "personal access tokens function like ordinary oauth access tokens. they can be used instead of a password for git over https, or can be used to": "个人访问令牌的功能类似于普通的 OAuth 访问令牌。它们可以用来代替 HTTPS 上 Git 的密码，或者可以用来",
 "authenticate to the api over basic authentication": "通过 Basic Authentication 对 API 进行身份验证",
 "new personal access token": "新的个人访问令牌",
 "note": "笔记",
 "what’s this token for?": "这个令牌有什么用？",
 "expiration": "有效期",
 "7 days": "7天",
 "30 days": "30天",
 "60 days": "60天",
 "90 days": "90天",
 "custom...": "自定义...",
 "no expiration": "无有效期",
 "the token will never expire!": "此令牌永不过期！",
 "beep bop! tokens that live forever are scary. expiration dates are highly recommended!": "哔哔！永不过期的令牌是可怕的。强烈建议设置有效期！",
 "select scopes": "选择作用域",
 "scopes define the access for personal tokens.": "作用域定义了个人令牌的访问范围。",
 "read more about oauth scopes.": "了解更多关于 OAuth 作用域的信息。",
 "full control of private repositories": "完全控制私有仓库",
 "access commit status": "访问提交状态",
 "access deployment status": "访问部署状态",
 "access public repositories": "访问公共仓库",
 "access repository invitations": "访问仓库邀请",
 "read and write security events": "读写安全事件",
 "update github action workflows": "更新 GitHub 操作工作流程",
 "upload packages to github package registry": "将包上传到 GitHub 包注册",
 "download packages from github package registry": "从 GitHub 包注册表下载包",
 "delete packages from github package registry": "从 GitHub 包注册表中删除包",
 "full control of orgs and teams, read and write org projects": "完全控制组织和团队，读写组织项目",
 "read and write org and team membership, read and write org projects": "读写组织和团队成员，读写组织项目",
 "read org and team membership, read org projects": "读取组织和团队成员，读取组织项目",
 "full control of user public keys": "完全控制用户公钥",
 "write user public keys": "写入用户公钥",
 "read user public keys": "读取用户公钥",
 "full control of repository hooks": "完全控制仓库挂钩",
 "write repository hooks": "写入仓库挂钩",
 "read repository hooks": "读取仓库挂钩",
 "full control of organization hooks": "完全控制组织挂钩",
 "create gists": "创建 Gist",
 "access notifications": "访问通知",
 "update all user data": " 更新所有用户数据",
 "read all user profile data": "读取所有用户个人资料数据",
 "access user email addresses (read-only)": "访问用户电子邮件地址（只读）",
 "follow and unfollow users": "关注和取消关注用户",
 "delete repositories": "删除仓库",
 "read and write team discussions": "读写团队讨论",
 "read team discussions": "读取团队讨论",
 "full control of enterprises": "完全控制企业",
 "read and write enterprise billing data": "读写企业计费数据",
 "read enterprise profile data": "读取企业个人数据",
 "full control of public user gpg keys": "完全控制公共用户 GPG 密钥",
 "(developer preview)": "（开发者预览版）",
 "write public user gpg keys": "写入公共用户 GPG 密钥",
 "read public user gpg keys": "读取公共用户 GPG 密钥",
 "generate token": "生成令牌",
 "make sure to copy your personal access token now. you won’t be able to see it again!": "确保立即复制您的个人访问令牌。您将无法再看到它！",
 "are you sure you want to delete this token?": "您确定要删除此令牌吗？",
 "any applications or scripts using this token will no longer be able to access the github api. you cannot undo this action.": "任何使用此令牌的应用程序或脚本将无法再访问 GitHub API。您无法撤消此操作。",
 "i understand, delete this token": "我明白了，依然删除该令牌。",
 "edit personal access token": "编辑个人访问令牌",
 "if you’ve lost or forgotten this token, you can regenerate it, but be aware that any scripts or applications using this token will need to be updated.": "如果您丢失或忘记了此令牌，则可以重新生成它，但请注意，需要更新使用此令牌的任何脚本或应用程序。",
 "this token has no expiration date. to set a new expiration date, you must": "此令牌未设置有效期。要设置新的有效期，您必须",
 "regenerate the token": "重新生成令牌",
 "update token": "更新令牌",
 "delete personal access token": "删除个人访问令牌",
 "delete this token": "删除令牌",
 "regenerate personal access token": "重新生成个人访问令牌",
 "submitting this form will generate a new token. be aware that any scripts or applications using this token will need to be updated.": "提交此表单将产生一个新的令牌。请注意，任何使用该令牌的脚本或应用程序将需要更新。",
 "regenerate token": "重新生成令牌",
 "__comments-12": "Create a Repository",
 "create a new repository": "创建一个新仓库",
 "a repository contains all project files, including the revision history. already have a project repository elsewhere?": "仓库包含项目中的所有文件，包括修订历史记录。在其他地方已有仓库？",
 "import a repository.": "导入仓库",
 "import your project to github": "导入您的项目到 GitHub",
 "import all the files, including the revision history, from another version control system.": "从其他版本控制系统导入所有文件，包括修订历史记录。",
 "your old repository’s clone url": "您旧仓库的克隆地址",
 "learn more about the types of": "了解更多关于",
 "supported vcs.": "支持的版本系统",
 "cancel": "取消",
 "begin import": "开始导入",
 "your new repository details": "您的新仓库详情",
 "great repository names are short and memorable. need inspiration? how about": "好的仓库名称应该简单且容易记忆。需要灵感吗？这个怎么样：",
 "anyone on the internet can see this repository. you choose who can commit.": "任何人都可以看到这个仓库，您可以选择谁能提交。",
 "you choose who can see and commit to this repository.": "您可以选择谁可以看和提交到该仓库。",
 "initialize this repository with:": "使用以下方式初始化此仓库：",
 "skip this step if you’re importing an existing repository.": "如果您要导入现有仓库，请跳过此步骤。",
 "add a readme file": "添加 README 文件",
 "this is where you can write a long description for your project.": "您可以在此处为您的项目编写详细描述。",
 "add .gitignore": "添加 .gitignore 文件",
 ".gitignore template:": ".gitignore 模板:",
 ".gitignore template": ".gitignore 模板",
 "choose which files not to track from a list of templates.": "从模板列表中选择哪些文件不需要跟踪。",
 "choose a license": "选择许可证",
 "license:": "许可证:",
 "license": "许可证",
 "filter licenses...": "过滤许可证…",
 "a license tells others what they can and can't do with your code.": "许可证告诉其他人，他们可以使用您的代码做什么和不能做什么。",
 "this will set": "这将设置",
 "as the default branch.": "为默认分支。",
 "change the default name in": "改变默认名称在",
 "your": "您的",
 "__comments-Create a new project": "新建项目",
 "create a new project": "创建一个新项目",
 "coordinate, track, and update your work in one place, so projects stay transparent and on schedule.": "在这里协调、跟踪和更新您的工作，使项目保持透明和按计划进行。",
 "project board name": "项目板名称",
 "project template": "项目模板",
 "save yourself time with a pre-configured project board template.": "使用预先配置的项目板模板可为您节省时间。",
 "template:": "模板:",
 "templates": "模板",
 "start from scratch with a completely blank project board. you can add columns and configure automation settings yourself.": "从一个完全空白的项目板开始。你可以自己添加栏目并配置自动化设置。",
 "basic kanban": "基础看板",
 "basic kanban-style board with columns for to do, in progress and done.": "基础风格看板，带有待办、进行中和已完成等栏目。",
 "automated kanban": "自动化看板",
 "kanban-style board with built-in triggers to automatically move issues and pull requests across to do, in progress and done columns.": "带有内置触发器的风格看板，可以自动将议题和拉取请求移到待办、进行中和已完成栏目中。",
 "automated kanban with reviews": "带审查的自动看板",
 "everything included in the automated kanban template with additional triggers for pull request reviews.": "除了包含自动化看板模板中的所有内容，还有拉取请求审查的额外触发器。",
 "bug triage": "BUG 分类",
 "triage and prioritize bugs with columns for to do, high priority, low priority, and closed.": "使用待办事项、高优先级、低优先级和已关闭的栏目对错误进行分类和优先级排序。",
 "anyone on the internet can see this project. you choose who can make changes.": "互联网上的任何人都可以看到这个项目。您选择谁可以进行更改。",
 "you choose who can see and make changes to this project.": "您可以选择谁可以查看此项目并对其进行更改。",
 "linked repositories": "关联仓库",
 "to link repositories to this project for more accurate suggestions and better search results.": "将仓库关联到此项目，以获得更准确的建议和更好的搜索结果。",
 "search by repository name": "搜索仓库名",
 "you've reached the limit of 25 linked repositories.": "你已经达到了 25 个关联仓库的上限。",
 "linked repositories:": "关联仓库",
 "none yet!": "啥也木有！",
 "create project": "创建项目",
 "__comments-13": "All Gist",
 "instantly share code, notes, and snippets.": "即时分享您的代码，笔记，片段，以及灵感。",
 "starred gists": "我标星的代码片段",
 "search…": "搜索代码片段…",
 "back to github": "返回到 GitHub",
 "all gists": "所有片段",
 "forked": "复刻",
 "starred": "星标",
 "you don't have any starred gists yet.": "您还没有标星任何片段。",
 "your github profile": "我的 GitHub 个人资料",
 "view github profile": "查看 GitHub 个人资料",
 "last active": "最后活动于",
 "— forked from": "— 复刻自",
 "view": "查看",
 "view your gists": "查看您的所有片段",
 "gist description…": "片段描述",
 "filename including extension…": "文件名 (包括扩展名)",
 "create secret gist": "创建私密片段",
 "secret gists are hidden by search engines but visible to anyone you give the url to.": "私密片段对搜索引擎不可见，对直接访问您分享的 url 可见。",
 "create public gist": "创建公开片段",
 "public gists are visible to everyone.": "公开片段对所有人可见。",
 "sort:": "排序:",
 "sort options": "排序选项",
 "recently created": "最近创建的",
 "least recently created": "最早创建的",
 "filter options": "过滤选项",
 "secret": "私密",
 "newer": "新的",
 "older": "旧的",
 "edit": "编辑",
 "delete": "删除",
 "revisions": "修订",
 "stars": "星标",
 "forks": "复刻",
 "raw": "源码",
 "revised": "修订",
 "this gist": "该片段于",
 "what would you like to do?": "您想做什么？",
 "embed": "嵌入",
 "embed this gist in your website.": "嵌入到您的网页中。",
 "share": "分享",
 "copy sharable link for this gist.": "复制片段共享链接。",
 "clone via https": "通过 HTTPS 方式克隆",
 "clone via ssh": "通过 SSH 方式克隆",
 "clone with git or checkout with svn using the repository’s web address.": "通过仓库 web 地址进行 Git 克隆或 SVN 检出。",
 "clone with an ssh key and passphrase from your github settings.": "通过 GitHub 设置中的 SSH 密钥和密码进行克隆。",
 "learn more about clone urls": "了解有关克隆地址的更多信息",
 "editing": "编辑",
 "make secret": "转为私密",
 "make public": "转为公开",
 "update public gist": "更新公开片段",
 "update secret gist": "更新私密片段",
 "__comments-14": "Commit editing and browsing",
 "edit new file": "编辑新文件",
 "cancel changes": "取消更改",
 "edit file": "编辑文件",
 "preview changes": "预览更改",
 "loading preview…": "载入预览…",
 "there are no changes to show.": "没有可显示的更改。",
 "commit new file": "提交新文件",
 "commit changes": "提交更改",
 "propose change": "提出更改",
 "add an optional extended description": "添加可选的扩展描述",
 "add an optional extended description…": "添加可选的扩展描述…",
 "commit directly to the": "直接提交到",
 "branch.": "分支。",
 "create a new branch for this commit and start a pull request. learn more about pull requests.": "为此提交创建一个新分支，并启动拉取请求。",
 "create a": "创建一个",
 "new branch": "新分支",
 "for this commit and start a pull request.": "用于此提交并启动拉取请求。",
 "learn more about pull requests.": "了解有关拉取请求的更多信息。",
 "browse files": "浏览文件",
 "always": "总是",
 "unified": "同屏",
 "split": "分屏",
 "just for now": "仅当前",
 "hide whitespace changes": "隐藏空白更改",
 "apply and reload": "应用并重新加载",
 "show comments": "显示评论",
 "viewed": "已查看",
 "marking files as viewed can help keep track of your progress, but will not affect your submitted review": "将文件标记为已查看可以帮助您跟踪进度，但不会纠正您提交的审查",
 "view file": "查看文件",
 "delete file": "删除文件",
 "jump to": "跳转到",
 "jump to file": "跳转到文件",
 "filter changed files": "过滤更改的文件",
 "file filter": "文件过滤",
 "filter file types": "过滤文件类型",
 "filter viewed files": "过滤已查看文件",
 "hide viewed files": "隐藏已查看文件",
 "filter by context": "过滤内容",
 "manifest files": "清单文件",
 "show all changes": "显示所有更改",
 "show changes since your last review": "显示自您上次评论以来的更改",
 "you haven‘t reviewed this pull requeste": "您尚未审查过此请求请求",
 "select commit": "选择提交",
 "propose changes": "提出更改",
 "stargazers": "追星者",
 "modified": "修改",
 "view fork": "浏览复刻",
 "__comments-15": "File code browsing and editing",
 "code definitions": "代码定义",
 "filter definitions": "过滤定义",
 "no definitions found in this file.": "本文件中没有发现任何定义。",
 "code navigation not available for this commit": "该提交的代码导航不可用",
 "code navigation index up-to-date": "代码导航索引最新",
 "go to line": "跳转到行",
 "go to definition": "跳转到定义",
 "copy path": "复制路径",
 "copy permalink": "复制永久链接",
 "copy raw contents": "复制原码内容",
 "copied!": "已复制！",
 "edit this file": "编辑本文件",
 "edit the file in your fork of this project": "在您的复刻中编辑该文件",
 "delete this file": "删除本文件",
 "delete the file in your fork of this project": "在您的复刻中删除该文件",
 "history": "历史",
 "latest commit": "最新提交",
 "view all branches": "查看所有分支",
 "view all tags": "查看所有标签",
 "nothing to show": "没有什么可显示",
 "find or create a branch…": "查找或创建分支…",
 "find a tag": "查找标签",
 "indent mode": "缩进模式",
 "spaces": "空格",
 "tabs": "tab",
 "indent size": "缩进大小",
 "line wrap mode": "换行模式",
 "no wrap": "不换行",
 "soft wrap": "软换行",
 "copy lines": "复制行",
 "copy line": "复制行",
 "view git blame": "浏览 Git Blame",
 "want to use a": "想使用",
 "template?": "模板吗？",
 "filter ignores…": "过滤忽略…",
 "choose .gitignore:": "选择 .gitignore:",
 "__comments-16": "Comment",
 "write": "撰写",
 "preview": "预览",
 "leave a comment": "发表评论",
 "nothing to preview": "没有什么可预览",
 "insert a suggestion <ctrl+g>": "插入建议 <ctrl+g>",
 "applying suggestions on deleted lines is not supported.": "不支持对删除的行应用建议。",
 "add header text": "添加标题文本",
 "add bold text <ctrl+b>": "添加粗体文本 <ctrl+b>",
 "add italic text <ctrl+i>": "添加斜体文本 <ctrl+i>",
 "insert a quote <ctrl+.>": "插入引用 <ctrl+.>",
 "insert a quote <ctrl+shift+.>": "插入引用 <ctrl+shift+.>",
 "insert code <ctrl+e>": "插入代码 <ctrl+e>",
 "add a link <ctrl+k>": "添加链接 <ctrl+k>",
 "add a bulleted list <ctrl+shift+8>": "添加无序列表 <ctrl+shift+8>",
 "add a numbered list <ctrl+shift+7>": "添加有序列表 <ctrl+shift+7>",
 "add a numbered list <ctrl+shift+9>": "添加有序列表 <ctrl+shift+9>",
 "add a task list": "添加任务列表",
 "directly mention a user or team": "直接提及用户或团队",
 "attach an image or video": "附加图片或视频",
 "reference an issue, pull request or discussion": "引用议题，拉取请求或讨论",
 "reference an issue or pull request": "引用议题或拉取请求",
 "insert a reply": "插入回复",
 "suggested change": "更改建议",
 "this code change can be committed by users with write permissions.": "此处代码修改可以由具有写入权限的用户提交。",
 "you must change the existing code in this line in order to create a valid suggestion.": "您必须修改此行的现有代码，以便创建有效的建议。",
 "are you sure you want to discard your unsaved changes?": "您确定要丢弃您未保存的修改吗？",
 "comment": "评论",
 "comment on this commit": "评论",
 "select a reply": "选择一个回复",
 "filter replies…": "过滤回复",
 "create a new saved reply…": "创建新的快捷回复…",
 "default replies": "默认回复",
 "copy link": "复制链接",
 "quote reply": "引用回复",
 "report content": "举报内容",
 "commented": "评论于",
 "update comment": "更新评论",
 "hide": "隐藏",
 "edited": "编辑",
 "more options": "更多选项",
 "the most recent revision cannot be deleted. need to delete sensitive information? go to the specific edit where the information was added.": "最近的修订版不能被删除。需要删除敏感信息？请到信息的具体编辑处修改。",
 "delete revision from history": "从历史记录中删除修订",
 "this edit’s content will no longer be visible": "此修改的内容将不再可见",
 "styling with markdown is supported": "支持使用 Markdown 样式",
 "attach files by dragging & dropping, selecting or pasting them.": "通过拖放，选择或粘贴来附加文件。",
 "attach files by selecting or pasting them.": "通过选择或粘贴来附加文件。",
 "attach binaries by dropping them here or selecting them.": "通过文件拖放到此处或选择它们来附加文件。",
 "uploading your files…": "正在上传您的文件...",
 "we don’t support that file type.": "我们不支持该文件类型。",
 "this file is empty.": "该文件是空的。",
 "this file is hidden.": "该文件是隐藏的。",
 "try again": "请重试，",
 "with a gif, jpeg, jpg, mov, mp4, png, csv, docx, fodg, fodp, fods, fodt, gz, log, md, odf, odg, odp, ods, odt, pdf, pptx, txt, xls, xlsx or zip.": "使用后缀名为 GIF, JPEG, JPG, MOV, MP4, PNG, CSV, DOCX, FODG, FODP, FODS, FODT, GZ, LOG, MD, ODF, ODG, ODP, ODS, ODT, PDF, PPTX, TXT, XLS, XLSX 或 ZIP的文件。",
 "with a gif, jpeg, jpg, mov, mp4 or png.": "使用后缀名为 GIF, JPEG, JPG, MOV, MP4 或 PNG的文件。",
 "with a file that’s not empty.": "使用一个非空的文件。",
 "with another file.": "使用另一个文件。",
 "something went really wrong, and we can’t process that file.": "确实出了点问题，我们无法处理该文件。",
 "try again.": "请重试。",
 "attaching documents requires write permission to this repository.": "附加文件需要对该仓库拥有写入权限。",
 "no changes to display.": "没有任何变化",
 "unable to load this preview, sorry.": "抱歉，无法加载此预览。",
 "__comments-17": "授权",
 "you have unread notifications": "您有未读通知",
 "you have no unread notifications": "您没有未读通知",
 "inbox": "收件箱",
 "saved": "已保存",
 "save": "保存",
 "done": "已完成",
 "unread": "未读",
 "filters": "过滤",
 "dismiss": "关闭",
 "get started": "开始",
 "subscribe": "订阅",
 "unsubscribe": "退订",
 "group by:": "分组:",
 "date": "日期",
 "filter notifications": "过滤通知",
 "repository": "仓库",
 "mark as read": "标记为已读",
 "mark as unread": "标记为未读",
 "clear out the clutter.": "清除混乱。",
 "get the most out of your new inbox by quickly and easily marking all of your previously read notifications as done.": "快速轻松地将所有已阅读的通知标记为已完成，以充分利用新的收件箱。",
 "overwhelmed by notifications? we've found some repositories that may be causing notifications you don't need.": "通知不知所措？我们发现了一些仓库，这些仓库可能会导致您不需要的通知。",
 "update watching settings": "更新关注设置",
 "select all": "全选",
 "manage notifications": "管理通知",
 "notification settings": "通知设置",
 "watched repositories": "关注的仓库",
 "subscriptions": "订阅",
 "watching": "关注",
 "create new filter": "创建新规则",
 "prev": "上一页",
 "previous": "上一页",
 "next": "下一页",
 "change notification settings": "更改通知设置",
 "you can change how you receive notifications from your account settings.": "您可以更改通过帐户设置接收通知的方式。",
 "unwatch suggestions": "取消关注建议",
 "these repositories may be causing unnecessary notifications.": "这些仓库可能导致不必要的通知。",
 "unwatch all": "全部取消关注",
 "customize": "自定义",
 "ignoring": "忽略",
 "stop ignoring": "取消忽略",
 "back to notifications": "回到通知",
 "🎯 assigned": "🎯 已分配",
 "💬 participating": "💬 参与",
 "✋ mentioned": "✋ 提及",
 "🙌 team mentioned": "🙌 提到的团队",
 "👀 review requested": "👀 审查请求",
 "filter inbox by…": "过滤收件箱…",
 "create": "创建",
 "confirm access": "授权访问",
 "you are entering": "您正在进入",
 "sudo mode": "sudo 模式",
 ". we won’t ask for your password again for a few hours.": " 。我们将在未来几个小时内不再要求您输入密码。",
 "__comments-18": "安全",
 "deployed to github-pages": "部署到 github-pages",
 "view deployment": "查看部署",
 "activity log": "活动记录",
 "view full activity log": "查看完整的活动记录",
 "show:": "显示:",
 "all environments": "所有环境",
 "__comments-advanced-search": "Advanced search",
 "you could try an": "您可以尝试",
 "advanced search": "高级搜索",
 "search": "搜索",
 "advanced options": "高级选项",
 "from these owners": "来自那些所有者",
 "in these repositories": "来自那些仓库",
 "created on the dates": "创建于何时",
 "written in this language": "用何种语言编写",
 "any language": "任意语言",
 "popular": "流行",
 "repositories options": "仓库选项",
 "with this many stars": "有多少星标",
 "with this many forks": "有多少复刻",
 "of this size": "仓库大小",
 "repository size in kb": "仓库的大小，单位是KB",
 "pushed to": "推送于何时",
 "with this license": "用何种许可证",
 "any license": "任意许可证",
 "return repositories": "返回仓库",
 "including forks.": "包括复刻",
 "not": "不",
 "only": "仅",
 "code options": "代码选项",
 "with this extension": "文件后缀名",
 "of this file size": "文件大小",
 "in this path": "文件路径",
 "with this file name": "文件名称",
 "return code": "返回代码",
 "issues options": "议题选项",
 "in the state": "状态",
 "open/closed": "打开/关闭",
 "open": "已打开",
 "closed": "已关闭",
 "with this many comments": "有多少评论",
 "with the labels": "带有那些标签",
 "opened by the author": "由那些作者打开",
 "mentioning the users": "提及那些用户",
 "assigned to the users": "分配给那些用户",
 "updated before the date": "更新于何时",
 "users options": "用户选项",
 "with this full name": "全名",
 "from this location": "位置",
 "with this many followers": "有多少粉丝",
 "with this many public repositories": "有多少公共仓库",
 "working in this language": "工作于何种语言",
 "wiki options": "Wiki 选项",
 "we found potential security vulnerabilities in your dependencies.": "我们在您的依赖项中发现了潜在的安全漏洞。",
 "only the owner of this repository can see this message.": "仅此仓库的所有者可以看到此消息。",
 "see dependabot alerts": "查看 Dependabot 警报",
 "security overview": "安全概述",
 "security policy": "安全政策",
 "define how users should report security vulnerabilities for this repository": "定义用户应如何报告此仓库的安全漏洞",
 "set up a security policy": "制定安全政策",
 "help your community understand how to securely report security vulnerabilities for your project.": "帮助您的社区了解如何安全地报告项目的安全漏洞。",
 "start setup": "开始设置",
 "suggest how users should report security vulnerabilities for this repository": "建议用户应如何报告此仓库的安全漏洞",
 "suggest a security policy": "安全政策建议",
 "security advisories": "安全公告",
 "view or disclose security advisories for this repository": "查看或公开此仓库的安全公告",
 "view security advisories": "查看安全公告",
 "view security advisories for this repository": "查看此仓库的安全公告",
 "dependabot alerts": "Dependabot 警报",
 "get notified when one of your dependencies has a vulnerability": "当您的一个依赖项存在漏洞时得到通知",
 "enable dependabot alerts": "启用 Dependabot 警报",
 "view dependabot alerts": "查看 Dependabot 警报",
 "code scanning alerts": "代码扫描警报",
 "automatically detect common vulnerability and coding errors": "自动检测常见漏洞和编码错误",
 "set up code scanning": "设置代码扫描",
 "vulnerability details": "漏洞详情",
 "high severity": "高风险",
 "moderate severity": "中风险",
 "create dependabot security update": "创建可靠的安全更新",
 "__comments-workflows": "workflows",
 "workflows": "工作流程",
 "new workflow": "新建工作流程",
 "select workflow": "选择工作流程",
 "all workflows": "全部工作流程",
 "showing runs from all workflows": "显示所有工作流程的运行情况",
 "event": "事件",
 "filter by event": "按事件过滤",
 "find an event": "查找事件",
 "filter workflow runs": "过滤工作流程",
 "narrow your search": "缩小搜索范围",
 "filter by status": "按状态过滤",
 "find a status": "查找状态",
 "queued": "排队",
 "in progress": "正在进行中",
 "waiting": "等待中",
 "completed": "已完成",
 "neutral": "中立",
 "success": "成功",
 "failure": "失败",
 "cancelled": "已取消",
 "action required": "需要采取行动",
 "timed out": "已超时",
 "skipped": "跳过",
 "stale": "陈旧",
 "filter by branch": "按分支过滤",
 "actor": "角色",
 "filter by actor": "按角色过滤",
 "find a user": "查找用户",
 "summary": "摘要",
 "workflow file": "工作流程文件",
 "jobs": "作业",
 "triggered via issues": "通过议题触发",
 "total duration": "总时长",
 "billable time": "计费时间",
 "artifacts": "附件",
 "the logs for this run have expired and are no longer available.": "此运行日志已过期，不再可用。",
 "view workflow file": "查看工作流程文件",
 "view workflow runs": "查看工作流程运行",
 "create status badge": "创建状态徽章",
 "delete all logs": "删除所有日志",
 "delete workflow run": "删除工作流程运行",
 "this workflow has a": "这个工作流程有一个",
 "event trigger.": "事件触发器。",
 "run workflow": "运行工作流程",
 "workflow run was successfully requested.": "工作流程已成功请求运行。",
 "use workflow from": "使用工作流程来自：",
 "this scheduled workflow is disabled because there hasn't been activity in this repository for at least 60 days.": "此计划工作流程已禁用，因为此仓库至少 60 天没有活动。",
 "enable workflow": "启用工作流程",
 "workflow enabled successfully.": "工作流程已成功启用。",
 "disable workflow": "禁用工作流程",
 "this workflow was disabled manually.": "工作流程已被手动禁用。",
 "wrkflow disabled successfully.": "工作流程已成功禁用。",
 "re-run jobs": "重新运行作业",
 "re-run all jobs": "重新运行所有作业",
 "search logs": "搜索日志",
 "show timestamps": "显示时间戳",
 "show full screen (shift+f)": "全屏显示（Shift+F）",
 "download log archive": "下载日志存档",
 "view raw logs": "查看原始日志",
 "start commit": "开始提交",
 "view runs": "查看工作流程",
 "try broadening your search filters.": "尝试扩大您的搜索过滤器。",
 "__comments-Release": "发行版",
 "latest release": "最新发行版",
 "pre-release": "预发行版",
 "update release": "更新发行版",
 "this is a pre-release": "这是一个预发行版",
 "we’ll point out that this release is identified as non-production ready.": "我们需要指出的是，这个版本被认定为非生产准备。",
 "draft a new release": "起草发行版",
 "save draft": "保存草案",
 "saved!": "已保存",
 "discard draft": "丢弃草案",
 "this is a draft and won’t be seen by the public unless it’s published.": "这是一个草案，除非发布，否则不会被公众看到。",
 "choose an existing tag, or create a new tag on publish": "选择一个现有的标签，或在发布时创建一个新标签",
 "existing tag": "现有标签",
 "excellent! this tag will be created from the target when you publish this release.": "优秀! 当您发布这个版本时，这个标签将从目标创建。",
 "publish release": "发布发行版",
 "edit release": "编辑发行版",
 "notes": "笔记",
 "downloads": "下载",
 "tagging suggestions": "标签建议",
 "it’s common practice to prefix your version names with the letter": "通常的做法是在版本名称前加上字母",
 ". some good tag names might be": "。一些好的标签名称可能是",
 "if the tag isn’t meant for production use, add a pre-release version after the version name. some good pre-release versions might be": "如果标签不是用于生产的，就在版本名后面加上预发布版本。一些好的预发布版本可能是",
 "tag version": "标签版本",
 "choose a tag": "选择标签",
 "find or create a new tag": "查找或创建新标签",
 "target:": "目标:",
 "pick a branch or recent commit": "选择一个分支或最近的提交",
 "filter branches…": "过滤分支…",
 "release title": "发行版标题",
 "describe this release": "发行版描述",
 "loading tag information…": "载入标签信息…",
 "choose a tag to compare": "选择一个标签进行比较",
 "invalid tag name": "无效的标签名称",
 "we can’t create a tag with this name. take a look at the suggestions in the sidebar for example tag names.": "我们不能用这个名字创建标签。看看侧边栏的建议，看看标签名称的例子。",
 "duplicate tag name": "重复的标签名称",
 "this tag already has release notes. would you like to": "这个标签已经有发布说明。 您是否愿意",
 "edit them?": "编辑他们？",
 "change this file’s name": "更改文件名称",
 "will be deleted": "将被删除",
 "(undo)": "(撤销)",
 "uploading your release now…": "正在上传您的发行版...",
 "an attachment with that filename already exists.": "该文件名的附件已经存在。",
 "try a different file.": "请尝试不同的文件。",
 "we don’t support that file type.  try zipping it.": "我们不支持该文件类型，请尝试压缩它。",
 "try another file.": "请尝试另一个文件。",
 "yowza, that’s a big file.": "哟，这可是个大文件。",
 "with a file smaller than 2GB.": "使用一个小于 2GB 的文件。",
 "are you sure?": "您确定哇?",
 "this will delete the information for this release.": "这将会删除该发行版的信息。",
 "delete this release": "删除发行版",
 "this will delete the information for this draft.": "这将会删除该草案的信息。",
 "delete this draft": "删除草案",
 "create release": "创建发行版",
 "__comments-Other": "其他",
 "updated": "更新于",
 "recent commits": "最近的提交",
 "loading…": "加载中…",
 ".": "。",
 "new label": "新标签",
 "create label": "创建标签",
 "saving…": "保存中…",
 "mark as": "标记为",
 "assign": "分配",
 "apply labels": "应用标签",
 "updating": "更新中",
 "generating an automated security update": "生成自动安全更新",
 "file successfully deleted.": "文件已成功删除。",
 "abandoned": "废弃",
 "organization permissions": "组织权限",
 "browse your starred repositories and topics": "浏览我的标星仓库和话题",
 "view all repositories": "查看所有仓库",
 "this commit does not belong to any branch on this repository, and may belong to a fork outside of the repository.": "这个提交不属于本仓库的任何分支，可能属于仓库以外的分支。",
 "started a review": "开始评论",
 "download": "下载",
 "created": "已创建",
 "assigned": "已分配",
 "mentioned": "已提及",
 "visibility": "可见性",
 "repository visibility": "仓库可见性",
 "private repositories only": "仅私有仓库",
 "public repositories only": "仅公共仓库",
 "organization": "组织",
 "filter by organization or owner": "按组织或所有者过滤",
 "filter organizations": "按组织过滤",
 "successfully fetched and fast-forwarded from upstream": "",
 "branch created.": "分支已成功创建。",
 "Choose a template": "选择模板",
 "Start a codespace from a template and get to developing with the power of a virtual machine in the cloud.": "从模板启动代码空间，并利用云虚拟机的强大功能进行开发。",
 "Explore quick start templates": "探索快速启动模板",
 "See all": "查看全部",
 "Go to docs": "查看文档",
 "New codespace": "新建代码空间",
 "Use this template": "使用此模板",
 "Extend GitHub": "拓展GitHub",
 "Find tools to improve your workflow": "寻找改进工作流程的工具",
 "__comments_homepage": "首页翻译",
 "product": "产品",
 "solutions": "解决方案",
 "open source": "开源项目",
 "__dict-end": "end",
 "quality": "质量",
 "agents": "代理",
 "copilot": "Copilot",
 "gist": "Gist",
 "codespace": "代码空间",
 "login": "登录",
 "register": "注册",
 "quick start": "快速开始",
 "new file": "新建文件"
};
var CSS_RULES = [
 {
  "_comments": [
   "if key === '!html' replace target by: $(selector).html(replacement)",
   "else: $(selector).attr(key, replacement)"
  ],
  "key": "!html",
  "selector": "a[aria-label='Pull requests you created']",
  "replacement": "拉取请求"
 }
];
function normKey(s) {
  return String(s).replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}
function normText(s) {
  return String(s).replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim();
}
function hasOwn(obj, k) { return Object.prototype.hasOwnProperty.call(obj, k); }
function dictGet(key) { return hasOwn(DICT, key) ? DICT[key] : null; }

/* 文本分段翻译：按空白拆分、逐段查字典，保留原文本的空白/分隔结构 */
function splitTranslate(text) {
  var parts = text.split(/(\s+)/);
  var out = [], changed = false;
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i];
    if (p === '' || /^\s+$/.test(p)) { out.push(p); continue; }
    var k = normKey(p);
    var v = dictGet(k);
    if (v === null) { /* 尝试去掉尾部标点，如 "Pull requests." */
      var k2 = k.replace(/[.,;:!?。，；：!?]+$/, '');
      if (k2 && k2 !== k) v = dictGet(k2);
    }
    if (v !== null) { out.push(v); changed = true; } else { out.push(p); }
  }
  return changed ? out.join('') : null;
}

/* UI 文案形态判断：过长的句子、email、版本号等不给拆词翻译 */
function looksLikeUiText(text) {
  if (!text || text.length > 80) return false;
  if (text.indexOf('@') !== -1 && text.indexOf(' ') === -1) return false;
  if (/(…\s*)$/.test(text)) return false;
  var wc = normText(text).split(/\s+/).length;
  if (wc > 6) return false;              // UI 文案一般不超过 6 个词
  if (wc === 1 && /\d/.test(text) && /[a-z]/i.test(text)) return false; // 版本号/标识符
  return true;
}


for (var _aiK in aiCache) { if (!hasOwn(DICT, _aiK) && aiCache[_aiK]) DICT[_aiK] = aiCache[_aiK]; }

function translateTextNode(node) {
  if (DONE.has(node)) return false;
  var raw = node.nodeValue;
  if (!raw || !raw.trim()) return false;
  var parent = node.parentElement;
  if (!parent) return false;
  if (shouldSkipElement(parent)) return false;

  var text = normText(raw);
  if (text.length < 2 || text.length > 160) return false;

  /* 1) 整句精确匹配（保留原行为：整节点文本完全命中词库才整体替换） */
  var hit = dictGet(normKey(text));
  if (hit !== null) { node.nodeValue = hit; DONE.add(node); return true; }

  /* 2) UI 控件上的短文本 → 拆分翻译，提高命中率 */
  if (looksLikeUiText(text)) {
    var uiTag = /^(A|BUTTON|LI|NAV|HEADER|OPTION|SELECT)$/;
    if (uiTag.test(parent.tagName)) {
      var out = splitTranslate(text);
      if (out) { node.nodeValue = out; DONE.add(node); return true; }
    }
  }
  /* AI 补译由 F9 统一调度，不在此自动入队 */
  return false;
}
var ATTR_LIMIT = 80;
function translateAttrValue(v) {
  if (!v) return null;
  var text = normText(v);
  if (text.length === 0 || text.length > ATTR_LIMIT) return null;
  var hit = dictGet(normKey(text));
  if (hit !== null) return hit;
  if (looksLikeUiText(text)) return splitTranslate(text);
  return null;
}
function processElementAttrs(el) {
  if (isMarked(el)) return false;
  var tag = el.tagName;
  var t = '';
  try { t = (el.getAttribute('type') || '').toLowerCase(); } catch (e) { }

  if (tag === 'INPUT') {
    if ((t === 'button' || t === 'submit' || t === 'reset' || t === 'image') && el.value) {
      var v = translateAttrValue(el.value);
      if (v) { el.value = v; el.setAttribute(MARC, '1'); return true; }
    }
    if (el.placeholder) {
      var ph = translateAttrValue(el.placeholder);
      if (ph) { el.placeholder = ph; el.setAttribute(MARC, '1'); return true; }
    }
  } else if (tag === 'TEXTAREA' || tag === 'SELECT') {
    if (el.placeholder) {
      var ph2 = translateAttrValue(el.placeholder);
      if (ph2) { el.placeholder = ph2; el.setAttribute(MARC, '1'); return true; }
    }
  }

  var al = el.getAttribute && el.getAttribute('aria-label');
  if (al) {
    var al2 = translateAttrValue(al);
    if (al2) { el.setAttribute('aria-label', al2); el.setAttribute(MARC, '1'); return true; }
  }
  return false;
}
function formatRelative(ms) {
  try {
    var rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
    var units = [
      ['year', 31536000000], ['month', 2629800000], ['day', 86400000],
      ['hour', 3600000], ['minute', 60000], ['second', 1000]
    ];
    for (var i = 0; i < units.length; i++) {
      if (Math.abs(ms) >= units[i][1]) {
        return rtf.format(Math.round(ms / units[i][1]), units[i][0]);
      }
    }
    return rtf.format(0, 'second');
  } catch (e) { return null; }
}
var LAST_TIME_TRANS = 0;
function translateTimes(root) {
  if (Date.now() - LAST_TIME_TRANS < 2000) return; // 节流，避免与 GitHub 自身渲染争抢
  LAST_TIME_TRANS = Date.now();
  var nodes = root.querySelectorAll('relative-time, time[datetime], [data-view-component="true"][datetime]');
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    var dt = el.getAttribute && el.getAttribute('datetime');
    if (!dt) continue;
    var t = Date.parse(dt);
    if (isNaN(t)) continue;
    var out = formatRelative(t - Date.now());
    if (!out) continue;
    try {
      if (el.shadowRoot) {
        if (el.shadowRoot.textContent !== out) el.shadowRoot.textContent = out;
      } else {
        if (el.textContent !== out) el.textContent = out;
      }
    } catch (e) { }
  }
}
function applyCssRules(root) {
  for (var i = 0; i < CSS_RULES.length; i++) {
    var r = CSS_RULES[i];
    try {
      var els = root.querySelectorAll(r.selector);
      if (!els || !els.length) continue;
      var el = els[0];
      if (r.key === '!html') {
        if (el.textContent !== r.replacement) el.textContent = r.replacement;
      } else if (r.key) {
        el.setAttribute(r.key, r.replacement);
      }
    } catch (e) { /* 选择器异常忽略 */ }
  }
}
function aiCandidate(text) {
  if (!aiCfg.enabled || !text) return false;
  if (text.length < 3 || text.length > (aiCfg.maxChars || 120)) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (/[\u4e00-\u9fff]/.test(text)) return false;
  if (/^(https?:\/\/|www\.|\/|\.|#|\d+(\.\d+)*$)/.test(text)) return false;
  if (/@|[\w-]+\/[\w-]+/.test(text)) return false;
  if (/\.(js|ts|jsx|tsx|md|json|yml|yaml|py|css|html|svg|png|zip|exe)$/i.test(text)) return false;
  if (/^(sha|commit|hash|v?\d+\.\d+)/i.test(text)) return false;
  if (text.split(/\s+/).length > 12) return false;
  return true;
}
function aiPrompt(texts) {
  return '把下面 GitHub 界面的英文文案逐条翻译成简体中文。规则：只输出 JSON 字符串数组，长度必须与输入完全一致、顺序一一对应；保留 GitHub、PR、Issue、Actions、Repo、Fork、Commit、Merge、Gist、Workflow 等专有名词与代码标识符不译；用简短的中文 UI 用词；不要解释、不要编号。输入：' + JSON.stringify(texts);
}
function aiParse(content, n, texts) {
  var s = String(content || '').trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  var a = null;
  try { a = JSON.parse(s); } catch (e) {
    var m = s.match(/\[[\s\S]*\]/) || s.match(/\{[\s\S]*\}/);
    if (m) { try { a = JSON.parse(m[0]); } catch (e2) { return null; } }
  }
  if (Array.isArray(a)) {
    if (a.length !== n) return null;
    return a.map(function (x) { return String(x == null ? '' : x).trim(); });
  }
  /* 部分 Nemotron 模型返回 {"原文":"译文"} 对象，按输入顺序映射回来 */
  if (a && typeof a === 'object' && texts && texts.length === n) {
    var keys = Object.keys(a), out = [];
    for (var i = 0; i < n; i++) {
      var hit = hasOwn(a, texts[i]) ? a[texts[i]] : '';
      if (!hit) {
        for (var k = 0; k < keys.length; k++) {
          if (normKey(keys[k]) === normKey(texts[i])) { hit = a[keys[k]]; break; }
        }
      }
      if (!hit) return null;
      out.push(String(hit).trim());
    }
    return out;
  }
  return null;
}
function aiBuiltin(texts, cb) {
  if (typeof LanguageModel === 'undefined') { cb('当前浏览器不支持内置 AI，请改用 API Key 方案'); return; }
  var p;
  try { p = LanguageModel.create(); } catch (e) { cb('内置 AI 初始化失败：' + e.message); return; }
  Promise.resolve(p).then(function (session) {
    return session.prompt(aiPrompt(texts));
  }).then(function (out) {
    var arr = aiParse(out, texts.length, texts);
    cb(arr ? null : '内置 AI 返回格式异常', arr);
  }).catch(function (e) { cb('内置 AI 失败：' + (e && e.message || e)); });
}

/* OpenAI 兼容 /chat/completions；NVIDIA Nemotron 需关闭思考，否则 content 为 null */
function aiRequest(texts, cb) {
  if (aiCfg.provider === 'builtin') { aiBuiltin(texts, cb); return; }
  if (!aiCfg.apiKey) { cb('未配置 API Key（或把 CFG.ai.provider 设为 builtin）'); return; }
  var payload = {
    model: aiCfg.model, temperature: 0, stream: false,
    messages: [
      { role: 'system', content: '你是专业的软件界面本地化翻译器，严格按用户要求输出 JSON。' },
      { role: 'user', content: aiPrompt(texts) }
    ]
  };
  if (aiCfg.thinkingOff && /integrate\.api\.nvidia\.com/i.test(aiCfg.baseUrl)) {
    payload.chat_template_kwargs = { thinking: false };
  }
  xhr({
    method: 'POST', url: aiCfg.baseUrl, timeout: aiCfg.timeout || 60000,
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + aiCfg.apiKey },
    data: JSON.stringify(payload)
  }).then(function (body) {
    try {
      var j = JSON.parse(body);
      var msg = (j.choices && j.choices[0] && j.choices[0].message) || {};
      var c = msg.content;
      if (!c) { cb('模型未输出译文（推理模型未关闭思考或 token 不足）'); return; }
      var arr = aiParse(c, texts.length, texts);
      if (!arr) { cb('模型返回的不是等长 JSON 数组'); return; }
      cb(null, arr);
    } catch (e) { cb('响应解析失败：' + e.message); }
  }).catch(function (e) { cb(e.message || '请求失败'); });
}

function aiSaveCache() {
  var keys = Object.keys(aiCache);
  if (keys.length > 3000) {
    var keep = keys.slice(-2000), n = {};
    for (var i = 0; i < keep.length; i++) n[keep[i]] = aiCache[keep[i]];
    aiCache = n;
  }
  try { gmSet(AI_CACHE_KEY, JSON.stringify(aiCache)); } catch (e) { }
}

/* ---- F9 调度入口 1：词库汉化（复用统一收集到的文本节点，不重复遍历） ---- */
function applyDict(nodes, root) {
  if (CFG.githubLang === 'off') return 0;
  var n = 0;
  for (var i = 0; i < nodes.length; i++) {
    try { if (translateTextNode(nodes[i])) n++; } catch (e) { }
  }
  try {
    var inputs = root.querySelectorAll('input, textarea, select');
    for (var j = 0; j < inputs.length; j++) {
      if (processElementAttrs(inputs[j])) n++;
    }
  } catch (e) { }
  try { translateTimes(root); } catch (e) { }
  try { applyCssRules(root); } catch (e) { }
  return n;
}

/* ---- F9 调度入口 2：AI 批量补译（词库未命中的英文短文案） ---- */
function aiComplete(nodes, done) {
  if (!aiCfg.enabled || !aiCfg.apiKey) { done({ ok: 0, failed: 1, reason: 'AI 未启用或未配置 Key' }); return; }
  var groups = {}, texts = [];
  for (var i = 0; i < nodes.length; i++) {
    var nd = nodes[i];
    if (!nd || !nd.parentNode || DONE.has(nd)) continue;
    var raw = nd.nodeValue || '';
    var text = raw.replace(/\xA0/g, ' ').replace(/\s+/g, ' ').trim();
    if (!aiCandidate(text) || hasOwn(DICT, normKey(text))) continue;
    var key = normKey(text);
    if (!Object.prototype.hasOwnProperty.call(groups, key)) { groups[key] = []; texts.push(text); }
    groups[key].push({ node: nd, raw: raw, text: text });
  }
  if (!texts.length) { done({ ok: 0, failed: 0, reason: '无需补译' }); return; }

  var batches = [];
  for (var s = 0; s < texts.length; s += (aiCfg.batchSize || 20)) {
    batches.push(texts.slice(s, s + (aiCfg.batchSize || 20)));
  }
  var bi = 0, ok = 0, failed = 0, lastErr = '';

  function next() {
    if (bi >= batches.length) { aiSaveCache(); done({ ok: ok, failed: failed, reason: lastErr }); return; }
    var b = batches[bi++];
    aiRequest(b, function (err, arr) {
      if (err) {
        failed++; lastErr = err;
        toast('AI 补译失败：' + err);
      } else {
        for (var k = 0; k < b.length; k++) {
          var t = arr[k];
          if (!t || t === b[k]) continue;
          var recs = groups[normKey(b[k])] || [];
          for (var q = 0; q < recs.length; q++) {
            var r = recs[q];
            if (!r.node.parentNode || r.node.nodeValue !== r.raw) continue;
            var lead = (r.raw.match(/^\s*/) || [''])[0];
            var trail = (r.raw.match(/\s*$/) || [''])[0];
            r.node.nodeValue = lead + t + trail;
            DONE.add(r.node);
          }
          if (aiCfg.cache) { aiCache[normKey(b[k])] = t; DICT[normKey(b[k])] = t; }
          ok++;
        }
      }
      next();
    });
  }
  next();
}

return { applyDict: applyDict, aiComplete: aiComplete };
})();


/* ==================================================================
 * 唯一触发：F9（全脚本仅此 1 个 addEventListener）
 * ================================================================== */

/* ==================================================================
 * AI 翻译设置面板（仅配置大模型；翻译仍只由 F9 触发）
 * 入口：篡改猴菜单「AI 翻译设置」/ 页面左下浮动「AI 设置」按钮
 * 配置保存在本机篡改猴存储，不上传任何页面
 * ================================================================== */
var AI_SET_KEY = 'ai_settings';

function loadAISettings() {
  try {
    var raw = Store.get(AI_SET_KEY, '');
    if (!raw) return;
    var obj = (typeof raw === 'string') ? JSON.parse(raw) : raw;
    if (obj && typeof obj === 'object') {
      for (var kk in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, kk) && Object.prototype.hasOwnProperty.call(CFG.ai, kk)) {
          try { CFG.ai[kk] = obj[kk]; } catch (e) { }
        }
      }
    }
  } catch (e) { }
}

function openAISettings() {
  if (!document.body) return;
  if (document.getElementById('ghx-ai-settings')) return;
  var host = document.createElement('div');
  host.id = 'ghx-ai-settings';
  host.style.cssText = 'all:initial;position:fixed;left:12px;bottom:12px;z-index:2147483647;';
  var sr = host.attachShadow({ mode: 'open' });
  document.body.appendChild(host);

  sr.innerHTML = '' +
    '<style>' +
    '.panel{position:relative;width:350px;background:#fff;color:#24292f;font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;border:1px solid #d0d7de;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:14px 16px;}' +
    '.panel h4{margin:0 0 6px;font-size:14px;}' +
    '.panel .hint{color:#57606a;font-size:12px;margin-bottom:10px;}' +
    '.field{display:block;margin:8px 0;}' +
    '.field span{display:block;color:#57606a;font-size:12px;margin-bottom:3px;}' +
    'input[type=text],input[type=password],input[type=number]{width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #d0d7de;border-radius:6px;font:inherit;}' +
    'input[type=checkbox]{margin-right:6px;}' +
    '.row{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:12px;color:#57606a;}' +
    '.row input{flex:0 0 auto;width:90px;}' +
    '.btns{display:flex;gap:8px;margin-top:12px;}' +
    'button{padding:6px 12px;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;cursor:pointer;font:inherit;}' +
    'button.primary{background:#1f883d;color:#fff;border-color:#1f883d;}' +
    '#ghx-msg{margin-top:8px;font-size:12px;color:#57606a;min-height:18px;}' +
    '</style>' +
    '<div class="panel">' +
      '<h4>AI 翻译设置（大模型）</h4>' +
      '<div class="hint">仅配置大模型接口，不触发翻译；Key 只保存在本机。</div>' +
      '<label class="field"><input type="checkbox" id="enb" style="width:auto"> 启用 AI 补译（GitHub 词库未命中时）</label>' +
      '<label class="field"><span>接口类型 provider：nvidia / openai / builtin</span><input type="text" id="prov" placeholder="builtin 表示浏览器内置 AI（免 Key）"></label>' +
      '<label class="field"><span>接口地址 baseUrl</span><input type="text" id="url" placeholder="https://.../v1/chat/completions"></label>' +
      '<label class="field"><span>API Key</span><input type="password" id="key" style="width:230px" autocomplete="off"></label>' +
      '<label class="field"><span>模型名称 model</span><input type="text" id="model" placeholder="例如 nvidia/nemotron-3.5-super-vl-120b-a12b"></label>' +
      '<div class="row">批量条数<input type="number" id="batch" min="1" max="100"></div>' +
      '<div class="row">每条最长字符<input type="number" id="maxc" min="10" max="500"></div>' +
      '<div class="row">超时(ms)<input type="number" id="to" min="1000" max="600000"></div>' +
      '<label class="field"><input type="checkbox" id="think" style="width:auto"> 推理模型关闭思考（NVIDIA 有意义）</label>' +
      '<label class="field"><input type="checkbox" id="cache" style="width:auto"> 译文写入缓存（二次访问零请求）</label>' +
      '<div class="btns">' +
        '<button class="primary" id="save">保存</button>' +
        '<button id="test">测试连接</button>' +
        '<button id="close">关闭</button>' +
      '</div>' +
      '<div id="ghx-msg"></div>' +
    '</div>';

  var f = function (id) { return sr.getElementById(id); };

  function fill() {
    var a = CFG.ai;
    f('enb').checked = !!a.enabled;
    f('prov').value = a.provider || '';
    f('url').value = a.baseUrl || '';
    f('key').value = a.apiKey || '';
    f('model').value = a.model || '';
    f('batch').value = a.batchSize || 20;
    f('maxc').value = a.maxChars || 120;
    f('to').value = a.timeout || 60000;
    f('think').checked = !!a.thinkingOff;
    f('cache').checked = !!a.cache;
  }
  fill();

  function msg(t) { f('ghx-msg').textContent = t; }

  function collect() {
    return {
      enabled: f('enb').checked,
      provider: (f('prov').value || 'nvidia').trim(),
      baseUrl: (f('url').value || '').trim(),
      apiKey: f('key').value || '',
      model: (f('model').value || '').trim(),
      batchSize: parseInt(f('batch').value, 10) || 20,
      maxChars: parseInt(f('maxc').value, 10) || 120,
      timeout: parseInt(f('to').value, 10) || 60000,
      thinkingOff: f('think').checked,
      cache: f('cache').checked
    };
  }

  function applySettings() {
    var o = collect();
    for (var k in o) {
      if (Object.prototype.hasOwnProperty.call(o, k) && Object.prototype.hasOwnProperty.call(CFG.ai, k)) {
        CFG.ai[k] = o[k];
      }
    }
    Store.set(AI_SET_KEY, JSON.stringify(o));
  }

  f('save').addEventListener('click', function () {
    applySettings();
    msg('已保存（当前标签页生效；重启浏览器后配置仍在）');
  });

  f('test').addEventListener('click', function () {
    applySettings();
    if (CFG.ai.provider === 'builtin') {
      aiRequest(['Watch'], function (err, arr) {
        if (err) msg('内置 AI 测试失败：' + err);
        else msg('内置 AI 连接成功：Watch → ' + (arr && arr[0] ? arr[0] : '(未返回译文)'));
      });
      return;
    }
    if (!CFG.ai.apiKey) { msg('接口为 API 方式，请先填 API Key'); return; }
    aiRequest(['Watch'], function (err, arr) {
      if (err) msg('测试失败：' + err);
      else msg('连接成功：Watch → ' + (arr && arr[0] ? arr[0] : '(未返回译文)'));
    });
  });

  f('close').addEventListener('click', function () {
    if (host.parentNode) host.parentNode.removeChild(host);
  });
}

/* 设置入口注册 + 浮动按钮（不触发翻译） */
try {
  if (typeof GM_registerMenuCommand === 'function') {
    GM_registerMenuCommand('AI 翻译设置', openAISettings);
  }
} catch (e) { }

function mountSettingsButton() {
  if (document.getElementById('ghx-settings-btn')) return;
  var b = document.createElement('button');
  b.id = 'ghx-settings-btn';
  b.textContent = '⚙ AI 设置';
  b.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:2147483646;padding:6px 10px;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;color:#24292f;font:12px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.16);';
  b.addEventListener('click', openAISettings);
  document.body.appendChild(b);
}
loadAISettings();                     /* 先读回本机保存的配置，再挂载入口，F9 才能拿到用户填的 Key */
if (document.body) mountSettingsButton();
else document.addEventListener('DOMContentLoaded', mountSettingsButton);

var running = false;

async function runAll() {
  running = true;
  toast('开始处理本页…');
  try {
    var root = document.body;
    if (!root) throw new Error('页面尚未就绪');
    var nodes = collectTextNodes(root);   /* 一次遍历，两个模块共用 */

    if (isGitHubPage()) {
      var dictHits = I18n.applyDict(nodes, root);
      var stat = await new Promise(function (resolve) { I18n.aiComplete(nodes, resolve); });
      var needFallback = (CFG.githubFallback === 'always') ||
        (CFG.githubFallback === 'onFailure' && stat.failed > 0);
      var tr = { translated: 0, failed: 0, skipped: true };
      if (needFallback) tr = await Trans.runPage(remainingEnglish(nodes));
      toast('GitHub 汉化：词库 ' + dictHits + ' 处，AI ' + stat.ok + ' 条' +
        (stat.failed ? '（失败 ' + stat.failed + ' 批）' : '') +
        '，引擎兜底 ' + tr.translated + ' 条');
    } else {
      var res = await Trans.runPage(nodes);
      toast('整页翻译：成功 ' + res.translated + ' 条，失败 ' + res.failed + ' 条' +
        (res.skipped ? '（无待译文本）' : ''));
    }
  } catch (e) {
    toast('执行失败：' + (e && e.message ? e.message : e));
  } finally {
    running = false;
  }
}

document.addEventListener('keydown', function (ev) {
  if (String(ev.key || '').toLowerCase() !== 'f9') return;
  if (ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;
  if (focusInEditable()) return;      /* 不劫持输入框里的 F9 */
  ev.preventDefault();
  ev.stopPropagation();
  if (running) return;                /* 防重入：连按不重复执行 */
  runAll();
}, true);

})();
