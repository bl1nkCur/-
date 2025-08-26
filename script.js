// 多语言支持
const translations = {
    zh: {
        title: "网名检测器",
        disclaimer: "仅供娱乐，请勿当真",
        inputPlaceholder: "在此输入...",
        submitBtn: "提交",
        retryBtn: "再试一次",
        historyBtn: "提交历史",
        noHistory: "暂无提交记录",
        alert: "请输入内容！",
        result: "检测结果",
        tips: {
            veryLow: "拉完了，不推荐使用",
            low: "不太行，建议换一个",
            medium: "还可以，酌情使用",
            high: "非常好，建议使用",
            veryHigh: "顶级，没被抢就用这个"
        }
    },
    en: {
        title: "Nickname Detector",
        disclaimer: "For entertainment only, not to be taken seriously",
        inputPlaceholder: "Enter here...",
        submitBtn: "Submit",
        retryBtn: "Try Again",
        historyBtn: "Submission History",
        noHistory: "No submission history",
        alert: "Please enter content!",
        result: "Result",
        tips: {
            veryLow: "Terrible, not recommended",
            low: "Not great, suggest changing",
            medium: "Acceptable, use with discretion",
            high: "Very good, recommended",
            veryHigh: "Excellent, use this if available"
        }
    },
    ja: {
        title: "ニックネーム検出器",
        disclaimer: "娯楽のみ、真に受けないでください",
        inputPlaceholder: "ここに入力...",
        submitBtn: "提出",
        retryBtn: "再試行",
        historyBtn: "提出履歴",
        noHistory: "提出履歴はありません",
        alert: "内容を入力してください！",
        result: "検査結果",
        tips: {
            veryLow: "最悪、使用しないことをお勧めします",
            low: "あまり良くない、変更を提案します",
            medium: "許容範囲、慎重に使用してください",
            high: "非常に良い、おすすめです",
            veryHigh: "最高、空いていればこれを使ってください"
        }
    }
};

// 当前语言
let currentLanguage = 'zh';

// 根据百分比获取对应的提示文本
function getTipText(percentage) {
    const tips = translations[currentLanguage].tips;
    
    if (percentage <= 5) {
        return tips.veryLow;
    } else if (percentage <= 25) {
        return tips.low;
    } else if (percentage <= 50) {
        return tips.medium;
    } else if (percentage <= 75) {
        return tips.high;
    } else {
        return tips.veryHigh;
    }
}

// 更新界面语言
function updateUILanguage(lang) {
    currentLanguage = lang;
    const t = translations[lang];
    
    // 更新文本内容
    document.getElementById('title').textContent = t.title;
    document.getElementById('disclaimer').textContent = t.disclaimer;
    document.getElementById('result').textContent = t.result;
    document.getElementById('textInput').placeholder = t.inputPlaceholder;
    document.getElementById('submitBtn').querySelector('.btn-text').textContent = t.submitBtn;
    document.getElementById('retryBtn').querySelector('span:last-child').textContent = t.retryBtn;
    
    // 如果结果卡片正在显示，更新提示文本
    const resultCard = document.getElementById("resultCard");
    const progressText = document.getElementById("progressText");
    const tipText = document.getElementById("tipText");
    
    if (resultCard.style.display === "block") {
        const percentage = parseInt(progressText.textContent);
        tipText.textContent = getTipText(percentage);
    }
    
    // 保存语言选择
    localStorage.setItem('preferredLanguage', lang);
    document.getElementById('languageSelect').value = lang;
}

// 简单的哈希函数（将字符串转为 32 位整数）
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转为 32 位整数
    }
    return Math.abs(hash);
}

// 将哈希值映射为 0-100 的百分比
function getPercentageFromHash(hash) {
    return hash % 101; // 0 到 100
}

// 设置 Cookie
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

// 获取 Cookie
function getCookie(name) {
    const cname = name + "=";
    const decoded = decodeURIComponent(document.cookie);
    const ca = decoded.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(cname) === 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

// 获取所有历史记录（从 Cookie）
function getHistory() {
    const historyStr = getCookie("submissionHistory");
    return historyStr ? JSON.parse(historyStr) : [];
}

// 保存历史记录
function saveToHistory(text, percentage) {
    const history = getHistory();
    const newEntry = { text, percentage, timestamp: new Date().toLocaleString() };
    history.push(newEntry);
    setCookie("submissionHistory", JSON.stringify(history));
}

// 显示历史记录
function showHistory() {
    const history = getHistory();
    const listEl = document.getElementById("historyItems");
    listEl.innerHTML = '';

    if (history.length === 0) {
        const item = document.createElement("li");
        item.textContent = translations[currentLanguage].noHistory;
        listEl.appendChild(item);
    } else {
        history.slice(-10).reverse().forEach(entry => {
            const item = document.createElement("li");
            item.innerHTML = `<strong>${entry.text}</strong> → ${entry.percentage}%<br><small>${entry.timestamp}</small>`;
            listEl.appendChild(item);
        });
    }
}

// 切换历史面板显示
function toggleHistoryPanel() {
    const historyPanel = document.getElementById("historyList");
    historyPanel.classList.toggle("active");
    if (historyPanel.classList.contains("active")) {
        showHistory();
    }
}

// === 主题切换功能 ===
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;

// 检查用户偏好
function getInitialTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// 设置主题
function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle.querySelector('span').textContent = theme === "dark" ? "light_mode" : "dark_mode";
    localStorage.setItem("theme", theme);
}

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function () {
    // 初始化语言
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'zh';
    updateUILanguage(savedLanguage);
    
    // 语言选择器事件
    document.getElementById('languageSelect').addEventListener('change', function() {
        updateUILanguage(this.value);
    });

    const textInput = document.getElementById("textInput");
    const submitBtn = document.getElementById("submitBtn");
    const resultCard = document.getElementById("resultCard");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const tipText = document.getElementById("tipText");
    const retryBtn = document.getElementById("retryBtn");
    const historyBtn = document.getElementById("historyBtn");
    const closeHistory = document.getElementById("closeHistory");

    // 初始化主题
    const currentTheme = getInitialTheme();
    setTheme(currentTheme);

    // 切换主题
    themeToggle.addEventListener("click", () => {
        const isDark = root.getAttribute("data-theme") === "dark";
        setTheme(isDark ? "light" : "dark");
    });

    // 显示/隐藏历史列表
    historyBtn.addEventListener("click", toggleHistoryPanel);
    closeHistory.addEventListener("click", toggleHistoryPanel);

    // 点击页面其他地方隐藏历史列表
    document.addEventListener("click", (e) => {
        const historyPanel = document.getElementById("historyList");
        if (!historyBtn.contains(e.target) && !historyPanel.contains(e.target) && historyPanel.classList.contains("active")) {
            toggleHistoryPanel();
        }
    });

    // 阻止点击历史列表时关闭
    document.getElementById("historyList").addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // 提交按钮事件
    submitBtn.addEventListener("click", () => {
        const value = textInput.value.trim();
        if (!value) {
            alert(translations[currentLanguage].alert);
            return;
        }

        // 计算哈希和百分比
        const hash = hashString(value);
        const percentage = getPercentageFromHash(hash);

        // 显示结果卡片
        resultCard.style.display = "block";
        progressFill.style.width = "0%";
        progressText.textContent = "0%";
        tipText.textContent = "";
        tipText.classList.remove("show");

        // 动画填充
        setTimeout(() => {
            progressFill.style.width = percentage + "%";
            progressText.textContent = percentage + "%";

            // 根据当前语言获取对应的提示文本
            tipText.textContent = getTipText(percentage);
            tipText.classList.add("show");
        }, 100);

        // 保存历史
        saveToHistory(value, percentage);

        // 切换按钮显示
        submitBtn.style.display = "none";
        retryBtn.style.display = "flex";
    });

    // 再试一次按钮
    retryBtn.addEventListener("click", () => {
        resultCard.style.display = "none";
        retryBtn.style.display = "none";
        submitBtn.style.display = "flex";
        textInput.value = "";
        textInput.focus();
        tipText.textContent = "";
        tipText.classList.remove("show");
    });
});