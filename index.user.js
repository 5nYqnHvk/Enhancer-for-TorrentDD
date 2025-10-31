// ==UserScript==
// @name         Enhancer for TorrentDD
// @version      2.3.5
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
// @require      https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/dist/index.user.js?version=2.3.5
// @downloadURL  https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/index.user.js
// @updateURL    https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/index.user.js
// @connect      5nYqnHvk.xyz
// ==/UserScript==

/*
Changelog
2.0.0
- เริ่มทำใหม่เนื่องจากไฟล์โปรเจคที่แล้วและเซิฟเวอร์หาย
- มีหน้า setting ดูได้ในปุ่มเฟืองขวาบนชื่อ TDD Settings
- เอาระบบเก่าออกไปก่อน (เดี่ยวใส่เพิ่มอัพเดทหน้า)
- ฟังก์ชั่นปัจจุบัน (Farm, Gasha)
2.1.0
- เพื่มระบบแจ้งเตือน Ticket
- เพิ่มระบบวางไพ่ Battle Card
2.1.1 - 2.1.2
- แก้ไขดึงข้อมูลโปรไฟล์ไม่สำเร็จทำให้ Script พัง
2.2.0
- เพิ่มระบบวางไพ่ Battle Card
- เพิ่มระบบค้นหาไพ่ Battle Card
- กดเล่นได้โดยไม่ต้องเปิดแท็บใหม่ Battle Card
2.2.1 - 2.2.2
- เพิ่มปุ่มดึงไพ่และลบ pagination เดิมออก
- แก้ไขดึงข้อมูล username ผิดพลาด
2.3.0
- เพิ่มระบบ Torrent
2.3.1
- แก้ regex ระบบ Torrent
2.3.2
- แก้ ticket แจ้งเตือนเมื่อเก็บไปแล้ว
2.3.3
- แก้ ticket ไม่แสดงจำนวนตั๋ว
- เพิ่มปุ่มนำเข้าข้อมูลกาชา
- เพิ่มปุ่มส่งออกข้อมูลกาชา
- เพิ่มปุ่มลบข้อมูลกาชาในตาราง
2.3.4
- เพิ่มระบบแชท
- เพิ่มเรียง useronline ในหน้าแชทตามยศและเรียงตาม A-Z
2.3.5
- แก้ไข setting dropdown แสดงไม่ถูกต้อง
*/
