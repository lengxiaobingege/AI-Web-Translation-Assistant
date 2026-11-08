/* 设置面板离线预览：从 userscript 中抽出面板 HTML，生成可直接打开的预览页
 * 用法：node tools/preview_panel.js            → 生成 tools/preview_panel.html（浅色 + 深色切换）
 *       node tools/preview_panel.js --shot      → 额外用本机 Chrome 截图 light/dark 两张 PNG
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'AI-Web-Translation-Assistant.user.js'), 'utf8');

const s1 = src.indexOf("sr.innerHTML = '' +");
const e1 = src.indexOf("'</div>';", s1) + "'</div>';".length;
if (s1 < 0 || e1 < 0) throw new Error('未找到面板 HTML');
/* 面板里会引用脚本中的常量（如 GH_API_MIRROR），eval 前先喂进去 */
const mir = (src.match(/var GH_API_MIRROR = '([^']+)'/) || [])[1] || 'https://gh-proxy.com/https://api.github.com';
const panelHtml = new Function('GH_API_MIRROR', 'return ' + src.slice(s1 + 'sr.innerHTML = '.length, e1 - 1) + ';')(mir);

const page = (dark) => {
  const body = (dark ? panelHtml.replace('@media (prefers-color-scheme:dark)', '@media all') : panelHtml)
    .replace('</style>', '.mask,.card{animation:none!important}</style>');
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8">
<title>AI 翻译设置 · 面板预览</title>
<style>html,body{margin:0;height:100%;background:${dark ? '#0d1117' : '#f6f8fa'};
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}</style>
</head><body><div id="host"></div><template id="tpl">${body}</template>
<script>
const sr=document.getElementById('host').attachShadow({mode:'open'});
sr.innerHTML=document.getElementById('tpl').innerHTML;
const q=(id)=>sr.getElementById(id);
q('enb').checked=true;q('auto').checked=true;q('think').checked=true;q('cache').checked=true;
q('prov').value='nvidia';
q('url').value='https://integrate.api.nvidia.com/v1/chat/completions';
q('key').value='demo-key-xxxxxxxxxxxxxxxxxxxx';
q('model').value='nvidia/nemotron-3.5-super-vl-120b-a12b';
q('batch').value=20;q('maxc').value=600;q('to').value=60000;
q('ghx-msg').textContent='';q('ghx-msg').className='status';   // 面板刚打开时状态行为空，更贴近真实首屏
q('dictinfo').innerHTML='版本 <b>2026.11.08</b> · 词库 <b>1816</b> 条 · GitHub 原始地址 · 3 分钟前同步';q('openkey').value='Alt+N';
if (q('contribfold')) q('contribfold').open = false;  // 默认收起，与真实首屏一致
q('contrib').checked=true;
q('ctoken').value='demo-token-xxxxxxxxxxxxxxxx';
q('contribinfo').innerHTML='本地已采集 <b>12</b> 条，可推送到仓库或提交 Issue';
q('dictsub').textContent='内置 1656 条 + 远端新增 160 条（远端 1815 条同名覆盖） · AI 记忆 409 条不计入（本机译文缓存）';
</script></body></html>`;
};

const lightPath = path.join(__dirname, 'preview_panel_light.html');
const darkPath = path.join(__dirname, 'preview_panel_dark.html');
fs.writeFileSync(lightPath, page(false), 'utf8');
fs.writeFileSync(darkPath, page(true), 'utf8');
console.log('已生成：tools/preview_panel_light.html, tools/preview_panel_dark.html');

if (process.argv.includes('--shot')) {
  const chrome = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  ].find(p => fs.existsSync(p));
  if (!chrome) { console.log('未找到 Chrome/Edge，跳过截图'); process.exit(0); }
  /* 必须给独立 user-data-dir：否则本机已有 Chrome 在跑时，新进程会把请求转给它并立刻退出，
     --screenshot 静默失效（文件不更新）。用临时目录强制起新实例。 */
  const tmpProfile = path.join(require('os').tmpdir(), 'ghx-shot-' + process.pid);
  [['preview_panel_light', 'panel_light.png'], ['preview_panel_dark', 'panel_dark.png']].forEach(([h, png]) => {
    const out = path.join(__dirname, png);
    try { fs.unlinkSync(out); } catch (e) { }        // 先删旧图，避免把上次的图当成本次结果
    try {
      execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        '--user-data-dir=' + tmpProfile,
        '--window-size=620,1120', `--screenshot=${out}`,
        'file:///' + path.join(__dirname, h + '.html').replace(/\\/g, '/')], { stdio: 'ignore' });
    } catch (e) { /* 落到下面的存在性检查 */ }
    if (fs.existsSync(out)) console.log('已截图：tools/' + png + '（' + fs.statSync(out).size + ' 字节）');
    else console.log('截图未生成：' + png + '（Chrome 被环境策略拦截时会静默失败，HTML 预览仍可用）');
  });
}
