// js/lang.js — Client-side translation engine using translations.js dictionary
document.addEventListener('DOMContentLoaded', () => {
    const switcher = document.getElementById('lang-switcher');
    if (!switcher) return;
    if (typeof translations === 'undefined') return;

    // Keep an English snapshot of the original DOM text for reverting
    const originalTexts = new Map();

    // Collect all text-bearing elements (skip script, style, noscript)
    function getTextNodes(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const tag = node.parentElement?.tagName;
                    if (!tag) return NodeFilter.FILTER_REJECT;
                    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'SELECT', 'OPTION'].includes(tag)) return NodeFilter.FILTER_REJECT;
                    if (node.textContent.trim().length === 0) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        return nodes;
    }

    // Save original English text on first run
    function snapshotOriginals() {
        if (originalTexts.size > 0) return;
        getTextNodes(document.body).forEach(node => {
            originalTexts.set(node, node.textContent);
        });
    }

    // Translate all text nodes
    function applyTranslation(lang) {
        snapshotOriginals();

        if (lang === 'en') {
            // Restore originals
            originalTexts.forEach((original, node) => {
                if (node.parentElement) node.textContent = original;
            });
            return;
        }

        const dict = translations[lang];
        if (!dict) return;

        // Build a reverse lookup for fast matching (key → translated)
        // Also try matching trimmed text
        originalTexts.forEach((original, node) => {
            if (!node.parentElement) return;
            const trimmed = original.trim();
            if (dict[trimmed] !== undefined) {
                // Preserve leading/trailing whitespace from original
                const before = original.match(/^\s*/)[0];
                const after = original.match(/\s*$/)[0];
                node.textContent = before + dict[trimmed] + after;
            }
        });

        // Also translate placeholder and title attributes
        document.querySelectorAll('[placeholder]').forEach(el => {
            const orig = el.getAttribute('data-orig-placeholder') || el.getAttribute('placeholder');
            if (!el.getAttribute('data-orig-placeholder')) {
                el.setAttribute('data-orig-placeholder', orig);
            }
            if (lang === 'en') {
                el.setAttribute('placeholder', orig);
            } else if (dict[orig]) {
                el.setAttribute('placeholder', dict[orig]);
            }
        });

        // Translate <option> text
        document.querySelectorAll('select:not(#lang-switcher) option').forEach(opt => {
            const orig = opt.getAttribute('data-orig-text') || opt.textContent.trim();
            if (!opt.getAttribute('data-orig-text')) {
                opt.setAttribute('data-orig-text', orig);
            }
            if (lang === 'en') {
                opt.textContent = orig;
            } else if (dict[orig]) {
                opt.textContent = dict[orig];
            }
        });
    }

    // Init: check saved language
    const saved = localStorage.getItem('guler_lang') || 'en';
    if (saved !== 'en') {
        switcher.value = saved;
        // Wait a tick for DOM to settle, then translate
        requestAnimationFrame(() => applyTranslation(saved));
    }

    // On change
    switcher.addEventListener('change', (e) => {
        const lang = e.target.value;
        localStorage.setItem('guler_lang', lang);
        applyTranslation(lang);
    });
});
