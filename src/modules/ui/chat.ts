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
};

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
