import { waitForBootstrap } from "../../utils/hook";
import { fetchUserData, fetctSettingData } from "../data/fetchData";
import { Settings } from "../data/models";
import { createLogger } from "../../utils/logger";
import swal from "sweetalert2";

const logger = createLogger("Settings");
const userInfo = await fetchUserData();
const settingData = await fetctSettingData();

const sounds: Record<string, HTMLAudioElement> = {
  "noti.mp3": new Audio("https://static.5ny.site/assets/music/noti.mp3"),
  "pop.mp3": new Audio("https://static.5ny.site/assets/music/pop.mp3"),
  "alert.mp3": new Audio("https://static.5ny.site/assets/music/alert.mp3"),
};

export const initSettingModule = async () => {
  initSettingButton();
};

const initSettingButton = () => {
  const $menu = $(".dropdown-menu").eq(1);
  if ($menu.length) {
    const $newItem = $("<a>", {
      href: "#",
      class: "dropdown-item font-weight-medium",
      html: "<i class='fal fa-cog mx-0'></i>&nbsp;&nbsp;TDD Settings",
      "data-toggle": "modal",
      "data-target": "#tddSettingsModal",
    });

    const $divider = $("<div>", { class: "dropdown-divider" });
    $menu.children().eq(10).after($divider, $newItem);

    const selectedSound = settingData.others.notificationSound || "";
    $("body").append(
      $(`<div class="modal fade" id="tddSettingsModal" tabindex="-1" role="dialog">
  <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">⚙️ TDD Script Settings</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <span><b>User</b>: ${userInfo.userId}:${userInfo.username}</span>
        </div>
        <hr />

        <!-- grp 1 -->
        <!-- <h6 class="text-primary mb-2">ระบบ Torrents</h6>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="enabledTorrentModule">
                <input type="checkbox" class="form-check-input" id="enabledTorrentModule" ${
                  settingData.torrent.enabledTorrentModule ? "checked" : ""
                } />
                เปิดใช้งานระบบ Torrents <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="showTorrentImage">
                <input type="checkbox" class="form-check-input" id="showTorrentImage" ${
                  settingData.torrent.showTorrentImage ? "checked" : ""
                } />
                แสดงรูปภาพ Torrent <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="showDownloadButton">
                <input type="checkbox" class="form-check-input" id="showDownloadButton" ${
                  settingData.torrent.showDownloadButton ? "checked" : ""
                } ${userInfo.isPremium ? "" : "disabled"} />
                แสดงปุ่มดาวน์โหลด <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="showRateButton">
                <input type="checkbox" class="form-check-input" id="showRateButton" ${
                  settingData.torrent.showRateButton ? "checked" : ""
                } ${userInfo.isPremium ? "" : "disabled"} />
                แสดงปุ่มให้คะแนน <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="updatePeerslist">
                <input type="checkbox" class="form-check-input" id="updatePeerslist" ${
                  settingData.torrent.updatePeerslist ? "checked" : ""
                } />
                อัปเดตรายชื่อ Peers <i class="input-helper"></i></label>
            </div>
        </div>

        <hr /> -->
        <!-- grp 2 -->
        <h6 class="text-primary mb-2">ระบบฟาร์ม</h6>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="enabledFarmModule">
                <input type="checkbox" class="form-check-input" id="enabledFarmModule" ${
                  settingData.farm.enabledFarmModule ? "checked" : ""
                } />
                เปิดใช้งานระบบฟาร์ม <i class="input-helper"></i></label>
            </div>
        </div>
        <!-- <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="autoFarm">
                <input type="checkbox" class="form-check-input" id="autoFarm" ${
                  settingData.farm.autoFarm ? "checked" : ""
                } ${userInfo.isPremium ? "" : "disabled"} />
                เปิดโหมดฟาร์มอัตโนมัติ <i class="input-helper"></i></label>
            </div>
        </div> -->
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="notificationFarm">
                <input type="checkbox" class="form-check-input" id="notificationFarm" ${
                  settingData.farm.notificationFarm ? "checked" : ""
                } />
                แจ้งเตือนเมื่อฟาร์มเสร็จ <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
          <label for="farmUpdateInterval">ช่วงเวลาอัปเดตแจ้งเตือนฟาร์ม (นาที)</label>
          <input type="number" class="form-control" id="farmUpdateInterval" value="${
            settingData.farm.farmUpdateInterval
          }" min="10" max="120" />
        </div>
        <div class="form-group">
          <label for="minPlotReadyForNotification">จำนวนขั้นต่ำที่พร้อมเก็บเกี่ยวที่ต้องการให้แจ้งเตือน</label>
          <input type="number" class="form-control" id="minPlotReadyForNotification" value="${
            settingData.farm.minPlotReadyForNotification
          }" min="1" max="9" />
        </div>
        <hr />

         <!-- grp 3 -->
        <h6 class="text-primary mb-2">ระบบตั่ว</h6>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="enabledTicketModule">
                <input type="checkbox" class="form-check-input" id="enabledTicketModule" ${
                  settingData.ticket.enabledTicketModule ? "checked" : ""
                } />
                เปิดใช้งานระบบตั่ว <i class="input-helper"></i></label>
            </div>
        </div>
        <!-- <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="autoTicket">
                <input type="checkbox" class="form-check-input" id="autoTicket" ${
                  settingData.ticket.autoTicket ? "checked" : ""
                } ${userInfo.isPremium ? "" : "disabled"} />
                เปิดโหมดฟาร์มอัตโนมัติ <i class="input-helper"></i></label>
            </div>
        </div> -->
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="notificationTicket">
                <input type="checkbox" class="form-check-input" id="notificationTicket" ${
                  settingData.ticket.notificationTicket ? "checked" : ""
                } />
                แจ้งเตือนเมื่อตั่วรับได้ <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
          <label for="ticketUpdateInterval">ช่วงเวลาอัปเดตแจ้งเตือนตั่ว (นาที)</label>
          <input type="number" class="form-control" id="ticketUpdateInterval" value="${
            settingData.ticket.ticketUpdateInterval
          }" min="10" max="120" />
        </div>
        <div class="form-group">
          <label for="minTicketReadyForNotification">จำนวนตั่วขั้นต่ำที่พร้อมรับที่ต้องการให้แจ้งเตือน</label>
          <input type="number" class="form-control" id="minTicketReadyForNotification" value="${
            settingData.ticket.minTicketReadyForNotification
          }" min="1" max="9" />
        </div>
        <hr />
        <!-- grp 4 -->
        <h6 class="text-primary mb-2">ระบบกาชา</h6>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="enabledGashaModule">
                <input type="checkbox" class="form-check-input" id="enabledGashaModule" ${
                  settingData.gasha.enabledGashaModule ? "checked" : ""
                } />
                เปิดใช้งานระบบกาชา <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="saveGashaLog">
                <input type="checkbox" class="form-check-input" id="saveGashaLog" ${
                  settingData.gasha.saveGashaLog ? "checked" : ""
                } ${userInfo.isPremium ? "" : "disabled"} />
                บันทึกประวัติกาชา <i class="input-helper"></i></label>
            </div>
        </div>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="showGashaLog">
                <input type="checkbox" class="form-check-input" id="showGashaLog" ${
                  settingData.gasha.showGashaLog ? "checked" : ""
                } ${userInfo.isPremium ? "" : "disabled"} />
                แสดงประวัติกาชา <i class="input-helper"></i></label>
            </div>
        </div>
        <button type="button" class="btn btn-block btn-danger" id="resetGashaData">ลบข้อมูลกาชา</button>


        <hr />
        <!-- grp 5 -->
        <h6 class="text-primary mb-2">ระบบ BetCard</h6>
        <div class="form-group">
            <div class="form-check form-check-flat">
            <label class="form-check-label" for="enabledBetCardModule">
                <input type="checkbox" class="form-check-input" id="enabledBetCardModule" ${
                  settingData.betcard.enabledBetCardModule ? "checked" : ""
                } />
                เปิดใช้งานระบบ BetCard <i class="input-helper"></i></label>
            </div>
        </div>

        <hr />
        <!-- grp 6 -->
        <h6 class="text-primary mb-2">อื่นๆ</h6>

        <div class="form-group">
          <label for="notificationSound">เสียงแจ้งเตือน</label>
          <div class="input-group">
            <select id="notificationSound" class="form-control">
              <option value="noti.mp3" ${
                selectedSound === "noti.mp3" ? "selected" : ""
              }>Ding</option>
              <option value="pop.mp3" ${
                selectedSound === "pop.mp3" ? "selected" : ""
              }>Pop</option>
              <option value="alert.mp3" ${
                selectedSound === "alert.mp3" ? "selected" : ""
              }>Alert</option>
            </select>
            <div class="input-group-append">
              <button class="btn btn-outline-success" type="button" id="playSound">
                ทดสอบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">ปิด</button>
        <button type="button" class="btn btn-primary" id="saveSettings">บันทึก</button>
      </div>
    </div>
  </div>
</div>`)
    );

    $("#playSound").on("click", () => {
      const selectedSound = $("#notificationSound").val().toString();
      if (selectedSound && sounds[selectedSound]) {
        sounds[selectedSound].volume = 0.4;
        sounds[selectedSound].play();
      }
    });

    waitForBootstrap(() => {
      const $resetGashaBtn = $("#resetGashaData");

      // ปุ่มบันทึก settings
      $(document).on("click", "#saveSettings", async function () {
        // อัปเดตค่า settings จาก input ตามที่คุณมีอยู่แล้ว
        settingData.torrent.enabledTorrentModule = $(
          "#enabledTorrentModule"
        ).prop("checked");
        settingData.torrent.showTorrentImage =
          $("#showTorrentImage").prop("checked");
        settingData.torrent.showDownloadButton = $("#showDownloadButton").prop(
          "checked"
        );
        settingData.torrent.showRateButton =
          $("#showRateButton").prop("checked");
        settingData.torrent.updatePeerslist =
          $("#updatePeerslist").prop("checked");

        settingData.farm.enabledFarmModule =
          $("#enabledFarmModule").prop("checked");
        settingData.farm.autoFarm = $("#autoFarm").prop("checked");
        settingData.farm.notificationFarm =
          $("#notificationFarm").prop("checked");
        settingData.farm.farmUpdateInterval =
          parseInt($("#farmUpdateInterval").val() as string) || 10;
        settingData.farm.minPlotReadyForNotification =
          parseInt($("#minPlotReadyForNotification").val() as string) || 1;

        settingData.ticket.enabledTicketModule = $("#enabledTicketModule").prop(
          "checked"
        );
        settingData.ticket.autoTicket = $("#autoTicket").prop("checked");
        settingData.ticket.notificationTicket = $("#notificationTicket").prop(
          "checked"
        );
        settingData.ticket.ticketUpdateInterval =
          parseInt($("#ticketUpdateInterval").val() as string) || 10;
        settingData.ticket.minTicketReadyForNotification =
          parseInt($("#minTicketReadyForNotification").val() as string) || 1;

        settingData.gasha.enabledGashaModule = $("#enabledGashaModule").prop(
          "checked"
        );
        settingData.gasha.saveGashaLog = $("#saveGashaLog").prop("checked");
        settingData.gasha.showGashaLog = $("#showGashaLog").prop("checked");

        settingData.betcard.enabledBetCardModule = $(
          "#enabledBetCardModule"
        ).prop("checked");

        settingData.others.notificationSound = $(
          "#notificationSound"
        ).val() as string;

        await GM_setValue("settings", settingData);
        swal.fire(
          "บันทึกข้อมูลสำเร็จ!",
          "รีเฟรชหน้าเว็บเพื่อใช้ Settings ใหม่ที่บันทึกไว้",
          "success"
        );
        $("#tddSettingsModal").modal("hide");
      });

      $resetGashaBtn.on("click", function () {
        swal
          .fire({
            title: "คุณต้องการลบข้อมูลกาชาหรือไม่!",
            text: "ถ้าลบแล้วจะไม่สามารถกู้ข้อมูลคืนได้",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "ลบ",
            cancelButtonText: "ยกเลิก",
            confirmButtonColor: "#FF0000",
          })
          .then(async (result) => {
            $("#tddSettingsModal").modal("hide");
            if (result.isConfirmed) {
              await GM_setValue("gashaData", []);
              swal.fire(
                "ลบข้อมูลสำเร็จ!",
                "รีเฟรชหน้าเว็บเพื่อใช้ Settings ใหม่ที่บันทึกไว้",
                "success"
              );
            }
          });
      });
    });
  }
};
