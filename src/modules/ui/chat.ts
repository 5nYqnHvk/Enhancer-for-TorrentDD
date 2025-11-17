import Swal from "sweetalert2";
import { createLogger } from "../../utils/logger";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Chat");
const settingData = await fetctSettingData();

interface UserMessage {
  key: string;
  message: string;
  us_id: number;
  us_username: string;
  us_class: number;
  us_donor: "yes" | "no";
  us_icon: number;
  time: string;
}

export const initChatModule = () => {
  if (!settingData.chat.enabledChatModule) return;
  sortUserOnline();

  // fix upload link
  unsafeWindow.uploadFile = () => {
        let apifile = $('#hidden-input')[0];
        let type: string;
        if (apifile.files.length > 0) {

            const fileType = apifile.files[0].type;

            if (fileType === 'image/jpeg') {
                type = 'jpg';
            } else if (fileType === 'image/png') {
                type = 'png';
            } else if (fileType === 'image/gif') {
                type = 'gif';
            } else {
                Swal.fire({
                    title: "Error",
                    text: "รองรับเฉพาะ jpg, gif, png เท่านั้น!",
                    icon: "error"
                });
                return;
            }

            var formData = new FormData();
            var boundary = '---------------------------' + Date.now().toString(16);
            formData.append('uploads', apifile.files[0], apifile.files[0].name.toLowerCase());
            formData.set('Content-Type', 'multipart/form-data; boundary=' + boundary);

            $.ajax({
                type: 'POST',
                url: atob('aHR0cHM6Ly81bnkuc2l0ZS91cGxvYWQ='),
                data: formData,
                contentType: false,
                processData: false,
                beforeSend: function() {
                    $('#chat-input').val('กำลังอัพโหลด..').prop('disabled', true);
                },
                success: function(response) {
                    const data = JSON.parse(response);
                    if (data.type === 'success') {
                        const url = `${atob('aHR0cHM6Ly93d3cuaS1waWMuaW5mby9pLw==')}${data.data.id}.${type}`;
                        $('#chat-input').val(url).prop('disabled', false);
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: data.errors,
                            icon: "error"
                        });
						$('#chat-input').val('').prop('disabled', false);
					}
                },
                error: function() {
                    $('#chat-input').val('').prop('disabled', false);
                    Swal.fire({
                        title: "Error!",
                        text: "ต้องเป็นไฟล์รูปภาพเท่านั้น!",
                        icon: "error"
                    });
                }
            });
        }
    }

    if (!settingData.chat.enabledIframeBoss) return;
    bossIframe();

};

const bossIframe = () => {
  socket.on("chat", (chat: any) => {
    if (chat.us_id === 0 && chat.us_class === 0 && chat.us_icon === 100) {
      if (chat.message.includes("Monster บุกเว็บ ต้องการผู้กล้าด่วน!! [url=https://www.torrentdd.com/boss.php](เข้าร่วม!)[/url]")) {
          const iframe = $(".chat-video iframe");
          iframe.attr("src", "/boss.php");
          iframe.on("load", () => {
              $(".chat-container").addClass("mini");
              unsafeWindow.bossInterval = setInterval(() => checkBossStatus(), 1000);
          });
      }
    }
  });

  unsafeWindow.checkBossStatus = () => {
      if (!isBossAlive()) {
          clearInterval(unsafeWindow.bossInterval);
          $(".chat-video iframe").attr("src", '');
          $(".chat-container").removeClass("mini")
          setTimeout(() => $(".chat-container").removeClass("mini"), 1000);
      }
  };

  unsafeWindow.isBossAlive = () => {
      const iframe = $("iframe")[0];

      if (!iframe || !iframe.contentDocument) {
          return true;
      }

      const hpText = $(iframe).contents().find("#hp-text").text();

      // remove unused div
      $(iframe).contents().find(".alert").remove()
      $(iframe).contents().find(".mb-2").remove()
      $(iframe).contents().find(".navbar-toggler.navbar-toggler.align-self-center").click()
      $(iframe).contents().find(".navbar.col-lg-12.col-12.p-0.fixed-top.d-flex.flex-row").remove()
      $(iframe).contents().find("#sidebar").remove()
      $(iframe).contents().find("footer").remove()
      let body = $(iframe).contents().find("body");
      body.scrollTop(body[0].scrollHeight);
      if (!hpText || !hpText.includes("/")) {
          return true;
      }

      const [currentBossHP, maxBossHP] = hpText
          .split(" / ")
          .map(v => parseInt(v.trim(), 10));
      return currentBossHP > 0;
  };
}
const sortUserOnline = () => {
  if (!settingData.chat.sortUserOnline) return;
  socket.off("useronline");
  // เรียง useronline ใหม่เป็นเรียงตามยศสูงไปต่ำ และเรียงจาก A-Z
  socket.on("useronline", (data: UserMessage) => {
    $(".user-online").html(Object.keys(data).length);
    $(".chat-userlist div").remove();

    var sortedUsers = Object.values(data).sort(function (a, b) {
      // เรียงตามยศก่อน (สูง -> ต่ำ)
      if (b.us_class !== a.us_class) {
        return b.us_class - a.us_class;
      }
      // ถ้ายศเท่ากัน เรียงชื่อ A-Z
      return a.us_username.localeCompare(b.us_username);
    });

    // เอาของตัวเองไปไว้บนสุด
    var selfUser = sortedUsers.find((u) => u.us_username === us_username);
    if (selfUser) {
      $(".chat-userlist").prepend(
        '<div class="form-inline f11">' + useronline(selfUser) + "</div>",
      );
      sortedUsers = sortedUsers.filter((u) => u.us_username !== us_username);
    }

    // แสดงผลผู้ใช้อื่น
    $.each(sortedUsers, function (index, arr) {
      $(".chat-userlist").append(
        '<div class="form-inline f11">' + useronline(arr) + "</div>",
      );
    });
  });
};
