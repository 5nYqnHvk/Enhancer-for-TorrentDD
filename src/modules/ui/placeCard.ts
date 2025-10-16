import { animateValue } from "../../utils/effect";
import { createLogger } from "../../utils/logger";

const logger = createLogger("PlaceCard");

let statusBet: HTMLElement;
let statusNextBet: HTMLElement;
let statusCounter: HTMLElement;
let betNumE: HTMLElement;
let timeBet: HTMLElement;
let betType: HTMLElement;
let betOrder: HTMLElement;
let autoBetButton: HTMLElement;

let placeBetArray: string[] = [];
let counter = 0;
let betNum = 0;
let placeBetTime = new Date();
let nextPlaceBetTime: Date = null;
let placeBetIndex = 0;
let placeBetPrice: string = null;

let placeBetTimer: NodeJS.Timeout | null = null;
let isBetting = false;

export const initPlaceCardModule = async () => {
  initCard();
};

const initCard = () => {
  $(".menu").after(
    `<div class="alert alert-light border border-primary mx-auto" style="width:70%;">
            <h4 class="text-center fw400 text-dark mt-4 mb-3">วางไพ่</h4>
            <div class="d-flex justify-content-around">
                <span id="statusBet" class="text-dark">สถานะ: หยุดทำงาน</span><span id="statusNextBet" class="text-dark">เดิมพันครั้งต่อไป: ไม่มีข้อมูล</span><span id="statusCounter" class="text-dark">Counter: 0</span>
            </div>
            <div class="d-flex justify-content-around mt-4">
                <span class="text-dark text-center">จำนวนที่เดิมพัน:<input id ="betNum" class="text-center fw400 text-dark ml-2 col-sm-4" type="number"> ครั้ง</span><span class="text-dark text-center">ช่วงเวลา:<input id="timeBet" class="text-center fw400 text-dark ml-2 col-sm-4" type="number"> วินาที</span>
            </div>
            <div class="text-dark mt-4 text-center">
                <span class="text-dark text-center">เลือกประเภทขาไพ่:</span><select id="betType" class="text-center fw400 text-dark ml-2 col-sm-4">
                <option value="0">ทุกราคาที่เว็บมี</option>
                <option value="1">ขาเล็ก</option>
                <option value="2">ขากลาง</option>
                <option value="3">ขาใหญ่</option>
                <option value="4">Ship 2 ชุด</option>
                <option value="5">Swop mirror</option>
                <option value="6">Swop mirror+Big</option>
                <option value="7">ขาใหญ่+Jam100</option>
                <option value="8">ขาใหญ่+Jam1000</option>
                <option value="9">ขาใหญ่+Jam1000+Jam1000</option>
                </select>
            </div>
            <div class="d-flex mt-3 justify-content-center">
                <textarea id="betOrder" rows="10" cols="50"></textarea>
            </div>
            <div class="d-flex justify-content-center">
                <button id="autoBet" class="btn btn-dark text-center f14 fw300 mt-3">เริ่มเดิมพัน</button>
            </div>
        </div>`
  );

  statusBet = $(".alert #statusBet")[0];
  statusNextBet = $(".alert #statusNextBet")[0];
  statusCounter = $(".alert #statusCounter")[0];
  betNumE = $(".alert #betNum")[0];
  timeBet = $(".alert #timeBet")[0];
  betType = $(".alert #betType")[0];
  betOrder = $(".alert #betOrder")[0];
  autoBetButton = $(".alert #autoBet")[0];

  $(betNumE).val(30);
  $(timeBet).val(2);

  updateBetOrder();
  betType.addEventListener("change", () => updateBetOrder());
  autoBetButton.addEventListener("click", () => startTimer());
};

const updateBetOrder = () => {
  let tempArray: Number[] = [];
  switch ($(betType).val()) {
    case "1": //small
      tempArray = [
        10, 5000, 50, 3000, 100, 2000, 300, 1000, 500, 1000, 2000, 1000, 3000,
        2000, 5000, 10000, 5000, 20000, 3000, 30000, 2000, 50000, 300, 100000,
      ];

      break;
    case "2": //midium
      tempArray = [
        1000, 500000, 2000, 400000, 3000, 300000, 5000, 200000, 10000, 20000,
        100000, 30000, 50000, 100000, 500000, 200000, 300000, 400000, 500000,
      ];
      break;
    case "3": //big
      tempArray = [
        100000, 500000, 200000, 400000, 300000, 400000, 200000, 200000, 500000,
        100000, 500000, 300000, 100000, 500000,
      ];
      break;
    case "4": //ship
      tempArray = [
        100, 300, 100, 500, 300, 1000, 500, 2000, 1000, 3000, 2000, 5000, 3000,
        10000, 5000, 20000, 10000, 30000, 20000, 50000, 30000, 100000, 50000,
        200000, 100000, 300000, 200000, 400000, 300000, 500000, 400000, 100,
        500000,
      ];

      break;
    case "5": //Swop
      tempArray = [
        100, 500000, 300, 400000, 500, 300000, 1000, 200000, 2000, 100000, 3000,
        50000, 5000, 30000, 10000, 20000, 10000, 20000, 5000, 30000, 3000,
        50000, 2000, 100000, 1000, 200000, 500, 300000, 300, 400000, 100,
        500000,
      ];

      break;
    case "6": //Swop+Big
      tempArray = [
        100, 500000, 300, 400000, 500, 300000, 1000, 200000, 2000, 100000, 3000,
        50000, 5000, 30000, 10000, 20000, 500000, 500000, 500000, 500000, 10000,
        20000, 5000, 30000, 500000, 500000, 500000, 500000, 3000, 50000, 2000,
        100000, 1000, 200000, 500, 300000, 300, 400000, 100, 500000,
      ];

      break;
    case "7": //big+jam 100
      tempArray = [
        100000, 500000, 100, 200000, 400000, 100, 300000, 400000, 100, 200000,
        200000, 100, 500000, 100000, 100, 500000, 300000, 100, 100000, 500000,
      ];
      break;
    case "8": //big+jam 1000
      tempArray = [
        100000, 500000, 200000, 400000, 1000, 300000, 400000, 200000, 200000,
        500000, 100000, 500000, 300000, 1000, 100000, 500000,
      ];
      break;
    case "9": //big+jam 1000+ jam 1000
      tempArray = [
        100000, 500000, 1000, 200000, 400000, 1000, 300000, 400000, 1000,
        200000, 200000, 1000, 500000, 100000, 1000, 500000, 300000, 1000,
        100000, 500000,
      ];
      break;

    default: // all web have
      tempArray = [
        10, 50, 100, 300, 500, 1000, 2000, 3000, 5000, 10000, 20000, 30000,
        50000, 100000, 200000, 300000, 400000, 500000,
      ];
      break;
  }
  $(betOrder).val("");

  $.each(tempArray, (index, val) => {
    if (tempArray.length - 1 == index) {
      $(betOrder).val($(betOrder).val() + `${val}`);
    } else {
      $(betOrder).val($(betOrder).val() + `${val}\n`);
    }
  });
};

const loadSetting = () => {
  const tempArr = $(betOrder).val().toString().split("\n");
  placeBetArray = filterAllowedValues(tempArr);
  logger.info(`โหลดข้อมูลราคาที่จะวาง`, placeBetArray);
};

const resetCounter = () => {
  $(statusNextBet).html("เดิมพันครั้งต่อไป: ไม่มีข้อมูล");
  $(statusCounter).html("Counter: 0");
  counter = 0;
  placeBetIndex = 0;
  placeBetPrice = null;
};

const antiAFK = () => {
  if (counter > 1000) {
    stopTimer();
  }
};

const startTimer = () => {
  loadSetting();
  $(autoBetButton).text("หยุดวางไพ่");
  if (placeBetTimer == null) {
    placeBetTimer = setInterval(bet, 100);
  } else {
    stopTimer();
  }
};

const stopTimer = () => {
  resetCounter();
  clearInterval(placeBetTimer);
  placeBetTimer = null;
  $(autoBetButton).text("เริ่มวางไพ่");
  $(statusBet).html("สถานะ: หยุดทำงาน");
};

const bet = async () => {
  antiAFK();
  betNum = Number($(betNumE).val());
  if (counter >= betNum || placeBetArray.length === 0) return stopTimer();

  const now = new Date();
  $(statusBet).html("สถานะ: กำลังทำงาน");
  if (isBetting || (nextPlaceBetTime && now < nextPlaceBetTime)) return;

  isBetting = true;

  nextPlaceBetTime = new Date();
  nextPlaceBetTime.setTime(
    nextPlaceBetTime.getTime() + Number($(timeBet).val()) * 1000
  );

  if (placeBetIndex >= placeBetArray.length) {
    isBetting = false;
    placeBetIndex = 0;
    placeBetPrice = "";
  } else {
    if (placeBetArray.length === 0) return;
    placeBetPrice = placeBetArray[placeBetIndex];
    placeBetIndex++;

    if (placeBetIndex == 1) {
      $(statusNextBet).html(
        `เดิมพันครั้งต่อไป: 1/${placeBetArray.length} AT: ${
          placeBetArray[placeBetIndex - 1]
        }`
      );
    } else {
      $(statusNextBet).html(
        `เดิมพันครั้งต่อไป: ${placeBetIndex}/${placeBetArray.length} AT: ${
          placeBetArray[placeBetIndex - 1]
        }`
      );
    }
  }

  if (placeBetPrice !== "" && typeof placeBetPrice === "string") {
    $(statusCounter).html(`Counter: ${counter}`);

    try {
      const res = await fetch(
        `https://www.torrentdd.com/card_vs_player.php?mod=take-create&bet=${placeBetPrice}`
      );
      const body = await res.text();

      if (body === "success") {
        logger.info(
          `คุณวางไพ่แล้ว ${counter + 1}/${betNum} : ${placeBetPrice} Zen`
        );
        await toastr.success(
          "จำนวนเงินที่วาง " + placeBetPrice + " Zen",
          "คุณวางไพ่แล้ว",
          {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: true,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: 300,
            hideDuration: 1000,
            timeOut: 3000,
            extendedTimeOut: 500,
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
          }
        );

        let money = $("#money").text().replace(/,/g, "");
        const betValue = Number(
          (placeBetPrice ?? "0").toString().replace(/,/g, "")
        );
        animateValue(
          $("#money")[0],
          Number(money),
          Number(money) - betValue,
          500
        );
      } else {
        await toastr.error(
          "อาจเกิดจากปัญหาอินเทอร์เน็ตหรือคุณตั้งให้วางไพ่เร็วเกินไป",
          "คุณวางไม่สำเร็จ!",
          {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: true,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: 300,
            hideDuration: 1000,
            timeOut: 3000,
            extendedTimeOut: 500,
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
          }
        );
      }
    } catch (err) {
      toastr.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", "Error");
      logger.error("เกิดข้อผิดพลาดในการเชื่อมต่อ", err);
    }
    counter++;
  }
  isBetting = false;
};

function filterAllowedValues(arr: string[]): string[] {
  const allowedValues = new Set([
    "10",
    "50",
    "100",
    "300",
    "500",
    "1000",
    "2000",
    "3000",
    "5000",
    "10000",
    "20000",
    "30000",
    "50000",
    "100000",
    "200000",
    "300000",
    "400000",
    "500000",
  ]);
  return arr.filter((item) => allowedValues.has(item));
}
