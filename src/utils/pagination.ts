/**
 * Render Bootstrap ellipsis pagination into one or more containers.
 * @param containers - jQuery selector string or element(s) to render into
 * @param total      - total number of items
 * @param page       - current page (1-based)
 * @param pageSize   - items per page
 * @param onPage     - callback with new page number when a page link is clicked
 */
export const renderPagination = (
  containers: string | JQuery,
  total: number,
  page: number,
  pageSize: number,
  onPage: (p: number) => void,
) => {
  const $c = typeof containers === "string" ? $(containers) : containers;
  const pages = Math.ceil(total / pageSize);

  if (pages <= 1) { $c.empty().hide(); return; }

  const btn = (p: number, label: string = String(p), disabled = false) =>
    `<li class="page-item${p === page ? " active" : ""}${disabled ? " disabled" : ""}">
      <a class="page-link tdd-page-btn" href="#" data-page="${p}">${label}</a>
    </li>`;

  let html = btn(page - 1 < 1 ? 1 : page - 1, "«", page === 1);
  html += btn(1);
  if (page > 3) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) html += btn(p);
  if (page < pages - 2) html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
  if (pages > 1) html += btn(pages);
  html += btn(page + 1 > pages ? pages : page + 1, "»", page === pages);

  $c.html(`<nav><ul class="pagination pagination-sm justify-content-center mb-0">${html}</ul></nav>`).show();
  $c.off("click", ".tdd-page-btn").on("click", ".tdd-page-btn", function (e) {
    e.preventDefault();
    const p = parseInt($(this).data("page"));
    if (p !== page && p >= 1 && p <= pages) onPage(p);
  });
};
