// ==UserScript==
// @name         Enhancer for TorrentDD
// @version      1.2.0
// @description  เพิ่มฟังก์ชั้นที่ทำให้ใช้เว็บได้ง่ายขึ้น
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
// @require      https://raw.githubusercontent.com/Titivoot/Enhancer-for-TorrentDD/main/dist/index.user.js?version=1.2.0
// @downloadURL  https://raw.githubusercontent.com/Titivoot/Enhancer-for-TorrentDD/main/index.user.js
// @updateURL    https://raw.githubusercontent.com/Titivoot/Enhancer-for-TorrentDD/main/index.user.js
// @connect      5nYqnHvk.xyz
// ==/UserScript==

/*
Changelog
1.2.0
- เพิ่มปุ่ม Download กับปุ่ม Magnet สำหรับ VIP ขึ้นไป

1.1.0
- แก้ไขระบบแจ้งเตือนไม่อัพเดทเมื่อมีการแจ้งเตือนแล้ว
- เปลี่ยนจากระบบกดไพ่เป็นระบบค้นหาไพ่เนื่องจากอาจทำให้เซิฟเวอร์ทำงานหนักได้
*/
