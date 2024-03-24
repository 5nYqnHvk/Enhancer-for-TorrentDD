export function getLocation() {
    let href = window.location.href;
    let match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

export function animateValue(obj: HTMLElement, start: number, end: number, duration: number) {
    let startTimestamp: number = null;
    const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Number(Math.floor(progress * (end - start) + start)).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step)
        }
    }
    window.requestAnimationFrame(step)
}
