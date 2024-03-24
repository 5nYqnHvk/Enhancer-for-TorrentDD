import swal from 'sweetalert';
import toastr from 'toastr';

import User from './User';

import { animateValue, getLocation } from '../Utils/Helper';

declare const window: any;

interface InotificationData {
    time?: number
    notification?: boolean
}

class Gasha {
    private notificationData: InotificationData = {};

    private buttonSpin: HTMLElement;
    private buttonSpinSkip: HTMLElement;
    private buttonSpinTest: HTMLElement;
    private buttonSpinTestSkip: HTMLElement;

    private endPoint = 0;
    private num = 0;
    private play = false;
    private endSound = false;

    private gashaHistoryData: any = [];
    private user: User = new User;
    private sound = new Audio('https://5nyqnhvk.xyz/assets/music/noti.mp3');

    private Swal = swal;
    private toastr = toastr;

    constructor() {
        this.notificationData = GM_getValue('ticketNotificationData', {});
        this.sound.volume = 0.4;

        if ($.isEmptyObject(this.notificationData)) {
            GM_setValue('ticketNotificationData', {
                time: 0,
            });
        }

        (async () => {
            this.getNotification();
            setInterval(() => this.getNotification(), 5 * 60 * 1000); // 5 min
        })();
    }

    public initalizeGashaUi() {
        $('.text-center.mt-3.f12').next().html(null) // remove all button

        this.buttonSpin = GM_addElement($('.text-center.mt-3.f12').next()[0], 'button', {
            class: 'btn btn-info btn-spin ml-1 mr-1',
        });
        this.buttonSpin.innerHTML = '<i class=\'far fa-sync-alt\'></i>Spin';
        this.buttonSpin.addEventListener('click', () => this.spinBtn('', false));

        this.buttonSpinSkip = GM_addElement($('.text-center.mt-3.f12').next()[0], 'button', {
            class: 'btn btn-info btn-spin ml-1 mr-1',
        });
        this.buttonSpinSkip.innerHTML = '<i class=\'far fa-sync-alt\'></i>Spin Skip';
        this.buttonSpinSkip.addEventListener('click', () => this.spinBtn('', true));

        this.buttonSpinTest = GM_addElement($('.text-center.mt-3.f12').next()[0], 'button', {
            class: 'btn btn-success m-2',
        });
        this.buttonSpinTest.innerHTML = '<i class=\'far fa-sync-alt\'></i>ทดสอบ';
        this.buttonSpinTest.addEventListener('click', () => this.spinBtn('true', false));

        this.buttonSpinTestSkip = GM_addElement($('.text-center.mt-3.f12').next()[0], 'button', {
            class: 'btn btn-success m-2',
        });
        this.buttonSpinTestSkip.innerHTML = '<i class=\'far fa-sync-alt\'></i>ทดสอบ Skip';
        this.buttonSpinTestSkip.addEventListener('click', () => this.spinBtn('true', true));

        const newCard = $('.card').last().after(`
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
        const tbody = $('table').find('tbody')[0];
        (async () => await this.getGashaData().then(() => {
            // create Table
            let id = this.gashaHistoryData.length + 1;
            this.gashaHistoryData.forEach((data: any) => {
                id--;

                const getData = JSON.parse(data.data);

                const tr = tbody.insertRow();
                tr.className = 'text-center';
                const td1 = tr.insertCell();
                const td_id = document.createTextNode(id);
                td1.appendChild(td_id);
                const td2 = tr.insertCell();
                const td_reward = document.createTextNode(getData.txt);
                td2.appendChild(td_reward);
                const td3 = tr.insertCell();
                td3.width = '150';
                const td_img = document.createElement('img');
                td_img.src = 'https://www.torrentdd.com/images/pets/' + getData.img;
                td3.appendChild(td_img);
                const td4 = tr.insertCell();
                const td_date = document.createTextNode(data.created_at);
                td4.appendChild(td_date);
            });
        }))();
    }

    public initalizeTicketUi() {
        const getTicketButton = $(".card-body.text-center").find("button");
        const TicketNum = Number(getTicketButton.text().split(" ")[1]);

        if (getTicketButton[0].disabled == true) {
            getTicketButton.html("คุณได้รับตั๋วสุ่มกาชาไปแล้ว");
            getTicketButton.removeClass("btn-success");
            getTicketButton.addClass("btn-danger");
        }
        // replace getTicket function with this.getTicket()
        getTicketButton.removeClass("get-ticket");
        getTicketButton[0].addEventListener('click', () => this.getTicket());

    }
    public getTicket() {
        const getTicketButton = $(".card-body.text-center").find("button");
        fetch('ticket.php?mod=get-ticket').then(async res => await res.text()).then(data => {
            switch (data) {
                case 'success':
                    this.Swal('Good job!', 'รับ <i class="fal fa-tag fa-md mr-1"></i>รับตั๋วสุ่มกาชา เรียบร้อยแล้ว!', 'warning');
                    getTicketButton[0].disabled = true;
                    GM_setValue('ticketNotificationData', {
                        time: Date.now()
                    });
                    break;
                case 'error-1':
                    this.Swal('Error!', 'คุณจะต้องปล่อยไฟล์ 5 ไฟล์ขึ้นไป และ Connect มากว่า 3 ชั่วโมง', 'error');
                    getTicketButton[0].disabled = true;
                    break;
                case 'error-2':
                    this.Swal('Error!', 'คุณรับตั๋วสุ่มกาชาไปแล้ว กรุณารับในรอบถัดไปค่ะ', 'error');
                    getTicketButton[0].disabled = true;
                    break;
                case 'error-3':
                    this.Swal('Error!', 'การรับตั๋วสุ่มกาชา จะต้องห่างกันอย่างน้อย 3 ชั่วโมง', 'error');
                    getTicketButton[0].disabled = true;
                    break;
            }
        })
    }

    private getNotification() {
        fetch('https://www.torrentdd.com/ticket.php').then(async (res) => await res.text()).then(doc => {
            const dom = new DOMParser();
            const parser = dom.parseFromString(doc, 'text/html');

            const getTicketButton = $(parser).find(".card-body.text-center").find("button");
            const TicketNum = Number(getTicketButton.text().split(" ")[1]);

            const time = new Date();
            const ntime = new Date(this.notificationData.time + (3 * 60 * 60 * 1000));
            if (time > ntime) {
                if (getLocation().pathname == '/ticket.php') return;
                if (TicketNum > 0) {
                    this.toastr.info("คุณได้รับตั๋วจำนวน " + TicketNum + " ชิ้น", "ถึงเวลาเก็บตั๋วแล้ว!", {
                        closeButton: false,
                        debug: false,
                        newestOnTop: false,
                        progressBar: true,
                        onclick: () => { window.location = "ticket.php" },
                        positionClass: "toast-top-right",
                        preventDuplicates: false,
                        showDuration: 300,
                        hideDuration: 300,
                        timeOut: 100000,
                        extendedTimeOut: 500,
                        showEasing: "swing",
                        hideEasing: "linear",
                        showMethod: "fadeIn",
                        hideMethod: "fadeOut"
                    });
                    GM_notification({
                        text: `คุณได้รับตั๋วจำนวน ${TicketNum} ชิ้น`,
                        title: 'ถึงเวลาเก็บตั๋วแล้ว!',
                        url: 'https://www.torrentdd.com/ticket.php',
                    });

                    GM_setValue('ticketNotificationData', {
                        time: Date.now(),
                    });
                }
            }
        })
    }

    public toggleButtons(state: boolean) {
        if (state) {
            (this.buttonSpin as HTMLButtonElement).disabled = true;
            (this.buttonSpinSkip as HTMLButtonElement).disabled = true;
            (this.buttonSpinTest as HTMLButtonElement).disabled = true;
            (this.buttonSpinTestSkip as HTMLButtonElement).disabled = true;
        } else {
            (this.buttonSpin as HTMLButtonElement).disabled = false;
            (this.buttonSpinSkip as HTMLButtonElement).disabled = false;
            (this.buttonSpinTest as HTMLButtonElement).disabled = false;
            (this.buttonSpinTestSkip as HTMLButtonElement).disabled = false;
        }
    }


    public async getGashaData(): Promise<boolean> {
        const username = this.user.userName;
        const userid = this.user.userId;

        let type = null;
        switch (getLocation().pathname) {
            case "/gashapon.php":
                type = "C";
                break;
            case "/ticket-gashapon1.php":
                type = "G1";
                break;
            case "/ticket-gashapon2.php":
                type = "G2";
                break;
        }

        const getGashaData = await fetch("https://5nyqnhvk.xyz/getGashaData.php?userid=" + userid + "&username=" + username + "&type=" + type);
        const gashaData = await getGashaData.json();
        if (!gashaData) return false;

        this.gashaHistoryData = gashaData;
        return true;
    }

    async saveGashaData(gashaData: any) {
        const username = this.user.userName;
        const userid = this.user.userId;

        const data = {
            type: getLocation().pathname,
            uid: userid,
            username: username,
            data: gashaData
        }
        await fetch("https://5nyqnhvk.xyz/saveGashaData.php", {
            method: "POST",
            mode: 'no-cors',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        }).then(res => res.json()).then(data => { return true; }).catch(err => () => { return false; });
    }
    // --------------------------------------------
    // Script By TDD
    // --------------------------------------------
    public spinBtn(test = '', skip = false) {
        this.toggleButtons(true);

        if (parseInt($('.gashabox').css('margin-left')) != 0) {
            this.getCard();
        }

        // this.Swal.fire
        setTimeout(async () => {
            const gasha = await fetch(getLocation().pathname + '?action=spin&test=' + test);
            const gashaData = await gasha.json();
            if (test == '') {
                await this.saveGashaData(gashaData);
            }
            if (gashaData.message == 'low-coin') {
                this.Swal('คุณมี Coin ไม่พอ!', 'กรุณาตรวจสอบด้วยค่ะ', 'warning').then(() => {
                    this.toggleButtons(false);
                });
            } else if (gashaData.message == 'low-ticket') {
                this.Swal('คุณมี Ticket ไม่พอ!', 'กรุณาตรวจสอบด้วยค่ะ', 'warning').then(() => {
                    this.toggleButtons(false);
                });
            } else if (gashaData.code == 0) {
                $('.gashabox .box:nth-child(34)').html('<div class=\'b1\'><img src=\'images/pets/' + gashaData.img + '\'></div><div class=\'b2 ' + gashaData.bg + '\'>' + gashaData.txt + '</div>');
                if (skip) {
                    const sound = new Audio('images/sound/end-reveal.wav');
                    sound.volume = 0.2;
                    sound.play();
                }
                if (gashaData.coinUpdate == true) {
                    let coin = $('#coin').text().replace(/,/g, '');
                    animateValue($('#coin')[0], Number(coin), Number(coin) - 50, 500);
                    coin = String(Number($('#coin').text().replace(/,/g, '')) - 50);
                } else if (gashaData.ticketUpdate == true) {
                    let ticket = $('#ticket').text().replace(/,/g, '');
                    animateValue($('#ticket')[0], Number(ticket), Number(ticket) - 10, 500);
                    ticket = String(Number($('#ticket').text().replace(/,/g, '')) - 10);
                }
                if (!skip) {
                    this.spin();
                } else {
                    setTimeout(() => {
                        this.Swal({
                            title: 'สิ่งที่คุณได้รับ',
                            text: gashaData.txt,
                            icon: 'images/pets/' + gashaData.img
                        });
                        this.toggleButtons(false);
                    }, 300);
                }
            }
        }, 500);
    }

    public getCard() {
        //------- reset -------
        this.num = 0;
        this.endSound = false;
        //------- reset -------

        $.get('ticket-gashapon2.php?action=call', function (data) {
            var card = '';
            $.each(JSON.parse(data), function (index, val) {
                card += '<div class=\'box\'><div class=\'b1\'><img src=\'images/pets/' + val.img + '\'></div><div class=\'b2 ' + val.bg + '\'>' + val.txt + '</div></div>';
            });

            //------- reset -------
            $('.gashabox').removeClass('play');
            $('.gashabox').css('margin-left', '0px');
            //------- reset -------

            $('.gashabox').html(card);
        });
    }

    public spin() {
        this.endPoint = Math.floor(Math.random() * (4090 - 3968)) + 3968;

        $('.gashabox').addClass('play');
        $('.gashabox.play').css('margin-left', '-' + this.endPoint + 'px');

        let round = 0;
        (function Loop(gasha: Gasha) {
            round = round + 1;
            setTimeout(function (gasha: Gasha) {
                let ml = parseInt($('.gashabox').css('margin-left').replace('-', ''));
                gasha.playsound(ml);
                if (round < 1300) { Loop(gasha); }
            }.bind(null, gasha), 10);
        }.bind(null, this))();
    }

    public playsound(ml: number) {
        if (ml >= 67 && ml < 197 && this.num == 0) { this.num = 1; this.play = true; }
        else if (ml >= 197 && ml < 327 && this.num == 1) { this.num = 2; this.play = true; }
        else if (ml >= 327 && ml < 457 && this.num == 2) { this.num = 3; this.play = true; }
        else if (ml >= 457 && ml < 587 && this.num == 3) { this.num = 4; this.play = true; }
        else if (ml >= 587 && ml < 717 && this.num == 4) { this.num = 5; this.play = true; }
        else if (ml >= 717 && ml < 847 && this.num == 5) { this.num = 6; this.play = true; }
        else if (ml >= 847 && ml < 977 && this.num == 6) { this.num = 7; this.play = true; }
        else if (ml >= 977 && ml < 1107 && this.num == 7) { this.num = 8; this.play = true; }
        else if (ml >= 1107 && ml < 1237 && this.num == 8) { this.num = 9; this.play = true; }
        else if (ml >= 1237 && ml < 1367 && this.num == 9) { this.num = 10; this.play = true; }
        else if (ml >= 1367 && ml < 1497 && this.num == 10) { this.num = 11; this.play = true; }
        else if (ml >= 1497 && ml < 1627 && this.num == 11) { this.num = 12; this.play = true; }
        else if (ml >= 1627 && ml < 1757 && this.num == 12) { this.num = 13; this.play = true; }
        else if (ml >= 1757 && ml < 1887 && this.num == 13) { this.num = 14; this.play = true; }
        else if (ml >= 1887 && ml < 2017 && this.num == 14) { this.num = 15; this.play = true; }
        else if (ml >= 2017 && ml < 2147 && this.num == 15) { this.num = 16; this.play = true; }
        else if (ml >= 2147 && ml < 2277 && this.num == 16) { this.num = 17; this.play = true; }
        else if (ml >= 2277 && ml < 2407 && this.num == 17) { this.num = 18; this.play = true; }
        else if (ml >= 2407 && ml < 2537 && this.num == 18) { this.num = 19; this.play = true; }
        else if (ml >= 2537 && ml < 2667 && this.num == 19) { this.num = 20; this.play = true; }
        else if (ml >= 2667 && ml < 2797 && this.num == 20) { this.num = 21; this.play = true; }
        else if (ml >= 2797 && ml < 2927 && this.num == 21) { this.num = 22; this.play = true; }
        else if (ml >= 2927 && ml < 3057 && this.num == 22) { this.num = 23; this.play = true; }
        else if (ml >= 3057 && ml < 3187 && this.num == 23) { this.num = 24; this.play = true; }
        else if (ml >= 3187 && ml < 3317 && this.num == 24) { this.num = 25; this.play = true; }
        else if (ml >= 3317 && ml < 3447 && this.num == 25) { this.num = 26; this.play = true; }
        else if (ml >= 3447 && ml < 3577 && this.num == 26) { this.num = 27; this.play = true; }
        else if (ml >= 3577 && ml < 3707 && this.num == 27) { this.num = 28; this.play = true; }
        else if (ml >= 3707 && ml < 3837 && this.num == 28) { this.num = 29; this.play = true; }
        else if (ml >= 3837 && ml < 3967 && this.num == 29) { this.num = 30; this.play = true; }
        else if (ml >= 3967 && ml < 4090 && this.num == 30) { this.num = 31; this.play = true; }
        else { this.play = false; }

        if (this.play == true) {
            const sound = new Audio('images/sound/crate-scroll.wav');
            sound.volume = 0.2;
            sound.play();
        }

        ml = parseInt($('.gashabox').css('margin-left').replace('-', ''));
        if (ml >= this.endPoint && this.endSound == false && this.num == 31) {
            this.endSound = true;
            let img = $('.gashabox .box:nth-child(34) img').attr('src');
            let txt = $('.gashabox .box:nth-child(34) .b2').text();

            const sound = new Audio('images/sound/end-reveal.wav');
            sound.volume = 0.2;
            sound.play();

            setTimeout(function (gasha: Gasha) {
                gasha.Swal({
                    title: 'สิ่งที่คุณได้รับ',
                    text: txt,
                    icon: img
                });

                if ($('#status').val() == 'true') {
                    if (/money.gif/i.test(img)) {
                        let money = $('#money').text().replace(/,/g, '');
                        animateValue($('#money')[0], Number(money), Number(money) + parseInt(txt.replace(/\D/g, '')), 500);
                        money = String(Number($('#money').text().replace(/,/g, '')) + parseInt(txt.replace(/\D/g, '')));
                    }
                    if (/coin.gif/i.test(img)) {
                        let coin = $('#coin').text().replace(/,/g, '');
                        animateValue($('#coin')[0], Number(coin), Number(coin) + parseInt(txt.replace(/\D/g, '')), 500);
                        coin = String(Number($('#coin').text().replace(/,/g, '')) + parseInt(txt.replace(/\D/g, '')));
                    }
                }
                gasha.toggleButtons(false);
            }.bind(null, this), 300);
        }
    }
}

export default Gasha;