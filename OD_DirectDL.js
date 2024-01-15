// ==UserScript==
// @name         OneDrive直接下載(按下「複製連結」產生直接下載連結)
// @namespace    https://github.com/zz0813/OneDrive-Direct-Download/
// @version      1.0
// @description  將共用連結轉換成直接下載連結並複製到剪貼簿
// @author       zz0813
// @match        *://*.sharepoint.com/*
// @match        *://onedrive.live.com/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // 延遲讀取剪貼簿內容
    function delayedClipboardRead() {
        setTimeout(async () => {
            try {
                const clipboardText = await navigator.clipboard.readText();
                const directDownloadLink = convertToDirectDownloadLink(clipboardText);
                if (directDownloadLink) {
                    // 使用Tampermonkey的GM_setClipboard函數來修改剪貼簿的內容
                    GM_setClipboard(directDownloadLink, 'text');
                    alert('直接下載連結已複製到剪貼簿！' + directDownloadLink);
                    console.log('直接下載連結已複製到剪貼簿：', directDownloadLink);
                }
            } catch (error) {
                alert('無法讀取剪貼簿！' + error);
                console.error('無法讀取剪貼簿：', error);
            }
        }, 1300);
    }

    // 轉換共享連結為直接下載連結的函數
    function convertToDirectDownloadLink(shareLink) {
        if (shareLink.startsWith("https://1drv.ms/")) {
            return "https://onw.cc/1drv.ms.php?url=" + shareLink;
        }

        // 使用正則表達式來提取共享連結的部分
        const reg = /https:\/\/(?<domain>.+sharepoint\.com)\/.*personal\/(?<user>\w+?)\/(?<share>\w+)/;
        // const reg = /https:\/\/(.+sharepoint\.com)\/.*personal\/(\w+?)\/(\S+)(?:\?.+$)/
        const matches = shareLink.match(reg);

        // 如果沒有匹配到，或者是資料夾連結，則返回null
        if (!matches || shareLink.includes("com/:f:")) {
            alert('抱歉，直鏈生成僅對單一文件有效！');
            return null;
        }

        // 否則，返回直接下載連結
        const [p1, p2, p3] = matches.slice(1);
        return `${p1}/personal/${p2}/_layouts/00/download.aspx?share=${p3}`;
    }

    // 監聽「複製連結」按鈕點擊事件
    document.addEventListener('click', event => {
        if (event.target.closest('[data-automationid="copyLinkCommand"]')) {
           delayedClipboardRead();
        }
    });

})();
