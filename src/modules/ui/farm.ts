import toastr from "toastr";
import { fetchFarmData } from "../data/fetchData";
import { FarmData, Settings } from "../data/models";
import { createLogger } from "../../utils/logger";

const logger = createLogger("Farm");
const settingData: Settings = await GM_getValue("settings");

let farmData: FarmData;
let buyAllBtn: JQuery<HTMLElement>;
let harvestAllBtn: JQuery<HTMLElement>;

export const initFarmModule = async () => {
  if (!settingData.farm.enabledFarmModule) return;
  initFarmButton();
  await updateFarm();
};

const initFarmButton = async () => {
  const card = $(".card-body").first();

  const buttonGroup = $(
    "<div class='d-flex justify-content-center w-50 mx-auto' />"
  );

  buyAllBtn = $(
    "<button class='btn btn-danger m-2'>ซื้อเมล็ดพันธุ์ทั้งหมด</button>"
  );
  harvestAllBtn = $(
    "<button class='btn btn-danger m-2'>เก็บพืชทั้งหมด</button>"
  );

  buttonGroup.append(buyAllBtn, harvestAllBtn);
  card.prepend(buttonGroup);

  buyAllBtn.on("click", () => placeSeedAll());
  harvestAllBtn.on("click", () => gatherPlantAll());
};

export const updateFarmButtons = () => {
  if (!farmData) return;

  // ซื้อเมล็ดพันธุ์
  if (farmData.quantityEmpty > 0) {
    buyAllBtn
      .prop("disabled", false)
      .removeClass("btn-danger")
      .addClass("btn-success");
  } else {
    buyAllBtn
      .prop("disabled", true)
      .removeClass("btn-success")
      .addClass("btn-danger");
  }

  // เก็บพืช
  if (farmData.quantityReady > 0 || farmData.quantitySpoiled > 0) {
    harvestAllBtn
      .prop("disabled", false)
      .removeClass("btn-danger")
      .addClass("btn-success");
  } else {
    harvestAllBtn
      .prop("disabled", true)
      .removeClass("btn-success")
      .addClass("btn-danger");
  }
};

const placeSeed = async (plotId: number) => {
  try {
    const place = await fetch(
      `https://www.torrentdd.com/farm.php?action=seed&ground=${plotId}`
    );
    if (place.status === 200) {
      logger.info(`ปลูกพืชบนที่ดิน ${plotId} สำเร็จ`);
      toastr.success(`ปลูกพืชบนที่ดิน ${plotId} สำเร็จ`, "Farm Module!", {
        closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: "toast-top-right",
        preventDuplicates: false,
        showDuration: 300,
        hideDuration: 300,
        timeOut: 2000,
        extendedTimeOut: 500,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      });
    } else {
      logger.error(`ปลูกพืชบนที่ดิน ${plotId} ไม่สำเร็จ`);
      toastr.error(`ปลูกพืชบนที่ดิน ${plotId} ไม่สำเร็จ`, "Farm Module!", {
        closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: "toast-top-right",
        preventDuplicates: false,
        showDuration: 300,
        hideDuration: 300,
        timeOut: 2000,
        extendedTimeOut: 500,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      });
    }

    await updateFarm();
  } catch (err) {
    toastr.error(`ปลูกพืชไม่สำเร็จกรุณาลองใหม่อีกครั้ง`, "Farm Module!", {
      closeButton: false,
      debug: false,
      newestOnTop: false,
      progressBar: true,
      positionClass: "toast-top-right",
      preventDuplicates: false,
      showDuration: 300,
      hideDuration: 300,
      timeOut: 2000,
      extendedTimeOut: 500,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    });
    throw logger.error("ปลูกพืชไม่สำเร็จกรุณาลองใหม่อีกครั้ง");
  }
};
const placeSeedAll = async () => {
  farmData.plots
    .filter((plot) => plot.status === "empty")
    .forEach((plot) => {
      setTimeout(
        async () => await placeSeed(plot.id),
        Math.floor(Math.random() * 5) * 500
      );
    });
};

const gatherPlant = async (plotId: number) => {
  try {
    const place = await fetch(
      `https://www.torrentdd.com/farm.php?action=store&ground=${plotId}`
    );
    if (place.status === 200) {
      logger.info(`เก็บพืชบนที่ดิน ${plotId} สำเร็จ`);
      toastr.success(`เก็บพืชบนที่ดิน ${plotId} สำเร็จ`, "Farm Module!", {
        closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: "toast-top-right",
        preventDuplicates: false,
        showDuration: 300,
        hideDuration: 300,
        timeOut: 2000,
        extendedTimeOut: 500,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      });
    } else {
      logger.info(`เก็บพืชบนที่ดิน ${plotId} ไม่สำเร็จ`);
      toastr.error(`เก็บพืชบนที่ดิน ${plotId} ไม่สำเร็จ`, "Farm Module!", {
        closeButton: false,
        debug: false,
        newestOnTop: false,
        progressBar: true,
        positionClass: "toast-top-right",
        preventDuplicates: false,
        showDuration: 300,
        hideDuration: 300,
        timeOut: 2000,
        extendedTimeOut: 500,
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut",
      });
    }

    await updateFarm();
  } catch (err) {
    toastr.error(`เก็บพืชไม่สำเร็จกรุณาลองใหม่อีกครั้ง`, "Farm Module!", {
      closeButton: false,
      debug: false,
      newestOnTop: false,
      progressBar: true,
      positionClass: "toast-top-right",
      preventDuplicates: false,
      showDuration: 300,
      hideDuration: 300,
      timeOut: 2000,
      extendedTimeOut: 500,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    });
    throw logger.error("เก็บพืชไม่สำเร็จกรุณาลองใหม่อีกครั้ง");
  }
};
const gatherPlantAll = async () => {
  farmData.plots
    .filter((plot) => plot.status === "ready" || plot.status === "spoiled")
    .forEach((plot) => {
      setTimeout(
        async () => await gatherPlant(plot.id),
        Math.floor(Math.random() * 5) * 500
      );
    });
};

const updateFarm = async () => {
  try {
    farmData = await fetchFarmData(true);
    updateFarmButtons();

    const dom = new DOMParser();
    const parser = dom.parseFromString(farmData.resText, "text/html");

    [
      { selector: "button", index: 5 },
      { selector: "a", index: 3 },
    ].forEach(({ selector, index }) => {
      $(parser)
        .find(".offset-lg-3.col-lg-6 .row.bg-farm")
        .find(selector)
        .each((_i, el: HTMLElement) => {
          const onclick = $(el).attr("onclick");
          if (!onclick) return;

          const plotId = Number(onclick.split("=")[index]?.[0]);
          $(el).attr("id", String(plotId)).removeAttr("onclick");
        });
    });

    // update farm
    $(".offset-lg-3.col-lg-6").html(
      $(parser).find(".offset-lg-3.col-lg-6").html()
    );

    $(".offset-lg-3.col-lg-6")
      .find(".f10")
      .each((_i, el) => startFarmTimer(el));

    // update button
    ["button", "a"].forEach((tag) => {
      const handler =
        tag === "button" ? placeSeed.bind(this) : gatherPlant.bind(this);
      // onclick
      $(".offset-lg-3.col-lg-6 .row.bg-farm")
        .find(tag)
        .each((_index, el: HTMLElement) => {
          const plotId = Number($(el).attr("id"));
          $(el).on("click", () => handler(plotId));
        });
    });
  } catch (err) {
    toastr.error(`อัปเดตฟาร์มไม่สำเร็จ`, "Farm Module", {
      closeButton: false,
      debug: false,
      newestOnTop: false,
      progressBar: true,
      positionClass: "toast-top-right",
      preventDuplicates: false,
      showDuration: 300,
      hideDuration: 300,
      timeOut: 2000,
      extendedTimeOut: 500,
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    });
    throw logger.error("อัปเดตฟาร์มไม่สำเร็จ");
  }
};

const startFarmTimer = (selector: HTMLElement) => {
  const el = $(selector);
  if (!el.length) return;

  // ดึงข้อความปัจจุบัน เช่น "(0 วัน) 00:07:44"
  const text = el.text().trim();

  // ดึงจำนวนวัน
  const dayMatch = text.match(/\((\d+)\s*วัน\)/);
  const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;

  // ดึงเวลา hh:mm:ss
  const timeMatch = text.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (!timeMatch) return;

  let hours = parseInt(timeMatch[1]);
  let minutes = parseInt(timeMatch[2]);
  let seconds = parseInt(timeMatch[3]);

  // คำนวณเป็นวินาทีทั้งหมด
  let totalSeconds = days * 86400 + hours * 3600 + minutes * 60 + seconds;

  // ตั้ง interval เดินเวลา
  setInterval(() => {
    totalSeconds++;

    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    el.text(
      `(${d} วัน) ${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    );
  }, 1000);
};
