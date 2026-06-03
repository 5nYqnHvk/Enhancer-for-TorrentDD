import Swal from "sweetalert2";
import { createLogger } from "../../utils/logger";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Chat");
const settingData = await fetctSettingData();
const chatSound = new Audio("images/sound/sound-chat.mp3");
chatSound.volume = 0.2;

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
  optimizeChatRuntime();
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
          iframe.attr("src", "https://www.torrentdd.com/boss.php");
          iframe.on("load", () => {
            $(".chat-container").addClass("mini");
            // remove unused div
            $(iframe).contents().find(".alert").remove()
            $(iframe).contents().find(".mb-2").remove()
            $(iframe).contents().find(".navbar-toggler.navbar-toggler.align-self-center").click()
            $(iframe).contents().find(".navbar.col-lg-12.col-12.p-0.fixed-top.d-flex.flex-row").remove()
            $(iframe).contents().find("#sidebar").remove()
            $(iframe).contents().find("footer").remove()
            let body = $(iframe).contents().find("body");
            body.scrollTop(body[0].scrollHeight);
            watchBossIframe(iframe[0] as HTMLIFrameElement);
          });
      }
    }
  });

  unsafeWindow.checkBossStatus = () => {
      const alive = isBossAlive();
      if (alive === null) return;
      if (!alive) closeBossIframe();
  };

  unsafeWindow.isBossAlive = () => {
      const iframe = $("iframe")[0];

      if (!iframe || !iframe.contentDocument) {
          return null;
      }

      const hpText = $(iframe).contents().find("#hp-text").text();

      if (!hpText || !hpText.includes("/")) {
          return null;
      }

      const [currentBossHP, maxBossHP] = hpText
          .split(" / ")
          .map(v => parseInt(v.trim(), 10));
      return currentBossHP > 0;
  };
   unsafeWindow.autoAttackBoss = false;
   let lastState = unsafeWindow.autoAttackBoss;

  setInterval(() => {
    if (unsafeWindow.autoAttackBoss !== lastState) {
      lastState = unsafeWindow.autoAttackBoss;

      if (lastState === true) {
        logger.info("AutoAttackBoss enabled");
        unsafeWindow.attackBoss();
      }
    }
  }, 200);
  
   unsafeWindow.attackBoss = () => {
    unsafeWindow.bossAttackTimer && clearTimeout(unsafeWindow.bossAttackTimer);
    if (!unsafeWindow.autoAttackBoss) return;

    const iframe = $("iframe")[0] as HTMLIFrameElement;
    if (!iframe || !iframe.contentDocument) return
    const attackBtn = $(iframe).contents().find("#attackBtn");
    if (attackBtn.is(":enabled") && attackBtn.is(":visible")) {
      attackBtn.click();
    }
    unsafeWindow.bossAttackTimer = setTimeout(() => unsafeWindow.attackBoss(), 1000);
  }
}

const closeBossIframe = () => {
  unsafeWindow.bossObserver?.disconnect();
  unsafeWindow.bossObserver = undefined;
  unsafeWindow.bossAttackTimer && clearTimeout(unsafeWindow.bossAttackTimer);
  unsafeWindow.bossAttackTimer = undefined;
  $(".chat-video iframe").attr("src", "");
  $(".chat-container").removeClass("mini");
};

const watchBossIframe = (iframe: HTMLIFrameElement) => {
  const doc = iframe.contentDocument;
  if (!doc?.body) return;

  unsafeWindow.bossObserver?.disconnect();
  unsafeWindow.bossObserver = new MutationObserver(() => {
    unsafeWindow.checkBossStatus();
    unsafeWindow.attackBoss();
  });
  unsafeWindow.bossObserver.observe(doc.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
  });
  unsafeWindow.checkBossStatus();
  unsafeWindow.attackBoss();
};

const optimizeChatRuntime = () => {
  initChatImagePreviewStyle();
  bindChatImagePreview();
  if (settingData.chat.enabledImagePreview) appendImagePreviews($(".box-msg"));
  if ($.fn.tooltip) $('[data-toggle="tooltip"]').tooltip();

  let lastRadio = "";
  let lastRadioCheck = 0;
  const updateRadio = async (force = false) => {
    if (document.hidden) return;
    if (!force && Date.now() - lastRadioCheck < 10 * 1000) return;
    lastRadioCheck = Date.now();
    try {
      const res = await fetch("chat.php?radio=true");
      const text = await res.text();
      if (text !== lastRadio) {
        lastRadio = text;
        $("#radio").html(text);
      }
    } catch (err) {
      logger.warn("อัปเดตวิทยุไม่สำเร็จ", err);
    }
  };

  unsafeWindow.GetRadio = updateRadio;
  void updateRadio(true);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) void updateRadio(true);
  });

  socket.off("chat");
  const pendingChats: string[] = [];
  let flushScheduled = false;
  const flushChats = () => {
    flushScheduled = false;
    const items = $(pendingChats.join(""));
    pendingChats.length = 0;

    const fontSize = getCookie("font_size");
    const fontPt = fontSize === "large" ? "14pt" : fontSize === "medium" ? "12pt" : "10pt";
    items.find(".f10, .f11").addBack(".f10, .f11").each(function () {
      this.style.setProperty("font-size", fontPt, "important");
    });
    if (settingData.chat.enabledImagePreview) appendImagePreviews(items);

    $(".chat-screen").append(items);
    removeTextchat();
    chatScroll();
  };

  socket.on("chat", (data: UserMessage) => {
    pendingChats.push(
      "<div class='d-flex align-items-center mb-2 f10 box-msg " +
        data.key +
        "'>" +
        textChat(data) +
        "</div>",
    );

    if ((!getCookie("sound") || getCookie("sound") == "on") && data.us_id != us_id) {
      chatSound.currentTime = 0;
      void chatSound.play();
    }

    if (!flushScheduled) {
      flushScheduled = true;
      requestAnimationFrame(flushChats);
    }
  });
};

const initChatImagePreviewStyle = () => {
  if (!settingData.chat.enabledImagePreview || $("#enhancer-chat-image-preview-style").length) return;
  $("head").append(
    `<style id="enhancer-chat-image-preview-style">
      .enhancer-chat-image-skeleton { margin-top: 6px; max-width: 320px; min-height: 120px; border: 1px dashed rgba(255,255,255,.35); border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.08), rgba(255,255,255,.18), rgba(255,255,255,.08)); background-size: 200% 100%; animation: enhancer-chat-skeleton 1.2s ease-in-out infinite; display: flex; align-items: center; justify-content: center; padding: 10px; }
      .enhancer-chat-image-preview img { max-width: 320px; max-height: 240px; border-radius: 8px; margin-top: 6px; display: block; }
      @keyframes enhancer-chat-skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    </style>`,
  );
};

const appendImagePreviews = (items: JQuery<HTMLElement>) => {
  items.each((_index, item) => {
    const message = $(item).text();
    const urls = extractImageUrls(message);
    if (urls.length === 0) return;

    const container = $("<div class='enhancer-chat-image-preview'></div>");
    urls.slice(0, 3).forEach((url) => {
      container.append(
        $("<div class='enhancer-chat-image-skeleton'></div>").append(
          $("<button type='button' class='btn btn-sm btn-outline-info'>แสดงรูป</button>").attr("data-src", url),
        ),
      );
    });
    $(item).append(container);
  });
};

const bindChatImagePreview = () => {
  if (!settingData.chat.enabledImagePreview) return;
  $(document).off("click.enhancerChatImage").on("click.enhancerChatImage", ".enhancer-chat-image-skeleton button", function () {
    const button = $(this);
    const src = button.attr("data-src");
    if (!src || !isSafeImageUrl(src)) return;

    logger.debug("Loading chat image preview", { src });
    const skeleton = button.closest(".enhancer-chat-image-skeleton");
    const link = $("<a target='_blank' rel='noopener noreferrer'></a>").attr("href", src);
    const image = $("<img loading='lazy' referrerpolicy='no-referrer' alt='chat image preview'>").attr("src", src);
    image.on("error", () => {
      logger.warn("โหลดรูป preview ในแชทไม่สำเร็จ", { src });
      skeleton.html("โหลดรูปไม่สำเร็จ").removeClass("enhancer-chat-image-skeleton");
    });
    link.append(image);
    skeleton.replaceWith(link);
  });
};

const extractImageUrls = (text: string) => {
  const matches = text.match(/https?:\/\/[^\s<>'"]+\.(?:jpe?g|png|gif|webp)(?:\?[^\s<>'"]*)?/gi) ?? [];
  return [...new Set(matches)].filter(isSafeImageUrl);
};

const isSafeImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && /\.(jpe?g|png|gif|webp)$/i.test(url.pathname);
  } catch {
    return false;
  }
};

const sortUserOnline = () => {
  if (!settingData.chat.sortUserOnline) return;
  socket.off("useronline");
  socket.on("useronline", (data: UserMessage) => {
    const users = Object.values(data).sort(function (a, b) {
      if (a.us_username === us_username) return -1;
      if (b.us_username === us_username) return 1;
      if (b.us_class !== a.us_class) return b.us_class - a.us_class;
      return a.us_username.localeCompare(b.us_username);
    });
    const html = users
      .map((user) => '<div class="form-inline f11">' + useronline(user) + "</div>")
      .join("");

    $(".user-online").text(users.length);
    $(".chat-userlist").html(html);
  });
};
