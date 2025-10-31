import Swal from "sweetalert2";
import { createLogger } from "../../utils/logger";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Ticket");
const settingData = await fetctSettingData();

export const initTicketModule = async () => {
  if (!settingData.ticket.enabledTicketModule) return;
  initTicketButton();
};

export const initTicketButton = () => {
  const ticketButton = $(".card-body.text-center").find("button");
  ticketButton.off("click");

  if (ticketButton[0].disabled === true) {
    ticketButton.html("คุณได้รับตั๋วสุ่มกาชาไปแล้ว");
    ticketButton.removeClass("btn-success");
    ticketButton.addClass("btn-danger");
  } else {
    const tickets = Number(ticketButton.text().split(" ")[1]);
    logger.info(`ตั่วที่สามารถรับได้ ${tickets} ชิ้น`);
  }

  ticketButton[0].addEventListener("click", async () => await getTicket());
};

const getTicket = async () => {
  const ticketButton = $(".card-body.text-center").find("button");
  const tickets = Number(ticketButton.text().split(" ")[1]);
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
};
