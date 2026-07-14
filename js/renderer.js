/**
 * 时间旅人 · 文章渲染器
 * 动态加载 Markdown 内容并渲染为文章页面
 * 支持 YAML frontmatter 解析 + marked.js markdown 渲染
 */

(function () {
  'use strict';

  // ---------- Frontmatter Parser ----------
  function parseFrontmatter(text) {
    var match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) return { meta: {}, content: text };
    var metaRaw = match[1];
    var content = match[2];
    var meta = {};
    metaRaw.split('\n').forEach(function (line) {
      var m = line.match(/^(\w+):\s*(.+)$/);
      if (m) {
        var val = m[2].trim();
        // Remove surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        meta[m[1]] = val;
      }
    });
    meta.content = content;
    return meta;
  }

  // ---------- Markdown to Article HTML ----------
  function markdownToArticleHTML(mdContent) {
    if (!window.marked) return '<p>' + mdContent + '</p>';
    var html = marked.parse(mdContent);
    // Wrap images in figures with captions
    html = html.replace(/<img([^>]*)>/g, function (match, attrs) {
      var srcMatch = attrs.match(/src="([^"]*)"/);
      var altMatch = attrs.match(/alt="([^"]*)"/);
      var titleMatch = attrs.match(/title="([^"]*)"/);
      var src = srcMatch ? srcMatch[1] : '';
      var alt = altMatch ? altMatch[1] : '';
      var caption = titleMatch ? titleMatch[1] : alt;
      return '<figure>' +
        '<div class="img-wrap"><img src="' + src + '" alt="' + alt + '" class="photo-mono"></div>' +
        (caption ? '<figcaption>' + caption + '</figcaption>' : '') +
        '</figure>';
    });
    // Add drop-cap class to first paragraph
    html = html.replace(/<p>(?!<figure)/, '<p class="drop-cap">');
    // Style blockquotes
    html = html.replace(/<blockquote>/g, '<blockquote><p class="font-display">');
    html = html.replace(/<\/blockquote>/g, '</p></blockquote>');
    // Style lists - add square bullet markers
    html = html.replace(/<ul>/g, '<ul class="article-list">');
    html = html.replace(/<li>/g, '<li>');
    // Style h2 headings
    html = html.replace(/<h2>/g, '<h2 class="font-display">');
    return html;
  }

  // ---------- Render Article Page ----------
  function renderArticle(meta) {
    // Set page title
    document.title = meta.title + ' · 时间旅人';

    // Set layered background title
    var bgTitleEl = document.getElementById('layered-bg-title');
    if (bgTitleEl) bgTitleEl.textContent = meta.title;
    // Set meta description
    var descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', meta.subtitle || meta.excerpt);

    // Update OG and Twitter meta tags
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title + ' · 时间旅人');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.subtitle || meta.excerpt || '');
    var ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);
    var ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && meta.cover) ogImage.setAttribute('content', meta.cover);
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', meta.title + ' · 时间旅人');
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', meta.subtitle || meta.excerpt || '');
    var twImage = document.querySelector('meta[name="twitter:image"]');
    if (twImage && meta.cover) twImage.setAttribute('content', meta.cover);

    // Update canonical
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', window.location.href);

    // Schema.org Article structured data
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': meta.title,
      'description': meta.subtitle || meta.excerpt || '',
      'author': {
        '@type': 'Person',
        'name': meta.author || '时间旅人'
      },
      'datePublished': meta.date,
      'image': meta.cover || '',
      'url': window.location.href,
      'publisher': {
        '@type': 'Organization',
        'name': '时间旅人',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://xn--gmqq57cget97q.cn/images/og-cover.jpg'
        }
      }
    };
    var schemaEl = document.getElementById('article-schema');
    if (schemaEl) {
      schemaEl.textContent = JSON.stringify(schema, null, 2);
    }

    // Fill header
    var titleEl = document.getElementById('article-title');
    if (titleEl) titleEl.textContent = meta.title;

    var subtitleEl = document.getElementById('article-subtitle');
    if (subtitleEl) subtitleEl.textContent = meta.subtitle;

    // Fill meta row
    var categorySpan = document.getElementById('article-category');
    if (categorySpan) categorySpan.textContent = meta.category;

    var dateSpan = document.getElementById('article-date');
    if (dateSpan) dateSpan.textContent = meta.date.replace(/-/g, '/');

    var readSpan = document.getElementById('article-readtime');
    if (readSpan) readSpan.textContent = meta.readTime;

    // Fill cover image
    var coverImg = document.getElementById('article-cover-img');
    if (coverImg) {
      coverImg.src = meta.cover;
      coverImg.alt = meta.title;
    }

    // Fill article body
    var bodyEl = document.getElementById('article-body');
    if (bodyEl && meta.content) {
      var contentHTML = markdownToArticleHTML(meta.content);
      // Split into reveal blocks
      var blocks = contentHTML.split(/(<\/(?:p|figure|blockquote|h2|ul)>)/);
      var revealHTML = '';
      var currentBlock = '';
      for (var i = 0; i < blocks.length; i++) {
        currentBlock += blocks[i];
        if (blocks[i].match(/<\/(?:p|figure|blockquote|h2|ul)>/)) {
          revealHTML += '<div class="reveal">' + currentBlock + '</div>';
          currentBlock = '';
        }
      }
      if (currentBlock.trim()) {
        revealHTML += '<div class="reveal">' + currentBlock + '</div>';
      }
      // Add end mark
      revealHTML += '<div class="article-end-mark"><span class="line"></span><span class="dot"></span><span class="line"></span></div>';
      bodyEl.innerHTML = revealHTML;
    }
  }

  // ---------- Load Article ----------
  function loadArticle(id) {
    var url = 'content/articles/' + id + '.md';
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('Article not found: ' + id);
        return res.text();
      })
      .then(function (text) {
        var meta = parseFrontmatter(text);
        renderArticle(meta);
        // Init animations after content is loaded
        if (window.initReveal) window.initReveal();
      })
      .catch(function (err) {
        console.error(err);
        document.getElementById('article-body').innerHTML = '<p>文章加载失败</p>';
      });
  }

  // ---------- Get Article ID from URL ----------
  function getArticleId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id') || '';
  }

  // ---------- Init ----------
  function init() {
    var id = getArticleId();
    if (id) {
      loadArticle(id);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for use by other scripts
  window.ArticleRenderer = {
    parseFrontmatter: parseFrontmatter,
    markdownToArticleHTML: markdownToArticleHTML,
    loadArticle: loadArticle
  };
})();
