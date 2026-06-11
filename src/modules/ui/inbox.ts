import { createLogger } from "../../utils/logger";
import { renderPagination } from "../../utils/pagination";
import swal from "sweetalert2";

const logger = createLogger("Inbox");
const PAGE_SIZE = 15;

export const initInboxModule = async () => {
  const { fetctSettingData } = await import("../data/fetchData");
  if (!(await fetctSettingData()).inbox.enabledInboxModule) return;
  try {
    injectInboxToolbar();
  } catch (err) {
    logger.error("initInboxModule failed", err);
  }
};

const injectInboxToolbar = () => {
  const $form = $("form[action='delete_messages.php']");
  if (!$form.length) return;

  const $cards = $form.find(".card.rounded.border.mb-3");
  if (!$cards.length) return;

  // clone bottom actions bar to top
  const $bottomActions = $form.find(".text-center").last();
  const $topActions = $bottomActions.clone(true);
  $form.prepend($topActions);

  const $bar = $(`<div class="mb-3 d-flex flex-wrap align-items-center" style="gap:8px">
    <input id="tdd-inbox-search" class="form-control form-control-sm" style="max-width:240px" placeholder="ค้นหาข้อความ..." />
    <select id="tdd-inbox-sender" class="form-control form-control-sm" style="max-width:160px"></select>
    <label class="align-self-center ml-1" style="cursor:pointer;user-select:none">
      <input type="checkbox" id="tdd-inbox-unread" style="margin-right:4px" />ใหม่เท่านั้น
    </label>
    <button id="tdd-inbox-delete" class="btn btn-sm btn-danger" disabled type="button">ลบที่เลือก</button>
    <small id="tdd-inbox-count" class="text-muted"></small>
  </div>`);

  $form.before($bar);

  // populate sender dropdown
  const senders = new Set<string>();
  $cards.each((_, el) => {
    const name = $(el).find(".mb-1 b").text().trim();
    if (name) senders.add(name);
  });
  const $sel = $("#tdd-inbox-sender");
  $sel.append(`<option value="">ผู้ส่งทั้งหมด</option>`);
  senders.forEach(s => $sel.append(`<option value="${s}">${s}</option>`));

  // pagination containers (top + bottom)
  const $pgTop = $(`<div class="tdd-inbox-pager mb-2"></div>`);
  const $pgBot = $(`<div class="tdd-inbox-pager mt-2"></div>`);
  $form.prepend($pgTop);
  $form.append($pgBot);

  let currentPage = 1;
  let filteredCards: HTMLElement[] = [];

  const renderPage = () => {
    const total = filteredCards.length;
    const start = (currentPage - 1) * PAGE_SIZE;
    const visible = new Set(filteredCards.slice(start, start + PAGE_SIZE));
    $cards.each((_, el) => $(el).toggle(visible.has(el)));
    $("#tdd-inbox-count").text(`${total} รายการ`);
    renderPagination($(".tdd-inbox-pager"), total, currentPage, PAGE_SIZE, (p) => {
      currentPage = p;
      renderPage();
      $form[0].scrollIntoView({ behavior: "smooth" });
    });
  };

  const render = (resetPage = true) => {
    const q = ($("#tdd-inbox-search").val() as string).toLowerCase().trim();
    const sender = $("#tdd-inbox-sender").val() as string;
    const unreadOnly = $("#tdd-inbox-unread").prop("checked") as boolean;

    filteredCards = $cards.toArray().filter(el => {
      const $el = $(el);
      const isNew = $el.hasClass("border-success") || $el.find(".badge-success").length > 0;
      return (!q || $el.text().toLowerCase().includes(q))
        && (!sender || $el.find(".mb-1 b").text().trim() === sender)
        && (!unreadOnly || isNew);
    });

    if (resetPage) currentPage = 1;
    renderPage();
  };

  $("#tdd-inbox-search").on("input", () => render());
  $("#tdd-inbox-sender, #tdd-inbox-unread").on("change", () => render());

  // bulk delete
  const updateDeleteBtn = () => {
    const count = $(".checkbox:checked").length;
    $("#tdd-inbox-delete")
      .prop("disabled", count === 0)
      .text(count > 0 ? `ลบที่เลือก (${count})` : "ลบที่เลือก");
  };

  $form.on("change", ".checkbox", updateDeleteBtn);

  // override site's btn-checkall to also update our delete button
  let checkAll = false;
  $(".btn-checkall").off("click").on("click", function () {
    checkAll = !checkAll;
    $(".checkbox").prop("checked", checkAll);
    $(".btn-checkall").html(checkAll ? "Uncheck All" : "Check All");
    updateDeleteBtn();
  });

  $("#tdd-inbox-delete").on("click", async () => {
    const $checked = $(".checkbox:checked");
    if (!$checked.length) return;

    const result = await swal.fire({
      title: `ลบ ${$checked.length} ข้อความ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#e74c3c",
    });
    if (!result.isConfirmed) return;

    const ids: string[] = [];
    $checked.each((_, cb) => {
      const href = $(cb).closest(".card").find("a[href*='delete_message']").attr("href") ?? "";
      const m = href.match(/id=(\d+)/);
      if (m) ids.push(m[1]);
    });

    await Promise.allSettled(
      ids.map(id => fetch(`delete_message.php?id=${id}&type=in`))
    );
    $checked.each((_, cb) => $(cb).closest(".card.rounded.border.mb-3").remove());
    updateDeleteBtn();
    render(false);
    logger.info(`ลบ ${ids.length} ข้อความ`);
  });

  render();
};
