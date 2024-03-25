import toastr from "toastr";
import User from "./User";
import { animateValue } from "../Utils/Helper";

class BetCard {
    private betPlayerElement: HTMLElement;
    private betPriceElement: HTMLElement;
    private getDataButton: HTMLElement;

    private cards = [{ "card": "1-a.gif", "txt": "A♣" }, { "card": "2-a.gif", "txt": "2♣" }, { "card": "3-a.gif", "txt": "3♣" }, { "card": "4-a.gif", "txt": "4♣" }, { "card": "5-a.gif", "txt": "5♣" }, { "card": "6-a.gif", "txt": "6♣" }, { "card": "7-a.gif", "txt": "7♣" }, { "card": "8-a.gif", "txt": "8♣" }, { "card": "9-a.gif", "txt": "9♣" }, { "card": "10-a.gif", "txt": "10♣" }, { "card": "11-a.gif", "txt": "J♣" }, { "card": "12-a.gif", "txt": "Q♣" }, { "card": "13-a.gif", "txt": "K♣" }, { "card": "1-b.gif", "txt": "A♦" }, { "card": "2-b.gif", "txt": "2♦" }, { "card": "3-b.gif", "txt": "3♦" }, { "card": "4-b.gif", "txt": "4♦" }, { "card": "5-b.gif", "txt": "5♦" }, { "card": "6-b.gif", "txt": "6♦" }, { "card": "7-b.gif", "txt": "7♦" }, { "card": "8-b.gif", "txt": "8♦" }, { "card": "9-b.gif", "txt": "9♦" }, { "card": "10-b.gif", "txt": "10♦" }, { "card": "11-b.gif", "txt": "J♦" }, { "card": "12-b.gif", "txt": "Q♦" }, { "card": "13-b.gif", "txt": "K♦" }, { "card": "1-c.gif", "txt": "A♥" }, { "card": "2-c.gif", "txt": "2♥" }, { "card": "3-c.gif", "txt": "3♥" }, { "card": "4-c.gif", "txt": "4♥" }, { "card": "5-c.gif", "txt": "5♥" }, { "card": "6-c.gif", "txt": "6♥" }, { "card": "7-c.gif", "txt": "7♥" }, { "card": "8-c.gif", "txt": "8♥" }, { "card": "9-c.gif", "txt": "9♥" }, { "card": "10-c.gif", "txt": "10♥" }, { "card": "11-c.gif", "txt": "J♥" }, { "card": "12-c.gif", "txt": "Q♥" }, { "card": "13-c.gif", "txt": "K♥" }, { "card": "1-d.gif", "txt": "A♠" }, { "card": "2-d.gif", "txt": "2♠" }, { "card": "3-d.gif", "txt": "3♠" }, { "card": "4-d.gif", "txt": "4♠" }, { "card": "5-d.gif", "txt": "5♠" }, { "card": "6-d.gif", "txt": "6♠" }, { "card": "7-d.gif", "txt": "7♠" }, { "card": "8-d.gif", "txt": "8♠" }, { "card": "9-d.gif", "txt": "9♠" }, { "card": "10-d.gif", "txt": "10♠" }, { "card": "11-d.gif", "txt": "J♠" }, { "card": "12-d.gif", "txt": "Q♠" }, { "card": "13-d.gif", "txt": "K♠" }];
    private cardData: any = [];
    private playerList: any = [];

    private user = new User;

    private toastr = toastr;

    public initalizeUi() {
        $('.menu').after(
            `<div class="alert alert-light border border-primary mx-auto" style="width:50%;">
                <h4 class="text-center fw400 text-dark mt-4 mb-3">ค้นหาไพ่</h4>
                <div class="d-flex justify-content-around mt-4">
                    <span class="text-dark text-center">เลือกเจ้ามือ:</span>
                    <select id="betPlayer" class="text-center fw400 text-dark ml-2 col-sm-4">
                        <option value="all">ทั้งหมด</option>
                    </select>
                </div>
                <div class="d-flex justify-content-around mt-4">
                    <span class="text-dark text-center">เลือกราคา:</span>
                    <select class="text-center fw400 text-dark ml-2 col-sm-4" id="betPrice">
                        <option value="all">ทั้งหมด</option>
                        <option value=">5000">น้อยกว่า 5,000</option>
                        <option value=">10000">น้อยกว่า 10,000</option>
                        <option value=">50000">น้อยกว่า 50,000</option>
                        <option value=">100000">น้อยกว่า 100,000</option>
                        <option value=">300000">น้อยกว่า 300,000</option>
                        <option value=">400000">น้อยกว่า 400,000</option>
                        <option value="=10">10</option>
                        <option value="=50">50</option>
                        <option value="=100">100</option>
                        <option value="=300">300</option>
                        <option value="=500">500</option>
                        <option value="=1000">1,000</option>
                        <option value="=2000">2,000</option>
                        <option value="=3000">3,000</option>
                        <option value="=5000">5,000</option>
                        <option value="=10000">10,000</option>
                        <option value="=20000">20,000</option>
                        <option value="=30000">30,000</option>
                        <option value="=50000">50,000</option>
                        <option value="=100000">100,000</option>
                        <option value="=200000">200,000</option>
                        <option value="=300000">300,000</option>
                        <option value="=400000">400,000</option>
                        <option value="=500000">500,000</option>
                    </select>
                </div>
            </div>`);

        this.betPlayerElement = $('.alert #betPlayer')[0];
        this.betPriceElement = $('.alert #betPrice')[0];
        this.getDataButton = $('.alert #getData')[0];

        if ($('table tbody').length == 0) return;
        if ($('table tbody tr').length == 0) return;
        let items = $('table tbody tr');
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

        // update player list
        $.each(this.playerList, (_index, player) => {
            $(this.betPlayerElement).append($('<option>', {
                value: player,
                text: player
            }));
        });

        this.betPlayerElement.addEventListener('change', () => this.onSelectChange());
        this.betPriceElement.addEventListener('change', () => this.onSelectChange());
        this.onSelectChange();
    }

    private onSelectChange() {
        this.resetTable();
        $.each(this.cardData, (_index, data) => {
            const playerSelected = $(this.betPlayerElement).val();
            const priceSelected = $(this.betPriceElement).val();
            const tbody = $('table').find('tbody')[0];
            let push = false;

            const cardPrice = Number(data.price.replace(/,/g, ''));
            const priceSelectedMode = priceSelected.toString().includes("=") ? "=" : ">";
            const priceSelectedValue = Number(priceSelected.toString().slice(1).replace(/,/g, ''));

            if (playerSelected === 'all') {
                if (priceSelected == 'all') {
                    push = true;
                } else if (priceSelectedMode == "=") {
                    cardPrice == priceSelectedValue ? push = true : push = false;
                } else if (priceSelectedMode == ">") {
                    cardPrice <= priceSelectedValue ? push = true : push = false;
                }
            } else if (data.username == playerSelected) {
                if (priceSelected == 'all') {
                    push = true;
                } else if (priceSelectedMode == "=") {
                    cardPrice == priceSelectedValue ? push = true : push = false;
                } else if (priceSelectedMode == ">") {
                    cardPrice <= priceSelectedValue ? push = true : push = false;
                }
            }

            if (push) {
                if (data.username == this.user.userName) {
                    $(tbody).append(`<
                    <tr class="text-center">
                        <td>${data.id}</td>
                        <td class="text-info">${data.price}</td>
                        <td width="150">${data.userHtml}</td>
                        <td>${data.date}</td>
                        <td>
                            <button id="${data.id}" class="btn btn-info" type="button" disabled>Play!</button>
                        </td>
                    </tr>
                    `);
                } else {
                    $(tbody).append(`<
                    <tr class="text-center">
                        <td>${data.id}</td>
                        <td class="text-info">${data.price}</td>
                        <td width="150">${data.userHtml}</td>
                        <td>${data.date}</td>
                        <td>
                            <button id="${data.id}" class="btn btn-bet btn-info" type="button">Play!</button>
                        </td>
                    </tr>
                    `);
                }
                push = false;
            }
        });

        $.each($(".btn-bet"), (_index, button) => {
            button.addEventListener('click', () => this.bet(Number(button.id)));
        });
    }

    private bet(id: number) {
        fetch(`?mod=match&id=${id}`).then(async res => await res.text()).then(txt => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(txt, "text/html");

            // match failed
            let matchEnd = $(doc).find('tbody:eq(1) td:eq(1) div');
            let notFound = $(doc).find('.mb-3').contents().filter(function () { return this.nodeType === 3 && this.nodeValue.includes("ไม่พบรายการนี้"); });
            let notEnoughMoney = $(doc).find('.mb-3').contents().filter(function () { return this.nodeType === 3 && this.nodeValue.includes("คุณมีเงินไม่พอ"); });

            // match success
            let targetUsername = $(doc).find('tbody:eq(1) td:eq(5) a').text();
            let targetCard = $(doc).find('tbody:eq(1) td:eq(0) img').attr('src').split('/')[2];
            let yourUsername = $(doc).find('tbody:eq(1) td:eq(9) a').text();
            let yourCard = $(doc).find('tbody:eq(1) td:eq(2) img').attr('src').split('/')[2];
            let resultMatch = $(doc).find('tbody:eq(1) td:eq(1) h4:eq(1)').first().text();
            let MatchPrice = $(doc).find('tbody:eq(1) td:eq(1) h5').first().text();

            let success = false;

            this.cards.map(x => {
                if (x.card == targetCard) {
                    targetCard = x.txt;
                }
                if (x.card == yourCard) {
                    yourCard = x.txt;
                }
            });

            if (matchEnd.length > 0) {
                this.toastr.warning("รายการนี้แข่งขันจบแล้ว", "ไม่พบการแข่งขัน " + id + "!", {
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
                success = true;
            }

            if (notFound.length > 0) {
                this.toastr.error(`ไม่พบรายการ ${id}`, "Error!", {
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
                return;
            }

            if (notEnoughMoney.length > 0) {
                this.toastr.error('คุณมีเงินไม่พอ', "Error!", {
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
                return;
            }

            if (resultMatch == "คุณชนะ") {
                this.toastr.success(`คุณได้รับ ${MatchPrice}`, `คุณชนะ ${targetUsername} (<font color="${targetCard.includes("♦") || targetCard.includes("♥") ? "#ff0000" : "#000000"}">${targetCard}</font> แพ้ <font color="${yourCard.includes("♦") || yourCard.includes("♥") ? "#ff0000" : "#000000"}">${yourCard}</font>)!`, {
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
                let money = $('#money').text().replace(/,/g, '');
                animateValue($('#money')[0], Number(money), Number(money) + parseInt(MatchPrice.replace(/\D/g, '')), 500);
                money = String(Number($('#money').text().replace(/,/g, '')) + parseInt(MatchPrice.replace(/\D/g, '')));
                success = true;
            } else if (resultMatch == "คุณแพ้") {
                this.toastr.error(`คุณเสีย ${MatchPrice}`, `คุณแพ้ ${targetUsername} (<font color="${targetCard.includes("♦") || targetCard.includes("♥") ? "#ff0000" : "#000000"}">${targetCard}</font> ชนะ <font color="${yourCard.includes("♦") || yourCard.includes("♥") ? "#ff0000" : "#000000"}">${yourCard}</font>)!`, {
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
                let money = $('#money').text().replace(/,/g, '');
                animateValue($('#money')[0], Number(money), Number(money) - parseInt(MatchPrice.replace(/\D/g, '')), 500);
                money = String(Number($('#money').text().replace(/,/g, '')) - parseInt(MatchPrice.replace(/\D/g, '')));
                success = true;
            }

            if (success) {
                $(`.btn-bet#${id}`).attr('disabled', 'true');
                const data = $.grep(this.cardData, function (e: any) {
                    return e.id != id;
                });
                this.cardData = data;
                this.onSelectChange();
            }
        });
    }

    private resetTable() {
        const tbody = $('table').find('tbody')[0];
        const rows = $('table').find('tbody')[0].rows;

        $.each(tbody.rows, (index, item) => {
            $('tbody tr').remove()
        });
    }
}

export default BetCard;