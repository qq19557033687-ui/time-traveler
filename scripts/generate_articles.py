#!/usr/bin/env python3
"""
自动从 content/articles/*.md 生成 content/articles.json
每次 push 时由 GitHub Actions 自动运行
"""
import os
import json
import re
from datetime import datetime

ARTICLES_DIR = "content/articles"
OUTPUT_FILE = "content/articles.json"


def parse_frontmatter(text):
    """解析 YAML frontmatter，返回 dict"""
    match = re.match(r'^---\s*\n(.*?)\n---', text, re.DOTALL)
    if not match:
        return None

    fm = {}
    current_key = None
    current_lines = []

    for line in match.group(1).splitlines():
        # 处理多行字段（如 excerpt: >-）
        if current_key and (line.startswith('  ') or line.startswith('\t')):
            current_lines.append(line.strip())
            continue

        if current_key:
            fm[current_key] = ' '.join(current_lines).strip()

        # 解析 key: value
        m = re.match(r'^(\w+):\s*(.*)', line)
        if m:
            current_key = m.group(1)
            val = m.group(2).strip()
            # 去除引号
            val = val.strip('"').strip("'")
            if val == '' or val.startswith('>'):
                current_lines = []
            else:
                current_lines = [val]
        else:
            current_key = None
            current_lines = []

    if current_key:
        fm[current_key] = ' '.join(current_lines).strip()

    return fm


def get_article_id(filepath):
    """从文件名生成 article id"""
    basename = os.path.basename(filepath)
    return os.path.splitext(basename)[0]


def extract_body_excerpt(text, max_length=120):
    """从正文提取摘要（如果 frontmatter 里没有 excerpt）"""
    # 去掉 frontmatter
    body = re.sub(r'^---\s*\n.*?\n---\s*\n', '', text, flags=re.DOTALL)
    # 去掉 markdown 语法
    body = re.sub(r'[#>*_`\[\]]', '', body)
    body = re.sub(r'\n+', ' ', body)
    body = body.strip()
    if len(body) > max_length:
        body = body[:max_length] + '……'
    return body


def generate_articles_json():
    articles = []

    for filename in sorted(os.listdir(ARTICLES_DIR)):
        if not filename.endswith('.md'):
            continue

        filepath = os.path.join(ARTICLES_DIR, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            text = f.read()

        fm = parse_frontmatter(text)
        if not fm:
            continue

        article_id = get_article_id(filepath)

        # 封面图处理：如果是相对路径，保持原样；否则直接用
        cover = fm.get('cover', '')
        if cover and not cover.startswith('http'):
            # 已经是 images/xxx 格式，保持原样
            pass

        article = {
            "id": article_id,
            "title": fm.get('title', article_id),
            "subtitle": fm.get('subtitle', ''),
            "date": fm.get('date', ''),
            "readTime": fm.get('readTime', '5 分钟'),
            "category": fm.get('category', '随笔'),
            "cover": cover,
            "excerpt": fm.get('excerpt', extract_body_excerpt(text)),
            "order": int(fm.get('order', 99))
        }
        articles.append(article)

    # 按 order 排序
    articles.sort(key=lambda x: (x['order'], x['date']))

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(articles, f, ensure_ascii=False, indent=2)

    print(f"✓ Generated {OUTPUT_FILE} with {len(articles)} articles")
    for a in articles:
        print(f"  - [{a['order']}] {a['title']} (id: {a['id']})")


if __name__ == '__main__':
    generate_articles_json()
