export function waitForBootstrap(callback: (arg0: any) => void) {
  const $ = window.jQuery || unsafeWindow.jQuery;
  if ($ && typeof $.fn.modal === "function") {
    callback($);
  } else {
    setTimeout(() => waitForBootstrap(callback), 100);
  }
}
