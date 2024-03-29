// ==UserScript==
// @name         Enhancer for TorrentDD
// @version      1.3.4
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
// @require      https://raw.githubusercontent.com/Titivoot/Enhancer-for-TorrentDD/main/dist/index.user.js?version=1.3.4
// @downloadURL  https://raw.githubusercontent.com/Titivoot/Enhancer-for-TorrentDD/main/index.user.js
// @updateURL    https://raw.githubusercontent.com/Titivoot/Enhancer-for-TorrentDD/main/index.user.js
// @connect      5nYqnHvk.xyz
// ==/UserScript==

/*
Changelog
1.3.4
- เพิ่มหน้า ebet history (บอกว่าเดิมพันทีมไหนบ้างและได้รับหรือเสียเงินไปเท่าไหร่)

1.3.3
- แก้ไขหน้า ebet แสดงรายการไม่ถูกต้อง

1.3.2
- แก้ไข ui หน้า โต๊ะบอลให้แสดงได้ถูกต้อง
- แก้ไขเมื่อกดปุ่มเดิมพันแล้วบันทึกข้อมูลไม่ทันก่อนเว็บรีเฟรช

1.3.1
- เก็บข้อมูลการเดิมพันโต็ะบอล

1.3.0
- เพิ่ม icon บอกว่าเดิมพันทีมไหนไว้เท่าไหร่

1.2.0
- เพิ่มปุ่ม Download กับปุ่ม Magnet สำหรับ VIP ขึ้นไป

1.1.0
- แก้ไขระบบแจ้งเตือนไม่อัพเดทเมื่อมีการแจ้งเตือนแล้ว
- เปลี่ยนจากระบบกดไพ่เป็นระบบค้นหาไพ่เนื่องจากอาจทำให้เซิฟเวอร์ทำงานหนักได้
*/
