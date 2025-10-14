// ==UserScript==
// @name         Enhancer for TorrentDD
// @version      1.3.6
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
// @require      file://home/5nyqnhvk/Project/Enhancer-for-TorrentDD/dist/index.user.js
// @downloadURL  file://home/5nyqnhvk/Project/Enhancer-for-TorrentDD/index.user.js
// @updateURL    file://home/5nyqnhvk/Project/Enhancer-for-TorrentDD/index.user.js
// @connect      5nYqnHvk.xyz
// ==/UserScript==

/*
Changelog
2.0.0
- เริ่มทำใหม่
- ทำระบบ notification ใหม่

1.3.6
- แก้ไขปุ่มรับตั๋ว ไม่เปลี่ยนสี
- แก้ไขข้อความแสดงไม่ถูกต้องเมื่อกดรับตั๋ว
- เพิ่มสถิติการเดิมพัน ที่หน้า ebet

1.3.5
- แก้บัคกดรับตั๋ว 2 ครั้ง

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
