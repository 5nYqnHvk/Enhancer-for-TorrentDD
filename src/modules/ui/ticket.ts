import Swal from "sweetalert2";
import { createLogger } from "../../utils/logger";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Ticket");
const settingData = await fetctSettingData();

let ticketButton: JQuery<HTMLButtonElement>;
let tickets = 0;

export const initTicketModule = async () => {
  if (!settingData.ticket.enabledTicketModule) return;
  await initTicketButton();
};

const initTicketButton = async () => {
  const ticket = await fetch("ticket.php");
  const ticketBody = await ticket.text();

  const dom = new DOMParser();
  const parser = dom.parseFromString(ticketBody, "text/html");

  ticketButton = $(".card-body.text-center").find("button");
  tickets = Number(
    $(parser)
      .find(".card-body.text-center")
      .find("button")
      .text()
      .split(" ")[1],
  );
  ticketButton.off("click");
  logger.info(`ตั่วที่สามารถรับได้ ${tickets} ชิ้น`);

  let latestRow = $(parser)
    .find("table tbody tr")
    .not(".table-secondary")
    .first();
  let latestTime = latestRow.find("td:eq(2)").text().trim();
  let lastDate = new Date(latestTime.replace(" ", "T"));
  let nextRound = getNextRoundTime(lastDate);

  let timer = setInterval(() => {
    let diff = nextRound.getTime() - Date.now();
    if (diff <= 0) {
      clearInterval(timer);
      ticketButton.html(`รับตั๋วสุ่มกาชา ${tickets} ชิ้น`);
      ticketButton.addClass("btn-success");
      ticketButton.removeClass("btn-danger");
      ticketButton.prop("disabled", false);
      ticketButton[0].addEventListener("click", async () => await getTicket());
      return;
    }

    let hours = Math.floor(diff / 1000 / 60 / 60);
    let minutes = Math.floor((diff / 1000 / 60) % 60);
    let seconds = Math.floor((diff / 1000) % 60);

    ticketButton.html(
      `เหลือเวลาอีก ${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")} เพื่่อรับตั๋ว`,
    );
    ticketButton.removeClass("btn-success");
    ticketButton.addClass("btn-danger");
    ticketButton.prop("disabled", true);
  }, 1000);
};

const getTicket = async () => {
  const ticket = await fetch("ticket.php?mod=get-ticket");
  const ticketBody = await ticket.text();

  switch (ticketBody) {
    case "success":
      logger.info(`รับตั๋วสุ่มกาชา ${tickets} ชิ้น`);
      await Swal.fire(
        "Good job!",
        'รับ <i class="fal fa-tag fa-md mr-1"></i>รับตั๋วสุ่มกาชา เรียบร้อยแล้ว!',
        "warning",
      );
      ticketButton[0].disabled = true;
      GM_setValue("ticketNotificationDate", Date.now());
      break;
    case "error-1":
      logger.error(
        `คุณจะต้องปล่อยไฟล์ 5 ไฟล์ขึ้นไป และ Connect มากว่า 3 ชั่วโมง`,
      );
      await Swal.fire(
        "Error!",
        "คุณจะต้องปล่อยไฟล์ 5 ไฟล์ขึ้นไป และ Connect มากว่า 3 ชั่วโมง",
        "error",
      );
      ticketButton[0].disabled = true;
      break;
    case "error-2":
      logger.error(`คุณรับตั๋วสุ่มกาชาไปแล้ว กรุณารับในรอบถัดไปค่ะ`);
      await Swal.fire(
        "Error!",
        "คุณรับตั๋วสุ่มกาชาไปแล้ว กรุณารับในรอบถัดไปค่ะ",
        "error",
      );
      ticketButton[0].disabled = true;
      break;
    case "error-3":
      logger.error(`การรับตั๋วสุ่มกาชา จะต้องห่างกันอย่างน้อย 3 ชั่วโมง`);
      await Swal.fire(
        "Error!",
        "การรับตั๋วสุ่มกาชา จะต้องห่างกันอย่างน้อย 3 ชั่วโมง",
        "error",
      );
      ticketButton[0].disabled = true;
      break;
  }
  await initTicketButton();
};

const getNextRoundTime = (baseDate: Date) => {
  let next = new Date(baseDate);

  if (baseDate.getHours() < 12) {
    next.setHours(12, 0, 0, 0);
  } else {
    next.setDate(baseDate.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }
  return next;
};
