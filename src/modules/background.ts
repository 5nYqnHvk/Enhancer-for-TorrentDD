import toastr from "toastr";
import {
  fetchFarmData,
  fetchTicketData,
  fetctSettingData,
} from "./data/fetchData";

const settingData = await fetctSettingData();

export const initBackground = async () => {
  if (!settingData.farm.notificationFarm) return;
  await farmNotification();
  setInterval(
    async () => await farmNotification(),
    settingData.farm.farmUpdateInterval * 60 * 1000,
  );

  if (!settingData.ticket.notificationTicket) return;
  await ticketNotification();
  setInterval(
    async () => await ticketNotification(),
    settingData.ticket.ticketUpdateInterval * 60 * 1000,
  );
};

const farmNotification = async () => {
  let farmNotificationDate = await GM_getValue("farmNotificationDate", 0);

  const sound = new Audio(
    `https://static.5ny.site/assets/music/${settingData.others.notificationSound}`,
  );
  sound.volume = 0.4;

  const now = new Date();
  const lasted_notification = new Date(
    farmNotificationDate + 1 * 60 * 60 * 1000,
  );
  if (now > lasted_notification) {
    const getFarmData = await fetchFarmData(false);
    let ready: number = getFarmData.quantityReady + getFarmData.quantitySpoiled;
    if (ready >= settingData.farm.minPlotReadyForNotification) {
      await sound.play();

      toastr.info(
        `พบพืชที่โตเต็มที่แล้วจำนวน ${ready} ต้น`,
        "ถึงเวลาเก็บเกี่ยว!",
        {
          closeButton: false,
          debug: false,
          newestOnTop: false,
          progressBar: true,
          positionClass: "toast-top-right",
          preventDuplicates: false,
          onclick: () => {
            window.location.href = "farm.php";
          },
          showDuration: 300,
          hideDuration: 300,
          timeOut: 100000,
          extendedTimeOut: 500,
          showEasing: "swing",
          hideEasing: "linear",
          showMethod: "fadeIn",
          hideMethod: "fadeOut",
        },
      );

      GM_notification({
        text: `พบพืชที่โตเต็มที่แล้วจำนวน ${ready} ต้น`,
        title: "ถึงเวลาเก็บเกี่ยว!",
        url: "https://www.torrentdd.com/farm.php",
      });

      GM_setValue("farmNotificationDate", Date.now());
    }
  }
};

const ticketNotification = async () => {
  let ticketNotificationDate = await GM_getValue("ticketNotificationDate", 0);

  const sound = new Audio(
    `https://static.5ny.site/assets/music/${settingData.others.notificationSound}`,
  );
  sound.volume = 0.4;

  const now = new Date();
  const lasted_notification = new Date(
    ticketNotificationDate + 1 * 60 * 60 * 1000,
  );
  if (now > lasted_notification) {
    const getTicketData = await fetchTicketData();
    let ready = getTicketData.ready;
    let tickets = getTicketData.quantityReady;
    if (ready && tickets >= settingData.ticket.minTicketReadyForNotification) {
      await sound.play();

      toastr.info(
        `คุณได้รับตั๋วจำนวน ${tickets} ชิ้น`,
        "ถึงเวลาเก็บตั๋วแล้ว!",
        {
          closeButton: false,
          debug: false,
          newestOnTop: false,
          progressBar: true,
          positionClass: "toast-top-right",
          preventDuplicates: false,
          onclick: () => {
            window.location.href = "ticket.php";
          },
          showDuration: 300,
          hideDuration: 300,
          timeOut: 100000,
          extendedTimeOut: 500,
          showEasing: "swing",
          hideEasing: "linear",
          showMethod: "fadeIn",
          hideMethod: "fadeOut",
        },
      );

      GM_notification({
        text: `คุณได้รับตั๋วจำนวน ${tickets} ชิ้น`,
        title: "ถึงเวลาเก็บตั๋วแล้ว!",
        url: "https://www.torrentdd.com/ticket.php",
      });

      GM_setValue("ticketNotificationDate", Date.now());
    }
  }
};
