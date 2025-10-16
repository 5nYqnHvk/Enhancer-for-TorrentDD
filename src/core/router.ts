import { createLogger } from "../utils/logger";

const logger = createLogger("Router");

export interface Route {
  name: string;
  match: RegExp;
  init: () => Promise<void> | void;
}

export async function routeLoader(routes: Route[]) {
  const currentPath = window.location.pathname + window.location.search;
  for (const route of routes) {
    if (route.match.test(currentPath)) {
      logger.info(`โหลดโมดูล ${route.name}`);
      await route.init();
    }
  }
}
