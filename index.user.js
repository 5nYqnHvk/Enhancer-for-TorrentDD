// ==UserScript==
// @name         Enhancer for TorrentDD
// @version      2.4.1
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
// @require      https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/dist/index.user.js?version=2.4.1
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
2.3.6 - 2.3.7
- แก้ไขอัพเดทกาชาใหม่ทำให้ Gasha Log หายไป
- เพิ่มอัปเดทปุ่มรับ ticket ทำให้ไม่ต้องรีเฟรชหน้าใหม่
2.3.8
- แก้ปุ่มอัปโหลดรูปหน้าแชทให้ใช้ได้ปกติ
2.3.9
- เพิ่มฟีเจอร์แสดง iframe หน้าบอสทำให้ไม่ต้องเข้าไปหน้าบอสตอนตี (ต้องไปเปิดเองหน้า settings)
2.4.0
- ลด request ซ้ำในหลาย module และเพิ่ม realtime refresh แบบเบาลง
- เพิ่ม local dev loader สำหรับทดสอบผ่าน Tampermonkey
- เพิ่ม Battle Card winrate, board analyzer, cache ผลล่าสุด และ filter ตาม player
- เพิ่ม Battle Card / Chat / Bank / โต๊ะบอล settings toggles
- เพิ่มโต๊ะบอล hover details ดูรายชื่อคนลงเดิมพันและยอด Zen โดยไม่ต้องเข้า detail
- เพิ่ม Bank bulk exchange และแก้ปุ่มแลกเดิมไม่ให้ refresh หน้า
- ปรับ Gasha log ให้ save/show แยกกันและ update ทันทีหลังเปิดกล่อง
- เพิ่ม Chat image preview แบบ skeleton กดแล้วค่อยโหลดรูป
- ปรับ logger ให้แยก debug/info/warn/error ถูกต้องและอ่านง่ายขึ้น
2.4.1
- แก้ Bank bulk exchange รับสถานะไม่ถูกต้อง
- แก้ โต๊ะบอล ให้เก็บฝั่งที่เดิมพันไว้ และ ไม่ต้องรัเฟรชหน้าเมื่อเดิมพัน
*/