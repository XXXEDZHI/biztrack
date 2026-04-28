// i18n.js
let currentLang = 'en';
let translations = {};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) throw new Error('Network response was not ok');
        translations = await response.json();
        currentLang = lang;
        applyTranslations();
        localStorage.setItem('biztrack_lang', lang);
    } catch (error) {
        console.error('i18n load error:', error);
    }
}

function t(key) {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
        if (result && result[k] !== undefined) {
            result = result[k];
        } else {
            return key; // 找不到返回 key
        }
    }
    return result;
}

function applyTranslations() {
    // 1. 翻译 HTML 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // 2. ✅ 关键修复：通知 orders.js 重新渲染表格
    if (typeof window.renderOrdersTable === 'function') {
        window.renderOrdersTable();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('biztrack_lang') || 'en';
    loadLanguage(savedLang);
});

window.i18n = { loadLanguage, t };
