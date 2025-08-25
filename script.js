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
        item.textContent = "暂无提交记录";
        listEl.appendChild(item);
    } else {
        history.slice(-10).reverse().forEach(entry => {
            const item = document.createElement("li");
            item.innerHTML = `<strong>${entry.text}</strong> → ${entry.percentage}%<br><small>${entry.timestamp}</small>`;
            listEl.appendChild(item);
        });
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
    themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    localStorage.setItem("theme", theme);
}

// 初始化
const currentTheme = getInitialTheme();
setTheme(currentTheme);

// 切换主题
themeToggle.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
});

// 页面加载完成后初始化
document.addEventListener("DOMContentLoaded", function () {
    const textInput = document.getElementById("textInput");
    const submitBtn = document.getElementById("submitBtn");
    const progressContainer = document.getElementById("progressContainer");
    const progressFill = document.getElementById("progressFill");
    const progressText = document.getElementById("progressText");
    const tipText = document.getElementById("tipText"); // ✅ 获取提示文本元素
    const retryBtn = document.getElementById("retryBtn");
    const historyBtn = document.getElementById("historyBtn");
    const historyList = document.getElementById("historyList");

    // 显示/隐藏历史列表
    historyBtn.addEventListener("click", () => {
        const isHidden = historyList.style.display === "none";
        historyList.style.display = isHidden ? "block" : "none";
        showHistory();
    });

    // 点击页面其他地方隐藏历史列表
    document.addEventListener("click", (e) => {
        if (!historyBtn.contains(e.target) && !historyList.contains(e.target)) {
            historyList.style.display = "none";
        }
    });

    // 阻止点击历史列表时关闭
    historyList.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // 提交按钮事件
    submitBtn.addEventListener("click", () => {
        const value = textInput.value.trim();
        if (!value) {
            alert("请输入内容！");
            return;
        }

        // 计算哈希和百分比
        const hash = hashString(value);
        const percentage = getPercentageFromHash(hash);

        // 显示进度条
        progressContainer.style.display = "flex";
        progressFill.style.width = "0%";
        progressText.textContent = "0%";
        tipText.textContent = "";
        tipText.classList.remove("show");

        // 动画填充
        setTimeout(() => {
            progressFill.style.width = percentage + "%";
            progressText.textContent = percentage + "%";

            // ✅ 根据百分比设置提示文本
            let tip = "";
            if (percentage <= 5) {
                tip = "拉完了，不推荐使用";
            } else if (percentage <= 25) {
                tip = "不太行，建议换一个";
            } else if (percentage <= 50) {
                tip = "还可以，酌情使用";
            } else if (percentage <= 75) {
                tip = "非常好，建议使用";
            } else {
                tip = "顶级，没被抢就用这个";
            }

            tipText.textContent = tip;
            tipText.classList.add("show");
        }, 100);

        // 保存历史
        saveToHistory(value, percentage);

        // 切换按钮显示
        submitBtn.style.display = "none";
        retryBtn.style.display = "block";
    });

    // 再试一次按钮
    retryBtn.addEventListener("click", () => {
        progressContainer.style.display = "none";
        retryBtn.style.display = "none";
        submitBtn.style.display = "block";
        tipText.textContent = "";
        tipText.classList.remove("show");
    });
});
