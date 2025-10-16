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
  if (ticketButton[0].disabled === true) {
    ticketButton.html("คุณได้รับตั๋วสุ่มกาชาไปแล้ว");
    ticketButton.removeClass("btn-success");
    ticketButton.addClass("btn-danger");
  }

  ticketButton.removeClass("get-ticket");
  ticketButton[0].addEventListener("click", async () => await getTicket());
};

const getTicket = async () => {
  const ticketButton = $(".card-body.text-center").find("button");
  const ticket = await fetch("ticket.php?mod=get-ticket");
  const ticketBody = await ticket.text();
  switch (ticketBody) {
    case "success":
      await Swal.fire(
        "Good job!",
        'รับ <i class="fal fa-tag fa-md mr-1"></i>รับตั๋วสุ่มกาชา เรียบร้อยแล้ว!',
        "warning"
      );
      ticketButton[0].disabled = true;
      await GM_setValue("ticketNotificationDate", Date.now());
      break;
    case "error-1":
      await Swal.fire(
        "Error!",
        "คุณจะต้องปล่อยไฟล์ 5 ไฟล์ขึ้นไป และ Connect มากว่า 3 ชั่วโมง",
        "error"
      );
      ticketButton[0].disabled = true;
      break;
    case "error-2":
      await Swal.fire(
        "Error!",
        "คุณรับตั๋วสุ่มกาชาไปแล้ว กรุณารับในรอบถัดไปค่ะ",
        "error"
      );
      ticketButton[0].disabled = true;
      break;
    case "error-3":
      await Swal.fire(
        "Error!",
        "การรับตั๋วสุ่มกาชา จะต้องห่างกันอย่างน้อย 3 ชั่วโมง",
        "error"
      );
      ticketButton[0].disabled = true;
      break;
  }
};
