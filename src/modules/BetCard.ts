import User from "./User";

class BetCard {
    private statusBetElement: HTMLElement;
    private statusDataCountElement: HTMLElement;
    private statusCounterElement: HTMLElement;
    private betNumElement: HTMLElement;
    private betPlayerElement: HTMLElement;
    private betPriceElement: HTMLElement;
    private getDataButton: HTMLElement;
    private autoBetButton: HTMLElement;

    private cardData = [];
    private playerList = [];

    private betCardTimer: NodeJS.Timeout | null = null;

    private counter = 0;
    private betNum = 0;

    private user = new User;

    public initalizeUi() {
        $('.menu').after(
            `<div class="alert alert-light border border-primary mx-auto" style="width:50%;">
                <h4 class="text-center fw400 text-dark mt-4 mb-3">กดไพ่</h4>
                <div class="d-flex justify-content-around">
                    <span id="statusBet" class="text-dark">สถานะ: หยุดทำงาน</span><span id="statusDataCount" class="text-dark">ข้อมูลการ์ดทั้งหมด: 0</span><span id="statusCounter" class="text-dark">Counter: 0</span>
                </div>
                <div class="d-flex justify-content-around mt-4">
                    <span class="text-dark text-center">จำนวนที่เดิมพัน:<input id="betNum" class="text-center fw400 text-dark ml-2 col-sm-4" type="number"> ครั้ง</span><span class="text-dark text-center">เลือกเจ้ามือ:</span><select id="betPlayer" class="text-center fw400 text-dark ml-2 col-sm-4">
                        <option value="999">ทั้งหมด</option>
                        <option value="1">ทั้งหมด</option>
                        <option value="2">ทั้งหมด</option>
                        <option value="3">ทั้งหมด</option>
                        <option value="4">ทั้งหมด</option>
                    </select>
                </div>
                <div class="d-flex justify-content-around mt-4">
                    <span class="text-dark text-center">เลือกราคา:</span><select class="text-center fw400 text-dark ml-2 col-sm-4" id="betPrice">
                        <option value="999">ทั้งหมด</option>
                        <option value="1">น้อยกว่า 5,000</option>
                        <option value="2">น้อยกว่า 10,000</option>
                        <option value="3">น้อยกว่า 50,000</option>
                        <option value="4">น้อยกว่า 100,000</option>
                        <option value="5">น้อยกว่า 300,000</option>
                        <option value="6">น้อยกว่า 400,000</option>
                        <option value="7">10</option>
                        <option value="8">50</option>
                        <option value="9">100</option>
                        <option value="10">300</option>
                        <option value="11">500</option>
                        <option value="12">1,000</option>
                        <option value="13">2,000</option>
                        <option value="14">3,000</option>
                        <option value="15">5,000</option>
                        <option value="16">10,000</option>
                        <option value="17">20,000</option>
                        <option value="18">30,000</option>
                        <option value="19">50,000</option>
                        <option value="20">100,000</option>
                        <option value="21">200,000</option>
                        <option value="22">300,000</option>
                        <option value="23">400,000</option>
                        <option value="24">500,000</option>
                    </select>
                </div>
                <div class="d-flex justify-content-center">
                    <button id="getData" class="btn btn-dark text-center f14 fw300 mt-3 mr-2">ดึงข้อมูล</button><button id="autoBet" class="btn btn-dark text-center f14 fw300 mt-3">เริ่มเดิมพัน</button>
                </div>
            </div>`);


        this.statusBetElement = $('.alert #statusBet')[0];
        this.statusDataCountElement = $('.alert #statusDataCount')[0];
        this.statusCounterElement = $('.alert #statusCounter')[0];
        this.betNumElement = $('.alert #betNum')[0];
        this.betPlayerElement = $('.alert #betPlayer')[0];
        this.betPriceElement = $('.alert #betPrice')[0];
        this.getDataButton = $('.alert #getData')[0];
        this.autoBetButton = $('.alert #autoBet')[0];

        $(this.betNumElement).val(30);
        this.getData();
        console.log(this.cardData);
        console.log(this.playerList);

        $.each((this.betPlayerElement as HTMLSelectElement).options, (index, item) => {
            if (index !== 0) {
                (this.betPlayerElement as HTMLSelectElement).options.remove(1);
            }
        });
    }

    private getData() {
        let lastPageId = 0;
        fetch('?page=0').then(async res => await res.text()).then(data => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(data, 'text/html');

            const pagination = $(doc).find('.pagination')[0];
            const paginationLi = $(pagination).find('li');

            if (pagination) {
                if (paginationLi.length == 1) {
                    lastPageId = 0;
                } else {// 
                    const lastPage = $(paginationLi[paginationLi.length - 1]).find('a')[0].href.split('=')[1];
                    lastPageId = Number(lastPage) > 10 ? 10 : Number(lastPage);
                }
            }
        });

        for (let i = 0; i <= lastPageId; i++) {
            fetch("?page=" + i).then(async res => await res.text()).then(data => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(data, "text/html"); $('table tbody tr')
                if ($(doc).find('table tbody').length == 0) return;
                if ($(doc).find('table tbody tr').length == 0) return;
                let items = $(doc).find('table tbody tr');
                $.each(items, (index, item) => {
                    let id = $(item).find('td')[0].innerText.replace(/[\n\t]/g, "");
                    let price = $(item).find('td')[1].innerText.replace(/[\n\t]/g, "");
                    let username = $(item).find('td')[2].innerText.replace(/[\n\t]/g, "");
                    let userHtml = $(item).find('td')[2].innerHTML.replace(/[\n\t]/g, "");
                    let date = $(item).find('td')[3].innerHTML.replace(/[\n\t]/g, "");

                    let obj = {
                        id: id,
                        price: price,
                        username: username,
                        userHtml: userHtml,
                        date: date
                    }
                    this.cardData.push(obj);

                    if (this.user.userName != username) {
                        this.playerList.indexOf(username) === -1 ? this.playerList.push(username) : null;
                    }
                });
            });
        }
    }
}

export default BetCard;