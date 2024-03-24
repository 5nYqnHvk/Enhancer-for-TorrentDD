import Logger from "../Utils/Logger";
class User {
    public userId: number;
    public userName: string;
    public userClassId: number;

    private logger = new Logger("User");

    constructor() {
        this.getUserData();
    }

    private getUserData() {
        const userName = $(".name").text().replace(/[\n\t\ ]/g, "");
        const userId = $('a[href^=\'mypeers.php?userid=\']').attr('href').replace('mypeers.php?userid=', '');

        this.userId = Number(userId);
        this.userName = userName;
        this.userClassId = this.getUserClassId();
    }

    private getUserClassId(): number {
        const userClassId = $(".name").attr('class').split(/\s+/)[3];
        switch (userClassId) {
            case "text-user": return 0;
            case "text-rookie": return 1;
            case "text-beginner": return 2;
            case "text-junior": return 3;
            case "text-senior": return 4;
            case "text-amateur": return 5;
            case "text-semipro": return 6;
            case "text-pro": return 7;
            case "text-worldpro": return 8;
            case "text-colo": return 9;
            case "text-vip": return 10;
            case "text-dj": return 11;
            case "text-rainbow": return 12;
            case "text-moderator": return 13;
            case "text-administrator": return 14;
            case "text-sysop": return 15;
        }
    }
}

export default User;