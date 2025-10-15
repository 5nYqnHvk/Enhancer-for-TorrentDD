export function waitForBootstrap(callback: (arg0: any) => void) {
  const $ = window.jQuery || unsafeWindow.jQuery;
  if ($ && typeof $.fn.modal === "function") {
    callback($);
  } else {
    setTimeout(() => waitForBootstrap(callback), 100);
  }
}

export function getLocation() {
  let href = window.location.href;
  let match = href.match(
    /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
  );
  return (
    match && {
      href: href,
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7],
    }
  );
}
