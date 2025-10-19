import { animateValue } from "../../utils/effect";
import { getLocation } from "../../utils/hook";
import { createLogger } from "../../utils/logger";
import swal from "sweetalert2";
import { GashaData } from "../data/models";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Gasha");
const settingData = await fetctSettingData();

let buttonSpin: JQuery<HTMLElement>;
let buttonSpinSkip: JQuery<HTMLElement>;
let buttonSpinTest: JQuery<HTMLElement>;
let buttonSpinTestSkip: JQuery<HTMLElement>;

let gashaHistoryData: GashaData[] = [];
export const initGashaModule = async () => {
  if (!settingData.gasha.enabledGashaModule) return;
  initGashaButton();
  if (!settingData.gasha.showGashaLog) return;
  initGashaLog();
};

const initGashaLog = async () => {
  const newCard = $(".card").last().after(`
        <div class="card mt-3"><div class="card-body">
            <h5>ประวัติการสุ่มกาชา</h5>
            <h5 class="mb-2 text-youtube">*ตารางข้างล่างนี้สร้างโดย Enhancer for TorrentDD</h5>
            <div class="row table-responsive">
                <div class="col-lg-8 offset-lg-2">
                    <table class="border border-dark table table-borderless table-hover table-striped">
                        <thead class="thead-dark">
                            <tr class="text-center">
                                <th scope="col">#</th>
                                <th scope="col">ได้รับ</th>
                                <th scope="col">รูป</th>
                                <th scope="col">วันเวลา</th>
                            </tr>
                        </thead>
                        <tbody>
                        <!-- Insert gashaData here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `);
  const tbody = $("table").find("tbody")[0];

  gashaHistoryData = (await getGashaData())
    .filter((data) => data.type === getGashaType())
    .sort((a, b) => b.date - a.date);

  let id = gashaHistoryData.length + 1;
  gashaHistoryData.forEach((data: any) => {
    id--;
    const tr = tbody.insertRow();
    tr.className = "text-center";
    const td1 = tr.insertCell();
    const td_id = document.createTextNode(id.toString());
    td1.appendChild(td_id);
    const td2 = tr.insertCell();
    const td_reward = document.createTextNode(data.txt);
    td2.appendChild(td_reward);
    const td3 = tr.insertCell();
    td3.width = "150";
    const td_img = document.createElement("img");
    td_img.src = "https://www.torrentdd.com/images/pets/" + data.img;
    td3.appendChild(td_img);
    const td4 = tr.insertCell();
    const td_date = document.createTextNode(
      new Date(data.date).toLocaleString("th")
    );
    td4.appendChild(td_date);
  });
};

const initGashaButton = () => {
  $(".text-center.mt-3.f12").next().html(null);

  const buttonGroup = $(".text-center.mt-3.f12").next();

  buttonSpin = $(
    `<button class="btn btn-info btn-spin ml-1 mr-1"><i class='far fa-sync-alt'></i>Spin</button>`
  );
  buttonSpinSkip = $(
    `<button class="btn btn-warning btn-spin ml-1 mr-1"><i class='far fa-sync-alt'></i>Spin Skip</button>`
  );
  buttonSpinTest = $(
    `<button class="btn btn-success btn-spin ml-1 mr-1"><i class='far fa-sync-alt'></i>ทดสอบ</button>`
  );
  buttonSpinTestSkip = $(
    `<button class="btn btn-warning btn-spin ml-1 mr-1"><i class='far fa-sync-alt'></i>ทดสอบ Skip</button>`
  );

  buttonGroup.append(
    buttonSpin,
    buttonSpinSkip,
    buttonSpinTest,
    buttonSpinTestSkip
  );

  buttonSpin.on("click", () => spinBtn(""));
  buttonSpinSkip.on("click", () => spinBtn("", true));
  buttonSpinTest.on("click", () => spinBtn("test"));
  buttonSpinTestSkip.on("click", () => spinBtn("test", true));
};

const toggleButtons = (state: boolean) => {
  if (state) {
    buttonSpin.prop("disabled", true);
    buttonSpinSkip.prop("disabled", true);
    buttonSpinTest.prop("disabled", true);
    buttonSpinTestSkip.prop("disabled", true);
  } else {
    buttonSpin.prop("disabled", false);
    buttonSpinSkip.prop("disabled", false);
    buttonSpinTest.prop("disabled", false);
    buttonSpinTestSkip.prop("disabled", false);
  }
};

const spinBtn = (test = "", skip = false) => {
  try {
    toggleButtons(true);

    if (parseInt($(".gashabox").css("margin-left")) != 0) {
      try {
        unsafeWindow.getCard?.(); // ป้องกัน error ถ้าไม่มีฟังก์ชัน
      } catch (err) {
        logger.error("Error calling getCard", err);
      }
    }

    setTimeout(async () => {
      try {
        const gasha = await fetch(
          `${getLocation().pathname}?action=spin&test=${test}`
        );
        const gashaData = await gasha.json();

        if (gashaData.message === "low-coin") {
          logger.error("คุณมี Coin ไม่พอที่จะหมุนกาชา!");
          await swal.fire(
            "คุณมี Coin ไม่พอ!",
            "กรุณาตรวจสอบด้วยค่ะ",
            "warning"
          );
          toggleButtons(false);
          return;
        }

        if (gashaData.message === "low-ticket") {
          logger.error("คุณมี Ticket ไม่พอที่จะหมุนกาชา!");
          await swal.fire(
            "คุณมี Ticket ไม่พอ!",
            "กรุณาตรวจสอบด้วยค่ะ",
            "warning"
          );
          toggleButtons(false);
          return;
        }

        if (gashaData.code === 0) {
          // --- อัปเดตกล่องกาชา ---
          $(".gashabox .box:nth-child(34)").html(`
            <div class='b1'><img src='images/pets/${gashaData.img}'></div>
            <div class='b2 ${gashaData.bg}'>${gashaData.txt}</div>
          `);

          // --- เล่นเสียง ---
          if (skip) {
            try {
              const sound = new Audio("images/sound/end-reveal.wav");
              sound.volume = 0.2;
              sound.play();
            } catch (err) {
              logger.error("ไม่สามารถเล่นเสียงได้!", err);
            }
          }

          // --- อัปเดต coin/ticket ---
          if (gashaData.coinUpdate === true) {
            let coin = $("#coin").text().replace(/,/g, "");
            animateValue($("#coin")[0], Number(coin), Number(coin) - 50, 500);
            logger.info(`อัปเดท Coin ${coin} - 50 = ${Number(coin) - 50}`);
          } else if (gashaData.ticketUpdate === true) {
            let ticket = $("#ticket").text().replace(/,/g, "");
            animateValue(
              $("#ticket")[0],
              Number(ticket),
              Number(ticket) - 10,
              500
            );
            logger.info(
              `อัปเดท Ticket ${ticket} - 10 = ${Number(ticket) - 10}`
            );
          }

          // --- spin animation ---
          if (!skip) {
            try {
              unsafeWindow.spin?.(); // ป้องกัน error ถ้า spin ไม่มี
              if (test === "") {
                logger.info(`คุณหมุนการชาได้รับ ${gashaData.txt}!`);
              } else {
                logger.info(`คุณทดสอบหมุนกาชาได้รับ ${gashaData.txt}!`);
              }
            } catch (err) {
              logger.error(`Error calling spin()`, err);
              toggleButtons(false);
            }
          } else {
            setTimeout(() => {
              swal.fire({
                title: "สิ่งที่คุณได้รับ",
                text: gashaData.txt,
                imageUrl: `images/pets/${gashaData.img}`,
              });
              toggleButtons(false);
              $.get("nodejs/send-emit.php");
            }, 300);
            if (test === "") {
              logger.info(`คุณหมุนการชาได้รับ ${gashaData.txt}!`);
            } else {
              logger.info(`คุณทดสอบหมุนกาชาได้รับ ${gashaData.txt}!`);
            }
          }

          if (test === "") {
            if (settingData.gasha.saveGashaLog) saveGashaData(gashaData);
          }
        }
      } catch (err) {
        logger.error("Error in spinBtn", err);
        toggleButtons(false);
        swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถหมุนกาชาได้", "error");
      }
    }, 500);
  } catch (err) {
    logger.error("Error in spinBtn", err);
    toggleButtons(false);
    swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถเริ่มการหมุนได้", "error");
  }
};

const getGashaData = async (): Promise<GashaData[]> => {
  const gashaData = await GM_getValue<GashaData[]>("gashaData", []);
  return gashaData;
};

const saveGashaData = async (gashaData: any) => {
  const newData: GashaData = {
    type: getGashaType(),
    img: gashaData.img,
    txt: gashaData.txt,
    date: Date.now(),
  };

  const updateGashaData: GashaData[] = await GM_getValue<GashaData[]>(
    "gashaData",
    []
  );
  updateGashaData.push(newData);
  GM_setValue("gashaData", updateGashaData);
};

const getGashaType = () => {
  const path = getLocation().pathname;
  let type: GashaData["type"];

  switch (path) {
    case "/gashapon.php":
      type = "C";
      break;
    case "/ticket-gashapon1.php":
      type = "G1";
      break;
    case "/ticket-gashapon2.php":
      type = "G2";
      break;
    default:
      console.warn("Unknown gasha path:", path);
      return; // skip saving if path unknown
  }

  return type;
};
