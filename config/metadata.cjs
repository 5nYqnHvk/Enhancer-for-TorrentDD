const { author, version, description } = require("../package.json");

/**
 * This is the tampermonkey headers used to match which webpage to run the script on
 */

module.exports = {
  name: "Enhancer for TorrentDD Refactor",
  namespace: "https://greasyfork.org/users/1265921",
  description: "เพิ่มฟังก์ชั้นที่ทำให้ใช้เว็บได้ง่ายขึ้น",
  version: version,
  author: author,
  match: ["https://www.torrentdd.com/*"],
  icon: "https://www.google.com/s2/favicons?sz=64&domain=torrentdd.com",
  grant: [
    "GM_info",
    "GM_addElement",
    "GM_setValue",
    "GM_getValue",
    "GM_deleteValue",
    "GM_registerMenuCommand",
    "GM_unregisterMenuCommand",
    "GM_notification",
    "GM.xmlHttpRequest",
  ],
  // "run-at": "document-end"
};
