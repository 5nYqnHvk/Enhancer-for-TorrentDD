declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
  interface JQuery {
    modal(action?: string): JQuery;
  }
}

export {};
