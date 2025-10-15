declare global {
  interface Window {
    jQuery: any;
    $: any;
    getCard: () => void;
    spin: () => void;
  }
  interface JQuery {
    modal(action?: string): JQuery;
  }
}

export {};
