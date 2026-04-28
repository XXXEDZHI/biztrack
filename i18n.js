// i18n.js - 轻量级国际化引擎
let currentLang = 'en';
let translations = {};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`./locales/${lang}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        translations = await response.json();
        currentLang = lang;
        applyTranslations();
        localStorage.setItem('biztrack_lang', lang);
    } catch (error) {
        console.error('i18n 加载失败:', error);
    }
}

function t(key) {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
        if (result && typeof result === 'object' && result[k] !== undefined) {
            result = result[k];
        } else {
            return key; 
        }
    }
    return result !== undefined ? result : key;
}

function applyTranslations() {
    // 1. 翻译所有带 data-i18n 属性的 HTML 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    
    // 2. 翻译 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // 3. 更新 Dashboard 卡片（动态内容）
    if (typeof updateDashboardCards === 'function') {
        updateDashboardCards();
    }
}

// 页面加载完成后初始化语言
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('biztrack_lang') || 'en';
    loadLanguage(savedLang);
});

// 暴露全局 API
window.i18n = { loadLanguage, t };
