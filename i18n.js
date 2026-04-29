// i18n.js - 轻量级国际化引擎
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
    // 1. 翻译所有带 data-i18n 属性的 HTML 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = t(el.getAttribute('data-i18n'));
    });
    
    // 翻译 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // 2. ✅ 通知 Dashboard 重新渲染卡片（数字和标题）
    if (typeof updateDashboardCards === 'function') {
        updateDashboardCards();
    }
    
    // 3. ✅ 通知 Dashboard 重新渲染图表 (柱状图和饼图)
    if (typeof window.renderDashboardCharts === 'function') {
        window.renderDashboardCharts();
    }
    
    // 4. 通知 Orders 页面重新渲染表格
    if (typeof window.renderOrdersTable === 'function') {
        window.renderOrdersTable();
    }
    
    // 5. 通知 Products 页面重新渲染表格
    if (typeof window.renderProductsTable === 'function') {
        window.renderProductsTable();
    }
    
    // 6. 通知 Finances 页面重新渲染表格
    if (typeof window.renderTransactionsTable === 'function') {
        window.renderTransactionsTable();
    }
}

// 页面加载完成后初始化语言
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('biztrack_lang') || 'en';
    loadLanguage(savedLang);
});

// 暴露全局 API
window.i18n = { loadLanguage, t };
