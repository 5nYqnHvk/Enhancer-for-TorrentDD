import toastr from "toastr";
import swal from "sweetalert2";
import { fetchUserData, fetctSettingData } from "../data/fetchData";
import { createLogger } from "../../utils/logger";

const logger = createLogger("Ranking");

const ACTS = ["seeder", "ticket", "uploaded", "money", "pet", "coin", "torrent"] as const;
type RankAct = (typeof ACTS)[number];

interface SnapshotRow { rank: number; score: string; username: string; }
interface Snapshot { ts: number; rows: SnapshotRow[]; }

const CLASS_LABEL: Record<string, string> = {
  "text-user": "User", "text-rookie": "Rookie", "text-beginner": "Beginner",
  "text-junior": "Junior", "text-senior": "Senior", "text-amateur": "Amateur",
  "text-semipro": "Semi-Pro", "text-pro": "Pro", "text-worldpro": "World Pro",
  "text-colo": "Colo", "text-vip": "VIP", "text-dj": "DJ",
  "text-rainbow": "Rainbow", "text-moderator": "Moderator",
  "text-administrator": "Admin", "text-sysop": "Sysop",
};

const currentAct = (): RankAct => {
  const m = window.location.search.match(/[?&]act=([^&]+)/);
  return (m ? m[1] : "seeder") as RankAct;
};

const parseRows = (doc: Document): SnapshotRow[] => {
  const rows: SnapshotRow[] = [];
  $(doc).find("table.table tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length < 3) return;
    rows.push({
      rank: parseInt($(tds[0]).text().trim()) || 0,
      score: $(tds[1]).text().trim(),
      username: $(tds[2]).find("a").text().trim(),
    });
  });
  return rows.filter(r => r.rank > 0);
};

// Feature 1: highlight current user row
const highlightSelf = (username: string) => {
  let found = false;
  $("table.table tr").each((_, tr) => {
    const a = $(tr).find("td a[href^='userdetails.php']");
    if (a.text().trim() === username) {
      $(tr).addClass("table-warning").find("td").css("font-weight", "600");
      found = true;
    }
  });
  if (!found) toastr.info(`ไม่อยู่ใน Top 10 หมวดนี้`, "Ranking", { timeOut: 3000 });
};

// Feature 2: all-categories summary
const showAllRanks = async (username: string) => {
  const CACHE_KEY = "ranking_summary_cache";
  const cached = JSON.parse(GM_getValue(CACHE_KEY, "null") as string);
  if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
    renderSummaryModal(cached.data, username);
    return;
  }

  const btn = $("#tdd-ranking-summary");
  btn.prop("disabled", true).text("กำลังโหลด...");

  try {
    const results = await Promise.all(
      ACTS.map(async (act) => {
        const res = await fetch(`ranking.php?act=${act}`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const rows = parseRows(doc);
        const mine = rows.find(r => r.username === username);
        return { act, rank: mine?.rank ?? null, score: mine?.score ?? null };
      })
    );
    GM_setValue(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: results }));
    renderSummaryModal(results, username);
  } catch (err) {
    toastr.error("โหลดข้อมูลไม่สำเร็จ", "Ranking");
    logger.error("showAllRanks failed", err);
  } finally {
    btn.prop("disabled", false).text("อันดับของฉัน");
  }
};

const renderSummaryModal = (data: { act: string; rank: number | null; score: string | null }[], username: string) => {
  const rows = data.map(d =>
    `<tr>
      <td class="text-capitalize">${d.act}</td>
      <td>${d.rank != null ? `<b>#${d.rank}</b>` : '<span class="text-muted">-</span>'}</td>
      <td>${d.score ?? '<span class="text-muted">-</span>'}</td>
    </tr>`
  ).join("");
  swal.fire({
    title: `อันดับของ ${username}`,
    html: `<table class="table table-sm table-bordered mt-2">
      <thead><tr><th>หมวด</th><th>อันดับ</th><th>คะแนน</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`,
    width: 400,
    confirmButtonText: "ปิด",
  });
};

// Feature 3: history snapshot
const snapshotKey = (act: RankAct) => `ranking_history_${act}`;

const saveSnapshot = (act: RankAct, rows: SnapshotRow[]) => {
  if (!rows.length) return;
  const history: Snapshot[] = JSON.parse(GM_getValue(snapshotKey(act), "[]") as string);
  history.push({ ts: Date.now(), rows });
  if (history.length > 30) history.splice(0, history.length - 30);
  GM_setValue(snapshotKey(act), JSON.stringify(history));
};

const showHistory = (act: RankAct) => {
  const history: Snapshot[] = JSON.parse(GM_getValue(snapshotKey(act), "[]") as string);
  if (history.length < 1) {
    swal.fire("ยังไม่มีประวัติ", "เยี่ยมชมหน้านี้หลายครั้งเพื่อสะสมประวัติ", "info");
    return;
  }
  const latest = history[history.length - 1];
  const prev = history.length >= 2 ? history[history.length - 2] : null;

  const rows = latest.rows.map(r => {
    const prevRow = prev?.rows.find(p => p.username === r.username);
    let delta = "";
    if (prevRow) {
      const diff = prevRow.rank - r.rank;
      delta = diff > 0 ? `<span class="text-success">▲${diff}</span>`
             : diff < 0 ? `<span class="text-danger">▼${Math.abs(diff)}</span>`
             : `<span class="text-muted">—</span>`;
    }
    return `<tr><td>${r.rank}</td><td>${r.score}</td><td>${r.username}</td><td>${delta}</td></tr>`;
  }).join("");

  const dateStr = new Date(latest.ts).toLocaleString("th-TH");
  swal.fire({
    title: `ประวัติ ${act} (${history.length} snapshots)`,
    html: `<div class="text-muted mb-1" style="font-size:12px">ล่าสุด: ${dateStr}</div>
    <table class="table table-sm table-bordered">
      <thead><tr><th>#</th><th>คะแนน</th><th>ผู้ใช้</th><th>เปลี่ยน</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`,
    width: 480,
    confirmButtonText: "ปิด",
  });
};

// Feature 4: auto-refresh with countdown
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;
const REFRESH_INTERVAL = 60;

const startAutoRefresh = (username: string) => {
  const $label = $("#tdd-refresh-label");
  let remaining = REFRESH_INTERVAL;

  const doRefresh = async () => {
    try {
      const res = await fetch(window.location.href);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      $(".table-responsive").html($(doc).find(".table-responsive").html());
      highlightSelf(username);
      initHoverTooltip();
      toastr.info("อัปเดตอันดับแล้ว", "Ranking", { timeOut: 2000 });
    } catch (err) {
      logger.error("auto-refresh failed", err);
    }
    remaining = REFRESH_INTERVAL;
  };

  refreshTimer = setInterval(doRefresh, REFRESH_INTERVAL * 1000);
  countdownTimer = setInterval(() => {
    remaining--;
    $label.text(`รีเฟรชใน ${remaining}s`);
    if (remaining <= 0) remaining = REFRESH_INTERVAL;
  }, 1000);
  $label.text(`รีเฟรชใน ${remaining}s`);
};

const stopAutoRefresh = () => {
  if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  $("#tdd-refresh-label").text("");
};

// Feature 5: hover tooltip
const initHoverTooltip = () => {
  $(document).off("mouseenter.tddrank mouseleave.tddrank");
  $(document).on("mouseenter.tddrank", "table.table tr td a[href^='userdetails.php']", function () {
    const $a = $(this);
    const cls = $a.attr("class")?.split(/\s+/).find(c => CLASS_LABEL[c]) ?? "";
    const label = CLASS_LABEL[cls] ?? "Unknown";
    const score = $a.closest("tr").find("td").eq(1).text().trim();
    const tip = $(`<div id="tdd-rank-tip" style="position:absolute;background:#fff;border:1px solid #ccc;border-radius:4px;padding:4px 8px;font-size:12px;z-index:9999;pointer-events:none;">
      <span class="${cls}">${label}</span> &nbsp;|&nbsp; ${score}
    </div>`);
    $("body").append(tip);
    $(document).on("mousemove.tddranktip", (e) => {
      tip.css({ top: e.pageY + 12, left: e.pageX + 12 });
    });
  }).on("mouseleave.tddrank", "table.table tr td a[href^='userdetails.php']", () => {
    $("#tdd-rank-tip").remove();
    $(document).off("mousemove.tddranktip");
  });
};

// Main init
export const initRankingModule = async () => {
  if (!(await fetctSettingData()).ranking.enabledRankingModule) return;
  try {
    const userData = await fetchUserData();
    const { username } = userData;
    const act = currentAct();

    // snapshot current table
    const currentRows = parseRows(document);
    saveSnapshot(act, currentRows);

    // Feature 1: highlight self
    highlightSelf(username);

    // Feature 5: hover tooltip
    initHoverTooltip();

    // inject toolbar buttons near the tab bar
    const $tabBar = $("div.mt-3.text-center");
    const $toolbar = $(`<div class="mt-2 mb-2 text-center d-flex justify-content-center gap-2" style="gap:8px">`);

    // Feature 2: all-categories summary button
    const $summaryBtn = $(`<button id="tdd-ranking-summary" class="btn btn-sm btn-outline-primary">อันดับของฉัน</button>`);
    $summaryBtn.on("click", () => showAllRanks(username));

    // Feature 3: history button
    const $historyBtn = $(`<button class="btn btn-sm btn-outline-secondary">ประวัติ</button>`);
    $historyBtn.on("click", () => showHistory(act));

    // Feature 4: auto-refresh toggle
    const $refreshBtn = $(`<button id="tdd-refresh-toggle" class="btn btn-sm btn-outline-success">เปิด Auto-Refresh</button>`);
    const $refreshLabel = $(`<small id="tdd-refresh-label" class="text-muted align-self-center"></small>`);
    let autoRefreshOn = false;
    $refreshBtn.on("click", () => {
      autoRefreshOn = !autoRefreshOn;
      if (autoRefreshOn) {
        $refreshBtn.text("ปิด Auto-Refresh").removeClass("btn-outline-success").addClass("btn-outline-danger");
        startAutoRefresh(username);
      } else {
        $refreshBtn.text("เปิด Auto-Refresh").removeClass("btn-outline-danger").addClass("btn-outline-success");
        stopAutoRefresh();
      }
    });

    $toolbar.append($summaryBtn, $historyBtn, $refreshBtn, $refreshLabel);
    $tabBar.after($toolbar);
  } catch (err) {
    logger.error("initRankingModule failed", err);
  }
};
