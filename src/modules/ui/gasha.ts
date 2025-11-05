import { getLocation } from "../../utils/hook";
import { createLogger } from "../../utils/logger";
import swal from "sweetalert2";
import { GashaData } from "../data/models";
import { fetctSettingData } from "../data/fetchData";

const logger = createLogger("Gasha");
const settingData = await fetctSettingData();

let gashaHistoryData: GashaData[] = [];
export const initGashaModule = async () => {
  if (!settingData.gasha.enabledGashaModule) return;
  if (!settingData.gasha.showGashaLog) return;
  initGashaLog();

  unsafeWindow.fetchCaseData = async (action = false) => {
    try {
      const res = await fetch(
        `app/gasha/api.php?box_name=${BOX_NAME}${action === true ? "&open_box=" + action : ""}`,
      );
      if (!res.ok) throw new Error("Failed to fetch case data");
      const data = await res.json();
      if (data.success) {
        if (data.data.status) {
          logger.info(`คุณหมุนการชาได้รับ ${data.data.final_item.name}!`);
          const gashaData = {
            type: BOX_NAME as GashaData["type"],
            cls: data.data.final_item.class,
            txt: data.data.final_item.name,
            img: data.data.final_item.img,
          };
          saveGashaData(gashaData);
        } else {
          logger.info(`คุณทดสอบหมุนกาชาได้รับ ${data.data.final_item.name}!`);
        }
      } else {
        logger.error(data.error);
      }
      return data;
    } catch (err) {
      console.error(err);
      resultArea.textContent = "โหลดข้อมูลไม่สำเร็จ";
      btnOpen.disabled = false;
      btnOpenDemo.disabled = false;
      return null;
    }
  };
};

const initGashaLog = async () => {
  $(".mb-3").first().after(`
        <div class="card mt-3"><div class="card-body">
            <h5>ประวัติการสุ่มกาชา</h5>
            <h5 class="mb-2 text-youtube">*ตารางข้างล่างนี้สร้างโดย Enhancer for TorrentDD</h5>
            <div class="row table-responsive">
                <div class="col-lg-8 offset-lg-2">
                    <table class="border border-dark table table-borderless table-hover table-striped">
                        <thead class="thead-dark">
                            <tr class="text-center">
                                <th scope="col">#</th>
                                <th scope="col">ได้รับ</th>
                                <th scope="col">รูป</th>
                                <th scope="col">วันเวลา</th>
                                <th scope="col">ลบ</th>
                            </tr>
                        </thead>
                        <tbody>
                        <!-- Insert gashaData here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        `);

  const tbody = $("table").find("tbody")[0];

  const type = getGashaType();

  gashaHistoryData = (await getGashaData())
    .filter((data) => {
      if (!type || type === "unknown") return true;
      return data.type === type;
    })
    .sort((a, b) => b.date - a.date);

  let id = gashaHistoryData.length + 1;
  gashaHistoryData.forEach((data: any) => {
    id--;
    const tr = tbody.insertRow();
    tr.className = "text-center";
    const td1 = tr.insertCell();
    const td_id = document.createTextNode(id.toString());
    td1.appendChild(td_id);
    const td2 = tr.insertCell();
    const td_reward = document.createTextNode(data.txt);
    td2.appendChild(td_reward);
    const td3 = tr.insertCell();
    td3.width = "150";
    const td_img = document.createElement("img");
    if (data.cls) {
      td_img.src = `https://www.torrentdd.com/images/${data.cls === "icon" ? "icons" : "pets"}/${data.img}`;
    } else {
      td_img.src = `https://www.torrentdd.com/images/pets/${data.img}`;
    }
    td3.appendChild(td_img);
    const td4 = tr.insertCell();
    const td_date = document.createTextNode(
      new Date(data.date).toLocaleString("th"),
    );
    td4.appendChild(td_date);
    const td5 = tr.insertCell();
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-danger btn-sm";
    delBtn.textContent = "ลบ";
    delBtn.onclick = async () => {
      await swal
        .fire({
          title: `คุณต้องการลบ ${data.txt} หรือไม่!`,
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
            gashaHistoryData.splice(id - 1, 1);
            const allData: GashaData[] = GM_getValue<GashaData[]>(
              "gashaData",
              [],
            );
            const updatedData = allData.filter((d) => d.date !== data.date);
            GM_setValue("gashaData", updatedData);
            tr.remove();
          }
        });
    };
    td5.appendChild(delBtn);
  });
};

const getGashaData = async (): Promise<GashaData[]> => {
  const gashaData = GM_getValue<GashaData[]>("gashaData", []);
  return gashaData;
};

const saveGashaData = async (gashaData: any) => {
  const newData: GashaData = {
    type: getGashaType(),
    cls: gashaData.cls,
    img: gashaData.img,
    txt: gashaData.txt,
    date: Date.now(),
  };

  const updateGashaData: GashaData[] = GM_getValue<GashaData[]>(
    "gashaData",
    [],
  );
  updateGashaData.push(newData);
  GM_setValue("gashaData", updateGashaData);
};

const getGashaType = () => {
  let boxName: GashaData["type"];
  if (getLocation().search.split("=")[0] === "?box_name") {
    boxName = getLocation().search.slice(10) as GashaData["type"];
  } else {
    boxName = "unknown";
  }
  return boxName;
};
