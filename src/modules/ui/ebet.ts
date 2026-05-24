import { createLogger } from "../../utils/logger";
import { fetchUserData, fetctSettingData } from "../data/fetchData";
import { UserData } from "../data/models";

const logger = createLogger("Ebet");
const settingData = await fetctSettingData();

interface EbetSideBet {
  username: string;
  userId: number | null;
  userHtml: string;
  amount: number;
  amountText: string;
}

interface EbetSideData {
  team: string;
  bets: EbetSideBet[];
  total: number;
}

interface EbetMatchData {
  sides: Record<string, EbetSideData>;
  myBets: EbetSideBet[];
}

interface OwnEbetCacheEntry {
  team: string;
  amount: number;
  expiresAt: number;
}

let user: UserData;
let tooltipHideTimer: number | undefined;
const ownBetCacheKey = "enhancerEbetOwnBets";
const ownBetCacheTtlMs = 7 * 24 * 60 * 60 * 1000;
const detailCache = new Map<string, Promise<EbetMatchData>>();

export const initEbetModule = async () => {
  if (!settingData.ebet.enabledEbetModule) return;
  user = await fetchUserData();
  initEbetStyles();
  bindEbetSubmit();
  markCachedOwnBets();
  if (!settingData.ebet.enabledHoverDetails) return;
  bindEbetHover();
};

const initEbetStyles = () => {
  if ($("#enhancer-ebet-style").length) return;
  $("head").append(
    `<style id="enhancer-ebet-style">
      .ebet-own-badge { display: inline-block; margin: 0 4px; }
      #enhancer-ebet-tooltip { position: fixed; z-index: 99999; display: none; max-width: 560px; max-height: 380px; overflow-y: auto; padding: 10px 12px; color: #fff; background: rgba(0,0,0,.92); border-radius: 4px; box-shadow: 0 4px 14px rgba(0,0,0,.35); font-size: 12px; }
      .ebet-tooltip-row { display: flex; justify-content: space-between; gap: 16px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,.12); }
      .ebet-tooltip-user { min-width: 190px; }
      .ebet-tooltip-total { border-top: 1px solid rgba(255,255,255,.35); margin-top: 6px; padding-top: 6px; font-weight: 500; }
    </style>`,
  );
  $("body").append('<div id="enhancer-ebet-tooltip"></div>');
  $("#enhancer-ebet-tooltip")
    .on("mouseenter", () => clearTooltipHideTimer())
    .on("mouseleave", () => scheduleHideTooltip());
};

const bindEbetSubmit = () => {
  $(".bet-submit")
    .off("click")
    .on("click.enhancerEbet", async () => {
      const modal = $("#betModal");
      const button = $(".bet-submit");
      const keyid = modal.data("enhancerKeyid")?.toString();
      const team = modal.data("enhancerTeam")?.toString();
      const amount = modal.find(".bet-price").val()?.toString() ?? "";
      if (!keyid || !team || !amount) return showBetError("จำนวนเงินเดิมพัน ไม่ถูกต้อง!");

      button.prop("disabled", true);
      try {
        const result = await submitBet(keyid, team, amount);
        if (result !== "success") return showBetError(mapBetError(result));

        cacheOwnBet(keyid, team, Number(amount));
        markCachedOwnBets();
        modal.modal("hide");
        swal.fire("Good Job!", "เดิมพันเสร็จสมบูรณ์!", "success");
      } catch (err) {
        logger.error("วางเดิมพันโต๊ะบอลไม่สำเร็จ", err);
        showBetError("วางเดิมพันไม่สำเร็จ");
      } finally {
        button.prop("disabled", false);
      }
    });

  $(".btn-bet")
    .off("click")
    .on("click.enhancerEbet", function () {
      const button = $(this);
      const keyid = button.data("keyid")?.toString();
      const team = button.data("team")?.toString();
      if (!keyid || !team) return;

      $("#betModal .team").html(button.find("span").html() ?? "");
      $("#betModal").data("enhancerKeyid", keyid).data("enhancerTeam", team).modal();
    });
};

const submitBet = async (keyid: string, team: string, amount: string) => {
  const params = new URLSearchParams({ act: "bet", keyid, team, amount });
  const res = await fetch(`ebet.php?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).trim();
};

const mapBetError = (result: string) => ({
  "error-appove": "รายการนี้ยังไม่ถูก Appove ค่ะ",
  "error-bet-max": "เงินเดิมพันรวม จะต้องไม่เกิน 100,000 Zen",
  "error-class": "คุณจะต้องมี Class Rookie ขึ้นไป",
  "error-set-bet": "จำนวนเงินเดิมพัน ไม่ถูกต้อง!",
  "error-team-bet": "ไม่สามารถเดิมพันพร้อมกัน 2 ทีมได้",
  "error-money": "จำนวนเงินเดิมพัน มีไม่พอ!",
  "error-id": "ไม่พบรายการ!",
  "error-bet-timeout": "รายการนี้หมดเวลาเดิมพันแล้ว",
})[result] ?? result;

const showBetError = (message: string) => {
  swal.fire("Error!", message, "error");
};

const bindEbetHover = () => {
  $(".btn-bet")
    .off("mouseenter.enhancerEbet mouseleave.enhancerEbet")
    .on("mouseenter.enhancerEbet", async function () {
      const button = $(this);
      const row = button.closest("tr");
      const detailUrl = row.find("a[href^='ebet-detail.php?id=']").attr("href");
      const team = button.data("team")?.toString();
      if (!detailUrl || !team) return;

      clearTooltipHideTimer();
      showTooltip(button, "กำลังโหลด...");

      try {
        const data = await fetchMatchData(detailUrl);
        syncOwnBetCacheFromMatch(row, data);
        markCachedOwnBets(row);
        if (!button.is(":hover") && !$("#enhancer-ebet-tooltip").is(":hover")) return scheduleHideTooltip();
        showTooltip(button, renderSideTooltip(data.sides[team]));
      } catch (err) {
        logger.error("โหลดข้อมูลเดิมพันโต๊ะบอลไม่สำเร็จ", err);
        if (button.is(":hover")) showTooltip(button, "โหลดข้อมูลไม่สำเร็จ");
      }
    })
    .on("mouseleave.enhancerEbet", function () {
      scheduleHideTooltip();
    });
};

const fetchMatchData = (detailUrl: string) => {
  if (!detailCache.has(detailUrl)) {
    detailCache.set(
      detailUrl,
      loadMatchData(detailUrl).catch((err) => {
        detailCache.delete(detailUrl);
        throw err;
      }),
    );
  }
  return detailCache.get(detailUrl)!;
};

const loadMatchData = async (detailUrl: string): Promise<EbetMatchData> => {
  const res = await fetch(detailUrl);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const sides: Record<string, EbetSideData> = {};
  const myBets: EbetSideBet[] = [];

  $(doc)
    .find(".row > .col-lg-6.mt-4")
    .each((index, column) => {
      const side = String(index + 1);
      const card = $(column).find(".card").first();
      const team = card.find(".card-header").text().replace(/\s+/g, " ").trim();
      const bets: EbetSideBet[] = [];

      card.find("table tr.text-nowrap").each((_rowIndex, tr) => {
        const cells = $(tr).find("th");
        if (cells.length < 4) return;
        const userCell = cells.eq(0);
        const amountText = cells.eq(1).text().replace(/\s+/g, " ").trim();
        const amount = Number(amountText.replace(/,/g, ""));
        const username = userCell.find("a").first().text().trim();
        if (!username || !Number.isFinite(amount)) return;

        const href = userCell.find("a").first().attr("href") ?? "";
        const userId = Number(href.match(/id=(\d+)/)?.[1] ?? NaN);
        const bet: EbetSideBet = {
          username,
          userId: Number.isFinite(userId) ? userId : null,
          userHtml: userCell.html()?.trim() ?? username,
          amount,
          amountText,
        };
        bets.push(bet);
        if (bet.username === user.username || bet.userId === user.userId) myBets.push(bet);
      });

      sides[side] = {
        team,
        bets,
        total: bets.reduce((sum, bet) => sum + bet.amount, 0),
      };
    });

  return { sides, myBets };
};

const markCachedOwnBets = (scope: JQuery<HTMLElement> | Document = document) => {
  const ownBets = getOwnBetCache();
  $(scope).find(".ebet-own-badge").remove();
  $(scope).find(".btn-bet").each((_index, button) => {
    const keyid = $(button).data("keyid")?.toString();
    const team = $(button).data("team")?.toString();
    const ownBet = keyid ? ownBets[keyid] : undefined;
    if (!ownBet || ownBet.team !== team || ownBet.amount <= 0 || ownBet.expiresAt <= Date.now()) return;

    $(button).after(
      `<span class="ebet-own-badge text-success" title="ลงแล้ว ${ownBet.amount.toLocaleString()} Zen"><i class="fal fa-check-circle"></i></span>`,
    );
  });
};

const syncOwnBetCacheFromMatch = (row: JQuery<HTMLElement>, data: EbetMatchData) => {
  const keyid = row.find(".btn-bet").first().data("keyid")?.toString();
  if (!keyid) return;

  const cache = getOwnBetCache();
  const ownBet = Object.entries(data.sides)
    .map(([team, side]) => ({
      team,
      amount: side.bets
        .filter((bet) => bet.username === user.username || bet.userId === user.userId)
        .reduce((sum, bet) => sum + bet.amount, 0),
    }))
    .find((entry) => entry.amount > 0);

  if (ownBet) cache[keyid] = { ...ownBet, expiresAt: Date.now() + ownBetCacheTtlMs };
  else delete cache[keyid];
  setOwnBetCache(cache);
};

const cacheOwnBet = (keyid: string, team: string, amount: number) => {
  const cache = getOwnBetCache();
  const current = cache[keyid];
  cache[keyid] = {
    team,
    amount: (current?.team === team ? current.amount : 0) + amount,
    expiresAt: Date.now() + ownBetCacheTtlMs,
  };
  setOwnBetCache(cache);
};

const getOwnBetCache = (): Record<string, OwnEbetCacheEntry> => {
  const cache = GM_getValue(ownBetCacheKey, {}) as Record<string, OwnEbetCacheEntry>;
  const now = Date.now();
  const activeEntries = Object.entries(cache).filter(([, entry]) => entry.expiresAt > now);
  const activeCache = Object.fromEntries(activeEntries) as Record<string, OwnEbetCacheEntry>;
  if (activeEntries.length !== Object.keys(cache).length) setOwnBetCache(activeCache);
  return activeCache;
};

const setOwnBetCache = (cache: Record<string, OwnEbetCacheEntry>) => GM_setValue(ownBetCacheKey, cache);

const renderSideTooltip = (side?: EbetSideData) => {
  if (!side) return "ไม่มีข้อมูล";
  if (side.bets.length === 0) return `<div class="ebet-tooltip"><b>${escapeHtml(side.team)}</b><br>ยังไม่มีคนลงฝั่งนี้</div>`;

  const rows = side.bets
    .map(
      (bet) =>
        `<div class="ebet-tooltip-row">
          <span class="ebet-tooltip-user">${renderSafeUserHtml(bet.userHtml, bet.username)}</span>
          <span class="text-warning text-nowrap">${escapeHtml(bet.amountText)} Zen</span>
        </div>`,
    )
    .join("");

  return `<div class="ebet-tooltip">
    <div class="text-center mb-1"><b>${escapeHtml(side.team)}</b></div>
    ${rows}
    <div class="ebet-tooltip-total d-flex justify-content-between"><span>รวม</span><span>${side.total.toLocaleString()} Zen</span></div>
  </div>`;
};

const showTooltip = (button: JQuery<HTMLElement>, content: string) => {
  const tooltip = $("#enhancer-ebet-tooltip");
  const rect = button[0].getBoundingClientRect();
  tooltip.html(content).show();

  const tooltipWidth = tooltip.outerWidth() ?? 0;
  const tooltipHeight = tooltip.outerHeight() ?? 0;
  const top = Math.max(8, rect.top - tooltipHeight - 8);
  const left = Math.min(
    Math.max(8, rect.left + rect.width / 2 - tooltipWidth / 2),
    window.innerWidth - tooltipWidth - 8,
  );

  tooltip.css({ top, left });
};

const scheduleHideTooltip = () => {
  clearTooltipHideTimer();
  tooltipHideTimer = window.setTimeout(() => {
    $("#enhancer-ebet-tooltip").hide().empty();
  }, 250);
};

const clearTooltipHideTimer = () => {
  if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
  tooltipHideTimer = undefined;
};

const renderSafeUserHtml = (html: string, username: string) => {
  const root = $("<div>").html(html);
  const userLink = root.find("a").first();
  const safeUser = escapeHtml(userLink.text().trim() || username);
  const safeClass = (userLink.attr("class") ?? "")
    .split(/\s+/)
    .filter((className) => /^text-[a-z0-9-]+$|^fw\d+$/.test(className))
    .join(" ");
  const icons = root
    .find("img")
    .map((_index, img) => {
      const src = $(img).attr("src") ?? "";
      if (!/^images\/(icons\/)?[\w.-]+\.(gif|png|webp)$/i.test(src)) return "";
      return `<img src="${escapeHtml(src)}" class="ml-ic-1">`;
    })
    .get()
    .join("");

  return `<span class="${safeClass}">${safeUser}</span>${icons}`;
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[char]);
