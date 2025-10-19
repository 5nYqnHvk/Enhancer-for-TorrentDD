import { getLocation } from "../../utils/hook";
import { createLogger } from "../../utils/logger";
import { parseTorrentFromUint8, toBase32 } from "../../utils/torrent";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Torrent");
const settingData = await fetctSettingData();

export const initTorrentModule = async () => {
  if (!settingData.torrent.enabledTorrentModule) return;

  // download button
  if (!settingData.torrent.showDownloadButton) return;
  if (getLocation().pathname !== "/details.php") {
    await initDownloadButton();
  } else {
    await initDownloadButtonDetails();
  }
};

const initDownloadButton = async () => {
  const hasNativeDownload = $("i.fal.fa-download").length > 0;
  if (hasNativeDownload) return;
  $("table tbody tr").each((_, row) => {
    const $row = $(row);

    const detailLink = $row.find('a[href*="details.php?id="]');
    if (!detailLink.length) return;

    const match = detailLink.attr("href").match(/id=(\d+)/);
    const torrentId = match ? match[1] : null;
    if (!torrentId) return;

    const insertAfter = $row
      .find(".box-poster, .badge-outline-success")
      .first();
    if (!insertAfter.length) return;

    const dlBtn = $(`
        <button type="button" class="badge badge-success float-right text-white ml-ic-1 my-fake-dl"
          title="ดาวน์โหลด" data-toggle="tooltip">
          <i class="fal fa-download fa-lg"></i>
        </button>
      `);

    const mgBtn = $(`
        <button type="button" class="badge badge-danger float-right text-white ml-ic-1 my-fake-dl"
          title="ดาวน์โหลดผ่าน Magnet" data-toggle="tooltip">
          <i class="fal fa-magnet fa-lg"></i>
        </button>
      `);

    dlBtn.on("click", async () => {
      dlBtn.prop("disabled", true);
      try {
        await download(`details.php?id=${torrentId}`);
      } finally {
        dlBtn.prop("disabled", false);
      }
    });

    mgBtn.on("click", async () => {
      mgBtn.prop("disabled", true);
      try {
        await magnet(`details.php?id=${torrentId}`);
      } finally {
        mgBtn.prop("disabled", false);
      }
    });
    insertAfter.after(dlBtn);
    dlBtn.before(mgBtn);
  });

  $('[data-toggle="tooltip"]').tooltip?.();
};

const initDownloadButtonDetails = async () => {
  const hasNativeDownload =
    $(".wrapper.d-flex.align-items-center.py-2.border-bottom").find(
      "i.fal.fa-magnet"
    ).length > 0;
  if (hasNativeDownload) return;
  const downloadBtn = $(".btn.btn-inverse-success.border.border-success");
  downloadBtn.removeAttr("onclick");
  const mangnetBtn = $(
    `<button type="button" class="btn btn-outline-success ml-2 border border-success">
        <i class="fal fa-magnet"></i>Magnet
    </button>`
  );

  downloadBtn.after(mangnetBtn);

  downloadBtn.on("click", async () => {
    downloadBtn.prop("disabled", true);
    try {
      await download(getLocation().href);
    } finally {
      downloadBtn.prop("disabled", false);
    }
  });

  mangnetBtn.on("click", async () => {
    mangnetBtn.prop("disabled", true);
    try {
      await magnet(getLocation().href);
    } finally {
      mangnetBtn.prop("disabled", false);
    }
  });
};

const getDownloadUrl = async (url: string) => {
  const getDetail = await fetch(url);
  const detailBody = await getDetail.text();

  const dom = new DOMParser();
  const parser = dom.parseFromString(detailBody, "text/html");

  const downloadUrl = $(parser)
    .find(".btn.btn-inverse-success.border.border-success")
    .attr("onclick")
    .split("'")[1];
  logger.info(`พบลิงค์ดาวน์โหลด: https://www.torrentdd.com/${downloadUrl}`);
  return downloadUrl;
};

const download = async (url: string): Promise<void> => {
  try {
    const getUrl = await getDownloadUrl(url);
    const getFile = await fetch(getUrl);
    logger.info(`กำลังโหลดไฟล์`);
    if (!getFile.ok) {
      logger.error(`ตรวจสอบไฟล์ไม่สำเร็จเนื่องจาก (${getFile.status})`);
      await toastr.error(
        `ตรวจสอบไฟล์ไม่สำเร็จเนื่องจาก (${getFile.status})`,
        "ดาวน์โหลดไม่สำเร็จ!",
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
        }
      );
      return;
    }
    const fileUrl = `https://www.torrentdd.com/${getUrl}`;
    const $a = $(`<a href="${fileUrl}" download style="display:none"></a>`);
    logger.info(`สร้างปุ่มดาวน์โหลดแล้ว`);
    await toastr.success(`คุณได้ดาวน์โหลดแล้ว`, "ดาวน์โหลดสำเร็จ!", {
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
    $("body").append($a);
    $a[0].click();
    $a.remove();
  } catch (err) {
    logger.error(`ดาวน์โหลดไม่สำเร็จ ${err}`);
  }
};

const magnet = async (url: string): Promise<void> => {
  try {
    const getUrl = await getDownloadUrl(url);
    const getFile = await fetch(getUrl);
    logger.info(`กำลังโหลดไฟล์`);
    if (!getFile.ok) {
      logger.error(`ตรวจสอบไฟล์ไม่สำเร็จเนื่องจาก (${getFile.status})`);
      await toastr.error(
        `ตรวจสอบไฟล์ไม่สำเร็จเนื่องจาก (${getFile.status})`,
        "Error!",
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
        }
      );
      return;
    }

    const u8 = new Uint8Array(await getFile.arrayBuffer());
    const { infoSlice, meta } = parseTorrentFromUint8(u8);

    if (!infoSlice) {
      logger.error(`ไม่พบ field 'info' ในไฟล์ .torrent`);
      await toastr.error(
        `ไม่พบ field 'info' ในไฟล์ .torrent`,
        "ดาวน์โหลดไม่สำเร็จ!",
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
        }
      );
      return;
    }
    const shaBuf = await crypto.subtle.digest("SHA-1", infoSlice);
    const infoHash = toBase32(new Uint8Array(shaBuf));

    let magnet = `magnet:?xt=urn:btih:${infoHash}`;
    if (meta.name) magnet += `&dn=${encodeURIComponent(meta.name)}`;
    if (meta.trackers?.length) {
      for (const tr of meta.trackers) magnet += `&tr=${encodeURIComponent(tr)}`;
    }

    logger.info(`สร้างลิงค์ Magnet แล้ว: ${magnet}`);

    const $a = $(`<a href="${magnet}" style="display:none"></a>`);
    logger.info(`สร้างปุ่มดาวน์โหลดแล้ว`);
    await toastr.success(`คุณได้ดาวน์โหลดแล้ว`, "ดาวน์โหลดสำเร็จ!", {
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
    $("body").append($a);
    $a[0].click();
    $a.remove();
  } catch (err) {
    logger.error(`สร้างลิงค์ Magnet ไม่สำเร็จ ${err}`);
  }
};
