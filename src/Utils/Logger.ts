class Logger {
    private appName: string;

    constructor(name?: string) {
        this.appName = name !== undefined ? `TDD:${name}` : `TDD`;
    }

    private getDateFormat() {
        const date = new Date();
        const format = `${date.getFullYear()}-${('0' + Number(date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}.${('00' + date.getMilliseconds()).slice(-3)}`;
        return format;
    }

    public info(index: any, data?: any) {
        if (data === undefined) {
            data = index;
            index = "";
        }
        return console.info(`%c${this.getDateFormat()} %c| %cINFO %c| %c${this.appName} %c-`, "color:green;", "color:#FFFFFF;", "color:#FFFFFF;", "color:#FFFFFF;", "color:#00AAAA;", "color:#FFFFFF;", index, data);
    }

    public warn(index: any, data?: any) {
        if (data === undefined) {
            data = index;
            index = "";
        }
        return console.warn(`%c${this.getDateFormat()} %c| %cWARN %c| %c${this.appName} %c-`, "color:green;", "color:#FFFFFF;", "color:#FFFF55;", "color:#FFFFFF;", "color:#00AAAA;", "color:#FFFFFF;", index, data);
    }

    public error(index: any, data?: any) {
        if (data === undefined) {
            data = index;
            index = "";
        }
        return console.error(`%c${this.getDateFormat()} %c| %cERROR %c| %c${this.appName} %c-`, "color:green;", "color:#FFFFFF;", "color:#AA0000;", "color:#FFFFFF;", "color:#00AAAA;", "color:#FFFFFF;", index, data);
    }

    public debug(index: any, data?: any) {
        if (data === undefined) {
            data = index;
            index = "";
        }
        return console.debug(`%c${this.getDateFormat()} %c| %cDEBUG %c| %c${this.appName} %c-`, "color:green;", "color:#FFFFFF;", "color:#555555;", "color:#FFFFFF;", "color:#00AAAA;", "color:#FFFFFF;", index, data);
    }
}

export default Logger;