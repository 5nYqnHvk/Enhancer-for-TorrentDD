import { createLogger } from "../../utils/logger";
import { fetchFarmData, fetchTicketData, fetchProfileData } from "../data/fetchData";

const logger = createLogger("Home");

export const initHomeModule = async () => {
  const { fetctSettingData } = await import("../data/fetchData");
  const s = await fetctSettingData();
  if (!s.home.enabledHomeModule) return;
  try {
    injectDashboardWidget();
  } catch (err) {
    logger.error("initHomeModule failed", err);
  }
};

const fmt = (ms: number) => {
  if (ms <= 0) return "พร้อมแล้ว";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
};

const CLASS_REQS: Record<string, { upload: number; files: number; ratio: number; weeks: number }> = {
  rookie:   { upload: 20,    files: 5,  ratio: 0,    weeks: 1  },
  beginner: { upload: 40,    files: 10, ratio: 1.15, weeks: 2  },
  junior:   { upload: 80,    files: 15, ratio: 1.25, weeks: 3  },
  senior:   { upload: 140,   files: 20, ratio: 1.35, weeks: 4  },
  amateur:  { upload: 200,   files: 25, ratio: 1.45, weeks: 5  },
  semipro:  { upload: 500,   files: 35, ratio: 1.55, weeks: 6  },
  pro:      { upload: 1024,  files: 50, ratio: 2.00, weeks: 8  },
  worldpro: { upload: 10240, files: 70, ratio: 3.00, weeks: 15 },
};
const CLASS_ORDER = ["user", "rookie", "beginner", "junior", "senior", "amateur", "semipro", "pro", "worldpro"];

const buildClassProgress = (profile: Awaited<ReturnType<typeof fetchProfileData>>): string => {
  const { realUploadGB, fileUpload, ratio, weeksJoined, currentClass } = profile;
  const idx = CLASS_ORDER.indexOf(currentClass);
  const nextClass = CLASS_ORDER[idx + 1];
  if (!nextClass || !CLASS_REQS[nextClass]) return "";

  const req = CLASS_REQS[nextClass];
  const fmtUpload = (gb: number) => gb >= 1024 ? (gb / 1024).toFixed(2) + " TB" : gb.toFixed(0) + " GB";
  const bar = (val: number, need: number) => {
    const pct = Math.min(100, Math.round((val / need) * 100));
    const ok = val >= need;
    return `<div class="d-flex align-items-center mb-1" style="gap:6px">
      <div class="flex-grow-1 bg-light rounded" style="height:8px">
        <div class="rounded ${ok ? "bg-success" : "bg-warning"}" style="height:8px;width:${pct}%"></div>
      </div>
      <small style="white-space:nowrap" class="${ok ? "text-success" : "text-warning"}">${ok ? "✓" : pct + "%"}</small>
    </div>`;
  };

  return `<hr class="my-2">
    <small class="text-muted d-block mb-1">Next: <b class="text-${nextClass}">${nextClass.charAt(0).toUpperCase() + nextClass.slice(1)}</b></small>
    <div class="f11">
      <small>Real Upload (${fmtUpload(realUploadGB)} / ${fmtUpload(req.upload)})</small>
      ${bar(realUploadGB, req.upload)}
      <small>File Upload (${fileUpload} / ${req.files})</small>
      ${bar(fileUpload, req.files)}
      ${req.ratio > 0 ? `<small>Ratio (${ratio.toFixed(2)} / ${req.ratio})</small>${bar(ratio, req.ratio)}` : ""}
      <small>Join (${weeksJoined}w / ${req.weeks}w)</small>
      ${bar(weeksJoined, req.weeks)}
    </div>`;
};

const injectDashboardWidget = () => {
  const $widget = $(`<div id="tdd-home-dashboard" class="card mt-3 mb-2">
    <div class="card-header d-flex justify-content-between align-items-center py-2">
      <span><i class="fal fa-tachometer-alt mr-1"></i> TDD Dashboard</span>
      <button id="tdd-home-refresh" class="btn btn-sm btn-outline-secondary py-0">↻</button>
    </div>
    <div class="card-body py-2">
      <div id="tdd-home-content" class="text-muted">กำลังโหลด...</div>
    </div>
  </div>`);

  const $anchor = $(".mb-3 > .row").first().closest(".mb-3");
  if ($anchor.length) {
    $anchor.before($widget);
  } else {
    $(".container, .content-wrapper, #content").first().prepend($widget);
  }

  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let ticketInterval: ReturnType<typeof setInterval> | null = null;

  const load = async () => {
    $("#tdd-home-content").html('<span class="text-muted">กำลังโหลด...</span>');
    if (countdownInterval) { clearInterval(countdownInterval); countdownInterval = null; }
    if (ticketInterval) { clearInterval(ticketInterval); ticketInterval = null; }

    try {
      const [farmData, ticketData, profileData] = await Promise.allSettled([
        fetchFarmData(false),
        fetchTicketData(),
        fetchProfileData(),
      ]);

      const farm = farmData.status === "fulfilled" ? farmData.value : null;
      const ticket = ticketData.status === "fulfilled" ? ticketData.value : null;
      const profile = profileData.status === "fulfilled" ? profileData.value : null;

      let farmHtml = '<span class="text-muted">โหลดฟาร์มไม่สำเร็จ</span>';
      let nextHarvestMs = 0;
      if (farm) {
        const nextPlot = farm.plots
          .filter((p) => p.status === "pending" && p.harvestTime > Date.now())
          .sort((a, b) => a.harvestTime - b.harvestTime)[0];
        nextHarvestMs = nextPlot ? nextPlot.harvestTime - Date.now() : 0;
        farmHtml = `<span class="badge badge-success mr-1">พร้อม ${farm.quantityReady}</span>
          <span class="badge badge-warning mr-1">รอ ${farm.quantityPending}</span>
          <span class="badge badge-danger mr-1">เสีย ${farm.quantitySpoiled}</span>
          <span class="badge badge-primary">ว่าง ${farm.quantityEmpty}</span>`;
      }

      const ticketHtml = ticket
        ? ticket.ready
          ? `<span class="badge badge-success">รับได้ ${ticket.quantityReady} ชิ้น</span>`
          : `<span class="badge badge-primary">ยังไม่ถึงเวลา</span>`
        : '<span class="text-muted">โหลดตั๋วไม่สำเร็จ</span>';

      const nextTicketMs = ticket?.nextMs ?? 0;

      $("#tdd-home-content").html(`
        <div class="row row-sm">
          <div class="col-12 col-md-6 mb-1"><small class="text-muted d-block">ฟาร์ม</small>${farmHtml}${nextHarvestMs > 0 ? `<div class="mt-1"><small class="text-muted">Next harvest: </small><b id="tdd-harvest-cd">${fmt(nextHarvestMs)}</b></div>` : ""}</div>
          <div class="col-12 col-md-6 mb-1"><small class="text-muted d-block">ตั๋ว</small>${ticketHtml}${nextTicketMs > 0 ? `<div class="mt-1"><small class="text-muted">Next ticket: </small><b id="tdd-ticket-cd">${fmt(nextTicketMs)}</b></div>` : ""}</div>
        </div>
        ${profile ? buildClassProgress(profile) : ""}
      `);

      if (nextHarvestMs > 0) {
        let remaining = nextHarvestMs;
        countdownInterval = setInterval(() => {
          remaining -= 1000;
          const $cd = $("#tdd-harvest-cd");
          if (remaining <= 0) { $cd.text("พร้อมแล้ว!"); clearInterval(countdownInterval!); }
          else $cd.text(fmt(remaining));
        }, 1000);
      }

      if (nextTicketMs > 0) {
        let remaining = nextTicketMs;
        ticketInterval = setInterval(() => {
          remaining -= 1000;
          const $cd = $("#tdd-ticket-cd");
          if (remaining <= 0) { $cd.text("พร้อมแล้ว!"); clearInterval(ticketInterval!); }
          else $cd.text(fmt(remaining));
        }, 1000);
      }
    } catch (err) {
      logger.error("dashboard load failed", err);
      $("#tdd-home-content").html('<span class="text-danger">โหลดข้อมูลไม่สำเร็จ</span>');
    }
  };

  $("#tdd-home-refresh").on("click", load);
  void load();
};
