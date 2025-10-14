export const createLogger = (moduleName: string) => {
  return {
    info: (message: string, ...args: any[]) => {
      console.info(
        `%c${getDateFormat()} %c| %cINFO %c| %c${moduleName} %c-`,
        "color:green;",
        "color:#FFFFFF;",
        "color:#FFFFFF;",
        "color:#FFFFFF;",
        "color:#00AAAA;",
        "color:#FFFFFF;",
        message,
        ...args
      );
    },
    warn: (message: string, ...args: any[]) => {
      console.info(
        `%c${getDateFormat()} %c| %cINFO %c| %c${moduleName} %c-`,
        "color:green;",
        "color:#FFFFFF;",
        "color:#FFFF55;",
        "color:#FFFFFF;",
        "color:#00AAAA;",
        "color:#FFFFFF;",
        message,
        ...args
      );
    },
    error: (message: string, ...args: any[]) => {
      console.info(
        `%c${getDateFormat()} %c| %cINFO %c| %c${moduleName} %c-`,
        "color:green;",
        "color:#FFFFFF;",
        "color:#AA0000;",
        "color:#FFFFFF;",
        "color:#00AAAA;",
        "color:#FFFFFF;",
        message,
        ...args
      );
    },
    debug: (message: string, ...args: any[]) => {
      console.info(
        `%c${getDateFormat()} %c| %cINFO %c| %c${moduleName} %c-`,
        "color:green;",
        "color:#FFFFFF;",
        "color:#555555;",
        "color:#FFFFFF;",
        "color:#00AAAA;",
        "color:#FFFFFF;",
        message,
        ...args
      );
    },
  };
};

const getDateFormat = () => {
  const date = new Date();
  const format = `${date.getFullYear()}-${(
    "0" + Number(date.getMonth() + 1)
  ).slice(-2)}-${("0" + date.getDate()).slice(-2)} ${(
    "0" + date.getHours()
  ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${(
    "0" + date.getSeconds()
  ).slice(-2)}.${("00" + date.getMilliseconds()).slice(-3)}`;
  return format;
};
