# dict/contribs —— 用户回传的词库增量

这个目录存放用户脚本「词库回传」功能上传的采集结果，格式为：

```json
{
  "schema": 1,
  "from": "userscript",
  "count": 12,
  "hits": { "zebra crossing ahead": "斑马线在前方" }
}
```

文件名 `contrib-YYYYMMDD-HHMMSS.json`，由脚本用 GitHub Contents API 直接提交到 `main`。

## 这些文件不是正式词库

正式词库是 `dict/github.zh-CN.json`。这里的文件**不会被脚本下载**，只作为待审核的候选条目。

## 合并方式

维护者在仓库根目录执行：

```bash
node tools/merge_contrib.js --dry     # 先看统计：新增 / 跳过 / 无效各多少
node tools/merge_contrib.js           # 只加不改：正式词库已有的键一律保留
node tools/merge_contrib.js --force   # 需要改错译时，用贡献值覆盖同名条目
```

合并后提交 `dict/github.zh-CN.json`，用户脚本会在每天北京时间 0 点后首次访问时同步到新词库。

合并完的贡献文件可以删除，保持目录清爽。

## 审核要点

1. **术语一致性**：例如 pull request 统一「拉取请求」、fork 统一「复刻」，与正式词库冲突时保留正式写法。
2. **键是精确匹配**：按「小写 + 空白归一」比对，带变量插值的句子不要收，交给 `patterns` 或 AI。
3. **译文不要带英文**：`3 commits` 这类交给模式规则；纯数字、版本号、代码标识符不要收。
4. **空译文直接丢弃**，否则会把对应英文整段抹成空白。
