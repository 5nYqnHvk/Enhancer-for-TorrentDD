import { createLogger } from "../../utils/logger";
import {
  FarmStatus,
  FarmPlot,
  FarmData,
  UserData,
  Settings,
  TicketData,
} from "./models";

export const fetchUserData = async (): Promise<UserData> => {
  const logger = createLogger("User");

  try {
    const username = $("div.profile-name")
      .find(".d-flex.align-items-center.justify-content-center a.fw400")
      .text()
      .replace(/[\n\t\ ]/g, "");
    const userId = Number(
      $("a[href^='mypeers.php?userid=']")
        .attr("href")
        .replace("mypeers.php?userid=", "")
    );
    const userClassId = getUserClassId();
    const isPremium = true;

    return {
      userId: userId,
      username: username,
      classId: userClassId,
      isPremium: isPremium,
    };
  } catch (err) {
    throw logger.error("ดึงข้อมูลผู้ใช้งานไม่สำเร็จ", err);
  }
};

const getUserClassId = (): number => {
  const userClassId = $("div.profile-name")
    .find(".d-flex.align-items-center.justify-content-center a.fw400")
    .attr("class")
    .split(/\s+/)[0];
  const className = [
    "text-user",
    "text-rookie",
    "text-beginner",
    "text-junior",
    "text-senior",
    "text-amateur",
    "text-semipro",
    "text-pro",
    "text-worldpro",
    "text-colo",
    "text-vip",
    "text-dj",
    "text-rainbow",
    "text-moderator",
    "text-administrator",
    "text-sysop",
  ];

  return className.indexOf(userClassId);
};

export const fetchFarmData = async (getResText: boolean): Promise<FarmData> => {
  const logger = createLogger("Farm");
  try {
    const farm = await fetch("https://www.torrentdd.com/farm.php");
    const farmBody = await farm.text();

    const dom = new DOMParser();
    const parser = dom.parseFromString(farmBody, "text/html");

    const plots = $(parser).find(".offset-lg-3.col-lg-6 .row.bg-farm > .col-4");

    let plotsData: FarmPlot[] = [];
    let ready: number = 0;
    let pending: number = 0;
    let spoiled: number = 0;
    let empty: number = 0;

    plots.each((index, plot) => {
      const box = $(plot).find(".box-text");
      const aTag = box.find("a");
      const imgTag = box.find("img").last();
      const timeDiv = box.find(".f10");
      const button = box.find("button");

      // check plot is empty
      if (button.length > 0) {
        plotsData.push({
          id: index + 1,
          harvestTime: -1,
          status: "empty",
        });
        empty++;
        return;
      }

      let plotId: number;
      let plotStatus: FarmStatus;

      // get plot id
      if (aTag.length > 0) {
        const onclick = aTag.attr("onclick");
        const match = onclick.match(/ground=(\d+)/);
        if (match) plotId = Number(match[1]);
      } else {
        plotId = index + 1;
      }

      // get plot status
      const src = imgTag.attr("src");
      if (
        src.includes("90") ||
        src.includes("70") ||
        src.includes("50") ||
        src.includes("lv1") ||
        src.includes("lv2")
      ) {
        plotStatus = "pending";
        pending++;
      } else if (src.includes("lv3")) {
        plotStatus = "ready";
        ready++;
      } else {
        plotStatus = "spoiled";
        spoiled++;
      }

      // get plot timestamp
      const timestamp = parseFarmTime(timeDiv.text());

      plotsData.push({
        id: plotId,
        harvestTime: timestamp,
        status: plotStatus,
      });
    });

    let responseData;
    if (getResText) {
      responseData = {
        plots: plotsData,
        quantityReady: ready,
        quantityPending: pending,
        quantitySpoiled: spoiled,
        quantityEmpty: empty,
        resText: farmBody,
      };
    } else {
      responseData = {
        plots: plotsData,
        quantityReady: ready,
        quantityPending: pending,
        quantitySpoiled: spoiled,
        quantityEmpty: empty,
      };
    }
    return responseData;
  } catch (err) {
    throw logger.error("ดึงข้อมูลฟาร์มไม่สำเร็จ");
  }
};

function parseFarmTime(str: string, fromNow = true): number {
  const dayMatch = str.match(/\((\d+)\s*วัน\)/);
  const days = dayMatch ? parseInt(dayMatch[1], 10) : 0;

  const timeMatch = str.match(/(\d+):(\d+):(\d+)/);
  const hours = timeMatch ? parseInt(timeMatch[1], 10) : 0;
  const minutes = timeMatch ? parseInt(timeMatch[2], 10) : 0;
  const seconds = timeMatch ? parseInt(timeMatch[3], 10) : 0;

  const totalMs = (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000;

  return (fromNow ? Date.now() : 0) + totalMs;
}

export const fetchTicketData = async (): Promise<TicketData> => {
  const ticket = await fetch("https://www.torrentdd.com/ticket.php");
  const ticketBody = await ticket.text();

  const dom = new DOMParser();
  const parser = dom.parseFromString(ticketBody, "text/html");
  const ticketButton = $(parser).find(".card-body.text-center").find("button");
  const tickets = Number(ticketButton.text().split(" ")[1]);

  return {
    ready: tickets > 0 ? true : false,
    quantityReady: tickets,
  };
};

const defaultSettingData: Settings = {
  torrent: {
    enabledTorrentModule: true,
    showTorrentImage: true,
    showDownloadButton: false,
    showRateButton: false,
    updatePeerslist: true,
  },
  farm: {
    enabledFarmModule: true,
    autoFarm: false,
    notificationFarm: true,
    farmUpdateInterval: 10,
    minPlotReadyForNotification: 1,
  },
  gasha: {
    enabledGashaModule: true,
    saveGashaLog: true,
    showGashaLog: true,
  },
  ticket: {
    enabledTicketModule: true,
    autoTicket: false,
    notificationTicket: true,
    ticketUpdateInterval: 10,
    minTicketReadyForNotification: 1,
  },
  betcard: {
    enabledBetCardModule: true,
    enabledPlaceCardModule: true,
  },
  others: {
    notificationSound: "noti.mp3",
  },
};

export const fetctSettingData = async () => {
  const data = await GM_getValue("settings", defaultSettingData);
  const fixedData = mergeWithDefault(data, defaultSettingData);
  await GM_setValue("settings", fixedData);
  return fixedData;
};

function mergeWithDefault<T>(data: any, defaults: T): T {
  if (typeof defaults !== "object" || defaults === null) {
    return typeof data === typeof defaults ? data : (defaults as T);
  }

  const result: any = Array.isArray(defaults) ? [] : {};

  for (const key of Object.keys(defaults)) {
    const defVal = (defaults as any)[key];
    const userVal = data ? (data as any)[key] : undefined;

    if (userVal === undefined) {
      result[key] = defVal;
    } else if (typeof defVal === "object" && defVal !== null) {
      result[key] = mergeWithDefault(userVal, defVal);
    } else if (typeof userVal === typeof defVal) {
      result[key] = userVal;
    } else {
      result[key] = defVal;
    }
  }

  return result as T;
}
