# AI-Web-Translation-Assistant

一个合并版的 Tampermonkey 用户脚本：**非简体中文网页自动翻译，F9 一键手动重译**，同时包含「GitHub 汉化」与「超级翻译助手」两套能力。

当前版本：**1.4.2**

## 功能

- **整页翻译（AI 优先）**：不论什么站点，都先把文本交给配置好的大模型批量翻译；AI 未启用、没填 Key、请求失败，或文本超出 AI 处理范围（单条 >600 字符或 >150 词）的那部分，才回退到 Bing → MyMemory → Google 引擎链。GitHub / gist 额外先跑一遍词库。非简体中文网页会自动触发这一整套流程，按 F9 也能随时重译。
- **GitHub 汉化**：内置 1656 条词库 + 24 条数量/时间模式规则 + CSS 规则，远端词库每天从仓库同步（1815 条，其中 160 条是新增、合计 1816 条），覆盖导航、按钮、属性、相对时间、占位符等，自动排除代码块、文件名、路径。生效范围与不覆盖的部分见 [GitHub 汉化的覆盖范围](#github-汉化的覆盖范围)。
- **翻译引擎链**：Bing 鉴权失败自动刷新重试，上次成功的引擎优先，长文本自动分段。
- **AI 翻译**：默认开启。待译文本按批（默认 20 条/批）交给大模型，译文写入缓存，二次访问同一句直接命中、零请求。提示词带页面标题与站点上下文，按「中文网站原生文案」标准翻译：界面短词保持简短、句子译得通顺、杜绝翻译腔。
- **词库在线更新**：词库正式版托管在 GitHub 仓库，每天北京时间 0 点后首次访问自动同步一次，失败自动依次换用 5 个源（GitHub 原始地址 + 4 个镜像）。详见 [汉化词库](#汉化词库)。
- **译文缓存**：AI 与引擎译文都落在本机存储，避免重复请求。

## 触发方式

**自动（默认开启）**

- 页面就绪后自动检测页面主语言：只要**不是简体中文**就翻译成简体中文。英文、日文、韩文、德文、法文、俄文一视同仁；繁体中文会转成简体。
- 检测顺序：先看 `html[lang]` 声明，再用字符统计兜底 —— 出现假名判为日文，出现韩文判为韩文，汉字占比 ≥ 25% 判为中文，其余视为其它语种；判为中文后再用繁体特征字区分简繁。
- 文字总量不足 250 的页面（代码页、图片页、纯符号页）不自动翻。
- 最多探测 3 轮（间隔 1.2 秒），照顾前端渲染慢的站点；每次页面加载只自动执行 1 次，不会反复翻。
- 设置面板里「非简体中文页面自动翻译」可以关掉，关掉后只剩 F9。

**手动 F9**

- 页面尚未翻译时：按 F9 直接翻译。
- 页面已经翻译过：再按 F9 会**先恢复原文，然后按当前设置重新翻译**（绕过 AI 缓存与译文缓存，改完模型 / Key 后不用刷新页面即可重译）。
- 焦点在输入框或可编辑区时按 F9 不触发，避免打断打字。
- 连按 / 长按 F9 只执行一次，不重复翻译。

## 翻译路径

按 F9 之后的处理顺序：

1. **词库**（仅 GitHub / gist）：内置 1656 条 + 远端新增 160 条（合计 1816 条），命中就直接替换，不花 AI 额度。
2. **AI 大模型**（所有站点，默认路径）：剩下的英文按批送大模型翻译，命中缓存的直接复用。
3. **引擎链**（兜底）：只有 AI 不可用、请求失败、或文本超出 AI 处理范围时才走 Bing → MyMemory → Google。

关闭 AI 或没填 Key 时，第 2 步自动跳过，全部落到第 3 步。

## GitHub 汉化的覆盖范围

结论先说：**覆盖到 GitHub 全站（`github.com` / `gist.github.com` 及其子域）的常规界面文本，但不等于「页面里每一个字都会变中文」**。下面是逐项核对的结果。

### 已覆盖

| 位置 | 实现方式 | 备注 |
| --- | --- | --- |
| 普通文本节点 | `TreeWalker` 遍历 `body`，长度 2–2000 字符，单次上限 2500 个节点 | 先整句精确匹配，再按词拆分 |
| UI 短文本 | 父元素为 `A` / `BUTTON` / `LI` / `NAV` / `HEADER` / `OPTION` / `SELECT`，且不超过 6 个词 | 拆词拼译，提高命中率 |
| 数量 + 单位 | 24 条模式规则，例如 `3 commits` → `3 个提交`、`2 hours ago` → `2 小时前` | 远端词库还可追加规则 |
| 表单按钮 | `input[type=button/submit/reset/image]` 的 `value` | |
| 占位符 | `input` / `textarea` / `select` 的 `placeholder` | |
| 无障碍标签 | `aria-label` | |
| 相对时间 | `<relative-time>`、`<time[datetime]>`、`[data-view-component][datetime]`，用 `Intl.RelativeTimeFormat('zh-CN')` | 含 Shadow DOM 内的相对时间 |
| 指定元素 | `CSS_RULES`（如 PR 页的 `a[aria-label='Pull requests you created']`） | 目前 1 条 |
| 词库未命中的英文短句 | 交给 AI 批量翻译（F9 / 自动翻译时） | 失败再走引擎链 |

### 不覆盖（按设计排除）

| 范围 | 原因 |
| --- | --- |
| `code` / `pre` / `kbd` / `samp` / `var` / `tt` / `data`，以及任何祖先含 `code`/`pre` 的元素 | 代码、命令、diff 内容不能翻，翻了就打不开 |
| `.markdown-body`（README、Issue/PR 正文、评论正文） | 正文是阅读对象，翻译会破坏链接、表格、代码块；只在缺失时由 AI 兜底普通文本，不含正文 |
| `.blob-code` / `.cm-editor` / `.CodeMirror` / `.diff-table` / `.diff-view` / `.react-code-lines` | 代码查看器与 diff |
| `.js-navigation-container` / `.react-tree-show-tree-items` / `.js-path-segment` / `.final-path` | 文件树与路径，翻了会指错文件 |
| `.table-list` / `.pagination` / `.diffstat` / `.topic-tag` / `.Label` / `.float-right` | 数值与状态标签，误译代价高（`Label` 本身还是组件类名） |
| `itemprop="name"` 的元素 | 仓库名、Issue/PR 标题等标识性文本，保持原样便于搜索和复制 |
| `svg` / `math` / `iframe` / `object` / `template` / `noscript` / `script` / `style` | 非可视文本或跨文档 |
| Shadow DOM 内部（相对时间除外） | `TreeWalker` 不进入 shadow root |
| 跨域 iframe 内的文档 | 浏览器同源策略 |
| `title` 属性（悬停提示）、`img` 的 `alt` | 目前只处理 `aria-label` 与 `placeholder` |
| CSS 伪元素 `content`、`canvas`、图片里的文字 | 不是 DOM 文本节点，脚本无法改写 |
| 浏览器标签页标题 `<title>` | 未处理，避免影响收藏与历史记录 |

### 结构性限制

1. **只处理 F9 那一刻的 DOM**：脚本没有 MutationObserver，SPA 之后渲染出来的新内容不会自动变中文；再按一次 F9 会恢复原文后整页重译。
2. **长文本会被跳过**：单个文本节点超过 2000 字符不处理；AI 单条超过 600 字符或 150 词也不处理，交给引擎链。
3. **单次节点上限 2500**：Issue 列表、大 diff 这类超长页面，尾部内容可能这一轮没翻到，再按 F9 可继续。
4. **词库是精确匹配**：按「小写 + 空白归一」的原文匹配，带变量插值的句子只能靠模式规则或 AI，不会因为词库里没有就瞎猜。

## 汉化词库

### 存放位置

词库的正式版本放在本仓库：

```text
dict/github.zh-CN.json
```

脚本内置的 1656 条只是**离线兜底**；只要网络正常，启动后会套用仓库里更新过的版本（与内置同名的是覆盖，不重复计数）。

<!-- dict-stat:start -->

| 词库版本 | 远端词条 | 内置词条 | 实际可用合计 | 模式规则 |
| --- | --- | --- | --- | --- |
| `2026.11.08-b7` | 2315 条 | 1656 条 | 2318 条 | 24 条 |

<sub>由 GitHub Actions 自动更新于 2026-11-08 03:46 UTC</sub>

<!-- dict-stat:end -->

### 自动维护

词库的校验、统计与补充由 GitHub Actions 承担，无需本地环境：

| 工作流 | 触发 | 做什么 |
| --- | --- | --- |
| `dict-lint.yml` | 改动 `dict/`、`tools/` 或 PR | 校验键格式、重复键、空译文、`count` 一致性、术语统一、`patterns` 可编译性；不通过则红叉 |
| `dict-report.yml` | 每天 08:40、`dict/` 变更 | 生成统计写入 Job Summary，并把上表数字同步回本文件 |
| `dict-ai-fill.yml` | 每天 09:10、手动 | 从 `tools/candidates.txt` 取词库缺失条目，交大模型翻译后直接提交到 `main`；未配置 `AI_API_KEY` 时自动跳过 |

启用 AI 续写需要两步：

1. 在仓库 **Settings → Secrets and variables → Actions** 新建 Secret `AI_API_KEY`（填模型的 Key）。
2. 可选：新建 Variable `AI_BASE_URL`（OpenAI 兼容的 `/chat/completions` 地址）和 `AI_MODEL`（模型名）。不填则走 `https://api.openai.com/v1/chat/completions` 与 `gpt-4o-mini`。

本地也能跑同一套脚本：

```bash
node tools/dict_lint.js          # 检查
node tools/dict_lint.js --fix    # 自动修键格式
node tools/dict_report.js        # 统计
AI_API_KEY=xxx node tools/dict_ai_fill.mjs   # 续写（DRY_RUN=1 可先预演）
```

### 面板里的数字怎么算

设置面板「汉化词库」会同时出现几个数字，它们不是同一个口径，容易看着像「多出来一截」：

| 显示 | 含义 |
| --- | --- |
| 内置 1656 条 | 脚本自带的离线兜底词条。`__comments-*`、`__dict-end` 之类的注释占位键不计数 |
| 远端新增 160 条 | 仓库词库 1815 条里与内置**不重名**的部分；重名的 1655 条是覆盖内置，不累加 |
| 词库 1816 条 | 1656 + 160，实际参与匹配的总条数 |
| AI 记忆 N 条 | AI 翻过的句子会被记住以便复用（存本机），属于译文缓存，**不是词库**，不计入上面任何数字 |

AI 记忆随使用不断增长（按 F9 重译也会更新它），但它始终不进词库本体；清掉本机缓存后归零，不影响词库条数。统计口径可跑 `node tools/dict_stat.js` 核对。

### 文件结构

```json
{
  "schema": 1,
  "version": "2026.11.08",
  "count": 1815,
  "dict": { "watch": "关注", "fork": "复刻" },
  "patterns": [{ "re": "^([\\d,.]+)\\s+commits?$", "to": "$1 个提交" }],
  "cssRules": [{ "key": "!html", "selector": "a[aria-label='...']", "replacement": "拉取请求" }]
}
```

- `dict`：键为「小写 + 空格归一」的英文原文，值为简体中文。
- `patterns`：正则规则，处理词库难穷举的「数量 + 单位」和相对时间。
- `cssRules`：需要按元素选择器改属性或整段文本的特殊情况。

### 每天自动同步

- **时机**：每天**北京时间 0 点之后**首次打开任意页面时同步一次，24 小时内最多一次。
- **为什么不是 0:00 准点**：浏览器会给后台标签页的定时器降频甚至冻结，脚本里挂一个「等到 0 点」的定时器并不可靠，而且页面没打开时脚本根本不在运行。所以采用「跨日首次访问即拉取」的等价实现。
- **换源顺序**（任一成功即停止）：

  | 顺序 | 源 |
  | --- | --- |
  | 1 | `raw.githubusercontent.com`（GitHub 原始地址） |
  | 2 | `testingcf.jsdelivr.net` |
  | 3 | `cdn.jsdelivr.net` |
  | 4 | `jsd.onmicrosoft.cn` |
  | 5 | `ghfast.top`（raw 反代） |

  单个源超时 8 秒，全部失败约 40 秒，全程在后台跑，不阻塞首屏，也不打断正在进行的翻译。
- **校验**：响应必须是以 `{` 开头的合法 JSON，且 `dict` 条目数 ≥ 100 —— 这一步专门挡掉反代返回的 HTML 错误页。
- **失败处理**：全部源都失败时保留上一次的词库继续用，不会清空、不会报错弹窗，下一天再试。
- **缓存**：合格的响应写入本机存储（`ghx2_dict_remote` / `ghx2_dict_meta`），断网时照样用上次同步的内容。

### 手动更新

两个入口，效果相同（强制忽略「今天已同步」）：

- 篡改猴菜单 → **立即更新词库**
- 设置面板 → 汉化词库 → **立即更新**（面板里同时显示当前版本、条目数、来源、上次同步时间）

### 合并规则

1. 远端条目**覆盖**同名内置条目 —— 修错译、统一术语靠这条路。
2. 远端条目同时写入词库基线，所以 F9「再次翻译」清理 AI 译文时不会误删它们。
3. `patterns` 与 `cssRules` 去重后追加，重复同步不会越叠越多。
4. 空译文会被丢弃（旧版词库里有 2 条空值，会把对应英文整段抹成空白）。

### 增强方案

**本次已做**

| 项 | 说明 |
| --- | --- |
| 扩充词条 | 1654 → 1815 条，新增 161 条：Copilot / Models / Projects / Discussions / Packages / Security / Actions / 仓库设置 / 成员权限等新版界面用词 |
| 模式规则 | 24 条，覆盖提交数、分支数、文件变更、增删行数、各类「X ago」、`X commits ahead of Y` |
| 术语纠错 | 14 条显式覆盖，例如 `unresolve conversation`「未解决对话」→「取消解决对话」（语义反了）、`compare & pull request`「对比 & 拉取请求」→「比较并创建拉取请求」 |
| 清理脏数据 | 剔除 33 条 `__comments*` 注释键、2 条空译文 |
| 冲突保守处理 | 67 条与建议译法不一致的条目**保留旧值**，因为多数旧值更贴近 GitHub 官方中文（Star→星标、Request changes→请求更改），只改确有问题的 |

**后续可继续做**

1. **术语表锁定**：把 star/fork/issue/pull request/merge/release 等核心词固定成一张 glossary，新词条必须与其一致，避免同一个词在不同页面出现两种译法。
2. **按模块分类维护**：词库按「仓库页 / PR / Issue / Actions / 设置 / 安全」注释分组提交，review 时更容易判断上下文。
3. **优先用模式而非整句**：`Added 3 commits`、`Pushed 2 commits to main`、`3 files changed` 这类带变量的句子用规则覆盖，比穷举整句更省条目。
4. **词形归一**：用轻量词尾规则处理 `-s / -es / -ed`，减少复数与过去式重复登记。
5. **未命中采集（可选、默认关闭）**：本地记录没翻到的文本，由用户手动导出后补齐词库。涉及浏览内容，必须显式开启，默认不采集。
6. **版本回滚**：`version` 已带日期，需要时可在仓库侧保留旧版文件回滚。

## AI 大模型设置

打开设置入口：点浏览器工具栏的**篡改猴图标 → 本脚本 → 「AI 翻译设置」**。

设置只放在这一处，脚本不会往网页里注入任何按钮或悬浮元素——脚本覆盖所有站点，常驻按钮会在每个网站挡住页面左下角的内容。

面板是一个居中的设置卡片，按分区排布：运行方式（开关）、接口、参数、汉化词库。关闭方式有三种：右上角 ×、按 `Esc`、点击卡片外的遮罩。API Key 默认打码，点右侧「显示」可临时查看。

面板里可填：

| 字段 | 说明 |
| --- | --- |
| 启用 AI 翻译 | 默认开启。关闭后完全不请求大模型，全部走引擎链 |
| 非简体中文页面自动翻译 | 默认开启。自动检测语种，非简体中文即翻译；关闭后只由 F9 触发 |
| 接口类型 provider | `nvidia` / `openai` / `builtin`（浏览器内置 AI，免 Key） |
| 接口地址 baseUrl | OpenAI 兼容的 `/chat/completions` 地址 |
| API Key | 大模型 Key，仅保存在本机 |
| 模型名称 model | 例如 `nvidia/nemotron-3.5-super-vl-120b-a12b` |
| 批量条数 | 每次请求翻译多少条 |
| 每条最长字符 | 默认 600；超过的不交给 AI，走引擎链 |
| 超时 | 请求超时毫秒 |
| 推理模型关闭思考 | NVIDIA Nemotron 系列需要 |
| 译文写入缓存 | 关闭则不缓存 |

「汉化词库」分区显示当前词库版本、条目数、来源和上次同步时间，右侧「立即更新」可手动拉取（见 [汉化词库](#汉化词库)）。

填完点 **保存**；点 **测试连接** 会用当前值发一次真实请求验证可用性。配置存本机篡改猴存储，重启浏览器后仍在。

> 公开版本内置的 NVIDIA API Key 已置空，使用前请在设置里填入你自己的 Key；或 provider 选 `builtin` 用浏览器内置 AI（免 Key）。

## 安装

1. 浏览器装好 Tampermonkey（篡改猴）。
2. 把 `AI-Web-Translation-Assistant.user.js` 拖入浏览器安装；或在篡改猴「新建脚本」里粘贴代码；或直接打开下面的 raw 地址，篡改猴会自动弹出安装页。
3. 打开任意网页，按 F9 翻译；GitHub 页面先在设置里填好 AI Key。

安装地址（raw）：

```text
https://raw.githubusercontent.com/lengxiaobingege/AI-Web-Translation-Assistant./main/AI-Web-Translation-Assistant.user.js
```

## 更新

脚本头部已内置 `@updateURL` / `@downloadURL`，篡改猴会按该地址检查新版本，正常情况无需手动操作。

手动安装的脚本若不自动更新，在篡改猴里打开本脚本 →「设置」标签页，把上一步的 raw 地址分别填进 **更新地址（Update URL）** 和 **下载地址（Download URL）**，保存后点「检查更新」。

想立刻升到最新版，也可以直接重新打开该 raw 地址安装一次，脚本列表里的版本号会随之变化。

国内直连 `raw.githubusercontent.com` 不稳定时，可改用 jsDelivr 镜像（内容相同，更新有几小时缓存延迟）：

```text
https://cdn.jsdelivr.net/gh/lengxiaobingege/AI-Web-Translation-Assistant.@main/AI-Web-Translation-Assistant.user.js
```

## 来源

本脚本基于以下两个独立项目合并改编：

- [k1995/github-i18n-plugin](https://github.com/k1995/github-i18n-plugin) —— GitHub 汉化部分
- [syhyz1990/translate](https://github.com/syhyz1990/translate) —— 超级翻译助手部分

二者彼此独立，无官方关联。

## 作者

- **lengxiaobingege** —— <https://github.com/lengxiaobingege>
- **WorkBuddy** —— AI 编程助手，参与合并、重构与文档编写

脚本头部 `@author` 字段为 `lengxiaobingege & WorkBuddy`。

## 二创说明

本脚本为二次创作，由上述作者共同编写。来源项目的代码、词库及相关权益归各自原作者所有；本脚本仅包含合并与二创新增内容，不替代原作署名。

## 图标

脚本图标为本项目自制的原创图形：几何字母 A 配三条文字线，蓝紫对角渐变底，256×256 PNG，以 data URI 内嵌在 `@icon` 中，不依赖任何网络请求。

四个圆角采用连续曲率（超椭圆）而非正圆弧，与主流应用图标的观感一致；圆角处为透明通道，不铺底色，因此在浅色和深色主题下都不会出现白边或黑角。

图形全部由基本几何形状绘制，不含第三方商标、标识、官方 Logo，也不使用任何商业字体渲染，因此不涉及他人图形或字体的授权问题。该图标随本项目以 MIT 许可发布，可自由替换为自己的图标（改脚本头部 `@icon` 行即可）。

## 后续推送

本仓库就是该脚本的发布地址，脚本文件从这里下载；后续改动也会推送到这里：

<https://github.com/lengxiaobingege/AI-Web-Translation-Assistant.>

## License

MIT
