import toastr from 'toastr';

import { getLocation } from '../Utils/Helper';
import Logger from '../Utils/Logger';

declare const window: any;

interface InotificationData {
    time?: number
    notification?: boolean
}

class Farm {
    public seedCounter: number = 0;
    public storeCounter: number = 0;

    private notificationData: InotificationData = {};
    private seedButton: HTMLElement;
    private storeButton: HTMLElement;
    private sound = new Audio('https://5nyqnhvk.xyz/assets/music/noti.mp3');
    private toastr = toastr;
    private logger: Logger = new Logger('Farm');

    constructor() {
        this.notificationData = GM_getValue('farmNotificationData', {});
        this.sound.volume = 0.4;

        if ($.isEmptyObject(this.notificationData)) {
            GM_setValue('farmNotificationData', {
                time: 0,
            });
        }

        (async () => {
            this.getNotification();
            setInterval(() => this.getNotification(), 5 * 60 * 1000); // 5 min
        })();
    }

    public initalizeUi() {
        const farmCard = document.querySelector('.card-body');
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'd-flex justify-content-center w-50 mx-auto';
        farmCard.prepend(buttonGroup);

        this.seedButton = GM_addElement(buttonGroup, 'button', {
            class: 'btn btn-success m-2',
            textContent: 'ซื้อเมล็ดพันธุ์ทั้งหมด'
        });

        this.seedButton.addEventListener('click', () => this.seedAll());

        this.storeButton = GM_addElement(buttonGroup, 'button', {
            class: 'btn btn-success m-2',
            textContent: 'เก็บพืชทั้งหมด'
        });

        this.storeButton.addEventListener('click', () => this.storeAll());

        this.updateFarm();
    }

    async placeSeed(id: number) {

        const getSeed = await fetch('https://www.torrentdd.com/farm.php?action=seed&ground=' + id);

        if (getSeed.status == 200) {
            this.logger.info(`ปลูกพืชบนที่ดิน ${id} สำเร็จ`);
            this.seedCounter++;
        } else {
            this.logger.info(`ปลูกพืชบนที่ดิน ${id} ไม่สำเร็จ`);
        }
        this.updateFarm();
    }

    public seedAll() {
        (this.seedButton as HTMLButtonElement).disabled = true;

        $('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('button').each((_index, ground: HTMLElement) => {
            const groundId = Number($(ground).attr('id'));
            if ($(ground).text().replace(/[\n\t\ ]/g, '') == 'ซื้อเมล็ดพันธุ์') {
                setTimeout(async () => await this.placeSeed(groundId), Math.floor(Math.random() * 5) * 500);
            }
        });

        (this.seedButton as HTMLButtonElement).disabled = false;
    }

    async gatherPlant(id: number) {
        const getPlant = await fetch('https://www.torrentdd.com/farm.php?action=store&ground=' + id);

        if (getPlant.status == 200) {
            this.logger.info(`เก็บพืชบนที่ดิน ${id} สำเร็จ`);
            this.storeCounter++;
        } else {
            this.logger.info(`เก็บพืชบนที่ดิน ${id} ไม่สำเร็จ`);
        }
        if (this.storeCounter == $('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('a').length) {
            GM_setValue('farmNotificationData', {
                time: Date.now(),
            });
        }
        this.updateFarm();
    }

    public storeAll() {
        (this.storeButton as HTMLButtonElement).disabled = true;

        $('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('a').each((_index, ground: HTMLElement) => {
            const groundId = Number($(ground).attr('id'));
            setTimeout(async () => await this.gatherPlant(groundId), Math.floor(Math.random() * 5) * 500);
        });

        (this.storeButton as HTMLButtonElement).disabled = false;
    }

    private updateFarm() {
        fetch('https://www.torrentdd.com/farm.php').then(async (res) => await res.text()).then(doc => {
            const dom = new DOMParser();
            const parser = dom.parseFromString(doc, 'text/html');

            $(parser).find('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('button').each((_index, ground: HTMLElement) => {
                const groundId = Number($(ground).attr('onclick').split('=')[5][0]);
                $(ground).attr('id', String(groundId));
                $(ground).attr('onclick', null);
            });
            $(parser).find('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('a').each((_index, ground: HTMLElement) => {
                const groundId = Number($(ground).attr('onclick').split('=')[3][0]);
                $(ground).attr('id', String(groundId));
                $(ground).attr('onclick', null);
            });

            if ($(parser).find('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('button').length === 0) {
                this.logger.debug('ไม่พบที่ดินที่สามารถปลูกพืชได้');
                this.seedButton.className = 'btn btn-danger m-2';
                (this.seedButton as HTMLButtonElement).disabled = true;
            } else {
                this.seedButton.className = 'btn btn-success m-2';
                (this.seedButton as HTMLButtonElement).disabled = false;
            }
            if ($(parser).find('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('a').length === 0) {
                this.storeButton.className = 'btn btn-danger m-2';
                (this.storeButton as HTMLButtonElement).disabled = true;
            } else {
                this.storeButton.className = 'btn btn-success m-2';
                (this.storeButton as HTMLButtonElement).disabled = false;
            }

            $('.offset-lg-3.col-lg-6').html($(parser).find('.offset-lg-3.col-lg-6').html());

            $('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('button').each((_index, ground: HTMLElement) => {
                const groundId = Number($(ground).attr('id'));
                ground.addEventListener('click', () => this.placeSeed(groundId));
            });

            $('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('a').each((_index, ground: HTMLElement) => {
                const groundId = Number($(ground).attr('id'));
                ground.addEventListener('click', () => this.gatherPlant(groundId));
            });
        });
    }

    private getNotification() {
        fetch('https://www.torrentdd.com/farm.php').then(async (res) => await res.text()).then(doc => {
            const dom = new DOMParser();
            const parser = dom.parseFromString(doc, 'text/html');

            const storeNum = $(parser).find('.offset-lg-3.col-lg-6').find('.row.bg-farm').find('a').length;

            const time = new Date();
            const ntime = new Date(this.notificationData.time + (6 * 60 * 60 * 1000));
            if (time > ntime) {
                if (getLocation().pathname == '/farm.php') return;
                if (storeNum > 0) {
                    this.sound.play();
                    this.toastr.info('พบพืชที่โตเต็มที่แล้วจำนวน ' + storeNum + ' ต้น', 'ถึงเวลาเก็บเกี่ยว!', {
                        closeButton: false,
                        debug: false,
                        newestOnTop: false,
                        progressBar: true,
                        positionClass: 'toast-top-right',
                        preventDuplicates: false,
                        onclick: () => { window.location = 'farm.php' },
                        showDuration: 300,
                        hideDuration: 300,
                        timeOut: 100000,
                        extendedTimeOut: 500,
                        showEasing: 'swing',
                        hideEasing: 'linear',
                        showMethod: 'fadeIn',
                        hideMethod: 'fadeOut'
                    });
                    GM_notification({
                        text: `พบพืชที่โตเต็มที่แล้วจำนวน ${storeNum} ต้น`,
                        title: 'ถึงเวลาเก็บเกี่ยว!',
                        url: 'https://www.torrentdd.com/farm.php',
                    });

                    GM_setValue('farmNotificationData', {
                        time: Date.now(),
                    });
                }
            }
        });
    }
}
export default Farm;