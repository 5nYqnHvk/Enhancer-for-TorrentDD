import toastr from "toastr";
import { animateValue } from "../Utils/Helper";

class PlaceCard {
    private statusBetElement: HTMLElement;
    private statusNextBetElement: HTMLElement;
    private statusCounterElement: HTMLElement;
    private betNumElement: HTMLElement;
    private timeBetElement: HTMLElement;
    private betTypeElement: HTMLElement;
    private betOrderElement: HTMLElement;
    private autoBetButton: HTMLElement;

    private placeBetArray: string[] = [];
    private counter = 0;
    private betNum = 0;
    private placeBetTime = new Date();
    private nextPlaceBetTime: Date = null;
    private placeBetIndex = 0;
    private placeBetPrice: string = null;

    private placeBetTimer: NodeJS.Timeout | null = null;

    private toastr = toastr;

    public initalizeUi() {
        $('.menu').after(
            `<div class="alert alert-light border border-primary mx-auto" style="width:70%;">
            <h4 class="text-center fw400 text-dark mt-4 mb-3">วางไพ่</h4>
            <div class="d-flex justify-content-around">
                <span id="statusBet" class="text-dark">สถานะ: หยุดทำงาน</span><span id="statusNextBet" class="text-dark">เดิมพันครั้งต่อไป: ไม่มีข้อมูล</span><span id="statusCounter" class="text-dark">Counter: 0</span>
            </div>
            <div class="d-flex justify-content-around mt-4">
                <span class="text-dark text-center">จำนวนที่เดิมพัน:<input id ="betNum" class="text-center fw400 text-dark ml-2 col-sm-4" type="number"> ครั้ง</span><span class="text-dark text-center">ช่วงเวลา:<input id="timeBet" class="text-center fw400 text-dark ml-2 col-sm-4" type="number"> วินาที</span>
            </div>
            <div class="text-dark mt-4 text-center">
                <span class="text-dark text-center">เลือกประเภทขาไพ่:</span><select id="betType" class="text-center fw400 text-dark ml-2 col-sm-4">
                <option value="0">ทุกราคาที่เว็บมี</option>
                <option value="1">ขาเล็ก</option>
                <option value="2">ขากลาง</option>
                <option value="3">ขาใหญ่</option>
                <option value="4">Ship 2 ชุด</option>
                <option value="5">Swop mirror</option>
                <option value="6">Swop mirror+Big</option>
                <option value="7">ขาใหญ่+Jam100</option>
                <option value="8">ขาใหญ่+Jam1000</option>
                <option value="9">ขาใหญ่+Jam1000+Jam1000</option>
                </select>
            </div>
            <div class="d-flex mt-3 justify-content-center">
                <textarea id="betOrder" rows="10" cols="50"></textarea>
            </div>
            <div class="d-flex justify-content-center">
                <button id="autoBet" class="btn btn-dark text-center f14 fw300 mt-3">เริ่มเดิมพัน</button>
            </div>
        </div>`);

        this.statusBetElement = $('.alert #statusBet')[0];
        this.statusNextBetElement = $('.alert #statusNextBet')[0];
        this.statusCounterElement = $('.alert #statusCounter')[0];
        this.betNumElement = $('.alert #betNum')[0];
        this.timeBetElement = $('.alert #timeBet')[0];
        this.betTypeElement = $('.alert #betType')[0];
        this.betOrderElement = $('.alert #betOrder')[0];
        this.autoBetButton = $('.alert #autoBet')[0];

        $(this.betNumElement).val(30);
        $(this.timeBetElement).val(2);

        this.updateBetOrder();
        this.betTypeElement.addEventListener('change', () => this.updateBetOrder());

        this.autoBetButton.addEventListener('click', () => this.startTimer());
    }

    private updateBetOrder() {
        let tempArray: Number[] = [];
        switch ($(this.betTypeElement).val()) {
            case '1': //small
                tempArray = [10, 5000, 50, 3000, 100, 2000, 300, 1000, 500, 1000, 2000, 1000, 3000, 2000, 5000, 10000, 5000, 20000, 3000, 30000, 2000, 50000, 300, 100000];

                break;
            case '2': //midium
                tempArray = [1000, 500000, 2000, 400000, 3000, 300000, 5000, 200000, 10000, 20000, 100000, 30000, 50000, 100000, 500000, 200000, 300000, 400000, 500000];
                break;
            case '3': //big
                tempArray = [100000, 500000, 200000, 400000, 300000, 400000, 200000, 200000, 500000, 100000, 500000, 300000, 100000, 500000];
                break;
            case '4': //ship
                tempArray = [100, 300, 100, 500, 300, 1000, 500, 2000, 1000, 3000, 2000, 5000, 3000, 10000, 5000, 20000, 10000, 30000, 20000, 50000, 30000, 100000, 50000, 200000, 100000, 300000, 200000, 400000, 300000, 500000, 400000, 100, 500000];

                break;
            case '5': //Swop
                tempArray = [100, 500000, 300, 400000, 500, 300000, 1000, 200000, 2000, 100000, 3000, 50000, 5000, 30000, 10000, 20000, 10000, 20000, 5000, 30000, 3000, 50000, 2000, 100000, 1000, 200000, 500, 300000, 300, 400000, 100, 500000];

                break;
            case '6': //Swop+Big
                tempArray = [100, 500000, 300, 400000, 500, 300000, 1000, 200000, 2000, 100000, 3000, 50000, 5000, 30000, 10000, 20000, 500000, 500000, 500000, 500000, 10000, 20000, 5000, 30000, 500000, 500000, 500000, 500000, 3000, 50000, 2000, 100000, 1000, 200000, 500, 300000, 300, 400000, 100, 500000];

                break;
            case '7': //big+jam 100
                tempArray = [100000, 500000, 100, 200000, 400000, 100, 300000, 400000, 100, 200000, 200000, 100, 500000, 100000, 100, 500000, 300000, 100, 100000, 500000];
                break;
            case '8': //big+jam 1000
                tempArray = [100000, 500000, 200000, 400000, 1000, 300000, 400000, 200000, 200000, 500000, 100000, 500000, 300000, 1000, 100000, 500000];
                break;
            case '9': //big+jam 1000+ jam 1000
                tempArray = [100000, 500000, 1000, 200000, 400000, 1000, 300000, 400000, 1000, 200000, 200000, 1000, 500000, 100000, 1000, 500000, 300000, 1000, 100000, 500000];
                break;

            default: // all web have
                tempArray = [10, 50, 100, 300, 500, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000, 100000, 200000, 300000, 400000, 500000];
                break;
        }
        $(this.betOrderElement).val('');

        $.each(tempArray, (index, val) => {
            if ((tempArray.length - 1) == index) {
                $(this.betOrderElement).val($(this.betOrderElement).val() + `${val}`);
            } else {
                $(this.betOrderElement).val($(this.betOrderElement).val() + `${val}\n`);
            }
        })
    }

    private loadSetting() {
        this.placeBetArray = $(this.betOrderElement).val().toString().split('\n');
    }

    private resetCounter() {
        $(this.statusNextBetElement).html('เดิมพันครั้งต่อไป: ไม่มีข้อมูล');
        $(this.statusCounterElement).html('Counter: 0');
        this.counter = 0;
        this.placeBetIndex = 0;
        this.placeBetPrice = null;
    }

    private antiAFK() {
        if (this.counter > 1000) { this.stopTimer(); }
    }

    private startTimer() {
        this.loadSetting();
        $(this.autoBetButton).text("หยุดวางไพ่");
        if (this.placeBetTimer == null) {
            this.placeBetTimer = setInterval(this.bet.bind(null, this), 100);
        } else {
            this.stopTimer();
        }
    }

    private stopTimer() {
        this.resetCounter();
        clearInterval(this.placeBetTimer);
        this.placeBetTimer = null;
        $(this.autoBetButton).text("เริ่มวางไพ่");
        $(this.statusBetElement).html('สถานะ: หยุดทำงาน');
    }

    private bet(pc: PlaceCard) {
        pc.antiAFK();
        pc.betNum = Number($(pc.betNumElement).val());
        if (pc.counter >= pc.betNum) return pc.stopTimer();

        pc.placeBetTime = new Date();
        $(pc.statusBetElement).html('สถานะ: กำลังทำงาน');
        if (pc.placeBetTime >= pc.nextPlaceBetTime) {
            if (pc.placeBetIndex >= pc.placeBetArray.length) {
                pc.placeBetIndex = 0;
                pc.placeBetPrice = null;
            } else {
                pc.placeBetPrice = pc.placeBetArray[pc.placeBetIndex];
                pc.placeBetIndex++;
                if (pc.placeBetIndex == 1) {
                    $(pc.statusNextBetElement).html(`เดิมพันครั้งต่อไป: 1/${pc.placeBetArray.length} AT: ${pc.placeBetArray[pc.placeBetIndex - 1]}`)
                } else {
                    $(pc.statusNextBetElement).html(`เดิมพันครั้งต่อไป: ${pc.placeBetIndex}/${pc.placeBetArray.length} AT: ${pc.placeBetArray[pc.placeBetIndex - 1]}`)
                }
            }

            if (pc.placeBetPrice != null) {
                pc.counter++;
                $(pc.statusCounterElement).html(`Counter: ${pc.counter}`);
                fetch("https://www.torrentdd.com/card_vs_player.php?mod=take-create&bet=" + pc.placeBetPrice).then(async res => await res.text()).then(data => {
                    if (data == "success") {
                        pc.toastr.success("จำนวนเงินที่วาง " + pc.placeBetPrice + " Zen", "คุณวางไพ่แล้ว", {
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
                            hideMethod: "fadeOut"
                        });
                        let money = $("#money").text().replace(/,/g, '');
                        animateValue($("#money")[0], Number(money), Number(money) - Number(pc.placeBetPrice.replace(/,/g, '')), 500);
                        money = parseInt(String(Number(money) - Number(pc.placeBetPrice.replace(/,/g, '')))).toLocaleString();
                    } else {
                        pc.toastr.error("อาจเกิดจากปัญหาอินเทอร์เน็ตหรือคุณตั้งให้วางไพ่เร็วเกินไป", "คุณวางไม่สำเร็จ!", {
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
                            hideMethod: "fadeOut"
                        });
                    }
                });
            }
            pc.nextPlaceBetTime = new Date();
            pc.nextPlaceBetTime.setTime(pc.nextPlaceBetTime.getTime() + Number($(pc.timeBetElement).val()) * 1000)
        }
    }


}

export default PlaceCard;