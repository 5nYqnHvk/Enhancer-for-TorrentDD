import { animateValue } from "../../utils/effect";
import { createLogger } from "../../utils/logger";
import { fetchUserData, fetctSettingData } from "../data/fetchData";
import { UserData } from "../data/models";

const logger = createLogger("BetCard");
const settingData = await fetctSettingData();

let user: UserData;

const cardArr = [
  { card: "1-a.gif", txt: "A♣" },
  { card: "2-a.gif", txt: "2♣" },
  { card: "3-a.gif", txt: "3♣" },
  { card: "4-a.gif", txt: "4♣" },
  { card: "5-a.gif", txt: "5♣" },
  { card: "6-a.gif", txt: "6♣" },
  { card: "7-a.gif", txt: "7♣" },
  { card: "8-a.gif", txt: "8♣" },
  { card: "9-a.gif", txt: "9♣" },
  { card: "10-a.gif", txt: "10♣" },
  { card: "11-a.gif", txt: "J♣" },
  { card: "12-a.gif", txt: "Q♣" },
  { card: "13-a.gif", txt: "K♣" },
  { card: "1-b.gif", txt: "A♦" },
  { card: "2-b.gif", txt: "2♦" },
  { card: "3-b.gif", txt: "3♦" },
  { card: "4-b.gif", txt: "4♦" },
  { card: "5-b.gif", txt: "5♦" },
  { card: "6-b.gif", txt: "6♦" },
  { card: "7-b.gif", txt: "7♦" },
  { card: "8-b.gif", txt: "8♦" },
  { card: "9-b.gif", txt: "9♦" },
  { card: "10-b.gif", txt: "10♦" },
  { card: "11-b.gif", txt: "J♦" },
  { card: "12-b.gif", txt: "Q♦" },
  { card: "13-b.gif", txt: "K♦" },
  { card: "1-c.gif", txt: "A♥" },
  { card: "2-c.gif", txt: "2♥" },
  { card: "3-c.gif", txt: "3♥" },
  { card: "4-c.gif", txt: "4♥" },
  { card: "5-c.gif", txt: "5♥" },
  { card: "6-c.gif", txt: "6♥" },
  { card: "7-c.gif", txt: "7♥" },
  { card: "8-c.gif", txt: "8♥" },
  { card: "9-c.gif", txt: "9♥" },
  { card: "10-c.gif", txt: "10♥" },
  { card: "11-c.gif", txt: "J♥" },
  { card: "12-c.gif", txt: "Q♥" },
  { card: "13-c.gif", txt: "K♥" },
  { card: "1-d.gif", txt: "A♠" },
  { card: "2-d.gif", txt: "2♠" },
  { card: "3-d.gif", txt: "3♠" },
  { card: "4-d.gif", txt: "4♠" },
  { card: "5-d.gif", txt: "5♠" },
  { card: "6-d.gif", txt: "6♠" },
  { card: "7-d.gif", txt: "7♠" },
  { card: "8-d.gif", txt: "8♠" },
  { card: "9-d.gif", txt: "9♠" },
  { card: "10-d.gif", txt: "10♠" },
  { card: "11-d.gif", txt: "J♠" },
  { card: "12-d.gif", txt: "Q♠" },
  { card: "13-d.gif", txt: "K♠" },
];

let betPlayerE: HTMLElement;
let betPriceE: HTMLElement;
let loadCard: HTMLElement;
let cardCount: HTMLElement;

interface CardBet {
  id: string;
  price: string;
  username: string;
  userHtml: string;
  date: string;
}

interface BoardRecord {
  id: string;
  price: number;
  text: string;
  result: "win" | "lose" | "unknown";
  side: "a" | "b" | "unknown";
  player1: string;
  player2: string;
}

let cardData: CardBet[] = [];
let playerList: string[] = [];
let refreshTimer: number | undefined;
let allPagesLoaded = false;

export const initbetCardModule = async () => {
  if (!settingData.betcard.enabledBetCardModule) return;
  user = await fetchUserData();
  initCard();
};

const initCard = () => {
  if (new URLSearchParams(window.location.search).get("mod") === "board") {
    initBoardAnalyzer();
    return;
  }

  $(".menu").after(
    `<div class="alert alert-light border border-primary mx-auto" style="width:50%;">
        <h4 class="text-center fw400 text-dark mt-4 mb-3">ค้นหาไพ่</h4>
        <h5 class="mb-2 text-youtube text-center ">ทำงานแค่หน้าแรกเท่านั้น ถ้าไพ่หมดให้ลองกด "ค้นหาไพ่ใหม่"</h5>
        <div class="d-flex justify-content-around mt-4">
            <span class="text-dark text-center">เลือกเจ้ามือ:</span>
            <select id="betPlayer" class="text-center fw400 text-dark ml-2 col-sm-4">
                <option value="all">ทั้งหมด</option>
            </select>
        </div>
        <div class="d-flex justify-content-around mt-4">
            <span class="text-dark text-center">เลือกราคา:</span>
            <select class="text-center fw400 text-dark ml-2 col-sm-4" id="betPrice">
                <option value="all">ทั้งหมด</option>
                <option value=">5000">น้อยกว่า 5,000</option>
                <option value=">10000">น้อยกว่า 10,000</option>
                <option value=">50000">น้อยกว่า 50,000</option>
                <option value=">100000">น้อยกว่า 100,000</option>
                <option value=">300000">น้อยกว่า 300,000</option>
                <option value=">400000">น้อยกว่า 400,000</option>
                <option value="=10">10</option>
                <option value="=50">50</option>
                <option value="=100">100</option>
                <option value="=300">300</option>
                <option value="=500">500</option>
                <option value="=1000">1,000</option>
                <option value="=2000">2,000</option>
                <option value="=3000">3,000</option>
                <option value="=5000">5,000</option>
                <option value="=10000">10,000</option>
                <option value="=20000">20,000</option>
                <option value="=30000">30,000</option>
                <option value="=50000">50,000</option>
                <option value="=100000">100,000</option>
                <option value="=200000">200,000</option>
                <option value="=300000">300,000</option>
                <option value="=400000">400,000</option>
                <option value="=500000">500,000</option>
            </select>
        </div>
        <div class="d-flex justify-content-around mt-4">
          <span id="cardCount" class="text-dark">ไพ่ทั้งหมด: 0 ใบ</span>
        </div>
        <div class="d-flex justify-content-around mt-4">
          <button class="btn btn-block btn-success" id="loadCard">ค้นหาไพ่ใหม่</button>
        </div>
    </div>`,
  );

  betPlayerE = $(".alert #betPlayer")[0];
  betPriceE = $(".alert #betPrice")[0];
  cardCount = $(".alert #cardCount")[0];
  loadCard = $(".alert #loadCard")[0];
  loadCard.addEventListener("click", async () => await updateCard());

  cardData = parseCardsFromRoot(document);
  syncPlayerFilter();
  if (settingData.betcard.enabledBoardStats) initBoardSummary();

  betPlayerE.addEventListener("change", () => onSelectChange());
  betPriceE.addEventListener("change", () => onSelectChange());
  onSelectChange();
  $(".mt-3.text-center").remove();
  if (settingData.betcard.enabledCardRealtime) startRealtimeRefresh();
};

const onSelectChange = () => {
  const filteredCards = cardData.filter(matchSelectedFilters);
  const tbody = $("table").find("tbody")[0];
  if (!tbody) return;

  $(tbody).html(filteredCards.map(renderCardRow).join(""));
  $(cardCount).text(
    $(betPlayerE).val() === "all" && $(betPriceE).val() === "all"
      ? `ไพ่ทั้งหมด: ${cardData.length} ใบ`
      : `ไพ่ที่ค้นหา: ${filteredCards.length}/${cardData.length} ใบ`,
  );

  $(".btn-bet").on("click", async function () {
    await bet(Number(this.id));
  });
};

const matchSelectedFilters = (data: CardBet) => {
  const playerSelected = $(betPlayerE).val();
  const priceSelected = $(betPriceE).val();
  const cardPrice = Number(data.price.replace(/,/g, ""));

  if (playerSelected !== "all" && data.username !== playerSelected) return false;
  if (priceSelected === "all") return true;

  const priceSelectedText = priceSelected.toString();
  const priceSelectedValue = Number(priceSelectedText.slice(1).replace(/,/g, ""));
  return priceSelectedText.startsWith("=")
    ? cardPrice === priceSelectedValue
    : cardPrice <= priceSelectedValue;
};

const renderCardRow = (data: CardBet) => `
  <tr class="text-center">
    <td>${data.id}</td>
    <td class="text-info">${data.price}</td>
    <td width="150">${data.userHtml}</td>
    <td>${data.date}</td>
    <td>
      <button id="${data.id}" class="btn ${data.username === user.username ? "btn-info" : "btn-bet btn-info"}" type="button" ${data.username === user.username ? "disabled" : ""}>Play!</button>
    </td>
  </tr>`;

const parseCardsFromRoot = (root: Document | HTMLElement): CardBet[] => {
  const cards = new Map<string, CardBet>();
  $(root)
    .find("table tr")
    .each((_index, tr) => {
      const $td = $(tr).find("td");
      if ($td.length < 5) return;

      const id = $td.eq(0).text().trim();
      if (!/^\d+$/.test(id)) return;

      cards.set(id, {
        id,
        price: $td.eq(1).text().trim(),
        username: $td.eq(2).text().trim(),
        userHtml: $td.eq(2).html()?.trim() ?? "",
        date: $td.eq(3).html()?.trim() ?? "",
      });
    });

  return [...cards.values()];
};

const syncPlayerFilter = () => {
  const currentPlayer = $(betPlayerE).val()?.toString() ?? "all";
  playerList = [...new Set(cardData.map((card) => card.username))].sort();

  $(betPlayerE)
    .empty()
    .append(
      $("<option>", {
        value: "all",
        text: "ทั้งหมด",
      }),
    );

  $.each(playerList, (_index, player) => {
    $(betPlayerE).append(
      $("<option>", {
        value: player,
        text: player,
      }),
    );
  });

  $(betPlayerE).val(playerList.includes(currentPlayer) ? currentPlayer : "all");
};

const fetchCards = async (allPages = false): Promise<CardBet[]> => {
  const parser = new DOMParser();
  const firstRes = await fetch(window.location.href);
  const firstHtml = await firstRes.text();
  const firstDoc = parser.parseFromString(firstHtml, "text/html");
  const cards = new Map<string, CardBet>();

  parseCardsFromRoot(firstDoc).forEach((card) => cards.set(card.id, card));
  if (!allPages) return [...cards.values()];

  const links = $(firstDoc)
    .find(".pagination a")
    .map((_i, a) => new URL($(a).attr("href") || window.location.href, window.location.href).href)
    .get();
  const uniqueLinks = [...new Set(links)].filter((link) => link !== window.location.href);

  for (const link of uniqueLinks) {
    const res = await fetch(link);
    const html = await res.text();
    const doc = parser.parseFromString(html, "text/html");
    parseCardsFromRoot(doc).forEach((card) => cards.set(card.id, card));
  }

  return [...cards.values()];
};

const startRealtimeRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = window.setInterval(async () => {
    if (document.hidden) return;
    try {
      const cards = await fetchCards(allPagesLoaded);
      const oldIds = cardData.map((card) => card.id).join(",");
      const newIds = cards.map((card) => card.id).join(",");
      if (oldIds === newIds) return;

      cardData = cards;
      syncPlayerFilter();
      onSelectChange();
    } catch (err) {
      logger.warn("อัปเดตรายการเดิมพัน realtime ไม่สำเร็จ", err);
    }
  }, 10 * 1000);
};

const updateCard = async () => {
  logger.info(`ค้นหาไพ่ใหม่`);
  logger.debug("Fetching all Battle Card pages");
  $(loadCard).prop("disabled", true);
  let timeLeft = 5;
  $(loadCard).text(`(รอ ${timeLeft} วินาที)`);
  const timer = setInterval(() => {
    timeLeft--;
    $(loadCard).text(`(รอ ${timeLeft} วินาที)`);
    if (timeLeft <= 0) {
      clearInterval(timer);
      $(loadCard).prop("disabled", false);
      $(loadCard).text(`ค้นหาไพ่ใหม่`);
    }
  }, 1000);

  const cards = await fetchCards(true);
  if (cards.length > 0) {
    allPagesLoaded = true;
    cardData = cards;
    syncPlayerFilter();
    onSelectChange();
  }
};

const getCachedBoardRecords = (): BoardRecord[] =>
  (GM_getValue("betCardBoardRecords", []) as BoardRecord[]).slice(0, 100);

const setCachedBoardRecords = (records: BoardRecord[]) => {
  const deduped = new Map<string, BoardRecord>();
  records.forEach((record) => deduped.set(record.id, record));
  GM_setValue("betCardBoardRecords", [...deduped.values()].slice(0, 100));
};

const initBoardSummary = () => {
  $(".menu").after(
    `<div class="alert alert-light border border-info mx-auto" style="width:50%;">
      <h4 class="text-center fw400 text-dark mt-4 mb-3">สถิติ Battle Card</h4>
      <div id="boardSummary" class="text-dark"></div>
    </div>`,
  );
  renderBoardSummary(getCachedBoardRecords());
  updateLatestBoardCache();
  window.setInterval(() => {
    if (!document.hidden) updateLatestBoardCache();
  }, 10 * 1000);
};

const updateLatestBoardCache = async () => {
  try {
    const parser = new DOMParser();
    const res = await fetch("card_vs_player.php?mod=board");
    const html = await res.text();
    const doc = parser.parseFromString(html, "text/html");
    const latest = parseBoardRecords(doc);
    if (latest.length === 0) return;

    const merged = [...latest, ...getCachedBoardRecords()];
    setCachedBoardRecords(merged);
    renderBoardSummary(getCachedBoardRecords());
  } catch (err) {
    logger.warn("อัปเดตสถิติล่าสุด Battle Card ไม่สำเร็จ", err);
  }
};

const renderBoardSummary = (records: BoardRecord[]) => {
  const sideA = records.filter((record) => record.side === "a").length;
  const sideB = records.filter((record) => record.side === "b").length;
  const sideKnown = sideA + sideB;
  const sideAWinRate = sideKnown > 0 ? ((sideA / sideKnown) * 100).toFixed(2) : "0.00";
  const sideBWinRate = sideKnown > 0 ? ((sideB / sideKnown) * 100).toFixed(2) : "0.00";
  $("#boardSummary").html(
    `<div class="row text-center justify-content-center">
      <div class="col-md-4 mb-2"><div class="border rounded p-2">Player 1 winrate<br><b>${sideAWinRate}%</b><br><span class="f10">${sideA.toLocaleString()} / ${sideKnown.toLocaleString()}</span></div></div>
      <div class="col-md-4 mb-2"><div class="border rounded p-2">Player 2 winrate<br><b>${sideBWinRate}%</b><br><span class="f10">${sideB.toLocaleString()} / ${sideKnown.toLocaleString()}</span></div></div>
    </div>`,
  );
};

const initBoardAnalyzer = () => {
  if (!settingData.betcard.enabledBoardStats) return;

  $(".menu").after(
    `<div class="alert alert-light border border-primary mx-auto" style="width:50%;">
      <h4 class="text-center fw400 text-dark mt-4 mb-3">สถิติ Battle Card</h4>
      <div class="d-flex justify-content-around flex-wrap">
        <span id="boardScanStatus" class="text-dark">สถานะ: พร้อมสแกน</span>
        <span id="boardScanCount" class="text-dark">ข้อมูล: 0 รายการ</span>
      </div>
      <div class="d-flex justify-content-center mt-3">
        <input id="boardScanPages" class="text-center fw400 text-dark mr-2" type="number" min="1" max="5" value="5" style="width:120px;">
        <button class="btn btn-success" id="boardScan">สแกนย้อนหลัง</button>
      </div>
      <div class="d-flex justify-content-center mt-3">
        <select id="boardPlayerFilter" class="custom-select border-info" style="max-width:260px;">
          <option value="all">ทุกคน</option>
        </select>
      </div>
      <div id="boardStats" class="mt-3 text-dark"></div>
    </div>`,
  );

  const currentRecords = parseBoardRecords(document);
  syncBoardPlayerFilter(currentRecords);
  renderBoardStats(currentRecords);
  $("#boardPlayerFilter").on("change", () => renderBoardStats(getCachedBoardRecords().length > 0 ? getCachedBoardRecords() : currentRecords));
  $("#boardScan").on("click", async () => await scanBoardHistory());
};

const parseBoardRecords = (root: Document | HTMLElement): BoardRecord[] => {
  const records = new Map<string, BoardRecord>();
  $(root)
    .find("table tr")
    .each((_index, tr) => {
      const row = $(tr);
      const text = row.text().replace(/\s+/g, " ").trim();
      const id = text.match(/\b\d{5,}\b/)?.[0];
      if (!id) return;

      const cellTexts = row
        .find("td")
        .map((_i, td) => $(td).text().replace(/\s+/g, " ").trim())
        .get();
      const resultText = cellTexts.find((cell) => /^(คุณ)?(ชนะ|แพ้)$|^(win|lose)$/i.test(cell));
      const price = Number((cellTexts[1] ?? "0").match(/\d[\d,]*/)?.[0]?.replace(/,/g, "") ?? 0);
      const player1 = row.find("td").eq(2).find("a").first().text().trim() || cellTexts[2] || "";
      const player2 = row.find("td").eq(6).find("a").first().text().trim() || cellTexts[6] || "";
      const result = /ชนะ|win/i.test(resultText ?? "")
        ? "win"
        : /แพ้|lose/i.test(resultText ?? "")
          ? "lose"
          : row.find(".text-success,.badge-success").length > row.find(".text-danger,.text-youtube,.badge-danger").length
            ? "win"
            : row.find(".text-danger,.text-youtube,.badge-danger").length > 0
              ? "lose"
              : "unknown";
      const side = getBoardSide(row, result);

      records.set(id, { id, price, text, result, side, player1, player2 });
    });
  return [...records.values()];
};

const getBoardSide = (row: JQuery<HTMLElement>, result: BoardRecord["result"]): BoardRecord["side"] => {
  const resultCell = row.find("td").eq(4).text().replace(/\s+/g, " ").trim();
  if (/ชนะ|win/i.test(resultCell)) return "a";
  if (/แพ้|lose/i.test(resultCell)) return "b";
  if (result === "win") return "a";
  if (result === "lose") return "b";
  return "unknown";
};

const syncBoardPlayerFilter = (records: BoardRecord[]) => {
  const select = $("#boardPlayerFilter");
  if (!select.length) return;
  const current = select.val()?.toString() ?? "all";
  const players = [...new Set(records.flatMap((record) => [record.player1, record.player2]).filter(Boolean))].sort();

  select.empty().append($("<option>", { value: "all", text: "ทุกคน" }));
  players.forEach((player) => select.append($("<option>", { value: player, text: player })));
  select.val(players.includes(current) ? current : "all");
};

const scanBoardHistory = async () => {
  const button = $("#boardScan");
  const pages = Math.min(Math.max(Number($("#boardScanPages").val()), 1), 5);
  const parser = new DOMParser();
  const records = new Map<string, BoardRecord>();

  // seed with the already-loaded current page (page 1 = newest records)
  parseBoardRecords(document).forEach((record) => records.set(record.id, record));

  button.prop("disabled", true);
  try {
    for (let page = 1; page <= pages; page++) {
      $("#boardScanStatus").text(`สถานะ: สแกนหน้า ${page}/${pages}`);
      const res = await fetch(`card_vs_player.php?mod=board&page=${page}`);
      const html = await res.text();
      const doc = parser.parseFromString(html, "text/html");
      parseBoardRecords(doc).forEach((record) => records.set(record.id, record));
      $("#boardScanCount").text(`ข้อมูล: ${records.size} รายการ`);
    }

    const allRecords = [...records.values()];
    setCachedBoardRecords(allRecords);
    syncBoardPlayerFilter(allRecords);
    renderBoardStats(allRecords);
    $("#boardScanStatus").text("สถานะ: สแกนเสร็จแล้ว");
  } catch (err) {
    logger.error("สแกนประวัติ Battle Card ไม่สำเร็จ", err);
    $("#boardScanStatus").text("สถานะ: สแกนไม่สำเร็จ");
  } finally {
    button.prop("disabled", false);
  }
};

const renderBoardStats = (records: BoardRecord[]) => {
  const cached = getCachedBoardRecords();
  const allData = records.length > 0 ? records : cached;
  const selectedPlayer = $("#boardPlayerFilter").val()?.toString() ?? "all";
  const data = selectedPlayer === "all"
    ? allData
    : allData.filter((record) => record.player1 === selectedPlayer || record.player2 === selectedPlayer);
  const total = data.length;
  const wins = data.filter((record) => record.result === "win").length;
  const loses = data.filter((record) => record.result === "lose").length;
  const known = wins + loses;
  const unknown = total - known;
  const volume = data.reduce((sum, record) => sum + record.price, 0);
  const winRate = known > 0 ? ((wins / known) * 100).toFixed(2) : "0.00";
  const selectedKnown = selectedPlayer === "all"
    ? []
    : data.filter((record) => record.side === "a" || record.side === "b");
  const selectedWins = selectedKnown.filter(
    (record) =>
      (record.player1 === selectedPlayer && record.side === "a") ||
      (record.player2 === selectedPlayer && record.side === "b"),
  ).length;
  const selectedLosses = selectedKnown.length - selectedWins;
  const selectedWinRate = selectedKnown.length > 0 ? ((selectedWins / selectedKnown.length) * 100).toFixed(2) : "0.00";
  const sideA = data.filter((record) => record.side === "a").length;
  const sideB = data.filter((record) => record.side === "b").length;
  const sideKnown = sideA + sideB;
  const sideAWinRate = sideKnown > 0 ? ((sideA / sideKnown) * 100).toFixed(2) : "0.00";
  const sideBWinRate = sideKnown > 0 ? ((sideB / sideKnown) * 100).toFixed(2) : "0.00";

  $("#boardScanCount").text(`ข้อมูล: ${total} รายการ`);
  $("#boardStats").html(
    `<div class="row text-center">
      <div class="col-md-3 mb-2"><div class="border rounded p-2">ทั้งหมด<br><b>${total.toLocaleString()}</b></div></div>
      <div class="col-md-3 mb-2"><div class="border rounded p-2">ชนะ/แพ้/ไม่ทราบ<br><b>${wins.toLocaleString()} / ${loses.toLocaleString()} / ${unknown.toLocaleString()}</b></div></div>
      <div class="col-md-3 mb-2"><div class="border rounded p-2">Win rate<br><b>${winRate}%</b></div></div>
      <div class="col-md-3 mb-2"><div class="border rounded p-2">Volume<br><b>${volume.toLocaleString()} Zen</b></div></div>
      ${selectedPlayer === "all" ? "" : `<div class="col-md-12 mb-2"><div class="border rounded p-2">${selectedPlayer} winrate<br><b>${selectedWinRate}%</b><br><span class="f10">${selectedWins.toLocaleString()} / ${selectedKnown.length.toLocaleString()} ชนะ/แพ้ ${selectedWins.toLocaleString()} / ${selectedLosses.toLocaleString()}</span></div></div>`}
      <div class="col-md-6 mb-2"><div class="border rounded p-2">Player 1 winrate<br><b>${sideAWinRate}%</b><br><span class="f10">${sideA.toLocaleString()} / ${sideKnown.toLocaleString()}</span></div></div>
      <div class="col-md-6 mb-2"><div class="border rounded p-2">Player 2 winrate<br><b>${sideBWinRate}%</b><br><span class="f10">${sideB.toLocaleString()} / ${sideKnown.toLocaleString()}</span></div></div>
    </div>`,
  );
};

const bet = async (id: number) => {
  const sendBet = await fetch(`?mod=match&id=${id}`);
  const sendBetBody = await sendBet.text();

  const parser = new DOMParser();
  let doc = parser.parseFromString(sendBetBody, "text/html");

  let notFound = $(doc)
    .find(".mb-3")
    .contents()
    .filter(function () {
      return this.nodeType === 3 && this.nodeValue.includes("ไม่พบรายการนี้");
    });
  if (notFound.length > 0) {
    logger.warn(`ไม่พบรายการ ${id}`);
    toastr.error(`ไม่พบรายการ ${id}`, "Error!", {
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
    });
    return;
  }

  let notEnoughMoney = $(doc)
    .find(".mb-3")
    .contents()
    .filter(function () {
      return this.nodeType === 3 && this.nodeValue.includes("คุณมีเงินไม่พอ");
    });
  if (notEnoughMoney.length > 0) {
    logger.warn(`คุณมีเงินไม่พอ`);
    toastr.error("คุณมีเงินไม่พอ", "Error!", {
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
    });
    return;
  }

  let ownCard = $(doc)
    .find(".mb-3")
    .contents()
    .filter(function () {
      return (
        this.nodeType === 3 &&
        this.nodeValue.includes("ไม่สามารถเปิดไพ่ของคุณเองได้ ค่ะ")
      );
    });
  if (ownCard.length > 0) {
    logger.warn(`ไม่สามารถเปิดไพ่ของคุณเองได้`);
    toastr.error("ไม่สามารถเปิดไพ่ของคุณเองได้", "Error!", {
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
    });
    return;
  }

  let targetUsername = $(doc).find("tbody:eq(1) td:eq(5) a").text();
  let targetCard = $(doc).find("tbody:eq(1) td:eq(0) img").attr("src")?.split("/")[2] ?? "";
  let yourCard = $(doc).find("tbody:eq(1) td:eq(2) img").attr("src")?.split("/")[2] ?? "";
  let resultMatch = $(doc).find("tbody:eq(1) td:eq(1) h4:eq(1)").first().text();
  let MatchPrice = $(doc).find("tbody:eq(1) td:eq(1) h5").first().text();

  let success = false;

  let matchEnd = $(doc).find("tbody:eq(1) td:eq(1) div");
  if (matchEnd.length > 0) {
    logger.warn(`รายการนี้แข่งขันจบแล้ว`);
    toastr.warning("รายการนี้แข่งขันจบแล้ว", "ไม่พบการแข่งขัน " + id + "!", {
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
    });
    success = true;
  }

  cardArr.map((x) => {
    if (x.card == targetCard) {
      targetCard = x.txt;
    }
    if (x.card == yourCard) {
      yourCard = x.txt;
    }
  });

  if (resultMatch == "คุณชนะ") {
    logger.info(
      `คุณชนะ ${targetUsername} (${targetCard} แพ้ ${yourCard}) ได้รับ ${MatchPrice}`,
    );
    toastr.success(
      `คุณได้รับ ${MatchPrice}`,
      `คุณชนะ ${targetUsername} (<font color="${
        targetCard.includes("♦") || targetCard.includes("♥")
          ? "#ff0000"
          : "#000000"
      }">${targetCard}</font> แพ้ <font color="${
        yourCard.includes("♦") || yourCard.includes("♥")
          ? "#ff0000"
          : "#000000"
      }">${yourCard}</font>)!`,
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
      },
    );
    let money = $("#money").text().replace(/,/g, "");
    animateValue(
      $("#money")[0],
      Number(money),
      Number(money) + parseInt(MatchPrice.replace(/\D/g, "")),
      500,
    );
    money = String(
      Number($("#money").text().replace(/,/g, "")) +
        parseInt(MatchPrice.replace(/\D/g, "")),
    );
    success = true;
  } else if (resultMatch == "คุณแพ้") {
    logger.warn(
      `คุณแพ้ ${targetUsername} (${targetCard} ชนะ ${yourCard}) เสีย ${MatchPrice}`,
    );
    toastr.error(
      `คุณเสีย ${MatchPrice}`,
      `คุณแพ้ ${targetUsername} (<font color="${
        targetCard.includes("♦") || targetCard.includes("♥")
          ? "#ff0000"
          : "#000000"
      }">${targetCard}</font> ชนะ <font color="${
        yourCard.includes("♦") || yourCard.includes("♥")
          ? "#ff0000"
          : "#000000"
      }">${yourCard}</font>)!`,
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
      },
    );
    let money = $("#money").text().replace(/,/g, "");
    animateValue(
      $("#money")[0],
      Number(money),
      Number(money) - parseInt(MatchPrice.replace(/\D/g, "")),
      500,
    );
    money = String(
      Number($("#money").text().replace(/,/g, "")) -
        parseInt(MatchPrice.replace(/\D/g, "")),
    );
    success = true;
  }

  if (success) {
    $(`.btn-bet[id="${id}"]`).prop("disabled", true);
    cardData = cardData.filter((card) => card.id !== String(id));
    syncPlayerFilter();
    onSelectChange();
  }
};
