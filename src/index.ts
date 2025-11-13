import { initBackground } from "./modules/background";
import { fetchUserData } from "./modules/data/fetchData";
import { initRoutes } from "./modules/routes";
import { initSettingModule } from "./modules/ui/settings";
import { createLogger } from "./utils/logger";
import toastr from "toastr";

(async function () {
  const logger = createLogger("Main");
  logger.info("TorrentDD Enhancer loaded");
  // add toastr
  GM_addElement("link", {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css",
  });
  GM_addElement("script", {
    src: "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js",
  });
  GM_addElement("style", {
    textContent: `.toast{background-color:#3a3f51}.toast-success{background-color:#03c393}.toast-error{background-color:#fb9678}.toast-info{background-color:#ab8ce4}.toast-warning{background-color:#ffb463}#toast-container>div{padding:10px 10px 10px 50px;opacity:1;-ms-filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=100);filter:alpha(opacity=100)}.menu .active:before{font-family:'Font Awesome 5 Pro';content:"\f058";margin-right:3px}.menu .active,a.btn:hover{color:#fff!important}.cardx{width:56px;height:77px;border-radius:7px;display:inline-block;padding:3px;background-color:#fff;position:relative;box-shadow:rgb(0 0 0 / .16) 0 10px 36px 0,rgb(0 0 0 / .06) 0 0 0 1px}.cardx .number{font-family:'Prompt'!important;font-size:22pt;line-height:22pt;text-align:left}.cardx .suit{font-family:'Prompt'!important;font-size:40pt;line-height:40pt;text-align:center;position:absolute;bottom:0;right:5px;padding:0}.cardx.black{color:#19171C}.cardx.red{color:#BD0926}.process{bottom:-10px}`,
  });
  const userInfo = await fetchUserData();
  logger.info(`-------- User Detail --------`);
  logger.info(`Id: ${userInfo.userId}`);
  logger.info(`Username: ${userInfo.username}`);
  logger.info(
    `ClassId: ${userInfo.classId !== 99 ? userInfo.classId : "Not Found"}`,
  );
  logger.info(`Premium: ${userInfo.isPremium}`);
  logger.info(`------------------------------------`);

  const version = GM_info.script.version;
  fetch(`https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/index.user.js?r=${Date.now()}`)
    .then(async (res) => await res.text())
    .then((txt) => {
      const versionMtch = txt.match(/\/\/ @version\s+(\d+\.\d+\.\d+)/);
      if (versionMtch && versionMtch.length > 1) {
        if (version != versionMtch[1]) {
          logger.info(`ตรวจพบสคริปเวอร์ชันใหม่: ${versionMtch[1]}`);
          toastr.info(
            `เวอร์ชันใหม่: ${versionMtch[1]}<br>เวอร์ชันปัจจุบัน: ${version}`,
            "ตรวจพบสคริปเวอร์ชันใหม่!",
            {
              closeButton: false,
              debug: false,
              newestOnTop: false,
              progressBar: true,
              positionClass: "toast-top-right",
              preventDuplicates: false,
              onclick: () => {
                window.open(
                  "https://raw.githubusercontent.com/5nyqnhvk/Enhancer-for-TorrentDD/main/index.user.js",
                );
              },
              showDuration: 300,
              hideDuration: 300,
              timeOut: 2000,
              extendedTimeOut: 500,
              showEasing: "swing",
              hideEasing: "linear",
              showMethod: "fadeIn",
              hideMethod: "fadeOut",
            },
          );
        }
      }
    });

  await initSettingModule();
  await initBackground();
  await initRoutes();
})();
