type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

const levelStyle: Record<LogLevel, string> = {
  INFO: "color:#55FFFF;font-weight:bold;",
  WARN: "color:#FFFF55;font-weight:bold;",
  ERROR: "color:#FF5555;font-weight:bold;",
  DEBUG: "color:#888888;font-weight:bold;",
};

const consoleMethod: Record<LogLevel, "info" | "warn" | "error" | "debug"> = {
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  DEBUG: "debug",
};

export const createLogger = (moduleName: string) => {
  const log = (level: LogLevel, message: string, ...args: any[]) => {
    console[consoleMethod[level]](
      `%c${getDateFormat()} %c| %c${level.padEnd(5)} %c| %c${moduleName} %c-`,
      "color:green;",
      "color:#FFFFFF;",
      levelStyle[level],
      "color:#FFFFFF;",
      "color:#00AAAA;",
      "color:#FFFFFF;",
      message,
      ...args,
    );
  };

  return {
    info: (message: string, ...args: any[]) => log("INFO", message, ...args),
    warn: (message: string, ...args: any[]) => log("WARN", message, ...args),
    error: (message: string, ...args: any[]) => log("ERROR", message, ...args),
    debug: (message: string, ...args: any[]) => log("DEBUG", message, ...args),
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
