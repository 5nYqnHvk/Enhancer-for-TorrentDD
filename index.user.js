// ==UserScript==
// @name         Enhancer for TorrentDD
// @version      2.5.1
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
// @require      https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/dist/index.user.js?version=2.5.1
// @downloadURL  https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/index.user.js
// @updateURL    https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/index.user.js
// @connect      5nYqnHvk.xyz
// ==/UserScript==

/*
════════════════════════════════════════════════════════
  Enhancer for TorrentDD — Changelog
════════════════════════════════════════════════════════

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.5.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  market and marketplace sort price
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.5.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  Home dashboard — แสดงสถานะ Farm / Ticket / Profile
         แบบ widget รวมไว้หน้าเดียว
  ✦ NEW  Ranking — snapshot & compare อันดับ, filter ตาม
         activity (seeder / ticket / money / pet / coin …)
  ✦ NEW  Market — filter + pagination และ modal ดู pet stats
  ✦ NEW  Marketplace — filter ราคา / ชนิด / class และ
         track ราคา NFT แบบ local cache
  ✦ NEW  Inventory — pagination และ group ไอเทมตามชนิด
  ✦ NEW  Inbox — bulk delete และ pagination ข้อความ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.4.2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  Boss iframe แสดงหน้าว่าง (blank screen)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.4.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  Bank bulk exchange อ่านสถานะ response ไม่ถูกต้อง
  ✔ FIX  โต๊ะบอล เก็บฝั่งที่เดิมพันไว้และไม่ต้องรีเฟรชหน้า

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.4.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  Battle Card winrate, board analyzer, cache ผลล่าสุด
         และ filter ตาม player
  ✦ NEW  Battle Card / Chat / Bank / โต๊ะบอล settings toggles
  ✦ NEW  โต๊ะบอล hover details — ดูรายชื่อผู้เดิมพันและยอด Zen
  ✦ NEW  Bank bulk exchange
  ✦ NEW  Chat image preview แบบ skeleton (กดค่อยโหลด)
  ✦ NEW  Local dev loader สำหรับทดสอบผ่าน Tampermonkey
  ✔ FIX  ลด duplicate request และเพิ่ม realtime refresh เบาลง
  ✔ FIX  Gasha log save/show แยกกันและ update ทันทีหลังเปิดกล่อง
  ✔ FIX  Bank ปุ่มแลกเดิมไม่ refresh หน้าแล้ว
  ✔ FIX  Logger แยก debug / info / warn / error ถูกต้อง

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.9
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  Boss iframe บนหน้าแชท (เปิดใช้ใน Settings)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  ปุ่มอัปโหลดรูปในหน้าแชทใช้งานได้ปกติ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.6 — v2.3.7
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  อัพเดทกาชาใหม่ทำให้ Gasha Log หาย
  ✔ FIX  ปุ่มรับ Ticket ไม่ต้องรีเฟรชหน้าแล้ว

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  Settings dropdown แสดงค่าไม่ถูกต้อง

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  ระบบแชท
  ✦ NEW  เรียง User Online ในแชทตามยศและ A-Z

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  ปุ่มนำเข้า / ส่งออก / ลบข้อมูลกาชาในตาราง
  ✔ FIX  Ticket ไม่แสดงจำนวนตั๋ว

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  Ticket แจ้งเตือนซ้ำเมื่อเก็บไปแล้ว

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  Regex ระบบ Torrent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  ระบบ Torrent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.2.1 — v2.2.2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  ปุ่มดึงไพ่และลบ pagination เดิมออก
  ✔ FIX  ดึงข้อมูล username ผิดพลาด

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.2.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  ระบบวางไพ่ Battle Card
  ✦ NEW  ระบบค้นหาไพ่ Battle Card
  ✦ NEW  กดเล่น Battle Card โดยไม่ต้องเปิดแท็บใหม่

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.1.1 — v2.1.2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✔ FIX  ดึงข้อมูลโปรไฟล์ไม่สำเร็จทำให้ Script พัง

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  ระบบแจ้งเตือน Ticket
  ✦ NEW  ระบบวางไพ่ Battle Card

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  v2.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✦ NEW  เริ่มทำใหม่ตั้งแต่ต้น (ไฟล์และเซิร์ฟเวอร์เก่าหาย)
  ✦ NEW  หน้า TDD Settings (ปุ่มเฟืองขวาบน)
  ✦ NEW  ฟังก์ชั่นเริ่มต้น: Farm, Gasha

════════════════════════════════════════════════════════
*/
