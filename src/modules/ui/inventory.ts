import { createLogger } from "../../utils/logger";
import { renderPagination } from "../../utils/pagination";

const logger = createLogger("Inventory");

const PAGE_SIZE = 30;
let currentPage = 1;

export const initInventoryModule = async () => {
  const { fetctSettingData } = await import("../data/fetchData");
  if (!(await fetctSettingData()).inventory.enabledInventoryModule) return;
  try {
    observeAndInject();
  } catch (err) {
    logger.error("initInventoryModule failed", err);
  }
};

const getImgId = (el: HTMLElement) => {
  const src = $(el).find("img").attr("src") ?? "";
  return parseInt(src.match(/\/(\d+)\.(gif|png)/)?.[1] ?? "0") || 0;
};

const getClass = (el: HTMLElement) =>
  ($(el).attr("class") ?? "").split(/\s+/).find(c => c.startsWith("class-")) ?? "";

const injectPetModal = () => {
  if ($("#tdd-inv-modal").length) { $("#tdd-inv-modal").show(); return; }

  const $modal = $(`<div id="tdd-inv-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center">
    <div style="background:#fff;border-radius:8px;padding:16px;max-width:520px;width:95%;max-height:80vh;overflow-y:auto">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <b id="tdd-inv-modal-title">รายการ</b>
        <button id="tdd-inv-modal-close" class="btn btn-sm btn-secondary">✕</button>
      </div>
      <div id="tdd-inv-modal-grid" class="d-flex flex-wrap"></div>
    </div>
  </div>`);

  $("body").append($modal);
  $("#tdd-inv-modal-close").on("click", () => $modal.hide());
  $modal.on("click", (e) => { if (e.target === $modal[0]) $modal.hide(); });
  $modal.on("click", "[data-imgid]", function () {
    $("#tdd-inv-search").val(String($(this).data("imgid"))).trigger("input");
    $modal.hide();
  });
};

const openModal = () => {
  injectPetModal();
  const $items = $(".tab-pane.active .item");
  const isPet = $items.first().hasClass("pet");
  const seen = new Map<number, string>();
  $items.each((_, el) => {
    const id = getImgId(el);
    if (id && !seen.has(id)) seen.set(id, $(el).find("img").attr("src") ?? "");
  });
  const grid = Array.from(seen.entries()).map(([id, src]) =>
    `<div class="text-center p-1" style="width:70px;cursor:pointer" data-imgid="${id}" title="ID: ${id}">
      <img src="${src}" style="max-width:48px;max-height:48px">
      <div style="font-size:10px">#${id}</div>
    </div>`
  ).join("");
  $("#tdd-inv-modal-grid").html(grid || "<p class='text-muted p-2'>ไม่มีรายการ</p>");
  $("#tdd-inv-modal-title").text(isPet ? "Pet ที่มี" : "Icon ที่มี");
  $("#tdd-inv-modal").show();
};

const runFilter = (resetPage = false) => {
  if (resetPage) currentPage = 1;

  const q = ($("#tdd-inv-search").val() as string).toLowerCase().trim();
  const cls = $("#tdd-inv-class").val() as string;
  const $all = $(".tab-pane.active .item");

  const matched: HTMLElement[] = [];
  $all.each((_, el) => {
    const matchText = !q || $(el).text().toLowerCase().includes(q) || String(getImgId(el)).includes(q);
    const matchClass = !cls || getClass(el) === cls;
    if (matchText && matchClass) matched.push(el);
  });

  const total = matched.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (currentPage > pages) currentPage = pages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = new Set(matched.slice(start, start + PAGE_SIZE));
  $all.each((_, el) => $(el).toggle(visible.has(el)));

  $("#tdd-inv-count").text(total ? `${total} รายการ` : "");
  renderPagination($(".tdd-inv-pager"), total, currentPage, PAGE_SIZE, (p) => {
    currentPage = p;
    runFilter();
    $("html, body").animate({ scrollTop: $(".nav-pills").offset()?.top ?? 0 }, 150);
  });
};

const injectFilterBar = () => {
  if ($("#tdd-inv-bar").length) return;

  const $target = $(".nav-pills").closest(".mt-3");
  if (!$target.length) return;

  const $bar = $(`<div id="tdd-inv-bar" class="mb-2 d-flex flex-wrap align-items-center justify-content-center" style="gap:8px">
    <div class="input-group input-group-sm" style="max-width:210px">
      <input id="tdd-inv-search" class="form-control" placeholder="ค้นหา..." />
      <div class="input-group-append">
        <button id="tdd-inv-petlist" class="btn btn-outline-secondary" type="button">!</button>
      </div>
    </div>
    <select id="tdd-inv-class" class="form-control form-control-sm" style="max-width:110px">
      <option value="">ทุก Class</option>
      <option value="class-ss">SS</option>
      <option value="class-s">S</option>
      <option value="class-a">A</option>
      <option value="class-b">B</option>
    </select>
    <small id="tdd-inv-count" class="text-muted"></small>
  </div>`);

  $target.prepend($bar);

  const $card = $(".tab-content").closest(".card");
  $card.before($(`<div class="tdd-inv-pager my-1"></div>`));
  $card.after($(`<div class="tdd-inv-pager my-1"></div>`));

  $("#tdd-inv-search").on("input", () => runFilter(true));
  $("#tdd-inv-class").on("change", () => runFilter(true));
  $("#tdd-inv-petlist").on("click", openModal);

  $(document).on("shown.bs.tab", 'a[data-toggle="tab"]', (e) => {
    ($("#tdd-inv-search") as JQuery<HTMLInputElement>).val("");
    $("#tdd-inv-class").val("");
    const isPet = $(e.target).attr("href") === "#pet";
    $("#tdd-inv-class").toggle(isPet);
    runFilter(true);
  });
};

const observeAndInject = () => {
  const observer = new MutationObserver(() => {
    injectFilterBar();
    runFilter(true);
  });
  ["pets-sortable", "icons-sortable", "items-sortable"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el, { childList: true });
  });
  injectFilterBar();
  runFilter(true);
};
