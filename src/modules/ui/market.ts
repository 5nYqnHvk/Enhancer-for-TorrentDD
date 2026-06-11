import { createLogger } from "../../utils/logger";
import { renderPagination } from "../../utils/pagination";

const logger = createLogger("Market");

const PAGE_SIZE = 20;

export const initMarketModule = async () => {
  const { fetctSettingData } = await import("../data/fetchData");
  if (!(await fetctSettingData()).market.enabledMarketModule) return;
  try {
    injectFilterBar();
  } catch (err) {
    logger.error("initMarketModule failed", err);
  }
};

const injectPetModal = ($boxes: JQuery) => {
  if ($("#tdd-pet-modal").length) { $("#tdd-pet-modal").show(); return; }

  const seen = new Map<number, string>();
  $boxes.each((_, el) => {
    const src = $(el).find("img").attr("src") ?? "";
    const id = parseInt(src.match(/pets\/(\d+)\.gif/)?.[1] ?? "0") || 0;
    if (id && !seen.has(id)) seen.set(id, src);
  });

  const grid = Array.from(seen.entries()).sort((a, b) => a[0] - b[0]).map(([id, src]) =>
    `<div class="text-center p-1" style="width:70px;cursor:pointer" data-petid="${id}" title="ID: ${id}">
      <img src="${src}" style="max-width:48px;max-height:48px">
      <div class="f10">#${id}</div>
    </div>`
  ).join("");

  const $modal = $(`<div id="tdd-pet-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;border-radius:8px;padding:16px;max-width:520px;width:95%;max-height:80vh;overflow-y:auto">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <b>Pet ID List</b>
        <button id="tdd-pet-modal-close" class="btn btn-sm btn-secondary">✕</button>
      </div>
      <div class="d-flex flex-wrap">${grid}</div>
    </div>
  </div>`);

  $("body").append($modal);
  $("#tdd-pet-modal-close").on("click", () => $modal.hide());
  $modal.on("click", (e) => { if (e.target === $modal[0]) $modal.hide(); });
  $modal.on("click", "[data-petid]", function () {
    const id = $(this).data("petid");
    $("#tdd-mkt-search").val(String(id)).trigger("input");
    $modal.hide();
  });
};

const injectFilterBar = () => {
  const $container = $(".d-flex.align-content-center.flex-wrap").first();
  if (!$container.length) return;

  const $boxes = $container.find("div.box[data-id]");
  if (!$boxes.length) return;

  const $bar = $(`<div class="mb-2 d-flex flex-wrap align-items-center" style="gap:8px">
    <div class="input-group input-group-sm" style="max-width:210px">
      <input id="tdd-mkt-search" class="form-control" placeholder="Pet ID..." type="number" min="1" max="51" />
      <div class="input-group-append">
        <button id="tdd-mkt-petlist" class="btn btn-outline-secondary" type="button" title="ดูรายการ Pet">!</button>
      </div>
    </div>
    <select id="tdd-mkt-sort" class="form-control form-control-sm" style="max-width:160px">
      <option value="">เรียงลำดับ...</option>
      <option value="asc">ราคา ต่ำ→สูง</option>
      <option value="desc">ราคา สูง→ต่ำ</option>
    </select>
    <select id="tdd-mkt-class" class="form-control form-control-sm" style="max-width:110px">
      <option value="">ทุก Class</option>
      <option value="class-ss">SS</option>
      <option value="class-s">S</option>
      <option value="class-a">A</option>
      <option value="class-b">B</option>
      <option value="class-c">C</option>
    </select>
    <small id="tdd-mkt-count" class="text-muted"></small>
  </div>`);

  const $pgTop = $(`<div class="tdd-mkt-pager my-1"></div>`);
  const $pgBot = $(`<div class="tdd-mkt-pager my-1"></div>`);
  $container.before($pgTop).before($bar);
  $container.after($pgBot);

  const getPetId = (el: HTMLElement) => {
    const src = $(el).find("img").attr("src") ?? "";
    return parseInt(src.match(/pets\/(\d+)\.gif/)?.[1] ?? "0") || 0;
  };
  const getPrice = (el: HTMLElement) =>
    parseInt($(el).find(".coin-bar").text().replace(/[^0-9]/g, "")) || 0;
  const getClass = (el: HTMLElement) =>
    $(el).find(".b2").attr("class")?.split(/\s+/).find(c => c.startsWith("class-")) ?? "";

  let currentPage = 1;
  let filteredItems: HTMLElement[] = [];

  const renderPage = () => {
    const total = filteredItems.length;
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = new Set(filteredItems.slice(start, start + PAGE_SIZE));
    $boxes.each((_, el) => $(el).toggle(visible.has(el as HTMLElement)));
    $("#tdd-mkt-count").text(`${total} รายการ`);
    renderPagination($(".tdd-mkt-pager"), total, currentPage, PAGE_SIZE, (p) => {
      currentPage = p;
      renderPage();
      $container[0].scrollIntoView({ behavior: "smooth" });
    });
  };

  const render = () => {
    const q = parseInt($("#tdd-mkt-search").val() as string) || 0;
    const sort = $("#tdd-mkt-sort").val() as string;
    const cls = $("#tdd-mkt-class").val() as string;

    let items = $boxes.toArray();
    if (q) items = items.filter(el => getPetId(el) === q);
    if (cls) items = items.filter(el => getClass(el) === cls);
    if (sort) items = items.sort((a, b) =>
      sort === "asc" ? getPrice(a) - getPrice(b) : getPrice(b) - getPrice(a)
    );

    filteredItems = items;
    currentPage = 1;
    renderPage();
  };

  $("#tdd-mkt-search").on("input", render);
  $("#tdd-mkt-sort, #tdd-mkt-class").on("change", render);
  $("#tdd-mkt-petlist").on("click", () => injectPetModal($boxes));
  render();
};
