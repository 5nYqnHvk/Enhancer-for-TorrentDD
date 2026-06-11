import { createLogger } from "../../utils/logger";
import { renderPagination } from "../../utils/pagination";

const logger = createLogger("Marketplace");
const PRICE_KEY = "tdd_nft_prices";
const PAGE_SIZE = 40;

interface NftItem {
  name: string;
  type: string;
  cls: string;
  price: number;
  id: string;
  html: string;
  $col: JQuery; // keep reference for show/hide
}

export const initMarketplaceModule = async () => {
  const { fetctSettingData } = await import("../data/fetchData");
  if (!(await fetctSettingData()).marketplace.enabledMarketplaceModule) return;
  try {
    await loadAllAndRender();
  } catch (err) {
    logger.error("initMarketplaceModule failed", err);
  }
};

const parseItems = (doc: Document | HTMLElement): NftItem[] => {
  const items: NftItem[] = [];
  $(doc).find(".nft-card").each((_, card) => {
    const $card = $(card);
    const $col = $card.closest(".col");
    const src = $card.find("img").attr("src") ?? "";
    const imgId = src.match(/\/(\d+)\.(gif|png)$/)?.[1] ?? "";
    const $el = $col.length ? $col : $card;
    items.push({
      name: $card.find(".data-detail").text().trim(),
      type: $card.find(".data-type").text().trim().toLowerCase(),
      cls:  $card.find(".data-class").text().trim(),
      price: parseFloat($card.find(".data-price").text()) || 0,
      id:   imgId,
      html: $el[0].outerHTML,
      $col: $el,
    });
  });
  return items;
};

const getPageInfo = (doc: Document): { current: number; others: number[] } => {
  const params = new URLSearchParams(window.location.search);
  const current = parseInt(params.get("page") ?? "0");
  const others: number[] = [];
  $(doc).find(".pagination .page-link[href]").each((_, a) => {
    const href = $(a).attr("href") ?? "";
    const m = href.match(/[?&]page=(\d+)/);
    if (m) {
      const p = parseInt(m[1]);
      if (p !== current && !others.includes(p)) others.push(p);
    }
  });
  return { current, others };
};

const loadAllAndRender = async () => {
  const $row = $(".nft-card").first().closest(".col").parent();
  if (!$row.length) return;

  const { others } = getPageInfo(document);

  $(".mt-3.text-center").hide();

  // fetch and append other pages directly into DOM (hidden), so the site's event delegation covers them
  const parser = new DOMParser();
  for (const p of others) {
    try {
      const res = await fetch(`marketplace.php?page=${p}`);
      const html = await res.text();
      const doc = parser.parseFromString(html, "text/html");
      const items = parseItems(doc);
      items.forEach(i => $row.append($(i.html).hide()));
    } catch (err) {
      logger.warn(`fetch page ${p} failed`, err);
    }
  }

  // re-parse all items now that DOM is fully populated
  const allItems = parseItems($row[0]);
  trackPrices(allItems);
  allItems.forEach(i => i.$col.hide());

  // script เว็บ bind .btn-buynow แบบ direct ตอน load — rebind ด้วย delegation ครอบ items ที่ append ทีหลัง
  $row.on("click", ".btn-buynow", function () {
    const $card = $(this).closest(".card");
    (unsafeWindow as any).showBuyPopup(
      $card.find(".data-type").text().trim(),
      Math.round(Number($card.find(".data-id").text().trim())),
      $card.find(".data-seller").text().trim(),
      $card.find(".data-detail").text().trim(),
      $card.find(".data-price").text().trim(),
      $card.find(".data-img").attr("src"),
      $card.find(".data-class").text().trim(),
      $card.find(".data-refine").text().trim(),
    );
  });

  // inject filter bar before row
  const $bar = $(`<div id="tdd-nft-bar" class="mb-3 d-flex flex-wrap align-items-center" style="gap:8px">
    <div class="input-group input-group-sm" style="max-width:240px">
      <input id="tdd-nft-search" class="form-control" placeholder="ค้นหาชื่อ/ID..." />
      <div class="input-group-append">
        <button id="tdd-nft-browse" class="btn btn-outline-secondary" type="button" title="เปิดรายการ">!</button>
      </div>
    </div>
    <select id="tdd-nft-type" class="form-control form-control-sm" style="max-width:110px">
      <option value="">ทุกประเภท</option>
      <option value="icon">Icon</option>
      <option value="pet">Pet</option>
      <option value="item">Item</option>
      <option value="coin">Coin</option>
    </select>
    <select id="tdd-nft-class" class="form-control form-control-sm" style="max-width:100px">
      <option value="">ทุก Class</option>
      <option value="SS">SS</option>
      <option value="S">S</option>
      <option value="A">A</option>
      <option value="B">B</option>
    </select>
    <select id="tdd-nft-sort" class="form-control form-control-sm" style="max-width:160px">
      <option value="">เรียงลำดับ...</option>
      <option value="asc">ราคา ต่ำ→สูง</option>
      <option value="desc">ราคา สูง→ต่ำ</option>
    </select>
    <small id="tdd-nft-count" class="text-muted"></small>
  </div>`);

  $row.before($bar);

  const $pgTop = $(`<div class="tdd-nft-pager mt-2 mb-2"></div>`);
  const $pgBot = $(`<div class="tdd-nft-pager mt-2 mb-2"></div>`);
  $row.before($pgTop);
  $row.after($pgBot);

  let currentPage = 1;

  const render = () => {
    const q    = ($("#tdd-nft-search").val() as string).toLowerCase().trim();
    const type = ($("#tdd-nft-type").val() as string).toLowerCase();
    const cls  = ($("#tdd-nft-class").val() as string);
    const sort = $("#tdd-nft-sort").val() as string;

    let filtered = allItems.filter(item => {
      if (q) {
        const exactId = item.id === q;
        const nameMatch = item.name.toLowerCase().includes(q);
        if (!exactId && !nameMatch) return false;
      }
      if (type && item.type !== type) return false;
      if (cls  && item.cls  !== cls)  return false;
      return true;
    });

    if (sort === "asc")  filtered.sort((a, b) => a.price - b.price);
    if (sort === "desc") filtered.sort((a, b) => b.price - a.price);

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > pages) currentPage = 1;

    const slice = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const sliceSet = new Set(slice.map(i => i.$col[0]));
    allItems.forEach(i => { if (sliceSet.has(i.$col[0])) i.$col.show(); else i.$col.hide(); });
    slice.forEach(i => $row.append(i.$col));
    $("#tdd-nft-count").text(`${total} รายการ`);

    renderPagination($(".tdd-nft-pager"), total, currentPage, PAGE_SIZE, (p) => {
      currentPage = p;
      render();
      $row[0].scrollIntoView({ behavior: "smooth" });
    });
  };

  $("#tdd-nft-search").on("input", () => { currentPage = 1; render(); });
  $("#tdd-nft-type, #tdd-nft-class, #tdd-nft-sort").on("change", () => { currentPage = 1; render(); });
  $("#tdd-nft-browse").on("click", () => injectBrowseModal(allItems, (q) => {
    $("#tdd-nft-search").val(q).trigger("input");
  }));
  render();
};

const injectBrowseModal = (allItems: NftItem[], onSelect: (q: string) => void) => {
  if ($("#tdd-nft-browse-modal").length) { $("#tdd-nft-browse-modal").show(); return; }

  const typeOrder = ["pet", "icon", "item", "coin"];
  const labelMap: Record<string, string> = { pet: "Pets", icon: "Icons", item: "Items", coin: "Coin" };

  // group unique items by type, preserving first-seen img src
  const groups = new Map<string, Map<string, string>>(); // type → id → src
  for (const item of allItems) {
    if (!groups.has(item.type)) groups.set(item.type, new Map());
    const g = groups.get(item.type)!;
    if (!g.has(item.id)) g.set(item.id, item.$col.find("img").attr("src") ?? "");
  }

  const cats = typeOrder
    .filter(t => groups.has(t))
    .map(t => ({ type: t, label: labelMap[t] ?? t, items: groups.get(t)! }));

  const tabBtns = cats.map((c, i) =>
    `<button class="btn btn-sm ${i === 0 ? "btn-info" : "btn-outline-secondary"} tdd-cat-tab mr-1" data-cat="${i}">${c.label}</button>`
  ).join("");

  const panels = cats.map((c, i) => {
    const imgs = Array.from(c.items.entries()).map(([id, src]) =>
      `<div class="text-center p-1" style="width:64px;cursor:pointer" data-q="${id}" data-cat="${i}" title="#${id}">
        <img src="${src}" style="max-width:48px;max-height:48px">
        <div style="font-size:10px">#${id}</div>
      </div>`
    ).join("");
    return `<div class="tdd-cat-panel" data-cat="${i}" style="display:${i === 0 ? "flex" : "none"};flex-wrap:wrap">${imgs}</div>`;
  }).join("");

  const $modal = $(`<div id="tdd-nft-browse-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;border-radius:8px;padding:16px;max-width:560px;width:95%;max-height:85vh;overflow-y:auto">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>${tabBtns}</div>
        <button id="tdd-nft-browse-close" class="btn btn-sm btn-secondary">✕</button>
      </div>
      ${panels}
    </div>
  </div>`);

  $("body").append($modal);
  $("#tdd-nft-browse-close").on("click", () => $modal.hide());
  $modal.on("click", (e) => { if (e.target === $modal[0]) $modal.hide(); });

  $modal.on("click", ".tdd-cat-tab", function () {
    const cat = $(this).data("cat");
    $modal.find(".tdd-cat-tab").removeClass("btn-info").addClass("btn-outline-secondary");
    $(this).removeClass("btn-outline-secondary").addClass("btn-info");
    $modal.find(".tdd-cat-panel").each((_, el) => {
      (el as HTMLElement).style.display = $(el).data("cat") == cat ? "flex" : "none";
    });
  });

  $modal.on("click", "[data-q]", function () {
    const catIdx = parseInt($(this).data("cat"));
    const typeVal = cats[catIdx]?.type ?? "";
    if (typeVal) $("#tdd-nft-type").val(typeVal);
    onSelect(String($(this).data("q")));
    $modal.hide();
  });
};

const trackPrices = (items: NftItem[]) => {
  const prices: Record<string, { price: number; ts: number }> = JSON.parse(
    GM_getValue(PRICE_KEY, "{}") as string
  );
  items.forEach(item => {
    if (!item.name || !item.price) return;
    prices[item.name] = { price: item.price, ts: Date.now() };
  });
  GM_setValue(PRICE_KEY, JSON.stringify(prices));
};
