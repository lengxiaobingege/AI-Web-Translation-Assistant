/* 生成远端词库 dict/github.zh-CN.json
 * 来源：脚本内置 DICT（基线）+ 本文件的 EXTRA 增强集 + PATTERNS 数量/时间规则
 * 用法：node tools/build_dict.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'AI-Web-Translation-Assistant.user.js');

/* ---------- 1. 从脚本里提取内置词库与本内置 CSS 规则 ---------- */
function loadBuiltin() {
  const src = fs.readFileSync(SRC, 'utf8');
  const ds = src.indexOf('var DICT = {');
  const de = src.indexOf('\n};', ds);
  const dict = eval('(' + src.slice(ds + 'var DICT = '.length, de + 2) + ')');
  const cs = src.indexOf('var CSS_RULES = [');
  const ce = src.indexOf('\n];', cs);
  const cssRules = eval('(' + src.slice(cs + 'var CSS_RULES = '.length, ce + 2) + ')');
  return { dict, cssRules };
}

/* ---------- 2. 增强词条（按主题分组，键统一小写、空格归一） ---------- */
const EXTRA = {
  /* --- 通用动作与按钮 --- */
  'save changes': '保存更改',
  'discard changes': '放弃更改',
  'commit changes': '提交更改',
  'update branch': '更新分支',
  'sync fork': '同步复刻',
  'compare & pull request': '比较并创建拉取请求',
  'compare and pull request': '比较并创建拉取请求',
  'create pull request': '创建拉取请求',
  'open pull request': '打开拉取请求',
  'close pull request': '关闭拉取请求',
  'reopen pull request': '重新打开拉取请求',
  'merge pull request': '合并拉取请求',
  'confirm merge': '确认合并',
  'squash and merge': '压缩合并',
  'rebase and merge': '变基合并',
  'create merge commit': '创建合并提交',
  'delete branch': '删除分支',
  'restore branch': '恢复分支',
  'add a comment': '添加评论',
  'write a comment': '写下评论',
  'submit review': '提交评审',
  'approve': '批准',
  'request changes': '请求修改',
  'dismiss review': '驳回评审',
  'resolve conversation': '解决对话',
  'unresolve conversation': '取消解决对话',
  'hide comment': '隐藏评论',
  'edit comment': '编辑评论',
  'delete comment': '删除评论',
  'copy link': '复制链接',
  'copy permalink': '复制永久链接',
  'copy path': '复制路径',
  'copy file path': '复制文件路径',
  'view file': '查看文件',
  'view raw': '查看原始文件',
  'download raw file': '下载原始文件',
  'edit file': '编辑文件',
  'delete file': '删除文件',
  'rename': '重命名',
  'move': '移动',
  'duplicate': '创建副本',
  'archive': '归档',
  'unarchive': '取消归档',
  'transfer': '转移',
  'pin': '置顶',
  'unpin': '取消置顶',
  'subscribe': '订阅',
  'unsubscribe': '取消订阅',
  'follow': '关注',
  'unfollow': '取消关注',
  'block': '屏蔽',
  'unblock': '取消屏蔽',
  'report abuse': '举报滥用',
  'save': '保存',
  'cancel': '取消',
  'confirm': '确认',
  'apply': '应用',
  'reset': '重置',
  'clear': '清除',
  'refresh': '刷新',
  'reload': '重新加载',
  'retry': '重试',
  'continue': '继续',
  'back': '返回',
  'next': '下一页',
  'previous': '上一页',
  'finish': '完成',
  'skip': '跳过',
  'learn more': '了解更多',
  'show more': '显示更多',
  'show less': '收起',
  'see more': '查看更多',
  'see less': '收起',
  'expand all': '全部展开',
  'collapse all': '全部折叠',
  'select all': '全选',
  'deselect all': '取消全选',
  'mark all as read': '全部标为已读',
  'mark as read': '标为已读',
  'mark as unread': '标为未读',

  /* --- 顶部导航与模块 --- */
  'issues': '议题',
  'pull requests': '拉取请求',
  'discussions': '讨论',
  'packages': '软件包',
  'codespaces': '代码空间',
  'sponsors': '赞助',
  'marketplace': '市场',
  'explore': '探索',
  'notifications': '通知',
  'dashboard': '仪表盘',
  'your profile': '你的个人资料',
  'your repositories': '你的仓库',
  'your organizations': '你的组织',
  'your projects': '你的项目',
  'your stars': '你的标星',
  'your gists': '你的代码片段',
  'your enterprises': '你的企业',
  'new repository': '新建仓库',
  'import repository': '导入仓库',
  'new organization': '新建组织',
  'new project': '新建项目',
  'new gist': '新建代码片段',
  'new issue': '新建议题',
  'new discussion': '新建讨论',
  'new codespace': '新建代码空间',
  'search or jump to…': '搜索或跳转…',
  'type / to search': '输入 / 搜索',
  'search syntax tips': '搜索语法提示',
  'provide feedback': '提供反馈',
  'keyboard shortcuts': '键盘快捷键',
  'command palette': '命令面板',
  'sign out': '退出登录',
  'switch account': '切换账号',
  'add account': '添加账号',
  'manage accounts': '管理账号',
  'appearance settings': '外观设置',

  /* --- 仓库页 --- */
  'about': '关于',
  'readme': '自述文件',
  'license': '许可证',
  'activity': '动态',
  'releases': '发行版',
  'tags': '标签',
  'branches': '分支',
  'contributors': '贡献者',
  'languages': '语言',
  'stars': '标星',
  'watchers': '关注者',
  'forks': '复刻',
  'files': '文件',
  'commits': '提交',
  'latest': '最新',
  'pre-release': '预发行版',
  'draft': '草稿',
  'assets': '资源',
  'source code (zip)': '源代码（zip）',
  'source code (tar.gz)': '源代码（tar.gz）',
  'clone': '克隆',
  'download zip': '下载 ZIP',
  'open with github desktop': '用 GitHub Desktop 打开',
  'use ssh': '使用 SSH',
  'use https': '使用 HTTPS',
  'local': '本地',
  'remote': '远程',
  'add file': '添加文件',
  'create new file': '新建文件',
  'upload files': '上传文件',
  'find file': '查找文件',
  'go to file': '转到文件',
  'edit repository metadata': '编辑仓库信息',
  'repository details': '仓库详情',
  'topics': '主题',
  'website': '网站',
  'description': '描述',
  'default branch': '默认分支',
  'protected': '受保护',
  'archived': '已归档',
  'template': '模板',
  'public': '公开',
  'private': '私有',
  'internal': '内部',
  'forked from': '复刻自',
  'repository': '仓库',
  'repository name': '仓库名称',
  'owner': '所有者',
  'organization name': '组织名称',

  /* --- 拉取请求 / 议题 --- */
  'conversation': '对话',
  'checks': '检查',
  'files changed': '文件变更',
  'reviewers': '评审人',
  'assignees': '受理人',
  'labels': '标签',
  'milestone': '里程碑',
  'linked issues': '关联议题',
  'participants': '参与者',
  'subscribe to this conversation': '订阅此对话',
  'transfer issue': '转移议题',
  'close as duplicate': '以重复关闭',
  'close as not planned': '以未计划关闭',
  'close with comment': '附评论关闭',
  'comment': '评论',
  'review changes': '审查变更',
  'view changes': '查看变更',
  'hide whitespace': '隐藏空白变更',
  'split': '拆分',
  'unified': '统一',
  'side-by-side': '并排',
  'expand up': '向上展开',
  'expand down': '向下展开',
  'suggested change': '建议的更改',
  'apply suggestion': '应用建议',
  'commit suggestion': '提交建议',
  'add single comment': '添加单条评论',
  'start a review': '开始评审',
  'pending review': '待处理评审',
  'changes requested': '请求修改',
  'approved': '已批准',
  'commented': '已评论',
  'draft pull request': '草稿拉取请求',
  'ready for review': '可供评审',

  /* --- Actions / 工作流 --- */
  'workflows': '工作流',
  'workflow runs': '工作流运行',
  'runs': '运行',
  'jobs': '作业',
  'steps': '步骤',
  'logs': '日志',
  'artifacts': '构建产物',
  'cache': '缓存',
  'runners': '运行器',
  'runner groups': '运行器组',
  'secrets': '机密',
  'variables': '变量',
  'environments': '环境',
  'deployments': '部署',
  'deployment history': '部署历史',
  're-run jobs': '重新运行作业',
  're-run failed jobs': '重新运行失败的作业',
  'cancel workflow': '取消工作流',
  'enable workflow': '启用工作流',
  'disable workflow': '禁用工作流',
  'queued': '排队中',
  'in progress': '进行中',
  'completed': '已完成',
  'success': '成功',
  'failure': '失败',
  'cancelled': '已取消',
  'skipped': '已跳过',
  'timed out': '已超时',
  'neutral': '中立',
  'action required': '需要操作',
  'stale': '已过期',

  /* --- 仓库设置 --- */
  'general': '常规',
  'access': '访问',
  'collaborators': '协作者',
  'branches and tags': '分支与标签',
  'rules': '规则',
  'rulesets': '规则集',
  'webhooks': 'Webhook',
  'integrations': '集成',
  'github apps': 'GitHub 应用',
  'deploy keys': '部署密钥',
  'pages': '页面',
  'danger zone': '危险区域',
  'rename this repository': '重命名此仓库',
  'change repository visibility': '更改仓库可见性',
  'transfer ownership': '转移所有权',
  'archive this repository': '归档此仓库',
  'delete this repository': '删除此仓库',

  /* --- 账号与安全 --- */
  'two-factor authentication': '双重身份验证',
  'personal access tokens': '个人访问令牌',
  'ssh and gpg keys': 'SSH 与 GPG 密钥',
  'emails': '邮箱',
  'account': '账号',
  'security log': '安全日志',
  'billing and plans': '账单与套餐',
  'notification settings': '通知设置',
  'custom routing': '自定义路由',
  'security advisories': '安全公告',
  'dependabot alerts': 'Dependabot 警报',
  'code scanning': '代码扫描',
  'secret scanning': '机密扫描',
  'vulnerability alerts': '漏洞警报',
  'dependency graph': '依赖关系图',
  'dependencies': '依赖项',
  'security policy': '安全策略',
  'report a vulnerability': '报告漏洞',
  'advisory': '安全公告',
  'critical': '严重',
  'high': '高',
  'moderate': '中',
  'low': '低',
  'severity': '严重程度',
  'affected versions': '受影响的版本',
  'patched versions': '已修复版本',

  /* --- Copilot / Models --- */
  'github copilot': 'GitHub Copilot',
  'copilot chat': 'Copilot 对话',
  'ask copilot': '询问 Copilot',
  'copilot settings': 'Copilot 设置',
  'copilot policies': 'Copilot 策略',
  'models': '模型',
  'model catalog': '模型目录',
  'playground': '演练场',
  'prompt': '提示词',
  'context': '上下文',

  /* --- 状态与提示 --- */
  'loading': '加载中',
  'no results': '没有结果',
  'no results found': '未找到结果',
  'nothing to see here': '这里什么也没有',
  'no description': '无描述',
  'no description, website, or topics provided.': '未提供描述、网站或主题。',
  'there was an error': '出错了',
  'something went wrong': '出错了',
  'try again': '重试',
  'permission denied': '权限被拒绝',
  'not found': '未找到',
  'access denied': '访问被拒绝',
  'request failed': '请求失败',
  'unknown error': '未知错误',
  'session expired': '会话已过期',
  'you must be signed in': '你需要登录',
  'sign in to continue': '登录以继续',
  'this repository has been archived': '此仓库已归档',
  'this repository is empty': '此仓库为空',
  'this branch is up to date': '此分支已是最新',
  'up to date': '最新',
  'ahead': '领先',
  'behind': '落后',
  'diverged': '已分叉',
  'just now': '刚刚',
  'yesterday': '昨天',
  'today': '今天',
  'last week': '上周',
  'last month': '上个月',
  'last year': '去年',
  'a minute ago': '1 分钟前',
  'an hour ago': '1 小时前',
  'a day ago': '1 天前',

  /* --- 成员与权限 --- */
  'team': '团队',
  'member': '成员',
  'members': '成员',
  'role': '角色',
  'pending invitation': '待处理的邀请',
  'invite': '邀请',
  'invitation': '邀请',
  'manage access': '管理访问权限',
  'request access': '请求访问',
  'grant access': '授予访问权限',
  'permission': '权限',
  'read': '读取',
  'write': '写入',
  'admin': '管理员',
  'maintain': '维护',
  'triage': '分诊',
};

/* ---------- 3. 显式覆盖：只改确实有问题的旧译文（其余冲突一律保留旧值） ---------- */
const OVERRIDES = {
  /* 语义错 / 与原文不符 */
  'unresolve conversation': '取消解决对话',      /* 旧值「未解决对话」语义相反 */
  'compare & pull request': '比较并创建拉取请求',  /* 旧值「对比 & 拉取请求」是机翻，不是界面动作 */
  'close with comment': '附评论关闭',            /* 旧值「评论并关闭议题」在 PR 上不成立 */
  'add single comment': '添加单条评论',          /* 与 comment「评论」区分开 */
  /* 与 GitHub 官方中文对齐 */
  'packages': '软件包',
  'marketplace': '应用市场',
  'draft': '草稿',
  'archived': '已归档',
  'topics': '主题',
  'go to file': '转到文件',
  'sign out': '退出登录',
  'split': '拆分',
  'unified': '统一',
  'your stars': '你的星标',
};

/* ---------- 4. 数量/时间等模式规则（精确词条没命中时套用） ---------- */
const PATTERNS = [
  { re: '^([\\d,.]+)\\s+commits?$', to: '$1 个提交' },
  { re: '^([\\d,.]+)\\s+branches?$', to: '$1 个分支' },
  { re: '^([\\d,.]+)\\s+tags?$', to: '$1 个标签' },
  { re: '^([\\d,.]+)\\s+files?$', to: '$1 个文件' },
  { re: '^([\\d,.]+)\\s+files? changed$', to: '$1 个文件已变更' },
  { re: '^([\\d,.]+)\\s+contributors?$', to: '$1 位贡献者' },
  { re: '^([\\d,.]+)\\s+stars?$', to: '$1 个标星' },
  { re: '^([\\d,.]+)\\s+forks?$', to: '$1 个复刻' },
  { re: '^([\\d,.]+)\\s+issues?$', to: '$1 个议题' },
  { re: '^([\\d,.]+)\\s+pull requests?$', to: '$1 个拉取请求' },
  { re: '^([\\d,.]+)\\s+discussions?$', to: '$1 个讨论' },
  { re: '^([\\d,.]+)\\s+projects?$', to: '$1 个项目' },
  { re: '^([\\d,.]+)\\s+additions?$', to: '$1 行新增' },
  { re: '^([\\d,.]+)\\s+deletions?$', to: '$1 行删除' },
  { re: '^([\\d,.]+)\\s+seconds? ago$', to: '$1 秒前' },
  { re: '^([\\d,.]+)\\s+minutes? ago$', to: '$1 分钟前' },
  { re: '^([\\d,.]+)\\s+hours? ago$', to: '$1 小时前' },
  { re: '^([\\d,.]+)\\s+days? ago$', to: '$1 天前' },
  { re: '^([\\d,.]+)\\s+weeks? ago$', to: '$1 周前' },
  { re: '^([\\d,.]+)\\s+months? ago$', to: '$1 个月前' },
  { re: '^([\\d,.]+)\\s+years? ago$', to: '$1 年前' },
  { re: '^([\\d,.]+)\\s+commits? ahead of (.+)$', to: '$1 个提交领先于 $2' },
  { re: '^([\\d,.]+)\\s+commits? behind (.+)$', to: '落后 $2 $1 个提交' },
  { re: '^updated (.+) ago$', to: '$1前更新' },
];

/* ---------- 5. 合并、过滤、统计 ---------- */
const builtin = loadBuiltin();
const base = builtin.dict;

const cleanBase = {};
const droppedComment = [];
const droppedEmpty = [];
for (const [k, v] of Object.entries(base)) {
  if (k.startsWith('__')) { droppedComment.push(k); continue; }
  if (!v) { droppedEmpty.push(k); continue; }          /* 空译文会把英文整段抹掉 */
  cleanBase[k] = v;
}

const added = {};
const conflicts = [];
for (const [k, v] of Object.entries(EXTRA)) {
  if (Object.prototype.hasOwnProperty.call(cleanBase, k)) {
    if (cleanBase[k] !== v) conflicts.push([k, cleanBase[k], v]);
    continue;
  }
  added[k] = v;
}

const dict = Object.assign({}, cleanBase, added);
const overrideLog = [];
for (const [k, v] of Object.entries(OVERRIDES)) {
  const old = dict[k];
  dict[k] = v;
  overrideLog.push([k, old, v]);
}

const today = new Date();
const stamp = today.getFullYear() + '.' +
  String(today.getMonth() + 1).padStart(2, '0') + '.' +
  String(today.getDate()).padStart(2, '0');

const out = {
  schema: 1,
  name: 'github-i18n-zh-CN',
  target: 'zh-CN',
  version: stamp,
  updatedAt: new Date().toISOString(),
  note: 'GitHub 界面词条库。键为小写、空格归一的英文原文；值为简体中文。由 tools/build_dict.js 生成，可直接手工编辑后提交。',
  count: Object.keys(dict).length,
  patterns: PATTERNS,
  cssRules: builtin.cssRules,
  dict,
};

const dest = path.join(ROOT, 'dict', 'github.zh-CN.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 1) + '\n', 'utf8');

console.log('基线条目      :', Object.keys(cleanBase).length);
console.log('丢弃注释键    :', droppedComment.length);
console.log('丢弃空译文    :', droppedEmpty.length, droppedEmpty.map(s => s.slice(0, 40)));
console.log('新增条目      :', Object.keys(added).length);
console.log('冲突(保留旧值):', conflicts.length);
console.log('显式覆盖旧译  :', overrideLog.length);
overrideLog.forEach(([k, a, b]) => console.log('  *', JSON.stringify(k), ':', a, '->', b));
console.log('模式规则      :', PATTERNS.length);
console.log('最终条目      :', out.count);
console.log('输出          :', dest, (fs.statSync(dest).size / 1024).toFixed(1) + ' KB');
