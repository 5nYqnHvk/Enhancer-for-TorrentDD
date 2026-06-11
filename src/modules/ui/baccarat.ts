import { createLogger } from "../../utils/logger";
import toastr from "toastr";

const logger = createLogger("Baccarat");

export const initBaccaratModule = () => {
  try {
    injectBaccaratEnhancements();
  } catch (err) {
    logger.error("initBaccaratModule failed", err);
  }
};

type Side = "P" | "B" | "T";

const injectBaccaratEnhancements = () => {
  // --- parse history rows ---
  const parseHistory = (): Side[] => {
    const results: Side[] = [];
    $("table.table tbody tr, .history-row, .result-row").each((_, tr) => {
      const text = $(tr).text();
      if (/player|ผู้เล่น/i.test(text)) results.push("P");
      else if (/banker|เจ้ามือ/i.test(text)) results.push("B");
      else if (/tie|เสมอ/i.test(text)) results.push("T");
    });
    return results;
  };

  const calcStats = (history: Side[]) => {
    const total = history.length;
    const p = history.filter((x) => x === "P").length;
    const b = history.filter((x) => x === "B").length;
    const t = history.filter((x) => x === "T").length;
    return { total, p, b, t,
      pRate: total ? ((p / total) * 100).toFixed(1) : "0.0",
      bRate: total ? ((b / total) * 100).toFixed(1) : "0.0",
    };
  };

  const calcStreak = (history: Side[]): { side: Side; count: number } | null => {
    if (!history.length) return null;
    const last = history[history.length - 1];
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] === last) count++;
      else break;
    }
    return { side: last, count };
  };

  // --- stats panel ---
  const $statsPanel = $(`<div id="tdd-bac-stats" class="card mb-2">
    <div class="card-body py-2 d-flex flex-wrap" style="gap:12px;font-size:13px">
      <span>Player: <b id="tdd-bac-p">—</b></span>
      <span>Banker: <b id="tdd-bac-b">—</b></span>
      <span>Tie: <b id="tdd-bac-t">—</b></span>
      <span id="tdd-bac-streak"></span>
    </div>
  </div>`);

  const $betArea = $(".bet-area, #bet-form, form[action*='baccarat'], .baccarat-form").first();
  const $anchor = $betArea.length ? $betArea : $("table.table").first();
  $anchor.before($statsPanel);

  const updateStats = () => {
    const history = parseHistory();
    const { p, b, t, pRate, bRate } = calcStats(history);
    const streak = calcStreak(history);
    $("#tdd-bac-p").text(`${p} (${pRate}%)`);
    $("#tdd-bac-b").text(`${b} (${bRate}%)`);
    $("#tdd-bac-t").text(String(t));
    if (streak && streak.count >= 2) {
      const label = streak.side === "P" ? "Player" : streak.side === "B" ? "Banker" : "Tie";
      const color = streak.side === "P" ? "text-primary" : streak.side === "B" ? "text-danger" : "text-warning";
      $("#tdd-bac-streak").html(`Streak: <b class="${color}">${label} ×${streak.count}</b>`);
    } else {
      $("#tdd-bac-streak").text("");
    }
  };

  updateStats();

  // --- auto-bet ---
  const $betBtn = $("button[onclick*='bet'], input[type='submit'][value*='วาง'], button[type='submit']").first();
  if (!$betBtn.length) return;

  const $autoPanel = $(`<div id="tdd-bac-auto" class="card mb-2">
    <div class="card-header py-1"><small><b>Auto-bet Baccarat</b></small></div>
    <div class="card-body py-2 d-flex flex-wrap align-items-center" style="gap:8px">
      <label class="mb-0"><small>จำนวนรอบ</small>
        <input id="tdd-bac-rounds" type="number" class="form-control form-control-sm" style="width:70px" value="5" min="1" max="999" />
      </label>
      <label class="mb-0"><small>หน่วง (วินาที)</small>
        <input id="tdd-bac-delay" type="number" class="form-control form-control-sm" style="width:70px" value="3" min="1" max="60" />
      </label>
      <button id="tdd-bac-start" class="btn btn-sm btn-success">เริ่ม Auto-bet</button>
      <button id="tdd-bac-stop" class="btn btn-sm btn-danger" disabled>หยุด</button>
      <small id="tdd-bac-status" class="text-muted"></small>
    </div>
  </div>`);

  $statsPanel.after($autoPanel);

  let stopped = false;
  let running = false;

  $("#tdd-bac-start").on("click", async () => {
    if (running) return;
    const rounds = parseInt($("#tdd-bac-rounds").val() as string) || 5;
    const delay = (parseInt($("#tdd-bac-delay").val() as string) || 3) * 1000;
    stopped = false;
    running = true;
    $("#tdd-bac-start").prop("disabled", true);
    $("#tdd-bac-stop").prop("disabled", false);

    for (let i = 0; i < rounds; i++) {
      if (stopped) break;
      $("#tdd-bac-status").text(`รอบ ${i + 1}/${rounds}`);
      try {
        $betBtn[0].click();
        await new Promise((r) => setTimeout(r, 300));
        // confirm dialog if present
        const $confirm = $(".swal2-confirm, .btn-confirm, [data-confirm]");
        if ($confirm.length) $confirm.first()[0].click();
        updateStats();
      } catch (err) {
        logger.error("auto-bet click failed", err);
      }
      if (i < rounds - 1 && !stopped) await new Promise((r) => setTimeout(r, delay));
    }

    running = false;
    stopped = false;
    $("#tdd-bac-start").prop("disabled", false);
    $("#tdd-bac-stop").prop("disabled", true);
    $("#tdd-bac-status").text(stopped ? "หยุดแล้ว" : `เสร็จ ${rounds} รอบ`);
    toastr.info("Auto-bet เสร็จสิ้น", "Baccarat");
  });

  $("#tdd-bac-stop").on("click", () => {
    stopped = true;
  });
};
