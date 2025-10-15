import toastr from "toastr";
import { fetchFarmData } from "./data/fetchData";
import { Settings } from "./data/models";

const settingData: Settings = await GM_getValue("settings");

export const initBackground = async () => {
  if (!settingData.farm.notificationFarm) return;
  await farmNotification();
  setInterval(
    async () => await farmNotification(),
    settingData.farm.farmUpdateInterval * 60 * 1000
  );
};

const farmNotification = async () => {
  let farmNotificationDate = await GM_getValue("farmNotificationDate", 0);

  const sound = new Audio(
    `https://static.5ny.site/assets/music/${settingData.others.notificationSound}`
  );
  sound.volume = 0.4;

  const now = new Date();
  const lasted_notification = new Date(
    farmNotificationDate + 1 * 60 * 60 * 1000
  );
  if (now > lasted_notification) {
    const getFarmData = await fetchFarmData(false);
    let ready: number = getFarmData.quantityReady + getFarmData.quantitySpoiled;
    if (ready >= settingData.farm.minPlotReadyForNotification) {
      sound.play();

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
        }
      );

      GM_notification({
        text: `พบพืชที่โตเต็มที่แล้วจำนวน ${ready} ต้น`,
        title: "ถึงเวลาเก็บเกี่ยว!",
        url: "https://www.torrentdd.com/farm.php",
      });

      GM_setValue("farmNotificationDate", Date.now());
      farmNotificationDate = GM_getValue("farmNotificationDate");
    }
  }
};
