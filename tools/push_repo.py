#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把本地文件推送到 GitHub 仓库（GitHub REST contents API）。

Token 来源（按顺序）：
  1. 项目根目录的 .gh_token 文件（推荐，token 不经过对话/命令行）
  2. 环境变量 GITHUB_TOKEN

用法：
  python tools/push_repo.py "feat: 更新脚本至 1.2.0" AI-Web-Translation-Assistant.user.js icon.png
"""
import base64
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

OWNER = "lengxiaobingege"
REPO = "AI-Web-Translation-Assistant"
BRANCH = "main"
API = "https://api.github.com"
ROOT = pathlib.Path(__file__).resolve().parent.parent

# 公开仓库禁止出现的敏感串：现由 scan_public_safety() 按「前缀 + 密钥长度」正则判定


def load_token():
    p = ROOT / ".gh_token"
    if p.exists():
        t = p.read_text(encoding="utf-8").strip()
        if t:
            return t
    t = os.environ.get("GITHUB_TOKEN", "").strip()
    return t


def call(method, path, payload=None):
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(API + path, data=body, method=method)
    req.add_header("Authorization", "Bearer " + TOKEN)
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("X-GitHub-Api-Version", "2022-11-28")
    if body:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read().decode("utf-8") or "{}"
            return r.status, json.loads(raw)
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8") or "{}"
        try:
            return e.code, json.loads(raw)
        except json.JSONDecodeError:
            return e.code, {"message": raw[:300]}


def scan_public_safety(path: pathlib.Path):
    if path.suffix.lower() in (".png", ".jpg", ".jpeg", ".ico", ".webp"):
        return
    if path.name == "push_repo.py":
        return  # 本脚本内的规则字符串本身不是密钥
    text = path.read_text(encoding="utf-8", errors="ignore")
    # 只认「真实密钥形态」：前缀后面跟着一长串密钥字符。
    # 早期用裸子串匹配，会误伤脱敏代码本身（如 re.sub 里的 sk-[A-Za-z...] 与输出占位 sk-***），
    # 把防护代码当成泄露拦下来，所以改成按长度校验。
    risky = [
        (r"nvapi-[A-Za-z0-9_\-]{16,}", "nvapi-"),
        (r"ghp_[A-Za-z0-9]{20,}", "ghp_"),
        (r"gho_[A-Za-z0-9]{20,}", "gho_"),
        (r"github_pat_[A-Za-z0-9_]{20,}", "github_pat_"),
        (r"sk-[A-Za-z0-9_\-]{24,}", "sk-"),
    ]
    hits = [name for pat, name in risky if re.search(pat, text)]
    if hits:
        raise SystemExit(f"[拒绝] {path.name} 含疑似密钥 {hits}，公开仓库不能推送")


def push_file(local: pathlib.Path, message: str):
    # 保留相对仓库根的目录结构（如 dict/github.zh-CN.json）
    repo_path = local.relative_to(ROOT).as_posix()
    # 中文等非 ASCII 路径必须 URL 编码，否则 http.client 会抛 UnicodeEncodeError
    quoted = urllib.parse.quote(repo_path)
    status, info = call("GET", f"/repos/{OWNER}/{REPO}/contents/{quoted}?ref={BRANCH}")
    sha = info.get("sha") if status == 200 else None
    if status not in (200, 404):
        print(f"[失败] GET {repo_path}: {status} {info.get('message')}")
        return False

    data = {
        "message": message,
        "content": base64.b64encode(local.read_bytes()).decode("ascii"),
        "branch": BRANCH,
    }
    if sha:
        data["sha"] = sha

    status, info = call("PUT", f"/repos/{OWNER}/{REPO}/contents/{quoted}", data)
    if status in (200, 201):
        commit = (info.get("commit") or {}).get("sha", "")[:12]
        action = "更新" if sha else "新建"
        print(f"[OK] {action} {repo_path} -> commit {commit}")
        return commit
    print(f"[失败] PUT {repo_path}: {status} {info.get('message')}")
    return None


def main():
    global TOKEN
    if len(sys.argv) < 3:
        raise SystemExit("用法: push_repo.py <commit message> <file> [file...]")
    message, files = sys.argv[1], sys.argv[2:]

    TOKEN = load_token()
    if not TOKEN:
        raise SystemExit("[无凭据] 缺少 .gh_token 文件或 GITHUB_TOKEN 环境变量")

    status, me = call("GET", "/user")
    if status != 200:
        raise SystemExit(f"[认证失败] {status} {me.get('message')}（token 可能已失效/被撤销）")
    print(f"认证用户: {me.get('login')}")

    ok = True
    for name in files:
        local = ROOT / name
        if not local.exists():
            print(f"[跳过] {name} 不存在")
            ok = False
            continue
        scan_public_safety(local)
        if push_file(local, message) is None:
            ok = False
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
