import { createLogger } from "../../utils/logger";
import toastr from "toastr";

const logger = createLogger("Craft");

export const initCraftModule = () => {
  try {
    injectCraftEnhancements();
  } catch (err) {
    logger.error("initCraftModule failed", err);
  }
};

const injectCraftEnhancements = () => {
  // inject material count indicators next to required materials
  $("[data-required], .craft-material, .material-need").each((_, el) => {
    const needed = parseInt($(el).attr("data-required") || $(el).text()) || 0;
    const haveEl = $(el).closest("[data-have]");
    const have = parseInt(haveEl.attr("data-have") || "0") || 0;
    if (needed > 0) {
      const color = have >= needed ? "text-success" : "text-danger";
      $(el).append(` <small class="${color}">(มี ${have})</small>`);
    }
  });

  // craft quantity + auto-confirm injection
  $("form.craft-form, form[action*='craft']").each((_, form) => {
    const $form = $(form);
    if ($form.find(".tdd-craft-qty").length) return;

    const $qty = $(`<div class="input-group input-group-sm mt-1 mb-1" style="max-width:180px">
      <div class="input-group-prepend"><span class="input-group-text">จำนวนครั้ง</span></div>
      <input type="number" class="form-control tdd-craft-qty" value="1" min="1" max="99" />
    </div>`);
    const $skip = $(`<div class="form-check mt-1">
      <input type="checkbox" class="form-check-input" id="tdd-craft-skip-${Math.random().toString(36).slice(2)}" />
      <label class="form-check-label">ข้าม confirm</label>
    </div>`);

    $form.find('[type="submit"]').before($qty).before($skip);

    $form.on("submit", async (e) => {
      const skipId = $skip.find("input").attr("id");
      const skipConfirm = $(`#${skipId}`).prop("checked") as boolean;
      const qty = parseInt($qty.find("input").val() as string) || 1;
      if (qty <= 1 && !skipConfirm) return; // normal submit

      e.preventDefault();

      if (!skipConfirm) {
        const { isConfirmed } = await import("sweetalert2").then((m) =>
          m.default.fire({
            title: `Craft ${qty} ครั้ง?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Craft",
            cancelButtonText: "ยกเลิก",
          })
        );
        if (!isConfirmed) return;
      }

      const action = $form.attr("action") || window.location.href;
      const data = new URLSearchParams($form.serialize());
      let success = 0;

      for (let i = 0; i < qty; i++) {
        try {
          const res = await fetch(action, { method: "POST", body: data });
          if (res.ok) success++;
          else break;
        } catch (err) {
          logger.error("craft request failed", err);
          break;
        }
      }
      toastr.success(`Craft สำเร็จ ${success}/${qty} ครั้ง`, "Craft");
      if (success > 0) setTimeout(() => window.location.reload(), 1500);
    });
  });

  // show have/need for each item row in craft table
  $("table.table tbody tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length < 2) return;
    const haveText = tds.eq(1).text().replace(/[^0-9]/g, "");
    const needText = tds.eq(2).text().replace(/[^0-9]/g, "");
    const have = parseInt(haveText) || 0;
    const need = parseInt(needText) || 0;
    if (need > 0) {
      tds.eq(1).addClass(have >= need ? "text-success" : "text-danger");
    }
  });
};
