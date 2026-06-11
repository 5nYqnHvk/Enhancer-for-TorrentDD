import { createLogger } from "../../utils/logger";
import { fetctSettingData } from "../data/fetchData";
import swal from "sweetalert2";

const logger = createLogger("Bank");
const settingData = await fetctSettingData();

const maxBulkRequests = 100;
const maxBulkMoneyAmount = 500000 * maxBulkRequests;
const maxBulkUploadAmountMb = 1000000 * maxBulkRequests;
const moneyChunks = [500000, 100000, 10000, 1000, 100, 10];
const uploadChunks = [
  { value: "1TB", mb: 1000000 },
  { value: "100GB", mb: 100000 },
  { value: "10GB", mb: 10000 },
  { value: "1GB", mb: 1000 },
  { value: "100MB", mb: 100 },
  { value: "10MB", mb: 10 },
  { value: "5MB", mb: 5 },
];

export const initBankModule = async () => {
  if (!settingData.bank.enabledBankModule) return;
  initBankBulkExchange();
};

const initBankBulkExchange = () => {
  const heading = $("h3").filter((_index, el) => $(el).text().trim() === "แลกเปลี่ยนเงิน").first();
  if (!heading.length) return;

  heading.after(
    `<div class="alert alert-light border border-info mx-auto" style="max-width:900px;">
      <h4 class="text-center fw400 text-dark mt-2 mb-3">Bulk Exchange</h4>
      <div class="row text-dark">
        <div class="col-md-6 mb-3">
          <div class="border rounded p-3 h-100">
            <h6 class="text-info">Zen → Upload</h6>
            <div class="input-group">
              <input id="bulkMoneyAmount" class="form-control" placeholder="เช่น 1234567 หรือ 1,000,000">
              <div class="input-group-append"><span class="input-group-text">Zen</span></div>
            </div>
            <div id="bulkMoneyPreview" class="f10 text-muted mt-2">ใส่จำนวน Zen ที่ต้องการแลก</div>
            <button id="bulkMoneySubmit" class="btn btn-success btn-block mt-2">แลก Zen เป็น Upload</button>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="border rounded p-3 h-100">
            <h6 class="text-success">Upload → Zen</h6>
            <div class="input-group">
              <input id="bulkUploadAmount" class="form-control" placeholder="เช่น 1500MB, 1.5GB, 0.5TB">
              <div class="input-group-append"><span class="input-group-text">MB/GB/TB</span></div>
            </div>
            <div id="bulkUploadPreview" class="f10 text-muted mt-2">ใส่จำนวน Upload ที่ต้องการแลก</div>
            <button id="bulkUploadSubmit" class="btn btn-info btn-block mt-2">แลก Upload เป็น Zen</button>
          </div>
        </div>
      </div>
      <div id="bulkBankStatus" class="text-dark text-center f11">สถานะ: พร้อมใช้งาน</div>
    </div>`,
  );

  $("#bulkMoneyAmount").on("input", () => previewMoneyExchange());
  $("#bulkUploadAmount").on("input", () => previewUploadExchange());
  $("#bulkMoneySubmit").on("click", async () => await runMoneyExchange());
  $("#bulkUploadSubmit").on("click", async () => await runUploadExchange());
  bindOriginalForms();
};

const bindOriginalForms = () => {
  $("form")
    .has("input[name='action']")
    .each((_index, form) => {
      const originalButton = $(form).find("button").first();
      originalButton.removeAttr("onclick");
      originalButton.off("click.enhancerBank").on("click.enhancerBank", async (event) => {
        event.preventDefault();
        await runOriginalExchange($(form));
      });
      $(form).off("submit.enhancerBank").on("submit.enhancerBank", async (event) => {
        event.preventDefault();
        await runOriginalExchange($(form));
      });
    });
};

const runOriginalExchange = async (form: JQuery<HTMLFormElement>) => {
  const action = form.find("input[name='action']").val()?.toString() ?? "";
  const field = action === "moneytoupload" ? "money" : "upload";
  const value = form.find(`[name='${field}']`).val()?.toString() ?? "";
  if (!action || !value) return setStatus("ไม่พบข้อมูลที่จะแลก");

  setButtonsDisabled(true);
  form.find("button").prop("disabled", true);
  try {
    setStatus(`กำลังแลก ${value}`);
    notifyInfo(`กำลังแลก ${value}`);
    await submitExchange(action, field, value);
    await refreshBalances();
    setStatus(`แลก ${value} เสร็จแล้ว`);
    notifySuccess(`แลก ${value} เสร็จแล้ว`);
  } catch (err) {
    logger.error("แลกเปลี่ยนเงินไม่สำเร็จ", err);
    setStatus("แลกไม่สำเร็จ ตรวจสอบยอดเงิน/Upload หรือ connection");
    notifyError("แลกไม่สำเร็จ ตรวจสอบยอดเงิน/Upload หรือ connection");
  } finally {
    setButtonsDisabled(false);
    form.find("button").prop("disabled", false);
  }
};

const previewMoneyExchange = () => {
  const amount = parseNumber($("#bulkMoneyAmount").val()?.toString() ?? "");
  const chunks = splitByChunks(amount, moneyChunks);
  if (chunks.length > maxBulkRequests) return renderLimitPreview("#bulkMoneyPreview", maxBulkMoneyAmount, "Zen");
  renderPreview("#bulkMoneyPreview", amount, chunks.map((chunk) => `${chunk.toLocaleString()} Zen`));
};

const previewUploadExchange = () => {
  const amount = parseUploadAmount($("#bulkUploadAmount").val()?.toString() ?? "");
  const chunks = splitUploadChunks(amount);
  if (chunks.length > maxBulkRequests) return renderLimitPreview("#bulkUploadPreview", maxBulkUploadAmountMb, "MB");
  renderPreview("#bulkUploadPreview", amount, chunks.map((chunk) => `${chunk.mb.toLocaleString()} MB`));
};

const renderPreview = (selector: string, amount: number, chunks: string[]) => {
  if (amount <= 0) {
    $(selector).text("ใส่จำนวนที่ต้องการแลก");
    return;
  }
  if (chunks.length === 0) {
    $(selector).text("จำนวนน้อยกว่า option ขั้นต่ำของเว็บ");
    return;
  }
  $(selector).text(`${chunks.length} request: ${chunks.join(" + ")}`);
};

const renderLimitPreview = (selector: string, maxAmount: number, unit: string) => {
  $(selector).text(`จำนวนมากเกินไป สูงสุด ${maxAmount.toLocaleString()} ${unit} ต่อครั้ง (${maxBulkRequests} request)`);
};

const runMoneyExchange = async () => {
  const amount = parseNumber($("#bulkMoneyAmount").val()?.toString() ?? "");
  if (amount > maxBulkMoneyAmount) return setStatus(`จำนวนมากเกินไป สูงสุด ${maxBulkMoneyAmount.toLocaleString()} Zen ต่อครั้ง`);

  const chunks = splitByChunks(amount, moneyChunks);
  await runExchange(
    chunks.map((chunk) => ({ action: "moneytoupload", field: "money", value: `${chunk}Z`, amount: chunk })),
    "Zen → Upload",
  );
};

const runUploadExchange = async () => {
  const amount = parseUploadAmount($("#bulkUploadAmount").val()?.toString() ?? "");
  if (amount > maxBulkUploadAmountMb) return setStatus(`จำนวนมากเกินไป สูงสุด ${maxBulkUploadAmountMb.toLocaleString()} MB ต่อครั้ง`);

  const chunks = splitUploadChunks(amount);
  await runExchange(
    chunks.map((chunk) => ({ action: "uploadtomoney", field: "upload", value: chunk.value, amount: chunk.mb })),
    "Upload → Zen",
  );
};

const runExchange = async (jobs: { action: string; field: string; value: string; amount: number }[], label: string) => {
  if (jobs.length === 0) return setStatus("ไม่มีรายการให้แลก");
  if (jobs.length > maxBulkRequests) return setStatus(`จำนวน request มากเกินไป แบ่งแลกทีละไม่เกิน ${maxBulkRequests} request`);

  const confirmed = await confirmExchange(jobs, label);
  if (!confirmed) return setStatus("ยกเลิกแล้ว");

  logger.info(`${label}: เริ่ม bulk exchange`, { requests: jobs.length, total: jobs.reduce((sum, job) => sum + job.amount, 0) });
  logger.debug("Bulk exchange jobs", jobs);
  notifyInfo(`${label}: เริ่ม ${jobs.length} request`);
  setButtonsDisabled(true);
  try {
    for (let index = 0; index < jobs.length; index++) {
      const job = jobs[index];
      setStatus(`${label}: ${index + 1}/${jobs.length} (${job.value})`);
      if (index === 0 || index === jobs.length - 1 || (index + 1) % 10 === 0) notifyInfo(`${label}: ${index + 1}/${jobs.length}`);
      await submitExchange(job.action, job.field, job.value);
      await wait(350);
    }
    await refreshBalances();
    setStatus(`${label}: เสร็จแล้ว ${jobs.length} request`);
    notifySuccess(`${label}: เสร็จแล้ว ${jobs.length} request`);
  } catch (err) {
    logger.error("แลกเปลี่ยนเงินแบบ bulk ไม่สำเร็จ", err);
    setStatus("แลกไม่สำเร็จ ตรวจสอบยอดเงิน/Upload หรือ connection");
    notifyError("แลกไม่สำเร็จ ตรวจสอบยอดเงิน/Upload หรือ connection");
  } finally {
    setButtonsDisabled(false);
  }
};

const confirmExchange = async (jobs: { amount: number; value: string }[], label: string) => {
  const total = jobs.reduce((sum, job) => sum + job.amount, 0);
  const result = await swal.fire({
    title: "ยืนยัน Bulk Exchange?",
    html: `${label}<br>${jobs.length} request<br>รวม ${total.toLocaleString()}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "เริ่มแลก",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#28a745",
  });
  return result.isConfirmed;
};

const submitExchange = async (action: string, field: string, value: string) => {
  const body = new URLSearchParams();
  body.set(field, value);
  body.set("action", action);

  const res = await fetch("bank.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const alert = $(doc).find(".content-wrapper .mb-3 > .alert").first();
  const title = alert.find("h4").first().text().trim().toLowerCase();
  const message = alert.find(".text-muted").first().text().trim();

  if (alert.hasClass("alert-success") || title === "success") return;
  if (alert.hasClass("alert-warning") || title === "error") throw new Error(message || "exchange rejected");

  throw new Error("exchange status not found");
};

const refreshBalances = async () => {
  const res = await fetch("bank.php");
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const money = $(doc).find("#money").text().trim();
  const coin = $(doc).find("#coin").text().trim();
  const uploadText = $(doc).find(".alert.bg-white .text-success").first().text().trim();

  if (money) $("#money").text(money);
  if (coin) $("#coin").text(coin);
  if (uploadText) $(".alert.bg-white .text-success").first().html(`<i class="fal fa-cloud-upload fa-md mr-1"></i>${uploadText.replace(/^Upload:\s*/, "Upload: ")}`);
};

const splitByChunks = (amount: number, chunks: number[]) => {
  const result: number[] = [];
  let remaining = Math.floor(amount);
  for (const chunk of chunks) {
    while (remaining >= chunk) {
      result.push(chunk);
      remaining -= chunk;
    }
  }
  return result;
};

const splitUploadChunks = (amountMb: number) => {
  const result: { value: string; mb: number }[] = [];
  let remaining = Math.floor(amountMb);
  for (const chunk of uploadChunks) {
    while (remaining >= chunk.mb) {
      result.push(chunk);
      remaining -= chunk.mb;
    }
  }
  return result;
};

const parseNumber = (value: string) => {
  const normalized = value.trim();
  if (/\d+,\d{1,2}(?!\d)/.test(normalized)) return 0;
  return Number(normalized.replace(/,/g, "").match(/\d+(?:\.\d+)?/)?.[0] ?? 0);
};

const parseUploadAmount = (value: string) => {
  const amount = parseNumber(value);
  const unit = value.toUpperCase().match(/TB|GB|MB/)?.[0] ?? "MB";
  if (unit === "TB") return amount * 1000000;
  if (unit === "GB") return amount * 1000;
  return amount;
};

const setButtonsDisabled = (disabled: boolean) => {
  $("#bulkMoneySubmit,#bulkUploadSubmit").prop("disabled", disabled);
};

const setStatus = (text: string) => {
  $("#bulkBankStatus").text(`สถานะ: ${text}`);
};

const notifyInfo = (message: string) => {
  toastr.info(message, "Bank");
};

const notifySuccess = (message: string) => {
  toastr.success(message, "Bank");
};

const notifyError = (message: string) => {
  toastr.error(message, "Bank");
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
