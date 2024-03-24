import toastr from "toastr";

import Logger from "../Utils/Logger";
import Farm from "./Farm";
import Gasha from "../modules/Gasha";
import PlaceCard from "./PlaceCard";
import BetCard from "./BetCard";
import UserModel from "./User";

import { getLocation } from "../Utils/Helper";

declare const window: any;

class Bootstrap {
    private farm = new Farm;
    private gasha = new Gasha;
    private placeCard = new PlaceCard;
    private betCard = new BetCard;
    private user = new UserModel;


    private logger: Logger = new Logger("Main");
    private toastr = toastr;

    constructor() {
        GM_addElement('link', {
            rel: "stylesheet",
            href: 'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.css',
        });
        GM_addElement('style', {
            textContent: '.swal-footer{text-align:center;}.toast{background-color:#3a3f51}.toast-success{background-color:#03c393}.toast-error{background-color:#fb9678}.toast-info{background-color:#ab8ce4}.toast-warning{background-color:#ffb463}#toast-container > div{padding:10px 10px 10px 50px;opacity:1;-ms-filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);filter: alpha(opacity=100)}'
        });
        this.checkUpdate();

        this.logger.debug(`-------- UserDetail --------`);
        this.logger.debug(`id: ${this.user.userId}`);
        this.logger.debug(`username: ${this.user.userName}`);
        this.logger.debug(`class: ${this.user.userClassId !== 99 ? this.user.userClassId : "Not Found"}`);
        this.logger.debug(`----------------------------`);
    }

    checkUpdate() {
        const version = GM_info.script.version
        fetch("https://5nyqnhvk.xyz/checkUpdate.php").then(async res => await res.text()).then(txt => {
            const versionMtch = txt.match(/\/\/ @version\s+(\d+\.\d+\.\d+)/);
            if (versionMtch && versionMtch.length > 1) {
                if (version != versionMtch[1]) {
                    this.logger.info(`ตรวจพบสคริปเวอร์ชันใหม่: ${versionMtch[1]}`);
                    this.toastr.info(`เวอร์ชันใหม่: ${versionMtch[1]}<br>เวอร์ชันปัจจุบัน: ${version}`, "ตรวจพบสคริปเวอร์ชันใหม่!", {
                        closeButton: false,
                        debug: false,
                        newestOnTop: false,
                        progressBar: true,
                        positionClass: "toast-top-right",
                        preventDuplicates: false,
                        onclick: () => { window.open("https://www.torrentdd.com/userdetails.php?id=948022"); },
                        showDuration: 300,
                        hideDuration: 300,
                        timeOut: 2000,
                        extendedTimeOut: 500,
                        showEasing: "swing",
                        hideEasing: "linear",
                        showMethod: "fadeIn",
                        hideMethod: "fadeOut"
                    });
                }
            }
        });
    }

    start() {
        switch (getLocation().pathname) {
            case "/farm.php":
                this.farm.initalizeUi();
                break;
            case "/gashapon.php":
                this.gasha.initalizeGashaUi();
                break;
            case "/ticket-gashapon1.php":
                this.gasha.initalizeGashaUi();
                break;
            case "/ticket-gashapon2.php":
                this.gasha.initalizeGashaUi();
                break;
            case "/ticket.php":
                this.gasha.initalizeTicketUi();
            case "/card_vs_player.php":
                if (getLocation().search == "?mod=create") {
                    this.placeCard.initalizeUi();
                } else if (getLocation().search == "") {
                    // this.betCard.initalizeUi();
                }
                break;
        }
    }
}

export default Bootstrap;