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

let user: UserData;
let tooltipHideTimer: number | undefined;
const detailCache = new Map<string, Promise<EbetMatchData>>();

export const initEbetModule = async () => {
  if (!settingData.ebet.enabledEbetModule) return;
  user = await fetchUserData();
  if (!settingData.ebet.enabledHoverDetails) return;
  initEbetStyles();
  bindEbetHover();
};

const initEbetStyles = () => {
  if ($("#enhancer-ebet-style").length) return;
  $("head").append(
    `<style id="enhancer-ebet-style">
      .ebet-own-badge { margin-left: 4px; }
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
        markOwnBets(row, data);
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
  return detailCache.get(detailUrl);
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

const markOwnBets = (row: JQuery<HTMLElement>, data: EbetMatchData) => {
  row.find(".btn-bet").each((_index, button) => {
    const team = $(button).data("team")?.toString();
    const side = team ? data.sides[team] : undefined;
    const ownAmount = side?.bets
      .filter((bet) => bet.username === user.username || bet.userId === user.userId)
      .reduce((sum, bet) => sum + bet.amount, 0) ?? 0;

    $(button).find(".ebet-own-badge").remove();
    if (ownAmount <= 0) return;

    $(button).append(
      `<span class="ebet-own-badge text-success" title="ลงแล้ว ${ownAmount.toLocaleString()} Zen"><i class="fal fa-check-circle"></i></span>`,
    );
  });
};

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
