import { createLogger } from "../../utils/logger";
import {
  FarmStatus,
  FarmPlot,
  FarmData,
  UserData,
  Settings,
  TicketData,
  ProfileData,
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
        .replace("mypeers.php?userid=", ""),
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
    logger.error("ดึงข้อมูลผู้ใช้งานไม่สำเร็จ", err);
    throw err;
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

export const fetchProfileData = async (): Promise<ProfileData> => {
  const userId = Number(
    $("a[href^='mypeers.php?userid=']").attr("href")?.replace("mypeers.php?userid=", "")
  );
  const res = await fetch(`https://www.torrentdd.com/userdetails.php?id=${userId}`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const $doc = $(doc);

  const td = (label: string) =>
    $doc.find("td").filter((_, el) => $(el).text().trim().replace(/\s+/g, " ") === label).first().next("td").text().trim();

  const parseGB = (text: string) => {
    const m = text.match(/([\d.]+)\s*(TB|GB)/i);
    if (!m) return 0;
    return m[2].toUpperCase() === "TB" ? parseFloat(m[1]) * 1024 : parseFloat(m[1]);
  };

  const joinText = td("Join date") || td("Join date");
  const weeksMatch = joinText.match(/\((\d+)\s*weeks?\s*ago\)/);
  const dateStr = joinText.split(" ")[0];
  const weeksJoined = weeksMatch
    ? parseInt(weeksMatch[1])
    : /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? Math.floor((Date.now() - new Date(dateStr).getTime()) / (7 * 86400000))
      : 0;

  return {
    realUploadGB: parseGB(td("Real Upload")),
    fileUpload: parseInt(td("File Upload")) || 0,
    ratio: parseFloat(td("Share ratio")) || 0,
    weeksJoined,
    currentClass: td("Class").trim().toLowerCase(),
  };
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
    logger.error("ดึงข้อมูลฟาร์มไม่สำเร็จ", err);
    throw err;
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
  const $p = $(parser);
  const ticketButton = $p.find(".card-body.text-center").find("button");
  const tickets = Number(ticketButton.text().match(/(\d+)\s*ชิ้น/)?.[1] ?? 0);
  const ready = ticketButton[0].disabled === false && tickets > 0;

  let nextMs = 0;
  if (!ready) {
    const lastTime = $p.find("table tbody tr").not(".table-secondary").first().find("td:eq(2)").text().trim();
    const lastDate = new Date(lastTime.replace(" ", "T"));
    if (!isNaN(lastDate.getTime())) {
      const next = new Date(lastDate);
      if (lastDate.getHours() < 12) {
        next.setHours(12, 0, 0, 0);
      } else {
        next.setDate(lastDate.getDate() + 1);
        next.setHours(0, 0, 0, 0);
      }
      nextMs = Math.max(0, next.getTime() - Date.now());
    }
  }

  return { ready, quantityReady: tickets, nextMs };
};

const defaultSettingData: Settings = {
  torrent: {
    enabledTorrentModule: true,
    showTorrentImage: true,
    showDownloadButton: true,
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
    enabledBoardStats: true,
    enabledCardRealtime: true,
  },
  ebet: {
    enabledEbetModule: true,
    enabledHoverDetails: true,
  },
  bank: {
    enabledBankModule: true,
  },
  chat: {
    enabledChatModule: true,
    enabledIframeBoss: false,
    sortUserOnline: true,
    enabledImagePreview: true,
  },
  others: {
    notificationSound: "noti.mp3",
  },
  home: {
    enabledHomeModule: true,
  },
  ranking: {
    enabledRankingModule: true,
  },
  market: {
    enabledMarketModule: true,
  },
  inbox: {
    enabledInboxModule: true,
  },
  inventory: {
    enabledInventoryModule: true,
  },
  marketplace: {
    enabledMarketplaceModule: true,
  },
};

export const fetctSettingData = async () => {
  const data = GM_getValue("settings", defaultSettingData);
  const fixedData = mergeWithDefault(data, defaultSettingData);
  GM_setValue("settings", fixedData);
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
