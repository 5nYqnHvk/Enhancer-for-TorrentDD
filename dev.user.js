// ==UserScript==
// @name         Enhancer for TorrentDD DEV
// @version      0.0.0-dev
// @description  Local dev loader for Enhancer for TorrentDD
// @author       5nYqnHvk
// @match        https://www.torrentdd.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torrentdd.com
// @grant        GM_info
// @grant        GM_addElement
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @connect      5nYqnHvk.xyz
// ==/UserScript==

GM_xmlhttpRequest({
  method: "GET",
  url: `http://127.0.0.1:8787/dist/index.user.js?t=${Date.now()}`,
  onload: (res) => {
    if (res.status < 200 || res.status >= 300) {
      console.error("Enhancer DEV load failed", res.status, res.responseText);
      return;
    }
    eval(res.responseText);
  },
  onerror: (err) => {
    console.error("Enhancer DEV server unreachable", err);
  },
});
